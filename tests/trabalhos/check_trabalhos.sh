#!/usr/bin/env sh
# Testes do executor (apps/trabalhos): comandos do Docker, portas, ciclo e arquitetura. Nao precisa de Docker (o Docker real fica em tests/infra/smoke_executor.sh).
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; [ "${REQUIRE_NODE:-0}" = 1 ] && exit 1; exit 0; }
cd apps/trabalhos || exit 2
[ -d node_modules ] || npm ci --no-audit --no-fund >/tmp/heimdall-trabalhos-npm.txt 2>&1 || { fail "npm ci falhou"; echo "RESULTADO: $FAIL falha(s)"; exit 1; }
if node --test "src/**/*.test.ts" >/tmp/heimdall-trabalhos-test.txt 2>&1; then pass "testes do executor ($(grep -E '^(# |ℹ )pass ' /tmp/heimdall-trabalhos-test.txt | awk '{print $NF}') passaram)"; else fail "testes do executor"; grep -E "^not ok" /tmp/heimdall-trabalhos-test.txt | head; fi
if npx tsc --noEmit >/tmp/heimdall-trabalhos-tsc.txt 2>&1; then pass "tipos do executor (tsc sem erros)"; else fail "tipos do executor"; head -10 /tmp/heimdall-trabalhos-tsc.txt; fi
if grep -E '"(\^|~|>=|\*|latest)' package.json | grep -v '"node"'; then fail "dependencia do executor sem versao exata"; else pass "dependencias do executor com versao exata"; fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
