#!/usr/bin/env sh
# Roda todos os testes do projeto (cada tests/*/check_*.sh). Sai com erro se qualquer um falhar.
# Uso: sh tests/run-all.sh
cd "$(dirname "$0")/.." || exit 2
FAIL=0; N=0
for t in tests/*/check_*.sh; do
  N=$((N+1)); echo "== $t"
  sh "$t" || FAIL=$((FAIL+1))
done
echo "== $N arquivo(s) de teste, $FAIL com falha"
[ "$FAIL" -eq 0 ]
