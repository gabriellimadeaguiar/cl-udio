// Gera os pontos de terra do globo (esfera de Fibonacci filtrada pelo contorno dos continentes).
import fs from 'fs';
import * as topo from 'topojson-client';

const w = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land = topo.feature(w, w.objects.land);
const polys = [];
for (const f of land.features) {
  const g = f.geometry;
  const ps = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const p of ps) {
    const b = [999, 999, -999, -999];
    for (const [x, y] of p[0]) { b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y); }
    polys.push({ p, b });
  }
}
const inRing = (r, x, y) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const inLand = (x, y) => {
  for (const { p, b } of polys) {
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    if (inRing(p[0], x, y)) {
      let hole = false;
      for (let k = 1; k < p.length; k++) if (inRing(p[k], x, y)) hole = true;
      if (!hole) return true;
    }
  }
  return false;
};
const N = +process.argv[2] || 70000, out = [];
const ga = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - 2 * (i + 0.5) / N, th = ga * i;
  const lat = Math.asin(y) * 180 / Math.PI;
  const lon = ((th * 180 / Math.PI) % 360 + 540) % 360 - 180;
  if (lat < -58) continue;
  if (inLand(lon, lat)) out.push(Math.round((lat + 90) * 100), Math.round((lon + 180) * 100));
}
const buf = Buffer.from(new Uint16Array(out).buffer);
fs.writeFileSync(process.argv[3] || 'land.js', '// Pontos de terra: pares uint16 (lat+90)*100, (lon+180)*100 em base64. Gerado por gen2.mjs.\nwindow.LAND="' + buf.toString('base64') + '";\n');
console.log(out.length / 2, buf.length);
