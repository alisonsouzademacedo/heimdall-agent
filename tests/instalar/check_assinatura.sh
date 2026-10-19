#!/usr/bin/env sh
# O instalador so executa o instalador do Docker se ele tiver assinatura digital valida da Docker (instalar/assinatura.ps1).
# Os testes de assinatura rodam so no Windows; a ligacao no instalador (confere ANTES de executar, e recusa se falhar) e verificada aqui por leitura.
# Uso: sh tests/instalar/check_assinatura.sh
cd "$(dirname "$0")/../.." || exit 2
PS1=instalar/instalar.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# ---- ligacao no instalador (sem PowerShell) ----
LIN_CONF=$(grep -n 'AssinaturaConfere' "$PS1" | head -1 | cut -d: -f1)
LIN_EXEC=$(grep -n "Start-Process -FilePath \$dest" "$PS1" | head -1 | cut -d: -f1)
if [ -n "$LIN_CONF" ] && [ -n "$LIN_EXEC" ] && [ "$LIN_CONF" -lt "$LIN_EXEC" ]; then pass "o instalador confere a assinatura ANTES de executar o instalador do Docker"; else fail "o instalador do Docker e executado sem conferir a assinatura (conferencia na linha '$LIN_CONF', execucao na linha '$LIN_EXEC')"; fi
grep -q "Docker Inc" "$PS1" && pass "o assinante esperado (Docker Inc) esta fixado no instalador" || fail "assinante esperado nao fixado"
grep -qE "ProgressPreference = 'SilentlyContinue'" "$PS1" && pass "download sem barra de progresso (rapido no PowerShell 5.1)" || fail "download com barra de progresso (muito lento no PowerShell 5.1)"

# ---- comportamento (so Windows) ----
PW=""
for c in powershell.exe pwsh; do command -v "$c" >/dev/null 2>&1 && { PW="$c"; break; }; done
case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*) ;;
  *) echo "  [NAO EXECUTADO] testes da assinatura: so no Windows"; [ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"; [ "$FAIL" -eq 0 ]; exit $? ;;
esac
if [ -z "$PW" ]; then echo "  [NAO EXECUTADO] PowerShell nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1)); else
  SAIDA=$("$PW" -NoProfile -ExecutionPolicy Bypass -File tests/instalar/assinatura.teste.ps1 2>&1 < /dev/null | tr -d '\r')
  echo "$SAIDA" | grep '^PASSOU:' | sed 's/^PASSOU: /  [PASSOU] /'
  echo "$SAIDA" | grep '^PULADO:' | sed 's/^PULADO: /  [PULADO] /'
  if echo "$SAIDA" | grep '^FALHOU:' | sed 's/^FALHOU: /  [FALHOU] /' | grep . ; then FAIL=$((FAIL+1)); fi
  [ "$(echo "$SAIDA" | grep -c '^PASSOU:')" -ge 4 ] || { fail "menos de 4 verificacoes de assinatura passaram"; }
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
