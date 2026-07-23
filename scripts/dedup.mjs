// Deduplicação por id (sha1 da URL normalizada) contra dados/vistos.json.
// Roda ANTES de gastar tokens classificando quando possível, e de novo ao gravar.

import { CAMINHOS, ESQUEMA, lerJson, escreverJson, agoraISO, idDeUrl } from "./comum.mjs";

export function carregarVistos() {
  return lerJson(CAMINHOS.vistos, { esquema: ESQUEMA, atualizado_em: null, ids: [] });
}

// Recebe sinais (cada um já com .id) e devolve { novos, repetidos }.
export function deduplicar(sinais, vistos = carregarVistos()) {
  const conjunto = new Set(vistos.ids || []);
  const nestaRodada = new Set();
  const novos = [], repetidos = [];
  for (const s of sinais) {
    const id = s.id || idDeUrl(s.url);
    if (conjunto.has(id) || nestaRodada.has(id)) repetidos.push(s);
    else { nestaRodada.add(id); novos.push(s); }
  }
  return { novos, repetidos };
}

export function atualizarVistos(sinaisNovos, vistos = carregarVistos()) {
  const conjunto = new Set(vistos.ids || []);
  for (const s of sinaisNovos) conjunto.add(s.id || idDeUrl(s.url));
  const atual = { esquema: ESQUEMA, atualizado_em: agoraISO(), ids: [...conjunto].sort() };
  escreverJson(CAMINHOS.vistos, atual);
  return atual;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const v = carregarVistos();
  console.log(`vistos.json: ${(v.ids || []).length} ids já processados.`);
}
