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

Para distribuir ao time sem cada um importar à mão, é preciso publicar como plugin privado
da organização — exige plano Organization ou Enterprise.

**Antes de passar a pasta adiante**, preencha `DEFAULT_URL` no topo do `code.js` com a URL
do glossário do time. Aí o plugin já abre apontando para o lugar certo e ninguém precisa
colar nada. Quem trocar o campo tem a própria escolha salva, que passa na frente do padrão.

Só **Figma Design**. Em FigJam o texto mora dentro de sticky notes, que não são nós de
texto — o plugin não enxergaria quase nada, então nem aparece lá.

## Usar

1. Abra o plugin
2. Confira a **URL do glossário** (fica salva para as próximas vezes)
3. Selecione camadas — ou não selecione nada, para varrer a página inteira
4. **Verificar**

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

O plugin espera um JSON assim — é exatamente o que o botão **Exportar glossário** do
Triador produz:

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

### Testar antes de ter glossário

`glossario.exemplo.json` existe para conferir a fiação do plugin: as decisões ali são
inventadas, não saíram do Triador. Serve para ver o linter achando e corrigindo, e nada além
disso — troque pelo glossário real antes de qualquer pessoa usar em arquivo de verdade.

### Onde hospedar

A URL precisa servir o JSON cru, sem autenticação. Opções:

- **GitHub Pages** do projeto
- **Raw do GitHub** (`raw.githubusercontent.com/...`) — só funciona em repositório público
- **Gist público**
- Qualquer host interno do time

Os domínios liberados estão em `manifest.json` → `networkAccess.allowedDomains`. Para usar
outro host, acrescente ali e reimporte o plugin.

## Limitação que vale conhecer antes de adotar

**Texto em Figma costuma ser mock.** O que vai para produção é a string no sistema de
i18n. Este plugin pega o desvio cedo, no desenho — mas não impede que o termo errado entre
no produto.

O lugar com alavanca real é uma validação no fluxo de criação de strings. Este plugin é
complemento disso, não substituto.
