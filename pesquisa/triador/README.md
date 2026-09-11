# Triador de Vocabulário

Ferramenta para classificar os termos técnicos do produto em **manter**, **traduzir**,
**decidir** ou **neutro**, e produzir a pauta da discussão do Design System.

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

## Regerando os dados embutidos

O app abre com o registry da ExitLag já carregado. Para trocar esse padrão:

```bash
python3 extrair.py caminho/para/registry.json
```

Gera `terms.json` e `inconsistencies.json`. Injete os dois em `triador.template.html` no
lugar do marcador `__DATA__`, como `{"terms": [...], "inconsistencies": [...]}`.

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
| `terms.json` | 36 termos com frequência, distribuição e exemplos |
| `inconsistencies.json` | Conceitos com mais de um nome no produto |
| `triador.template.html` | Fonte do app, com `__DATA__` como marcador |
