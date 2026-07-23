// Gera dados de EXEMPLO (claramente marcados exemplo:true) para o site abrir com
// algo na tela antes da primeira coleta real. A primeira execução real do
// coletar.mjs passa a sobrescrever ultimo.json e a acrescentar dias reais.
// Uso: node scripts/semear-exemplo.mjs

import {
  CAMINHOS, ESQUEMA, agoraISO, escreverJson, carregarTaxonomia,
  contarPorTema, contarSentimento, calcularCusto,
} from "./comum.mjs";
import { join } from "node:path";
import { atualizarSerie } from "./agregar.mjs";

const tax = carregarTaxonomia();
const idsTemas = tax.temas.map((t) => t.id);
const MODELO = "claude-sonnet-5";

// Sinais fictícios só para ilustrar o layout. Fonte "exemplo.local" deixa óbvio
// que NÃO são menções reais.
const modelosSinais = [
  { tema: "latencia_ping", sentimento: "negativo", idioma: "pt", trecho: "(dado de exemplo) o ping caiu mas ainda tem uns picos de jitter" },
  { tema: "preco_assinatura", sentimento: "neutro", idioma: "pt", trecho: "(dado de exemplo) alguém sabe se dá pra pedir reembolso?" },
  { tema: "comparacao_concorrente", sentimento: "positivo", idioma: "en", trecho: "(sample) ExitLag felt smoother than the alternative I tried" },
  { tema: "confusao_produto", sentimento: "neutro", idioma: "es", trecho: "(ejemplo) ¿ExitLag es una VPN o algo distinto?" },
  { tema: "instalacao_setup", sentimento: "negativo", idioma: "pt", trecho: "(dado de exemplo) o antivírus bloqueou o driver na instalação" },
];

function sinalExemplo(i, dia) {
  const m = modelosSinais[i % modelosSinais.length];
  return {
    url: `https://exemplo.local/${dia}/${i}`,
    titulo: `Menção de exemplo #${i + 1}`,
    fonte: "exemplo.local",
    idioma: m.idioma,
    tema: m.tema,
    sentimento: m.sentimento,
    trecho: m.trecho,
    resumo: "Item de exemplo — substituído pela primeira coleta real.",
    data_publicacao: dia,
  };
}

function snapshotExemplo(dia, qtd) {
  const sinais = Array.from({ length: qtd }, (_, i) => sinalExemplo(i, dia));
  return {
    esquema: ESQUEMA,
    data: dia,
    status: "ok",
    exemplo: true,
    modelo: MODELO,
    taxonomia_versao: tax.versao,
    termos_busca: tax.termos_busca,
    sinais_novos: sinais.length,
    sinais,
    contagem_por_tema: contarPorTema(sinais, idsTemas),
    sentimento: contarSentimento(sinais),
    custo: { buscas: 8, tokens_entrada: 12000, tokens_saida: 3000, usd: calcularCusto(MODELO, { tokens_entrada: 12000, tokens_saida: 3000, buscas: 8 }) },
    gerado_em: agoraISO(),
  };
}

// Cinco dias de exemplo, terminando ontem (não sobrescreve um dia real de hoje).
const base = new Date();
const dias = [];
for (let k = 5; k >= 1; k--) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() - k);
  dias.push(d.toISOString().slice(0, 10));
}

let ultimo = null;
for (let i = 0; i < dias.length; i++) {
  const qtd = [4, 2, 5, 3, 4][i % 5];
  const snap = snapshotExemplo(dias[i], qtd);
  escreverJson(join(CAMINHOS.snapshots, `${dias[i]}.json`), snap);
  atualizarSerie(snap, tax);
  ultimo = snap;
}
escreverJson(CAMINHOS.ultimo, ultimo);

// vistos e eventos iniciais.
escreverJson(CAMINHOS.vistos, { esquema: ESQUEMA, atualizado_em: agoraISO(), urls: [] });
escreverJson(CAMINHOS.eventos, {
  esquema: ESQUEMA,
  descricao: "Marcadores de evento (releases, incidentes) sobrepostos no gráfico. Edite à mão.",
  eventos: [
    { data: dias[2], titulo: "Exemplo: release 1.2", tipo: "release" },
  ],
});

console.log(`Dados de exemplo gerados para ${dias.length} dias (${dias[0]} … ${dias[dias.length - 1]}).`);
