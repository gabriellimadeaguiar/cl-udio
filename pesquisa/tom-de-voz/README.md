# Tom de voz da ExitLag × Triador de Vocabulário

Frente que cruza a planilha de tom de voz e glossário de marca da ExitLag com a triagem de
vocabulário feita no [Triador](../triador/README.md).

Esta rodada é **diagnóstico**, não integração: ler a planilha, mapear onde ela toca o
Triador, onde as duas se contradizem, e o que cada uma enxerga que a outra não enxerga. As
opções de integração vêm depois, com o mapa na mão.

## Estado

Planilha lida e cruzada com a triagem. O resultado está em [`diagnostico.md`](diagnostico.md).

Em uma linha: as duas foram feitas sobre a mesma base e **chegam à mesma conclusão por
caminhos diferentes**, mas a planilha opera no nível da frase e deixa o vocabulário
intacto — 115 strings com termos de implementação saem da revisão sem serem tocadas.

## Estrutura

| Caminho | O quê |
|---|---|
| `planilha/` | O .xlsx e a extração em JSON, para o cruzamento ser refazível |
| `diagnostico.md` | O diagnóstico, datado de 17/09/2026 |

## Regra desta frente

Toda afirmação do diagnóstico aponta para aba e coluna da planilha, ou para o termo em
`../triador/terms.json`. Conflito entre a planilha e a triagem vira pauta, nunca correção
automática de uma decisão que o time já tomou.

## Por que os dados não estão versionados

Este repositório é público. A planilha carrega as 6.222 strings do produto e as regras
internas de marca, e a extração em JSON carrega as duas coisas em texto corrido — bem mais
do que os exemplos soltos que já estão no `terms.json`.

Os arquivos ficam locais, ignorados pelo git. O `diagnostico.md` cita só o necessário para
cada afirmação ser conferível.

Para refazer o cruzamento, ponha o `.xlsx` em `planilha/` e rode `extrair.py` desta pasta.
