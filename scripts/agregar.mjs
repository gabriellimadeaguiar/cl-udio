// Agregador (v2). Recompila TUDO a partir dos snapshots (determinístico, robusto):
//  - dados/serie-historica.json  : agregados leves por dia + baselines + deltas + "O que mudou" + alertas
//  - dados/sinais-recentes.json  : sinais signal-level dos últimos N dias (feeds/tabelas/drill-down)
//  - dados/ultimo.json           : ponteiro para o snapshot mais recente
// Deltas e médias móveis são calculados AQUI (no build), nunca no navegador.

import {
  CAMINHOS, ESQUEMA, DIAS_SINAIS_RECENTES, lerJson, escreverJson, agoraISO,
  carregarTaxonomia, listarSnapshots, somarDias, diffDias, mediaMovel, multiplo, fmtMultiplo,
} from "./comum.mjs";
import { join } from "node:path";

// Limiares dos alertas / "O que mudou".
const LIM_SOBE = 1.8;      // multiplo (MM7 ÷ MM90) para considerar "subiu"
const LIM_DESCE = 0.5;     // multiplo para considerar "caiu"
const MIN_ABS_7D = 3;      // volume mínimo nos 7d para não virar ruído
const MIN_BASE = 3;        // presença histórica mínima para poder "cair"

const SEV_PESO = { alta: 3, media: 2, baixa: 1 };

function contar(lista, chave) {
  const m = {};
  for (const x of lista) { const k = chave(x); if (k == null) continue; m[k] = (m[k] || 0) + 1; }
  return m;
}

// Agrega um snapshot em um registro leve de dia.
function agregarDia(snap, idsTemas) {
  if (snap.status !== "ok") {
    return { data: snap.data, status: snap.status, total: 0, custo_usd: (snap.custo && snap.custo.usd) || 0, buscas: (snap.custo && snap.custo.buscas) || 0 };
  }
  const s = snap.sinais || [];
  const total = s.length;
  const threadKey = (x) => `${x.fonte}|${(x.titulo_thread || x.url || "").toLowerCase()}`;
  const threads = new Set(s.map(threadKey)).size;
  const porTema = Object.fromEntries(idsTemas.map((id) => [id, 0]));
  for (const x of s) if (porTema[x.tema] != null) porTema[x.tema]++;
  const fatia = {};
  for (const id of idsTemas) fatia[id] = total ? Number(((porTema[id] / total) * 100).toFixed(1)) : 0;
  const porJogo = {};
  for (const x of s) for (const j of (x.jogos && x.jogos.length ? x.jogos : ["_geral"])) porJogo[j] = (porJogo[j] || 0) + 1;
  return {
    data: snap.data,
    status: "ok",
    total,
    threads_distintos: threads,
    concentracao: threads ? Number((total / threads).toFixed(2)) : 0,
    por_tema: porTema,
    por_sentimento: { positivo: s.filter((x) => x.sentimento === "positivo").length, neutro: s.filter((x) => x.sentimento === "neutro").length, negativo: s.filter((x) => x.sentimento === "negativo").length },
    por_severidade: { alta: s.filter((x) => x.severidade === "alta").length, media: s.filter((x) => x.severidade === "media").length, baixa: s.filter((x) => x.severidade === "baixa").length },
    por_fonte: contar(s, (x) => x.fonte),
    por_jogo: porJogo,
    fatia_tema_pct: fatia,
    intencao_churn: s.filter((x) => x.intencao_churn).length,
    perguntas_sem_resposta: s.filter((x) => x.e_pergunta && !x.respondida).length,
    confusao_proposta: s.filter((x) => x.confusao_proposta).length,
    primeira_aparicao: s.filter((x) => x.primeira_aparicao).length,
    outros_pct: fatia.outros || 0,
    custo_usd: (snap.custo && snap.custo.usd) || 0,
    buscas: (snap.custo && snap.custo.buscas) || 0,
  };
}

// Extrai série [{data,valor}] de um extrator sobre os dias OK.
function serieDe(dias, extrair) {
  return dias.filter((d) => d.status === "ok").map((d) => ({ data: d.data, valor: extrair(d) || 0 }));
}

function baselineMetrica(pontos) {
  if (!pontos.length) return { mm7: 0, mm30: 0, mm90: 0, multiplo: 1, soma7: 0 };
  const fim = pontos[pontos.length - 1].data;
  const mm7 = mediaMovel(pontos, 7, fim);
  const mm30 = mediaMovel(pontos, 30, fim);
  const mm90 = mediaMovel(pontos, 90, fim);
  const ini7 = somarDias(fim, -6);
  const soma7 = pontos.filter((p) => p.data >= ini7 && p.data <= fim).reduce((a, p) => a + p.valor, 0);
  return { mm7: Number(mm7.toFixed(3)), mm30: Number(mm30.toFixed(3)), mm90: Number(mm90.toFixed(3)), multiplo: Number(multiplo(mm7, mm90).toFixed(2)), soma7 };
}

// Constrói "O que mudou" (≤5 linhas determinísticas) + ids de origem para drill-down.
function construirMudou(dias, baselines, sinaisRecentes, tax) {
  const cand = [];
  const fim = dias.length ? dias[dias.length - 1].data : null;
  const ini7 = fim ? somarDias(fim, -6) : null;
  const doPeriodo = (filtro) => sinaisRecentes.filter((s) => s.data >= ini7 && s.data <= fim && filtro(s)).map((s) => s.id);

  // Volume por tema
  for (const t of tax.temas) {
    const b = baselines.temas[t.id]; if (!b) continue;
    if (b.multiplo >= LIM_SOBE && b.soma7 >= MIN_ABS_7D) {
      cand.push({ tipo: "subiu", metrica: "volume", escopo: t.id, rotulo: t.rotulo, multiplo: b.multiplo, valor: b.soma7,
        texto: `${t.rotulo}: ${fmtMultiplo(b.multiplo)} acima da média de 90 dias (${b.soma7} menções em 7d)`,
        score: Math.abs(Math.log(b.multiplo || 1)) * b.soma7, ids: doPeriodo((s) => s.tema === t.id) });
    } else if (b.multiplo <= LIM_DESCE && b.mm90 * 90 >= MIN_BASE && b.mm90 > 0) {
      cand.push({ tipo: "caiu", metrica: "volume", escopo: t.id, rotulo: t.rotulo, multiplo: b.multiplo, valor: b.soma7,
        texto: `${t.rotulo}: caiu para ${fmtMultiplo(b.multiplo)} da média de 90 dias`,
        score: Math.abs(Math.log((b.multiplo || 0.01))) * Math.max(1, b.mm90 * 7), ids: doPeriodo((s) => s.tema === t.id) });
    }
  }
  // Métricas globais que sobem
  const globais = [
    { chave: "intencao_churn", rotulo: "Intenção de churn" },
    { chave: "perguntas_sem_resposta", rotulo: "Perguntas sem resposta" },
    { chave: "confusao_proposta", rotulo: "Confusão sobre a proposta" },
  ];
  for (const g of globais) {
    const b = baselines.globais[g.chave]; if (!b) continue;
    if (b.multiplo >= LIM_SOBE && b.soma7 >= MIN_ABS_7D) {
      cand.push({ tipo: "subiu", metrica: g.chave, escopo: "global", rotulo: g.rotulo, multiplo: b.multiplo, valor: b.soma7,
        texto: `${g.rotulo}: ${fmtMultiplo(b.multiplo)} acima da média de 90 dias (${b.soma7} em 7d)`,
        score: Math.abs(Math.log(b.multiplo || 1)) * b.soma7 * 1.2, ids: doPeriodo((s) => filtroGlobal(g.chave, s)) });
    }
  }
  // Primeira aparição no período
  const novos = doPeriodo((s) => s.primeira_aparicao);
  if (novos.length) {
    cand.push({ tipo: "apareceu", metrica: "primeira_aparicao", escopo: "global", rotulo: "Primeira aparição", valor: novos.length,
      texto: `${novos.length} assinatura(s) tema+jogo apareceram pela primeira vez em 7d`, score: novos.length * 5, ids: novos });
  }

  cand.sort((a, b) => b.score - a.score);
  const top = cand.slice(0, 5).map(({ score, ...r }) => r);
  if (!top.length) return [{ tipo: "nada", texto: "Nada relevante mudou nos últimos 7 dias.", ids: [] }];
  return top;
}

function filtroGlobal(chave, s) {
  if (chave === "intencao_churn") return s.intencao_churn;
  if (chave === "perguntas_sem_resposta") return s.e_pergunta && !s.respondida;
  if (chave === "confusao_proposta") return s.confusao_proposta;
  return false;
}

export function reconstruir(tax = carregarTaxonomia()) {
  const idsTemas = tax.temas.map((t) => t.id);
  const arquivos = listarSnapshots();
  const dias = [];
  const recentes = [];
  let ultimoSnap = null;

  const corteRecentes = arquivos.length ? somarDias(arquivos[arquivos.length - 1].slice(0, 10), -(DIAS_SINAIS_RECENTES - 1)) : null;

  for (const arq of arquivos) {
    const snap = lerJson(join(CAMINHOS.snapshots, arq));
    if (!snap) continue;
    ultimoSnap = snap;
    dias.push(agregarDia(snap, idsTemas));
    if (snap.status === "ok" && snap.data >= corteRecentes) {
      for (const s of snap.sinais || []) recentes.push({ ...s, data: snap.data });
    }
  }
  dias.sort((a, b) => a.data.localeCompare(b.data));

  // Baselines por tema (volume), por jogo (volume) e globais.
  const baselines = { temas: {}, jogos: {}, globais: {}, mm90_por_tema: {} };
  for (const t of tax.temas) {
    const b = baselineMetrica(serieDe(dias, (d) => (d.por_tema || {})[t.id] || 0));
    baselines.temas[t.id] = b;
    baselines.mm90_por_tema[t.id] = b.mm90;
  }
  for (const chave of ["total", "intencao_churn", "perguntas_sem_resposta", "confusao_proposta", "primeira_aparicao"]) {
    baselines.globais[chave] = baselineMetrica(serieDe(dias, (d) => d[chave] || 0));
  }
  // jogos: coleta o universo dos últimos 90d
  const jogosUniverso = new Set();
  for (const d of dias) for (const j of Object.keys(d.por_jogo || {})) if (j !== "_geral") jogosUniverso.add(j);
  for (const j of jogosUniverso) baselines.jogos[j] = baselineMetrica(serieDe(dias, (d) => (d.por_jogo || {})[j] || 0));

  // Alertas
  const fim = dias.length ? dias[dias.length - 1].data : null;
  const ini30 = fim ? somarDias(fim, -29) : null;
  const dias30 = dias.filter((d) => d.status === "ok" && d.data >= ini30);
  const totalTemas30 = dias30.reduce((a, d) => a + (d.total || 0), 0);
  const outros30 = dias30.reduce((a, d) => a + ((d.por_tema || {}).outros || 0), 0);
  const outrosPct30 = totalTemas30 ? Number(((outros30 / totalTemas30) * 100).toFixed(1)) : 0;
  const confiancaUltima = ultimoSnap ? (ultimoSnap.confianca || "media") : "media";

  const mudou = construirMudou(dias, baselines, recentes, tax);

  const serie = {
    esquema: ESQUEMA,
    atualizado_em: agoraISO(),
    taxonomia_versao: tax.versao,
    dias,
    baselines,
    mudou,
    alertas: {
      taxonomia_outros: { ativo: outrosPct30 > (tax.regras?.limiar_outros_pct ?? 15), outros_pct_30d: outrosPct30, limiar: tax.regras?.limiar_outros_pct ?? 15 },
      confianca_ultima: confiancaUltima,
    },
  };
  escreverJson(CAMINHOS.serie, serie);
  escreverJson(CAMINHOS.sinaisRecentes, { esquema: ESQUEMA, atualizado_em: agoraISO(), desde: corteRecentes, sinais: recentes });
  if (ultimoSnap) escreverJson(CAMINHOS.ultimo, ultimoSnap);
  return serie;
}

// Chamado pelo coletor após gravar o snapshot do dia.
export function atualizarTudo(tax = carregarTaxonomia()) { return reconstruir(tax); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const s = reconstruir();
  console.log(`serie: ${s.dias.length} dias · mudou: ${s.mudou.length} linha(s) · alerta outros: ${s.alertas.taxonomia_outros.ativo}`);
}
