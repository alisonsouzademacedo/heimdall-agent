#!/usr/bin/env sh
# Docker Desktop aberto (ou reparado) por dentro do app Claude (empacotado, AppData redirecionado) quebra no engine.sock real; fora do app funciona
# (LICOES.md, 2026-10-20). Roda com o PowerShell que existir (pwsh no GitHub, powershell.exe no Windows), sempre em pastas de teste.
# Uso: sh tests/instalar/check_fora_do_pacote.sh   (REQUIRE_PWSH=1 faz a falta do PowerShell contar como falha)
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

PW=""
for c in pwsh powershell.exe powershell; do command -v "$c" >/dev/null 2>&1 && { PW="$c"; break; }; done

# ---- arquivos novos: so ASCII e sem comando perigoso ----
for f in instalar/fora-do-pacote.ps1 instalar/docker-fora.ps1 instalar/docker-fora.cmd; do
  [ -s "$f" ] && pass "existe $f" || { fail "falta $f"; continue; }
  grep -nP '[^\x00-\x7F]' "$f" >/dev/null && fail "$f tem caracteres fora de ASCII" || pass "$f so ASCII"
  grep -qiE 'Invoke-Expression|\biex\b|Set-ExecutionPolicy|Add-MpPreference|-Verb RunAs|Invoke-WebRequest|Invoke-RestMethod|curl |wget |wsl(\.exe)? --unregister|Stop-Process' "$f" && fail "$f usa comando perigoso" || pass "$f sem iex, rede, administrador, Stop-Process nem wsl --unregister"
done
[ "$(tr -cd '\r' < instalar/docker-fora.cmd 2>/dev/null | wc -c)" -gt 0 ] && pass "docker-fora.cmd em CRLF (.gitattributes)" || fail "docker-fora.cmd nao esta em CRLF"
grep -q 'docker-fora.ps1' instalar/docker-fora.cmd 2>/dev/null && pass "docker-fora.cmd chama o docker-fora.ps1" || fail "docker-fora.cmd nao chama docker-fora.ps1"

# ---- o ajudante nunca roda de dentro do app, nunca mata o Docker e so remove arquivo vazio (via docker-reparo.ps1) ----
grep -q 'EmAppEmpacotado' instalar/docker-fora.ps1 2>/dev/null && pass "docker-fora.ps1 recusa rodar por dentro do app" || fail "docker-fora.ps1 nao confere se esta dentro do app"
grep -q 'RepararSocketsDocker' instalar/docker-fora.ps1 2>/dev/null && pass "docker-fora.ps1 usa o reparo testado (so remove arquivo de 0 bytes)" || fail "docker-fora.ps1 nao usa RepararSocketsDocker"

# ---- o launcher: nunca abre o Docker Desktop direto; sempre pelo ajudante ----
L=instalar/heimdall.ps1
grep -q 'fora-do-pacote.ps1' "$L" && grep -q 'function GarantirDocker' "$L" && pass "o launcher garante o Docker antes do compose" || fail "o launcher nao tem GarantirDocker"
grep -qi 'Docker Desktop\.exe' "$L" && fail "o launcher abre o Docker Desktop direto (deve usar docker-fora.cmd)" || pass "o launcher nao abre o Docker Desktop direto"
grep -q 'docker-fora.cmd' "$L" && pass "o launcher abre o Docker pelo docker-fora.cmd" || fail "o launcher nao usa docker-fora.cmd"
# mensagens do instalador (instrucao para o dono e para a IA)
grep -q 'docker-fora.cmd' instalar/instalar.ps1 && pass "o instalador manda usar docker-fora.cmd" || fail "o instalador nao cita docker-fora.cmd"
grep -qi 'docker-fora' instalar/PROMPT-IA.txt && pass "PROMPT-IA.txt avisa a IA para nao abrir o Docker por dentro do app" || fail "PROMPT-IA.txt nao avisa a IA"

if [ -z "$PW" ]; then echo "  [NAO EXECUTADO] funcoes e plano: nenhum PowerShell encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  SAIDA=$("$PW" -NoProfile -ExecutionPolicy Bypass -File tests/instalar/fora-do-pacote.teste.ps1 2>&1 < /dev/null | tr -d '\r')
  echo "$SAIDA" | grep '^PASSOU:' | sed 's/^PASSOU: /  [PASSOU] /'
  if echo "$SAIDA" | grep '^FALHOU:' | sed 's/^FALHOU: /  [FALHOU] /' | grep . ; then FAIL=$((FAIL+1)); fi
  [ "$(echo "$SAIDA" | grep -c '^PASSOU:')" -ge 16 ] || fail "menos de 16 verificacoes das funcoes passaram"

  # plano do launcher (-SomenteMostrar: nada e criado nem aberto; dados numa pasta de teste)
  T=$(mktemp -d)
  HEIMDALL_DATA="$T/data" "$PW" -NoProfile -ExecutionPolicy Bypass -File "$L" -Acao iniciar -SomenteMostrar -SemPausa > "$T/saida.txt" 2>&1 < /dev/null
  grep -q 'PLANO.*docker-fora.cmd' "$T/saida.txt" && pass "-SomenteMostrar mostra o plano de abrir o Docker pelo docker-fora.cmd" || fail "o plano nao cita docker-fora.cmd"
  [ ! -e "$T/data/processos.json" ] && pass "-SomenteMostrar nao registrou processo" || fail "-SomenteMostrar mexeu em dados"
  rm -rf "$T"
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
