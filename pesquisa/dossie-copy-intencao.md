# Dossiê — Copy orientado à intenção do usuário

**Documento de trabalho.** Consolida a pesquisa, a auditoria das fontes, a aplicação à
ExitLag, o estado da discussão interna e o plano de ação.

Última atualização: 9 de setembro de 2026

---

## Como usar este documento

| Se você quer… | Vá para |
|---|---|
| Decidir se vale adotar | Parte I → §3 e §4 |
| Um número para defender numa reunião | Parte I → §2.3 |
| Entender a tensão do Design System | Parte III |
| Saber o que fazer na segunda-feira | Parte IV |
| Copiar exemplos aplicados | Parte II → §7 |
| Conferir uma fonte | Apêndice A |

**Documento irmão:** `pesquisa/copy-orientado-a-intencao.md` — o relatório de pesquisa
limpo, sem o material de processo. Este dossiê é o registro completo, incluindo a
discussão interna e as decisões tomadas no caminho.

---

# PARTE I — A PESQUISA

## 1. Escopo e método

### 1.1 A pergunta

Vale adotar copy que reflete a intenção/tarefa do usuário nas ações dentro do software?

### 1.2 Definição operacional

Escrever os elementos de ação de um software na linguagem do **objetivo de quem usa**, em
vez da linguagem da **arquitetura que os implementa**.

**No escopo:** rótulos de botão, títulos de confirmação, mensagens de erro, estados
vazios, nomenclatura de navegação e de funcionalidades.

**Fora do escopo:** personalização dinâmica por intenção inferida, copy de aquisição, tom
de voz e branding, internacionalização.

### 1.3 Critério de rigor adotado

Rigor estrito: nenhum número entrou sem fonte identificada. Toda afirmação carrega
etiqueta de camada de evidência:

| Etiqueta | Significado |
|---|---|
| **[A]** | Empírico revisado por pares — experimento com método declarado |
| **[B]** | Teoria estabelecida em HCI — explica mecanismo, sem número próprio |
| **[C]** | Case institucional — a organização publicou o número sobre si |
| **[D]** | Consenso de prática — recomendação de autoridade, sem estudo próprio |

### 1.4 Um achado sobre o próprio campo

**"Copy orientado à intenção" não é um campo de pesquisa.** Não existe literatura que
teste exatamente este construto. O que foi reunido são quatro literaturas adjacentes,
conectadas nesta análise:

1. Problema do vocabulário (Furnas et al.)
2. Golfos de execução e avaliação (Norman)
3. Forrageamento de informação (Pirolli & Card)
4. Linguagem simples / plain language (literatura empírica com RCTs)

A conexão é defensável, mas é **interpretação, não achado**.

---

## 2. Base de evidência

### 2.1 O problema do vocabulário — Furnas et al., 1987 [A]

*Communications of the ACM*, 30(11), 964–971. **Lido em texto completo.**

**Amostra: 539 participantes, seis conjuntos de dados em cinco domínios.**

| Conjunto | Quem | N |
|---|---|---|
| Editor-5 / Editor-25 | Datilógrafos descrevendo operações de edição de texto | 48 |
| Decoder | Projetistas de sistema experientes nomeando comandos | 100 |
| Common Objects | Estudantes universitários descrevendo 50 objetos comuns | 337 |
| Classifieds | Donas de casa de Nova Jersey categorizando 64 anúncios | 30 |
| Recipe Keywords | 8 cozinheiros especialistas + 16 donas de casa, 188 receitas | 24 |

**Probabilidade de duas pessoas usarem o mesmo termo para o mesmo objeto** (Tabela I):

| Domínio | Probabilidade |
|---|---|
| Editor-5 | .07 |
| Decoder | .08 |
| Editor-25 | .11 |
| Common Objects | .12 |
| Classifieds | .14 |
| Recipe Keywords | .18 |

#### O "80–90% de falha": derivado, mas validado em campo

Os autores escrevem que, se uma pessoa atribui o nome de um item, outras pessoas sem
treino falharão em acessá-lo em 80 a 90% das tentativas — e acrescentam que isso *"não é
verdade apenas para todos os seis conjuntos de dados de laboratório; também foi confirmado
várias vezes por pesquisa com sistemas reais"*, citando três estudos independentes
(Furnas [4]; Gomez & Lochbaum [5]; Good, Whiteside, Wixon & Jones [6]).

O número sai de simulação sobre tabelas de frequência reais, mas **não é especulativo**.

#### O teto do melhor nome possível

Os autores testaram também a palavra mais frequente entre usuários reais, escolhida
empiricamente:

| Estratégia | Taxa de sucesso |
|---|---|
| Nome escolhido pelo projetista ("armchair") | 10–20% |
| **Melhor nome possível, medido empiricamente** | **15–36%** — falha 65–85% das vezes |
| 3 nomes escolhidos pelo projetista | 20–45% |
| 3 melhores nomes, medidos | 37–67% |
| **15 nomes alternativos** | **apenas 60–80%** |

**Conclusão literal dos autores:** *"os dados nos dizem que não existe um bom termo de
acesso para a maioria dos objetos. A ideia de um termo 'óbvio', 'auto-evidente' ou
'natural' é um mito! Como mesmo o melhor nome possível não é muito útil, segue-se que não
podem existir regras, diretrizes ou procedimentos para escolher um bom nome, no sentido de
'acessível ao usuário não familiarizado'."*

**Achados secundários:**

- **Especialistas não se saem melhor.** Um terço dos participantes do estudo de receitas
  eram cozinheiros especialistas; suas palavras-chave *"não se saíram melhor que a média"*,
  nem para especialistas nem para novatos.
- **Exigir nomes únicos piora tudo.** Quando cada nome só pode pertencer a um objeto, o
  desempenho cai mais 5 a 60% (tipicamente ~10%).

**Solução proposta pelos autores:** *unlimited aliasing* — fornecer muitos caminhos verbais
alternativos para cada objeto. **Não é escolher a palavra certa.**

#### Limite de extrapolação — a ressalva mais importante do dossiê

O estudo mede **produção livre**: gerar a palavra do nada, sem opções à vista. Rótulos de
botão e itens de menu são **reconhecimento**: a palavra está na tela.

**As taxas de 80–90% não transferem para rótulos de botão.** O que transfere é o mecanismo
— pessoas divergem muito, e o projetista subestima isso sistematicamente.

Transfere com força quase integral para: **busca interna, navegação por categorias e
nomenclatura de funcionalidades**.

### 2.2 Morkes & Nielsen, 1997 [A]

**N = 51 participantes**, cinco variações do mesmo site, cada uma com estilo de escrita
diferente.

| Estilo | Melhora na usabilidade medida |
|---|---|
| Conciso | +58% |
| Escaneável | +47% |
| Objetivo | +27% |
| **Combinado** | **+124%** |

**Atenção ao que "usabilidade medida" significa:** é um **índice composto de quatro
dimensões** — tempo de tarefa, erros, memória e satisfação subjetiva. Não é métrica única
nem métrica de negócio. O +124% significa "melhora no índice agregado", bem menos
impressionante do que soa citado solto.

Também publicado como *CHI 98 Conference Summary*.

### 2.3 RCTs de linguagem simples — *J Clin Epidemiol*, 2023 [A]

**O dado de melhor qualidade metodológica do dossiê.**

- Desenho: RCTs de superioridade, online, alocação ocultada, cegos
- Poder calculado a priori para **122 por braço (244 total)**; **≥240 por população**
- Três populações: adultos (21+), pais (18+), jovens (15–24)
- Estudo com pais: 295 randomizados, 241 completaram (121 intervenção / 120 controle)
- Desfecho primário declarado: proporção de acertos em 7 perguntas de compreensão

**Resultado: diferença média de +19,8% em respostas corretas (IC 95% 14,7–24,9%;
P < 0,001)** para a recomendação da OMS.

> **Se você precisa de um único número para uma reunião, use este.** Evite o "+124%".

### 2.4 Martínez, Mollica & Gibson — PNAS, 2023 [A]

**105 advogados dos EUA. Dois experimentos pré-registrados.** Exp. 1: 12 pares de trechos
de contrato (legalês vs. simplificado), testando compreensão e recordação.

**Achado:** advogados **também** compreendem e recordam pior o "legalês". No Exp. 2,
avaliam contratos simplificados como igualmente exequíveis **e preferíveis** em qualidade
geral, adequação de estilo e probabilidade de assinatura pelo cliente.

Pré-registro é salvaguarda forte contra *p-hacking* — este é o item de maior
confiabilidade da tabela junto com o RCT.

**É o argumento que derruba "nosso usuário é especialista, prefere o termo técnico".**

### 2.5 Bauer, Neuert, Kunz & Gummer — *IJSRM*, 2023 [A] — CONTRAEVIDÊNCIA

*International Journal of Social Research Methodology*, 28(1). GESIS. **Lido em texto
completo.**

- Desenho entre-sujeitos, painel de acesso online alemão com quotas (gênero, idade,
  escolaridade)
- 5.332 iniciaram, **4.025 completaram**
- Testes t e regressão logística sobre 8 indicadores

**Resultados (amostra completa):**

| Indicador | Resultado com linguagem simples |
|---|---|
| Tempo absoluto de conclusão | **+20 segundos (pior)** |
| Tempo relativo (ajustado por nº de caracteres) | Sem diferença significativa |
| Diferenciação de resposta (coef. de variação) | **Melhorou** |
| Straightlining | Nulo |
| Probabilidade de diferenciação | Nulo |
| Abandono (*break-off*) | Nulo |
| Não-resposta de item | Nulo |
| Tempo até o primeiro clique | Nulo |
| **Avaliação do questionário pelo respondente** | **Nulo** — agregado e item a item |

**Subgrupo que fala outro idioma em casa:** menos não-resposta, menos straightlining, maior
probabilidade de diferenciação. O tempo maior apareceu **somente** entre quem tem
letramento presumidamente alto.

**Duas leituras que este estudo obriga:**

1. **O tempo extra é comprimento, não dificuldade.** O tempo absoluto piorou, mas o tempo
   *por caractere* não mudou. Linguagem simples ficou mais longa; o custo é de leitura, não
   de processamento.
2. **Os respondentes não perceberam diferença.** A avaliação subjetiva foi estatisticamente
   nula. O benefício, quando existe, é **comportamental e silencioso**.

### 2.6 Kunz, Gummer & Neuert — *Field Methods*, 2026 [A]

*Field Methods*, 38(1), 33–45 (© The Author(s) 2025). GESIS. **Lido em texto completo.**

- Web survey em dezembro de 2022, painel alemão não-probabilístico com quotas
- 5.661 convidados, 4.353 iniciaram, **3.256 completaram**
- Escala Need to Evaluate de 16 itens (Jarvis & Petty, 1996; versão alemã de von Collani,
  2003)
- **Tradução para linguagem simples feita por profissionais externos** (Lebenshilfe Bremen
  e.V.) e mantida praticamente inalterada pelos pesquisadores, para teste sem viés

**Resultados:**

| Indicador | Padrão → Simples |
|---|---|
| Tempo de resposta | 154,9s → **136,5s** (−18,4s) |
| Respostas no ponto médio | 24,7% → **21,7%** |
| Diferenciação | .669 → **.681** |
| Não-resposta de item | 3,6% → 3,6% (nulo) |
| Straightlining | 3,4% → 2,3% (não significativo) |

**Propriedades psicométricas preservadas:** estrutura de dois componentes mantida,
variância explicada 38,7% → 42,5%, alfa de Cronbach das subescalas .799/.666 → .826/.724.
**Simplificar não degradou o instrumento.**

### 2.7 A tensão entre 2.5 e 2.6 — questão em aberto

Dois estudos do mesmo instituto, desenho parecido, conclusões que não se encaixam:

| | Bauer et al., 2023 | Kunz et al., 2026 |
|---|---|---|
| Objeto | Questionário inteiro | Escala de 16 itens |
| N | 4.025 | 3.256 |
| Tempo | **+20s (pior)** | **−18,4s (melhor)** |
| Não-resposta | Nulo (geral) | Nulo |
| Straightlining | Nulo (geral) | Nulo |
| Diferenciação | Melhorou | Melhorou |
| **Quem se beneficiou** | **Quem fala outro idioma em casa** | **Escolaridade média/alta — e *nenhum* efeito para escolaridade baixa** |

**Consequência prática:** o argumento de equidade — "linguagem simples ajuda mais quem tem
menos letramento" — é **plausível e não demonstrado**. É o argumento mais usado em
apresentações e o menos sustentado pelos dados. **Meça por segmento em vez de presumir.**

### 2.8 Alertas éticos [A]

| Estudo | Achado |
|---|---|
| Pesquisa sobre *confirmshaming* | Copy manipulativo elevou aceitação em **4,8 pontos percentuais** (14,8% → 19,6%), **+32,4% relativo** |
| University of Chicago Law School | Copy manipulativo aumentou cadastros em **≥5%**, afetando desproporcionalmente pessoas de **menor escolaridade** |

A mesma alavanca que ajuda a entender também funciona para manipular. Um programa de copy
orientado à intenção precisa de critério explícito de fronteira, ou vira otimização de
conversão com verniz de UX.

### 2.9 Base teórica sem número próprio [B]

**Golfo de execução (Norman).** A distância entre a intenção do usuário e as ações que o
sistema oferece. Quando a interface é nomeada pela própria estrutura interna, o usuário
precisa traduzir o objetivo para a linguagem da máquina — e é nessa tradução que o erro
acontece.

**Rastro de informação (Pirolli & Card).** Navegação modelada como forrageamento: o usuário
decide onde clicar por pistas locais. Quando o rótulo contém as **palavras-gatilho** da
tarefa que ele tem em mente, o rastro é forte; quando não contém, hesita ou abandona.

---

## 3. Prós

1. **Reduz a tradução mental exigida do usuário** [B] — o golfo de execução encolhe quando
   o rótulo já está na linguagem do objetivo.
2. **Ataca uma fonte de falha grande, medida e invisível para quem construiu o sistema**
   [A] — o projetista é a pessoa pior posicionada para julgar se um nome é óbvio, porque a
   familiaridade é justamente o que produz a ilusão de obviedade.
3. **Efeito composto** [A] — as melhorias somaram mais juntas (+124%) do que isoladas
   (+27% a +58%). Sugere tratar como programa, não como ajuste pontual.
4. **Funciona também com especialistas** [A] — remove a objeção de produto técnico.
5. **Pode melhorar acessibilidade para quem mais precisa — em disputa** [A] — ver §2.7.
6. **Barato de testar** [C] — mudança de texto não exige migração nem refatoração.

---

## 4. Contras e riscos

1. **Existe um teto, e ele é baixo** [A]. O melhor termo medido empiricamente falha em
   65–85% das tentativas de acesso por produção livre. Se a expectativa é "achar a palavra
   certa e resolver", ela está errada.
2. **Efeito não é universal** [A]. Cinco de oito indicadores nulos no estudo de 4.025
   pessoas.
3. **Verbosidade tem custo medido** [A]. +20 segundos, sendo o custo de **comprimento**,
   não de dificuldade. O estudo de maior efeito da tabela premiou justamente a **concisão**.
4. **Custo de manutenção e tradução.** Um botão `Confirmar` reusado em 40 telas vira 40
   textos distintos, cada um com sua tradução.
5. **Conflito com design systems.** Componentes padronizados assumem pares genéricos.
   Adotar implica renegociar o DS.
6. **Risco de presumir a intenção errada.** Um rótulo específico e *errado* é pior que um
   genérico — afirma com confiança algo que não corresponde ao que o usuário quer.
7. **Fronteira ética estreita** [A]. Copy que "reflete a intenção" desliza para copy que
   *fabrica* intenção.
8. **Risco de descaracterizar a linguagem da comunidade.** Ver Parte III.

---

## 5. Quando NÃO usar

- **Ações repetitivas de usuário experiente.** Depois da décima vez o rótulo longo vira
  ruído — o usuário mira a posição, não lê.
- **Vocabulário de domínio já estabelecido** [D]. Se o termo técnico *é* a palavra que o
  usuário usa no dia a dia, ele não é jargão para essa audiência.
- **Restrição severa de espaço.** Barras de ferramentas, células de tabela, mobile denso.
- **Quando não houve pesquisa de vocabulário.** Sem dados, você troca o palpite do
  engenheiro pelo palpite do designer.
- **Ações de baixo risco e alta frequência.** O custo de errar é baixo e o de ler é pago
  sempre.

---

## 6. Cases com indicador publicado [C]

### 6.1 Preply — nomenclatura de tipo de aula

Plataforma de aulas de idiomas. Relatado por Viktoria Kosiak, UX Writer.

**Wording exato:**

| Elemento | Antes | Depois |
|---|---|---|
| Título do cartão 1 | `Weekly lessons` | **`Regular lessons`** |
| Botão do cartão 1 | `Schedule weekly` | **`Schedule regular`** |
| Título do cartão 2 | `One-by-one lessons` | **`Single lessons`** |
| Botão do cartão 2 | `Schedule one-by-one` | **`Schedule single`** |

Subtítulos, benefícios, ícones e layout permaneceram **idênticos**.

**Raciocínio da equipe:** *"Segundo a abordagem Features vs. Benefits, `Weekly lessons` foca
no modo como a funcionalidade funciona, e não no benefício para o usuário. […] Também
sabíamos, por entrevistas com usuários, que nossos clientes usavam a palavra `regular` para
falar positivamente sobre formar um hábito de aprendizado."*

| Métrica | Resultado |
|---|---|
| Aulas regulares agendadas | **+11%** |
| Horas compradas na plataforma | **+7,8%** |

**Por que importa:** é o **elo direto entre Furnas e a prática**. A palavra veio de
entrevistas com usuários, não de brainstorm. É pesquisa de vocabulário aplicada com
resultado de negócio medido.

**Limitações:**
- **Duas mudanças no mesmo teste** — o +11% não é atribuível a uma única troca de palavra.
- Sem amostra, duração ou significância. "Significativo" em sentido coloquial.
- Interesse comercial declarado: a fonte afirma que promover aulas semanais *"sempre foi do
  melhor interesse do nosso negócio"*.

### 6.2 Fundbox — o CTA que declarava o desfecho errado

Fintech B2B de crédito rotativo, EUA. Relatado por Yael Ben-David, UX Writer.

O botão dizia `Draw Funds`. Segundo a equipe, os usuários *"tinham medo demais de clicar,
porque soava muito definitivo. Achavam que puxaria os fundos imediatamente para a conta e
que não teriam chance de revisar os termos de pagamento antes."*

| Elemento | Antes | Depois |
|---|---|---|
| CTA principal | `Draw Funds` | **`Review & Draw`** |

**Resultado:** melhora na métrica central — saque nos primeiros 7 dias após aprovação,
indicador de LTV — e nos saques totais. **Nenhum número divulgado.**

**Por que é conceitualmente o mais puro:** o rótulo antigo descrevia corretamente a ação,
mas **implicava um desfecho que não era real**. O usuário não recusava a ação; recusava a
consequência prometida. Nenhuma palavra ficou mais simples — ficou mais honesta sobre o que
acontece a seguir.

### 6.3 Gong.io — explicar a restrição

Plataforma de revenue intelligence. Relatado por Naomi Papoushado.

Usuários tentavam associar uma chamada a um registro de CRM, mas a opção ficava
indisponível quando o registro era um *Lead* em vez de um *Contact*. Sem explicação, abriam
ticket achando que era bug.

> **CAN'T ASSOCIATE CALL** — *"Esta chamada não pode ser associada a uma conta ou
> oportunidade porque está atualmente associada a leads do CRM. Apenas chamadas associadas a
> contatos do CRM podem ser associadas a uma conta ou oportunidade. Converta os leads em
> contatos no seu CRM e tente de novo."*

**Resultado: zero tickets abertos para esse problema específico.**

**É o melhor case para redução de suporte** — e o mais fácil de replicar, porque não exige
pesquisa de vocabulário: exige explicar a restrição do sistema em termos da tarefa que o
usuário tentava concluir.

### 6.4 GOV.UK / Government Digital Service, 2017

Reorganização de conteúdo orientada a necessidade do usuário, reduzindo **50 páginas para
16**.

| Métrica | Resultado |
|---|---|
| Cliques para os serviços necessários | **+25%** |
| Páginas por sessão até chegar ao serviço | **−5%** |

**Ressalva:** mistura redução de conteúdo com reescrita orientada à tarefa. Não é possível
isolar quanto do ganho veio do texto.

### 6.5 O padrão que os cases revelam

| Case | Tipo de mudança | Precisou de pesquisa? | Número? |
|---|---|---|---|
| Preply | Mecânica → benefício/hábito | **Sim** — entrevistas | +11% / +7,8% |
| Fundbox | Desfecho implícito errado → sequência real | Não — observaram a hesitação | Não divulgado |
| Gong.io | Silêncio → explicação da restrição | Não — os tickets já diziam | "Zero tickets" |

**Só um dos três exigiu pesquisa de vocabulário.** Os outros dois vieram de observar onde o
usuário travava. A modalidade mais barata produziu o resultado mais nítido.

**Viés da fonte:** os três primeiros cases vêm de um artigo da Frontitude, que vende
ferramenta de gestão de conteúdo de UX. Os profissionais são nomeados e o wording é
verificável, mas nenhum experimento fracassado apareceria ali.

---

## 7. Números descartados

Todos circulam amplamente. Nenhum resistiu à verificação.

| Número que circula | Por que caiu |
|---|---|
| "+20% em taxa de interação, segundo o NN/g" | Atribuído ao NN/g em artigos de SEO, sem link para estudo algum |
| "−15% no tempo de conclusão de tarefa" | Mesma origem, mesma ausência de fonte |
| "+30% de cliques com 'Sign Up for Free Trial'" | Sem estudo, sem amostra, sem contexto |
| "Empresa X: +23% de conclusão, −15% de tickets" | A fonte não nomeia a empresa |
| "Going.com: +104% em inícios de teste" | Blog de fornecedor de teste A/B, sem metodologia |
| "Portal B2B: +38,26% mudando uma palavra" | Idem. A precisão decimal sugere leitura de painel |
| "Booking.com: +5% simplificando copy" | Não localizei publicação primária |
| "Rastro forte reduz navegação em 30–50%" | Site agregador atribui a "Nielsen 2003, 2004", sem referência rastreável |

---

## 8. Limitações da pesquisa

1. **Parte das fontes não foi consultada no texto integral.** Quatro foram lidas na íntegra
   (Furnas 1987, Bauer et al. 2023, Kunz et al. 2026, Frontitude). As demais — Morkes &
   Nielsen, os RCTs do *J Clin Epidemiol*, o PNAS, os estudos sobre confirmshaming e o case
   do GOV.UK — foram verificadas por convergência de buscas independentes.
2. **"Copy orientado à intenção" não é um campo de pesquisa** (ver §1.4).
3. **Viés de publicação.** Empresas publicam experimentos que funcionaram. Os quatro cases
   são quase certamente sobreviventes desse filtro.

---

# PARTE II — APLICAÇÃO À EXITLAG

## 9. O que sabemos do produto

ExitLag é software de **otimização de rota para jogos** (multipath routing). **Não é VPN**
— não criptografa, não mascara IP, não serve para navegação geral.

> **Ressalva importante para tudo nesta parte:** não tive acesso à interface do produto.
> Os exemplos abaixo são **ilustrativos do domínio**, para explicar o conceito. Não são
> auditoria dos textos reais.

## 10. Exemplos — linguagem do sistema → linguagem da intenção

| Onde | Linguagem do sistema | Linguagem da intenção |
|---|---|---|
| Nome de funcionalidade | `Multipath routing` | `Vários caminhos ao mesmo tempo` |
| Ação principal | `Otimizar rota` | `Reduzir meu ping` |
| Configuração | `Selecionar região do servidor` | `Escolher por onde sua conexão passa` |
| Métrica exibida | `Jitter: 12ms` | `Variação do ping: 12ms` |
| Métrica exibida | `Packet loss: 2%` | `2% dos dados não chegaram` |
| Confirmação | `Aplicar` | `Salvar e reconectar` |
| Erro | `Falha ao estabelecer túnel (código 1042)` | `Não conseguimos conectar. Seu antivírus pode estar bloqueando — veja como liberar.` |
| Estado vazio | `Nenhum perfil configurado` | `Escolha seu jogo para começar` |

## 11. O que NÃO traduzir

**Manter:** `ping`, `lag`, `FPS`, `tickrate`, `servidor`

São vocabulário nativo do público. Traduzir "ping" para "tempo de resposta" seria piorar, e
explicar o óbvio sinaliza que o produto não foi feito para essa pessoa.

**A linha divisória:** o gamer conhece o vocabulário **do jogo**. Não necessariamente o
**de rede**.

---

# PARTE III — A DISCUSSÃO INTERNA

## 12. O pedido da liderança (Cassa)

Transcrição do pedido, recebido em mensagem:

> *"Uma coisa que me deixou intrigado foi em encontrar em quais momentos adotar esse método
> de copy vai trazer mais resultado e é exatamente isso que eu acho que você poderia colocar
> na mesa na hora de discutir sobre as tensões do DS. Se tivermos um direcionamento claro de
> onde vamos aplicar (nesse caso seria só testar) já é um salto, depois precisamos alinhar
> como vamos verificar como desempenharam as mudanças. Inclusive, é um assunto importante de
> falar com o Plassede, pois ele está estruturando i18n e lá é que precisamos de autonomia
> para alterar o copy para validar."*

**Três entregáveis, nesta ordem:**

1. **Critério de em quais momentos isso traz mais resultado** — para levar à mesa das
   tensões do DS
2. **Como verificar o desempenho** — explicitamente "depois"
3. **Autonomia para alterar copy** no string system do Plassede

**Nota de processo:** a ordem proposta pela liderança é melhor que a ordenação inicial
deste dossiê, que colocava a conversa sobre i18n como prioridade máxima. O critério é o
entregável e não depende do i18n para existir; a conversa com o Plassede corre em paralelo.

## 13. A tensão registrada no FigJam

Duelo de stickies posto pela liderança:

**"copy guiado pela intencionalidade"** ⚔️ **"copy preciso no idioma nativo do usuário"**

Comentário anexo:

> *"Usuário com pouco conhecimento técnico vai se dar melhor com intencionalidade e isso
> pode descaracterizar o idioma nativo da comunidade, dá para encontrar balanço?"*

### 13.1 Por que a tensão é mais estreita do que parece

**Copy por intenção se opõe à linguagem da arquitetura, não à linguagem da comunidade.**
Isso significa que os dois lados só colidem numa faixa específica.

### 13.2 O framework: arquitetura × marcador

> **Nota:** estes dois rótulos foram formulados para esta discussão. Não vêm da literatura
> com esse nome. O que vem da pesquisa é a observação por trás — o problema do vocabulário
> e o achado de que explicar o óbvio afasta quem já domina.

**Palavra de arquitetura** — termo que está na interface porque descreve **como o sistema
foi construído**, não o que a pessoa quer fazer.

*Testes:*
1. **Teste da reescrita.** Se o time refizesse essa parte com outra tecnologia, o termo
   sobreviveria? Se o nome mudaria junto, descreve a implementação.
2. **Teste da origem.** Quem escolheu a palavra? Se foi alguém de dentro, é candidato.

**Marcador de pertencimento** — termo que a comunidade usa espontaneamente entre si, e cujo
domínio **sinaliza que você faz parte do grupo**.

*Testes:*
1. **Teste do fórum.** Aparece em conversa entre usuários **sem ninguém explicar**?
2. **Teste da correção.** Alguém é corrigido ou zoado por usar errado? Marcadores têm
   policiamento social.
3. **Teste da entrada.** Aprender o termo faz parte de "virar da comunidade"?

### 13.3 O 2×2

| | **É marcador de pertencimento** | **Não é marcador** |
|---|---|---|
| **É palavra de arquitetura** | **Zona 3 — conflito real**<br>*Decidir por superfície* | **Zona 2 — traduzir**<br>*Sem custo de identidade* |
| **Não é arquitetura** | **Zona 1 — manter**<br>*Já é a linguagem do objetivo* | **Neutro**<br>*Só escrever bem* |

**Só o quadrante superior esquerdo precisa de decisão humana.**

### 13.4 A lista triada candidata

> Precisa ser validada contra os termos reais da interface.

| Zona | Ação | Termos candidatos |
|---|---|---|
| 1 | **Manter** | `ping` · `lag` · `FPS` · `tickrate` · `servidor` |
| 2 | **Traduzir** | `multipath routing` · `túnel` · `proxy` · `adaptador de rede` · `MTU` · códigos de erro numéricos |
| 3 | **Decidir** | `jitter` · `perda de pacote` / `packet loss` · `rota` · `hops` / `saltos` · `latência` |
| — | Neutro | `conectar` · `salvar` · `aplicar` · `cancelar` |

**Dois casos que valem atenção:**

- **`latência` vs `ping`** — mesma coisa, quadrantes diferentes. "Ping" é o marcador nativo;
  "latência" é a palavra técnica. A triagem dá resposta imediata: **use ping**. Ganho fácil
  e sem contrapartida.
- **`jitter`** — o caso mais puro de conflito. Quem joga competitivo conhece e usa; quem
  joga casual não faz ideia. É o melhor exemplo para levar à mesa.

### 13.5 A resposta à pergunta "dá para encontrar balanço?"

**Dá — e mesmo na Zona 3 não é preciso escolher um lado:**

- O termo nativo fica no **rótulo**, onde é só reconhecimento
- A intenção aparece no **apoio, tooltip ou erro**, onde quem chega trava

Furnas é explícito: não existe *a* palavra certa; a solução é **redundância de acesso**.

**Ressalva à premissa:** "usuário com pouco conhecimento técnico vai se dar melhor com
intencionalidade" é plausível mas **não demonstrado** — ver §2.7. Sugere **medir por
segmento** em vez de presumir.

## 14. As outras tensões do DS

**Reuso vs. especificidade.** Um `Confirmar` em 40 telas vira 40 textos. A pergunta
decidível não é "adotamos?", é **quais famílias liberamos**.

**Explícito vs. conciso.** Custo medido: +20s, sendo comprimento e não dificuldade.

**Consistência vs. contexto.** O DS quer previsibilidade; copy de intenção quer
especificidade. A saída é decidir **por família**, não por tela.

### 14.1 Matriz de famílias de componente

> **"Família"** = grupo de componentes ou usos que compartilham a mesma regra de copy. Não é
> o componente individual, nem a categoria toda. O mesmo `Button` pertence a famílias
> diferentes conforme a função que exerce.

| Família | Aceita rótulo específico? | Por quê |
|---|---|---|
| **Confirmação de ação destrutiva** | **Sim, sempre** | Alto risco, baixa frequência. É onde o rótulo genérico esconde a consequência |
| **CTA de fluxo crítico** (conectar, assinar) | **Sim** | Alto valor, decisão real, efeito detectável |
| **Mensagem de erro e estado vazio** | **Sim** | Não competem por espaço e é onde a dúvida vira ticket |
| **Nome de funcionalidade e navegação** | **Sim, com pesquisa** | É produção livre — onde Furnas transfere com força total |
| **Botão de formulário padrão** | **Caso a caso** | Depende se o resultado é ambíguo |
| **Ação repetida** (toolbar, filtro, tabela) | **Não** | Usuário mira posição, não lê. Espaço apertado |
| **Navegação primária** | **Não** | Consistência vale mais que especificidade |

*Se o time já usa outro termo para esse agrupamento — "categoria de uso", "tipo de ação" —
adote o deles.*

---

# PARTE IV — O PLANO

## 15. Sequência

| # | Passo | Depende de | Observação |
|---|---|---|---|
| 1 | Montar a lista triada com os termos reais | Nada | Entregável para a liderança |
| 2 | Montar a matriz de famílias | Nada | Vai para a mesa do DS |
| 3 | Levar ambos para a discussão de tensões do DS | 1 e 2 | A decisão sai de lá, documentada |
| 4 | Conversa curta com o Plassede sobre i18n | Nada | **Em paralelo** — a janela é agora |
| 5 | Escolher o fluxo candidato | 3 | Usando a matriz de §17 |
| 6 | Desenhar o teste | 4 e 5 | — |
| 7 | Alinhar verificação de desempenho | 6 | "Depois", como pedido |

## 16. A conversa com o Plassede

### 16.1 Enquadramento

**Você não está pedindo uma plataforma de experimentação.** Está pedindo que a arquitetura
não feche uma porta. A diferença de custo entre prever isso agora e adaptar depois é
grande — daí a urgência.

Frase sugerida: *"Não preciso que você construa um sistema de testes. Preciso saber se vou
conseguir trocar um texto sem release, e se dá para saber qual versão a pessoa viu."*

### 16.2 Descobrir antes de pedir

1. Como o texto chega na tela hoje? Bundle compilado, ou buscado em runtime?
2. Trocar uma string exige release? Se sim, qual o ciclo?
3. Já existe alguma noção de audiência — feature flag, rollout percentual?

### 16.3 Os dois requisitos

**1. Autonomia — alterar texto sem depender de deploy.**
É o que a liderança nomeou. Determina o custo por iteração: se ajustar uma vírgula exige
release, ninguém testa copy duas vezes.

**2. Saber qual texto o usuário viu.**
O mais fácil de esquecer e **o único que não dá para adicionar depois**. Sem isso você sabe
que a métrica mexeu, mas não para quem — e eventos passados não voltam com essa informação
anexada.

### 16.4 Requisitos que só importam se houver A/B simultâneo

Se o teste for **sequencial** (mede antes, troca, mede depois), nada abaixo é necessário.
Essa decisão ainda não foi tomada, então não vale levar como requisito:

- Variante por chave, com a unidade de variação sendo o **conjunto** de strings do fluxo,
  não a string isolada
- Consistência por usuário (quem viu B continua vendo B)
- Comportamento de fallback quando a variante não existe para um idioma

### 16.5 Se a resposta for "não dá agora"

Peça para preservar **só o registro da variante**. Os outros itens são adaptáveis depois;
esse gera perda irrecuperável — cada dia sem ele é um dia de eventos que nunca poderão ser
cruzados.

## 17. Matriz de seleção do fluxo de teste

Pontue cada fluxo de 0 a 3.

| Critério | 0 | 3 |
|---|---|---|
| **Densidade de jargão de rede** | Só vocabulário de jogo | Cheio de jitter, multipath, packet loss |
| **Consequência ambígua** | Óbvio o que vai acontecer | O rótulo pode prometer algo que não é |
| **Dúvida já conhecida** | Ninguém pergunta | Aparece em suporte e comunidade |
| **Custo do erro** | Irrelevante | Usuário desiste ou abre ticket |
| **Leitura real** | Ação repetida, nem lê | Passa pouco por ali, lê de verdade |
| **Isolabilidade** | Mexer no texto exige mexer no layout | É só string |
| **Volume** | Poucos usuários passam | Muitos passam |

**Distinção crítica:** você quer **baixa frequência por usuário** (para ele ler) mas **alto
volume total** (para detectar efeito). Um fluxo que cada pessoa vê uma vez, mas por onde
passam milhares, é o ideal.

**Hipótese preliminar** (a validar com as telas): a **configuração de rota / escolha de
servidor** deve pontuar alto — jargão concentrado, decisão real, configura e esquece,
resultado ambíguo para o usuário. Alternativa: **da instalação à primeira conexão
bem-sucedida**, com a contrapartida de ter muitas variáveis simultâneas.

**Evitar no primeiro teste:** cancelamento e reembolso (terreno ético), e qualquer coisa em
toolbar ou tabela.

## 18. Protocolo de teste

1. **Pesquisa de vocabulário primeiro.** 15–20 usuários descrevendo o objetivo com as
   próprias palavras, sem opções à vista. A variabilidade é o dado.
   **Não pare no termo campeão** — o resto da lista alimenta sinônimos de busca e aliases.
2. **Um fluxo, alto valor e baixa frequência.**
3. **Mude uma coisa.** Copy isolado, sem alterar layout, fluxo ou hierarquia.
4. **Efeito mínimo detectável definido antes**, com amostra derivada dele.

### 18.1 Métricas, em ordem de qualidade

| # | Métrica | Por quê |
|---|---|---|
| 1 | Conclusão da tarefa pretendida | O que a técnica promete afetar |
| 2 | Taxa de erro e de desfazer/retrabalho | Custo de ter entendido errado |
| 3 | Tempo até a primeira ação bem-sucedida | Sensível a hesitação |
| 4 | Tickets de suporte sobre o fluxo | Efeito a jusante, com atraso |
| 5 | Conversão | **Por último** — onde intenção e interesse do negócio se confundem |

### 18.2 Critério de decisão

Defina **antes** qual efeito justificaria o custo de manutenção, tradução e renegociação do
DS. Ganho real porém abaixo do limiar é motivo para **não** adotar de forma ampla — e isso
é resultado válido, não fracasso.

### 18.3 Salvaguarda ética

Antes de subir qualquer variante: *se o usuário visse o resultado do experimento, se
sentiria melhor ou pior servido?*

Vence por comunicar melhor → adote. Vence por constranger ou obscurecer → você mediu um
efeito real e mesmo assim deve descartá-la.

---

# PARTE V — ARTEFATOS

## 19. Onde está cada coisa

| Artefato | Local |
|---|---|
| Relatório de pesquisa (limpo) | `pesquisa/copy-orientado-a-intencao.md` |
| Relatório publicado | https://claude.ai/code/artifact/b199ac1d-65c3-4461-91dc-3c6dbda93d33 |
| HTML standalone para download | Gerado sob demanda, com estilos de impressão |
| Board de racional | https://www.figma.com/board/fVhSA7CsbE7zoPDKiqiFKv/ |
| Este dossiê | `pesquisa/dossie-copy-intencao.md` |

## 20. Estrutura do board no FigJam

| # | Seção | Conteúdo |
|---|---|---|
| 01 | Por que estamos falando disso | Hipótese, a objeção que cai, a linha divisória |
| 02 | O que a pesquisa mostra | A favor, contra, números descartados |
| 03 | Como ficaria na ExitLag | Exemplos, padrões dos cases, o que não traduzir |
| 04 | O que NÃO esperar | NPS, custo de comprimento, o teto, onde não aplicar |
| 05 | A proposta | Escopo, critério de seleção, métricas, ética |
| 06 | O que precisamos decidir | i18n, tensão do DS, ordem dos passos |
| — | Zona aberta | Stickies para reação do time |

---

# APÊNDICE A — Bibliografia

### Empírico

- **Furnas, G. W., Landauer, T. K., Gomez, L. M., & Dumais, S. T. (1987).** The vocabulary
  problem in human-system communication. *Communications of the ACM*, 30(11), 964–971.
  https://dl.acm.org/doi/10.1145/32206.32212 — *lido em texto completo*
- **Morkes, J., & Nielsen, J. (1997).** *Concise, SCANNABLE, and Objective: How to Write for
  the Web.* https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/
- **Morkes, J., & Nielsen, J. (1998).** Applying writing guidelines to Web pages. *CHI 98
  Conference Summary.* https://dl.acm.org/doi/10.1145/286498.286792
- A multimethods randomized trial found that plain language versions improved adults'
  understanding of health recommendations. *J Clin Epidemiol* (2023).
  https://www.jclinepi.com/article/S0895-4356(23)00303-7/fulltext
- A multimethods randomized trial found that plain language versions improved parents'
  understanding of health recommendations. *J Clin Epidemiol* (2023).
  https://pubmed.ncbi.nlm.nih.gov/37421995/
- Plain Language vs Standard Format for Youth Understanding of COVID-19 Recommendations
  (2023). https://pubmed.ncbi.nlm.nih.gov/37548983/
- **Bauer, I., Neuert, C., Kunz, T., & Gummer, T. (2023).** Plain language in web
  questionnaires: effects on data quality and questionnaire evaluation. *International
  Journal of Social Research Methodology*, 28(1).
  https://www.tandfonline.com/doi/full/10.1080/13645579.2023.2294880 — *lido em texto completo*
- **Kunz, T., Gummer, T., & Neuert, C. E. (2026).** Measurement Quality of a Multi-item Scale
  in Plain Language. *Field Methods*, 38(1), 33–45.
  https://journals.sagepub.com/doi/10.1177/1525822X251322031 — *lido em texto completo*
- **Martínez, E., Mollica, F., & Gibson, E. (2023).** Even lawyers do not like legalese.
  *PNAS.* https://www.pnas.org/doi/10.1073/pnas.2302672120
- **Martínez, E., Mollica, F., & Gibson, E. (2024).** Even laypeople use legalese. *PNAS.*
  https://www.pnas.org/doi/10.1073/pnas.2405564121
- Creative manipulation: a case study of confirmshaming as a deceptive design pattern.
  *Creativity Studies.* https://journals.vilniustech.lt/index.php/CS/article/view/21308

### Teoria

- **Pirolli, P., & Card, S. K.** *Information Foraging.* UIR Technical Report.
  https://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/280uir-1999-05-pirolli.pdf
- **Norman, D.** Gulfs of execution and evaluation.
  https://www.interaction-design.org/literature/book/the-glossary-of-human-computer-interaction/gulf-of-evaluation-and-gulf-of-execution

### Cases

- Frontitude — How UX Copy Drives Better Business Results (Preply, Fundbox, Gong.io).
  https://www.frontitude.com/blog/how-ux-copy-drives-better-business-results — *lido em texto completo*
- Government Digital Service — Taking care of business on GOV.UK (2017).
  https://gds.blog.gov.uk/2017/07/18/taking-care-of-business-on-gov-uk/

### Prática

- NN/g — Plain Language Is for Everyone, Even Experts.
  https://www.nngroup.com/articles/plain-language-experts/
- NN/g — The 3 I's of Microcopy. https://www.nngroup.com/articles/3-is-of-microcopy/
- NN/g — Information Foraging. https://www.nngroup.com/articles/information-foraging/

---

# APÊNDICE B — Glossário

| Termo | Definição | Zona |
|---|---|---|
| **Ping** | Tempo que um dado leva para ir e voltar até o servidor | 1 — manter |
| **Lag** | Atraso perceptível entre a ação e a resposta do jogo | 1 — manter |
| **Tickrate** | Frequência com que o servidor atualiza o estado do jogo | 1 — manter |
| **Jitter** | Variação da latência ao longo do tempo. Ping instável | 3 — decidir |
| **Packet loss** | Pacotes que saíram mas não chegaram ao destino | 3 — decidir |
| **Latência** | O mesmo que ping, em vocabulário técnico | 3 — decidir (usar "ping") |
| **Hops** | Número de equipamentos por onde o dado passa no caminho | 3 — decidir |
| **MTU** | *Maximum Transmission Unit.* Tamanho máximo de um pacote, normalmente 1500 bytes. Carga maior é fatiada (fragmentação) | 2 — traduzir |
| **Multipath routing** | Enviar dados por vários caminhos simultâneos | 2 — traduzir |
| **Golfo de execução** | Distância entre a intenção do usuário e as ações que o sistema oferece | conceito |
| **Rastro de informação** | Pistas locais que o usuário usa para decidir onde clicar | conceito |
| **Aliasing** | Aceitar múltiplos nomes para a mesma coisa | conceito |
| **Confirmshaming** | Constranger o usuário para que aceite algo | conceito |
| **Família (de componente)** | Grupo de componentes ou usos que compartilham a mesma regra de copy | conceito |

---

# APÊNDICE C — Registro de decisões e correções

Correções feitas ao próprio material durante a apuração, registradas para rastreabilidade.

| # | O que foi corrigido | Por quê |
|---|---|---|
| 1 | "A intervenção que funciona é *medir* o vocabulário" | Incompleto a ponto de enganar. Furnas mostra que o melhor termo medido ainda falha em 65–85%. Pesquisa de vocabulário é necessária **e insuficiente**; a solução do artigo é redundância de acesso |
| 2 | "O benefício é consistentemente maior em populações de menor letramento" | Não se sustenta. Os dois estudos GESIS chegam a conclusões opostas (§2.7). Passou a ser tratado como questão em aberto |
| 3 | Ordem dos próximos passos | A ordenação inicial punha a conversa sobre i18n como prioridade máxima. A ordem da liderança é melhor: o critério é o entregável e não depende do i18n |
| 4 | Atribuição do achado de "tempos menores" | Confirmada como pertencente a Kunz et al. 2026, não a Bauer et al. 2023 |
| 5 | Autoria do estudo IJSRM 2023 | Registrada corretamente como Bauer, Neuert, Kunz & Gummer |
| 6 | Limitação sobre leitura de fontes primárias | Reescrita após quatro fontes serem lidas na íntegra |
| 7 | Uso de "famílias" sem definição | Jargão não explicado, num documento sobre não usar jargão. Definido em §14.1 |

**Nota de método:** nenhuma das quatro auditorias em texto completo apenas confirmou o que
estava escrito. Duas derrubaram afirmações, uma expôs uma limitação omitida pela fonte
secundária, e uma rendeu dois cases que não constavam.
