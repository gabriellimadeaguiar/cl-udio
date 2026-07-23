// Utilidades compartilhadas (v2). Sem dependências além do Node.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, "..");

export const CAMINHOS = {
  taxonomia: join(RAIZ, "config", "taxonomia.json"),
  eventos: join(RAIZ, "config", "eventos.json"),
  dados: join(RAIZ, "dados"),
  snapshots: join(RAIZ, "dados", "snapshots"),
  rejeitados: join(RAIZ, "dados", "rejeitados"),
  serie: join(RAIZ, "dados", "serie-historica.json"),
  sinaisRecentes: join(RAIZ, "dados", "sinais-recentes.json"),
  vistos: join(RAIZ, "dados", "vistos.json"),
  catalogo: join(RAIZ, "dados", "catalogo.json"),
  ultimo: join(RAIZ, "dados", "ultimo.json"),
};

export const ESQUEMA = 2;
export const DIAS_SINAIS_RECENTES = 90; // janela do arquivo signal-level do site

// ---------- Preços (confira em https://claude.com/pricing) ----------
export const PRECOS = {
  "claude-opus-4-8": { entrada: 5.0, saida: 25.0 },
  "claude-sonnet-5": { entrada: 2.0, saida: 10.0 },
  "claude-haiku-4-5": { entrada: 1.0, saida: 5.0 },
};
export const PRECO_BUSCA_WEB = 0.01;

export function calcularCusto(modelo, uso) {
  const p = PRECOS[modelo] || PRECOS["claude-opus-4-8"];
  const entrada = (uso.tokens_entrada / 1_000_000) * p.entrada;
  const saida = (uso.tokens_saida / 1_000_000) * p.saida;
  const buscas = (uso.buscas || 0) * PRECO_BUSCA_WEB;
  return Number((entrada + saida + buscas).toFixed(4));
}

// ---------- JSON ----------
export function lerJson(caminho, padrao = null) {
  if (!existsSync(caminho)) return padrao;
  try { return JSON.parse(readFileSync(caminho, "utf8")); }
  catch (e) { throw new Error(`JSON inválido em ${caminho}: ${e.message}`); }
}
export function escreverJson(caminho, obj) {
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, JSON.stringify(obj, null, 2) + "\n");
}
export function carregarTaxonomia() {
  const t = lerJson(CAMINHOS.taxonomia);
  if (!t || !Array.isArray(t.temas)) throw new Error("config/taxonomia.json ausente ou malformado");
  return t;
}

// ---------- Datas / hash ----------
export function hojeISO(d = new Date()) { return d.toISOString().slice(0, 10); }
export function agoraISO() { return new Date().toISOString(); }
export function somarDias(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function diffDias(a, b) { return Math.round((new Date(a + "T00:00:00Z") - new Date(b + "T00:00:00Z")) / 86400000); }

// URL normalizada (dedup) e id estável.
export function normalizarUrl(url) {
  try {
    const u = new URL(url); u.hash = ""; u.host = u.host.toLowerCase();
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref)/i.test(k)) u.searchParams.delete(k);
    let s = u.toString(); if (s.endsWith("/")) s = s.slice(0, -1); return s;
  } catch { return (url || "").trim(); }
}
export function idDeUrl(url) { return createHash("sha1").update(normalizarUrl(url)).digest("hex"); }

// ---------- Snapshots ----------
export function listarSnapshots() {
  if (!existsSync(CAMINHOS.snapshots)) return [];
  return readdirSync(CAMINHOS.snapshots).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
}

// ---------- Média móvel ----------
// serie: array de {data, valor} ordenado por data crescente. Retorna a MM de N dias
// terminando no último dia presente (conta dias-calendário, não índices).
export function mediaMovel(pontos, dias, ate) {
  if (!pontos.length) return 0;
  const fim = ate || pontos[pontos.length - 1].data;
  const ini = somarDias(fim, -(dias - 1));
  const janela = pontos.filter((p) => p.data >= ini && p.data <= fim);
  if (!janela.length) return 0;
  const soma = janela.reduce((a, p) => a + p.valor, 0);
  return soma / dias; // média sobre a janela de N dias (dias sem dado contam como 0)
}

// Desvio em múltiplo: valor recente ÷ MM90 (guardado contra divisão por ~0).
export function multiplo(recente, base) {
  if (base <= 0.0001) return recente > 0 ? Infinity : 1;
  return recente / base;
}
export function fmtMultiplo(m) {
  if (!isFinite(m)) return "novo";
  return `${m.toFixed(1)}x`;
}
