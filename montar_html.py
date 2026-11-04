#!/usr/bin/env python3
"""Junta o esqueleto src/index.html com os arquivos de src/css e src/js
e grava o index.html único que o app (Android e Windows) usa.

Uso:  python3 montar_html.py [esqueleto] [saida]
      python3 montar_html.py src/index.html index.html     (padrão)

No esqueleto, cada marcador {{incluir: caminho}} é trocado pelo conteúdo exato
do arquivo. Nada além disso é alterado, então o app roda igual a antes.
"""
import os
import re
import sys

MARCADOR = re.compile(r"\{\{incluir: ([^}]+)\}\}")


def montar(esqueleto, saida):
    base = os.path.dirname(os.path.abspath(esqueleto))
    html = open(esqueleto, encoding="utf-8", newline="").read()

    def trocar(m):
        caminho = os.path.join(base, m.group(1).strip())
        if not os.path.isfile(caminho):
            sys.exit("ERRO: arquivo não encontrado: " + m.group(1))
        return open(caminho, encoding="utf-8", newline="").read()

    pronto = MARCADOR.sub(trocar, html)
    if MARCADOR.search(pronto):
        sys.exit("ERRO: sobrou um marcador {{incluir: ...}} sem trocar")
    with open(saida, "w", encoding="utf-8", newline="") as f:
        f.write(pronto)
    print("index.html montado: %s (%d bytes)" % (saida, len(pronto.encode("utf-8"))))


if __name__ == "__main__":
    montar(
        sys.argv[1] if len(sys.argv) > 1 else "src/index.html",
        sys.argv[2] if len(sys.argv) > 2 else "index.html",
    )
