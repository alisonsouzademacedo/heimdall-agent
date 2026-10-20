#!/usr/bin/env sh
# Fumaca do EXECUTOR (apps/trabalhos) com o Docker de verdade: o caminho completo fila -> docker compose run -> contêiner sem internet -> texto na mensagem.
# Audio (tom) e PDF sinteticos; prova o encanamento, nao a qualidade. Precisa da imagem heimdall-media-worker:1.0.0 (rode antes tests/infra/smoke_midia.sh
# ou "docker compose -f infra/compose/docker-compose.yml --profile trabalho build"). Variaveis: REQUIRE_DOCKER=1
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
if ! docker info >/dev/null 2>&1; then echo "  [NAO EXECUTADO] Docker nao esta rodando"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; fi
docker image inspect heimdall-media-worker:1.0.0 >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] imagem heimdall-media-worker:1.0.0 nao existe (rode tests/infra/smoke_midia.sh)"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; }
T=$(mktemp -d); trap 'rm -rf "$T"; docker rm -f heimdall-trabalho >/dev/null 2>&1' EXIT
cp infra/compose/modelo.env "$T/ambiente.env"
if node apps/trabalhos/scripts/fumaca.ts "$T" > "$T/saida.txt" 2> "$T/erro.txt"; then pass "executor: audio transcrito e PDF convertido pelo contêiner, e a fila terminou limpa ($(tail -1 "$T/saida.txt" | cut -c1-120))"; else fail "executor falhou"; tail -3 "$T/saida.txt"; head -5 "$T/erro.txt"; fi
[ -z "$(docker ps -a --filter name=heimdall-trabalho -q)" ] && pass "nenhum contêiner de trabalho ficou para tras" || fail "contêiner heimdall-trabalho sobrou"
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
