// Coleta diária (v2). Chama a API da Anthropic com busca web, extrai o schema rico,
// valida (inválido → dados/rejeitados/), deduplica por id, marca primeira aparição
// via catálogo, grava o snapshot e recompila a série.
//
// Falha da API NUNCA corrompe o histórico: o dia é gravado com status "falha".
// Requer ANTHROPIC_API_KEY. Uso: node scripts/coletar.mjs

import Anthropic from "@anthropic-ai/sdk";
import {
  CAMINHOS, ESQUEMA, agoraISO, hojeISO, escreverJson, carregarTaxonomia,
  calcularCusto, idDeUrl,
} from "./comum.mjs";
import { join } from "node:path";
import { CAMPOS_MODELO, ENUMS, normalizarSinal, validarSinal } from "./schema.mjs";
import { deduplicar, atualizarVistos, carregarVistos } from "./dedup.mjs";
import { registrar } from "./catalogo.mjs";
import { reconstruir } from "./agregar.mjs";

const MODELO = process.env.MODELO || "claude-opus-4-8";
const MAX_BUSCAS = Number(process.env.MAX_BUSCAS || 8);

function promptSistema(tax) {
  const temas = tax.temas.map((t) => `  - ${t.id}: ${t.descricao}`).join("\n");
  return `Você monitora menções PÚBLICAS à ExitLag e classifica cada uma com precisão.

O QUE É A EXITLAG: software de otimização de ROTA para jogos online (multipath routing entre servidores de jogo). NÃO é VPN — não criptografa tráfego, não mascara IP, não serve para navegação geral. Modelo de assinatura, suporta centenas de títulos, comunidade forte em Reddit/fóruns/Discord. Se alguém a trata como VPN ou pergunta se é VPN, isso é o tema "confusao_produto".

REGRAS RÍGIDAS:
1. Use APENAS a busca web. NUNCA invente fonte, URL, número ou citação.
2. Cada item precisa de uma URL real e acessível. Sem URL verificável, descarte.
3. "citacao" e "resumo": PARÁFRASE curta (no máx. 15 palavras cada). NUNCA cópia literal do texto original.
4. "tema": escolha EXATAMENTE UMA destas chaves fechadas e nenhuma outra:
${temas}
5. Prefira menções dos últimos ~60 dias. Não repita a mesma discussão.
6. Se o material for escasso, retorne poucos itens — não preencha com conteúdo fabricado.

Ao terminar TODAS as buscas, responda com UM único bloco JSON (e nada além dele):
\`\`\`json
{"sinais":[{
  "url":"https://...",
  "fonte":"reddit | forum | x | trustpilot | blog | outro",
  "titulo_thread":"título da discussão",
  "data_publicacao":"YYYY-MM-DD ou null",
  "tema":"<uma chave da taxonomia>",
  "sentimento":"positivo | neutro | negativo",
  "severidade":"alta | media | baixa",
  "jogos":["valorant","cs2"],
  "regiao":"BR | LATAM | NA | EU | ASIA | desconhecida",
  "intencao_churn":false,
  "tipo_churn":"cancelou | pediu_reembolso | migrou | ameacou | nenhum",
  "concorrente_citado":"nome ou null",
  "direcao_concorrente":"veio_de | foi_para | comparando | null",
  "e_pergunta":false,
  "respondida":false,
  "confusao_proposta":false,
  "resumo":"paráfrase ≤15 palavras",
  "citacao":"paráfrase curta ≤15 palavras, nunca literal"
}]}
\`\`\`
Coerência: se intencao_churn=false então tipo_churn="nenhum". severidade "alta" = bug grave, perda de dinheiro, ou risco de cancelamento. Se não encontrar nada novo, retorne {"sinais":[]}.`;
}

function promptUsuario(tax) {
  const termos = tax.termos_busca.map((t) => `"${t}"`).join(", ");
  return `Busque menções públicas à ExitLag (EN/PT/ES) variando estes termos: ${termos}. Faça no máximo ${MAX_BUSCAS} buscas, priorize resultados recentes e diversos (Reddit, reviews, fóruns) e devolva o JSON com todos os campos do schema.`;
}

function extrairJson(texto) {
  const fence = [...texto.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
  for (const c of (fence.length ? fence : [texto]).reverse()) {
    const i = c.indexOf("{"), f = c.lastIndexOf("}");
    if (i === -1 || f === -1) continue;
    try { return JSON.parse(c.slice(i, f + 1)); } catch { /* próximo */ }
  }
  throw new Error("não foi possível extrair JSON da resposta do modelo");
}

async function conversar(client, tax) {
  const uso = { tokens_entrada: 0, tokens_saida: 0, buscas: 0 };
  const messages = [{ role: "user", content: promptUsuario(tax) }];
  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: MAX_BUSCAS }];
  const texto = [];
  for (let i = 0; i < 12; i++) {
    const r = await client.messages.create({
      model: MODELO, max_tokens: 12000, system: promptSistema(tax),
      thinking: { type: "adaptive" }, tools, messages,
    });
    uso.tokens_entrada += r.usage?.input_tokens || 0;
    uso.tokens_saida += r.usage?.output_tokens || 0;
    uso.buscas += r.usage?.server_tool_use?.web_search_requests || 0;
    for (const b of r.content) if (b.type === "text") texto.push(b.text);
    if (r.stop_reason === "pause_turn") { messages.push({ role: "assistant", content: r.content }); continue; }
    break;
  }
  return { texto: texto.join("\n"), uso };
}

function confiancaDe(nNovos, buscas) {
  if (buscas === 0) return "baixa";
  if (nNovos >= 5) return "alta";
  if (nNovos >= 2) return "media";
  return "baixa";
}

function snapshotFalha(data, erro, uso) {
  return {
    esquema: ESQUEMA, data, status: "falha", modelo: MODELO, erro: erro || "erro desconhecido",
    confianca: "baixa", sinais_novos: 0, sinais: [],
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
    const r = await conversar(client, tax); uso = r.uso;
    const bruto = extrairJson(r.texto);
    const encontrados = Array.isArray(bruto.sinais) ? bruto.sinais : [];

    // Normaliza + valida. Inválidos vão para rejeitados/ com o motivo.
    const validos = [], rejeitados = [];
    for (const cru of encontrados) {
      const s = normalizarSinal(cru, idsTemas);
      const erros = validarSinal(s, idsTemas);
      if (erros.length) rejeitados.push({ sinal: s, motivos: erros });
      else { s.id = idDeUrl(s.url); validos.push(s); }
    }
    if (rejeitados.length) {
      escreverJson(join(CAMINHOS.rejeitados, `${data}.json`), { data, gerado_em: agoraISO(), itens: rejeitados });
    }

    // Dedup por id contra o histórico, depois marca primeira aparição no catálogo.
    const vistos = carregarVistos();
    const { novos } = deduplicar(validos, vistos);
    registrar(novos, data); // adiciona s.primeira_aparicao e atualiza catalogo.json

    const snap = {
      esquema: ESQUEMA, data, status: "ok", modelo: MODELO, taxonomia_versao: tax.versao,
      termos_busca: tax.termos_busca,
      confianca: confiancaDe(novos.length, uso.buscas),
      sinais_novos: novos.length,
      sinais: novos,
      rejeitados: rejeitados.length,
      custo: { buscas: uso.buscas, tokens_entrada: uso.tokens_entrada, tokens_saida: uso.tokens_saida, usd: calcularCusto(MODELO, uso) },
      gerado_em: agoraISO(),
    };

    escreverJson(caminhoSnap, snap);
    atualizarVistos(novos, vistos);
    reconstruir(tax); // regrava serie-historica, sinais-recentes, ultimo

    console.log(`OK ${data}: ${novos.length} novos, ${rejeitados.length} rejeitados, confiança ${snap.confianca} (US$${snap.custo.usd}, ${uso.buscas} buscas).`);
  } catch (e) {
    console.error(`Falha na coleta de ${data}: ${e.message}`);
    escreverJson(caminhoSnap, snapshotFalha(data, e.message, uso));
    reconstruir(tax);
    process.exit(1);
  }
}

main();
