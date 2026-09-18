#!/usr/bin/env python3
"""Injeta terms.json + inconsistencies.json em triador.template.html.

Uso: python3 build.py [saida.html]

Confere de quebra que toda aba tem painel — o erro que já deixou a aba
Fonte em branco.
"""
import json
import pathlib
import re
import sys

AQUI = pathlib.Path(__file__).resolve().parent


def ler(nome):
    caminho = AQUI / nome
    return json.loads(caminho.read_text(encoding="utf-8")) if caminho.exists() else None


def carregar():
    """Monta o payload a partir do que o extrair.py deixou na pasta."""
    return {
        "terms": ler("terms.json") or [],
        "inconsistencies": ler("inconsistencies.json") or [],
        "meta": ler("meta.json"),
    }


def main():
    saida = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else AQUI / "triador.html"
    tpl = (AQUI / "triador.template.html").read_text(encoding="utf-8")

    if tpl.count("__DATA__") != 1:
        sys.exit("marcador __DATA__ ausente ou duplicado no template")

    data = carregar()
    out = tpl.replace("__DATA__", json.dumps(data, ensure_ascii=False, separators=(",", ":")))

    abas = set(re.findall(r'data-tab="([^"]+)"', out))
    paineis = set(re.findall(r'<section id="pane-([^"]+)"', out))
    if abas != paineis:
        sys.exit(
            "aba sem painel: %s | painel sem aba: %s" % (abas - paineis, paineis - abas)
        )

    saida.write_text(out, encoding="utf-8")
    print("%s — %d termos, abas %s, %d bytes" % (
        saida.name, len(data.get("terms", [])), sorted(abas), len(out)))


if __name__ == "__main__":
    main()
