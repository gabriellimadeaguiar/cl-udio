# Glossário ExitLag v0.3 × Triador de Vocabulário

Diagnóstico de 17/09/2026. Fonte: `planilha/glossario-exitlag-v0.3.xlsx`, cruzada com
`../triador/terms.json` e o registry de 09/09.

Toda afirmação aqui aponta para aba e coluna da planilha ou para o termo no `terms.json`.
Os dados extraídos estão em `planilha/familias.json` e `planilha/aplicacao.json`, e o
cruzamento é refazível.

## O que a planilha é

Quatro abas:

| Aba | Linhas | O quê |
|---|---|---|
| Como usar | 19 | Sumário, lógica da marca, ordem de revisão |
| Regras da voz | 13 | Os quatro modos e as regras de combinação por contexto |
| Glossário por família | 241 | Regras editoriais por situação de uso |
| Aplicação por string | 6.222 | Cada string do produto ligada à família que a orienta |

**Quatro modos de voz**, com aplicação declarada: Inspira (institucional), Destrava
(erros, instruções, permissões, billing, configurações e métricas), Conecta (onboarding,
gamificação, referral, comunidade), Eleva (CTAs, trial, assinatura, upgrade, campanhas).

Famílias: 104 P1, 89 P2, 48 P3. Por tipo: 159 de domínio, 62 editoriais, 20 do piloto.
Só 16 estão como "Proposta"; 165 são "Direcional proposto" e 60 aguardam validação de
Produto, Marca ou Legal.

## O cruzamento: mesmo universo, unidades diferentes

As duas coisas foram feitas sobre **a mesma base**, e a chave da string casa exatamente.

- As **4.716** strings da minha deduplicação estão **todas** dentro das 6.222 da planilha
- Nenhuma string minha está fora da planilha
- 4.686 das 4.716 têm texto idêntico dos dois lados

A diferença entre 6.222 e 4.716 não é erro de ninguém — são unidades diferentes:

| | Unidade | Conta |
|---|---|---|
| Registry cru | toda chave | 12.440 |
| Planilha | uma chave por string de interface | 6.222 |
| Triador | um texto único por produto | 4.716 |

O registry carrega **cada string em dois formatos de chave** — `AboutExitlag.apps-added…`
e `desktop.about_exitlag.settings.label_apps_added…`. A divisão é exata: 1.757/1.757 no
desktop, 1.743/1.743 no mobile, 2.720/2.720 no portal. A planilha já descarta esse
segundo formato, e chega a 6.222.

A diferença restante é a mesma palavra em telas diferentes: `Cancel` existe em 21
componentes, cada um com sua chave. A planilha mantém as 21, porque cada uma é um texto
que alguém pode ter de editar. O Triador colapsa em 1, porque é **uma decisão de
vocabulário**. Os dois estão certos para o que fazem.

> **Correção ao que eu havia dito antes.** Eu tratei os 1.506 excedentes como o formato
> duplo de chave. Não são: o formato duplo a planilha já resolveu. São a mesma palavra em
> telas distintas. Isso não muda nenhuma contagem de termo do Triador, mas muda o que
> significa "uma string".

## Onde as duas chegam à mesma conclusão por caminhos diferentes

Este é o achado que mais importa, porque é convergência independente.

**Os modos de voz separam os termos exatamente como a triagem separou.** Cruzando cada
termo com o modo de voz das strings em que aparece:

| Termo | Linhas | Modo dominante | Triagem |
|---|---|---|---|
| `dns` | 47 | Destrava 47 — **100%** | traduzir |
| `protocol` | 31 | Destrava 31 — **100%** | traduzir |
| `ipv6` | 21 | Destrava 21 — **100%** | traduzir |
| `ndis` | 17 | Destrava 17 — **100%** | traduzir |
| `fps` | 17 | Eleva 11 de 17 | manter |
| `lag` | 98 | Eleva e Destrava+Eleva dominam | manter |

Termo que só vive em **Destrava** — erro, instrução, configuração — é linguagem de
arquitetura. Termo que puxa para **Eleva** — CTA, ativação, campanha — é vocabulário que
comunica. É a mesma conclusão da proporção de uso no portal, por outra porta.

**O brandbook já proíbe o que a triagem encontra.** Na aba Regras da voz:

- Destrava — *"Não é: **técnica demais** · professoral · prepotente"*, aplicado a
  "erros, instruções, permissões, billing, configurações e métricas"
- Conecta — *"Não é: parcial · **gamer hardcore** · formal"*

A segunda linha é literalmente o argumento que levei ao Cassa: mesmo um gamer hardcore
pode não entender de rede. A marca já tinha decidido isso.

## A lacuna: a regra existe, nada a executa no nível da palavra

**A planilha não mexe em vocabulário.** Comparei cada sugestão com o texto atual, termo
a termo:

| Termo | Triagem | Sugestão mantém | Remove |
|---|---|---|---|
| `dns` | traduzir | 47 | 0 |
| `protocol` | traduzir | 31 | 0 |
| `ipv6` | traduzir | 21 | 0 |
| `ndis` | traduzir | 16 | 1 |
| `latency` | decidir | 71 | 0 |
| `packet` | decidir | 64 | 1 |
| `jitter` | decidir | 27 | 0 |

**115 strings com `ndis`, `ipv6`, `dns` e `protocol` saem da revisão com os termos
intactos** — numa planilha cuja própria regra diz que Destrava não é técnica demais.

O número geral confirma: das 6.222 sugestões, **6.061 são idênticas ao texto atual**. Só
171 strings recebem "Aplicar sugestão de texto"; 3.379 ficam em "Validar texto no
contexto" e 2.672 em "Manter texto atual".

Isso não é falha da planilha. Ela opera no nível da **frase** — estrutura, ordem, promessa,
próximo passo, maiúscula. O nível da **palavra** ficou fora do escopo, e é exatamente onde
o Triador trabalha.

## O que a planilha tem e o Triador não sabe representar

Na coluna Evitar, os termos aparecem — mas quase sempre por causa de *promessa*, não de
vocabulário: "play lag-free", "zero packet loss", "best possible route como promessa
garantida", "server routes sem explicação".

Uma família foge disso e vale por muitas. **G-037 · Métricas de conexão · Ping e latência:**

> **Evitar:** Ping = velocidade; garantir ping baixo; **usar o termo sem explicar para
> públicos amplos**
> **Para:** *Ping shows how long data takes to travel between your device and the game
> server. Lower values usually mean faster response.*

Isso é uma quarta decisão que o Triador não tem: **manter o termo e explicar**. Não é
manter, não é traduzir, não é decidir. E é justamente a saída que a pesquisa aponta —
Furnas mostra que o melhor termo único ainda falha para a maioria, e o que funciona é
redundância de acesso. O `Latency (ping)` que achei em duas chaves de mobile é a mesma
ideia.

O brandbook chegou nisso sozinho, numa família. O Triador não tem onde guardar.

## Conflitos

**Nenhum conflito direto de decisão.** Não há termo que a planilha mande usar e a triagem
mande tirar, nem o contrário — porque a planilha simplesmente não decide no nível da
palavra.

O único desencontro é de **cobertura**: a triagem marcou 19 termos como `traduzir`, e a
revisão editorial passou por todas as strings desses termos sem tocá-los.

## Opções de integração

Em ordem de custo. Nenhuma implementada — é decisão sua.

**A. Quarta decisão no Triador: "explicar".** Termo que fica, mas nunca aparece sozinho
para público amplo. Exporta como regra que o linter verifica: se `ping` aparece isolado
numa tela de público amplo, aponta. Custo baixo, e é o achado da G-037 virando sistema.

**B. Modo de voz como coluna do Triador.** Importar de qual modo cada termo vem e mostrar
ao lado da distribuição por produto. O time passa a triar vendo que `ndis` é 100% Destrava
— a evidência mais forte que existe para "isso é implementação". Custo baixo: é join por
chave, os dois lados já existem.

**C. Fechar o ciclo na aplicação por string.** As 3.379 strings em "Validar texto no
contexto" são a fila de trabalho editorial. Cruzar com o glossário do Triador dá, para
cada uma, quais termos exigem troca — a planilha diz *como escrever*, o Triador diz *que
palavra usar*. Custo médio, e é o que mais economiza trabalho humano.

**D. Um produto só.** Fundir os dois artefatos. Custo alto e prematuro: a planilha ainda
tem 60 famílias aguardando validação de Produto, Marca e Legal.

## O que eu recomendo

**B, depois A.** B é quase de graça e melhora a triagem imediatamente, com evidência que o
time não tinha. A transforma o melhor achado da planilha numa regra verificável.

C é o de maior valor real, mas só depois que a triagem fechar — senão gera fila de
trabalho a partir de decisão que ainda vai mudar.

E vale repetir o que a pesquisa já dizia: nada disso impede o termo errado de entrar no
produto. A alavanca continua sendo a criação da string, com o Plassede.
