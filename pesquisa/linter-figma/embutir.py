#!/usr/bin/env python3
"""Embute um glossario.json dentro do code.js do plugin.

Uso:
    python3 embutir.py [caminho/para/glossario.json]

Sem argumento, procura glossario.json nesta pasta. Depois de rodar, publique
o plugin no Figma para o time receber a versão nova.
"""
import json
import pathlib
import sys

AQUI = pathlib.Path(__file__).resolve().parent
ABRE = "// <<<GLOSSARIO — gerado por embutir.py, não edite à mão"
FECHA = "// GLOSSARIO>>>"


def main():
    origem = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else AQUI / "glossario.json"
    if not origem.exists():
        sys.exit(
            f"não achei {origem}.\n"
            "Exporte o glossário no Triador e deixe o arquivo aqui, ou passe o caminho:\n"
            "    python3 embutir.py ~/Downloads/glossario.json"
        )

    try:
        gloss = json.loads(origem.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"{origem.name} não é um JSON válido: {e}")

    termos = gloss.get("terms")
    if not isinstance(termos, list) or not termos:
        sys.exit(f'{origem.name} não tem um array "terms" com conteúdo.')

    for i, t in enumerate(termos):
        if not isinstance(t, dict) or not t.get("term") or not t.get("decision"):
            sys.exit(f'termo {i} está sem "term" ou "decision".')

    code = (AQUI / "code.js").read_text(encoding="utf-8")
    ini, fim = code.find(ABRE), code.find(FECHA)
    if ini < 0 or fim < 0:
        sys.exit("não achei os marcadores do glossário no code.js.")

    corpo = json.dumps(gloss, ensure_ascii=False, indent=2)
    novo = code[:ini] + ABRE + "\nconst GLOSSARY = " + corpo + ";\n" + code[fim:]
    (AQUI / "code.js").write_text(novo, encoding="utf-8")

    contas = {}
    for t in termos:
        contas[t["decision"]] = contas.get(t["decision"], 0) + 1
    resumo = ", ".join(f"{n} {d}" for d, n in sorted(contas.items()))
    ativos = sum(n for d, n in contas.items() if d != "manter")

    print(f"code.js atualizado — {len(termos)} termos ({resumo}).")
    print(f"{ativos} geram apontamento; 'manter' é ignorado pelo linter.")
    if "exemplo" in str(gloss.get("source", "")).lower():
        print("ATENÇÃO: a origem ainda diz 'exemplo'. Confira se é o glossário certo.")
    print("Agora publique o plugin no Figma para o time receber.")


if __name__ == "__main__":
    main()
