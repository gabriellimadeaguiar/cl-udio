# Triagem de strings — ExitLag

Análise do registry de strings real (`registry.json`, hash `084fa52c`, gerado em
2026-09-09). **12.440 chaves** distribuídas em três produtos.

Este documento substitui a lista candidata especulativa do dossiê pela **triagem com os
termos que estão de fato no produto**.

---

## 1. O achado que muda a urgência

**Nenhum dos 21 idiomas foi traduzido ainda.** Todas as 12.440 chaves estão idênticas ao
`en-US` em `ar`, `zh-Hans`, `zh-Hant`, `ko`, `es-ES`, `es-419`, `fil`, `fr`, `he`, `hi`,
`id`, `ja`, `fa`, **`pt-BR`**, `pt-PT`, `ru`, `th`, `tr`, `uk`, `vi`, `zgh`.

```
12.440 chaves × 21 idiomas = 261.240 traduções ainda não feitas
```

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
| `ping` | 314 | 122 | 84 | 108 | **1 — manter** |
| `route` / `rota` | 310 | 108 | 80 | 122 | **3 — decidir** |
| `lag` | 196 | 4 | 44 | 148 | **1 — manter** |
| `latency` | 142 | 72 | 22 | 48 | **3 — decidir** |
| `DNS` | 94 | 54 | 40 | 0 | **2 — traduzir** |
| `packet loss` | 88 | 36 | 14 | 38 | **3 — decidir** |
| `protocol` | 62 | 30 | 30 | 2 | **2 — traduzir** |
| `jitter` | 54 | 14 | 18 | 22 | **3 — decidir** |
| `VPN` | 50 | 0 | 36 | 14 | contexto próprio |
| `fps` | 34 | 8 | 2 | 24 | **1 — manter** |
| `IP` | 32 | 20 | 10 | 2 | **2 — traduzir** |
| `TCP` / `UDP` | 30 | 16 | 14 | 0 | **2 — traduzir** |
| `bandwidth` | 28 | 22 | 0 | 6 | **3 — decidir** |
| `driver` | 28 | 28 | 0 | 0 | **2 — traduzir** |
| `multipath` | 26 | 2 | 16 | 8 | **2 — traduzir** |
| `proxy` | 22 | 20 | 0 | 2 | **2 — traduzir** |
| `timeout` | 14 | 0 | 2 | 12 | **2 — traduzir** |
| `firewall` | 10 | 10 | 0 | 0 | contexto próprio |
| `hops` | 6 | 6 | 0 | 0 | **2 — traduzir** |
| `tunnel` | 2 | 0 | 2 | 0 | **2 — traduzir** |
| `socket` | 2 | 0 | 0 | 2 | **2 — traduzir** |

**Termos que eu havia listado como candidatos e que não existem no produto:** `MTU`,
`tickrate`, `throughput`. A lista especulativa errou em três de dezesseis.

### 2.1 O produto fala mais técnico que o site

| Termo | desktop | portal |
|---|---:|---:|
| `lag` (nativo) | **4** | **148** |
| `latency` (técnico) | **72** | 48 |

O marketing fala a língua do usuário; o produto fala a língua do sistema. **A distância
entre a promessa e a interface é mensurável.**

---

## 3. O ganho mais fácil: `Latency` vs `ping`

**28 rótulos curtos dizem literalmente "Latency"** — sendo 14 no desktop, 12 no mobile e 2
no portal:

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

E `ping` aparece **314 vezes** no produto — não é um termo estranho ao vocabulário da casa.

### 3.1 A solução já existe dentro do produto

Duas chaves no mobile já resolvem a tensão exatamente como a pesquisa recomenda:

```
RealTimeMonitoringUserEducation.latency_title = "Latency (ping)"
```

**Termo técnico com o nativo entre parênteses.** É redundância de acesso — a saída que
Furnas propõe — aplicada por alguém do time, sem que virasse padrão. Duas chaves em 12.440.

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

---

## 5. Próximos passos revisados

| # | Passo | Mudou porque |
|---|---|---|
| 1 | **Levar o dado das 261 mil traduções pendentes para a Cassa e o Plassede** | O timing deixou de ser argumento e virou número |
| 2 | Promover `Latency (ping)` a padrão nos 28 rótulos | Custo mínimo, risco nulo, padrão já existe no produto |
| 3 | Confirmar volume de uso do `RegionSelection` | É o único critério da matriz que os dados de string não respondem |
| 4 | Levar a triagem por zona à mesa do DS | Agora com números reais, não com lista especulativa |
| 5 | Desenhar o teste no `RegionSelection` | — |

---

## 6. O que esta análise não responde

- **Volume de uso por tela.** O registry diz o que existe, não quantas pessoas passam por
  ali. Sem isso não há como calcular poder estatístico.
- **Se `jitter`, `packet loss` e `route` são marcadores de pertencimento** na comunidade da
  ExitLag. O teste do fórum (buscar se o termo circula sem explicação) resolve isso e não
  foi feito.
- **Quais strings estão em superfícies visíveis** vs. logs e telas de diagnóstico avançado.
  A chave não distingue.
- **Se o pt-BR não traduzido é intencional** (aguardando decisão) ou pendência de processo.
  Vale confirmar com o Plassede — muda a leitura da urgência.
