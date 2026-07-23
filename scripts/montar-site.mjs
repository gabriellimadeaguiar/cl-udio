// Monta o diretório publicável em _site/: os arquivos de site/ na raiz, com
// dados/ e config/ ao lado (o app.js os busca por caminho relativo).
// Usado pelo deploy do GitHub Pages e para pré-visualização local.
// Uso: node scripts/montar-site.mjs   (depois: python3 -m http.server -d _site)

import { cpSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "./comum.mjs";

const destino = join(RAIZ, "_site");
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

cpSync(join(RAIZ, "site"), destino, { recursive: true });
cpSync(join(RAIZ, "config"), join(destino, "config"), { recursive: true });
cpSync(join(RAIZ, "dados"), join(destino, "dados"), { recursive: true });

console.log("Site montado em _site/. Sirva com: python3 -m http.server -d _site 8000");
