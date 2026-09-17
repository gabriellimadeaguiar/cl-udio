# Tom de voz da ExitLag × Triador de Vocabulário

Frente que cruza a planilha de tom de voz e glossário de marca da ExitLag com a triagem de
vocabulário feita no [Triador](../triador/README.md).

Esta rodada é **diagnóstico**, não integração: ler a planilha, mapear onde ela toca o
Triador, onde as duas se contradizem, e o que cada uma enxerga que a outra não enxerga. As
opções de integração vêm depois, com o mapa na mão.

## Estado

Aguardando a planilha. O arquivo está no Google Drive
(`13Pt_diLUJT0asMywX4zHVnAoV_UWh6la`) e o conector está autenticado, mas ainda desligado
nesta conversa.

O link traz `rtpof=true&sd=true`, o que indica um **.xlsx carregado no Drive**, não uma
planilha nativa do Google — então a leitura é do arquivo binário, não pelos endpoints de
export do Sheets.

## Estrutura

| Caminho | O quê |
|---|---|
| `planilha/` | Cópia do arquivo e a extração em texto, para o diagnóstico ser conferível |
| `diagnostico.md` | O diagnóstico. Ainda não escrito. |

## Regra desta frente

Toda afirmação do diagnóstico aponta para aba e coluna da planilha, ou para o termo em
`../triador/terms.json`. Conflito entre a planilha e a triagem vira pauta, nunca correção
automática de uma decisão que o time já tomou.
