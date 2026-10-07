import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* Palco de jogos + globo de rotas da home do app desktop.
   Montado dentro do protótipo da home atual (ver src/build.py). Textos em inglês, como o app. */

/* ---------- Jogos ---------- */
// Capas: caixas da Wikipedia (retrato) e, para Throne and Liberty, LoL e Fortnite, a arte do protótipo atual.
// Regiões, servidores e número de rotas são simulados para o protótipo.
const REGIONS = {
  br: { n: 'Brazil', c: [-23.55, -46.63, 'Sao Paulo', 'SAO'] },
  nae: { n: 'NA East', c: [39.04, -77.49, 'Ashburn', 'IAD'] },
  nac: { n: 'NA Central', c: [41.88, -87.63, 'Chicago', 'CHI'] },
  naw: { n: 'NA West', c: [34.05, -118.24, 'Los Angeles', 'LAX'] },
  euw: { n: 'EU West', c: [50.11, 8.68, 'Frankfurt', 'FRA'] },
  eun: { n: 'EU North', c: [59.33, 18.07, 'Stockholm', 'STO'] },
  sea: { n: 'Southeast Asia', c: [1.35, 103.82, 'Singapore', 'SIN'] },
  jp: { n: 'Japan', c: [35.68, 139.69, 'Tokyo', 'TYO'] },
  kr: { n: 'Korea', c: [37.57, 126.98, 'Seoul', 'SEL'] },
  oce: { n: 'Oceania', c: [-33.87, 151.21, 'Sydney', 'SYD'] }
};
const A = 'assets/games/';
const GAMES = [
  { name: 'Throne and Liberty Global', img: A + 'throne-and-liberty.jpg', lanes: 4, regions: ['nae', 'naw', 'euw', 'br'], state: 'on', since: -(41 * 60 + 12) },
  { name: 'League of Legends', img: A + 'league-of-legends.jpg', lanes: 3, regions: ['br', 'nac', 'euw', 'eun', 'kr', 'oce'], state: 'on', since: -(8 * 60 + 40) },
  { name: 'Fortnite', img: A + 'fortnite.jpg', lanes: 4, regions: ['br', 'nae', 'naw', 'euw', 'sea', 'oce'] },
  { name: 'Counter-Strike 2', img: A + 'box-cs2.jpg', lanes: 4, regions: ['br', 'nae', 'naw', 'euw', 'eun', 'sea'] },
  { name: 'Apex Legends', img: A + 'box-apex-legends.jpg', lanes: 3, regions: ['br', 'nae', 'naw', 'euw', 'jp'] },
  { name: 'Dota 2', img: A + 'box-dota-2.jpg', lanes: 3, regions: ['br', 'nae', 'euw', 'sea'] },
  { name: "Tom Clancy's Rainbow Six Siege", img: A + 'box-rainbow-six-siege.jpg', lanes: 4, regions: ['br', 'nae', 'euw', 'sea'] },
  { name: 'Overwatch 2', img: A + 'box-overwatch-2.jpg', lanes: 3, regions: ['nac', 'euw', 'kr'] },
  { name: 'PUBG: Battlegrounds', img: A + 'box-pubg.jpg', lanes: 2, regions: ['nae', 'euw', 'kr', 'sea'] },
  { name: 'Rocket League', img: A + 'box-rocket-league.jpg', lanes: 2, regions: ['br', 'nae', 'euw', 'oce'] },
  { name: 'Naruto Shippuden: Ultimate Ninja Storm 4', img: A + 'box-naruto-storm-4.jpg', lanes: 2, regions: ['nae', 'euw', 'jp'] }
];
// Catálogo para "Add game or app": jogos que ainda não estão no palco (capas da Wikipedia, dados simulados).
const CATALOG = [
  { name: 'Escape from Tarkov', img: A + 'box-tarkov.jpg', lanes: 3, regions: ['nae', 'naw', 'euw', 'eun', 'sea'] },
  { name: 'Destiny 2', img: A + 'box-destiny-2.jpg', lanes: 3, regions: ['nae', 'naw', 'euw', 'jp'] },
  { name: 'World of Warcraft', img: A + 'box-wow.jpg', lanes: 4, regions: ['br', 'nae', 'naw', 'euw', 'kr', 'oce'] },
  { name: 'Path of Exile 2', img: A + 'box-poe2.jpg', lanes: 2, regions: ['br', 'nae', 'euw', 'sea', 'oce'] },
  { name: 'Dead by Daylight', img: A + 'box-dead-by-daylight.jpg', lanes: 2, regions: ['br', 'nae', 'euw', 'jp', 'oce'] },
  { name: 'Elden Ring', img: A + 'box-elden-ring.jpg', lanes: 2, regions: ['nae', 'euw', 'jp'] },
  { name: 'Warframe', img: A + 'box-warframe.jpg', lanes: 3, regions: ['nae', 'euw', 'sea'] },
  { name: 'Ark: Survival Evolved', img: A + 'box-ark.jpg', lanes: 2, regions: ['br', 'nae', 'euw', 'oce'] }
];
GAMES.forEach(g => { g.state = g.state || 'off'; });
// Gabriel (07/10): ao otimizar, o globo mapeia várias rotas possíveis, escolhe as melhores e destaca 1.
// Quantas ficam continua por jogo, até 4 (g.lanes), decisão dele no mesmo dia.

const D = Math.PI / 180;
const toV = (lat, lon, r = 1) => { const p = (90 - lat) * D, th = (lon + 180) * D; return new THREE.Vector3(-r * Math.sin(p) * Math.cos(th), r * Math.cos(p), r * Math.sin(p) * Math.sin(th)); };
const toLL = v => { const n = v.clone().normalize(); const lat = 90 - Math.acos(n.y) / D; let lon = Math.atan2(n.z, -n.x) / D - 180; lon = ((lon % 360) + 540) % 360 - 180; return [lat, lon]; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => x * x * (3 - 2 * x);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

/* ---------- Origem: onde o jogador está ---------- */
// Fuso horário do navegador, sem pedir permissão. No app, usar a geolocalização por IP. Para testar: #tokyo, #london no fim do link.
const CITIES = {
  'America/Sao_Paulo': [-23.55, -46.63, 'Sao Paulo', 'SAO'], 'America/Bahia': [-12.97, -38.5, 'Salvador', 'SSA'], 'America/Fortaleza': [-3.73, -38.52, 'Fortaleza', 'FOR'],
  'America/Recife': [-8.05, -34.88, 'Recife', 'REC'], 'America/Belem': [-1.46, -48.5, 'Belem', 'BEL'], 'America/Manaus': [-3.12, -60.02, 'Manaus', 'MAO'],
  'America/Cuiaba': [-15.6, -56.1, 'Cuiaba', 'CGB'], 'America/Argentina/Buenos_Aires': [-34.6, -58.38, 'Buenos Aires', 'BUE'], 'America/Santiago': [-33.45, -70.67, 'Santiago', 'SCL'],
  'America/Lima': [-12.05, -77.04, 'Lima', 'LIM'], 'America/Bogota': [4.71, -74.07, 'Bogota', 'BOG'], 'America/Mexico_City': [19.43, -99.13, 'Mexico City', 'MEX'],
  'America/New_York': [40.71, -74.0, 'New York', 'NYC'], 'America/Chicago': [41.88, -87.63, 'Chicago', 'CHI'], 'America/Denver': [39.74, -104.99, 'Denver', 'DEN'],
  'America/Los_Angeles': [34.05, -118.24, 'Los Angeles', 'LAX'], 'America/Toronto': [43.65, -79.38, 'Toronto', 'YYZ'],
  'Europe/Lisbon': [38.72, -9.14, 'Lisbon', 'LIS'], 'Europe/London': [51.51, -0.13, 'London', 'LON'], 'Europe/Madrid': [40.42, -3.7, 'Madrid', 'MAD'],
  'Europe/Paris': [48.86, 2.35, 'Paris', 'PAR'], 'Europe/Berlin': [52.52, 13.4, 'Berlin', 'BER'], 'Europe/Warsaw': [52.23, 21.01, 'Warsaw', 'WAW'],
  'Europe/Istanbul': [41.01, 28.98, 'Istanbul', 'IST'], 'Europe/Moscow': [55.76, 37.62, 'Moscow', 'MOW'], 'Africa/Johannesburg': [-26.2, 28.05, 'Johannesburg', 'JNB'],
  'Asia/Dubai': [25.2, 55.27, 'Dubai', 'DXB'], 'Asia/Kolkata': [19.08, 72.88, 'Mumbai', 'BOM'], 'Asia/Singapore': [1.35, 103.82, 'Singapore', 'SIN'],
  'Asia/Manila': [14.6, 120.98, 'Manila', 'MNL'], 'Asia/Tokyo': [35.68, 139.69, 'Tokyo', 'TYO'], 'Asia/Seoul': [37.57, 126.98, 'Seoul', 'SEL'], 'Australia/Sydney': [-33.87, 151.21, 'Sydney', 'SYD']
};
const FALLBACK = { America: 'America/Sao_Paulo', Europe: 'Europe/London', Africa: 'Africa/Johannesburg', Asia: 'Asia/Singapore', Australia: 'Australia/Sydney' };
function findOrigin() {
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const h = slug(decodeURIComponent(location.hash.slice(1)));
  if (h) for (const [tz, c] of Object.entries(CITIES)) if (slug(c[2]) === h || slug(tz.split('/').pop()) === h) return c;
  let tz = 'America/Sao_Paulo';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch { }
  return CITIES[tz] || CITIES[FALLBACK[tz.split('/')[0]]] || CITIES['America/Sao_Paulo'];
}
const origin = findOrigin();
const vO = toV(origin[0], origin[1]);
// Região inicial: a mais próxima a pelo menos ~1.700 km (mesma regra da landing), para a rota ter o que mostrar.
function pickRegion(g) {
  const by = g.regions.map(r => [r, vO.angleTo(toV(REGIONS[r].c[0], REGIONS[r].c[1]))]).sort((a, b) => a[1] - b[1]);
  g.region = (by.find(([, a]) => a > 0.27) || by[0])[0];
}
GAMES.forEach(pickRegion);
// ping estimado com ExitLag até cada servidor (mesma conta da telemetria: ~1,1 ms a cada 100 km + 8 ms)
const estPing = r => Math.round(8 + vO.angleTo(toV(REGIONS[r].c[0], REGIONS[r].c[1])) * 6371 / 100 * 1.1);
const bestRegion = g => g.regions.reduce((b, r) => vO.angleTo(toV(REGIONS[r].c[0], REGIONS[r].c[1])) < vO.angleTo(toV(REGIONS[b].c[0], REGIONS[b].c[1])) ? r : b);

/* ---------- Palco: carrossel ---------- */
const deck = $('pkDeck');
// Sala 360° (referência do Gabriel): as capas formam uma parede curva ao redor da câmera; o anel gira até o jogo ficar de frente.
const ring = document.createElement('div'); ring.className = 'pk-ring'; deck.appendChild(ring);
const SLOTS = 14, STEP = 2 * Math.PI / SLOTS, GAP = 16;
let R = 500, pitch = 240, camV = 0, dragCam = 0;
let N = GAMES.length, moved = false;
function makeCard(g, i) {
  const b = document.createElement('div');
  b.className = 'pk-card'; b.setAttribute('role', 'option'); b.setAttribute('aria-label', g.name);
  b.innerHTML = `<span class="bg" style="background-image:url('${g.img}')"></span><img src="${g.img}" alt="" draggable="false">`;
  const im = b.querySelector('img');
  const fit = () => b.classList.toggle('wide', im.naturalWidth / im.naturalHeight > 1.05);
  if (im.complete) fit(); else im.addEventListener('load', fit);
  b.addEventListener('click', () => { if (!moved) select(i); });
  ring.appendChild(b);
  return b;
}
const cards = GAMES.map(makeCard);
$('pkTotal').textContent = N;
let sel = 0;
const wrapK = k => ((k % N) + N + N / 2) % N - N / 2;
// tamanho da capa (3:4, caixa do jogo) e raio do anel a partir do espaço do palco
function sizeDeck() {
  const W = deck.clientWidth, H = deck.clientHeight - (parseFloat(getComputedStyle(deck).getPropertyValue('--padT')) || 0); // --padT: folga para o brilho, fora da conta da capa
  if (!W || !H) return;
  const ph = Math.round(Math.min(H * 0.72, W * 0.5 / 0.75)), pw = Math.round(ph * 0.75);
  R = (pw / 2 + GAP / 2) / Math.tan(Math.PI / SLOTS); pitch = pw + GAP;
  deck.style.setProperty('--pw', pw + 'px'); deck.style.setProperty('--ph', ph + 'px');
  deck.style.setProperty('--R', R.toFixed(1) + 'px'); deck.style.setProperty('--P', (R * 1.5).toFixed(1) + 'px');
}
new ResizeObserver(sizeDeck).observe(deck); sizeDeck();
// estado (seleção e otimizado); a posição é desenhada quadro a quadro em deckFrame
function layout() {
  cards.forEach((c, i) => {
    c.setAttribute('aria-selected', i === sel ? 'true' : 'false');
    c.classList.toggle('on', GAMES[i].state === 'on');
  });
  if (typeof syncThumbs8 === 'function') syncThumbs8();
}
let deckLast = performance.now();
function deckFrame(now) {
  const dt = Math.min(0.05, (now - deckLast) / 1000); deckLast = now;
  const dragging = dragX !== null && moved;
  if (!dragging) { const d = wrapK(sel - camV); camV += reduce || Math.abs(d) < 0.0005 ? d : d * Math.min(1, dt * 5.5); }
  cards.forEach((c, i) => {
    const th = wrapK(i - camV) * STEP, a = Math.abs(th);
    if (a > 1.95) { c.style.visibility = 'hidden'; return; }
    c.style.visibility = '';
    const lift = i === sel && !dragging ? 18 * (1 - Math.min(1, Math.abs(wrapK(sel - camV)) * 2)) : 0;
    c.style.transform = `rotateY(${(-th).toFixed(4)}rad) translateZ(${(-R + lift).toFixed(1)}px)`;
    c.style.filter = a < 0.08 ? '' : `brightness(${Math.max(0.38, 1 - 0.42 * a).toFixed(3)}) saturate(${Math.max(0.6, 1 - 0.25 * a).toFixed(3)})`;
  });
  requestAnimationFrame(deckFrame);
}
requestAnimationFrame(deckFrame);
// Arrasta com mouse ou dedo; roda horizontal do trackpad; setas do teclado.
let dragX = null;
deck.addEventListener('pointerdown', e => { dragX = e.clientX; moved = false; dragCam = camV; });
addEventListener('pointermove', e => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (!moved && Math.abs(dx) > 6) { moved = true; deck.classList.add('drag'); }
  if (moved) camV = dragCam - dx / pitch;
});
addEventListener('pointerup', () => {
  if (dragX === null) return;
  dragX = null; deck.classList.remove('drag');
  if (moved) { const v = Math.round(camV); select(v); setTimeout(() => { moved = false; }, 0); }
});
let wheelAcc = 0, wheelT = 0;
deck.addEventListener('wheel', e => {
  if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
  e.preventDefault(); wheelAcc += e.deltaX;
  const now = performance.now();
  if (Math.abs(wheelAcc) > 60 && now - wheelT > 350) { select(sel + Math.sign(wheelAcc)); wheelAcc = 0; wheelT = now; }
}, { passive: false });
deck.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { select(sel + 1); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { select(sel - 1); e.preventDefault(); }
  if (e.key === 'Enter' || e.key === ' ') { toggleOpt(); e.preventDefault(); }
  if (e.key === '+') { openAdd(); e.preventDefault(); }
});
$('pkPrev').addEventListener('click', () => select(sel - 1));
$('pkNext').addEventListener('click', () => select(sel + 1));

// Servidor: pill que abre a lista no estilo do input-search
const srv = $('pkSrv'), srvBtn = $('pkSrvBtn'), srvList = $('pkSrvList');
function openSrv(o) { srvList.hidden = !o; srv.classList.toggle('open', o); srvBtn.setAttribute('aria-expanded', o); }
srvBtn.addEventListener('click', e => { e.stopPropagation(); openSrv(srvList.hidden); });
addEventListener('click', e => { if (!srv.contains(e.target)) openSrv(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') openSrv(false); });

const ambs = [$('pkAmbA'), $('pkAmbB')];
let ambI = 0;
function paintInfo() {
  const g = GAMES[sel];
  $('pkTitle').textContent = g.name;
  $('pkPage').textContent = sel + 1;
  $('pkSrvName').textContent = g.auto ? 'Auto · ' + REGIONS[g.region].n : REGIONS[g.region].n;
  // Automatic: a ExitLag escolhe o servidor de menor ping (no protótipo, o mais perto de quem joga) e mostra qual escolheu
  const best = bestRegion(g);
  $('pkSrvItems').innerHTML = `<div class="sl-item pk-auto" role="option" data-r="auto" aria-selected="${!!g.auto}"><span class="sl-name">Automatic</span><span class="t-var">Best route · ${REGIONS[best].n}</span><span class="pk-ms tnum">${estPing(best)} ms</span></div>`
    + g.regions.map(r => `<div class="sl-item" role="option" data-r="${r}" aria-selected="${!g.auto && r === g.region}"><span class="sl-name">${REGIONS[r].n}</span><span class="t-var">${REGIONS[r].c[2]}</span><span class="pk-ms tnum">${estPing(r)} ms</span></div>`).join('');
  $('pkSrvItems').querySelectorAll('.sl-item').forEach(el => el.addEventListener('click', () => {
    const r = el.dataset.r; g.auto = r === 'auto'; g.region = g.auto ? best : r;
    openSrv(false); paintInfo(); rebuild();
  }));
  paintCta();
}
function select(i) {
  i = ((i % N) + N) % N;
  const changed = i !== sel; sel = i;
  openSrv(false); layout(); paintInfo();
  ambI ^= 1; ambs[ambI].style.backgroundImage = `url('${GAMES[sel].img}')`; ambs[ambI].classList.add('on'); ambs[ambI ^ 1].classList.remove('on');
  if (changed || !routes) rebuild();
}

/* ---------- Adicionar jogo: dialog do protótipo com o input-search e a search-list ---------- */
const addMd = $('pkAdd'), addIn = $('pkAddIn'), addList = $('pkAddList'), mdOv = $('md-overlay');
mdOv.after(addMd); // o dialog vive junto do overlay do app, por cima de tudo
const srchIcon = document.querySelector('.search-wrap .search img');
if (srchIcon) $('pkAddIco').src = srchIcon.src;
let addReturn = null;
function renderAdd() {
  const q = addIn.value.trim().toLowerCase();
  const hits = CATALOG.filter(g => g.name.toLowerCase().includes(q));
  addList.innerHTML = hits.length
    ? hits.map(g => `<div class="sl-item" role="option" tabindex="-1" aria-selected="false" data-name="${g.name}"><span class="thumb-md" style="background-image:url('${g.img}')"></span><span class="sl-name">${g.name}</span><span class="t-var">PC</span></div>`).join('')
    : `<p class="pk-add-empty t-var">${CATALOG.length ? `No games match “${addIn.value.trim().replace(/[<&]/g, '')}”.` : 'Every game in this demo is already on your stage.'}</p>`;
}
function openAdd() {
  if (!addMd.hidden) return;
  addReturn = document.activeElement; addIn.value = ''; renderAdd();
  mdOv.hidden = addMd.hidden = false; void addMd.offsetWidth;
  mdOv.classList.add('show'); addMd.classList.add('show');
  document.querySelector('.content').inert = document.querySelector('.sidebar').inert = true;
  addIn.focus({ preventScroll: true });
}
function closeAdd() {
  if (addMd.hidden) return;
  mdOv.classList.remove('show'); addMd.classList.remove('show');
  document.querySelector('.content').inert = document.querySelector('.sidebar').inert = false;
  setTimeout(() => { if (!addMd.classList.contains('show')) { addMd.hidden = true; mdOv.hidden = true; } }, 220);
  addReturn && addReturn.focus({ preventScroll: true });
}
function addGame(name) {
  const at = CATALOG.findIndex(g => g.name === name);
  if (at < 0) return;
  const g = CATALOG.splice(at, 1)[0];
  g.state = 'off'; pickRegion(g);
  GAMES.push(g); cards.push(makeCard(g, GAMES.length - 1)); N = GAMES.length;
  $('pkTotal').textContent = N;
  closeAdd();
  select(N - 1);
  logMsg(`<b>${g.name}</b> added. Press Optimize to route it through ExitLag.`);
}
addIn.addEventListener('input', renderAdd);
addIn.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = addList.querySelector('.sl-item'); if (f) addGame(f.dataset.name); } });
addList.addEventListener('click', e => { const it = e.target.closest('.sl-item'); if (it) addGame(it.dataset.name); });
$('pkAddCancel').addEventListener('click', closeAdd);
$('pkAddBtn')?.addEventListener('click', openAdd);
addEventListener('keydown', e => { if (e.key === 'Escape' && !addMd.hidden) closeAdd(); });

/* ---------- Otimizar: o comportamento da ExitLag ---------- */
const cta = $('pkCta');
const fmtDur = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
const onMsg = g => `Picked the <b>${g.lanes} fastest</b> of ${CANDS.length} possible routes. Your game goes out through all ${g.lanes} at once; the first packet to arrive wins.`;
const IDLE = 'Your game is going through your ISP route only.';
function paintCta() {
  const g = GAMES[sel];
  cta.className = 'btn pk-cta ' + (g.state === 'on' ? 'outlined' : g.state === 'testing' ? 'filled pk-busy' : 'filled');
  if (g.state === 'on') cta.innerHTML = `Stop<span class="tnum" id="pkCtaT">${fmtDur(time - g.since)}</span>`;
  else if (g.state === 'testing') cta.innerHTML = '<span class="loader-sm"></span>Testing routes';
  else cta.textContent = 'Optimize';
  const st = $('pkState');
  st.className = 'badge ' + (g.state === 'on' ? 'success' : 'neutral');
  st.textContent = g.state === 'on' ? 'Optimized' : g.state === 'testing' ? 'Testing routes' : 'Not optimized';
  $('pkLgXl').classList.toggle('off', g.state !== 'on');
  layout();
}
function toggleOpt() {
  const g = GAMES[sel];
  if (g.state === 'testing') return;
  if (g.state === 'on') { g.state = 'off'; xlShow = 0; fail = null; logMsg(IDLE); paintCta(); return; }
  g.state = 'testing'; xlShow = 1; xlStart = time; logMsg(`Mapping ${CANDS.length} possible routes to the game server…`);
  paintCta();
  setTimeout(() => {
    if (g.state !== 'testing') return;
    g.state = 'on'; g.since = time; nextFail = time + 6 + Math.random() * 4;
    if (GAMES[sel] === g) logMsg(onMsg(g));
    paintCta();
  }, reduce ? 300 : 2600);
}
cta.addEventListener('click', toggleOpt);

const logT = $('pkLogT'), logTxt = $('pkLog');
function logMsg(html) {
  const d = new Date(); logT.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
  logTxt.style.opacity = 0; setTimeout(() => { logTxt.innerHTML = html; logTxt.style.opacity = 1; }, 150);
}

/* ---------- Cena: globo ---------- */
THREE.ColorManagement.enabled = false;
const canvas = $('pkGl'), host = canvas.parentElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const PR = Math.min(devicePixelRatio || 1, 2);
renderer.setPixelRatio(PR);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const tilt = new THREE.Group(), globe = new THREE.Group();
tilt.add(globe); scene.add(tilt);
// Céu estrelado (V9): um único Points com cintilação no shader; tamanho fixo em px, sem textura
const stars = (() => {
  const N = 2600, pos = new Float32Array(N * 3), seed = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, r = 40 + Math.random() * 20, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r - 20], i * 3); seed.set([Math.random(), Math.pow(Math.random(), 3)], i * 2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 2));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPR: { value: PR }, uOp: { value: 0 } },
    vertexShader: `attribute vec2 aSeed; uniform float uTime, uPR; varying float vA;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed.x * 1.8) + aSeed.x * 40.0);
        vA = (0.3 + 0.7 * aSeed.y) * tw; gl_PointSize = (1.0 + aSeed.y * 1.8) * uPR; }`,
    fragmentShader: `uniform float uOp; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(vec3(0.82, 0.88, 1.0), vA * uOp * (1.0 - smoothstep(0.15, 0.5, d))); }` });
  const p = new THREE.Points(g, m); p.renderOrder = -1; p.frustumCulled = false; p.visible = false; return p;
})();
scene.add(stars);
const C = { fog: new THREE.Color('#ebeced'), dim: new THREE.Color('#878d97'), route: new THREE.Color('#22eba3'), isp: new THREE.Color('#eb8322'), bad: new THREE.Color('#f52929'),
  deep: new THREE.Color('#07080b'), rim: new THREE.Color('#6f8fb8') };

globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 96, 64), new THREE.ShaderMaterial({
  uniforms: { uDeep: { value: C.deep }, uRim: { value: C.rim } },
  vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uDeep; uniform vec3 uRim; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.-max(dot(vN,vV),0.); gl_FragColor = vec4(mix(uDeep, uRim, pow(f,5.)*.14), 1.); }`
})));
// Atmosfera difusa, sem borda dura (mesma da landing).
const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.6, 96, 64), new THREE.ShaderMaterial({
  uniforms: { uRim: { value: C.rim }, uCenter: { value: new THREE.Vector3() } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform vec3 uRim; uniform vec3 uCenter; varying vec3 vW;
  void main(){ vec3 rd = normalize(vW - cameraPosition); vec3 oc = uCenter - cameraPosition;
    float d = length(cross(rd, oc));
    float i = d > 1. ? exp(-max(d-1., 0.)*7.) : pow(clamp(d, 0., 1.), 10.);
    gl_FragColor = vec4(uRim*i*.26, 1.); }`
}));
atmo.renderOrder = 2; scene.add(atmo);

const raw = Uint8Array.from(atob(window.LAND || ''), c => c.charCodeAt(0));
const u16 = new Uint16Array(raw.buffer);
const nLand = u16.length / 2, landPos = new Float32Array(nLand * 3), landLL = [];
for (let i = 0; i < nLand; i++) { const lat = u16[i * 2] / 100 - 90, lon = u16[i * 2 + 1] / 100 - 180; landLL.push([lat, lon]); toV(lat, lon, 1.003).toArray(landPos, i * 3); }
const landGeo = new THREE.BufferGeometry(); landGeo.setAttribute('position', new THREE.BufferAttribute(landPos, 3));
const landMat = new THREE.ShaderMaterial({
  uniforms: { uSize: { value: 9 }, uPR: { value: PR }, uCol: { value: C.dim } }, transparent: true, depthWrite: false,
  vertexShader: `uniform float uSize; uniform float uPR; varying float vFace; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vFace = dot(normalize(normalMatrix*position), normalize(-mv.xyz)); gl_PointSize = uSize*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uCol; varying float vFace; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; float a = smoothstep(.5,.2,d)*smoothstep(-.05,.45,vFace); gl_FragColor = vec4(uCol*(.55+.45*vFace), a*.9); }`
});
globe.add(new THREE.Points(landGeo, landMat));

// Rede ExitLag ao fundo: pontos de servidor piscando, discretos.
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const servers = Object.values(REGIONS).map(r => [r.c[0], r.c[1]]);
for (let i = 0; i < 240; i++) servers.push(landLL[Math.floor(rnd() * nLand)]);
const svPos = new Float32Array(servers.length * 3), svSeed = new Float32Array(servers.length);
servers.forEach((s, i) => { toV(s[0], s[1], 1.005).toArray(svPos, i * 3); svSeed[i] = rnd(); });
const svGeo = new THREE.BufferGeometry();
svGeo.setAttribute('position', new THREE.BufferAttribute(svPos, 3)); svGeo.setAttribute('aSeed', new THREE.BufferAttribute(svSeed, 1));
const svMat = new THREE.ShaderMaterial({
  uniforms: { uSize: { value: 20 }, uPR: { value: PR }, uTime: { value: 0 }, uCol: { value: C.route }, uOp: { value: 0.5 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uSize; uniform float uPR; attribute float aSeed; varying float vS; varying float vFace; void main(){ vS=aSeed; vec4 mv = modelViewMatrix*vec4(position,1.); vFace = dot(normalize(normalMatrix*position), normalize(-mv.xyz)); gl_PointSize = uSize*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float uTime; uniform vec3 uCol; uniform float uOp; varying float vS; varying float vFace; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; float tw = .5+.5*sin(uTime*1.6+vS*40.); float a = (smoothstep(.5,.0,d)*.35+smoothstep(.14,.0,d))*tw*uOp*smoothstep(0.,.3,vFace); gl_FragColor = vec4(uCol, a); }`
});
globe.add(new THREE.Points(svGeo, svMat));

/* ---------- Rotas ---------- */
const routeVS = `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const routeFS = `uniform vec3 uCol; uniform vec3 uBad; uniform float uDraw; uniform float uOp; uniform float uFail; uniform float uTime; uniform float uSpeed; uniform float uHalo; uniform float uGain;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ float x = vUv.x; if(x>uDraw || uOp<=0.) discard;
  float edge = abs(dot(vN, vV));
  float shape = uHalo > .5 ? pow(edge, 3.)*.35 : .6 + .4*edge;
  float head = smoothstep(uDraw-.1, uDraw, x)*(1.-step(.999,uDraw));
  float ends = smoothstep(0., .03, x)*smoothstep(1., .97, x);
  float pulse = pow(1.-fract(uTime*uSpeed - x*2.), 8.);
  float flick = mix(1., .3+.7*step(.45, fract(sin(floor(uTime*12.)*91.7)*43758.5)), uFail);
  vec3 col = mix(uCol, uBad, uFail);
  float a = uOp*shape*(.55 + .7*head + .6*pulse)*flick*(1.-.4*uFail)*mix(1., ends, .7)*uGain;
  gl_FragColor = vec4(col*(1.+.8*pulse+.6*head), a); }`;
const routeGroup = new THREE.Group(); globe.add(routeGroup);
const MAXL = 4;
// Faixas laterais das rotas ExitLag, de 2 a 4 rotas por jogo.
// Rotas candidatas que o teste mapeia (desvio lateral, altura); as 4 com melhor ping viram as rotas ExitLag.
const CANDS = [[-0.44, 0.9], [-0.32, 1.05], [-0.2, 1.2], [-0.07, 1.3], [0.07, 1.3], [0.2, 1.2], [0.32, 1.05], [0.44, 0.9]];
const seeded = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296; };
const SHAPES = { 2: [[-0.18, 1.1], [0.18, 1.1]], 3: [[-0.28, 1.0], [0, 1.25], [0.28, 1.0]], 4: [[-0.3, 1.0], [-0.1, 1.2], [0.1, 1.2], [0.3, 1.0]] };
let routes = null, vS = new THREE.Vector3(), routeAngle = 1, routeKm = 0, buildT = -10;

function smoothPath(a, b, w, lateral, lift, n = 200) {
  const side = new THREE.Vector3().crossVectors(a, b).normalize(), sw = Math.sin(w), pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, s = Math.sin(Math.PI * u);
    const p = a.clone().multiplyScalar(Math.sin((1 - u) * w) / sw).add(b.clone().multiplyScalar(Math.sin(u * w) / sw));
    p.addScaledVector(side, lateral(u) * w).normalize();
    pts.push(p.multiplyScalar(1.004 + (0.02 + w * 0.2) * lift * s));
  }
  return pts;
}
let routeR = 1; // espessura relativa das rotas: afina quando a câmera chega perto
function makeRoute(pts, color, radius, speed, gain = 1, group = routeGroup) {
  radius *= routeR * 0.5; // metade da espessura original (pedido do Gabriel)
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const uniforms = { uCol: { value: color }, uBad: { value: C.bad }, uDraw: { value: 0 }, uOp: { value: 0 }, uFail: { value: 0 }, uTime: { value: 0 }, uSpeed: { value: speed }, uGain: { value: gain } };
  for (const halo of [0, 1]) {
    const mat = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uHalo: { value: halo } }, vertexShader: routeVS, fragmentShader: routeFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 300, halo ? radius * 4.5 : radius, 10, false), mat));
  }
  return { curve, u: uniforms, len: curve.getLength() };
}
function clearRoutes() { routeGroup.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); routeGroup.clear(); }

// Pacotes que correm pelas rotas. O mesmo pacote sai por todas as rotas ExitLag ao mesmo tempo.
const PK = 10, packetsN = PK * (1 + MAXL);
const pkPos = new Float32Array(packetsN * 3), pkCol = new Float32Array(packetsN * 3), pkA = new Float32Array(packetsN);
const pkGeo = new THREE.BufferGeometry();
pkGeo.setAttribute('position', new THREE.BufferAttribute(pkPos, 3).setUsage(THREE.DynamicDrawUsage));
pkGeo.setAttribute('aCol', new THREE.BufferAttribute(pkCol, 3).setUsage(THREE.DynamicDrawUsage));
pkGeo.setAttribute('aA', new THREE.BufferAttribute(pkA, 1).setUsage(THREE.DynamicDrawUsage));
const packets = new THREE.Points(pkGeo, new THREE.ShaderMaterial({
  uniforms: { uSize: { value: 34 }, uPR: { value: PR } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uSize; uniform float uPR; attribute vec3 aCol; attribute float aA; varying vec3 vC; varying float vA; void main(){ vC=aCol; vA=aA; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = uSize*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); if(d>.5||vA<=0.) discard; float a = (smoothstep(.5,.0,d)*.5 + smoothstep(.14,.0,d))*vA; gl_FragColor = vec4(vC*1.4, a); }`
}));
packets.frustumCulled = false; globe.add(packets);

const mkPos = new Float32Array(6);
const mkGeo = new THREE.BufferGeometry();
mkGeo.setAttribute('position', new THREE.BufferAttribute(mkPos, 3));
mkGeo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array([...C.fog.toArray(), ...C.route.toArray()]), 3));
const mkMat = new THREE.ShaderMaterial({
  uniforms: { uSize: { value: 100 }, uPR: { value: PR }, uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `uniform float uSize; uniform float uPR; attribute vec3 aCol; varying vec3 vC; void main(){ vC=aCol; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = uSize*uPR/(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float uTime; varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); float r = fract(uTime*.6); float ring = smoothstep(.03,.0,abs(d-r*.5))*(1.-r); float core = smoothstep(.09,.05,d); gl_FragColor = vec4(vC, ring*.8+core); }`
});
const markers = new THREE.Points(mkGeo, mkMat); markers.frustumCulled = false; globe.add(markers);

const frame0 = { yaw: 0, pitch: 0, dist: 4, chord: 1 }, cur = { yaw: 0, pitch: 0, dist: 6 };
let xlShow = 0, xlStart = -10;
let scan = null, offY9 = 0; // offY9: a varredura sobe o globo para a barra de status caber embaixo // varredura da biblioteca: ver "Biblioteca" mais abaixo
let boot = null; // login e carregamento (network map): ver "Login e carregamento" mais abaixo

function rebuild() {
  const g = GAMES[sel], sv = REGIONS[g.region].c;
  vS = toV(sv[0], sv[1]);
  routeAngle = vO.angleTo(vS);
  // Jogador e servidor na mesma cidade: afasta o ponto do servidor ~200 km só no desenho, para a rota existir.
  if (routeAngle < 0.03) { vS = toV(sv[0] + 1.2, sv[1] + 1.4); routeAngle = vO.angleTo(vS); }
  routeKm = vO.angleTo(toV(sv[0], sv[1])) * 6371;
  clearRoutes();
  const w = routeAngle;
  frame0.chord = 2 * Math.sin(w / 2) * 1.45; frame0.dist = fitDist();
  routeR = Math.max((frame0.dist - 1) / 2, 0.12); // largura constante na tela (~2,5 px), perto ou longe: fina demais vira pontilhado
  routes = {
    isp: makeRoute(smoothPath(vO, vS, w, u => 0.62 * Math.sin(Math.PI * u) + 0.16 * Math.sin(3 * Math.PI * u), 0.35), C.isp, 0.0032, 0.35),
    cand: CANDS.map(([lat, lift], k) => makeRoute(smoothPath(vO, vS, w, u => lat * Math.sin(Math.PI * u), lift), C.dim, 0.0024, 0.6 + k * 0.03, 0.5)),
    xl: []
  };
  // ping simulado de cada candidata (desvio maior custa mais, mais um sorteio fixo por jogo e servidor); as melhores em ordem: Route 1 é a mais rápida
  const rnd = seeded(g.name + g.region);
  routes.pick = CANDS.map(([lat], k) => [k, Math.abs(lat) * 0.6 + rnd()]).sort((a, b) => a[1] - b[1]).slice(0, g.lanes).map(([k]) => k);
  routes.xl = routes.pick.map((k, i) => { const [lat, lift] = CANDS[k]; return makeRoute(smoothPath(vO, vS, w, u => lat * Math.sin(Math.PI * u), lift), C.route, 0.0032, 0.8 + i * 0.05, 0.42); });
  vO.clone().multiplyScalar(1.006).toArray(mkPos, 0); vS.clone().multiplyScalar(1.006).toArray(mkPos, 3);
  mkGeo.attributes.position.needsUpdate = true;
  const [mLat, mLon] = toLL(vO.clone().add(vS));
  frame0.yaw = (-mLon - 90) * D; frame0.pitch = clamp(mLat, -55, 55) * D;
  buildT = time;
  xlShow = g.state === 'on' || g.state === 'testing' ? 1 : 0; xlStart = time + 0.5;
  fail = null; nextFail = time + 5 + Math.random() * 4;
  baseXl = Math.round(8 + routeKm / 100 * 1.1); baseIsp = Math.round(baseXl * 1.5 + 14);
  hist.isp.length = hist.xl.length = 0; win.length = 0;
  for (let i = 0; i < HN; i++) sample(false);
  $('pkRoute').innerHTML = `${origin[3]} → ${sv[3]}<span class="t-var">${Math.round(routeKm).toLocaleString('en-US')} km</span>`;
  // um chip por rota: estado com ponto + texto (não só cor), ping suavizado, e passar o mouse acende a rota no globo
  $('pkLanes').innerHTML = Array.from({ length: g.lanes }, (_, i) => `<span class="pk-lane idle" data-i="${i}" tabindex="0" data-tip=""><i class="dt"></i><span class="nm">Route ${i + 1}</span><span class="v tnum">–</span></span>`).join('');
  laneEma.fill(0); fastLane = 0;
  $('pkLanes').querySelectorAll('.pk-lane').forEach(el => {
    const i = +el.dataset.i;
    el.addEventListener('pointerenter', () => { hoverLane = i; }); el.addEventListener('pointerleave', () => { hoverLane = -1; });
    el.addEventListener('focus', () => { hoverLane = i; }); el.addEventListener('blur', () => { hoverLane = -1; });
  });
  tagA.innerHTML = `${origin[2]}<span class="t-var">You</span>`;
  tagB.innerHTML = `${sv[2]} · ${sv[3]}<span class="t-var">Game server</span>`;
  logMsg(g.state === 'on' ? onMsg(g) : IDLE);
}

/* ---------- Telemetria simulada ---------- */
// Ping estimado pela distância (≈1 ms de ida e volta a cada 100 km de fibra). Operadora: rota mais longa, picos e perda.
// ExitLag: o mesmo pacote vai por todas as rotas; vale o que chega primeiro, então o pico de uma rota não aparece no resultado.
let baseXl = 40, baseIsp = 74, spike = 0, fail = null, nextFail = 0;
const HN = 140, hist = { isp: [], xl: [] }, win = [];
const laneNow = [0, 0, 0, 0], laneEma = [0, 0, 0, 0];
let fastLane = 0, hoverLane = -1;
function sample(on) {
  const L = GAMES[sel].lanes;
  spike = Math.max(0, spike - 1);
  if (Math.random() < 0.012) { spike = 6 + Math.random() * 10; if (on && time > 2 && !fail) logMsg('Spike on your ISP route. ExitLag was not affected.'); }
  const isp = baseIsp * (1 + (Math.random() - 0.5) * 0.16) + (spike ? baseIsp * (0.35 + Math.random() * 0.5) : 0);
  const ispLost = Math.random() < (spike ? 0.18 : 0.008);
  let best = Infinity, allLost = true;
  for (let i = 0; i < L; i++) {
    const f = fail && fail.lane === i ? fail.k : 0;
    const p = baseXl * (1 + i * 0.035) + (Math.random() - 0.5) * 2.2 + f * baseXl * (0.6 + Math.random() * 0.9);
    const lost = Math.random() < 0.003 + f * 0.35;
    laneNow[i] = p;
    if (!lost) { allLost = false; best = Math.min(best, p); }
  }
  hist.isp.push(isp); hist.xl.push(best === Infinity ? baseXl : best);
  if (hist.isp.length > HN) { hist.isp.shift(); hist.xl.shift(); }
  win.push([ispLost, allLost]); if (win.length > 400) win.shift();
}
const jit = a => { const n = Math.min(40, a.length - 1); let s = 0; for (let i = a.length - n; i < a.length; i++) s += Math.abs(a[i] - a[i - 1]); return n > 0 ? s / n : 0; };
const avg = (a, n = 6) => { const s = a.slice(-n); return s.reduce((x, y) => x + y, 0) / s.length; };
const lossPct = k => win.length ? win.filter(w => w[k]).length / win.length * 100 : 0;
const f1 = v => v.toFixed(1);

function paintTele() {
  const g = GAMES[sel], on = g.state === 'on', L = g.lanes;
  const ip = avg(hist.isp), xp = avg(hist.xl), ij = jit(hist.isp), xj = jit(hist.xl), il = lossPct(0), xl = lossPct(1);
  $('kPing').textContent = Math.round(on ? xp : ip);
  $('kJit').textContent = f1(on ? xj : ij);
  $('kLoss').textContent = f1(on ? xl : il);
  const d = $('kDelta'); d.style.display = on ? '' : 'none'; if (on) d.textContent = '−' + Math.max(0, Math.round((1 - xp / ip) * 100)) + '%';
  $('kPingVs').innerHTML = on ? `vs <em>${Math.round(ip)} ms</em>` : 'Optimize to compare';
  $('kJitVs').innerHTML = on ? `vs <em>${f1(ij)} ms</em>` : '';
  $('kLossVs').innerHTML = on ? `vs <em>${f1(il)}%</em>` : '';
  const failing = on && fail && fail.k > 0.5;
  $('kRoutes').textContent = on ? (failing ? L - 1 : L) : 1;
  $('kRoutesOf').textContent = on ? '/' + L : '';
  $('kRoutesVs').textContent = on ? 'in parallel' : 'ISP only';
  // rota mais rápida com histerese (troca só com 2 ms de vantagem), para o destaque não pular a cada leitura
  for (let i = 0; i < L; i++) laneEma[i] = laneEma[i] ? laneEma[i] * 0.7 + laneNow[i] * 0.3 : laneNow[i];
  const down = i => on && fail && fail.lane === i && fail.k > 0.3;
  let best = -1; for (let i = 0; i < L; i++) if (!down(i) && (best < 0 || laneEma[i] < laneEma[best])) best = i;
  if (down(fastLane) || fastLane >= L || (best >= 0 && laneEma[best] < laneEma[fastLane] - 2)) fastLane = Math.max(0, best);
  [...$('pkLanes').children].forEach((el, i) => {
    const st = !on ? 'idle' : down(i) ? 'bad' : i === fastLane ? 'fast' : 'ok';
    el.className = 'pk-lane ' + st;
    el.querySelector('.v').textContent = st === 'bad' ? 'Unstable' : on ? Math.round(laneEma[i]) + ' ms' : (g.state === 'testing' ? '…' : 'Standby');
    el.dataset.tip = st === 'fast' ? `Route ${i + 1} is the fastest now: its packets arrive first.`
      : st === 'ok' ? `Route ${i + 1} sends the same packets in parallel, as a backup.`
      : st === 'bad' ? `Route ${i + 1} is unstable. The other routes carry your game until it recovers.`
      : 'Optimize to send your game through this route.';
  });
  if (on) { const ct = $('pkCtaT'); if (ct) ct.textContent = fmtDur(time - g.since); }
}
const ispPath = $('pkIspPath'), xlPath = $('pkXlPath');
function drawChart() {
  const on = GAMES[sel].state === 'on', top = baseIsp * 1.7;
  const path = arr => arr.map((v, i) => (i ? 'L' : 'M') + ((i + HN - arr.length) / (HN - 1) * 498).toFixed(1) + ' ' + (32 - Math.min(v, top) / top * 31).toFixed(1)).join('');
  ispPath.setAttribute('d', path(hist.isp)); xlPath.setAttribute('d', on ? path(hist.xl) : '');
}

/* ---------- Rótulos no globo ---------- */
const tagA = document.createElement('div'), tagB = document.createElement('div');
tagA.className = tagB.className = 'pk-tag'; host.append(tagA, tagB);
const v3 = new THREE.Vector3(), camDir = new THREE.Vector3(), nrm = new THREE.Vector3();
function project(v) {
  v3.copy(v).multiplyScalar(1.02); globe.localToWorld(v3);
  camDir.copy(camera.position).sub(v3).normalize(); nrm.copy(v3).normalize();
  const face = nrm.dot(camDir);
  v3.project(camera); // a projeção já inclui o view offset
  return [(v3.x * 0.5 + 0.5) * vw, (-v3.y * 0.5 + 0.5) * vh, face];
}
// Cada rótulo vai para o lado de fora da rota, para os dois nunca se cobrirem.
let tagK = 0; // V9: some com a órbita aberta, para os nomes dos jogos não sobreporem as etiquetas
function placeTags(vis) {
  const a = project(vO), b = project(vS), aLeft = a[0] <= b[0];
  const put = (el, p, left, up) => {
    const y = clamp(p[1] + (up ? -40 : 4), headBottom, vh - bandBottom - 36); // fica na faixa livre, sem cobrir cabeçalho nem widget
    const x = clamp(p[0] + (left ? -12 : 12), bandLeft + (left ? 140 : 0), vw - bandRight - (left ? 0 : 140)); // fora dos painéis da versão
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)` + (left ? ' translateX(-100%)' : '');
    el.style.opacity = vis * clamp(p[2] * 4) * (isV7() && e7 > 0 ? 0 : 1) * (1 - tagK);
  };
  const near = Math.abs(a[1] - b[1]) < 60;
  put(tagA, a, aLeft, near ? a[1] <= b[1] : true); put(tagB, b, !aLeft, near ? b[1] < a[1] : true);
}

/* ---------- Ping da rota no hover (pedido do Gabriel) ----------
   Passar o mouse numa rota do globo mostra o ping dela; nas rotas ExitLag a rota também acende, como no chip do Route Monitoring. */
const rtip = document.createElement('div'); rtip.className = 'pk-tag pk-rtip'; host.append(rtip);
let rHover = null; // { kind: 'xl' | 'isp', i, x, y }
const hitPts = (r, n = 48) => { const out = [], d = r.u.uDraw.value; for (let k = 0; k <= n; k++) { const u = k / n; if (u > d) break; r.curve.getPointAt(u, v3); const p = project(v3.clone().multiplyScalar(1 / 1.02)); if (p[2] > -0.05) out.push(p); } return out; };
function routeAt(px, py) {
  if (!routes || boot || gDrag || (isV7() && (away7 || e7 > 0))) return null;
  const cands = [];
  if (routes.isp.u.uOp.value > 0) cands.push(['isp', 0, routes.isp]);
  if (xlShow) routes.xl.forEach((r, i) => cands.push(['xl', i, r]));
  let best = null, bd = 14 * 14; // até 14 px da linha
  for (const [kind, i, r] of cands) for (const [x, y] of hitPts(r)) { const d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; best = { kind, i, x: px, y: py }; } }
  return best;
}
function paintRtip() {
  if (!rHover) { rtip.style.opacity = 0; return; }
  const on = GAMES[sel].state === 'on', isp = rHover.kind === 'isp';
  const ms = isp ? Math.round(avg(hist.isp)) : Math.round(laneEma[rHover.i] || baseXl * (1 + rHover.i * 0.035));
  const down = !isp && on && fail && fail.lane === rHover.i && fail.k > 0.3;
  const name = isp ? 'ISP route' : `ExitLag · Route ${rHover.i + 1}`;
  const note = isp ? (on ? 'Without ExitLag' : 'Your current route') : down ? 'Unstable' : on && rHover.i === fastLane ? 'Fastest now' : on ? 'Backup in parallel' : 'Testing';
  rtip.className = 'pk-tag pk-rtip ' + (isp ? 'isp' : down ? 'bad' : 'xl');
  rtip.innerHTML = `<span class="rt-v"><i class="dt"></i>${name}<b class="tnum">${down ? '–' : ms + ' ms'}</b></span><span class="t-var">${note}</span>`;
  const x = clamp(rHover.x + 14, 8, vw - rtip.offsetWidth - 8), y = clamp(rHover.y - rtip.offsetHeight - 10, 8, vh - rtip.offsetHeight - 8);
  rtip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; rtip.style.opacity = 1;
}
let rtipLane = false; // o hover do globo só limpa o destaque que ele mesmo acendeu (os chips também usam hoverLane)
function setRHover(h) {
  rHover = h;
  if (h && h.kind === 'xl') { hoverLane = h.i; rtipLane = true; } else if (rtipLane) { hoverLane = -1; rtipLane = false; }
  canvas.style.cursor = h ? 'pointer' : '';
  paintRtip();
}
canvas.addEventListener('pointermove', e => {
  if (e.buttons) return;
  const b = canvas.getBoundingClientRect();
  setRHover(routeAt((e.clientX - b.left) * vw / b.width, (e.clientY - b.top) * vh / b.height));
});
canvas.addEventListener('pointerleave', () => setRHover(null));
setInterval(() => { if (rHover) paintRtip(); }, 250); // o ping muda ao vivo enquanto o mouse está parado na rota

/* ---------- Arrastar o globo ---------- */
let gDrag = null, dYaw = 0, dPitch = 0, lastDrag = -10;
canvas.addEventListener('pointerdown', e => { gDrag = [e.clientX, e.clientY, dYaw, dPitch]; canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag'); });
// Sensibilidade pelo zoom: o ponto do globo sob o cursor acompanha o cursor (com a câmera perto, cada pixel gira bem menos).
const dragRad = () => (cur.dist - 1) * 2 * Math.tan(15 * D) / Math.max(1, vh);
canvas.addEventListener('pointermove', e => { if (!gDrag) return; const k = dragRad(); dYaw = gDrag[2] + (e.clientX - gDrag[0]) * k; dPitch = clamp(gDrag[3] + (e.clientY - gDrag[1]) * k, -0.9, 0.9); lastDrag = time; });
const endDrag = () => { if (!gDrag) return; gDrag = null; canvas.classList.remove('drag'); lastDrag = time; dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw)); };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag); canvas.addEventListener('lostpointercapture', endDrag);
// duplo clique: volta à rota na hora
canvas.addEventListener('dblclick', () => { lastDrag = -10; });

/* ---------- Pós e tamanho ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.5, 0.3);
composer.addPass(bloom);
let vw = 1, vh = 1, bandCut = 0, bandSide = 0, bandLeft = 0, bandRight = 0, headBottom = 0, bandBottom = 0;
// Distância da câmera para a rota inteira caber na faixa livre do globo (entre o cabeçalho e o widget).
function fitDist() {
  if (boot) return boot.dist;
  if (isV7() && (away7 || e7 > 0.35)) return 4.8;
  if (isV8() && !isV9()) return 6;
  if (isV9() && (show9 || scan)) return 5.2; // órbita aberta: o planeta inteiro, com os jogos em volta // V8: o planeta inteiro no centro, com a órbita de jogos em volta // V7 na sidebar: o planeta inteiro na vaga
  const band = Math.max(140, Math.min(vw - bandSide, vh - bandCut) * 0.8), worldPerPx = 2 * Math.tan(15 * D) / vh;
  // a escala vale na superfície do globo (distância − 1): rotas curtas pedem a câmera bem perto
  const fit = 1 + frame0.chord / (band * worldPerPx);
  // V9 fechada: rota curta aproxima o globo (até 2,4, para ainda ler como planeta); rota longa fica no planeta inteiro
  return isV9() ? clamp(fit, 2.4, 5.2) : clamp(fit, 1.22, 7.5);
}
// 1 com a câmera longe; menor perto, para pontos e rotas manterem o tamanho na tela
const zoomK = d => clamp((d - 1) / 3, 0.08, 1);
function resize() {
  if (!canvas.clientWidth || !canvas.clientHeight) return; // canvas escondido (home fora de vista)
  vw = canvas.clientWidth; vh = canvas.clientHeight; // o próprio canvas: na V7 ele sai do palco e voa para a sidebar
  renderer.setSize(vw, vh, false); composer.setSize(vw, vh); composer.setPixelRatio(PR); bloom.resolution.set(vw / 2, vh / 2);
  const headH = host.querySelector('.pk-head').offsetHeight + 24;
  // Área livre do globo em cada versão: o que cobre o canvas à esquerda, à direita e embaixo.
  // V7: widget embaixo · V9: só o cabeçalho
  const v = $('app').dataset.v, teleW = $('pkTele').offsetWidth + 48, teleH = $('pkTele').offsetHeight + 48, lW = $('pkL').offsetWidth;
  const [sideW, leftW, botH] = v === '9' ? [0, 0, headH] : v === '8' ? [0, 0, headH] : [0, 0, teleH - 24];
  const offX = Math.round((sideW - leftW) / 2), offY = Math.round((botH - headH) / 2); camOff = [offX, offY];
  bandCut = botH + headH; bandSide = sideW + leftW; bandLeft = leftW; bandRight = sideW; headBottom = headH + 14; bandBottom = botH;
  camera.aspect = vw / vh; camera.setViewOffset(vw, vh, offX, offY, vw, vh); camera.updateProjectionMatrix();
  frame0.dist = fitDist();
}
new ResizeObserver(resize).observe(canvas);
addEventListener('pk:layout', () => { resize(); sizeDeck(); });

/* ---------- V7: globo da V1 na home; fora dela, vai para a sidebar ----------
   Saindo da home o canvas sai do palco (que some junto com a home) e voa até a vaga redonda da sidebar, acima da versão.
   A vaga é um link para a Home (o próprio protótipo trata data-goto="Home"). Na volta, o globo voa de volta e o canvas retorna ao palco. */
const isV7 = () => $('app').dataset.v === '7';
// raio do globo na tela, em px do canvas (câmera a cur.dist, fov 30°)
const globePxAt = d => Math.tan(Math.asin(1 / Math.max(d, 1.0001))) / Math.tan(15 * D) * vh / 2;
const globePx = () => globePxAt(cur.dist);
let away7 = false, e7 = 0, fly7 = null, camOff = [0, 0], gpStart7 = 0;
function frameV7(dt) {
  const inHost = canvas.parentElement === host;
  if (!isV7()) { if (!inHost) dock7(); if (away7) { away7 = false; $('app').classList.remove('pk-away'); resize(); } e7 = 0; return; }
  const away = $('view-home').hidden;
  if (away !== away7) {
    if (away) gpStart7 = globePx() * 1.06; // tamanho do globo na tela ao sair da home
    away7 = away; frame0.dist = fitDist();
    if (away) viewOff7(true);
    $('app').classList.toggle('pk-away', away); $('sbGlobe').tabIndex = away ? 0 : -1;
  }
  const a = $('app').getBoundingClientRect();
  if (!away) { // o palco está visível: o alvo é onde ele está agora (a home pode ter voltado com outra rolagem)
    const h = host.getBoundingClientRect();
    if (h.width) fly7 = { x: h.left - a.left, y: h.top - a.top, w: h.width, h: h.height };
    if (inHost) { e7 = 0; return; }
  }
  if (!fly7) return;
  if (inHost) { // começa o voo: o canvas vai para o .app com o mesmo tamanho
    $('app').append(canvas);
    Object.assign(canvas.style, { position: 'absolute', inset: 'auto', width: fly7.w + 'px', height: fly7.h + 'px', zIndex: 6, pointerEvents: 'none' });
  }
  // duração fixa (0,7 s) com entrada e saída suaves, em vez de aproximação exponencial que arrasta no fim e encaixa num pulo
  e7 = clamp(e7 + (away ? 1 : -1) * (reduce ? 1 : dt / (window.PK_FLY || 0.7))); // PK_FLY: só para testar em câmera lenta
  if (!away && e7 <= 0.35 && frame0.dist === 4.8) { frame0.dist = fitDist(); viewOff7(false); } // último terço da volta: já entra o enquadramento da rota
  if (!away && e7 === 0) return dock7();
  canvas.style.left = fly7.x + 'px'; canvas.style.top = fly7.y + 'px';
  const sl = $('sbGlobe').getBoundingClientRect(), off = viewOn7 ? camOff : [0, 0];
  const px = fly7.w / 2 - off[0], py = fly7.h / 2 - off[1], gp = globePx() * 1.06;
  const e = e7 < 0.5 ? 4 * e7 ** 3 : 1 - (-2 * e7 + 2) ** 3 / 2;
  // ida: o raio do globo na tela vai direto do tamanho da home ao da vaga, mesmo com a câmera se afastando ao mesmo tempo
  // (antes ele inchava no começo); volta: escala 1 no fim, para encaixar sem pulo
  const s = away && gpStart7 ? (gpStart7 + (sl.width / 2 - gpStart7) * e) / gp : 1 + ((sl.width / 2) / gp - 1) * e;
  const tx = (sl.left - a.left + sl.width / 2 - (fly7.x + px)) * e, ty = (sl.top - a.top + sl.height / 2 - (fly7.y + py)) * e;
  canvas.style.transformOrigin = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
  canvas.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  // recorte: círculo na sidebar; perto do palco ele se abre até o quadro inteiro e soma o degradê da esquerda da V1,
  // para o encaixe final não trocar de máscara num pulo
  // na ida a home já sumiu: o globo sai recortado em círculo desde o primeiro quadro (sem o fundo do canvas);
  // na volta o círculo se abre até o quadro inteiro para encaixar no palco
  // na volta o círculo só se abre no último quarto, quando o canvas já está sobre o palco (antes ele mostrava o quadro escuro no meio do caminho)
  // borda do círculo em degradê, rente ao globo: sem anel escuro do fundo do canvas em volta dele na sidebar
  const open = away ? 0 : clamp(1 - e7 / 0.25) ** 2, R1 = gp * 0.98;
  const rad = R1 + (Math.hypot(fly7.w, fly7.h) - R1) * open, soft = gp * 0.14 + 70 * open;
  // furo no lugar do Route Monitoring: no palco o widget fica por cima do globo; em voo o canvas está acima de tudo,
  // então o recorte tira a área do widget (convertida para o espaço do canvas, antes do transform)
  const t = $('pkTele').getBoundingClientRect(), cx0 = a.left + fly7.x, cy0 = a.top + fly7.y;
  const loc = (X, Y) => [(X - cx0 - tx - px) / s + px, (Y - cy0 - ty - py) / s + py];
  const [hx, hy] = loc(t.left, t.top), [hx2, hy2] = loc(t.right, t.bottom), hw = t.width ? hx2 - hx : 0, hh = t.width ? hy2 - hy : 0;
  const circle = `radial-gradient(circle at ${px.toFixed(1)}px ${py.toFixed(1)}px, #000 ${rad.toFixed(1)}px, transparent ${(rad + soft).toFixed(1)}px)`;
  // Longe do palco basta o círculo, numa camada só: máscara de várias camadas com composição não funciona em todo navegador
  // (no app do Gabriel ela era ignorada e o quadro escuro do canvas aparecia em volta do globo na sidebar)
  if (away || !t.width || e7 > 0.4) {
    ['webkitMaskSize', 'maskSize', 'webkitMaskPosition', 'maskPosition', 'webkitMaskRepeat', 'maskRepeat', 'webkitMaskComposite', 'maskComposite'].forEach(k => canvas.style[k] = '');
    canvas.style.webkitMaskImage = canvas.style.maskImage = circle; return;
  }
  const m = `${circle}, linear-gradient(90deg, rgba(0,0,0,${e.toFixed(3)}), #000 28%), linear-gradient(#000, #000)`;
  Object.assign(canvas.style, { webkitMaskImage: m, maskImage: m,
    webkitMaskSize: `auto, auto, ${hw.toFixed(1)}px ${hh.toFixed(1)}px`, maskSize: `auto, auto, ${hw.toFixed(1)}px ${hh.toFixed(1)}px`,
    webkitMaskPosition: `0 0, 0 0, ${hx.toFixed(1)}px ${hy.toFixed(1)}px`, maskPosition: `0 0, 0 0, ${hx.toFixed(1)}px ${hy.toFixed(1)}px`,
    webkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
    webkitMaskComposite: 'source-in, source-out', maskComposite: 'intersect, subtract' });
}
// deslocamento da câmera da V1 (globo acima do widget); na sidebar o globo fica centrado
let viewOn7 = true;
function viewOff7(away) {
  viewOn7 = !away;
  camera.setViewOffset(vw, vh, away ? 0 : camOff[0], away ? 0 : camOff[1], vw, vh); camera.updateProjectionMatrix();
}
function dock7() {
  host.prepend(canvas); e7 = 0;
  ['position', 'inset', 'left', 'top', 'width', 'height', 'zIndex', 'transform', 'transformOrigin', 'webkitMask', 'mask', 'webkitMaskImage', 'maskImage', 'webkitMaskComposite', 'maskComposite', 'webkitMaskSize', 'maskSize', 'webkitMaskPosition', 'maskPosition', 'webkitMaskRepeat', 'maskRepeat', 'pointerEvents'].forEach(k => canvas.style[k] = '');
}

/* ---------- V8: globo no centro, jogos em órbita ----------
   Miniaturas dos jogos giram devagar numa elipse em volta do globo (para no hover); otimizados têm a bolinha verde.
   Clicar num jogo abre o painel à direita (nome, servidor, Optimize/Stop e Route Monitoring) e o globo desliza para a esquerda. */
const ICONS = { 'Fortnite': 'fortnite.png', 'Dota 2': 'dota-2.png', 'Overwatch 2': 'overwatch-2.png' };
const isV8 = () => ['8', '9'].includes($('app').dataset.v); // a V9 reaproveita a órbita da V8
const isV9 = () => $('app').dataset.v === '9';
let panel8 = false, off8 = 0, a8 = -Math.PI / 2, hover8 = false;
const orbit = document.createElement('div'); orbit.className = 'pk-orbit'; orbit.setAttribute('role', 'listbox'); orbit.setAttribute('aria-label', 'Games');
const thumbs = GAMES.map((g, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pk-thumb'; b.setAttribute('role', 'option'); b.setAttribute('aria-label', g.name); b.dataset.tip = g.name;
  // ícone oficial quando há (Wikipedia); nos demais, recorte quadrado da arte da capa
  const ic = ICONS[g.name]; if (!ic) b.classList.add('crop');
  b.innerHTML = `<img src="${ic ? 'assets/icons/' + ic : g.img}" alt="" draggable="false">`;
  b.addEventListener('click', () => { if (sel === i && panel8) setPanel8(false); else { select(i); setPanel8(true); } });
  orbit.append(b); return b;
});
orbit.addEventListener('pointerenter', () => hover8 = true); orbit.addEventListener('pointerleave', () => hover8 = false);
$('pk').append(orbit);
function syncThumbs8() { thumbs.forEach((t, i) => { t.classList.toggle('on', GAMES[i].state === 'on'); t.setAttribute('aria-selected', i === sel && panel8 ? 'true' : 'false'); }); }
const close8 = document.createElement('button'); close8.type = 'button'; close8.className = 'icon-btn pk-close8'; close8.setAttribute('aria-label', 'Close details');
close8.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
close8.addEventListener('click', () => setPanel8(false));
document.querySelector('.pk-r1').append(close8);
function setPanel8(o) { panel8 = o; $('app').classList.toggle('pk-p8', o); syncThumbs8(); if (!o) openSrv(false); }
addEventListener('keydown', e => { if (e.key === 'Escape' && isV8() && panel8) setPanel8(false); });
syncThumbs8();
// V9: as capas ficam escondidas; só a do jogo em destaque aparece, parada na frente do globo.
// Com o mouse sobre o globo a órbita abre numa mola (raio cresce com leve overshoot) e as capas entram em cascata a partir do destaque.
let show9 = false, r9 = 0, v9 = 0, orbR = [1, 1, 0, 0];
$('pk').addEventListener('pointermove', e => {
  if (!isV9() || boot || scan) return;
  const b = canvas.getBoundingClientRect(), k = b.width / vw, [rx, ry, cx, cy] = orbR;
  const dx = (e.clientX - b.left) / k - cx, dy = (e.clientY - b.top) / k - cy, m = show9 ? 70 : 10;
  const inside = (dx / (rx + m)) ** 2 + (dy / (ry + m)) ** 2 < 1;
  if (inside !== show9) setShow9(inside);
});
$('pk').addEventListener('pointerleave', () => { if (isV9()) setShow9(false); });
const name9 = document.createElement('div'); name9.className = 'pk-name9'; name9.setAttribute('aria-hidden', 'true'); orbit.append(name9);
function setShow9(o) {
  show9 = o; $('app').classList.toggle('pk-show9', o); frame0.dist = fitDist();
  // cascata: abrindo, saem de trás do globo a partir dos vizinhos do destaque; fechando, voltam na ordem inversa
  const n = thumbs.length, now = performance.now(), dm = Math.floor(n / 2);
  thumbs.forEach((t, i) => { const d = Math.min((i - sel + n) % n, (sel - i + n) % n); at9[i] = now + (o ? (d - 1) * 60 : (dm - d) * 28); t.classList.toggle('show', o); });
}
// estado por capa: p = 0 escondida atrás do globo, 1 na órbita (mola); h = expansão no hover da própria capa
const p9 = thumbs.map(() => 0), pv9 = thumbs.map(() => 0), tg9 = thumbs.map(() => 0), at9 = thumbs.map(() => 0), h9 = thumbs.map(() => 0), hv9 = thumbs.map(() => 0);
let hov9 = -1;
thumbs.forEach((t, i) => { t.addEventListener('pointerenter', () => { hov9 = i; $('app').classList.add('pk-hov9'); }); t.addEventListener('pointerleave', () => { if (hov9 === i) { hov9 = -1; $('app').classList.remove('pk-hov9'); } }); });
// V9: menu do canto superior esquerdo abre e fecha a sidebar
const bar9 = document.createElement('div'); bar9.className = 'v9-bar';
bar9.innerHTML = '<button class="icon-btn v9-menu" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>';
const logo9 = document.querySelector('.sidebar .logo'); if (logo9) bar9.append(logo9.cloneNode(true));
$('app').append(bar9);
const menu9 = bar9.querySelector('.v9-menu');
menu9.addEventListener('click', () => { const o = !$('app').classList.contains('sb-open'); $('app').classList.toggle('sb-open', o); menu9.setAttribute('aria-expanded', o); });
const wrapPi = a => Math.atan2(Math.sin(a), Math.cos(a));
function frameV8(dt) {
  const st = stars.material.uniforms, v9on = isV9();
  stars.visible = v9on || st.uOp.value > 0.01; st.uOp.value += ((v9on ? 1 : 0) - st.uOp.value) * Math.min(1, dt * 2.5); st.uTime.value += dt;
  if (!isV8()) { if (off8 || $('pkTele').style.top) { off8 = 0; bandRight = 0; $('pkTele').style.top = ''; resize(); } return; }
  const pw = $('pkL').offsetWidth + (v9on ? 48 : 32);
  // o globo e a órbita deslizam para a esquerda quando o painel abre
  const tgt = panel8 ? pw / 2 : 0, k = reduce ? 1 : 1 - Math.exp(-dt * 6);
  if (Math.abs(tgt - off8) > 0.3) { off8 += (tgt - off8) * k; camera.setViewOffset(vw, vh, off8, camOff[1], vw, vh); camera.updateProjectionMatrix(); }
  bandRight = panel8 ? pw : 0;
  $('pkTele').style.top = ($('pkL').offsetTop + $('pkL').offsetHeight) + 'px';
  tagK += ((v9on && (show9 || scan) ? 1 : 0) - tagK) * Math.min(1, dt * 8);
  const n = thumbs.length, step = Math.PI * 2 / n;
  if (v9on) {
    // o destaque vai para a frente (embaixo do globo) numa rotação suave
    a8 += wrapPi(Math.PI / 2 - sel * step - a8) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
    // mola criticamente amortecida, um pouco abaixo do crítico para um leve respiro no fim
    const tr = show9 || scan ? 1 : 0;
    if (reduce) { r9 = tr; v9 = 0; } else { v9 += ((tr - r9) * 170 - v9 * 21) * dt; r9 += v9 * dt; }
  } else if (!hover8 && !panel8 && !reduce) a8 += dt * 0.035;
  // V9: a órbita usa o tamanho do planeta inteiro (5,2), para não mudar quando o globo aproxima numa rota curta; o recorte usa o tamanho real
  const gpR = globePx(), gp = v9on ? globePxAt(5.2) : gpR, cx = vw / 2 - off8, cy = vh / 2 - camOff[1] - offY9;
  let ry = Math.min(gp * 1.32, vh / 2 - (v9on ? 128 + offY9 / 2 : 44)), rx = Math.min(Math.max(gp * 1.7, ry * 1.25), (vw - bandRight) / 2 - 44);
  orbR = [rx, ry, cx, cy];
  if (v9on) { const e0 = Math.min(1, (gp + 64) / ry), e = e0 + (1 - e0) * r9; rx *= e; ry *= e; } // fechada: o destaque fica logo abaixo do globo
  const now = performance.now(), lab = v9on && !scan ? (hov9 >= 0 ? hov9 : sel) : -1;
  thumbs.forEach((t, i) => {
    let a = a8 + i * step, x, y, sc;
    if (v9on) {
      if (scan) tg9[i] = scan.shown[i] ? 1 : 0; // varredura: cada jogo sai de trás do globo quando é encontrado
      else if (i === sel) tg9[i] = 1; else if (now >= at9[i]) tg9[i] = show9 ? 1 : 0;
      if (reduce) { p9[i] = tg9[i]; pv9[i] = 0; } else { pv9[i] += ((tg9[i] - p9[i]) * 95 - pv9[i] * 15) * dt; p9[i] = Math.max(0, p9[i] + pv9[i] * dt); }
      const th = i === hov9 ? 1 : 0;
      if (reduce) h9[i] = th; else { hv9[i] += ((th - h9[i]) * 260 - hv9[i] * 24) * dt; h9[i] += hv9[i] * dt; }
      // sai do centro (escondida pelo disco do globo) girando um pouco até o lugar na órbita
      const e = p9[i]; a -= (1 - Math.min(e, 1)) * 0.55;
      const sn = Math.sin(a), d = (sn + 1) / 2;
      x = cx + Math.cos(a) * rx * e; y = cy + sn * ry * e;
      sc = (0.82 + 0.18 * d) * (i === sel && !scan ? 1.18 + 0.5 * Math.max(r9, 0) : 1) * (1 + (i === sel ? 0.15 : 0.42) * h9[i]); // aberta: o jogo do globo cresce para se destacar dos outros
      t.style.zIndex = i === hov9 ? 40 : i === sel ? 30 : 10 + Math.round(d * 10);
      t.style.visibility = e < 0.02 ? 'hidden' : '';
      if (t.dataset.tip) delete t.dataset.tip; // o nome vem no rótulo embaixo da capa
      // o disco do globo recorta a capa enquanto ela está atrás dele
      const w = t.offsetWidth, h = t.offsetHeight, r = gpR - 2;
      if ((i !== sel || scan) && p9[i] < 0.995 && Math.hypot(Math.max(Math.abs(x - cx) - w * sc / 2, 0), Math.max(Math.abs(y - cy) - h * sc / 2, 0)) < r) {
        const m = `radial-gradient(circle at ${((cx - x) / sc + w / 2).toFixed(1)}px ${((cy - y) / sc + h / 2).toFixed(1)}px, transparent ${(r / sc - 1).toFixed(1)}px, #000 ${(r / sc + 1).toFixed(1)}px)`;
        t.style.webkitMaskImage = m; t.style.maskImage = m;
      } else if (t.style.maskImage) { t.style.webkitMaskImage = ''; t.style.maskImage = ''; }
    } else {
      const sn = Math.sin(a), d = (sn + 1) / 2; // d: 0 atrás (em cima), 1 na frente (embaixo)
      x = cx + Math.cos(a) * rx; y = cy + sn * ry;
      sc = (0.82 + 0.18 * d) * (t.getAttribute('aria-selected') === 'true' ? 1.18 : 1);
      t.style.zIndex = 10 + Math.round(d * 10);
      if (!t.dataset.tip) t.dataset.tip = GAMES[i].name;
      if (t.style.maskImage || t.style.visibility) { t.style.webkitMaskImage = ''; t.style.maskImage = ''; t.style.visibility = ''; }
    }
    t.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${sc.toFixed(3)})`;
    t.classList.toggle('sel9', i === sel);
    // V9: nome sob a capa: o destaque fora do hover, ou a capa sob o mouse
    if (i === lab) { if (name9.textContent !== GAMES[i].name) name9.textContent = GAMES[i].name;
      name9.style.transform = `translate(${x.toFixed(1)}px, ${(y + t.offsetHeight * sc / 2 + 8).toFixed(1)}px) translateX(-50%)`; }
  });
}

/* ---------- Login e carregamento (network map) ----------
   Pedido do Gabriel: uma versão do login e do carregamento com a análise de rotas.
   Login sobre o mesmo globo do Immersive, girando devagar à direita; ao entrar, o formulário dá lugar ao network map:
   localiza você, traça rotas até as regiões de servidores, mede o ping de cada uma e escolhe as melhores.
   No fim o globo volta ao centro e a home do Immersive entra por cima, já com a rota do jogo em destaque. */
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const bootEl = document.createElement('div'); bootEl.className = 'boot'; bootEl.setAttribute('aria-live', 'polite');
bootEl.innerHTML = `
  <div class="boot-win"></div>
  <form class="boot-login" id="bootLogin" novalidate aria-labelledby="bootT">
    <div class="bl-brand"></div>
    <div class="bl-head"><h1 id="bootT">Welcome back</h1><p class="t-var">Sign in to keep your games stable.</p></div>
    <div class="bl-fields">
      <label class="bf"><span class="bf-l">Email</span><span class="bf-in"><input type="email" id="bootEmail" value="player@email.com" autocomplete="username" required></span></label>
      <label class="bf"><span class="bf-l">Password</span><span class="bf-in"><input type="password" id="bootPass" value="exitlag-demo" autocomplete="current-password" required><button class="icon-btn bf-eye" type="button" id="bootEye" aria-label="Show password" aria-pressed="false">${EYE}</button></span></label>
      <p class="bf-err" id="bootErr" hidden>Enter your email and password.</p>
    </div>
    <div class="bl-row"><span class="bl-rem"><button class="toggle on" type="button" role="switch" aria-checked="true" id="bootRem" aria-labelledby="bootRemL"><i></i></button><span id="bootRemL">Remember me</span></span><a class="link" href="#" id="bootForgot">Forgot password?</a></div>
    <button class="btn filled bl-go" type="submit">Sign in</button>
    <div class="bl-or"><span>or continue with</span></div>
    <div class="bl-social"><button class="btn outlined" type="button" data-sso>Google</button><button class="btn outlined" type="button" data-sso>Discord</button><button class="btn outlined" type="button" data-sso>Steam</button></div>
    <p class="bl-new t-var">New to ExitLag? <a class="link" href="#" id="bootTrial">Start your free trial</a></p>
  </form>
  <section class="boot-scan" aria-labelledby="bsT">
    <span class="badge neutral bs-badge"><span class="live-dot"></span>Network map</span>
    <div class="bs-head"><h2 id="bsT">Locating you</h2><p class="t-var" id="bsSub"></p></div>
    <div class="bs-bar" role="progressbar" aria-label="Route analysis" aria-valuemin="0" aria-valuemax="100"><i id="bsBar"></i></div>
    <ol class="bs-steps" id="bsSteps"><li>Locate you</li><li>Map server regions</li><li>Test every route</li><li>Choose the best routes</li></ol>
    <div class="bs-list" id="bsList" role="list"></div>
    <button class="link bs-skip" type="button" id="bsSkip">Skip</button>
  </section>
  <div class="pk-tag boot-tag" id="bootTag"></div>`;
$('app').append(bootEl);
{ // marca e controles da janela vêm do próprio protótipo
  const lg = document.querySelector('.sidebar .logo'); if (lg) bootEl.querySelector('.bl-brand').append(lg.cloneNode(true));
  const win = document.querySelectorAll('.topbar .btn-group'); if (win.length) bootEl.querySelector('.boot-win').append(win[win.length - 1].cloneNode(true));
}
const bootRows = Object.entries(REGIONS);
$('bsList').innerHTML = bootRows.map(([k, r]) => `<div class="bs-row" role="listitem" data-r="${k}"><i class="dt"></i><span class="bs-n">${r.n}</span><span class="t-var">${r.c[2]}</span><span class="bs-ms tnum">–</span></div>`).join('');
const bootGroup = new THREE.Group(); globe.add(bootGroup);
$('bootEye').addEventListener('click', e => { const b = e.currentTarget, show = b.getAttribute('aria-pressed') !== 'true'; $('bootPass').type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); });
$('bootRem').addEventListener('click', e => { const t = e.currentTarget, on = !t.classList.contains('on'); t.classList.toggle('on', on); t.setAttribute('aria-checked', on); });
['bootForgot', 'bootTrial'].forEach(id => $(id).addEventListener('click', e => e.preventDefault()));
bootEl.querySelectorAll('[data-sso]').forEach(b => b.addEventListener('click', () => scanBoot()));
$('bootLogin').addEventListener('submit', e => {
  e.preventDefault();
  const ok = /.+@.+\..+/.test($('bootEmail').value) && $('bootPass').value.length > 0;
  $('bootErr').hidden = ok; if (ok) scanBoot();
});
$('bsSkip').addEventListener('click', () => { if (boot && boot.phase === 'scan') boot.t = Math.max(boot.t, 6.2); });

function startBoot() {
  if (boot) endBoot(); if (scan) endScan();
  setV('9'); history.replaceState(null, '', '#login');
  vchips.forEach(c => c.setAttribute('aria-pressed', c.dataset.boot ? 'true' : 'false'));
  setPanel8(false); setShow9(false); $('app').classList.remove('sb-open');
  // globo à direita, girando devagar, centrado em você
  const [lat, lon] = [origin[0], origin[1]];
  boot = { phase: 'login', t: 0, dist: 5.2, off: 0, yaw0: (-lon - 90) * D + 0.6, pitch: clamp(lat, -40, 40) * D * 0.6, arcs: [], best: [] };
  $('app').dataset.boot = 'login'; $('app').classList.remove('boot-out');
  $('bootErr').hidden = true; $('bsBar').style.width = '0%';
  [...$('bsSteps').children].forEach(li => li.className = '');
  [...$('bsList').children].forEach(r => { r.className = 'bs-row'; r.querySelector('.bs-ms').textContent = '–'; });
  $('bsList').style.order = ''; bootRows.forEach((_, i) => $('bsList').children[i].style.order = i);
  frame0.dist = boot.dist;
  setTimeout(() => $('bootEmail').focus({ preventScroll: true }), 400);
}
function scanBoot() {
  if (!boot || boot.phase !== 'login') return;
  boot.phase = 'scan'; boot.t = 0; $('app').dataset.boot = 'scan';
  $('bsSub').textContent = '';
  // uma rota (arco) até cada região de servidores; o ping simulado é o mesmo da home (distância), com um pequeno sorteio
  const saveR = routeR; routeR = (4.4 - 1) / 2;
  boot.arcs = bootRows.map(([k, r], i) => {
    let v = toV(r.c[0], r.c[1]), w = vO.angleTo(v);
    if (w < 0.03) { v = toV(r.c[0] + 1.2, r.c[1] + 1.4); w = vO.angleTo(v); }
    const side = (i % 2 ? 1 : -1) * 0.12; // arcos baixos e levemente curvos, alternando o lado, para não virarem raios saindo do globo
    const a = makeRoute(smoothPath(vO, v, w, u => side * Math.sin(Math.PI * u), 0.3), C.dim.clone(), 0.0026, 0.5 + i * 0.03, 0.6, bootGroup);
    return { ...a, k, ms: estPing(k) + Math.round(Math.random() * 6), w };
  });
  routeR = saveR;
  // as melhores: as 3 de menor ping
  boot.best = [...boot.arcs].sort((a, b) => a.ms - b.ms).slice(0, 3).map(a => a.k);
  boot.dist = 4.4; frame0.dist = boot.dist;
}
// sai do fluxo: limpa as rotas do mapa e devolve o globo à home
function endBoot(keepHash) {
  if (!boot) return;
  bootGroup.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); bootGroup.clear();
  boot = null; delete $('app').dataset.boot;
  camera.setViewOffset(vw, vh, off8, camOff[1], vw, vh); camera.updateProjectionMatrix();
  if (!keepHash && location.hash === '#login') history.replaceState(null, '', '#v' + $('app').dataset.v);
  vchips.forEach(c => c.setAttribute('aria-pressed', c.dataset.v === $('app').dataset.v ? 'true' : 'false'));
  rebuild(); frame0.dist = fitDist();
}
const BOOT_STEPS = [[0, 'Locating you'], [1.1, 'Mapping server regions'], [2.8, 'Testing every route'], [5.0, 'Choosing the best routes'], [6.2, 'Ready']];
function frameBoot(dt) {
  routeGroup.visible = packets.visible = markers.visible = !boot && !scan;
  if (!boot) return;
  boot.t += dt; const t = boot.t;
  tagA.style.opacity = tagB.style.opacity = 0;
  // globo à direita no login e no mapa; no fim volta ao centro
  const offT = boot.phase === 'out' ? 0 : -Math.round(vw * 0.15);
  boot.off += (offT - boot.off) * (reduce ? 1 : 1 - Math.exp(-dt * 3));
  camera.setViewOffset(vw, vh, off8 + boot.off, camOff[1], vw, vh); camera.updateProjectionMatrix();
  // rótulo "você" na sua cidade
  const tg = $('bootTag'), p = project(vO);
  tg.innerHTML = `${origin[2]}<span class="t-var">You</span>`;
  tg.style.transform = `translate(${Math.round(p[0] + 12)}px, ${Math.round(p[1] - 40)}px)`;
  tg.style.opacity = boot.phase === 'scan' ? clamp(p[2] * 4) * clamp((t - 0.4) / 0.4) : 0;
  if (boot.phase === 'login') {
    frame0.yaw = boot.yaw0 + (reduce ? 0 : Math.sin(time * 0.05) * 0.5); frame0.pitch = boot.pitch;
    return;
  }
  // mapa: o globo para em você e afasta um pouco enquanto as rotas são medidas
  frame0.yaw = (-origin[1] - 90) * D; frame0.pitch = clamp(origin[0], -55, 55) * D;
  const st = BOOT_STEPS.filter(([s]) => t >= s).length - 1;
  if (boot.phase === 'scan') {
    if ($('bsT').textContent !== BOOT_STEPS[st][1]) $('bsT').textContent = BOOT_STEPS[st][1];
    const sub = st === 0 ? `${origin[2]} · finding your ISP route` : st === 1 ? '1,500+ servers in 10 regions' : st === 2 ? 'Sending test packets on each route' : st === 3 ? 'Comparing ping, jitter and packet loss' : `${boot.best.length} best routes are ready`;
    if ($('bsSub').textContent !== sub) $('bsSub').textContent = sub;
    [...$('bsSteps').children].forEach((li, i) => li.className = i < st ? 'done' : i === st ? 'now' : '');
    const pr = clamp(t / 6.2); $('bsBar').style.width = (pr * 100).toFixed(1) + '%'; $('bsBar').parentElement.setAttribute('aria-valuenow', Math.round(pr * 100));
  }
  const rows = $('bsList').children;
  boot.arcs.forEach((a, i) => {
    const t0 = 1.1 + i * 0.13, tt = 2.8 + i * 0.2, isBest = boot.best.includes(a.k), row = rows[i];
    a.u.uTime.value = time;
    a.u.uDraw.value = reduce ? (t > t0 ? 1 : 0) : ease(clamp((t - t0) / 0.7));
    // traçada em cinza; medida, a melhor acende em verde e as outras recuam
    const tested = t >= tt, chosen = t >= 5.0;
    a.u.uCol.value.lerp(tested && isBest ? C.route : C.dim, Math.min(1, dt * 6));
    const fade = boot.phase === 'out' ? clamp(1 - boot.out / 0.6) : 1;
    a.u.uOp.value = (t < t0 ? 0 : chosen ? (isBest ? 1 : 0.18) : tested ? 0.8 : 0.6) * fade;
    a.u.uGain.value = chosen && isBest ? (a.k === boot.best[0] ? 1 : 0.55) : 0.5;
    if (boot.phase !== 'scan') return;
    const ms = row.querySelector('.bs-ms');
    if (t >= t0 && !tested) { row.className = 'bs-row testing'; ms.textContent = Math.round(a.ms * (0.6 + Math.random() * 0.9)) + ' ms'; }
    else if (tested) { const c = 'bs-row ' + (chosen ? (isBest ? 'best' : 'dim') : 'ok'); if (row.className !== c) { row.className = c; ms.textContent = a.ms + ' ms'; } }
  });
  // escolhidas: a lista reordena pelo ping, as melhores em cima
  if (boot.phase === 'scan' && t >= 5.0 && !boot.sorted) { boot.sorted = true; [...boot.arcs].sort((a, b) => a.ms - b.ms).forEach((a, o) => rows[boot.arcs.indexOf(a)].style.order = o); }
  if (boot.phase === 'scan' && t >= 7.0) { boot.phase = 'out'; boot.out = 0; $('app').dataset.boot = 'out'; }
  if (boot.phase === 'out') {
    boot.out += dt;
    if (boot.out > 1.1) { $('app').classList.add('boot-out'); endBoot(); setTimeout(() => $('app').classList.remove('boot-out'), 1200); }
  }
}

/* ---------- Biblioteca: varredura de jogos (pedido do Gabriel) ----------
   Estado de carregamento quando o app procura jogos instalados e os adiciona à biblioteca.
   Sobre o Immersive: um radar gira em volta do globo, o contador no centro sobe, e cada jogo encontrado
   sai de trás do globo para a órbita (a mesma mola do hover). Embaixo, a pasta sendo lida e os launchers, um por vez.
   No fim a órbita fecha e a home segue normal, com a rota do jogo em destaque. Launchers, pastas e jogos são simulados. */
const LAUNCHERS = [
  ['Steam', 'C:\\Program Files (x86)\\Steam\\steamapps\\common', ['Throne and Liberty Global', 'Counter-Strike 2', 'Dota 2', 'PUBG: Battlegrounds', 'Naruto Shippuden: Ultimate Ninja Storm 4']],
  ['Epic Games', 'C:\\Program Files\\Epic Games', ['Fortnite', 'Rocket League']],
  ['Riot Client', 'C:\\Riot Games', ['League of Legends']],
  ['Battle.net', 'C:\\Program Files (x86)\\Battle.net', ['Overwatch 2']],
  ['EA app', 'C:\\Program Files\\EA Games', ['Apex Legends']],
  ['Ubisoft Connect', 'C:\\Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\games', ["Tom Clancy's Rainbow Six Siege"]]
];
const JUNK = ['_CommonRedist', 'shadercache', 'workshop', 'Binaries\\Win64', 'Content\\Paks', 'Saved\\Config', 'Engine\\Plugins', 'redist', 'logs', 'downloading'];
const scanEl = document.createElement('div'); scanEl.className = 'scan';
scanEl.innerHTML = `
  <div class="scan-radar" aria-hidden="true"><i class="sr-sweep"></i><i class="sr-ring"></i><i class="sr-ring"></i></div>
  <div class="scan-core" aria-live="polite"><span class="sc-k t-var" id="scK">Scanning your PC</span><span class="sc-n tnum" id="scN">0</span><span class="sc-l" id="scL">games found</span></div>
  <div class="scan-bar">
    <div class="sb-r1"><span class="sb-t" id="scT">Looking for game launchers</span><span class="sb-path tnum" id="scPath"></span><span class="sb-p tnum" id="scP">0%</span><button class="link sb-skip" type="button" id="scSkip">Skip</button></div>
    <div class="bs-bar"><i id="scBar"></i></div>
    <div class="sb-ls" id="scLs">${LAUNCHERS.map(([n]) => `<span class="sb-l"><i class="dt"></i>${n}<b class="tnum"></b></span>`).join('')}</div>
  </div>`;
$('pk').append(scanEl);
$('scSkip').addEventListener('click', () => { if (scan) scan.t = Math.max(scan.t, scan.end); });
// ordem de descoberta: launcher por launcher; jogos fora da lista ficam de fora da biblioteca nova
const SCAN_ORDER = LAUNCHERS.flatMap(([, , gs], li) => gs.map(n => [GAMES.findIndex(g => g.name === n), li])).filter(([i]) => i >= 0);
const L_DUR = 1.25, L_T0 = 0.9; // cada launcher: 1,25 s; antes, 0,9 s procurando launchers
function startScan() {
  if (boot) endBoot(true); if (scan) endScan(true);
  setV('9'); history.replaceState(null, '', '#scan');
  vchips.forEach(c => c.setAttribute('aria-pressed', c.dataset.scan ? 'true' : 'false'));
  setPanel8(false); setShow9(false); $('app').classList.remove('sb-open');
  thumbs.forEach((_, i) => { p9[i] = 0; pv9[i] = 0; tg9[i] = 0; });
  scan = { t: 0, shown: thumbs.map(() => false), n: 0, end: L_T0 + LAUNCHERS.length * L_DUR + 0.3, done: false, yaw: frame0.yaw };
  $('app').dataset.scan = 'on';
  [...$('scLs').children].forEach(el => { el.className = 'sb-l'; el.querySelector('b').textContent = ''; });
  frame0.dist = fitDist();
}
function endScan(keepHash) {
  if (!scan) return;
  scan = null; delete $('app').dataset.scan;
  if (!keepHash && location.hash === '#scan') history.replaceState(null, '', '#v' + $('app').dataset.v);
  vchips.forEach(c => c.setAttribute('aria-pressed', c.dataset.v === $('app').dataset.v ? 'true' : 'false'));
  rebuild(); frame0.dist = fitDist();
}
let scanPathT = 0;
function frameScan(dt) {
  if (!scan) { if (offY9 > 0.3) { offY9 += (0 - offY9) * (reduce ? 1 : 1 - Math.exp(-dt * 4)); if (offY9 < 0.3) offY9 = 0; camera.setViewOffset(vw, vh, off8, camOff[1] + offY9, vw, vh); camera.updateProjectionMatrix(); } return; }
  scan.t += dt; const t = scan.t;
  // o globo gira devagar enquanto procura
  frame0.yaw = scan.yaw + t * 0.25; frame0.pitch = 0.25;
  // radar centrado no globo, um pouco maior que ele
  offY9 += ((scan ? 56 : 0) - offY9) * (reduce ? 1 : 1 - Math.exp(-dt * 4));
  camera.setViewOffset(vw, vh, off8, camOff[1] + offY9, vw, vh); camera.updateProjectionMatrix();
  const gp = globePx(), cx = vw / 2 - off8, cy = vh / 2 - camOff[1] - offY9, rr = gp * 1.22;
  scanEl.style.setProperty('--cx', cx.toFixed(1) + 'px'); scanEl.style.setProperty('--cy', cy.toFixed(1) + 'px'); scanEl.style.setProperty('--rr', rr.toFixed(1) + 'px');
  const li = Math.floor((t - L_T0) / L_DUR), lt = (t - L_T0) / L_DUR - li;
  // jogos do launcher atual aparecem espalhados pela fatia de tempo dele
  SCAN_ORDER.forEach(([gi, l], k) => {
    const inL = SCAN_ORDER.filter(([, l2]) => l2 === l), pos = inL.findIndex(([g]) => g === gi);
    const at = L_T0 + l * L_DUR + L_DUR * (0.25 + 0.6 * (pos + 0.5) / inL.length);
    if (!scan.shown[gi] && t >= at) { scan.shown[gi] = true; scan.n++; scan.last = gi; scan.lastT = t; }
  });
  const done = t >= scan.end;
  [...$('scLs').children].forEach((el, i) => {
    const c = 'sb-l' + (done || i < li ? ' done' : i === li ? ' now' : '');
    if (el.className !== c) el.className = c;
    const n = SCAN_ORDER.filter(([gi, l]) => l === i && scan.shown[gi]).length;
    el.querySelector('b').textContent = i < li || done || n ? n : '';
  });
  $('scN').textContent = scan.n;
  const recent = scan.last != null && t - scan.lastT < 0.9;
  $('scL').textContent = done ? 'games added to your library' : recent ? GAMES[scan.last].name : scan.n === 1 ? 'game found' : 'games found';
  $('scL').classList.toggle('hit', recent && !done);
  $('scK').textContent = done ? 'Library ready' : 'Scanning your PC';
  const pr = clamp(t / scan.end);
  $('scBar').style.width = (pr * 100).toFixed(1) + '%'; $('scP').textContent = Math.round(pr * 100) + '%';
  if (done) { $('scT').textContent = `${scan.n} games added. Optimize any of them from the globe.`; $('scPath').textContent = ''; }
  else if (li < 0) { $('scT').textContent = 'Looking for game launchers'; if (t - scanPathT > 0.09) { scanPathT = t; $('scPath').textContent = ['C:\\Program Files', 'C:\\Program Files (x86)', 'C:\\Users\\Player\\AppData\\Local', 'D:\\Games'][Math.floor(t * 8) % 4]; } }
  else {
    const [n, root, gs] = LAUNCHERS[li];
    $('scT').textContent = `Scanning ${n}`;
    if (t - scanPathT > 0.08) { scanPathT = t; const g = gs[Math.floor(lt * gs.length * 2) % gs.length]; $('scPath').textContent = `${root}\\${g.replace(/[:']/g, '')}\\${JUNK[Math.floor(Math.random() * JUNK.length)]}`; }
  }
  if (done && !scan.done) { scan.done = true; $('app').dataset.scan = 'done'; }
  if (t >= scan.end + 2.6) endScan();
}

/* ---------- Loop ---------- */
let time = 0, lastT = performance.now(), lastS = 0, lastP = 0;
resize();
select(0);

const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
function frame() {
  const now = performance.now(), dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; time += dt;
  const g = GAMES[sel], on = g.state === 'on';

  // enquadramento suave; o arraste volta sozinho depois de 2,5 s
  if (!gDrag && time - lastDrag > 1.2) { const k = 1 - Math.exp(-dt * 3); dYaw += (0 - dYaw) * k; dPitch += (0 - dPitch) * k; }
  const kf = reduce ? 1 : 1 - Math.exp(-dt * (isV9() && show9 ? 7 : 2.6)); // V9: abrindo a órbita, o globo recua rápido
  cur.yaw += wrapA(frame0.yaw - cur.yaw) * kf; cur.pitch += (frame0.pitch - cur.pitch) * kf; cur.dist += (frame0.dist - cur.dist) * kf;
  globe.rotation.y = cur.yaw + dYaw + (reduce ? 0 : Math.sin(time * 0.15) * 0.03);
  tilt.rotation.x = cur.pitch + dPitch;
  camera.position.set(0, 0, cur.dist); camera.lookAt(0, 0, 0);
  const zk = zoomK(cur.dist);
  landMat.uniforms.uSize.value = 9 * Math.max(zk, 0.5); svMat.uniforms.uSize.value = 20 * Math.max(zk, 0.25);
  packets.material.uniforms.uSize.value = 34 * Math.max(zk, 0.12); mkMat.uniforms.uSize.value = 100 * Math.max(zk, 0.12);
  atmo.material.uniforms.uCenter.value.copy(tilt.position);

  const age = time - buildT, xa = time - xlStart;
  if (routes) {
    routes.isp.u.uDraw.value = reduce ? 1 : ease(clamp((age - 0.35) / 0.9));
    routes.isp.u.uOp.value = on ? 0.55 : 1; routes.isp.u.uTime.value = time;
    const testing = g.state === 'testing';
    // teste: as candidatas cinza se espalham, depois somem e as 4 escolhidas acendem em verde sobre elas
    routes.cand.forEach((r, k) => {
      r.u.uTime.value = time;
      if (!testing) { r.u.uOp.value = 0; return; }
      r.u.uDraw.value = reduce ? 1 : ease(clamp((xa - k * 0.1) / 0.7));
      r.u.uOp.value = 0.6 * (1 - clamp((xa - (routes.pick.includes(k) ? 1.9 : 1.5)) / 0.5));
    });
    routes.xl.forEach((r, i) => {
      r.u.uDraw.value = !xlShow ? 0 : reduce ? 1 : testing ? ease(clamp((xa - 1.5 - i * 0.12) / 0.6)) : ease(clamp((xa - i * 0.3) / 0.8));
      r.u.uOp.value = xlShow; r.u.uTime.value = time;
      r.u.uFail.value = fail && fail.lane === i ? fail.k : 0;
      // a mais rápida fica bem mais forte; passar o mouse num chip manda
      r.u.uGain.value = hoverLane >= 0 ? (hoverLane === i ? 0.95 : 0.12) : on ? (i === fastLane ? 1 : 0.22) : 0.42;
    });
  }
  // uma rota oscila de tempos em tempos: entra, segura, sai
  if (on && !fail && time > nextFail) { fail = { lane: Math.floor(Math.random() * g.lanes), t0: time, k: 0 }; logMsg(`<b>Route ${fail.lane + 1} wobbled.</b> Packets kept flowing through the other ${g.lanes - 1}, with no loss.`); }
  if (fail) {
    const e = time - fail.t0; fail.k = e < 0.3 ? e / 0.3 : e < 3 ? 1 : 1 - (e - 3) / 0.5;
    if (e > 3.5) { logMsg(`Route ${fail.lane + 1} is stable again and back in the group.`); fail = null; nextFail = time + 8 + Math.random() * 6; }
  }
  mkMat.uniforms.uTime.value = time; svMat.uniforms.uTime.value = time;

  // pacotes
  let j = 0;
  const putPk = (route, u, col, a) => { route.curve.getPointAt(clamp(u), v3); v3.toArray(pkPos, j * 3); col.toArray(pkCol, j * 3); pkA[j] = a; j++; };
  if (routes) {
    const iD = routes.isp.u.uDraw.value;
    for (let i = 0; i < PK; i++) {
      const cyc = time * 0.16 + i / PK, u = cyc % 1, lost = Math.sin(Math.floor(cyc) * 12.9 + i * 78.2) > 0.6;
      putPk(routes.isp, u, lost && u > 0.5 ? C.bad : C.isp, u < iD ? (on ? 0.5 : 1) * (lost && u > 0.55 ? clamp(1 - (u - 0.55) * 8) : 1) : 0);
    }
    routes.xl.forEach((r, ri) => {
      const sp = 0.42 * (routes.xl[0].len / r.len), draw = r.u.uDraw.value;
      for (let i = 0; i < PK; i++) { const u = (time * sp + i / PK) % 1; putPk(r, u, C.route, u < draw ? (fail && fail.lane === ri ? 1 - fail.k : 1) * (on && ri === fastLane ? 0.9 : on ? 0.3 : 0.55) : 0); }
    });
  }
  while (j < packetsN) pkA[j++] = 0;
  pkGeo.attributes.position.needsUpdate = pkGeo.attributes.aCol.needsUpdate = pkGeo.attributes.aA.needsUpdate = true;

  // telemetria: amostra a 10 Hz, números a 4 Hz para dar para ler
  if (time - lastS > 0.1) { lastS = time; sample(on); drawChart(); }
  if (time - lastP > 0.25) { lastP = time; paintTele(); }

  frameV7(dt); frameV8(dt); frameBoot(dt); frameScan(dt);
  scene.updateMatrixWorld();
  placeTags(clamp((age - 0.6) / 0.4));
  composer.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Chips de versão acima do app: troca data-v no .app e guarda a escolha no #hash (#v1, #v2)
const vchips = [...document.querySelectorAll('.vchip')];
function setV(v) {
  const b = vchips.find(c => c.dataset.v === v && !c.disabled); if (!b) return;
  vchips.forEach(c => c.setAttribute('aria-pressed', c === b ? 'true' : 'false'));
  $('app').dataset.v = v;
  if (location.hash !== '#v' + v) history.replaceState(null, '', '#v' + v);
  dispatchEvent(new Event('pk:layout'));
}
vchips.forEach(c => c.addEventListener('click', () => { if (c.dataset.boot) return startBoot(); if (c.dataset.scan) return startScan(); if (boot) endBoot(); if (scan) endScan(); setV(c.dataset.v); }));
if (/^#v\d+$/.test(location.hash)) setV(location.hash.slice(2));
if (location.hash === '#login') startBoot();
if (location.hash === '#scan') startScan();
