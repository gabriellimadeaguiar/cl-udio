# Linter de Vocabulário — plugin do Figma

Verifica os textos de um arquivo do Figma contra o glossário decidido no
[Triador de Vocabulário](../triador/README.md). Aponta termos que o time decidiu evitar e
corrige os casos seguros com um clique.

## Instalar (desenvolvimento)

Precisa do **Figma Desktop** — plugins locais não funcionam no navegador.

1. Baixe esta pasta (`manifest.json`, `code.js`, `ui.html`) para sua máquina
2. No Figma Desktop: menu **Plugins → Development → Import plugin from manifest…**
3. Aponte para o `manifest.json`
4. O plugin aparece em **Plugins → Development → Linter de Vocabulário**

Isso é só para desenvolver. Para o time, publique como **plugin privado da organização**:
na lista de Plugins → Development, **Publish**, e escolha a organização em vez da Community.
Plugin privado não passa pela revisão do Figma. Ao publicar, o Figma grava um `id` no
`manifest.json` — commite o arquivo depois, é esse id que identifica as versões seguintes.

`icone-128.png` é o ícone do formulário de publicação (fonte em `icone.svg`). Troque pelo do
Design System quando houver um.

Só **Figma Design**. Em FigJam o texto mora dentro de sticky notes, que não são nós de
texto — o plugin não enxergaria quase nada, então nem aparece lá.

## Usar

1. Abra o plugin
2. Selecione camadas — ou não selecione nada, para varrer a página inteira
3. **Verificar**

Não há nada para configurar: o glossário vem dentro do plugin. O cabeçalho mostra quantos
termos estão valendo e de quando é o glossário, para dar para perceber quando a versão
instalada ficou para trás.

Cada ocorrência mostra o termo, a camada e o texto. Dois botões:

- **Ir até a camada** — seleciona e centraliza no canvas
- **Corrigir para "X"** — aparece só quando a troca é segura

## Quando ele corrige e quando só sinaliza

A troca automática só acontece quando **o texto inteiro é o termo**, com sufixo opcional
entre parênteses:

| Texto | Ação |
|---|---|
| `Latency` | corrige → `Ping` |
| `Latency (ms)` | corrige → `Ping (ms)` |
| `LATENCY` | corrige → `PING` (preserva caixa) |
| `Latency chart` | só sinaliza |
| `Verify the game latency without ExitLag` | só sinaliza |

Em frase, trocar uma palavra pode quebrar concordância ou sentido. Nesses casos o plugin
aponta e deixa a decisão com quem está escrevendo.

## O glossário

Ele mora **dentro do `code.js`**, entre os marcadores `<<<GLOSSARIO` e `GLOSSARIO>>>`. O
plugin não faz nenhuma requisição de rede — `manifest.json` declara `allowedDomains: ["none"]`,
o que também é a resposta curta para quem, na organização, perguntar o que o plugin envia
para fora: nada.

### Atualizar depois de uma rodada de triagem

1. No Triador, **Exportar glossário** — baixa `glossario.json`
2. Ponha o arquivo nesta pasta e rode:

```bash
python3 embutir.py              # ou: python3 embutir.py ~/Downloads/glossario.json
```

3. No Figma, **Publish** no plugin

O script valida o JSON, recusa termo sem `term` ou `decision`, avisa se a origem ainda diz
"exemplo", e conta quantos termos passam a gerar apontamento. Enquanto você não publicar,
o time continua na versão anterior.

O formato é exatamente o que o Triador exporta:

```json
{
  "version": 1,
  "updated": "2026-09-11",
  "terms": [
    { "term": "latency", "decision": "traduzir", "prefer": "ping" },
    { "term": "ping",    "decision": "manter" },
    { "term": "jitter",  "decision": "decidir", "note": "definir por superfície" }
  ]
}
```

| Decisão | O que o linter faz |
|---|---|
| `manter` | Ignora — é o vocabulário certo |
| `traduzir` | Aponta como **evitar**; sugere `prefer` e corrige se for seguro |
| `decidir` | Aponta como **em discussão**, com a nota; nunca corrige |

### O glossário que já vem embutido é de exemplo

`glossario.exemplo.json` — as decisões ali são inventadas, não saíram do Triador. Serve para
ver o linter achando e corrigindo antes de o time ter triado qualquer coisa.

Enquanto ele for o embutido, o cabeçalho do plugin mostra **“glossário de exemplo — não é a
decisão do time”** em âmbar, e o `embutir.py` avisa no terminal. Troque pelo real antes de
publicar para a organização.

## Limitação que vale conhecer antes de adotar

**Texto em Figma costuma ser mock.** O que vai para produção é a string no sistema de
i18n. Este plugin pega o desvio cedo, no desenho — mas não impede que o termo errado entre
no produto.

O lugar com alavanca real é uma validação no fluxo de criação de strings. Este plugin é
complemento disso, não substituto.
