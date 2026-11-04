#!/usr/bin/env bash
# Baixa o MapLibre (versão fixa) e coloca dentro do app Android.
# Assim o mapa não carrega nenhum script de CDN na hora de usar.
# Uso: ./baixar_maplibre.sh proj/app/src/main/assets
set -euo pipefail

VER="4.7.1"
DEST="${1:?uso: baixar_maplibre.sh <pasta-assets>}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

( cd "$TMP" && npm pack "maplibre-gl@${VER}" --silent && tar -xzf "maplibre-gl-${VER}.tgz" )

mkdir -p "$DEST/maplibre"
cp "$TMP/package/dist/maplibre-gl.js" "$TMP/package/dist/maplibre-gl.css" "$DEST/maplibre/"

# Falha o build se algum arquivo vier vazio, em vez de gerar um app com o mapa quebrado.
test -s "$DEST/maplibre/maplibre-gl.js"
test -s "$DEST/maplibre/maplibre-gl.css"
echo "MapLibre ${VER} embutido em $DEST/maplibre"
