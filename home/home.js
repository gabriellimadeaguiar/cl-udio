import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ---------- Textos PT / EN ---------- */
const T = {
  pt: {
    nHome: 'Início', nConn: 'Conexões', nLib: 'Biblioteca', nComm: 'Servidores da comunidade', nNet: 'Analisador de rede', nSet: 'Configurações',
    search: 'Buscar', help: 'Central de ajuda', profile: 'Perfil', notif: 'Notificações',
    recent: 'Jogos recentes', viewAll: 'Ver biblioteca', stageLabel: 'Palco de jogos', gamesLabel: 'Jogos', prev: 'Jogo anterior', next: 'Próximo jogo',
    server: 'Servidor', live: 'Ao vivo', isp: 'Operadora', globeLabel: 'Globo com as rotas entre você e o servidor do jogo',
    ping: 'Ping', jitter: 'Jitter', loss: 'Perda de pacotes', routes: 'Rotas ativas', ispNow: 'Operadora',
    optimize: 'Otimizar', testing: 'Testando rotas…', stop: 'Parar',
    connOn: 'ExitLag ativo', connOff: 'ExitLag em espera',
    you: 'Você', srv: 'Servidor do jogo',
    lane: 'Rota', routesOff: 'só a operadora', routesOn: 'simultâneas', of: '/',
    compare: 'Otimize para comparar',
    logIdle: 'Seu jogo está indo só pela rota da operadora.',
    logTest: n => `Testando ${n} rotas da ExitLag até o servidor…`,
    logOn: n => `Otimizado. O jogo sai por <b>${n} rotas</b> ao mesmo tempo; vale o pacote que chega primeiro.`,
    logFail: (i, n) => `<b>Rota ${i} oscilou.</b> Os pacotes seguiram pelas outras ${n}, sem perda.`,
    logBack: i => `Rota ${i} estabilizou e voltou ao grupo.`,
    logIspSpike: 'Pico na rota da operadora. A ExitLag não foi afetada.',
    lastSess: 'Última sessão', duration: 'Duração', lowPing: 'Menor ping', avgPing: 'Ping médio', avgJit: 'Jitter médio',
    refer: 'Indique e ganhe', referP: 'Escolha a recompensa que combina com seu estilo.', viewRewards: 'Ver recompensas',
    customize: 'Personalizar', turnOff: 'Desligar'
  },
  en: {
    nHome: 'Home', nConn: 'Connections', nLib: 'Library', nComm: 'Community Servers', nNet: 'Network Analyzer', nSet: 'General Settings',
    search: 'Search', help: 'Help Center', profile: 'Profile', notif: 'Notifications',
    recent: 'Recent games', viewAll: 'View library', stageLabel: 'Games stage', gamesLabel: 'Games', prev: 'Previous game', next: 'Next game',
    server: 'Server', live: 'Live', isp: 'ISP', globeLabel: 'Globe with the routes between you and the game server',
    ping: 'Ping', jitter: 'Jitter', loss: 'Packet loss', routes: 'Active routes', ispNow: 'ISP',
    optimize: 'Optimize', testing: 'Testing routes…', stop: 'Stop',
    connOn: 'ExitLag active', connOff: 'ExitLag on standby',
    you: 'You', srv: 'Game server',
    lane: 'Route', routesOff: 'ISP only', routesOn: 'in parallel', of: '/',
    compare: 'Optimize to compare',
    logIdle: 'Your game is going through your ISP route only.',
    logTest: n => `Testing ${n} ExitLag routes to the server…`,
    logOn: n => `Optimized. Your game goes out through <b>${n} routes</b> at once; the first packet to arrive wins.`,
    logFail: (i, n) => `<b>Route ${i} wobbled.</b> Packets kept flowing through the other ${n}, with no loss.`,
    logBack: i => `Route ${i} is stable again and back in the group.`,
    logIspSpike: 'Spike on the ISP route. ExitLag was not affected.',
    lastSess: 'Last session', duration: 'Duration', lowPing: 'Lowest ping', avgPing: 'Avg. ping', avgJit: 'Avg. jitter',
    refer: 'Refer & Earn', referP: 'Choose the reward that best fits your style.', viewRewards: 'View rewards',
    customize: 'Customize', turnOff: 'Turn off'
  }
};
let lang = 'pt';
try { lang = localStorage.getItem('xl-lang') || 'pt'; } catch { }
if (!T[lang]) lang = 'pt';
const t = k => T[lang][k];

document.querySelectorAll('[data-ico]').forEach(el => { el.innerHTML = (window.ICONS || {})[el.dataset.ico] || ''; });

/* ---------- Jogos (biblioteca do protótipo atual) ---------- */
// Servidores por região: dados simulados para o protótipo, não a lista oficial de cada jogo.
const REGIONS = {
  br: { pt: 'Brasil', en: 'Brazil', c: [-23.55, -46.63, 'São Paulo', 'SAO'] },
  nae: { pt: 'América do Norte Leste', en: 'NA East', c: [39.04, -77.49, 'Ashburn', 'IAD'] },
  nac: { pt: 'América do Norte Central', en: 'NA Central', c: [41.88, -87.63, 'Chicago', 'CHI'] },
  naw: { pt: 'América do Norte Oeste', en: 'NA West', c: [34.05, -118.24, 'Los Angeles', 'LAX'] },
  euw: { pt: 'Europa Oeste', en: 'EU West', c: [50.11, 8.68, 'Frankfurt', 'FRA'] },
  eun: { pt: 'Europa Nórdica', en: 'EU Nordic', c: [59.33, 18.07, 'Estocolmo', 'STO'] },
  asia: { pt: 'Sudeste Asiático', en: 'SEA', c: [1.35, 103.82, 'Singapura', 'SIN'] },
  jp: { pt: 'Japão', en: 'Japan', c: [35.68, 139.69, 'Tóquio', 'TYO'] },
  kr: { pt: 'Coreia', en: 'Korea', c: [37.57, 126.98, 'Seul', 'SEL'] },
  oce: { pt: 'Oceania', en: 'Oceania', c: [-33.87, 151.21, 'Sydney', 'SYD'] }
};
const GAMES = [
  { id: 'throne-and-liberty', name: 'Throne and Liberty', img: 'assets/games/throne-and-liberty.jpg', regions: ['nae', 'naw', 'euw', 'br'], state: 'on' },
  { id: 'league-of-legends', name: 'League of Legends', img: 'assets/games/league-of-legends.jpg', regions: ['br', 'nac', 'euw', 'eun', 'kr', 'oce'] },
  { id: 'fortnite', name: 'Fortnite', img: 'assets/games/fortnite.jpg', regions: ['br', 'nae', 'naw', 'euw', 'asia', 'oce'] },
  { id: 'teamfight-tactics', name: 'Teamfight Tactics', icon: 'assets/games/teamfight-tactics-icon.png', h: 42, regions: ['br', 'nac', 'euw', 'kr'] },
  { id: 'legends-of-runeterra', name: 'Legends of Runeterra', icon: 'assets/games/legends-of-runeterra-icon.png', h: 205, regions: ['nac', 'euw', 'asia'] },
  { id: 'naruto-storm-4', name: 'Naruto Shippuden: Ultimate Ninja Storm 4', short: 'Naruto Storm 4', icon: 'assets/games/naruto-storm-4-icon.png', h: 24, regions: ['nae', 'euw', 'jp'] },
  { id: 'crimson-moon', name: 'Crimson Moon', icon: 'assets/games/crimson-moon-icon.png', h: 352, regions: ['nae', 'euw', 'asia'] },
  { id: 'romestead', name: 'Romestead', icon: 'assets/games/romestead-icon.png', h: 30, regions: ['nae', 'euw'] }
];

const D = Math.PI / 180;
const toV = (lat, lon, r = 1) => { const p = (90 - lat) * D, th = (lon + 180) * D; return new THREE.Vector3(-r * Math.sin(p) * Math.cos(th), r * Math.cos(p), r * Math.sin(p) * Math.sin(th)); };
const toLL = v => { const n = v.clone().normalize(); const lat = 90 - Math.acos(n.y) / D; let lon = Math.atan2(n.z, -n.x) / D - 180; lon = ((lon % 360) + 540) % 360 - 180; return [lat, lon]; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => x * x * (3 - 2 * x);

/* ---------- Origem: onde o jogador está ---------- */
// Fuso horário do navegador, sem pedir permissão. No app, trocar pela geolocalização por IP. Para testar: #tokyo, #london no fim do link.
const CITIES = {
  'America/Sao_Paulo': [-23.55, -46.63, 'São Paulo', 'SAO'], 'America/Bahia': [-12.97, -38.5, 'Salvador', 'SSA'], 'America/Fortaleza': [-3.73, -38.52, 'Fortaleza', 'FOR'],
  'America/Recife': [-8.05, -34.88, 'Recife', 'REC'], 'America/Belem': [-1.46, -48.5, 'Belém', 'BEL'], 'America/Manaus': [-3.12, -60.02, 'Manaus', 'MAO'],
  'America/Cuiaba': [-15.6, -56.1, 'Cuiabá', 'CGB'], 'America/Campo_Grande': [-20.44, -54.65, 'Campo Grande', 'CGR'], 'America/Porto_Velho': [-8.76, -63.9, 'Porto Velho', 'PVH'],
  'America/Argentina/Buenos_Aires': [-34.6, -58.38, 'Buenos Aires', 'BUE'], 'America/Santiago': [-33.45, -70.67, 'Santiago', 'SCL'], 'America/Montevideo': [-34.9, -56.16, 'Montevidéu', 'MVD'],
  'America/Lima': [-12.05, -77.04, 'Lima', 'LIM'], 'America/Bogota': [4.71, -74.07, 'Bogotá', 'BOG'], 'America/Mexico_City': [19.43, -99.13, 'Cidade do México', 'MEX'],
  'America/New_York': [40.71, -74.0, 'Nova York', 'NYC'], 'America/Chicago': [41.88, -87.63, 'Chicago', 'CHI'], 'America/Denver': [39.74, -104.99, 'Denver', 'DEN'],
  'America/Los_Angeles': [34.05, -118.24, 'Los Angeles', 'LAX'], 'America/Toronto': [43.65, -79.38, 'Toronto', 'YYZ'],
  'Europe/Lisbon': [38.72, -9.14, 'Lisboa', 'LIS'], 'Europe/London': [51.51, -0.13, 'Londres', 'LON'], 'Europe/Madrid': [40.42, -3.7, 'Madri', 'MAD'],
  'Europe/Paris': [48.86, 2.35, 'Paris', 'PAR'], 'Europe/Berlin': [52.52, 13.4, 'Berlim', 'BER'], 'Europe/Rome': [41.9, 12.5, 'Roma', 'ROM'],
  'Europe/Warsaw': [52.23, 21.01, 'Varsóvia', 'WAW'], 'Europe/Istanbul': [41.01, 28.98, 'Istambul', 'IST'], 'Europe/Moscow': [55.76, 37.62, 'Moscou', 'MOW'],
  'Africa/Johannesburg': [-26.2, 28.05, 'Joanesburgo', 'JNB'], 'Asia/Dubai': [25.2, 55.27, 'Dubai', 'DXB'], 'Asia/Kolkata': [19.08, 72.88, 'Mumbai', 'BOM'],
  'Asia/Singapore': [1.35, 103.82, 'Singapura', 'SIN'], 'Asia/Manila': [14.6, 120.98, 'Manila', 'MNL'], 'Asia/Tokyo': [35.68, 139.69, 'Tóquio', 'TYO'], 'Asia/Seoul': [37.57, 126.98, 'Seul', 'SEL'],
  'Australia/Sydney': [-33.87, 151.21, 'Sydney', 'SYD']
};
const FALLBACK = { America: 'America/Sao_Paulo', Europe: 'Europe/London', Africa: 'Africa/Johannesburg', Asia: 'Asia/Singapore', Australia: 'Australia/Sydney' };
const CITY_EN = { 'São Paulo': 'Sao Paulo', 'Cidade do México': 'Mexico City', 'Nova York': 'New York', 'Lisboa': 'Lisbon', 'Londres': 'London', 'Madri': 'Madrid', 'Berlim': 'Berlin', 'Roma': 'Rome',
  'Varsóvia': 'Warsaw', 'Estocolmo': 'Stockholm', 'Istambul': 'Istanbul', 'Moscou': 'Moscow', 'Joanesburgo': 'Johannesburg', 'Singapura': 'Singapore', 'Tóquio': 'Tokyo', 'Seul': 'Seoul',
  'Montevidéu': 'Montevideo', 'Belém': 'Belem', 'Cuiabá': 'Cuiaba', 'Bogotá': 'Bogota' };
function findOrigin() {
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const h = slug(decodeURIComponent(location.hash.slice(1)));
  if (h) for (const [tz, c] of Object.entries(CITIES)) if (slug(c[2]) === h || slug(CITY_EN[c[2]] || '') === h || slug(tz.split('/').pop()) === h) return c;
  let tz = 'America/Sao_Paulo';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || tz; } catch { }
  return CITIES[tz] || CITIES[FALLBACK[tz.split('/')[0]]] || CITIES['America/Sao_Paulo'];
}
const origin = findOrigin();
const vO = toV(origin[0], origin[1]);
const cityName = c => lang === 'en' ? (CITY_EN[c[2]] || c[2]) : c[2];
// Região inicial de cada jogo: a mais próxima a pelo menos ~1.700 km (mesma regra da landing), para a rota ter o que mostrar.
GAMES.forEach(g => {
  const by = g.regions.map(r => [r, vO.angleTo(toV(REGIONS[r].c[0], REGIONS[r].c[1]))]).sort((a, b) => a[1] - b[1]);
  g.region = (by.find(([, a]) => a > 0.27) || by[0])[0];
});

/* ---------- Palco: carrossel ---------- */
const deck = document.getElementById('deck');
const cards = GAMES.map((g, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'card'; b.setAttribute('role', 'option'); b.setAttribute('aria-label', g.name);
  b.innerHTML = (g.img ? `<img class="cover" src="${g.img}" alt="" draggable="false">`
    : `<span class="gen" style="--h:${g.h};--icon:url('${g.icon}')"><img src="${g.icon}" alt="" draggable="false"><b>${g.short || g.name}</b></span>`) + '<span class="on-tag">ON</span>';
  b.addEventListener('click', () => { if (!moved) select(i); });
  deck.appendChild(b);
  return b;
});
const N = GAMES.length;
let sel = 0, frac = 0;
const wrapK = k => ((k % N) + N + N / 2) % N - N / 2;
function layout() {
  cards.forEach((c, i) => {
    const k = wrapK(i - sel - frac), a = Math.abs(k);
    const x = k * 64, z = -a * 190, ry = -Math.sign(k) * Math.min(a, 1.4) * 22, sc = 1 - Math.min(a, 2) * 0.06;
    c.style.transform = `translate(-50%, -50%) translateX(${x}%) translateZ(${z}px) rotateY(${ry}deg) scale(${sc})`;
    c.style.opacity = a > 2.6 ? 0 : clamp(1 - a * 0.42 + 0.12);
    c.style.filter = `brightness(${1 - Math.min(a, 2) * 0.32}) saturate(${1 - Math.min(a, 2) * 0.25})`;
    c.style.zIndex = String(10 - Math.round(a * 2));
    c.style.pointerEvents = a > 2.6 ? 'none' : '';
    c.setAttribute('aria-current', i === sel ? 'true' : 'false');
    c.setAttribute('aria-selected', i === sel ? 'true' : 'false');
    c.tabIndex = -1;
  });
}
// Arrastar o palco com mouse ou dedo; roda horizontal do trackpad; setas do teclado.
let dragX = null, moved = false, cardW = 1;
deck.addEventListener('pointerdown', e => { dragX = e.clientX; moved = false; cardW = cards[sel].offsetWidth * 0.64; });
addEventListener('pointermove', e => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (!moved && Math.abs(dx) > 6) { moved = true; deck.classList.add('drag'); deck.setPointerCapture?.(e.pointerId); }
  if (moved) { frac = -dx / cardW; layout(); }
});
addEventListener('pointerup', () => {
  if (dragX === null) return;
  dragX = null; deck.classList.remove('drag');
  if (moved) { const step = Math.round(frac + Math.sign(frac) * 0.2); frac = 0; select(sel + step); setTimeout(() => moved = false, 0); }
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
});
document.getElementById('prev').addEventListener('click', () => select(sel - 1));
document.getElementById('next').addEventListener('click', () => select(sel + 1));

const ambs = [document.getElementById('ambA'), document.getElementById('ambB')];
let ambI = 0;
const regionSel = document.getElementById('region');
regionSel.addEventListener('change', () => { GAMES[sel].region = regionSel.value; rebuild(); });

function paintInfo() {
  const g = GAMES[sel];
  document.getElementById('gTitle').textContent = g.name;
  document.getElementById('count').textContent = String(sel + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
  regionSel.innerHTML = g.regions.map(r => `<option value="${r}">${REGIONS[r][lang]}</option>`).join('');
  regionSel.value = g.region;
  paintCta();
}
function select(i) {
  i = ((i % N) + N) % N;
  const changed = i !== sel; sel = i; frac = 0;
  layout(); paintInfo();
  const g = GAMES[sel];
  ambI ^= 1; ambs[ambI].style.backgroundImage = `url('${g.img || g.icon}')`; ambs[ambI].classList.add('on'); ambs[ambI ^ 1].classList.remove('on');
  deck.classList.remove('lit'); requestAnimationFrame(() => requestAnimationFrame(() => deck.classList.add('lit')));
  if (changed || !routes) rebuild();
}

/* ---------- Otimizar: o comportamento da ExitLag ---------- */
const cta = document.getElementById('cta');
function fmtDur(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); }
function paintCta() {
  const g = GAMES[sel];
  cta.classList.toggle('running', g.state === 'on'); cta.classList.toggle('testing', g.state === 'testing');
  if (g.state === 'on') cta.innerHTML = `<span class="dot"></span>${t('stop')}<span class="t" id="ctaT">${fmtDur(time - g.since)}</span>`;
  else if (g.state === 'testing') cta.textContent = t('testing');
  else cta.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.2 1 3 9h4.4L6.6 15 13 7H8.6z"/></svg>${t('optimize')}`;
  cards.forEach((c, i) => c.classList.toggle('optimized', GAMES[i].state === 'on'));
  const anyOn = GAMES.some(x => x.state === 'on');
  document.getElementById('conn').classList.toggle('on', anyOn);
  document.getElementById('connTxt').textContent = anyOn ? t('connOn') : t('connOff');
  document.getElementById('lgXl').classList.toggle('off', g.state !== 'on');
}
function toggleOpt() {
  const g = GAMES[sel];
  if (g.state === 'on') { g.state = 'off'; xlShow = 0; fail = null; logMsg(t('logIdle')); paintCta(); return; }
  if (g.state === 'testing') return;
  g.state = 'testing'; xlShow = 1; xlStart = time; logMsg(t('logTest')(LANES));
  paintCta();
  setTimeout(() => {
    if (g.state !== 'testing') return;
    g.state = 'on'; g.since = time; nextFail = time + 6 + Math.random() * 4;
    if (GAMES[sel] === g) logMsg(t('logOn')(LANES));
    paintCta();
  }, reduce ? 300 : 1900);
}
cta.addEventListener('click', toggleOpt);

const logT = document.getElementById('logT'), logTxt = document.getElementById('logTxt');
function logMsg(html) {
  const d = new Date(); logT.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
  logTxt.style.opacity = 0; setTimeout(() => { logTxt.innerHTML = html; logTxt.style.opacity = 1; }, 150);
}

/* ---------- Cena: globo ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
THREE.ColorManagement.enabled = false;
const canvas = document.getElementById('gl'), host = canvas.parentElement;
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
const LANES = 4;
const LANE_SHAPE = [[-0.3, 1.0], [-0.1, 1.2], [0.1, 1.2], [0.3, 1.0]];
let routes = null, vS = new THREE.Vector3(), routeAngle = 1, routeKm = 0, buildT = -10;

function smoothPath(a, b, w, lateral, lift, N = 200) {
  const side = new THREE.Vector3().crossVectors(a, b).normalize(), sw = Math.sin(w), pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, s = Math.sin(Math.PI * u);
    const p = a.clone().multiplyScalar(Math.sin((1 - u) * w) / sw).add(b.clone().multiplyScalar(Math.sin(u * w) / sw));
    p.addScaledVector(side, lateral(u) * w).normalize();
    pts.push(p.multiplyScalar(1.004 + (0.02 + w * 0.2) * lift * s));
  }
  return pts;
}
function makeRoute(pts, color, radius, speed, gain = 1) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const uniforms = { uCol: { value: color }, uBad: { value: C.bad }, uDraw: { value: 0 }, uOp: { value: 0 }, uFail: { value: 0 }, uTime: { value: 0 }, uSpeed: { value: speed }, uGain: { value: gain } };
  for (const halo of [0, 1]) {
    const mat = new THREE.ShaderMaterial({ uniforms: { ...uniforms, uHalo: { value: halo } }, vertexShader: routeVS, fragmentShader: routeFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 260, halo ? radius * 4.5 : radius, 10, false), mat));
  }
  return { curve, u: uniforms, len: curve.getLength() };
}
function clearRoutes() {
  routeGroup.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
  routeGroup.clear();
}

// Pacotes que correm pelas rotas. O mesmo pacote sai por todas as rotas ExitLag ao mesmo tempo.
const PK = 10, packetsN = PK * (1 + LANES);
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

// Enquadramento: o globo gira até o meio da rota do jogador.
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
  routes = {
    isp: makeRoute(smoothPath(vO, vS, w, u => 0.62 * Math.sin(Math.PI * u) + 0.16 * Math.sin(3 * Math.PI * u), 0.35), C.isp, 0.0032, 0.35),
    xl: LANE_SHAPE.map(([lat, lift], i) => makeRoute(smoothPath(vO, vS, w, u => lat * Math.sin(Math.PI * u), lift), C.route, 0.0032, 0.8 + i * 0.05, 0.42))
  };
  vO.clone().multiplyScalar(1.006).toArray(mkPos, 0); vS.clone().multiplyScalar(1.006).toArray(mkPos, 3);
  mkGeo.attributes.position.needsUpdate = true;
  const [mLat, mLon] = toLL(vO.clone().add(vS));
  frame0.yaw = (-mLon - 90) * D; frame0.pitch = clamp(mLat, -55, 55) * D;
  frame0.chord = 2 * Math.sin(w / 2) * 1.45;
  frame0.dist = fitDist();
  buildT = time;
  xlShow = g.state === 'on' || g.state === 'testing' ? 1 : 0; xlStart = time + 0.5;
  fail = null; nextFail = time + 5 + Math.random() * 4;
  // telemetria parte de novo para a nova rota
  baseXl = Math.round(8 + routeKm / 100 * 1.1); baseIsp = Math.round(baseXl * 1.5 + 14);
  hist.isp.length = hist.xl.length = 0; win.length = 0;
  for (let i = 0; i < HN; i++) sample(false);
  document.getElementById('routeId').innerHTML = `${origin[3]} → ${sv[3]}<small>${Math.round(routeKm).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')} km</small>`;
  paintTags();
  logMsg(g.state === 'on' ? t('logOn')(LANES) : t('logIdle'));
}

/* ---------- Telemetria simulada ---------- */
// Ping estimado pela distância (≈1 ms de ida e volta a cada 100 km de fibra). Operadora: rota mais longa, picos e perda.
// ExitLag: o mesmo pacote vai por 4 rotas; conta o que chega primeiro, então o pico de uma rota não aparece no resultado.
let baseXl = 40, baseIsp = 74, spike = 0, fail = null, nextFail = 0;
const HN = 140, hist = { isp: [], xl: [] }, win = [];
const laneNow = [0, 0, 0, 0];
function sample(on) {
  spike = Math.max(0, spike - 1);
  if (Math.random() < 0.012) { spike = 6 + Math.random() * 10; if (on && time > 2) logMsg(t('logIspSpike')); }
  const isp = baseIsp * (1 + (Math.random() - 0.5) * 0.16) + (spike ? baseIsp * (0.35 + Math.random() * 0.5) : 0);
  const ispLost = Math.random() < (spike ? 0.18 : 0.008);
  let best = Infinity, allLost = true;
  for (let i = 0; i < LANES; i++) {
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

const $ = id => document.getElementById(id);
const lanesEl = $('lanes');
lanesEl.innerHTML = Array.from({ length: LANES }, (_, i) => `<span class="lane"><i></i>R${i + 1}<em>–</em></span>`).join('');
const laneEls = [...lanesEl.children];
function paintTele() {
  const g = GAMES[sel], on = g.state === 'on';
  const ip = avg(hist.isp), xp = avg(hist.xl);
  const ij = jit(hist.isp), xj = jit(hist.xl), il = lossPct(0), xll = lossPct(1);
  $('kPing').textContent = Math.round(on ? xp : ip);
  $('kJit').textContent = (on ? xj : ij).toFixed(1).replace('.', lang === 'en' ? '.' : ',');
  $('kLoss').textContent = (on ? xll : il).toFixed(1).replace('.', lang === 'en' ? '.' : ',');
  const d = $('kDelta'); d.hidden = !on; if (on) d.textContent = '−' + Math.max(0, Math.round((1 - xp / ip) * 100)) + '%';
  const vsSet = (id, v) => { const el = $(id); el.textContent = on ? v : ''; const l = el.parentElement.querySelector('[data-t], .vsl'); l.textContent = on ? 'vs ' : (l.classList.contains('vsl') ? '' : t('compare')); };
  vsSet('kPingIsp', Math.round(ip) + ' ms');
  vsSet('kJitIsp', ij.toFixed(1).replace('.', lang === 'en' ? '.' : ',') + ' ms');
  vsSet('kLossIsp', il.toFixed(1).replace('.', lang === 'en' ? '.' : ',') + '%');
  const failing = on && fail && fail.k > 0.5;
  $('kRoutes').textContent = on ? (failing ? LANES - 1 : LANES) : 1;
  $('kRoutesOf').textContent = on ? '/' + LANES : '';
  $('kRoutesNote').textContent = on ? t('routesOn') : t('routesOff');
  laneEls.forEach((el, i) => {
    el.title = t('lane') + ' ' + (i + 1);
    const bad = on && fail && fail.lane === i && fail.k > 0.3;
    el.classList.toggle('off', !on && g.state !== 'testing'); el.classList.toggle('bad', !!bad);
    el.querySelector('em').textContent = on ? Math.round(laneNow[i]) + ' ms' : '–';
  });
  if (on) { const ct = $('ctaT'); if (ct) ct.textContent = fmtDur(time - g.since); }
}
const chart = $('chart'), cctx = chart.getContext('2d');
function drawChart() {
  const on = GAMES[sel].state === 'on';
  const w = chart.clientWidth, h = chart.clientHeight; if (chart.width !== w * PR || chart.height !== h * PR) { chart.width = w * PR; chart.height = h * PR; }
  cctx.setTransform(PR, 0, 0, PR, 0, 0); cctx.clearRect(0, 0, w, h);
  const top = baseIsp * 1.7, y = v => h - 2 - Math.min(v, top) / top * (h - 4);
  cctx.strokeStyle = '#242627'; cctx.lineWidth = 1; cctx.beginPath();
  for (let g = 1; g <= 2; g++) { const yy = Math.round(h * g / 3) + .5; cctx.moveTo(0, yy); cctx.lineTo(w, yy); } cctx.stroke();
  const line = (arr, col, glow) => {
    cctx.save(); cctx.strokeStyle = col; cctx.lineWidth = 1.5; cctx.lineJoin = 'round'; cctx.shadowColor = col; cctx.shadowBlur = glow;
    cctx.beginPath(); arr.forEach((v, i) => { const xx = (i + HN - arr.length) / (HN - 1) * w; i ? cctx.lineTo(xx, y(v)) : cctx.moveTo(xx, y(v)); }); cctx.stroke(); cctx.restore();
  };
  line(hist.isp, '#eb8322', 4); if (on) line(hist.xl, '#22eba3', 6);
}

/* ---------- Rótulos no globo ---------- */
const tagA = document.createElement('div'), tagB = document.createElement('div');
tagA.className = tagB.className = 'tag'; host.append(tagA, tagB);
function paintTags() {
  const sv = REGIONS[GAMES[sel].region].c;
  tagA.innerHTML = `${cityName(origin)}<small>${t('you')}</small>`;
  tagB.innerHTML = `${cityName(sv)} · ${sv[3]}<small>${t('srv')}</small>`;
}
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
    el.style.transform = `translate(${Math.round(p[0] + (left ? -12 : 12))}px, ${Math.round(p[1] + (up ? -40 : 4))}px)` + (left ? ' translateX(-100%)' : '');
    el.style.opacity = vis * clamp(p[2] * 4);
  };
  const near = Math.abs(a[1] - b[1]) < 60;
  put(tagA, a, aLeft, near ? a[1] <= b[1] : true); put(tagB, b, !aLeft, near ? b[1] < a[1] : true);
}

/* ---------- Arrastar o globo ---------- */
let gDrag = null, dYaw = 0, dPitch = 0, lastDrag = -10;
canvas.addEventListener('pointerdown', e => { gDrag = [e.clientX, e.clientY, dYaw, dPitch]; canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag'); });
canvas.addEventListener('pointermove', e => { if (!gDrag) return; dYaw = gDrag[2] + (e.clientX - gDrag[0]) * 0.006; dPitch = clamp(gDrag[3] + (e.clientY - gDrag[1]) * 0.004, -0.9, 0.9); lastDrag = time; });
canvas.addEventListener('pointerup', () => { gDrag = null; canvas.classList.remove('drag'); lastDrag = time; });

/* ---------- Pós e tamanho ---------- */
// Distância da câmera para a rota inteira caber na faixa livre do globo (entre o cabeçalho e o widget).
function fitDist() {
  const band = Math.max(160, Math.min(vw, vh - bandCut) * 0.78), worldPerPx = 2 * Math.tan(15 * D) / vh;
  return clamp(frame0.chord / (band * worldPerPx), 3.0, 7.5);
}
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.5, 0.3);
composer.addPass(bloom);
let vw = 1, vh = 1, offY = 0, bandCut = 0;
function resize() {
  vw = host.clientWidth; vh = host.clientHeight;
  renderer.setSize(vw, vh, false); composer.setSize(vw, vh); composer.setPixelRatio(PR); bloom.resolution.set(vw / 2, vh / 2);
  // O globo fica centrado na faixa entre o cabeçalho e o widget de telemetria.
  const headH = host.querySelector('header').offsetHeight, teleH = $('tele').offsetHeight + 24;
  offY = Math.round((teleH - headH) / 2); bandCut = teleH + headH;
  frame0.dist = fitDist();
  camera.aspect = vw / vh; camera.setViewOffset(vw, vh, 0, offY, vw, vh); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);

/* ---------- Idioma ---------- */
function applyLang(l) {
  lang = l; document.documentElement.lang = l === 'en' ? 'en' : 'pt-BR';
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('[data-tp]').forEach(el => { el.placeholder = t(el.dataset.tp); el.setAttribute('aria-label', t(el.dataset.tp)); });
  document.querySelectorAll('[data-ta]').forEach(el => el.setAttribute('aria-label', t(el.dataset.ta)));
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
  try { localStorage.setItem('xl-lang', l); } catch { }
  paintInfo(); paintTags();
  if (routes) { const sv = REGIONS[GAMES[sel].region].c; document.getElementById('routeId').innerHTML = `${origin[3]} → ${sv[3]}<small>${Math.round(routeKm).toLocaleString(l === 'en' ? 'en-US' : 'pt-BR')} km</small>`; }
}
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));

/* ---------- Loop ---------- */
let time = 0, lastT = performance.now(), lastS = 0, lastP = 0;
applyLang(lang);
select(0);
GAMES[0].since = -(41 * 60 + 12); // sessão em andamento herdada do protótipo
paintCta();
resize();

const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
function frame() {
  const now = performance.now(), dt = Math.min((now - lastT) / 1000, 0.05); lastT = now; time += dt;
  const g = GAMES[sel], on = g.state === 'on';

  // enquadramento suave + arraste que volta sozinho depois de 2,5 s
  if (!gDrag && time - lastDrag > 2.5) { const k = 1 - Math.exp(-dt * 2.2); dYaw += (0 - dYaw) * k; dPitch += (0 - dPitch) * k; }
  const kf = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
  cur.yaw += wrapA(frame0.yaw - cur.yaw) * kf; cur.pitch += (frame0.pitch - cur.pitch) * kf; cur.dist += (frame0.dist - cur.dist) * kf;
  globe.rotation.y = cur.yaw + dYaw + (reduce ? 0 : Math.sin(time * 0.15) * 0.03);
  tilt.rotation.x = cur.pitch + dPitch;
  camera.position.set(0, 0, cur.dist); camera.lookAt(0, 0, 0);
  atmo.position.copy(tilt.position); atmo.material.uniforms.uCenter.value.copy(tilt.position);

  // rotas
  const age = time - buildT, xa = time - xlStart;
  if (routes) {
    routes.isp.u.uDraw.value = reduce ? 1 : ease(clamp((age - 0.35) / 0.9));
    routes.isp.u.uOp.value = on ? 0.55 : 1; routes.isp.u.uTime.value = time;
    routes.xl.forEach((r, i) => {
      r.u.uDraw.value = xlShow ? (reduce ? 1 : ease(clamp((xa - i * 0.3) / 0.8))) : 0;
      r.u.uOp.value = xlShow; r.u.uTime.value = time;
      r.u.uFail.value = fail && fail.lane === i ? fail.k : 0;
    });
  }
  // falha de uma rota: entra, segura, sai
  if (on && !fail && time > nextFail) { fail = { lane: Math.floor(Math.random() * LANES), t0: time, k: 0 }; logMsg(t('logFail')(fail.lane + 1, LANES - 1)); }
  if (fail) {
    const e = time - fail.t0; fail.k = e < 0.3 ? e / 0.3 : e < 3 ? 1 : 1 - (e - 3) / 0.5;
    if (e > 3.5) { logMsg(t('logBack')(fail.lane + 1)); fail = null; nextFail = time + 8 + Math.random() * 6; }
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
      for (let i = 0; i < PK; i++) { const u = (time * sp + i / PK) % 1; putPk(r, u, C.route, u < draw ? (fail && fail.lane === ri ? 1 - fail.k : 1) * 0.55 : 0); }
    });
  }
  pkGeo.attributes.position.needsUpdate = pkGeo.attributes.aCol.needsUpdate = pkGeo.attributes.aA.needsUpdate = true;

  // telemetria: amostra a 10 Hz, números a 4 Hz para dar para ler
  if (time - lastS > 0.1) { lastS = time; sample(on); drawChart(); }
  if (time - lastP > 0.25) { lastP = time; paintTele(); }

  scene.updateMatrixWorld();
  const tv = clamp((age - 0.6) / 0.4);
  placeTags(tv);

  composer.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
