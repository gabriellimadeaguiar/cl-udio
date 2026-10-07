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
  deck.style.setProperty('--R', R.toFixed(1) + 'px'); deck.style.setProperty('--P', (R * ($('app').dataset.v === '5' ? 3 : 1.5)).toFixed(1) + 'px'); // V5: faixa baixa, perspectiva mais longa para as laterais não crescerem
}
new ResizeObserver(sizeDeck).observe(deck); sizeDeck();
// estado (seleção e otimizado); a posição é desenhada quadro a quadro em deckFrame
function layout() {
  cards.forEach((c, i) => {
    c.setAttribute('aria-selected', i === sel ? 'true' : 'false');
    c.classList.toggle('on', GAMES[i].state === 'on');
  });
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
function makeRoute(pts, color, radius, speed, gain = 1) {
  radius *= routeR;
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const uniforms = { uCol: { value: color }, uBad: { value: C.bad }, uDraw: { value: 0 }, uOp: { value: 0 }, uFail: { value: 0 }, uTime: { value: 0 }, uSpeed: { value: speed }, uGain: { value: gain } };
  for (const halo of [0, 1]) {
    const mat = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uHalo: { value: halo } }, vertexShader: routeVS, fragmentShader: routeFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 300, halo ? radius * 4.5 : radius, 10, false), mat));
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
function placeTags(vis) {
  const a = project(vO), b = project(vS), aLeft = a[0] <= b[0];
  const put = (el, p, left, up) => {
    const y = clamp(p[1] + (up ? -40 : 4), headBottom, vh - bandBottom - 36); // fica na faixa livre, sem cobrir cabeçalho nem widget
    const x = clamp(p[0] + (left ? -12 : 12), bandLeft + (left ? 140 : 0), vw - bandRight - (left ? 0 : 140)); // fora dos painéis da versão
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)` + (left ? ' translateX(-100%)' : '');
    el.style.opacity = vis * clamp(p[2] * 4) * (isV7() && e7 > 0 ? 0 : 1);
  };
  const near = Math.abs(a[1] - b[1]) < 60;
  put(tagA, a, aLeft, near ? a[1] <= b[1] : true); put(tagB, b, !aLeft, near ? b[1] < a[1] : true);
}

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
  if (isV7() && (away7 || e7 > 0.35)) return 4.8; // V7 na sidebar: o planeta inteiro na vaga
  const band = Math.max(140, Math.min(vw - bandSide, vh - bandCut) * 0.8), worldPerPx = 2 * Math.tan(15 * D) / vh;
  // a escala vale na superfície do globo (distância − 1): rotas curtas pedem a câmera bem perto
  return clamp(1 + frame0.chord / (band * worldPerPx), 1.22, 7.5);
}
// 1 com a câmera longe; menor perto, para pontos e rotas manterem o tamanho na tela
const zoomK = d => clamp((d - 1) / 3, 0.08, 1);
function resize() {
  if (!canvas.clientWidth || !canvas.clientHeight) return; // canvas escondido (home fora de vista)
  vw = canvas.clientWidth; vh = canvas.clientHeight; // o próprio canvas: na V7 ele sai do palco e voa para a sidebar
  renderer.setSize(vw, vh, false); composer.setSize(vw, vh); composer.setPixelRatio(PR); bloom.resolution.set(vw / 2, vh / 2);
  const headH = host.querySelector('.pk-head').offsetHeight + 24;
  // Área livre do globo em cada versão: o que cobre o canvas à esquerda, à direita e embaixo.
  // V1 e V7 widget embaixo · V4 jogo à direita e barra embaixo · V5 jogo à esquerda e barra embaixo
  const v = $('app').dataset.v, teleW = $('pkTele').offsetWidth + 48, teleH = $('pkTele').offsetHeight + 48, lW = $('pkL').offsetWidth;
  const [sideW, leftW, botH] = v === '4' ? [lW, 0, teleH]
    : v === '5' ? [0, lW, teleH] : [0, 0, teleH - 24];
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
const globePx = () => Math.tan(Math.asin(1 / Math.max(cur.dist, 1.0001))) / Math.tan(15 * D) * vh / 2;
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
  const kf = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
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

  frameV7(dt);
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
vchips.forEach(c => c.addEventListener('click', () => setV(c.dataset.v)));
if (/^#v\d$/.test(location.hash)) setV(location.hash.slice(2));
