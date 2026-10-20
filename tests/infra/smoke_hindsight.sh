#!/usr/bin/env sh
# FUMACA com o Hindsight de verdade (Docker): sobe PostgreSQL + Hindsight pelo Compose (projeto "heimdall-smoke-h", volumes proprios, apagados no fim) e roda
# o cliente de apps/memoria contra ele. Sem modelo de linguagem (provider none): prova que o FORMATO dos pedidos de retain e recall e aceito, nao a qualidade.
# Pesado (imagens e modelo de embeddings). Precisa da porta 8888 livre. Nao roda no run-all. Variaveis: REQUIRE_DOCKER=1 · HEIMDALL_CA_PEM=... · SMOKE_MANTER=1
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
if ! docker info >/dev/null 2>&1; then echo "  [NAO EXECUTADO] Docker nao esta rodando"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; fi
command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; exit 0; }
. tests/infra/lib_docker.sh
if "$PY" -I -c "import socket,sys; s=socket.socket(); s.settimeout(2)
try: s.connect(('127.0.0.1', 8888)); sys.exit(0)
except OSError: sys.exit(1)"; then echo "  [NAO EXECUTADO] porta 8888 ocupada (instalacao real rodando?): nao vou interferir"; exit 0; fi

T=$(mktemp -d); PROJ=heimdall-smoke-h; ENVF="$T/env"
printf 'POSTGRES_PASSWORD=%s\nAPI_SERVER_KEY=%s\nHINDSIGHT_API_LLM_PROVIDER=none\n' "smoke$(date +%s)$$" "chave-smoke-$(date +%s)-0123456789" > "$ENVF"
cleanup() { [ "${SMOKE_MANTER:-0}" != 1 ] && docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml down -v --remove-orphans >/dev/null 2>&1; rm -rf "$T"; }
trap cleanup EXIT
construir infra/hindsight heimdall-hindsight:1.0.0-onnx ghcr.io/vectorize-io/hindsight:1.0.0-slim && pass "imagem do Hindsight pronta" || { fail "imagem do Hindsight nao construiu"; tail -5 "$T/build.txt"; }
docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml up -d --no-build postgres hindsight >"$T/up.txt" 2>&1 && pass "docker compose up (postgres, hindsight)" || { fail "compose up falhou"; tail -8 "$T/up.txt"; }
OK=0; i=0
while [ $i -lt 60 ]; do
  "$PY" -I -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8888/health', timeout=5).status == 200 else 1)" 2>/dev/null && { OK=1; break; }
  i=$((i+1)); sleep 5
done
[ "$OK" = 1 ] && pass "Hindsight saudavel em 127.0.0.1:8888" || { fail "Hindsight nao ficou saudavel em 5 min"; docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml logs --tail 15 hindsight 2>&1 | cut -c1-200; }
if [ "$OK" = 1 ]; then
  SAIDA=$(node apps/memoria/scripts/fumaca.ts 2>"$T/err.txt" | tail -1)
  echo "$SAIDA" | grep -q '"saude":true' && pass "cliente: saude() responde true" || fail "cliente: saude() nao respondeu ($SAIDA)"
  echo "$SAIDA" | grep -q '"reter":"aceito"' && pass "cliente: retain assincrono aceito pelo Hindsight real" || { fail "cliente: retain recusado ($SAIDA)"; head -3 "$T/err.txt"; }
  echo "$SAIDA" | grep -q '"reter_repetido":"aceito"' && pass "cliente: o mesmo retain repetido (mesmo operation_id) tambem e aceito" || fail "cliente: retain repetido recusado ($SAIDA)"
  echo "$SAIDA" | grep -qE '"apagar":"(apagado|nao_existia)"' && pass "cliente: apagar um documento (esquecer cliente apagado) e aceito pelo Hindsight real" || fail "cliente: apagar documento falhou ($SAIDA)"
  echo "$SAIDA" | grep -q '"lembrar":"respondeu"' && pass "cliente: recall com tipos, orcamento e tags respondeu" || fail "cliente: recall falhou ($SAIDA)"
fi
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
