# Copy orientado à intenção do usuário

**Pesquisa para decisão de adoção** — prós, contras, base acadêmica e cases com indicador.

Data: 10 de agosto de 2026

---

## Resumo para decisão

**Adotar, com escopo limitado e teste próprio.** A evidência de que a linguagem da
interface deve partir do vocabulário e da tarefa do usuário — e não da arquitetura do
sistema — é sólida, antiga e replicada. O achado mais forte não vem do design: vem de um
estudo de 1987 (**539 participantes**, lido em texto completo) que mediu escolha espontânea
de palavras e encontrou que **duas pessoas escolhem o mesmo termo para a mesma coisa com
probabilidade entre 0,07 e 0,18**.

Mas três ressalvas mudam a decisão de "adotar sempre" para "adotar onde importa":

1. **Pesquisar o vocabulário é necessário — e não basta.** É a descoberta mais incômoda da
   auditoria. Furnas et al. testaram justamente isso: escolher a palavra *mais popular
   entre usuários reais*, medida empiricamente. Ela ainda falha em **65–85%** das
   tentativas de acesso. A conclusão literal dos autores é que a ideia de um termo "óbvio"
   ou "natural" é um mito, e que **não podem existir regras para escolher um bom nome**. A
   saída que eles propõem é redundância — muitos caminhos alternativos para a mesma coisa —
   não acerto de nomenclatura.
2. **O efeito não é universal — e há um estudo grande que não achou quase nada.** O
   experimento GESIS de 2023 (**n = 4.025**, lido em texto completo) testou oito
   indicadores de qualidade de dados. **Cinco deram nulo**, o tempo de conclusão *piorou*
   em 20 segundos, e a avaliação subjetiva dos respondentes não mudou. O benefício real
   apareceu apenas no subgrupo que fala outro idioma em casa.
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

### O problema do vocabulário [A] — auditado no texto completo

> ✅ **Fonte lida integralmente** (PDF do artigo original, 8 páginas, CACM 30(11), 1987).
> Esta é a única fonte do documento verificada em texto completo. Tudo abaixo vem do
> artigo, não de resumo de terceiros.

Furnas, Landauer, Gomez e Dumais mediram como pessoas nomeiam espontaneamente objetos e
ações. **Seis conjuntos de dados em cinco domínios, 539 participantes no total:**

| Conjunto | Quem | N |
|---|---|---|
| Editor-5 / Editor-25 | Datilógrafos descrevendo operações de edição de texto | 48 |
| Decoder | Projetistas de sistema experientes nomeando comandos | 100 |
| Common Objects | Estudantes universitários descrevendo 50 objetos comuns | 337 |
| Classifieds | Donas de casa de Nova Jersey categorizando 64 anúncios | 30 |
| Recipe Keywords | 8 cozinheiros especialistas + 16 donas de casa, 188 receitas | 24 |

**Probabilidade de duas pessoas usarem o mesmo termo para o mesmo objeto** (Tabela I do
artigo): Editor-5 `.07` · Decoder `.08` · Editor-25 `.11` · Common Objects `.12` ·
Classifieds `.14` · Recipe Keywords `.18`.

#### O "80–90% de falha": medido ou derivado?

**Era a pergunta central da auditoria. Resposta: derivado dos dados empíricos — e
confirmado em sistemas reais.**

Os autores escrevem que, se uma pessoa atribui o nome de um item, outras pessoas sem
treino falharão em acessá-lo em 80 a 90% das tentativas, e acrescentam que isso *"não é
verdade apenas para todos os seis conjuntos de dados de laboratório; também foi
confirmado várias vezes por pesquisa com sistemas reais"* — citando três estudos
independentes (Furnas [4]; Gomez & Lochbaum [5]; Good, Whiteside, Wixon & Jones [6]).

Ou seja: o número sai de simulação sobre tabelas de frequência reais, mas não é
especulativo — tem validação de campo. **É mais robusto do que eu havia registrado.**

#### O achado que eu não tinha, e que muda a recomendação

O artigo vai além do que meu relatório original dizia. Os autores testaram também **o
melhor nome possível** — a palavra mais frequente entre usuários reais, escolhida
empiricamente:

| Estratégia | Taxa de sucesso |
|---|---|
| Nome escolhido pelo projetista ("armchair") | 10–20% |
| **Melhor nome possível, medido empiricamente** | **15–36%** — ainda falha **65–85%** das vezes |
| 3 nomes escolhidos pelo projetista | 20–45% |
| 3 melhores nomes, medidos | 37–67% |
| **15 nomes alternativos** | **apenas 60–80%** |

E a conclusão dos autores, literal: *"os dados nos dizem que não existe um bom termo de
acesso para a maioria dos objetos. A ideia de um termo 'óbvio', 'auto-evidente' ou
'natural' é um mito! Como mesmo o melhor nome possível não é muito útil, segue-se que
**não podem existir regras, diretrizes ou procedimentos para escolher um bom nome**, no
sentido de 'acessível ao usuário não familiarizado'."*

Dois achados secundários relevantes:

- **Especialistas não se saem melhor.** Um terço dos participantes do estudo de receitas
  eram cozinheiros especialistas; suas palavras-chave *"não se saíram melhor que a média"*,
  nem para outros especialistas nem para novatos.
- **Exigir nomes únicos piora tudo.** Quando cada nome só pode pertencer a um objeto,
  o desempenho cai mais 5 a 60% (tipicamente ~10%).

A solução proposta pelos autores **não é escolher a palavra certa** — é *unlimited
aliasing*: fornecer muitos caminhos verbais alternativos para cada objeto (sinônimos,
busca, múltiplas entradas de índice).

> ⚠️ **Correção ao meu próprio relatório.** A versão anterior dizia que "a intervenção que
> funciona é *medir* o vocabulário". Isso está **incompleto a ponto de enganar**. Medir e
> escolher o termo mais popular melhora o acesso por um fator de ~2, mas ainda falha na
> maioria das tentativas. Pesquisa de vocabulário é necessária e insuficiente. O que o
> artigo defende é **redundância de acesso**, não acerto de nomenclatura.

#### Limite de extrapolação — leia antes de usar este estudo

Esta é a ressalva mais importante do documento inteiro, e ela **limita** o quanto Furnas
sustenta copy de intenção.

O estudo mede **produção livre**: a pessoa precisa *gerar* a palavra certa do nada, sem
opções à vista — digitar um comando, escolher uma palavra-chave de busca. Rótulos de
botão e itens de menu são **reconhecimento**: a palavra está na tela e o usuário só
precisa reconhecê-la como correspondente ao objetivo dele. Reconhecimento é
sistematicamente mais fácil que evocação.

**Consequência honesta:** as taxas de falha de 80–90% **não transferem** para rótulos de
botão. O que transfere é o mecanismo — pessoas divergem muito sobre como nomear coisas,
e o projetista sistematicamente subestima essa divergência. Use Furnas para justificar
*testar* nomenclatura com usuários e para desarmar o argumento "esse nome é óbvio". Não
use os números dele como previsão de efeito em UI.

Onde Furnas transfere com força quase integral: **busca interna, navegação por categorias
e nomenclatura de funcionalidades** — situações em que o usuário de fato precisa produzir
ou reconhecer o termo entre muitos concorrentes.

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
| 1 | Furnas et al., *CACM*, 1987 ✅ **texto completo lido** | **539 participantes**, 6 conjuntos em 5 domínios. Produção livre de termos | Concordância entre duas pessoas **.07 a .18**; nome do projetista → 80–90% de falha (validado em campo). **Mesmo o melhor nome medido falha 65–85%** | **A favor, com limite** — mede evocação, não reconhecimento |
| 2 | Morkes & Nielsen, 1997 (também *CHI 98*) | **51 participantes**, 5 variações do mesmo site, cada uma com estilo de escrita diferente. Tarefas de busca de resposta | Conciso **+58%**; escaneável **+47%**; objetivo **+27%**; combinado **+124%** | **A favor** |
| 3 | Plain language RCTs, *J Clin Epidemiol*, 2023 (adultos e pais) e ensaio com jovens | RCTs de superioridade, online, alocação ocultada, cegos. Poder calculado para **122 por braço (244 total)**; **≥240 por população**. Estudo com pais: 295 randomizados, 241 completaram (121 intervenção / 120 controle). Desfecho primário: proporção de acertos em 7 perguntas de compreensão | Diferença média de **19,8%** em acertos (IC 95% 14,7–24,9%; **P < 0,001**) para a recomendação da OMS | **A favor** |
| 4 | Martínez, Mollica & Gibson, *PNAS*, 2023 | **105 advogados dos EUA**. **Dois experimentos pré-registrados**. Exp. 1: 12 pares de trechos de contrato (legalês vs. simplificado), testando compreensão e recordação | **Advogados também** compreendem e recordam pior o "legalês". Exp. 2: avaliam contratos simplificados como igualmente exequíveis **e preferíveis** em qualidade geral, adequação de estilo e probabilidade de assinatura pelo cliente | **A favor** (inclui especialistas) |
| 5 | Bauer, Neuert, Kunz & Gummer, *Int. J. Social Research Methodology*, 2023 (28:1) — GESIS ✅ **texto completo lido** | Desenho entre-sujeitos, painel de acesso online alemão com quotas. 5.332 iniciaram, **4.025 completaram**. Testes t e regressão logística sobre 8 indicadores | **Sem efeito positivo geral.** Tempo absoluto **+20s** (pior); diferenciação (CV) melhorou; **nulo** em straightlining, probabilidade de diferenciação, abandono, não-resposta e tempo até 1º clique; **nulo** na avaliação do questionário. Ganho real só no subgrupo que fala outro idioma em casa | **Contra / limitante** |
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

> ✅ **Ambiguidade entre os itens 5 e 6: resolvida.** Li o artigo de 2023 na íntegra. Ele
> encontrou tempos de conclusão **20 segundos MAIORES** com linguagem simples, não menores.
> O achado de "tempos menores, menos respostas no ponto médio" pertence mesmo ao artigo de
> **2026** — a atribuição do meu relatório estava correta. Os dois itens podem ser usados
> como registrados.

#### O item 5 auditado: o que exatamente não melhorou

Este é o estudo mais desconfortável do documento, e agora tenho os detalhes. Amostra
completa (n = 4.025):

| Indicador | Resultado com linguagem simples |
|---|---|
| Tempo absoluto de conclusão | **+20 segundos** (pior) |
| Tempo *relativo* (ajustado por nº de caracteres) | Sem diferença significativa |
| Diferenciação de resposta (coef. de variação) | **Melhorou** |
| Straightlining | Nulo |
| Probabilidade de diferenciação | Nulo |
| Abandono (*break-off*) | Nulo |
| Não-resposta de item | Nulo |
| Tempo até o primeiro clique | Nulo |
| **Avaliação do questionário pelo respondente** | **Nulo** — nem no índice agregado nem item a item |

No subgrupo que fala outro idioma em casa: **menos** não-resposta, **menos** straightlining
e **maior** probabilidade de diferenciação. E o tempo maior apareceu **somente** entre
quem tem letramento presumidamente alto — quem mais precisava de ajuda não pagou o
pedágio de tempo.

**Duas leituras que este artigo obriga:**

1. **O tempo extra é comprimento, não dificuldade.** O tempo absoluto piorou, mas o tempo
   *por caractere* não mudou. Linguagem simples ficou mais longa; o custo é de leitura, não
   de processamento. Isso valida empiricamente o trade-off do contra nº 3 — e explica por
   que "mais explícito" e "melhor" não são sinônimos.
2. **Os respondentes não perceberam diferença.** A avaliação subjetiva do questionário foi
   estatisticamente nula. Se você espera que copy melhor gere elogio ou percepção de
   qualidade, este estudo diz que não gera. O benefício, quando existe, é comportamental e
   silencioso.

### Leitura cruzada

Os itens 3 e 4 convergem, e são os dois mais fortes metodologicamente da tabela: reescrever
na linguagem de quem lê melhora compreensão em populações e domínios diferentes. O item 4
derruba a objeção mais comum em produtos técnicos — "meu usuário é especialista, prefere o
termo técnico". Advogados, diante de texto jurídico, também se saem pior com jargão.

O item 6 aponta na mesma direção e, com a ambiguidade resolvida, pode ser usado como apoio.

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
2. **Ataca uma fonte de falha grande, medida e quase sempre invisível para quem construiu
   o sistema** [A, item 1] — a divergência de vocabulário entre projetista e usuário. O
   projetista é a pessoa pior posicionada para julgar se um nome é óbvio, porque a
   familiaridade dele com o sistema é justamente o que produz a ilusão de obviedade.
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

1. **Existe um teto, e ele é baixo** [A, item 1]. Sem estudo de nomenclatura com usuários
   reais você substitui um palpite por outro — mas *com* o estudo, o ganho ainda é
   limitado: o melhor termo medido empiricamente falha em 65–85% das tentativas de acesso
   por produção livre. Se a sua expectativa é "achar a palavra certa e resolver", ela está
   errada. Para busca e navegação, a resposta do artigo é redundância de acesso
   (sinônimos, aliases, busca tolerante), não um rótulo melhor.
2. **Efeito não é universal** [A, item 5]. Em tarefa de resposta a questionário, não houve
   ganho agregado. Não assuma transferência automática entre tipos de tarefa.
3. **Verbosidade tem custo, e agora ele está medido** [A, item 5]. Rótulos de intenção
   tendem a ser mais longos que os genéricos. No estudo GESIS (n = 4.025), a versão em
   linguagem simples levou **20 segundos a mais** para ser respondida — mas o tempo *por
   caractere* não mudou. O custo é de **comprimento**, não de dificuldade de processamento.
   Some-se a isso que o estudo de maior efeito da tabela (item 2) premiou justamente a
   **concisão**: "mais explícito" e "melhor" não são a mesma coisa, e o texto mais longo é
   pago em tempo de leitura toda vez que a tela aparece.
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
   **Mas não pare no termo campeão.** Furnas mostra que o termo mais popular ainda deixa a
   maioria de fora. Use a lista completa que você coletou para alimentar **sinônimos de
   busca, aliases e termos alternativos de navegação** — é ali que o ganho grande está. O
   rótulo do botão leva o termo mais frequente; o resto da lista não se joga fora.
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

| Fonte | Status | Situação |
|---|---|---|
| **Furnas 1987** | ✅✅ **Texto completo lido** | PDF obtido. N = 539, 5 domínios identificados, "80–90%" é derivado dos dados **e validado em campo**. Descoberto o teto de 65–85% do melhor nome possível — corrigiu conclusão minha |
| Morkes & Nielsen 1997 | ✅ Por busca | N = 51; índice = tempo, erros, memória, satisfação |
| *J Clin Epidemiol* 2023 | ✅ Por busca | N, desenho e efeito (19,8%, IC 95% 14,7–24,9%) |
| PNAS 2023 (legalese) | ✅ Por busca | N = 105 advogados; 2 experimentos pré-registrados |
| **IJSRM 2023 (Bauer et al.)** | ✅✅ **Texto completo lido** | PDF obtido. N = 4.025. Todos os 8 indicadores mapeados. **Ambiguidade com o item 6 resolvida** — minha atribuição estava correta. Descoberto que o custo de tempo é comprimento, não dificuldade |
| **Kunz 2026** (*Field Methods*) | ⚠ Aberto | N. O achado já está corretamente atribuído; falta só a amostra |
| **Preply (Frontitude)** | ⚠ Aberto | O wording exato antes/depois. Busca dirigida falhou |

**As duas auditorias em texto completo mudaram o documento**, não só o confirmaram:

- **Furnas** reforçou a validade do achado central (validação de campo que eu desconhecia)
  e derrubou uma recomendação minha — a de que pesquisar vocabulário resolveria.
- **Bauer et al.** resolveu a ambiguidade 5/6, converteu o contra "verbosidade" de
  argumento teórico em achado medido, e acrescentou um dado que ninguém gosta de ouvir:
  copy melhor **não** melhorou a percepção subjetiva dos respondentes.

Esse é o argumento mais forte possível a favor de auditar o que resta. Das duas pendências,
a da **Preply** é a que mais importa — é a única que sustenta um case, e sem o wording ela
não vira guideline.
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
- **✅ lido em texto completo** — Bauer, I., Neuert, C., Kunz, T., & Gummer, T. (2023).
  Plain language in web questionnaires: effects on data quality and questionnaire
  evaluation. *International Journal of Social Research Methodology*, 28(1).
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
