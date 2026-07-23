// Deduplicação por URL.
// Compara os sinais encontrados hoje com dados/vistos.json e devolve só os NOVOS.
// Uso como módulo: import { deduplicar, atualizarVistos } from "./dedup.mjs".
// Uso como CLI (diagnóstico): node scripts/dedup.mjs

import { CAMINHOS, ESQUEMA, lerJson, escreverJson, agoraISO } from "./comum.mjs";

// Normaliza URL para comparação (remove barra final, fragmento, utm_*, minúsculas no host).
export function normalizarUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.host = u.host.toLowerCase();
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref)/i.test(k)) u.searchParams.delete(k);
    }
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return (url || "").trim();
  }
}

export function carregarVistos() {
  return lerJson(CAMINHOS.vistos, { esquema: ESQUEMA, atualizado_em: null, urls: [] });
}

// Retorna { novos, jaVistos } a partir de uma lista de sinais e do conjunto visto.
export function deduplicar(sinais, vistos = carregarVistos()) {
  const conjunto = new Set((vistos.urls || []).map(normalizarUrl));
  const novos = [];
  const jaVistos = [];
  const vistosNestaRodada = new Set();
  for (const s of sinais) {
    const chave = normalizarUrl(s.url);
    if (conjunto.has(chave) || vistosNestaRodada.has(chave)) {
      jaVistos.push(s);
    } else {
      vistosNestaRodada.add(chave);
      novos.push(s);
    }
  }
  return { novos, jaVistos };
}

// Grava as novas URLs em vistos.json (mantém histórico completo de URLs processadas).
export function atualizarVistos(sinaisNovos, vistos = carregarVistos()) {
  const conjunto = new Set((vistos.urls || []).map(normalizarUrl));
  for (const s of sinaisNovos) conjunto.add(normalizarUrl(s.url));
  const atualizado = {
    esquema: ESQUEMA,
    atualizado_em: agoraISO(),
    urls: [...conjunto].sort(),
  };
  escreverJson(CAMINHOS.vistos, atualizado);
  return atualizado;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const v = carregarVistos();
  console.log(`vistos.json: ${(v.urls || []).length} URLs já processadas.`);
}
