"use strict";

// Radar de Feedback ExitLag — painel estático. Lê os JSON versionados no repo.
// Sem dependências externas: gráficos em SVG feitos à mão.

const CORES = {
  latencia_ping: "#33d17a",
  cobertura_jogos: "#4aa3ff",
  preco_assinatura: "#c9a24b",
  instalacao_setup: "#b57edc",
  suporte_atendimento: "#ff8f4a",
  confiabilidade_app: "#e06666",
  confusao_produto: "#46c9c3",
  comparacao_concorrente: "#d78ec9",
  outros: "#7f8c8a",
};
const COR_SENT = { positivo: "#33d17a", neutro: "#c9a24b", negativo: "#e06666" };

const estado = {
  tax: null,
  serie: null,
  ultimo: null,
  eventos: [],
  periodo: 30,
  ocultos: new Set(), // temas desligados na legenda
};

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

async function carregar(caminho) {
  const r = await fetch(caminho, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${caminho}: ${r.status}`);
  return r.json();
}

function rotuloTema(id) {
  const t = estado.tax.temas.find((x) => x.id === id);
  return t ? t.rotulo : id;
}

// ---------------- Painel do dia ----------------
function renderDia() {
  const d = estado.ultimo;
  const st = $("#statusColeta");
  if (d.status === "ok") {
    st.innerHTML = `Última coleta: <span class="ok">OK</span> · ${d.data}`;
  } else {
    st.innerHTML = `Última coleta: <span class="falha">SEM COLETA</span> · ${d.data}`;
  }
  $("#bannerExemplo").hidden = !d.exemplo;
  $("#dataDia").textContent = d.data;

  const sent = d.sentimento || {};
  const custoMes = somaCustoMes(d.data);
  const resumo = $("#resumoDia");
  resumo.innerHTML = "";
  const cards = [
    { cls: "cartao--sinal", num: d.sinais_novos ?? 0, rot: "sinais novos hoje" },
    { num: sent.positivo ?? 0, rot: "positivos" },
    { num: sent.neutro ?? 0, rot: "neutros" },
    { num: sent.negativo ?? 0, rot: "negativos" },
    { num: "US$" + custoMes.toFixed(2), rot: "custo acumulado no mês" },
  ];
  for (const c of cards) {
    const box = el("div", "cartao " + (c.cls || ""));
    box.append(el("div", "num", String(c.num)), el("div", "rot", c.rot));
    resumo.append(box);
  }

  const cont = d.contagem_por_tema || {};
  const grid = $("#temasDia");
  grid.innerHTML = "";
  for (const t of estado.tax.temas) {
    const n = cont[t.id] || 0;
    const row = el("div", "tema" + (n === 0 ? " tema--zero" : ""));
    const pt = el("div", "tema__pt");
    const cor = el("span", "tema__cor"); cor.style.background = CORES[t.id];
    pt.append(cor, el("span", "tema__nome", t.rotulo));
    row.append(pt, el("span", "tema__n", String(n)));
    grid.append(row);
  }

  const cit = $("#citacoes");
  cit.innerHTML = "";
  const sinais = d.sinais || [];
  if (!sinais.length) { cit.append(el("div", "vazio", "Nenhum sinal novo neste dia.")); return; }
  for (const s of sinais) cit.append(cartaoCitacao(s));
}

function cartaoCitacao(s) {
  const c = el("div", "cit");
  const meta = el("div", "cit__meta");
  const cor = el("span", "tema__cor"); cor.style.background = CORES[s.tema] || "#888";
  meta.append(cor, el("span", null, rotuloTema(s.tema)));
  const sk = { positivo: "pos", neutro: "neu", negativo: "neg" }[s.sentimento] || "neu";
  meta.append(el("span", `tag tag--${sk}`, s.sentimento));
  if (s.idioma) meta.append(el("span", "tag", s.idioma));
  meta.append(el("span", null, s.fonte || ""));
  c.append(meta);
  if (s.trecho) c.append(el("p", "cit__trecho", `“${s.trecho}”`));
  if (s.resumo) c.append(el("p", "cit__resumo", s.resumo));
  const a = el("a", null, s.url); a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
  c.append(a);
  return c;
}

// ---------------- Janela de tempo ----------------
function diasNoPeriodo() {
  const dias = estado.serie.dias;
  if (!dias.length) return [];
  const fim = new Date(dias[dias.length - 1].data + "T00:00:00Z");
  const ini = new Date(fim); ini.setUTCDate(ini.getUTCDate() - (estado.periodo - 1));
  return dias.filter((d) => new Date(d.data + "T00:00:00Z") >= ini);
}

function somaCustoMes(dataRef) {
  const mes = (dataRef || "").slice(0, 7);
  return estado.serie.dias
    .filter((d) => (d.data || "").slice(0, 7) === mes)
    .reduce((a, d) => a + (d.custo_usd || 0), 0);
}

// ---------------- SVG util ----------------
const NS = "http://www.w3.org/2000/svg";
const mk = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

function eixos(svg, W, H, P, maxY, dias) {
  // grade horizontal + rótulos Y (evita rótulos inteiros repetidos em valores baixos)
  const passos = Math.min(4, Math.max(1, maxY));
  for (let i = 0; i <= passos; i++) {
    const y = P.t + (H - P.t - P.b) * (i / passos);
    const val = Math.round(maxY * (1 - i / passos));
    svg.append(mk("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: "#24352c" }));
    const tx = mk("text", { x: P.l - 6, y: y + 3, "text-anchor": "end", fill: "#8fa89b", "font-size": 10 });
    tx.textContent = val; svg.append(tx);
  }
  // rótulos X (primeiro, meio, último)
  const idxs = dias.length <= 1 ? [0] : [0, Math.floor(dias.length / 2), dias.length - 1];
  for (const i of idxs) {
    const x = xPos(i, dias.length, W, P);
    const tx = mk("text", { x, y: H - P.b + 14, "text-anchor": "middle", fill: "#8fa89b", "font-size": 10 });
    tx.textContent = (dias[i].data || "").slice(5); svg.append(tx);
  }
}
function xPos(i, n, W, P) { return n <= 1 ? (P.l + (W - P.l - P.r) / 2) : P.l + (W - P.l - P.r) * (i / (n - 1)); }
function yPos(v, maxY, H, P) { return maxY <= 0 ? (H - P.b) : P.t + (H - P.t - P.b) * (1 - v / maxY); }

// Gráfico de linhas: volume por tema.
function renderGraficoTemas() {
  const dias = diasNoPeriodo();
  const cont = $("#graficoTemas"); cont.innerHTML = "";
  const leg = $("#legendaTemas"); leg.innerHTML = "";
  if (!dias.length) { cont.append(el("div", "vazio", "Sem dados no período.")); return; }

  const W = 720, H = 260, P = { t: 14, r: 16, b: 26, l: 34 };
  const visiveis = estado.tax.temas.filter((t) => !estado.ocultos.has(t.id));
  let maxY = 1;
  for (const d of dias) for (const t of visiveis) maxY = Math.max(maxY, (d.por_tema || {})[t.id] || 0);

  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });
  eixos(svg, W, H, P, maxY, dias);

  // marcadores de evento
  for (const ev of estado.eventos) {
    const i = dias.findIndex((d) => d.data === ev.data);
    if (i < 0) continue;
    const x = xPos(i, dias.length, W, P);
    svg.append(mk("line", { x1: x, y1: P.t, x2: x, y2: H - P.b, class: "evt-linha" }));
    const tx = mk("text", { x: x + 3, y: P.t + 9, class: "evt-rot" }); tx.textContent = "◆ " + ev.titulo; svg.append(tx);
  }

  for (const t of visiveis) {
    const pts = dias.map((d, i) => [xPos(i, dias.length, W, P), yPos((d.por_tema || {})[t.id] || 0, maxY, H, P)]);
    const dattr = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    svg.append(mk("path", { d: dattr, fill: "none", stroke: CORES[t.id], "stroke-width": 2, "stroke-linejoin": "round" }));
    dias.forEach((d, i) => {
      const c = mk("circle", { cx: pts[i][0], cy: pts[i][1], r: 3.5, fill: CORES[t.id], class: "ponto" });
      c.addEventListener("click", () => abrirDia(d.data));
      const tit = mk("title"); tit.textContent = `${d.data} · ${t.rotulo}: ${(d.por_tema || {})[t.id] || 0}`; c.append(tit);
      svg.append(c);
    });
  }
  cont.append(svg);

  for (const t of estado.tax.temas) {
    const sp = el("span", estado.ocultos.has(t.id) ? "off" : "");
    const i = el("i"); i.style.background = CORES[t.id];
    sp.append(i, document.createTextNode(t.rotulo));
    sp.addEventListener("click", () => {
      if (estado.ocultos.has(t.id)) estado.ocultos.delete(t.id); else estado.ocultos.add(t.id);
      renderGraficoTemas();
    });
    leg.append(sp);
  }
}

// Faixa de sentimento (100% empilhado).
function renderGraficoSentimento() {
  const dias = diasNoPeriodo();
  const cont = $("#graficoSentimento"); cont.innerHTML = "";
  if (!dias.length) { cont.append(el("div", "vazio", "Sem dados no período.")); return; }
  const W = 720, H = 180, P = { t: 10, r: 16, b: 26, l: 34 };
  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}`, role: "img" });

  // barras empilhadas normalizadas por dia
  const bw = Math.max(2, (W - P.l - P.r) / dias.length - 2);
  dias.forEach((d, i) => {
    const s = d.sentimento || {};
    const total = (s.positivo || 0) + (s.neutro || 0) + (s.negativo || 0);
    const x = xPos(i, dias.length, W, P) - bw / 2;
    if (total === 0) {
      svg.append(mk("rect", { x, y: P.t, width: bw, height: H - P.t - P.b, fill: "#182a22" }));
      return;
    }
    let y = P.t;
    const alt = H - P.t - P.b;
    for (const k of ["positivo", "neutro", "negativo"]) {
      const h = alt * ((s[k] || 0) / total);
      const rect = mk("rect", { x, y, width: bw, height: h, fill: COR_SENT[k] });
      const tit = mk("title"); tit.textContent = `${d.data} · +${s.positivo || 0} / ~${s.neutro || 0} / −${s.negativo || 0}`; rect.append(tit);
      rect.style.cursor = "pointer"; rect.addEventListener("click", () => abrirDia(d.data));
      svg.append(rect); y += h;
    }
  });
  // rótulos X
  const idxs = dias.length <= 1 ? [0] : [0, Math.floor(dias.length / 2), dias.length - 1];
  for (const i of idxs) {
    const tx = mk("text", { x: xPos(i, dias.length, W, P), y: H - P.b + 14, "text-anchor": "middle", fill: "#8fa89b", "font-size": 10 });
    tx.textContent = (dias[i].data || "").slice(5); svg.append(tx);
  }
  cont.append(svg);
}

// Comparador: período atual vs anterior de mesmo tamanho.
function renderComparador() {
  const dias = estado.serie.dias;
  const cont = $("#comparador"); cont.innerHTML = "";
  const atual = diasNoPeriodo();
  if (!atual.length) { cont.append(el("div", "vazio", "Sem dados no período.")); return; }
  const fim = new Date(atual[0].data + "T00:00:00Z");
  const iniAnt = new Date(fim); iniAnt.setUTCDate(iniAnt.getUTCDate() - estado.periodo);
  const anterior = dias.filter((d) => {
    const dt = new Date(d.data + "T00:00:00Z");
    return dt >= iniAnt && dt < fim;
  });
  $("#rotuloComparacao").textContent = `(últimos ${estado.periodo}d vs ${estado.periodo}d anteriores)`;

  const soma = (arr, id) => arr.reduce((a, d) => a + ((d.por_tema || {})[id] || 0), 0);
  for (const t of estado.tax.temas) {
    const a = soma(atual, t.id), b = soma(anterior, t.id);
    if (a === 0 && b === 0) continue;
    const box = el("div", "comp");
    const nome = el("div", "comp__nome");
    const cor = el("span", "tema__cor"); cor.style.background = CORES[t.id];
    nome.append(cor, document.createTextNode(t.rotulo));
    const linha = el("div", "comp__linha");
    linha.append(el("span", "comp__atual", String(a)), el("span", "comp__ant", `antes: ${b}`));
    box.append(nome, linha, deltaEl(a, b));
    cont.append(box);
  }
  if (!cont.children.length) cont.append(el("div", "vazio", "Sem sinais para comparar."));
}

function deltaEl(a, b) {
  let cls = "delta--zero", txt;
  if (b === 0 && a === 0) txt = "—";
  else if (b === 0) { cls = "delta--sobe"; txt = "novo"; }
  else {
    const pct = Math.round(((a - b) / b) * 100);
    if (pct > 0) { cls = "delta--sobe"; txt = `▲ +${pct}%`; }
    else if (pct < 0) { cls = "delta--desce"; txt = `▼ ${pct}%`; }
    else txt = "0%";
  }
  return el("div", "delta " + cls, txt);
}

// ---------------- Detalhe do dia ----------------
async function abrirDia(data) {
  const box = $("#detalheConteudo");
  box.innerHTML = `<h2>${data}</h2><p class="muted">Carregando…</p>`;
  $("#detalheDia").hidden = false;
  try {
    const snap = await carregar(`dados/snapshots/${data}.json`);
    box.innerHTML = "";
    box.append(el("h2", null, `${data}`));
    if (snap.status !== "ok") {
      box.append(el("p", "muted", `Status: ${snap.status}${snap.erro ? " — " + snap.erro : ""}`));
    }
    const meta = el("p", "muted", `${snap.sinais_novos || 0} sinais novos · US$${(snap.custo && snap.custo.usd) || 0} · ${(snap.custo && snap.custo.buscas) || 0} buscas`);
    box.append(meta);
    const sinais = snap.sinais || [];
    if (!sinais.length) box.append(el("div", "vazio", "Nenhum sinal novo neste dia."));
    else { const wrap = el("div", "citacoes"); for (const s of sinais) wrap.append(cartaoCitacao(s)); box.append(wrap); }
  } catch (e) {
    box.innerHTML = `<h2>${data}</h2><p class="muted">Snapshot indisponível (${e.message}).</p>`;
  }
}
function fecharDetalhe() { $("#detalheDia").hidden = true; }

// ---------------- Boot ----------------
function ligarPeriodos() {
  $("#periodos").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    estado.periodo = Number(b.dataset.dias);
    [...$("#periodos").children].forEach((x) => x.classList.toggle("on", x === b));
    renderGraficoTemas(); renderGraficoSentimento(); renderComparador();
  });
  document.querySelectorAll("[data-fechar]").forEach((x) => x.addEventListener("click", fecharDetalhe));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharDetalhe(); });
}

async function iniciar() {
  try {
    const [tax, serie, ultimo] = await Promise.all([
      carregar("config/taxonomia.json"),
      carregar("dados/serie-historica.json"),
      carregar("dados/ultimo.json"),
    ]);
    estado.tax = tax; estado.serie = serie; estado.ultimo = ultimo;
    try { const ev = await carregar("dados/eventos.json"); estado.eventos = ev.eventos || []; } catch { estado.eventos = []; }

    renderDia();
    renderGraficoTemas();
    renderGraficoSentimento();
    renderComparador();
    ligarPeriodos();
    $("#rodapeAtualizado").textContent = serie.atualizado_em ? `Série atualizada em ${new Date(serie.atualizado_em).toLocaleString("pt-BR")}` : "";
  } catch (e) {
    document.querySelector("main").innerHTML = `<div class="secao"><h2>Não foi possível carregar os dados</h2><p class="muted">${e.message}</p></div>`;
  }
}
iniciar();
