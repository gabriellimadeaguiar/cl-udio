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

Não há nada para configurar. O plugin busca o glossário sozinho ao abrir e o cabeçalho mostra
quantos termos estão valendo e de quando é a versão. Sem rede, ele usa a última que baixou e
diz isso — apontar com o vocabulário de ontem é melhor que não apontar.

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

Ele mora **numa URL**, não dentro do plugin — é o que permite o vocabulário mudar sem
ninguém republicar nada. Ninguém digita esse endereço: ele é gravado uma vez em
`GLOSSARY_URL`, no topo do `code.js`, e a interface não tem campo para ele.

O plugin faz uma leitura e só. Nada do arquivo do Figma é enviado para fora — é a resposta
curta para quem perguntar isso na hora de publicar para a organização.

### Onde hospedar

Precisa servir o JSON cru, sem autenticação. **Gist secreto** é o caminho mais curto:

1. [gist.github.com](https://gist.github.com) → cole o JSON → nome `glossario.json`
2. **Create secret gist** — não aparece em busca nem no seu perfil, mas quem tem o link lê.
   Não é sigilo: é discrição. Se o vocabulário for sensível, use um host interno do time.
3. Botão **Raw** → copie a URL → **apague o hash longo do meio dela**

O link do botão Raw aponta para aquela revisão e nunca muda. Sem o hash, ele serve sempre a
versão mais recente — e é essa forma que vai no `GLOSSARY_URL`:

```
fixa  …/a1b2c3d4e5f6…/glossario.json
viva  …/glossario.json
```

Alternativas: **GitHub Pages**, **raw do GitHub** (só em repositório público) ou qualquer host
interno. Fora dos domínios já liberados, acrescente o seu em `manifest.json` →
`networkAccess.allowedDomains` e publique de novo.

### Atualizar depois de uma rodada de triagem

1. No Triador, **Exportar glossário**
2. Abra o gist, **Edit**, cole o novo conteúdo, **Save**

Acabou. O time pega a versão nova na próxima vez que abrir o plugin. Nenhum republish, nenhum
arquivo local, nenhum terminal — dá para fazer de qualquer computador. O cache do GitHub
costuma levar alguns minutos para virar.

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

### Testar antes de o time ter triado

`glossario.exemplo.json` — as decisões ali são inventadas, não saíram do Triador. Ponha num
gist e aponte o `GLOSSARY_URL` para ele para ver o linter achando e corrigindo.

Enquanto a origem do glossário disser "exemplo", o cabeçalho do plugin mostra **“glossário de
exemplo — não é a decisão do time”** em âmbar. Troque pelo real antes de publicar para a
organização.

## Limitação que vale conhecer antes de adotar

**Texto em Figma costuma ser mock.** O que vai para produção é a string no sistema de
i18n. Este plugin pega o desvio cedo, no desenho — mas não impede que o termo errado entre
no produto.

O lugar com alavanca real é uma validação no fluxo de criação de strings. Este plugin é
complemento disso, não substituto.
