"use strict";
// Radar de Feedback ExitLag (v2). SVG/JS puro. Lê os JSON versionados no repo.
// Princípio: cada elemento responde "o que mudou e o que faço?" — nível absoluto
// sem linha de base é proibido; todo número é clicável até a origem (drill-down).

const CORES = {
  latencia_ping: "#4ADE9C", cobertura_jogos: "#5AA9E8", preco_assinatura: "#F2C14E",
  instalacao_setup: "#B58CE8", suporte_atendimento: "#E89A5A", confiabilidade_app: "#E8735A",
  confusao_produto: "#4FC7C0", comparacao_concorrente: "#D98CC7", outros: "#7C8A94",
};
const NS = "http://www.w3.org/2000/svg";
const E = { tax: null, serie: null, recentes: [], eventos: [], ultimo: null, mapa: new Map(), periodo: 90 };

const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const mk = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rotTema = (id) => (E.tax.temas.find((t) => t.id === id) || {}).rotulo || id;
async function carregar(c, opt = false) { const r = await fetch(c, { cache: "no-cache" }); if (!r.ok) { if (opt) return null; throw new Error(`${c}: ${r.status}`); } return r.json(); }

// ---------- datas / janelas ----------
const somarDias = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function ultimaData() { const d = E.serie.dias; return d.length ? d[d.length - 1].data : null; }
function diasPeriodo() {
  const d = E.serie.dias; if (!d.length) return [];
  if (E.periodo === 0) return d;
  const ini = somarDias(ultimaData(), -(E.periodo - 1));
  return d.filter((x) => x.data >= ini);
}
function recentesJanela(nDias) {
  const fim = ultimaData(); if (!fim) return [];
  const ini = somarDias(fim, -(nDias - 1));
  return E.recentes.filter((s) => s.data >= ini && s.data <= fim);
}
function modo(arr, chave) {
  const c = {}; for (const x of arr) { const k = chave(x); if (k == null) continue; c[k] = (c[k] || 0) + 1; }
  let melhor = null, n = -1; for (const k in c) if (c[k] > n) { n = c[k]; melhor = k; } return melhor;
}

// ---------- 1. Abertura: O que mudou ----------
function renderAbertura() {
  const ol = $("#mudou"); ol.innerHTML = "";
  for (const m of E.serie.mudou) {
    const li = el("li", m.tipo === "nada" ? "nada" : "");
    if (m.tipo === "nada") { li.append(el("span", "txt", m.texto)); ol.append(li); continue; }
    const seta = { subiu: "▲", caiu: "▼", apareceu: "◆" }[m.tipo] || "•";
    li.append(el("span", `marca-tipo t-${m.tipo}`, m.tipo));
    li.append(el("span", "txt", m.texto));
    li.append(el("span", "seta", seta));
    li.tabIndex = 0; li.setAttribute("role", "button");
    const abrir = () => drill(m.ids, m.texto);
    li.addEventListener("click", abrir);
    li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); } });
    ol.append(li);
  }
}

// ---------- 2. Small multiples ----------
function renderSmallMultiples() {
  const dias = diasPeriodo(); const grid = $("#smallMultiples"); grid.innerHTML = "";
  if (!dias.length) { grid.append(el("div", "vazio", "Sem dados no período.")); return; }
  let maxY = 1;
  for (const d of dias) if (d.status === "ok") for (const t of E.tax.temas) maxY = Math.max(maxY, (d.por_tema || {})[t.id] || 0);
  for (const t of E.tax.temas) {
    const b = (E.serie.baselines.temas || {})[t.id] || {};
    const mm90 = (E.serie.baselines.mm90_por_tema || {})[t.id] || 0;
    const card = el("div", "sm");
    const topo = el("div", "sm__topo");
    const nome = el("div", "sm__nome"); const cor = el("span"); cor.textContent = "● "; cor.style.color = CORES[t.id];
    nome.append(cor, document.createTextNode(t.rotulo));
    const mult = el("div", "sm__mult num"); const m = b.multiplo;
    mult.textContent = m == null ? "" : (isFinite(m) ? `${m.toFixed(1)}x` : "novo");
    mult.style.color = m >= 1.8 ? "#E8735A" : (m <= 0.5 ? "#4ADE9C" : "#7C8A94");
    topo.append(nome, mult); card.append(topo);
    card.append(sparkTema(dias, t.id, maxY, mm90));
    grid.append(card);
  }
}
function sparkTema(dias, temaId, maxY, mm90) {
  const W = 200, H = 56, P = { t: 4, r: 4, b: 4, l: 4 };
  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}` });
  const xf = (i) => dias.length <= 1 ? W / 2 : P.l + (W - P.l - P.r) * (i / (dias.length - 1));
  const yf = (v) => H - P.b - (H - P.t - P.b) * (v / maxY);
  // faixa média 90d
  if (mm90 > 0) { const y = yf(mm90); svg.append(mk("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: CORES[temaId], "stroke-dasharray": "2 2", opacity: 0.35 })); }
  const pts = dias.map((d, i) => [xf(i), yf(d.status === "ok" ? ((d.por_tema || {})[temaId] || 0) : 0)]);
  svg.append(mk("path", { d: pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" "), fill: "none", stroke: CORES[temaId], "stroke-width": 1.5 }));
  dias.forEach((d, i) => {
    if (d.status !== "ok") return;
    const c = mk("circle", { cx: pts[i][0], cy: pts[i][1], r: 2.5, fill: CORES[temaId], class: "ponto" });
    c.addEventListener("click", () => drillSinais((s) => s.data === d.data && s.tema === temaId, `${rotTema(temaId)} · ${d.data}`));
    svg.append(c);
  });
  return svg;
}

// ---------- 3. Timeline (volume total + releases) ----------
function renderTimeline() {
  const dias = diasPeriodo(); const cont = $("#timeline"); cont.innerHTML = "";
  if (!dias.length) { cont.append(el("div", "vazio", "Sem dados.")); return; }
  const W = 900, H = 200, P = { t: 12, r: 14, b: 24, l: 30 };
  let maxY = 1; for (const d of dias) maxY = Math.max(maxY, d.total || 0);
  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}` });
  const xf = (i) => dias.length <= 1 ? W / 2 : P.l + (W - P.l - P.r) * (i / (dias.length - 1));
  const yf = (v) => H - P.b - (H - P.t - P.b) * (v / maxY);
  grade(svg, W, H, P, maxY, dias, xf);
  for (const ev of E.eventos) {
    const i = dias.findIndex((d) => d.data === ev.data); if (i < 0) continue;
    const x = xf(i);
    svg.append(mk("line", { x1: x, y1: P.t, x2: x, y2: H - P.b, class: "evt-linha" }));
    const tx = mk("text", { x: x + 3, y: P.t + 9, class: "evt-rot" }); tx.textContent = "◆ " + ev.titulo; svg.append(tx);
  }
  const pts = dias.map((d, i) => [xf(i), yf(d.total || 0), d]);
  svg.append(mk("path", { d: pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" "), fill: "none", stroke: "#4ADE9C", "stroke-width": 1.8 }));
  pts.forEach(([x, y, d]) => {
    if (d.status !== "ok") return;
    const c = mk("circle", { cx: x, cy: y, r: 3, fill: d.total ? "#4ADE9C" : "#263038", class: "ponto" });
    const tit = mk("title"); tit.textContent = `${d.data}: ${d.total} sinais`; c.append(tit);
    c.addEventListener("click", () => drillSinais((s) => s.data === d.data, `Dia ${d.data}`));
    svg.append(c);
  });
  cont.append(svg);
}
function grade(svg, W, H, P, maxY, dias, xf) {
  const passos = Math.min(4, Math.max(1, maxY));
  for (let i = 0; i <= passos; i++) {
    const y = P.t + (H - P.t - P.b) * (i / passos);
    svg.append(mk("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: "#263038" }));
    const tx = mk("text", { x: P.l - 5, y: y + 3, "text-anchor": "end", class: "eixo-txt" }); tx.textContent = Math.round(maxY * (1 - i / passos)); svg.append(tx);
  }
  const idxs = dias.length <= 1 ? [0] : [0, Math.floor(dias.length / 2), dias.length - 1];
  for (const i of idxs) { const tx = mk("text", { x: xf(i), y: H - P.b + 14, "text-anchor": "middle", class: "eixo-txt" }); tx.textContent = (dias[i].data || "").slice(5); svg.append(tx); }
}

// ---------- 4. Matriz frequência × severidade ----------
function renderMatriz() {
  const sin = recentesJanela(30); const cont = $("#matriz"); cont.innerHTML = "";
  const porTema = {};
  for (const t of E.tax.temas) porTema[t.id] = { n: 0, alta: 0 };
  for (const s of sin) { if (!porTema[s.tema]) continue; porTema[s.tema].n++; if (s.severidade === "alta") porTema[s.tema].alta++; }
  const ativos = E.tax.temas.filter((t) => porTema[t.id].n > 0);
  if (!ativos.length) { cont.append(el("div", "vazio", "Sem sinais nos últimos 30 dias.")); return; }
  const W = 760, H = 340, P = { t: 16, r: 16, b: 30, l: 40 };
  const maxN = Math.max(...ativos.map((t) => porTema[t.id].n));
  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}` });
  const xf = (n) => P.l + (W - P.l - P.r) * (n / (maxN || 1));
  const yf = (share) => H - P.b - (H - P.t - P.b) * share; // severidade 0..1 (share alta)
  // divisórias e rótulos de ação
  const xm = P.l + (W - P.l - P.r) / 2, ym = P.t + (H - P.t - P.b) / 2;
  svg.append(mk("line", { x1: xm, y1: P.t, x2: xm, y2: H - P.b, class: "quad-linha" }));
  svg.append(mk("line", { x1: P.l, y1: ym, x2: W - P.r, y2: ym, class: "quad-linha" }));
  const quad = [
    ["investigar", P.l + 6, P.t + 14, "start"], ["agir agora", W - P.r - 6, P.t + 14, "end"],
    ["ignorar conscientemente", P.l + 6, H - P.b - 6, "start"], ["melhorar UX", W - P.r - 6, H - P.b - 6, "end"],
  ];
  for (const [txt, x, y, anc] of quad) { const t = mk("text", { x, y, class: "quad-rot", "text-anchor": anc }); t.textContent = txt; svg.append(t); }
  svg.append(rotEixo(W, H, P, "frequência (30d) →", "← severidade"));
  for (const t of ativos) {
    const d = porTema[t.id]; const share = d.alta / d.n;
    const x = xf(d.n), y = yf(share), r = 6 + Math.sqrt(d.n) * 4;
    const c = mk("circle", { cx: x, cy: y, r, fill: CORES[t.id], "fill-opacity": 0.55, stroke: CORES[t.id], class: "ponto" });
    const tit = mk("title"); tit.textContent = `${t.rotulo}: ${d.n} menções, ${d.alta} de severidade alta`; c.append(tit);
    c.addEventListener("click", () => drillSinais((s) => s.tema === t.id && dentro30(s), `${t.rotulo} · 30d`));
    svg.append(c);
    const anc = x > W - P.r - 60 ? "end" : (x < P.l + 60 ? "start" : "middle");
    const lx = anc === "end" ? Math.min(x, W - P.r) : anc === "start" ? Math.max(x, P.l) : x;
    const lab = mk("text", { x: lx, y: y - r - 3, "text-anchor": anc, class: "eixo-txt" }); lab.textContent = t.rotulo; svg.append(lab);
  }
  cont.append(svg);
}
function rotEixo(W, H, P, xtxt, ytxt) {
  const g = mk("g");
  const tx = mk("text", { x: W - P.r, y: H - 6, "text-anchor": "end", class: "eixo-txt" }); tx.textContent = xtxt; g.append(tx);
  const ty = mk("text", { x: 12, y: P.t + 4, class: "eixo-txt" }); ty.textContent = ytxt; g.append(ty);
  return g;
}
const dentro30 = (s) => s.data >= somarDias(ultimaData(), -29);

// ---------- 5. Tabela por jogo ----------
let ordenacao = { col: "n", dir: -1 };
function renderTabelaJogos() {
  const sin = recentesJanela(30).filter((s) => s.jogos && s.jogos.length);
  const tabela = $("#tabelaJogos"); tabela.innerHTML = "";
  const porJogo = {};
  for (const s of sin) for (const j of s.jogos) {
    (porJogo[j] = porJogo[j] || []).push(s);
  }
  const jogos = Object.keys(porJogo);
  if (!jogos.length) { tabela.innerHTML = "<tbody><tr><td class='vazio'>Sem menções com jogo identificado (30d).</td></tr></tbody>"; return; }
  const linhas = jogos.map((j) => {
    const arr = porJogo[j];
    const b = (E.serie.baselines.jogos || {})[j] || {};
    return {
      jogo: j, n: arr.length, delta: b.multiplo == null ? null : b.multiplo,
      sentimento: modo(arr, (s) => s.sentimento), tema: modo(arr, (s) => s.tema), regiao: modo(arr, (s) => s.regiao),
      _sinais: arr,
    };
  });
  const cols = [
    ["jogo", "Jogo", false], ["n", "Menções", true], ["delta", "Δ vs base", true],
    ["sentimento", "Sentimento", false], ["tema", "Tema dom.", false], ["regiao", "Região", false],
  ];
  const thead = el("thead"); const trh = el("tr");
  for (const [k, rot] of cols) {
    const th = el("th", null, rot + (ordenacao.col === k ? (ordenacao.dir < 0 ? " ↓" : " ↑") : ""));
    th.tabIndex = 0;
    const ord = () => { if (ordenacao.col === k) ordenacao.dir *= -1; else ordenacao = { col: k, dir: k === "jogo" ? 1 : -1 }; renderTabelaJogos(); };
    th.addEventListener("click", ord);
    th.addEventListener("keydown", (e) => { if (e.key === "Enter") ord(); });
    trh.append(th);
  }
  thead.append(trh); tabela.append(thead);
  linhas.sort((a, b) => {
    let va = a[ordenacao.col], vb = b[ordenacao.col];
    if (ordenacao.col === "delta") { va = va == null ? -1 : (isFinite(va) ? va : 999); vb = vb == null ? -1 : (isFinite(vb) ? vb : 999); }
    if (typeof va === "string") return ordenacao.dir * va.localeCompare(vb);
    return ordenacao.dir * (va - vb);
  });
  const tb = el("tbody");
  for (const l of linhas) {
    const tr = el("tr"); tr.tabIndex = 0;
    const deltaTxt = l.delta == null ? "—" : (isFinite(l.delta) ? `${l.delta.toFixed(1)}x` : "novo");
    tr.append(td(l.jogo), td(l.n, "n"), td(deltaTxt, "n"), tdTag(l.sentimento, "sent"), td(rotTema(l.tema)), td(l.regiao));
    const abrir = () => drill(l._sinais.map((s) => s.id), `Jogo: ${l.jogo}`);
    tr.addEventListener("click", abrir);
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter") abrir(); });
    tb.append(tr);
  }
  tabela.append(tb);
}
const td = (v, c) => el("td", c || null, String(v));
function tdTag(v) { const c = el("td"); c.append(tagSent(v)); return c; }
function tagSent(s) { const cls = { positivo: "pos", neutro: "neu", negativo: "neg" }[s] || "neu"; return el("span", `tag tag--${cls}`, s || "—"); }

// ---------- 6. Feed de primeira aparição ----------
function renderFeedPrimeira() {
  const sin = E.recentes.filter((s) => s.primeira_aparicao).sort((a, b) => b.data.localeCompare(a.data));
  const cont = $("#feedPrimeira"); cont.innerHTML = "";
  if (!sin.length) { cont.append(el("div", "vazio", "Nenhuma assinatura inédita na janela.")); return; }
  for (const s of sin.slice(0, 30)) cont.append(itemSinal(s));
}

// ---------- 8. Painel de churn ----------
function renderChurn() {
  const sin = E.recentes.filter((s) => s.intencao_churn).sort((a, b) => b.data.localeCompare(a.data));
  const cont = $("#painelChurn"); cont.innerHTML = "";
  if (!sin.length) { cont.append(el("div", "vazio", "Nenhuma intenção de churn declarada na janela.")); return; }
  for (const s of sin.slice(0, 30)) cont.append(itemSinal(s, true));
}

function itemSinal(s, churn) {
  const it = el("div", "item" + (churn ? " item--churn" : ""));
  const meta = el("div", "item__meta");
  const cor = el("span"); cor.textContent = "●"; cor.style.color = CORES[s.tema];
  meta.append(cor, el("span", null, rotTema(s.tema)), tagSent(s.sentimento), el("span", `tag tag--${s.severidade}`, s.severidade));
  if (churn && s.tipo_churn && s.tipo_churn !== "nenhum") meta.append(el("span", "tag", s.tipo_churn.replace("_", " ")));
  if (s.jogos && s.jogos.length) meta.append(el("span", null, s.jogos.join(", ")));
  meta.append(el("span", null, `${s.fonte} · ${s.data}`));
  it.append(meta);
  it.append(el("p", "item__txt", s.resumo));
  const a = el("a", null, "abrir fonte ↗"); a.href = s.url; a.target = "_blank"; a.rel = "noopener noreferrer"; it.append(a);
  return it;
}

// ---------- 7. Coorte de release ----------
function renderCoorte() {
  const cont = $("#coorte"); cont.innerHTML = "";
  const releases = E.eventos.filter((e) => (e.tipo || "release") === "release").sort((a, b) => a.data.localeCompare(b.data));
  if (!releases.length) { $("#secaoCoorte").hidden = false; cont.append(el("div", "vazio", "Sem releases em config/eventos.json. Adicione marcadores para comparar coortes.")); return; }
  const mapaDias = new Map(E.serie.dias.map((d) => [d.data, d]));
  const W = 900, H = 220, P = { t: 12, r: 14, b: 26, l: 30 };
  const paleta = ["#4ADE9C", "#5AA9E8", "#F2C14E", "#B58CE8", "#E8735A"];
  let maxY = 1; const series = [];
  releases.forEach((r, idx) => {
    const pts = [];
    for (let k = 0; k < 14; k++) { const dia = somarDias(r.data, k); const d = mapaDias.get(dia); const v = d && d.status === "ok" ? d.total : 0; maxY = Math.max(maxY, v); pts.push(v); }
    series.push({ titulo: r.titulo, cor: paleta[idx % paleta.length], pts });
  });
  const svg = mk("svg", { viewBox: `0 0 ${W} ${H}` });
  const passos = Math.min(4, Math.max(1, maxY));
  for (let i = 0; i <= passos; i++) { const y = P.t + (H - P.t - P.b) * (i / passos); svg.append(mk("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: "#263038" })); const tx = mk("text", { x: P.l - 5, y: y + 3, "text-anchor": "end", class: "eixo-txt" }); tx.textContent = Math.round(maxY * (1 - i / passos)); svg.append(tx); }
  for (let k = 0; k < 14; k += 2) { const x = P.l + (W - P.l - P.r) * (k / 13); const tx = mk("text", { x, y: H - P.b + 14, "text-anchor": "middle", class: "eixo-txt" }); tx.textContent = "D+" + k; svg.append(tx); }
  const xf = (k) => P.l + (W - P.l - P.r) * (k / 13);
  const yf = (v) => H - P.b - (H - P.t - P.b) * (v / maxY);
  for (const s of series) svg.append(mk("path", { d: s.pts.map((v, k) => (k ? "L" : "M") + xf(k).toFixed(1) + " " + yf(v).toFixed(1)).join(" "), fill: "none", stroke: s.cor, "stroke-width": 1.8 }));
  cont.append(svg);
  const leg = el("div", "item__meta"); leg.style.marginTop = "8px";
  for (const s of series) { const sp = el("span"); const i = el("span"); i.textContent = "▬ "; i.style.color = s.cor; sp.append(i, document.createTextNode(s.titulo)); leg.append(sp); }
  cont.append(leg);
}

// ---------- Drill-down ----------
function drill(ids, titulo) { const set = new Set(ids || []); abrirDrill(E.recentes.filter((s) => set.has(s.id)), titulo); }
function drillSinais(filtro, titulo) { abrirDrill(E.recentes.filter(filtro), titulo); }
function abrirDrill(sinais, titulo) {
  const box = $("#drillConteudo"); box.innerHTML = "";
  box.append(el("h3", null, titulo || "Sinais"));
  box.append(el("p", "muted", `${sinais.length} sinal(is) · cada um com link para a fonte`));
  if (!sinais.length) box.append(el("div", "vazio", "Nada na janela de 90 dias para este recorte."));
  else { const wrap = el("div", "lista"); for (const s of sinais.sort((a, b) => b.data.localeCompare(a.data))) wrap.append(itemSinal(s, s.intencao_churn)); box.append(wrap); }
  $("#drill").hidden = false;
}
function fecharDrill() { $("#drill").hidden = true; }

// ---------- Boot ----------
function renderTudo() {
  renderAbertura(); renderSmallMultiples(); renderTimeline(); renderMatriz();
  renderTabelaJogos(); renderFeedPrimeira(); renderChurn(); renderCoorte();
}
function ligarUI() {
  $("#periodos").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    E.periodo = Number(b.dataset.dias);
    [...$("#periodos").children].forEach((x) => x.classList.toggle("on", x === b));
    renderSmallMultiples(); renderTimeline();
  });
  document.querySelectorAll("[data-fechar]").forEach((x) => x.addEventListener("click", fecharDrill));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharDrill(); });
}
function cabecalho() {
  const a = E.serie.alertas || {};
  const conf = a.confianca_ultima || "media";
  const bc = $("#confianca"); bc.textContent = "confiança " + conf; bc.className = "badge badge--" + conf;
  const st = $("#status");
  if (E.ultimo) st.innerHTML = E.ultimo.status === "ok" ? `<span class="ok">OK</span> · ${E.ultimo.data}` : `<span class="falha">FALHA</span> · ${E.ultimo.data}`;
  const at = a.taxonomia_outros;
  if (at && at.ativo) { const bar = $("#alertaTax"); bar.hidden = false; bar.textContent = `⚠ "outros" está em ${at.outros_pct_30d}% dos sinais nos últimos 30 dias (limiar ${at.limiar}%). A taxonomia provavelmente precisa de um tema novo.`; }
  // custo do mês
  const mes = (ultimaData() || "").slice(0, 7);
  const custo = E.serie.dias.filter((d) => (d.data || "").slice(0, 7) === mes).reduce((s, d) => s + (d.custo_usd || 0), 0);
  $("#custoMes").textContent = `Custo do mês: US$${custo.toFixed(2)}`;
  $("#atualizado").textContent = E.serie.atualizado_em ? `atualizado ${new Date(E.serie.atualizado_em).toLocaleString("pt-BR")}` : "";
}
function estadoVazio() {
  $("#conteudo").innerHTML = `<div class="secao"><div class="centro-vazio">
    <h2>Ainda sem coletas</h2>
    <p class="muted">O histórico começa vazio. Rode a primeira coleta:</p>
    <p><code>node scripts/coletar.mjs</code></p>
    <p class="muted">O painel se preenche sozinho a partir daí.</p></div></div>`;
}

async function iniciar() {
  try {
    const [tax, serie] = await Promise.all([carregar("config/taxonomia.json"), carregar("dados/serie-historica.json")]);
    E.tax = tax; E.serie = serie;
    const [rec, ev, ult] = await Promise.all([
      carregar("dados/sinais-recentes.json", true), carregar("config/eventos.json", true), carregar("dados/ultimo.json", true),
    ]);
    E.recentes = (rec && rec.sinais) || []; E.eventos = (ev && ev.eventos) || []; E.ultimo = ult;
    E.mapa = new Map(E.recentes.map((s) => [s.id, s]));
    cabecalho();
    if (!serie.dias.length) { estadoVazio(); return; }
    renderTudo(); ligarUI();
  } catch (e) {
    document.querySelector("main").innerHTML = `<div class="secao"><h2>Não foi possível carregar os dados</h2><p class="muted">${e.message}</p></div>`;
  }
}
iniciar();
