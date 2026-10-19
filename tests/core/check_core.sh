#!/usr/bin/env sh
# Testes do nucleo (apps/core): unidade, tipos e "teste dos testes" (mutacao).
# Uso: sh tests/core/check_core.sh        (REQUIRE_NODE=1 faz a falta do Node 22.18+ contar como falha)
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

if ! command -v node >/dev/null 2>&1; then
  echo "  [NAO EXECUTADO] Node nao encontrado"; [ "${REQUIRE_NODE:-0}" = 1 ] && FAIL=1
  [ "$FAIL" -eq 0 ] && echo "RESULTADO: nada a rodar" || echo "RESULTADO: falhou"; [ "$FAIL" -eq 0 ]; exit $?
fi
MAJOR=$(node -p "process.versions.node.split('.')[0]"); MINOR=$(node -p "process.versions.node.split('.')[1]")
if [ "$MAJOR" -lt 22 ] || { [ "$MAJOR" -eq 22 ] && [ "$MINOR" -lt 18 ]; }; then
  echo "  [NAO EXECUTADO] precisa de Node 22.18 ou mais (tem $(node -v))"; [ "${REQUIRE_NODE:-0}" = 1 ] && exit 1; exit 0
fi

# O nucleo nao pode ter dependencias de EXECUCAO (so de desenvolvimento): menos superficie de ataque.
if node -e "const p=require('./apps/core/package.json'); process.exit(p.dependencies && Object.keys(p.dependencies).length ? 1 : 0)"; then pass "nucleo sem dependencias de execucao"; else fail "nucleo com dependencia de execucao (registre em PROGRESS.md e justifique)"; fi

cd apps/core || exit 2
[ -d node_modules ] || npm ci --no-audit --no-fund >/dev/null 2>&1
if node --test "src/**/*.test.ts" >/tmp/heimdall-core-test.txt 2>&1; then pass "testes de unidade ($(grep -E '^(# |ℹ )pass ' /tmp/heimdall-core-test.txt | awk '{print $NF}') passaram)"; else fail "testes de unidade"; grep -E "^not ok" /tmp/heimdall-core-test.txt | head; fi
if npx tsc --noEmit >/tmp/heimdall-core-tsc.txt 2>&1; then pass "tipos (tsc sem erros)"; else fail "tipos"; head -10 /tmp/heimdall-core-tsc.txt; fi
cd ../..
# No Windows "python3" costuma ser o atalho falso da Loja: usa o primeiro interpretador que RODA de verdade (LICOES.md, 2026-10-19).
PY=""; for c in python3 python py; do if "$c" -c "import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)" >/dev/null 2>&1; then PY="$c"; break; fi; done
[ -n "$PY" ] || { fail "Python 3 nao encontrado (o teste dos testes precisa dele)"; PY=false; }
if "$PY" tests/core/mutacao.py >/tmp/heimdall-core-mut.txt 2>&1; then pass "teste dos testes ($(grep -c PEGOU /tmp/heimdall-core-mut.txt) mutacoes detectadas)"; else fail "teste dos testes"; grep -E "SOBREVIVEU|DESATUALIZADA" /tmp/heimdall-core-mut.txt; fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
