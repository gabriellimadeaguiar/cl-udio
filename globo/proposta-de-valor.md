# ExitLag: proposta de valor (v1)

> Base para a landing page "globo". v1 incorpora as respostas do Gabriel (2026-10-07).

## 0. Decisões do Gabriel

| Tema | Decisão |
|---|---|
| Público | **PC competitivo** é o principal; mobile vem em segundo; router aparece como produto **beta** |
| Números oficiais | **+1.500 servidores**, **quase 1.800 jogos** (usar "+1.700 jogos" ou "quase 1.800") |
| Mensagem central | **Estabilidade** |
| Papel do site | Landing page de **teste grátis**, topo de funil, conversão direta |
| Idiomas | **PT-BR e EN** |

## 1. O que o produto é, em uma frase

ExitLag é um otimizador de **rota** para jogos online: encontra e usa, em tempo real, os caminhos
mais rápidos e estáveis entre o jogador e o servidor do jogo, enviando os pacotes por **várias rotas
ao mesmo tempo** (multipath). **Não é VPN**: não criptografa, não troca seu IP, não serve para navegar.

## 2. Para quem

| Perfil | Situação típica | O que dói |
|---|---|---|
| Competitivo de PC (Valorant, CS2, LoL, CoD) | Joga ranqueada todo dia | Ping oscila, *packet loss* em momento decisivo, "perdi por lag" |
| Mobile (Free Fire, Roblox, CoD Mobile) | Wi-Fi ou 4G instável | Travadas, desconexão no meio da partida |
| Quem joga em servidor longe (BR → NA/EU/Ásia, MMOs) | Rota da operadora dá voltas | Ping alto fixo, rota ruim que a operadora não resolve |
| Squad / duo | Joga sempre com os mesmos amigos | Um do grupo com lag derruba o time todo |

## 3. Canvas de proposta de valor

**Trabalho do jogador (job):** jogar a partida inteira com conexão previsível, para que o resultado
dependa só da habilidade.

**Dores**
- Ping alto e, pior, **instável** (jitter): o jogador não sabe em que confiar.
- *Packet loss*: tiros que não registram, personagem "teleportando".
- Rota da operadora fora do controle dele; reclamar com o provedor não resolve.
- Desconfiança: "isso é VPN? vou ser banido? é golpe?".
- Preço de assinatura (principal crítica nas avaliações).

**Ganhos desejados**
- Ping mais baixo e, sobretudo, **estável**.
- Zero perda de pacote causada pela rede.
- Funcionar sem configurar nada: abre, escolhe o jogo, joga.
- Prova visível de que está funcionando (gráfico, antes/depois).

**Como a ExitLag alivia as dores**
- **Multipath**: duplica os pacotes por várias rotas; se uma falha, outra chega primeiro. Sem queda perceptível.
- **Troca automática de rota** com análise em tempo real (a marca fala em IA).
- **Multi Internet**: até 4 conexões ao mesmo tempo (ex.: fibra + 4G); se uma cai, a outra segura.
- **Traffic Shaper**: limita outros apps para sobrar banda para o jogo.
- **FPS Boost**: ajustes do sistema para ganhar quadros.
- Teste grátis de 3 dias sem cartão; planos Duo e Squad baixam o preço por jogador.

**Prova (números públicos)**
- **+1.500 servidores** e **quase 1.800 jogos** (confirmado pelo Gabriel).
- 30M+ cadastros (fonte pública; confirmar antes de usar no site).
- 500+ provedores parceiros (ISPs); parcerias com Vivo e Gamers Club.
- Avaliações citam redução de 30% a 70% no ping em servidores internacionais (relato de usuários, não oficial).

## 4. A proposta, condensada

**Para** quem joga competitivo no PC e perde partidas por causa da rede,
**a ExitLag** é a camada de rota feita só para jogos
**que** manda cada pacote por várias rotas do planeta ao mesmo tempo,
**para que** a conexão fique **estável** do primeiro ao último round.
**Diferente de** VPNs e "boosters" genéricos, ela não troca seu IP nem passa sua navegação:
só otimiza o tráfego do jogo.

Mensagem central: **ping estável ganha partida.** Ping baixo é consequência, não a promessa principal.

### Headline do hero

| | PT-BR | EN |
|---|---|---|
| **Recomendada** | **Sua partida pelo caminho mais estável do planeta.** | **Your match, on the most stable route on Earth.** |
| Alternativa | Cada pacote, por várias rotas. Ao mesmo tempo. | Every packet. Many routes. At once. |
| Alternativa | O lag não decide mais suas partidas. | Lag doesn't decide your matches anymore. |

Subtítulo: "A ExitLag manda seu jogo por várias rotas ao mesmo tempo. Se uma oscila, outra entrega. Teste grátis por 3 dias, sem cartão."
/ "ExitLag sends your game through multiple routes at once. If one wobbles, another delivers. Free 3-day trial, no card."

CTA único em toda a página: **Testar grátis por 3 dias** / **Start 3-day free trial**.

### Pilares (viram capítulos do scroll)

1. **O problema**: a rota da sua operadora não foi feita para jogo; ela oscila.
2. **Multipath**: um pacote, várias rotas; se uma cai, a outra entrega.
3. **Estabilidade**: gráfico de ping da operadora (serrilhado) vs ExitLag (linha reta).
4. **Rede global**: +1.500 servidores, quase 1.800 jogos, o globo inteiro aceso.
5. **Também no mobile e no router (beta)**: faixa secundária, curta.
6. **CTA**: teste grátis.

## 5. Roteiro da landing "globo"

O scroll gira o planeta; cada capítulo é um estado do globo. CTA fixo no topo o tempo todo.

| Scroll | Globo | Texto |
|---|---|---|
| 0% | Planeta escuro, um ponto aceso na cidade do jogador (São Paulo), servidor do jogo pulsando ao longe | Headline + CTA |
| 15% | Rota da operadora: linha longa e tortuosa, pulsos falhando, gráfico de ping serrilhado ao lado | O problema |
| 35% | Rotas da ExitLag se traçam ao vivo, 3 a 4 ao mesmo tempo, convergindo no servidor | Multipath |
| 55% | Uma rota "cai" (apaga), as outras seguem; o gráfico continua reto | Estabilidade |
| 75% | Câmera abre, o globo gira rápido e acende a malha de +1.500 servidores | Rede global + números |
| 88% | Globo menor, ícones de PC (principal), mobile e router (selo beta) | Plataformas |
| 100% | Globo assenta, rota final brilha | CTA de teste grátis |

Regra de design: verde só em linhas de rota, pulsos e rótulos pequenos; nada de verde em tipografia grande.

## 6. Referência de motion e código: igloo.inc

O que se sabe publicamente (o site em si ainda está bloqueado na rede deste ambiente):
- Feito pela Abeto (Vicente Lucendo) com a Bureaux. Stack: **Three.js, Svelte, GSAP, Houdini, Blender**, com ferramentas próprias.
- **Tudo é WebGL, inclusive a UI**: o texto é renderizado com fontes SDF; o efeito de "scramble/glitch" das letras troca o offset da textura SDF no shader em vez de mexer no DOM.
- Blocos de gelo gerados por **crescimento procedural de cristais** dentro de um volume.
- **Volume data** exportado do Houdini (VDB) por um exportador próprio, comprimido para pesar menos que uma imagem.
- Rodapé com **partículas GPGPU** que se reorganizam em formas diferentes conforme o link em foco; a cor muda com a velocidade, brilham na transição, e há som sincronizado.
- Scroll guiando uma câmera por "capítulos" 3D, com transições amarradas ao scroll (GSAP).

O que vamos trazer para o globo:
1. **Scroll como timeline**: um único progresso 0 → 1 dirige rotação do globo, câmera e traçado das rotas (GSAP/Lenis ou scroll próprio com amortecimento).
2. **Rotas como partículas GPGPU**: os pacotes são partículas correndo pelas curvas; cor por velocidade, como no rodapé do igloo.
3. **Texto em shader** para números e rótulos (scramble em SDF), mantendo a headline em HTML para SEO e acessibilidade.
4. **Atmosfera e brilho** do globo em shader, com bloom contido.
5. Performance: tudo instanciado, uma textura de dados para as rotas, qualidade adaptativa por FPS.
## 7. Fontes

- [Como a ExitLag funciona (blog ExitLag)](https://www.exitlag.com/blog/how-exitlag-works/)
- [O que é ExitLag (blog PT)](https://www.exitlag.com/blog/pt/o-que-e-exitlag/)
- [Guia ExitLag 2026](https://www.exitlag.com/blog/exitlag-guide/)
- [ExitLag connects you to the world / Community Network](https://exitlag.com/business/community-network)
- [+500 ISPs parceiros](https://www.exitlag.com/pt/lp/isp)
- [Parceria ExitLag + Gamers Club (Teletime)](https://teletime.com.br/24/09/2025/exitlag-e-gamers-club-fazem-parceria-para-otimizar-de-rotas-de-internet/)
- [1 milhão de downloads no 1º ano mobile (Mobile Time)](https://www.mobiletime.com.br/noticias/08/04/2024/exitlag-registra-1-milhao-de-downloads-em-seu-primeiro-ano-mobile/)
- [Análise de avaliações no Google Play (Kimola)](https://kimola.com/reports/unlock-key-insights-with-the-exitlag-user-feedback-report-google-play-156690)
- [Alternativas à ExitLag (AlternativeTo)](https://alternativeto.net/software/exitlag/)
- [Igloo Inc: case study (Awwwards)](https://www.awwwards.com/igloo-inc-case-study.html)
- [Igloo Inc: crystal growth, shader-driven UI e volume data (webgpu.com)](https://www.webgpu.com/showcase/igloo-inc-procedural-crystals/)
- [Landing Site: Igloo Inc (fórum three.js)](https://discourse.threejs.org/t/landing-site-igloo-inc/67249)
