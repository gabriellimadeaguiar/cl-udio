# Triador de Vocabulário

Ferramenta para classificar os termos técnicos do produto em **manter**, **traduzir** ou
**decidir**, e produzir a pauta da discussão do Design System.

**App:** https://claude.ai/code/artifact/c06dc16d-431b-4270-96e1-c730e1e38d0d

## Carregando um registry

O caminho normal é pela própria ferramenta: botão **Importar JSON**, no topo à direita → arraste o `.json`. O arquivo é
lido no navegador, a extração roda ali, e só o resultado (dezenas de termos, não as milhares
de strings) é sincronizado para o time.

Formatos aceitos:

| Formato | Exemplo |
|---|---|
| Registry por produto | `{"product":{"desktop":{"Tela.chave":{"translations":{"en-US":"Texto"}}}}}` |
| Objeto plano | `{"Tela.chave":"Texto"}` |
| Lista | `[{"key":"Tela.chave","text":"Texto","product":"desktop"}]` |
| Aninhado | Qualquer profundidade — a chave vira o caminho até o texto |

## Acrescentando um termo à mão

O campo **adicionar termo…**, na barra de filtros, entra com qualquer termo que a lista
curada não pegou. O termo é compartilhado com o time como qualquer decisão, e pode ser
removido pelo detalhe da linha.

Se houver um registry carregado nesta sessão, o termo nasce medido — frequência, distribuição
por produto e exemplos, pela mesma contagem que o `extrair.py` usa. Sem registry, ele entra
sem números, e a interface diz isso em vez de mostrar zeros. Ao importar um registry depois,
os termos à mão são medidos de novo.

O que ele nunca ganha é **sugestão de classificação**. A pré-classificação depende de saber
se o termo é vocabulário nativo de gaming ou linguagem de arquitetura — e isso a ferramenta
não tem como inferir de um termo que acabou de aprender.

## Exportando o glossário

Botão **Exportar glossário**, no topo à direita. Sai um JSON só com os termos que alguém
decidiu — termo, decisão, o substituto (`prefer`) e a nota:

```json
{
  "version": 1,
  "updated": "2026-09-11",
  "source": "registry ExitLag",
  "terms": [
    { "term": "latency", "decision": "traduzir", "prefer": "ping" },
    { "term": "ping",    "decision": "manter" },
    { "term": "jitter",  "decision": "decidir", "note": "definir por superfície" }
  ]
}
```

É esse arquivo que o [Linter de Vocabulário](../linter-figma/README.md) consome. Para o
linter enxergar, o JSON precisa estar numa URL pública — Pages, raw do GitHub ou gist.

## Regerando os dados embutidos

O app abre com o registry da ExitLag já carregado. Para trocar esse padrão:

```bash
python3 extrair.py caminho/para/registry.json   # gera terms.json e inconsistencies.json
python3 build.py                                # injeta no lugar de __DATA__
```

O `build.py` também confere que toda aba tem painel — o tipo de erro que já deixou uma aba
em branco antes.

O `extrair.py` e a extração em JavaScript dentro do app implementam a mesma lógica —
verificado contra o registry real: 12.440 strings, 36 termos, 5 grupos nos dois.

## A heurística de pré-classificação

O sinal principal é a **proporção de uso no portal**. O portal é material de marketing:
um termo que o marketing usa é um termo que o público entende. Um termo que só aparece no
desktop é, quase sempre, detalhe de implementação.

| Sinal | Classificação sugerida |
|---|---|
| Vocabulário nativo de gaming | manter |
| Sigla ou termo de rede com ~0% no portal | traduzir |
| Técnico, mas o marketing usa (≥30% no portal) | decidir |

A sugestão é ponto de partida, não veredito — a triagem no app é que decide.

## Estrutura

| Arquivo | O que é |
|---|---|
| `extrair.py` | Extração e pré-classificação a partir do registry |
| `build.py` | Injeta os dados no template e confere abas × painéis |
| `terms.json` | 36 termos com frequência, distribuição e exemplos |
| `inconsistencies.json` | Conceitos com mais de um nome no produto |
| `meta.json` | Origem e tamanho do registry usado |
| `triador.template.html` | Fonte do app, com `__DATA__` como marcador |
