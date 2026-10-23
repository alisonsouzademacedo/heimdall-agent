#!/usr/bin/env sh
# TESTE REAL da extracao com o Hermes logado (gasta cota do ChatGPT: ~4 mil tokens por dia de conversa). Roda numa COPIA do acervo: o original nao muda.
# Nao roda no run-all (depende do login do ChatGPT e do Hermes no ar). Uso: sh tests/infra/smoke_extracao_real.sh [N=8]
# Variaveis: REQUIRE_REAL=1 conta a ausencia como falha.
cd "$(dirname "$0")/../.." || exit 2
N=${1:-8}
sem() { echo "  [NAO EXECUTADO] $1"; [ "${REQUIRE_REAL:-0}" = 1 ] && exit 1; exit 0; }
command -v node >/dev/null 2>&1 || sem "Node nao encontrado"
[ -s data/acervo.sqlite ] || sem "nao ha data/acervo.sqlite"
[ -f infra/compose/.env ] || sem "nao ha infra/compose/.env"
curl -s -o /dev/null --max-time 5 http://127.0.0.1:8642/health || sem "o Hermes nao responde em 127.0.0.1:8642"
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
python3 -I - "$T/copia.sqlite" <<'PY' || exit 2
import sqlite3, sys
a = sqlite3.connect('file:data/acervo.sqlite?mode=ro', uri=True, timeout=30); b = sqlite3.connect(sys.argv[1]); a.backup(b); b.close(); a.close()
PY
echo "== extracao real em $N dias (copia do acervo; so contagens)"
node tests/infra/extracao-real.ts "$T/copia.sqlite" "$N"
