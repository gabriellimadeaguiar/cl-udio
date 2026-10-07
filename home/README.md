# Home do app desktop (ExitLag)

Home do produto desktop montada dentro do protótipo da home atual (sidebar, topbar, tokens e componentes vêm dele).
A fileira "Recent games and apps" vira um palco: jogos em carrossel e, ao lado do jogo em destaque, o globo da landing (`globo/`)
com a rota da operadora e as rotas da ExitLag em tempo real (ping, jitter, perda de pacotes, troca de rota).

- `src/prototype.html`: protótipo da home atual, como publicado (https://claude.ai/artifact/LD1QD4VAhiL2eYxdTv1MGj).
- `src/stage.html` + `src/stage.css`: o palco, só com tokens e componentes do protótipo (btn, icon-btn, pill, badge, widget, legend, search-list).
- `home.js`: carrossel, globo (Three.js via import map), telemetria simulada e fluxo de otimizar.
- `src/build.py`: gera `index.html`. Rodar `python3 src/build.py` depois de editar `src/`.
- Capas: Wikipedia (caixas dos jogos) e, para Throne and Liberty, LoL e Fortnite, as artes do protótipo atual.
- Simulado: regiões e servidores por jogo, número de rotas (2 a 4), telemetria. Origem pelo fuso do navegador; `#london`, `#tokyo` no link forçam outra cidade.

Rodar: `python3 -m http.server` na raiz do repo e abrir `/home/`.
