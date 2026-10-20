#!/usr/bin/env sh
# Docker Desktop que nao abre por arquivo preso (engine.sock) depois de desligamento brusco: o instalador deve DETECTAR e oferecer reparo
# (LICOES.md, 2026-10-20). Roda com o PowerShell que existir (pwsh no GitHub, powershell.exe no Windows), sempre em pastas de teste.
# Uso: sh tests/instalar/check_docker_reparo.sh   (REQUIRE_PWSH=1 faz a falta do PowerShell contar como falha)
cd "$(dirname "$0")/../.." || exit 2
PS1=instalar/instalar.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

PW=""
for c in pwsh powershell.exe powershell; do command -v "$c" >/dev/null 2>&1 && { PW="$c"; break; }; done
if [ -z "$PW" ]; then echo "  [NAO EXECUTADO] nenhum PowerShell encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && exit 1; exit 0; fi

# ---- funcoes (so em pastas de teste) ----
SAIDA=$("$PW" -NoProfile -ExecutionPolicy Bypass -File tests/instalar/docker-reparo.teste.ps1 2>&1 < /dev/null | tr -d '\r')
echo "$SAIDA" | grep '^PASSOU:' | sed 's/^PASSOU: /  [PASSOU] /'
if echo "$SAIDA" | grep '^FALHOU:' | sed 's/^FALHOU: /  [FALHOU] /' | grep . ; then FAIL=$((FAIL+1)); fi
[ "$(echo "$SAIDA" | grep -c '^PASSOU:')" -ge 13 ] || fail "menos de 13 verificacoes das funcoes de reparo passaram"

# ---- o reparo so funciona com o WSL parado (relatos do Docker e licao desta maquina, LICOES.md 2026-10-20): wsl --shutdown ANTES de mover a pasta ----
LIN_WSL=$(grep -n 'wsl.exe --shutdown\|wsl --shutdown' "$PS1" | head -1 | cut -d: -f1)
LIN_REP=$(grep -n 'RepararSocketsDocker \$pastaSegredos' "$PS1" | head -1 | cut -d: -f1)
if [ -n "$LIN_WSL" ] && [ -n "$LIN_REP" ] && [ "$LIN_WSL" -lt "$LIN_REP" ]; then pass "o instalador para o WSL (wsl --shutdown) ANTES de mover a pasta"; else fail "o reparo nao para o WSL antes de mover a pasta (wsl --shutdown na linha '$LIN_WSL', reparo na linha '$LIN_REP')"; fi
if grep -E "HEIMDALL_TESTE -ne '1'.*wsl(\.exe)? --shutdown" "$PS1" >/dev/null; then pass "wsl --shutdown so roda fora do modo de teste (os testes nunca derrubam o WSL)"; else fail "wsl --shutdown nao esta protegido pelo modo de teste"; fi

# O dono precisa saber, ANTES de aceitar, que "wsl --shutdown" para TODO o WSL (outras distribuicoes Linux e o que roda nelas), nao so o Docker.
PERG=$(grep -n "Pergunta 'Posso parar o WSL" "$PS1" | head -1)
echo "$PERG" | grep -qiE 'todas as distribuicoes|todo o WSL' && echo "$PERG" | grep -qi 'salve' && pass "a pergunta avisa que o WSL inteiro sera parado e pede para salvar o trabalho" || fail "a pergunta do reparo nao avisa que wsl --shutdown para TODAS as distribuicoes Linux (e pede para salvar o trabalho)"

# ---- ligacao no instalador (sempre -SomenteMostrar: nada e instalado nem removido) ----
T=$(mktemp -d); mkdir -p "$T/com" "$T/sem"; : > "$T/com/engine.sock"
roda() { # roda <pasta-de-segredos> <docker-rodando: 0|1>  (o estado do Docker e FIXADO: o teste nao pode depender do computador onde roda)
  HEIMDALL_TESTE=1 HEIMDALL_TESTE_VIRT=1 HEIMDALL_TESTE_WSL=1 HEIMDALL_TESTE_DOCKER_RODANDO="$2" HEIMDALL_TESTE_SECRETS_DIR="$1" "$PW" -NoProfile -File "$PS1" -SomenteMostrar -SemPausa -SemClipboard -SemTestes > "$T/saida.txt" 2>&1 < /dev/null; }
roda "$T/com" 0
grep -E 'FALTA.*(preso|engine\.sock)' "$T/saida.txt" >/dev/null && pass "instalador aponta o arquivo preso do Docker" || fail "instalador nao apontou o arquivo preso"
grep -q 'Secrets Engine' "$T/saida.txt" && pass "a mensagem cita o erro real (Secrets Engine) para o dono reconhecer" || fail "mensagem sem o nome do erro"
[ -e "$T/com/engine.sock" ] && pass "-SomenteMostrar NAO removeu o arquivo" || fail "-SomenteMostrar removeu o arquivo"
roda "$T/sem" 0
grep -qiE 'engine\.sock' "$T/saida.txt" && fail "apontou arquivo preso numa pasta limpa" || pass "pasta limpa: nada apontado"
roda "$T/com" 1
grep -qiE 'engine\.sock|Secrets Engine' "$T/saida.txt" && fail "com o Docker funcionando, apontou arquivo preso (nao deveria procurar)" || pass "Docker rodando: nao procura nem aponta arquivo preso"
rm -rf "$T"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
