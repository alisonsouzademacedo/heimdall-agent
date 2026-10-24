#!/usr/bin/env sh
# Testes do envio da memoria (apps/memoria): cliente do Hindsight (servidor HTTP falso em 127.0.0.1), laco e arquitetura. Nao precisa de Docker nem de modelo.
cd "$(dirname "$0")/../.." || exit 2
# Saidas dos testes numa pasta temporaria PROPRIA, apagada ao sair (antes ficavam arquivos fixos em /tmp para sempre; LICOES.md, 2026-10-23).
SAIDAS=$(mktemp -d "${TMPDIR:-/tmp}/heimdall-saidas.XXXXXX"); trap 'rm -rf "$SAIDAS"' EXIT
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; [ "${REQUIRE_NODE:-0}" = 1 ] && exit 1; exit 0; }
cd apps/memoria || exit 2
[ -d node_modules ] || npm ci --no-audit --no-fund >$SAIDAS/memoria-npm.txt 2>&1 || { fail "npm ci falhou"; echo "RESULTADO: $FAIL falha(s)"; exit 1; }
if node --test "src/**/*.test.ts" >$SAIDAS/memoria-test.txt 2>&1; then pass "testes da memoria ($(grep -E '^(# |ℹ )pass ' $SAIDAS/memoria-test.txt | awk '{print $NF}') passaram)"; else fail "testes da memoria"; grep -E "^not ok" $SAIDAS/memoria-test.txt | head; fi
if npx tsc --noEmit >$SAIDAS/memoria-tsc.txt 2>&1; then pass "tipos da memoria (tsc sem erros)"; else fail "tipos da memoria"; head -10 $SAIDAS/memoria-tsc.txt; fi
if grep -E '"(\^|~|>=|\*|latest)' package.json | grep -v '"node"'; then fail "dependencia da memoria sem versao exata"; else pass "dependencias da memoria com versao exata"; fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
