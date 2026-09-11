# Triagem de strings — ExitLag

Análise do registry de strings real (`registry.json`, hash `084fa52c`, gerado em
2026-09-09). **12.440 chaves** em três produtos, correspondendo a **4.716 textos únicos**.

> **Correção (11/09).** A primeira versão deste documento contava chaves, não textos. O
> registry carrega cada string em dois formatos — legado (`FTUESteps.chave`) e novo
> (`desktop.ftuesteps.categoria.label_chave`) — e as contagens de termos saíram infladas
> em cerca de 2×. Os números abaixo já estão corrigidos: contam texto único por produto.

Este documento substitui a lista candidata especulativa do dossiê pela **triagem com os
termos que estão de fato no produto**.

---

## 1. O achado que muda a urgência

**Nenhum dos 21 idiomas foi traduzido ainda.** Todas as 12.440 chaves estão idênticas ao
`en-US` em `ar`, `zh-Hans`, `zh-Hant`, `ko`, `es-ES`, `es-419`, `fil`, `fr`, `he`, `hi`,
`id`, `ja`, `fa`, **`pt-BR`**, `pt-PT`, `ru`, `th`, `tr`, `uk`, `vi`, `zgh`.

```
12.440 chaves × 21 idiomas = 261.240 traduções pendentes
 4.716 textos únicos × 21  =  99.036, se o sistema reusar tradução por texto idêntico
```

Qual dos dois vale depende de o string system deduplicar traduções — pergunta para o
Plassede. Em qualquer cenário, a ordem de grandeza sustenta o argumento.

**Consequência direta para a decisão:** a nomenclatura ainda não foi propagada. Decidir
agora custa uma revisão de termos em inglês. Decidir depois da tradução custa retrabalho em
até 261 mil strings.

Isso converte o argumento de timing de *"seria bom alinhar com o Plassede"* para
*"a janela fecha quando a tradução começar"*.

---

## 2. Inventário: termos técnicos no produto

Busca por ocorrência em `en-US`, com fronteira de palavra.

| Termo | Total | desktop | mobile | portal | Zona |
|---|---:|---:|---:|---:|---|
| `route` | 132 | 50 | 38 | 44 | **3 — decidir** |
| `ping` | 124 | 48 | 34 | 42 | **1 — manter** |
| `lag` | 82 | 2 | 20 | 60 | **1 — manter** |
| `routes` | 81 | 32 | 24 | 25 | **3 — decidir** |
| `latency` | 60 | 30 | 10 | 20 | **3 — decidir** |
| `packet` | 49 | 24 | 12 | 13 | **3 — decidir** |
| `dns` | 45 | 26 | 19 | 0 | **2 — traduzir** |
| `ms` | 26 | 24 | 0 | 2 | **1 — manter** |
| `jitter` | 22 | 6 | 8 | 8 | **3 — decidir** |
| `protocol` | 21 | 10 | 10 | 1 | **2 — traduzir** |

*Tabela completa em `pesquisa/triador/terms.json` — 36 termos.*

**Termos que eu havia listado como candidatos e que não existem no produto:** `MTU`,
`tickrate`, `throughput`. A lista especulativa errou em três de dezesseis.

### 2.1 O produto fala mais técnico que o site

| Termo | desktop | portal |
|---|---:|---:|
| `lag` (nativo) | **2** | **60** |
| `latency` (técnico) | **30** | 20 |

O marketing fala a língua do usuário; o produto fala a língua do sistema. **A distância
entre a promessa e a interface é mensurável.**

---

## 3. O ganho mais fácil: `Latency` vs `ping`

**14 rótulos curtos dizem literalmente "Latency"** — 7 no desktop, 6 no mobile e 1 no
portal (contando texto único):

```
HealthMonitoringPanel.latency            = "Latency"
MTRTool.latency                          = "Latency"
PingDetailsRttChart.latency-ms           = "Latency (ms)"
PingTcpingTool.latency-ms                = "Latency (ms)"
RealTimeMonitoringTab.latency-chart      = "Latency chart"
ResultsPage.latency                      = "Latency"
GameOptimization.LATENCY                 = "Latency"
...
```

**A ironia está nos nomes das chaves.** Os componentes se chamam `PingDetailsRttChart`,
`PingTcpingTool`, `PingMonitoring` — internamente o time chama de **ping**. O rótulo
exposto ao usuário é **Latency**.

> O vocabulário nativo está no código. O vocabulário técnico está na tela.
> Está invertido.

E `ping` aparece **124 vezes** no produto — não é um termo estranho ao vocabulário da casa.

### 3.1 A solução já existe dentro do produto

Duas chaves no mobile já resolvem a tensão exatamente como a pesquisa recomenda:

```
RealTimeMonitoringUserEducation.latency_title = "Latency (ping)"
```

**Termo técnico com o nativo entre parênteses.** É redundância de acesso — a saída que
Furnas propõe — aplicada por alguém do time, sem que virasse padrão. Uma string em 4.716.

**Recomendação:** promover esse padrão de exceção a regra. É a mudança de menor custo e
menor risco do inventário inteiro, e não exige decidir nada polêmico — ninguém perde o
termo que prefere.

---

## 4. Candidato a fluxo de teste

Aplicando a matriz de seleção aos componentes reais do desktop.

### 4.1 Densidade técnica por componente

| Componente | Strings | Técnicas | Densidade |
|---|---:|---:|---:|
| `BandwidthDrawer` | 25 | 25 | **100%** |
| `HealthMonitoringPanel` | 8 | 4 | 50% |
| `DNSOptimizerTab` | 43 | 19 | 44% |
| `ScannerRunningModal` | 35 | 11 | 31% |
| `ResultsPage` | 51 | 16 | 31% |
| `MTRTool` | 27 | 7 | 26% |
| `RegionSelection` | 31 | 5 | 16% |

### 4.2 Recomendação: `RegionSelection`

**31 strings, tela autocontida.** Não é a de maior densidade técnica, mas vence nos
critérios que importam para um primeiro teste.

**O produto já admite que a tela confunde.** Quatro escapes de ajuda estão embutidos nas
próprias strings:

```
what-s-the-difference    = "What's the difference?"
when-to-use-it           = "When to use it?"
faq                      = "FAQ"
find-out-more            = "Find out more"
```

Isso é **dúvida recorrente materializada no código**. Ninguém adiciona "Qual é a diferença?"
numa tela que está clara.

**A decisão que a tela pede é genuinamente ambígua:**

| Opção | Descrição atual |
|---|---|
| `Automatic` | "ExitLag dynamically selects the most efficient routes for your connection, optimizing it based on the game region, either globally or continentally." |
| `Manual` | "You select the ExitLag server closest to the game server to optimize your connection and potentially reduce latency." |
| `Community` | "For reduced latency and improved stability when connecting to a Community server." |

Três descrições que usam o mesmo vocabulário ("reduce latency", "improved stability",
"optimize your connection") para dizer coisas diferentes. O usuário precisa escolher sem
que o texto diferencie as consequências.

**Pontuação na matriz:**

| Critério | Nota | Por quê |
|---|:---:|---|
| Densidade de jargão | 2 | `latency`, `routes`, `server`, `continental` |
| Consequência ambígua | 3 | Três opções descritas com os mesmos termos |
| Dúvida já conhecida | 3 | Quatro escapes de ajuda embutidos |
| Custo do erro | 3 | Escolha errada = performance pior = churn |
| Leitura real | 3 | Configura uma vez, lê de verdade |
| Isolabilidade | 3 | Tela autocontida, só texto |
| Volume | ? | **Precisa ser confirmado com dados de uso** |

### 4.3 Alternativa: `BandwidthDrawer`

25 strings, **100% técnicas**. Também tem sinal de confusão embutido — `inaccurate-data` =
*"Inaccurate data?"*. É um fluxo linear de teste de velocidade, mais fácil de instrumentar,
mas provavelmente com menos volume por ser parte da configuração do Traffic Shaper.

**Fica como segundo candidato**, ou como o teste seguinte.
