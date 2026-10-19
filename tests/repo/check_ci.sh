#!/usr/bin/env sh
# O GitHub deve rodar os testes TAMBEM no Windows (onde o dono usa o Heimdall): tres erros reais da 1a rodada (LICOES.md, 2026-10-19)
# so apareceram la. Aqui se confere, por leitura, que .github/workflows/testes.yml tem o job do Windows com Node 22 e 24.
# Isto NAO prova que o YAML roda: so o GitHub prova (a documentacao do Actions nao esta em docs/).
# Uso: sh tests/repo/check_ci.sh
cd "$(dirname "$0")/../.." || exit 2
WF=.github/workflows/testes.yml
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

[ -f "$WF" ] || { fail "$WF nao existe"; echo "RESULTADO: 1 falha(s)"; exit 1; }
grep -qP '\t' "$WF" && fail "o YAML tem tabulacao (YAML nao aceita)" || pass "o YAML nao tem tabulacao"

# O job do Windows: trecho entre a linha 'windows:' e o proximo job (ou o fim do arquivo)
JOB=$(awk '/^  windows:/{f=1; print; next} f && /^  [A-Za-z0-9_-]+:/{f=0} f' "$WF")
[ -n "$JOB" ] && pass "existe um job 'windows'" || fail "nao existe job 'windows'"
echo "$JOB" | grep -q 'runs-on: windows-latest' && pass "o job roda em windows-latest" || fail "o job nao roda em windows-latest"
echo "$JOB" | grep -qE "node: *\[ *'?22'? *, *'?24'? *\]" && pass "matriz de Node: 22 e 24" || fail "matriz de Node 22 e 24 ausente"
echo "$JOB" | grep -q 'node-version: \${{ matrix.node }}' && pass "o setup-node usa a versao da matriz" || fail "setup-node nao usa matrix.node"
echo "$JOB" | grep -qE 'npm test' && pass "roda npm test (nucleo)" || fail "nao roda npm test"
echo "$JOB" | grep -q 'working-directory: apps/core' && pass "npm test roda em apps/core" || fail "npm test fora de apps/core"
echo "$JOB" | grep -q 'tests/repo/check_higiene.sh' && pass "roda check_higiene.sh" || fail "nao roda check_higiene.sh"
echo "$JOB" | grep -q 'tests/instalar/check_ambiente_windows.sh' && pass "roda check_ambiente_windows.sh (virtualizacao e WSL)" || fail "nao roda check_ambiente_windows.sh"
echo "$JOB" | grep -q 'tests/instalar/check_assinatura.sh' && pass "roda check_assinatura.sh (assinatura do Docker, so no Windows)" || fail "nao roda check_assinatura.sh"
echo "$JOB" | grep -q 'fail-fast: false' && pass "uma versao de Node falhar nao esconde a outra (fail-fast: false)" || fail "fail-fast nao desligado"
# O dono recebe os arquivos em LF (ZIP do GitHub): o runner nao deve converter para CRLF antes do checkout
echo "$JOB" | grep -q 'core.autocrlf false' && pass "autocrlf desligado antes do checkout (arquivos em LF, como no ZIP do dono)" || fail "autocrlf nao desligado antes do checkout"
LIN_AUTO=$(echo "$JOB" | grep -n 'core.autocrlf false' | head -1 | cut -d: -f1); LIN_CHK=$(echo "$JOB" | grep -n 'actions/checkout' | head -1 | cut -d: -f1)
[ -n "$LIN_AUTO" ] && [ -n "$LIN_CHK" ] && [ "$LIN_AUTO" -lt "$LIN_CHK" ] && pass "a configuracao vem ANTES do checkout" || fail "a configuracao nao vem antes do checkout"
# O job do Ubuntu continua como estava (nao pode ser removido por engano)
grep -q 'runs-on: ubuntu-latest' "$WF" && grep -q 'REQUIRE_PWSH=1 REQUIRE_NODE=1 sh tests/run-all.sh' "$WF" && pass "o job do Ubuntu (todos os testes) continua" || fail "o job do Ubuntu foi alterado ou removido"
# Permissao minima
grep -q 'contents: read' "$WF" && pass "permissoes minimas (contents: read)" || fail "permissoes do workflow ampliadas"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
