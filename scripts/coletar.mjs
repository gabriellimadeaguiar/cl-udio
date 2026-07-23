// Coleta diária: chama a API da Anthropic com busca web ativa, extrai menções
// públicas à ExitLag, classifica cada uma na taxonomia FECHADA, deduplica por URL
// e grava o snapshot do dia + atualiza a série histórica + vistos.json + ultimo.json.
//
// Falha da API NUNCA corrompe o histórico: o dia é registrado como "sem-coleta".
//
// Requer a variável de ambiente ANTHROPIC_API_KEY.
// Uso: node scripts/coletar.mjs

import Anthropic from "@anthropic-ai/sdk";
import {
  CAMINHOS, ESQUEMA, agoraISO, hojeISO, escreverJson, lerJson,
  carregarTaxonomia, calcularCusto, contarPorTema, contarSentimento,
  validarSnapshot,
} from "./comum.mjs";
import { join } from "node:path";
import { deduplicar, atualizarVistos, carregarVistos } from "./dedup.mjs";
import { atualizarSerie } from "./agregar.mjs";

const MODELO = process.env.MODELO || "claude-sonnet-5";
const MAX_BUSCAS = Number(process.env.MAX_BUSCAS || 8);

function promptSistema(tax) {
  const lista = tax.temas.map((t) => `- ${t.id}: ${t.descricao}`).join("\n");
  return `Você é um analista que monitora menções PÚBLICAS à ExitLag (serviço de otimização de rota/ping para jogos).

Sua tarefa: usar a ferramenta de busca web para encontrar menções públicas recentes à ExitLag (Reddit, fóruns, sites de review, notícias, comentários indexados) e classificar cada uma.

Regras rígidas:
1. Use APENAS a busca web fornecida. Não invente fontes, títulos ou citações.
2. Cada item precisa de uma URL real e acessível. Se não tem URL verificável, descarte.
3. O campo "trecho" deve ser uma citação curta que existe de verdade na página (algo que a pessoa escreveu). Não parafraseie no trecho.
4. Classifique cada item em EXATAMENTE UM tema, usando somente estes ids fechados:
${lista}
   Se nada encaixa, use "outros".
5. Sentimento: "positivo", "neutro" ou "negativo" (do ponto de vista de quem escreveu sobre a ExitLag).
6. Idioma: "pt", "en", "es" ou "outro".
7. Prefira menções dos últimos ~60 dias. Evite duplicar a mesma discussão dentro da sua própria resposta.

Ao terminar TODAS as buscas, responda com UM único bloco JSON (e nada além dele), no formato:
\`\`\`json
{"sinais":[{"url":"...","titulo":"...","fonte":"reddit.com","idioma":"pt","tema":"latencia_ping","sentimento":"negativo","trecho":"citação real curta","resumo":"1 frase objetiva","data_publicacao":"YYYY-MM-DD ou null"}]}
\`\`\`
Se não encontrar nada novo, retorne {"sinais":[]}.`;
}

function promptUsuario(tax) {
  const termos = tax.termos_busca.map((t) => `"${t}"`).join(", ");
  return `Busque menções públicas à ExitLag usando variações destes termos (EN/PT/ES): ${termos}. Faça no máximo ${MAX_BUSCAS} buscas, priorize resultados recentes e diversos (Reddit, reviews, fóruns), e devolva o JSON classificado.`;
}

// Extrai o último objeto JSON válido do texto (tolera bloco ```json ... ```).
function extrairJson(texto) {
  const fence = [...texto.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
  const candidatos = fence.length ? fence : [texto];
  for (const c of candidatos.reverse()) {
    const ini = c.indexOf("{");
    const fim = c.lastIndexOf("}");
    if (ini === -1 || fim === -1) continue;
    try {
      return JSON.parse(c.slice(ini, fim + 1));
    } catch { /* tenta o próximo */ }
  }
  throw new Error("não foi possível extrair JSON da resposta do modelo");
}

// Loop manual que lida com pause_turn das ferramentas server-side (busca web).
async function conversar(client, tax) {
  const uso = { tokens_entrada: 0, tokens_saida: 0, buscas: 0 };
  const messages = [{ role: "user", content: promptUsuario(tax) }];
  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: MAX_BUSCAS }];
  let textoFinal = [];

  for (let i = 0; i < 12; i++) {
    const resp = await client.messages.create({
      model: MODELO,
      max_tokens: 8000,
      system: promptSistema(tax),
      thinking: { type: "adaptive" },
      tools,
      messages,
    });

    uso.tokens_entrada += resp.usage?.input_tokens || 0;
    uso.tokens_saida += resp.usage?.output_tokens || 0;
    uso.buscas += resp.usage?.server_tool_use?.web_search_requests || 0;

    for (const b of resp.content) if (b.type === "text") textoFinal.push(b.text);

    if (resp.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: resp.content });
      continue; // o servidor retoma a busca automaticamente
    }
    break;
  }
  return { texto: textoFinal.join("\n"), uso };
}

function snapshotVazio(data, status, erro, uso) {
  return {
    esquema: ESQUEMA,
    data,
    status,
    modelo: MODELO,
    erro: erro || undefined,
    sinais_novos: 0,
    sinais: [],
    contagem_por_tema: {},
    sentimento: { positivo: 0, neutro: 0, negativo: 0 },
    custo: { buscas: uso?.buscas || 0, tokens_entrada: uso?.tokens_entrada || 0, tokens_saida: uso?.tokens_saida || 0, usd: uso ? calcularCusto(MODELO, uso) : 0 },
    gerado_em: agoraISO(),
  };
}

async function main() {
  const tax = carregarTaxonomia();
  const idsTemas = tax.temas.map((t) => t.id);
  const data = process.env.DATA_COLETA || hojeISO();
  const caminhoSnap = join(CAMINHOS.snapshots, `${data}.json`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY não definida. Abortando (nenhum arquivo alterado).");
    process.exit(1);
  }

  const client = new Anthropic();
  let uso = null;

  try {
    const { texto, uso: usoConversa } = await conversar(client, tax);
    uso = usoConversa;

    const bruto = extrairJson(texto);
    const encontrados = Array.isArray(bruto.sinais) ? bruto.sinais : [];

    // Normaliza tema/sentimento e descarta itens sem url.
    const limpos = encontrados
      .filter((s) => s && typeof s.url === "string")
      .map((s) => ({
        url: s.url.trim(),
        titulo: (s.titulo || "").trim() || s.url,
        fonte: (s.fonte || (() => { try { return new URL(s.url).host; } catch { return "?"; } })()).trim(),
        idioma: ["pt", "en", "es"].includes(s.idioma) ? s.idioma : "outro",
        tema: idsTemas.includes(s.tema) ? s.tema : "outros",
        sentimento: ["positivo", "neutro", "negativo"].includes(s.sentimento) ? s.sentimento : "neutro",
        trecho: (s.trecho || "").trim(),
        resumo: (s.resumo || "").trim(),
        data_publicacao: /^\d{4}-\d{2}-\d{2}$/.test(s.data_publicacao || "") ? s.data_publicacao : null,
      }))
      .filter((s) => s.trecho.length > 0);

    // Dedup por URL contra o histórico.
    const vistos = carregarVistos();
    const { novos } = deduplicar(limpos, vistos);

    const snap = {
      esquema: ESQUEMA,
      data,
      status: "ok",
      modelo: MODELO,
      taxonomia_versao: tax.versao,
      termos_busca: tax.termos_busca,
      sinais_novos: novos.length,
      sinais: novos,
      contagem_por_tema: contarPorTema(novos, idsTemas),
      sentimento: contarSentimento(novos),
      custo: {
        buscas: uso.buscas,
        tokens_entrada: uso.tokens_entrada,
        tokens_saida: uso.tokens_saida,
        usd: calcularCusto(MODELO, uso),
      },
      gerado_em: agoraISO(),
    };

    // Validação antes de gravar: JSON malformado não entra no histórico.
    const erros = validarSnapshot(snap, idsTemas);
    if (erros.length) {
      console.error("Snapshot reprovado na validação:\n- " + erros.join("\n- "));
      const semColeta = snapshotVazio(data, "sem-coleta", "falha de validação", uso);
      escreverJson(caminhoSnap, semColeta);
      escreverJson(CAMINHOS.ultimo, semColeta);
      atualizarSerie(semColeta, tax);
      process.exit(1);
    }

    escreverJson(caminhoSnap, snap);
    escreverJson(CAMINHOS.ultimo, snap);
    atualizarVistos(novos, vistos);
    atualizarSerie(snap, tax);

    console.log(`OK ${data}: ${novos.length} sinais novos (US$${snap.custo.usd}, ${uso.buscas} buscas).`);
  } catch (e) {
    // Falha da API/parse: registra "sem-coleta" — não perde a continuidade da série.
    console.error(`Falha na coleta de ${data}: ${e.message}`);
    const semColeta = snapshotVazio(data, "sem-coleta", e.message, uso);
    escreverJson(caminhoSnap, semColeta);
    escreverJson(CAMINHOS.ultimo, semColeta);
    atualizarSerie(semColeta, tax);
    process.exit(1);
  }
}

main();
