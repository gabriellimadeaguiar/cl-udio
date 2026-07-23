// Catálogo de assinaturas tema+jogo já vistas, com a data da primeira ocorrência.
// É o que permite marcar um sinal como "primeira aparição" (novo) vs recorrente.

import { CAMINHOS, ESQUEMA, lerJson, escreverJson, agoraISO } from "./comum.mjs";
import { assinaturas } from "./schema.mjs";

export function carregarCatalogo() {
  return lerJson(CAMINHOS.catalogo, { esquema: ESQUEMA, atualizado_em: null, assinaturas: {} });
}

// Marca primeira_aparicao em cada sinal (contra o estado ANTES deste dia) e
// atualiza o catálogo. Deve ser chamado uma vez por coleta, na ordem dos sinais.
export function registrar(sinais, data, cat = carregarCatalogo()) {
  const mapa = cat.assinaturas || {};
  for (const s of sinais) {
    let novo = false;
    for (const a of assinaturas(s)) {
      if (!mapa[a]) { mapa[a] = { primeira: data, ocorrencias: 0 }; novo = true; }
      mapa[a].ocorrencias += 1;
      mapa[a].ultima = data;
    }
    s.primeira_aparicao = novo; // true se QUALQUER assinatura do sinal era inédita
  }
  cat.esquema = ESQUEMA;
  cat.assinaturas = mapa;
  cat.atualizado_em = agoraISO();
  escreverJson(CAMINHOS.catalogo, cat);
  return cat;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const c = carregarCatalogo();
  console.log(`catalogo.json: ${Object.keys(c.assinaturas || {}).length} assinaturas tema+jogo.`);
}
