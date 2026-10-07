# Home do app desktop (ExitLag)

Protótipo da home do produto desktop: palco de jogos em carrossel, com o globo da landing (`globo/`) ao lado do jogo selecionado mostrando, em tempo real, a rota da operadora e as rotas da ExitLag, com ping, jitter, perda de pacotes e troca de rota.

- `index.html`: layout e estilos (tokens do Token System, modo Desktop; componentes do Design System | Spec).
- `home.js`: carrossel, globo (Three.js via import map), simulação de telemetria e fluxo de otimizar.
- `icons.js`: ícones do protótipo da home atual. `land.js`: pontos de terra (cópia de `globo/land.js`).
- Origem da rota pelo fuso do navegador; `#london`, `#tokyo` etc. no link forçam outra cidade.
- Telemetria e servidores por região são simulados; capas são as do protótipo atual.

Rodar: `python3 -m http.server` na raiz do repo e abrir `/home/`.
