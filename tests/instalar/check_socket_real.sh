#!/usr/bin/env sh
# Reparo do engine.sock preso testado com um socket Unix DE VERDADE deixado por um processo morto de repente (LICOES.md, 2026-10-20).
# Precisa do PowerShell 7 (pwsh). Uso: sh tests/instalar/check_socket_real.sh   (REQUIRE_PWSH=1 faz a falta do pwsh contar como falha)
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

PW=""
command -v pwsh >/dev/null 2>&1 && PW=pwsh
if [ -z "$PW" ]; then echo "  [NAO EXECUTADO] PowerShell 7 (pwsh) nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1)); [ "$FAIL" -eq 0 ] && { echo "RESULTADO: tudo passou"; exit 0; }; echo "RESULTADO: $FAIL falha(s)"; exit 1; fi

SAIDA=$("$PW" -NoProfile -ExecutionPolicy Bypass -File tests/instalar/socket-real.teste.ps1 2>&1 < /dev/null | tr -d '\r')
echo "$SAIDA" | grep '^PASSOU:' | sed 's/^PASSOU: /  [PASSOU] /'
echo "$SAIDA" | grep '^NAOEXEC:' | sed 's/^NAOEXEC: /  [NAO EXECUTADO] /'
if echo "$SAIDA" | grep '^FALHOU:' | sed 's/^FALHOU: /  [FALHOU] /' | grep . ; then FAIL=$((FAIL+1)); fi
if ! echo "$SAIDA" | grep -q '^NAOEXEC:'; then [ "$(echo "$SAIDA" | grep -c '^PASSOU:')" -ge 7 ] || fail "menos de 7 verificacoes do socket real passaram"; fi
[ ! -d data ] || [ -z "$(ls -d data/teste-socket-* 2>/dev/null)" ] && pass "o teste nao deixou pasta para tras" || fail "sobrou pasta data/teste-socket-*"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
