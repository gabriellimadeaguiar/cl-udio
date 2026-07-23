// Atualiza dados/serie-historica.json com uma entrada leve por dia coletado.
// A série guarda só os números (contagem por tema + sentimento + custo), para o
// site desenhar 1 ano de gráfico sem baixar 365 snapshots completos.
// Uso como módulo: import { atualizarSerie } from "./agregar.mjs".
// Uso como CLI (reconstrói a série a partir dos snapshots): node scripts/agregar.mjs

import {
  CAMINHOS, ESQUEMA, lerJson, escreverJson, agoraISO,
  carregarTaxonomia, listarSnapshots,
} from "./comum.mjs";
import { join as pjoin } from "node:path";

function entradaDoDia(snap) {
  return {
    data: snap.data,
    status: snap.status,
    sinais_novos: snap.sinais_novos || 0,
    por_tema: snap.contagem_por_tema || {},
    sentimento: snap.sentimento || { positivo: 0, neutro: 0, negativo: 0 },
    custo_usd: (snap.custo && snap.custo.usd) || 0,
    exemplo: snap.exemplo === true ? true : undefined,
  };
}

export function carregarSerie(tax = carregarTaxonomia()) {
  return lerJson(CAMINHOS.serie, {
    esquema: ESQUEMA,
    atualizado_em: null,
    taxonomia_versao: tax.versao,
    dias: [],
  });
}

// Insere/atualiza a entrada de um dia e reordena por data.
export function atualizarSerie(snap, tax = carregarTaxonomia()) {
  const serie = carregarSerie(tax);
  const entrada = entradaDoDia(snap);
  const idx = serie.dias.findIndex((d) => d.data === entrada.data);
  if (idx >= 0) serie.dias[idx] = entrada;
  else serie.dias.push(entrada);
  serie.dias.sort((a, b) => a.data.localeCompare(b.data));
  serie.atualizado_em = agoraISO();
  serie.taxonomia_versao = tax.versao;
  escreverJson(CAMINHOS.serie, serie);
  return serie;
}

// Reconstrói toda a série a partir dos snapshots em disco (uso manual/recuperação).
export function reconstruirSerie(tax = carregarTaxonomia()) {
  const dias = [];
  for (const arq of listarSnapshots()) {
    const snap = lerJson(pjoin(CAMINHOS.snapshots, arq));
    if (snap) dias.push(entradaDoDia(snap));
  }
  dias.sort((a, b) => a.data.localeCompare(b.data));
  const serie = {
    esquema: ESQUEMA,
    atualizado_em: agoraISO(),
    taxonomia_versao: tax.versao,
    dias,
  };
  escreverJson(CAMINHOS.serie, serie);
  return serie;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const serie = reconstruirSerie();
  console.log(`serie-historica.json reconstruída: ${serie.dias.length} dias.`);
}
