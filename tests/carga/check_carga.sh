#!/usr/bin/env sh
# Carga e ressincronizacao: entrada do historico do WhatsApp (messaging-history.set) e processamento pelo modelo (extracao) e pelo Hindsight (memoria).
# Dados SINTETICOS (nunca conversa real). O padrao e moderado para a suite geral; para ver o limite de verdade:
#   HEIMDALL_CARGA_MENSAGENS=100000 HEIMDALL_CARGA_MENSAGENS_LLM=20000 sh tests/carga/check_carga.sh
# Uso: sh tests/carga/check_carga.sh
cd "$(dirname "$0")/../.." || exit 2
: "${HEIMDALL_CARGA_MENSAGENS:=15000}"
: "${HEIMDALL_CARGA_MENSAGENS_LLM:=3000}"
export HEIMDALL_CARGA_MENSAGENS HEIMDALL_CARGA_MENSAGENS_LLM
FAIL=0
for f in tests/carga/ingestao-historico.test.ts tests/carga/processamento.test.ts; do
  echo "== $f"
  SAIDA=$(node --test "$f" 2>&1); C=$?
  echo "$SAIDA" | grep -E "medida\]|^(not )?ok "
  if [ "$C" -ne 0 ]; then FAIL=$((FAIL+1)); echo "$SAIDA" | grep -E "^\s+(error|expected|actual)|AssertionError" | head -8; fi
done
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL arquivo(s) com falha"
[ "$FAIL" -eq 0 ]
