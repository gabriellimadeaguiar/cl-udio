# Triador de Vocabulário

Ferramenta para classificar os termos técnicos do produto em **manter**, **traduzir**,
**decidir** ou **neutro**, e produzir a pauta da discussão do Design System.

**App:** https://claude.ai/code/artifact/c06dc16d-431b-4270-96e1-c730e1e38d0d

## Como regerar os dados

```bash
python3 extrair.py caminho/para/registry.json
```

Gera `terms.json` e `inconsistencies.json`. Para republicar o app, injete os dois em
`triador.template.html` no lugar do marcador `__DATA__`, como um objeto
`{"terms": [...], "inconsistencies": [...]}`.

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
