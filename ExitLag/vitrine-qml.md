# Vitrine: guia de port para Qt Quick / QML

`vitrine.html` é o protótipo de referência da home de jogos. Ele roda no navegador com WebGPU
(e cai para CSS 3D sem WebGPU), mas foi escrito para virar QML nativo: cada bloco da página,
cada estado e cada passe de render tem um equivalente em Qt 6 (Qt Quick + Qt Quick 3D).

## O que a home precisa provar (produto)

O jogo em foco mostra o valor da ExitLag em até 3 segundos, sem clique:

1. **Ping sem ExitLag** sobe primeiro (barra vermelha, rota vermelha única que perde pacotes no piso).
2. **Ping com ExitLag** cai em seguida (barra verde, rotas verdes em paralelo chegam ao servidor).
3. **Ferramentas por jogo**: três chips dizem o que cada ferramenta entrega *naquele jogo*
   (ex.: Traffic Shaper "jitter 6 → 1 ms", PC Boost "+18 FPS"). Passar o mouse num chip acende a
   ferramenta no rail.
4. CTA único: **Otimizar e jogar**.

Abaixo do palco, a grade de ferramentas mostra o estado de cada uma com um número (não só "ligado").

## Componentes

| HTML | QML | Observação |
| --- | --- | --- |
| `.rail` | `ToolRail.qml` | `ColumnLayout` + `Repeater` sobre `ToolModel`; `lit` = binding com `hud.hoveredTool` |
| `.top` | `TopBar.qml` | `RowLayout`: `TextField` de busca, pílula "Rota ativa", plano |
| `.stage canvas` | `StageView.qml` | `View3D` com `Repeater3D { model: GameModel; delegate: GameCard {} }` |
| `.hud` | `GameHud.qml` | `ColumnLayout` sobre o `View3D`; lê `carousel.currentGame` |
| `.tag` | `RouteTag.qml` | posição via `view3D.mapFrom3DScene(Qt.vector3d(...))` a cada quadro |
| `.thumbs` | `GameStrip.qml` | `ListView` horizontal, `currentIndex` ligado a `carousel.focusTarget` |
| `.tools` | `ToolGrid.qml` | `GridLayout { columns: width > 1100 ? 3 : 2 }` + `Repeater` |
| fallback CSS 3D | não precisa | o app Qt sempre tem RHI (D3D11/Vulkan/Metal) |

## Estado (um `QtObject` chamado `carousel`)

| Propriedade | Tipo | JS | QML |
| --- | --- | --- | --- |
| `focusTarget` | int | `S.target` | definido por setas, swipe, clique em card, `ListView` |
| `focus` | real | `S.focus` (mola criticamente amortecida, k = 60) | `Behavior on focus { SpringAnimation { spring: 7.7; damping: 1.0 } }` |
| `currentIndex` | int | `idx(S.focus)` | `((Math.round(focus) % count) + count) % count` |
| `reveal` | real 0..1 | `S.reveal`, 2,4 s | `NumberAnimation on reveal { from: 0; to: 1; duration: 2400 }` reiniciada em `onCurrentIndexChanged` |
| autoplay | 7,5 s | `AUTOPLAY` | `Timer { interval: 7500; running: !hovered && !reducedMotion }` |

Linha do tempo do `reveal` (a mesma no HUD e nos shaders):

| reveal | HUD | Palco |
| --- | --- | --- |
| 0 → 0,25 | barra e número "sem" sobem até o ping sem ExitLag | rota vermelha acende, pacotes se perdem |
| 0,30 → 0,80 | número "com" cai do ping sem até o ping com | rotas verdes avançam do PC até o servidor |
| 0,45 → 0,85 | | rota vermelha apaga para 25% |
| 0,75 → 0,95 | etiqueta do servidor aparece | anel verde do servidor pulsa |

Posição de cada card em função de `d = índice − focus` (com volta circular): ver `placeCard()`.
Em QML, use a mesma função num `property real d` do delegate e bindings em `x`, `z`, `eulerRotation.y`, `opacity`.

## Passes de render → Qt Quick 3D

| Passe WebGPU | Qt Quick 3D |
| --- | --- |
| Cena HDR `rgba16float` com MSAA 4x | `SceneEnvironment { antialiasingMode: SceneEnvironment.MSAA; antialiasingQuality: SceneEnvironment.High }` |
| Cards: arte + verniz (clearcoat) + chanfro | `PrincipledMaterial { baseColorMap; emissiveMap (tela acesa); clearcoatAmount: 1; clearcoatRoughnessAmount: 0.05 }` em um `Model` com cantos arredondados (malha `.mesh` ou `ProceduralMesh`) |
| Ambiente refletido (softbox, fitas vermelha e fria) | `lightProbe` com uma HDR de estúdio, ou `CustomMaterial` com a função `env()` |
| Refletor + sombra de contato | `SpotLight { castsShadow: true; coneAngle: 38; innerConeAngle: 30 }` |
| Contraluz vermelho | `PointLight { color: "#f52929" }` |
| Piso: reflexo planar com desfoque que cresce com a altura | `CustomMaterial` no piso amostrando a textura de uma segunda `View3D` com câmera espelhada (`Texture { sourceItem: mirrorView }`); o desfoque Poisson de 12 amostras é o mesmo código |
| Rotas: fitas de luz no piso | `ProceduralMesh` (faixas de triângulos) + `CustomMaterial` aditivo (`shadingMode: CustomMaterial.Unshaded`, `sourceBlend: One`, `destinationBlend: One`) |
| Bloom (descida 13 amostras / subida tenda) | `ExtendedSceneEnvironment { glowEnabled: true; glowBloom: 0.6; glowHDRMinimumValue: 0.9 }` |
| Feixe volumétrico do refletor | `Effect` customizado lendo `DEPTH_TEXTURE` (ray-march de 22 passos) |
| ACES + vinheta + aberração cromática + grão | `tonemapMode: SceneEnvironment.TonemapModeAces`, `vignetteEnabled`, `lensFlare`/`Effect` para o resto |

### Shaders

Os WGSL (`WGSL_SCENE`, `WGSL_POST`, `WGSL_COMPOSITE`) foram escritos para traduzir linha a linha
para GLSL 440 (o formato que o `qsb` compila para SPIR-V, HLSL e MSL):

- `vec3f`/`vec4f` → `vec3`/`vec4`; `mat4x4f` → `mat4`; `select(a, b, c)` → `c ? b : a`.
- `struct Frame` (uniform, 256 bytes, alinhamento std140) → bloco `uniform buf { ... }` do `ShaderEffect`
  ou as propriedades de um `CustomMaterial`.
- `override MIRROR` → `#define MIRROR` em uma segunda variante do material.
- `fwidth`, `textureSampleLevel`, `textureLoad` (profundidade MSAA) têm equivalentes diretos.
- Nada usa `pow()` com base negativa (indefinido em WGSL e em GLSL): use `gauss(x) = exp(-x*x)`.

## Dados

`GAMES` e `TOOLS` no topo do script viram `ListModel`s (ou um modelo C++ exposto ao QML).
Campos por jogo: nome, gênero, publisher, servidor, `sem`/`com` (ms), perda sem → com, nº de
rotas, arte e três pares `[ferramenta, efeito]`. Os números do protótipo são de exemplo.

## Arte

Capas oficiais embutidas: League of Legends, Fortnite, Throne and Liberty. Os outros jogos usam
uma arte provisória gerada (marcada "ARTE PROVISÓRIA" no card) até a key art oficial entrar.
Para trocar: coloque a imagem no objeto `ART` como data URI (o protótipo é autocontido) e aponte
o campo `art` do jogo para a chave. Qualquer proporção serve; o card recorta em 16:10 (*cover*).
