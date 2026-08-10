# Copy orientado à intenção do usuário

**Pesquisa para decisão de adoção** — prós, contras, base acadêmica e cases com indicador.

Data: 10 de agosto de 2026

---

## Resumo para decisão

**Adotar, com escopo limitado e teste próprio.** A evidência de que a linguagem da
interface deve partir do vocabulário e da tarefa do usuário — e não da arquitetura do
sistema — é sólida, antiga e replicada. O achado mais forte não vem do design: vem de um
estudo de 1987 que mediu escolha espontânea de palavras e encontrou que **duas pessoas
escolhem o mesmo termo para a mesma coisa com probabilidade menor que 0,20**.

Mas três ressalvas mudam a decisão de "adotar sempre" para "adotar onde importa":

1. **O ganho vem de pesquisar o vocabulário, não de escrever melhor.** O mesmo estudo que
   justifica a prática mostra que *adivinhar* a palavra do usuário falha em 80–90% dos
   casos. Sem pesquisa de vocabulário, você troca o palpite do engenheiro pelo palpite do
   designer.
2. **O efeito não é universal.** Um estudo de 2023 com questionários web não encontrou
   efeito positivo geral de linguagem simples sobre qualidade de dados — o benefício se
   concentrou em respondentes de menor letramento.
3. **A técnica é neutra quanto à ética.** Os mesmos mecanismos que ajudam alguém a
   entender uma ação também aumentam aceitação quando usados para constranger. Há efeito
   medido, e ele recai desproporcionalmente sobre pessoas de menor escolaridade.

**Se você precisa de um único número para a reunião**, use este: em ensaio clínico
randomizado com alocação ocultada e cegamento, versões em linguagem simples produziram
**19,8% a mais de respostas corretas** de compreensão (IC 95% 14,7–24,9%; P < 0,001). É o
dado de melhor qualidade metodológica do documento. Evite o "+124%" — ele é real, mas é um
índice composto de 1997, e não sobrevive a uma pergunta sobre o que exatamente foi medido.

**Confiança:** alta para o princípio, média para o tamanho do efeito, baixa para
transferência direta dos números de case para o seu contexto.

---

## O que é (definição operacional)

Escrever os elementos de ação de um software na linguagem do **objetivo do usuário**, em
vez da linguagem da **arquitetura do sistema**.

| Linguagem do sistema | Linguagem da intenção |
|---|---|
| `Submit` | `Enviar candidatura` |
| `OK` (num diálogo de descarte) | `Descartar rascunho` |
| `Configurar recorrência` | `Repetir toda semana` |
| `Erro 422: payload inválido` | `Faltou o CEP. Preencha para continuar.` |
| `Gerenciar entidades` | `Meus clientes` |

**Está no escopo:** rótulos de botão, títulos de confirmação, mensagens de erro, estados
vazios, nomenclatura de navegação e de funcionalidades.

**Fora do escopo:** personalização dinâmica por intenção inferida, copy de aquisição,
tom de voz/branding, internacionalização.

---

## Como ler este documento

Cada afirmação carrega uma etiqueta de evidência. Isso existe para você saber, numa
reunião, o que sustenta pressão e o que não sustenta.

| Etiqueta | Significado |
|---|---|
| **[A]** | Empírico revisado por pares — experimento com método declarado |
| **[B]** | Teoria estabelecida em HCI — explica mecanismo, não fornece número próprio |
| **[C]** | Case institucional — a organização publicou o número sobre si mesma |
| **[D]** | Consenso de prática — recomendação de autoridade, sem estudo próprio |

Há ainda uma seção **"Números que descartei"**, com valores que circulam amplamente e não
resistiram à verificação. Ela é parte do resultado, não um apêndice.

---

## Base teórica — por que deveria funcionar

### O problema do vocabulário [A]

Furnas, Landauer, Gomez e Dumais (*Communications of the ACM*, 1987) mediram como pessoas
nomeiam espontaneamente objetos e ações em cinco domínios de aplicação.

- Em todos os casos, **duas pessoas escolheram o mesmo termo com probabilidade < 0,20**.
- A abordagem usual — acesso por *uma* palavra favorita do projetista — produz
  **80–90% de falha** em situações comuns.
- A estratégia ótima derivada pelos autores é o *unlimited aliasing*: aceitar múltiplos
  nomes para a mesma coisa, com ganhos de várias vezes.

Este é o achado mais importante da pesquisa, e ele corta para os dois lados. Justifica
usar a linguagem do usuário **e** demonstra que não existe "a" palavra certa a ser
adivinhada. A implicação prática é desconfortável: a intervenção que funciona é *medir* o
vocabulário, não *escrever com mais empatia*.

*Limite de extrapolação:* o estudo é de 1987 e trata de comandos e termos de indexação,
não de rótulos de botão em interfaces gráficas modernas. O mecanismo — variabilidade
lexical entre pessoas — não depende da época, mas o tamanho do efeito em UI atual não foi
medido por este trabalho.

### Golfo de execução [B]

Donald Norman descreve a distância entre a intenção do usuário e as ações que o sistema
oferece. Quando a interface é nomeada pela sua própria estrutura interna, o usuário
precisa traduzir o objetivo dele para a linguagem da máquina — e essa tradução é onde o
erro acontece. É o arcabouço conceitual da prática, sem número próprio.

### Rastro de informação (*information scent*) [B]

Pirolli e Card modelaram navegação como forrageamento: o usuário decide onde clicar por
pistas locais. Quando o rótulo contém as **palavras-gatilho** da tarefa que ele tem em
mente, o rastro é forte e ele segue; quando não contém, ele hesita ou abandona. Explica
por que rótulos genéricos custam caro em fluxos de decisão.

---

## Evidência empírica

> **Estado da auditoria (10/08/2026).** As colunas de método e N abaixo foram
> complementadas por busca dirigida numa segunda passada. Continuam **sem leitura de
> texto completo** — ver [Limitações](#limitações-desta-pesquisa). Itens marcados
> `⚠ em aberto` ainda precisam de verificação na fonte.

| # | Estudo | Método e N | Achado | Direção |
|---|---|---|---|---|
| 1 | Furnas et al., *CACM*, 1987 | Escolha espontânea de palavras, 5 domínios. Autores na Bell Communications Research. **N total `⚠ em aberto`** (há referência a "24 subjects" em um dos conjuntos, não confirmada como total) | Concordância entre duas pessoas < 0,20; palavra única do designer → 80–90% de falha | **A favor** |
| 2 | Morkes & Nielsen, 1997 (também *CHI 98*) | **51 participantes**, 5 variações do mesmo site, cada uma com estilo de escrita diferente. Tarefas de busca de resposta | Conciso **+58%**; escaneável **+47%**; objetivo **+27%**; combinado **+124%** | **A favor** |
| 3 | Plain language RCTs, *J Clin Epidemiol*, 2023 (adultos e pais) e ensaio com jovens | RCTs de superioridade, online, alocação ocultada, cegos. Poder calculado para **122 por braço (244 total)**; **≥240 por população**. Estudo com pais: 295 randomizados, 241 completaram (121 intervenção / 120 controle). Desfecho primário: proporção de acertos em 7 perguntas de compreensão | Diferença média de **19,8%** em acertos (IC 95% 14,7–24,9%; **P < 0,001**) para a recomendação da OMS | **A favor** |
| 4 | Martínez, Mollica & Gibson, *PNAS*, 2023 | **105 advogados dos EUA**. **Dois experimentos pré-registrados**. Exp. 1: 12 pares de trechos de contrato (legalês vs. simplificado), testando compreensão e recordação | **Advogados também** compreendem e recordam pior o "legalês". Exp. 2: avaliam contratos simplificados como igualmente exequíveis **e preferíveis** em qualidade geral, adequação de estilo e probabilidade de assinatura pelo cliente | **A favor** (inclui especialistas) |
| 5 | *Int. J. Social Research Methodology*, 2023 (28:1) — GESIS | Desenho entre-sujeitos, questionário web, linguagem simples vs. padrão. **N `⚠ em aberto`** | **Sem efeito positivo geral** sobre qualidade de dados. Ganho concentrado em quem fala outro idioma em casa: menos não-resposta de item, mais diferenciação | **Contra / limitante** |
| 6 | Kunz, Gummer & Neuert, 2026 (*Field Methods*) | Escala multi-item em linguagem simples. **N `⚠ em aberto`** | Maior diferenciação, menos respostas no ponto médio, **tempos de resposta menores** | **A favor** |
| 7 | Pesquisa sobre *confirmshaming* | Experimento com condição de controle. **N `⚠ em aberto`** | Copy manipulativo elevou aceitação em **4,8 pontos percentuais** (14,8% → 19,6%), **+32,4% relativo** | **Alerta ético** |
| 8 | University of Chicago Law School | Estudo sobre design manipulativo. **N `⚠ em aberto`** | Copy manipulativo aumentou cadastros em **≥5%**, afetando desproporcionalmente pessoas de **menor escolaridade** | **Alerta ético** |

### O que a auditoria mudou

**Item 2 ficou mais forte e mais limitado ao mesmo tempo.** Confirmei os 51 participantes e
o que compõe a "usabilidade medida": **tempo de tarefa, erros, memória e satisfação
subjetiva**. É um índice composto de quatro dimensões — não uma métrica única e não uma
métrica de negócio. O `+124%` é real, mas significa "melhora no índice agregado", o que é
bem menos impressionante do que soa quando citado solto. Continue tratando com cautela.

**Item 3 ganhou um tamanho de efeito de verdade.** A diferença média de **19,8% em
respostas corretas** (IC 95% 14,7–24,9%, P < 0,001) é o número mais defensável de todo o
documento: vem de RCT com alocação ocultada, cegamento, poder calculado a priori e
desfecho primário declarado. Se você precisa de **um** número para sustentar o argumento
numa reunião, use este — e não o +124%.

**Item 4 é metodologicamente melhor do que eu havia registrado.** São **dois experimentos
pré-registrados** com 105 advogados. Pré-registro é uma salvaguarda forte contra
*p-hacking*; isso eleva a confiabilidade acima da média da tabela.

> ⚠ **Inconsistência que encontrei no meu próprio relatório.** Os itens 5 e 6 vêm do mesmo
> grupo de pesquisa (GESIS) e tratam do mesmo tema. Numa das buscas, o achado de "maior
> diferenciação, menos respostas no ponto médio e tempos menores" apareceu atribuído ao
> estudo de **2023**, e noutra ao de **2026**. Registrei como item 6, mas **não consigo
> confirmar qual dos dois artigos traz esse resultado** sem abrir os textos. Se for o de
> 2023, a contraevidência do item 5 é mais matizada do que apresento — e a leitura cruzada
> abaixo precisa ser revista. **Trate os itens 5 e 6 como um par a ser desembaraçado antes
> de usar qualquer um dos dois.**

### Leitura cruzada

Os itens 3 e 4 convergem, e são os dois mais fortes metodologicamente da tabela: reescrever
na linguagem de quem lê melhora compreensão em populações e domínios diferentes. O item 4
derruba a objeção mais comum em produtos técnicos — "meu usuário é especialista, prefere o
termo técnico". Advogados, diante de texto jurídico, também se saem pior com jargão.

O item 6 apontaria na mesma direção, mas está sujeito à ambiguidade sinalizada acima e não
deve ser usado como apoio até que o par 5/6 seja desembaraçado.

O item 5 é a contraevidência honesta e não deve ser minimizada: quando a tarefa é
*responder um questionário* (e não *encontrar e executar uma ação*), a linguagem simples
não moveu a qualidade dos dados no agregado. Isso sugere que o benefício depende do tipo
de tarefa — ele aparece onde há **decisão e execução**, que é justamente o caso de copy
de ação. Mas essa é minha leitura conectando dois contextos, não um achado dos autores.

Os itens 7 e 8 mostram que a mesma alavanca funciona para manipular. Um programa de copy
orientado à intenção precisa de um critério explícito de fronteira, ou vira otimização de
conversão com verniz de UX.

---

## Prós

1. **Reduz a tradução mental que o usuário precisa fazer** [B] — o golfo de execução
   encolhe quando o rótulo já está na linguagem do objetivo.
2. **Ataca a maior fonte de falha de acesso: o vocabulário** [A, item 1] — e é uma falha
   grande, medida, e quase sempre invisível para quem construiu o sistema.
3. **Efeito composto** [A, item 2] — as melhorias de escrita somaram mais juntas (+124%)
   do que qualquer uma isolada (+27% a +58%). Sugere que vale tratar como programa, não
   como ajuste pontual.
4. **Funciona também com especialistas** [A, item 4] — remove a objeção de produto
   técnico.
5. **Melhora acessibilidade para quem mais precisa** [A, itens 3 e 5] — o benefício é
   consistentemente maior em populações de menor letramento ou não-nativas. É um ganho de
   equidade, não só de eficiência.
6. **Barato de testar** [C] — mudança de texto não exige migração nem refatoração, o que
   torna o custo de um experimento controlado muito baixo comparado a mudanças estruturais.

---

## Contras e riscos

1. **O ganho exige pesquisa de vocabulário, não boa vontade** [A, item 1]. Sem estudo de
   nomenclatura com usuários reais, você substitui um palpite por outro. Este é o custo
   real de adoção e o mais subestimado.
2. **Efeito não é universal** [A, item 5]. Em tarefa de resposta a questionário, não houve
   ganho agregado. Não assuma transferência automática entre tipos de tarefa.
3. **Verbosidade tem custo.** Rótulos de intenção tendem a ser mais longos que os
   genéricos. O estudo de maior efeito da tabela (item 2) premiou justamente a
   **concisão** — ou seja, "mais explícito" e "melhor" não são a mesma coisa. Há tensão
   real entre ser específico e ser curto.
4. **Custo de manutenção e tradução.** Rótulos específicos multiplicam strings, quebram
   reuso de componentes e encarecem localização. Um botão `Confirmar` reusado em 40 telas
   vira 40 textos distintos, cada um com sua tradução.
5. **Conflito com design systems.** Componentes de diálogo padronizados frequentemente
   assumem pares genéricos. Adotar copy de intenção implica renegociar o design system,
   não só reescrever telas.
6. **Risco de presumir a intenção errada.** Um rótulo específico e *errado* é pior que um
   genérico: ele afirma com confiança algo que não corresponde ao que o usuário quer.
7. **Fronteira ética estreita** [A, itens 7 e 8]. Copy que "reflete a intenção" desliza
   com facilidade para copy que *fabrica* intenção. O efeito medido do constrangimento é
   real e recai mais sobre pessoas de menor escolaridade.
8. **Fricção deliberada pode ser dark pattern.** Tornar explícita a consequência de uma
   ação destrutiva é bom; tornar a saída emocionalmente custosa não é a mesma coisa,
   embora as duas se pareçam no código.

---

## Quando NÃO usar

- **Ações repetitivas de usuário experiente.** Depois da décima vez, o rótulo longo vira
  ruído. O usuário já não lê — ele mira a posição.
- **Vocabulário de domínio já estabelecido.** Se o termo técnico *é* a palavra que o
  usuário usa no dia a dia, ele não é jargão para essa audiência. Explicar o óbvio pode
  sinalizar que o produto não foi feito para ele. [D]
- **Restrição severa de espaço.** Barras de ferramentas, células de tabela, mobile
  denso — onde truncar destrói mais sentido do que o rótulo específico agrega.
- **Quando você não pesquisou o vocabulário.** Sem dados, o ganho esperado não se
  sustenta (item 1).
- **Ações de baixo risco e alta frequência.** O custo de errar é baixo e o custo de ler é
  pago toda vez.

---

## Cases com indicador publicado

Esta é a seção mais fraca do relatório, e por um motivo estrutural: quase ninguém publica
teste isolado de copy com metodologia. O que existe são relatos de empresa, sem amostra,
duração ou significância. Apresento os dois que sobreviveram à verificação, com o que
**não** foi divulgado.

### Preply — nomenclatura de tipo de aula [C]

Plataforma de aulas de idiomas. O produto oferecia duas formas de agendar: escolher cada
data manualmente (*One-by-one*) ou criar rotina recorrente (*Weekly*). O volume de
agendamentos recorrentes estava abaixo do esperado. A equipe passou a **nomear os tipos
de aula com a linguagem dos usuários**.

| Métrica | Resultado |
|---|---|
| Aulas regulares agendadas | **+11%** |
| Horas compradas na plataforma | **+7,8%** |

Relatado por Viktoria Kosiak, UX Writer da Preply, em publicação do blog da Frontitude.

**O que não foi divulgado:** wording exato de antes e depois, tamanho de amostra, duração,
significância estatística, se houve outras mudanças simultâneas.

> ⚠ **Busca dirigida pelo wording exato: sem sucesso.** Numa segunda passada procurei
> especificamente o texto antes/depois dos rótulos, inclusive na central de ajuda da
> Preply — que hoje usa os termos "weekly lessons", "regular lessons" e "subscription".
> Não é possível determinar qual era o rótulo original nem qual o substituiu.
>
> **Consequência para o seu uso:** este case comprova que *mudar o copy* moveu métrica.
> Não comprova *qual princípio de nomenclatura* funcionou. Para virar guideline de design
> system, ele é insuficiente — serve para justificar o experimento, não para copiar a
> solução.

**Nuance que importa para a sua decisão:** a própria fonte declara que alunos com agenda
semanal têm melhor retenção e que promover o formato semanal "sempre foi do interesse do
negócio". O caso é, portanto, tanto um exemplo de alinhamento com a intenção do usuário
quanto de direcionamento comercial. Os dois objetivos coincidiram aqui — não há garantia
de que coincidam sempre, e é exatamente nessa junção que mora o risco ético da seção
anterior.

### GOV.UK / Government Digital Service — guia para abertura de empresas [C]

Reorganização de conteúdo orientada a necessidade do usuário, reduzindo **50 páginas
para 16** (2017).

| Métrica | Resultado |
|---|---|
| Cliques para os serviços necessários | **+25%** |
| Páginas por sessão até chegar ao serviço | **−5%** |

**Ressalva importante:** este case mistura redução de conteúdo com reescrita orientada à
tarefa. Não é possível isolar quanto do ganho veio do texto e quanto veio de haver menos
páginas competindo entre si. Serve como evidência do programa, não da técnica isolada.

### Por que não há mais cases aqui

Busquei ativamente cases nomeados com métrica em blogs de engenharia e design de empresas
de produto. O que encontrei repetidamente foram números sem empresa identificada, números
sem fonte primária, ou estudos de caso de fornecedores de ferramentas de teste A/B com
incentivo comercial evidente. Nenhum deles passa no critério de rigor que combinamos.

---

## Números que descartei

Todos estes circulam em artigos sobre microcopy e UX writing. Nenhum resistiu à
verificação. Se aparecerem numa apresentação interna, você agora sabe o que perguntar.

| Número que circula | Por que descartei |
|---|---|
| "+20% em taxa de interação, segundo o Nielsen Norman Group" | Atribuído ao NN/g em artigos de SEO, sem link para estudo algum. Não localizei a fonte. |
| "−15% no tempo de conclusão de tarefa" | Mesma origem, mesma ausência de fonte. |
| "+30% de cliques ao trocar botão genérico por 'Sign Up for Free Trial'" | Sem estudo, sem amostra, sem contexto. |
| "Empresa X reescreveu o onboarding: +23% de conclusão e −15% de tickets" | A fonte não nomeia a empresa. Número não auditável por construção. |
| "Going.com: +104% em inícios de teste ao trocar o CTA" | Blog de fornecedor de teste A/B. Sem amostra, duração ou significância. |
| "Portal B2B: +38,26% ao mudar uma palavra do CTA" | Idem. A precisão decimal sugere leitura direta de painel, não análise. |
| "Booking.com: +5% em conversão simplificando copy" | Não localizei publicação primária da Booking.com com esse dado. |
| "Rastro de informação forte reduz tempo de navegação em 30–50%" | Aparece em site agregador atribuído a "Nielsen 2003, 2004", sem referência rastreável. |

Observação sobre o item 2 da tabela de evidências (Morkes & Nielsen, +124%): este número
**é** rastreável a um estudo real, com desenho descrito e publicação associada ao CHI 98.
Ainda assim, trate-o com cautela — é de 1997, sobre páginas web de conteúdo, e
"usabilidade medida" é um índice composto, não uma métrica de negócio.

---

## Como testar no seu produto

O tamanho de efeito dos cases não transfere. Use-os para justificar o experimento, não
para prever o resultado.

### Sequência recomendada

1. **Pesquisa de vocabulário primeiro.** Peça a 15–20 usuários que descrevam, com as
   próprias palavras, o que querem fazer no ponto do fluxo em questão. Não ofereça
   opções — a variabilidade é o dado. Se a concordância vier baixa, isso confirma o
   achado de Furnas no *seu* contexto e já é argumento.
2. **Escolha um fluxo de alto valor e baixa frequência.** Alto valor para o efeito ser
   detectável; baixa frequência para o usuário realmente ler o texto.
3. **Mude uma coisa.** Copy isolado, sem alterar layout, fluxo ou hierarquia visual.
4. **Teste A/B com poder estatístico calculado antes.** Defina o efeito mínimo detectável
   de interesse e derive a amostra a partir dele.

### Métricas, em ordem de qualidade

| Métrica | Por que |
|---|---|
| Conclusão da tarefa pretendida | O que a técnica promete afetar diretamente |
| Taxa de erro e de desfazer/retrabalho | Captura o custo de o usuário ter entendido errado |
| Tempo até a primeira ação bem-sucedida | Sensível a hesitação |
| Tickets de suporte sobre aquele fluxo | Efeito a jusante, com atraso |
| Conversão | Última — é onde intenção do usuário e interesse do negócio se confundem |

### Critério de decisão

Defina **antes** do teste qual efeito justificaria o custo de manutenção, tradução e
renegociação do design system. Se o ganho for real mas menor que esse limiar, a resposta
correta é não adotar de forma ampla — e isso é um resultado válido, não um fracasso.

### Salvaguarda ética

Antes de subir qualquer variante, aplique um teste simples: *se o usuário visse o
resultado do experimento, ele se sentiria melhor ou pior servido?* Se a variante vencedora
ganha porque comunica melhor, adote. Se ganha porque constrange ou obscurece, você mediu
um efeito real (itens 7 e 8) e mesmo assim deve descartá-la.

---

## Limitações desta pesquisa

Declaradas para você calibrar o quanto apoiar decisão nisto.

1. **Não li os textos completos das fontes primárias.** O ambiente onde esta pesquisa foi
   executada bloqueia acesso de rede a domínios externos — ACM, PubMed, PNAS, gov.uk e
   demais foram inacessíveis, e continuavam inacessíveis na segunda passada. A verificação
   foi feita por convergência de múltiplas buscas independentes sobre a mesma fonte, o que
   confirma achados, N e citações bibliográficas, mas **não** permite conferir
   procedimento, ressalvas dos próprios autores, nem checar se o número citado por
   terceiros corresponde ao que o artigo de fato reporta.
2. **Consequência prática:** os números da tabela de evidências devem ser tratados como
   corretamente atribuídos, porém não auditados na fonte. Antes de usar qualquer um deles
   em decisão de peso, abra a referência listada na bibliografia.

### Estado da auditoria — o que ainda falta

Segunda passada em 10/08/2026, por busca dirigida. Recuperou N e desenho de três das seis
prioridades; três continuam abertas.

| Fonte | Status | O que falta |
|---|---|---|
| Morkes & Nielsen 1997 | ✅ Resolvido | N = 51; índice = tempo, erros, memória, satisfação |
| *J Clin Epidemiol* 2023 | ✅ Resolvido | N, desenho e efeito (19,8%, IC 95% 14,7–24,9%) obtidos |
| PNAS 2023 (legalese) | ✅ Resolvido | N = 105 advogados; 2 experimentos pré-registrados |
| **Furnas 1987** | ⚠ Aberto | N total e quais são os 5 domínios. Falta saber se o "80–90% de falha" é **medido** ou **derivado do modelo** — isso muda como o achado central deve ser apresentado |
| **IJSRM 2023 / Kunz 2026** | ⚠ Aberto | N de ambos, e **qual dos dois artigos** traz o achado de tempos menores. Ver o alerta na seção de evidência |
| **Preply (Frontitude)** | ⚠ Aberto | O wording exato antes/depois. Busca dirigida falhou |

As três abertas exigem leitura do texto completo — não são recuperáveis por busca.
3. **"Copy orientado à intenção" não é um campo de pesquisa.** Não existe literatura que
   teste exatamente este construto. O que reuni são quatro literaturas adjacentes
   (vocabulário, legibilidade, forrageamento de informação, linguagem simples) conectadas
   por mim. A conexão é defensável, mas é interpretação, não achado.
4. **Viés de publicação.** Empresas publicam experimentos de copy que funcionaram. Os que
   não funcionaram não viram post de blog. Os dois cases desta pesquisa quase certamente
   são sobreviventes desse filtro.

---

## Bibliografia

**Empírico**

- Furnas, G. W., Landauer, T. K., Gomez, L. M., & Dumais, S. T. (1987). The vocabulary
  problem in human-system communication. *Communications of the ACM*, 30(11), 964–971.
  https://dl.acm.org/doi/10.1145/32206.32212
- Morkes, J., & Nielsen, J. (1997). *Concise, SCANNABLE, and Objective: How to Write for
  the Web.* https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/
- Morkes, J., & Nielsen, J. (1998). Applying writing guidelines to Web pages. *CHI 98
  Conference Summary.* https://dl.acm.org/doi/10.1145/286498.286792
- A multimethods randomized trial found that plain language versions improved adults'
  understanding of health recommendations. *Journal of Clinical Epidemiology* (2023).
  https://www.jclinepi.com/article/S0895-4356(23)00303-7/fulltext
- A multimethods randomized trial found that plain language versions improved parents'
  understanding of health recommendations. *Journal of Clinical Epidemiology* (2023).
  https://pubmed.ncbi.nlm.nih.gov/37421995/
- Plain Language vs Standard Format for Youth Understanding of COVID-19 Recommendations:
  A Randomized Clinical Trial (2023). https://pubmed.ncbi.nlm.nih.gov/37548983/
- Plain language in web questionnaires: effects on data quality and questionnaire
  evaluation. *International Journal of Social Research Methodology*, 28(1) (2023).
  https://www.tandfonline.com/doi/full/10.1080/13645579.2023.2294880
- Kunz, T., Gummer, T., & Neuert, C. E. (2026). Measurement Quality of a Multi-item Scale
  in Plain Language. *Field Methods.* https://journals.sagepub.com/doi/10.1177/1525822X251322031
- Martínez, E., Mollica, F., & Gibson, E. (2023). Even lawyers do not like legalese.
  *PNAS.* https://www.pnas.org/doi/10.1073/pnas.2302672120
- Martínez, E., Mollica, F., & Gibson, E. (2024). Even laypeople use legalese. *PNAS.*
  https://www.pnas.org/doi/10.1073/pnas.2405564121
- Creative manipulation: a case study of confirmshaming as a deceptive design pattern.
  *Creativity Studies.* https://journals.vilniustech.lt/index.php/CS/article/view/21308

**Teoria**

- Pirolli, P., & Card, S. K. *Information Foraging.* UIR Technical Report.
  https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf
- Norman, D. Gulfs of execution and evaluation (conceito).
  https://www.interaction-design.org/literature/book/the-glossary-of-human-computer-interaction/gulf-of-evaluation-and-gulf-of-execution

**Cases**

- Frontitude — How UX Copy Drives Better Business Results (case Preply).
  https://www.frontitude.com/blog/how-ux-copy-drives-better-business-results
- Government Digital Service — Taking care of business on GOV.UK (2017).
  https://gds.blog.gov.uk/2017/07/18/taking-care-of-business-on-gov-uk/

**Prática**

- Nielsen Norman Group — Plain Language Is for Everyone, Even Experts.
  https://www.nngroup.com/articles/plain-language-experts/
- Nielsen Norman Group — The 3 I's of Microcopy.
  https://www.nngroup.com/articles/3-is-of-microcopy/
- Nielsen Norman Group — Information Foraging: A Theory of How People Navigate on the Web.
  https://www.nngroup.com/articles/information-foraging/
