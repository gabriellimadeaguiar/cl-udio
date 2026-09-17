#!/usr/bin/env python3
"""Extrai as abas da planilha de tom de voz e cruza com a triagem do Triador.

Uso: python3 extrair.py [planilha/glossario-exitlag-v0.3.xlsx]

Gera planilha/familias.json e planilha/aplicacao.json (ignorados pelo git) e
imprime o cruzamento que sustenta o diagnostico.md.
"""
import collections
import json
import pathlib
import re
import sys

import openpyxl

AQUI = pathlib.Path(__file__).resolve().parent
TRIADOR = AQUI.parent / "triador"


def tabela(wb, nome, cabecalho=3):
    """As abas grandes têm título e subtítulo antes do cabeçalho real."""
    linhas = list(wb[nome].iter_rows(values_only=True))
    cols = [(str(c).strip() if c else f"col{j}") for j, c in enumerate(linhas[cabecalho])]
    out = []
    for r in linhas[cabecalho + 1:]:
        if not any(c is not None and str(c).strip() for c in r):
            continue
        out.append({cols[j]: (str(c).strip() if c is not None else "")
                    for j, c in enumerate(r) if j < len(cols)})
    return out


def main():
    src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else AQUI / "planilha" / "glossario-exitlag-v0.3.xlsx"
    if not src.exists():
        sys.exit(f"não achei {src}. A planilha não é versionada — veja o README.")

    wb = openpyxl.load_workbook(src, data_only=True)
    fam = tabela(wb, "Glossário por família")
    app = tabela(wb, "Aplicação por string")
    (AQUI / "planilha" / "familias.json").write_text(
        json.dumps(fam, ensure_ascii=False, indent=1), encoding="utf-8")
    (AQUI / "planilha" / "aplicacao.json").write_text(
        json.dumps(app, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(fam)} famílias, {len(app)} strings")

    voz = cruzar_voz(app, TRIADOR / "terms.json")
    (TRIADOR / "voz.json").write_text(
        json.dumps(voz, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"\n{'termo':<12} {'triagem':<9} {'linhas':>7} {'mantém':>7} {'remove':>7}  modo dominante")
    for v in voz:
        print(f"{v['term']:<12} {v['triagem']:<9} {v['linhas']:>7} {v['mantem']:>7} "
              f"{v['linhas']-v['mantem']:>7}  {v['modo']} {v['pct']}%")
    print(f"\nvoz.json: {len(voz)} termos")


def cruzar_voz(app, caminho_terms):
    """Agrega, por termo, em que modo de voz as strings dele vivem.

    Só o agregado sai daqui — termo, modo dominante, percentual e contagem.
    As strings e as regras de marca ficam na planilha, que não é versionada.
    """
    termos = json.loads(pathlib.Path(caminho_terms).read_text(encoding="utf-8"))
    out = []
    for t in termos:
        nome = t["term"]
        rx = re.compile(r"\b" + re.escape(nome) + r"s?\b", re.I)
        hits = [a for a in app if rx.search(a.get("Texto atual", ""))]
        if not hits:
            continue
        modos = collections.Counter(a.get("Modo da voz", "—") for a in hits)
        modo, n = modos.most_common(1)[0]
        out.append({
            "term": nome,
            "triagem": t["pre"],
            "modo": modo,
            "pct": round(n / len(hits) * 100),
            "linhas": len(hits),
            # quantas sugestões da planilha preservam o termo: mede a lacuna
            "mantem": sum(1 for a in hits if rx.search(a.get("Sugestão de texto", ""))),
        })
    return out


if __name__ == "__main__":
    main()
