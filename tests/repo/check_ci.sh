#!/usr/bin/env sh
# O projeto e Linux-only (decisao do dono, 2026-10-22): o GitHub roda todos os testes num unico job Ubuntu.
# Aqui se confere, por leitura, que .github/workflows/testes.yml continua assim e que a camada Windows nao voltou.
# Isto NAO prova que o YAML roda: so o GitHub prova (a documentacao do Actions nao esta em docs/).
# Uso: sh tests/repo/check_ci.sh
cd "$(dirname "$0")/../.." || exit 2
WF=.github/workflows/testes.yml
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

[ -f "$WF" ] || { fail "$WF nao existe"; echo "RESULTADO: 1 falha(s)"; exit 1; }
grep -qP '\t' "$WF" && fail "o YAML tem tabulacao (YAML nao aceita)" || pass "o YAML nao tem tabulacao"

# Um unico job, Ubuntu, rodando a bateria inteira.
grep -q 'runs-on: ubuntu-latest' "$WF" && pass "job unico no Ubuntu" || fail "o job do Ubuntu sumiu"
grep -q 'REQUIRE_NODE=1 sh tests/run-all.sh' "$WF" && pass "o job roda todos os testes (run-all.sh)" || fail "o run-all.sh nao e chamado"
grep -q 'node-version:' "$WF" && pass "o Node e instalado (setup-node)" || fail "sem setup-node"

# A camada Windows foi removida de proposito (Linux-only). Se alguem reintroduzir, o teste avisa.
if grep -qi 'windows-latest\|testes/instalar\|tests/lib\|tests/preflight' "$WF"; then
  fail "camada Windows de volta no workflow (o projeto e Linux-only)"
else
  pass "nenhum resquicio da camada Windows no workflow"
fi

# Permissao minima
grep -q 'contents: read' "$WF" && pass "permissoes minimas (contents: read)" || fail "permissoes do workflow ampliadas"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
