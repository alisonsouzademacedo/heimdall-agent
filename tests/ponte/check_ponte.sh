#!/usr/bin/env sh
# Testes da ponte (apps/ponte): cliente do Hermes (servidor falso em 127.0.0.1), config do Hermes, ponte do self-chat, laco e arquitetura. Nao precisa de Docker nem de modelo.
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; [ "${REQUIRE_NODE:-0}" = 1 ] && exit 1; exit 0; }
cd apps/ponte || exit 2
[ -d node_modules ] || npm ci --no-audit --no-fund >/tmp/heimdall-ponte-npm.txt 2>&1 || { fail "npm ci falhou"; echo "RESULTADO: $FAIL falha(s)"; exit 1; }
if node --test "src/**/*.test.ts" >/tmp/heimdall-ponte-test.txt 2>&1; then pass "testes da ponte ($(grep -E '^(# |ℹ )pass ' /tmp/heimdall-ponte-test.txt | awk '{print $NF}') passaram)"; else fail "testes da ponte"; grep -E "^not ok" /tmp/heimdall-ponte-test.txt | head; fi
if npx tsc --noEmit >/tmp/heimdall-ponte-tsc.txt 2>&1; then pass "tipos da ponte (tsc sem erros)"; else fail "tipos da ponte"; head -10 /tmp/heimdall-ponte-tsc.txt; fi
if grep -E '"(\^|~|>=|\*|latest)' package.json | grep -v '"node"'; then fail "dependencia da ponte sem versao exata"; else pass "dependencias da ponte com versao exata"; fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
