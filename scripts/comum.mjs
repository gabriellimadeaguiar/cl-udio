// Utilidades compartilhadas por coletar.mjs, dedup.mjs e agregar.mjs.
// Sem dependências além do Node (fs/path). Mantém leitura/escrita de JSON,
// validação de esquema, cálculo de custo e helpers de data.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, "..");

export const CAMINHOS = {
  taxonomia: join(RAIZ, "config", "taxonomia.json"),
  dados: join(RAIZ, "dados"),
  snapshots: join(RAIZ, "dados", "snapshots"),
  serie: join(RAIZ, "dados", "serie-historica.json"),
  vistos: join(RAIZ, "dados", "vistos.json"),
  ultimo: join(RAIZ, "dados", "ultimo.json"),
  eventos: join(RAIZ, "dados", "eventos.json"),
};

// Versão do formato dos arquivos de dados. Incrementar só em mudança incompatível.
export const ESQUEMA = 1;

// ---------- Preços (confira em https://claude.com/pricing antes de confiar) ----------
// Valores por 1 milhão de tokens (USD). Sonnet 5 tem preço promocional até 2026-08-31.
export const PRECOS = {
  "claude-sonnet-5": { entrada: 2.0, saida: 10.0 },
  "claude-opus-4-8": { entrada: 5.0, saida: 25.0 },
  "claude-haiku-4-5": { entrada: 1.0, saida: 5.0 },
};
export const PRECO_BUSCA_WEB = 0.01; // USD por busca (US$10 / 1.000)

export function precoModelo(modelo) {
  return PRECOS[modelo] || PRECOS["claude-sonnet-5"];
}

export function calcularCusto(modelo, uso) {
  const p = precoModelo(modelo);
  const entrada = (uso.tokens_entrada / 1_000_000) * p.entrada;
  const saida = (uso.tokens_saida / 1_000_000) * p.saida;
  const buscas = (uso.buscas || 0) * PRECO_BUSCA_WEB;
  return Number((entrada + saida + buscas).toFixed(4));
}

// ---------- JSON ----------
export function lerJson(caminho, padrao = null) {
  if (!existsSync(caminho)) return padrao;
  try {
    return JSON.parse(readFileSync(caminho, "utf8"));
  } catch (e) {
    throw new Error(`JSON inválido em ${caminho}: ${e.message}`);
  }
}

export function escreverJson(caminho, obj) {
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, JSON.stringify(obj, null, 2) + "\n");
}

export function carregarTaxonomia() {
  const tax = lerJson(CAMINHOS.taxonomia);
  if (!tax || !Array.isArray(tax.temas)) {
    throw new Error("config/taxonomia.json ausente ou malformado");
  }
  return tax;
}

// ---------- Data ----------
export function hojeISO(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
export function agoraISO() {
  return new Date().toISOString();
}

// ---------- Validação de esquema (leve, sem libs) ----------
export function validarSinal(sinal, idsTemas) {
  const erros = [];
  const ehTexto = (v) => typeof v === "string" && v.trim().length > 0;
  if (!ehTexto(sinal.url) || !/^https?:\/\//i.test(sinal.url)) erros.push("url inválida");
  if (!ehTexto(sinal.titulo)) erros.push("titulo vazio");
  if (!ehTexto(sinal.trecho)) erros.push("trecho vazio");
  if (!idsTemas.includes(sinal.tema)) erros.push(`tema fora da taxonomia: ${sinal.tema}`);
  if (!["positivo", "neutro", "negativo"].includes(sinal.sentimento))
    erros.push(`sentimento inválido: ${sinal.sentimento}`);
  return erros;
}

export function validarSnapshot(snap, idsTemas) {
  const erros = [];
  if (snap.esquema !== ESQUEMA) erros.push(`esquema esperado ${ESQUEMA}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snap.data || "")) erros.push("data inválida");
  if (!["ok", "sem-coleta"].includes(snap.status)) erros.push("status inválido");
  if (!Array.isArray(snap.sinais)) erros.push("sinais deve ser array");
  else for (const s of snap.sinais) {
    const e = validarSinal(s, idsTemas);
    if (e.length) erros.push(`sinal (${s.url || "?"}): ${e.join("; ")}`);
  }
  return erros;
}

// ---------- Agregações ----------
export function contarPorTema(sinais, idsTemas) {
  const c = Object.fromEntries(idsTemas.map((id) => [id, 0]));
  for (const s of sinais) if (c[s.tema] !== undefined) c[s.tema]++;
  return c;
}

export function contarSentimento(sinais) {
  const c = { positivo: 0, neutro: 0, negativo: 0 };
  for (const s of sinais) if (c[s.sentimento] !== undefined) c[s.sentimento]++;
  return c;
}

export function listarSnapshots() {
  if (!existsSync(CAMINHOS.snapshots)) return [];
  return readdirSync(CAMINHOS.snapshots)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
}
