#!/usr/bin/env sh
# Teste da biblioteca tests/lib/so.sh: os programas FALSOS precisam funcionar como programas de verdade no sistema onde o teste roda
# (.cmd no Windows, script de shell no Linux). Roda no Windows (Git Bash) e no Linux. Uso: sh tests/lib/check_so.sh
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
. tests/lib/so.sh

case "$SO" in windows|linux) pass "sistema reconhecido: $SO" ;; *) fail "sistema nao previsto: $SO" ;; esac
grep -nP '[^\x00-\x7F]' tests/lib/so.sh >/dev/null && fail "so.sh tem caractere fora de ASCII" || pass "so.sh so ASCII"

# Quem executa o falso e o PowerShell (e o que o produto usa), com o PATH so com a pasta dos falsos.
PW=""; for c in pwsh powershell.exe powershell; do command -v "$c" >/dev/null 2>&1 && { PW=$(command -v "$c"); break; }; done
T=$(mktemp -d); B="$T/bin"; mkdir -p "$B"
roda_falso() { # roda_falso <comando do PowerShell>
  if [ -n "$PW" ]; then PATH="$B" "$PW" -NoProfile -Command "$1" 2>&1 | tr -d '\r'; else echo "SEM-POWERSHELL"; fi; }

falso_saida "$B" git "git version 2.50.0"
falso_saida "$B" docker "erro" 1
falso_anota "$B" winget "$T/chamadas.txt"
falso_script "$B" node 'if [ "$1" = "--version" ]; then echo v22.22.0; exit 0; fi
echo "outro: $1"' 'if "%~1"=="--version" (echo v22.22.0& exit /b 0)
echo outro: %~1'

if [ "$SO" = windows ]; then
  [ -f "$B/git.cmd" ] && [ -f "$B/node.cmd" ] && pass "no Windows os falsos sao .cmd (nao scripts sem extensao)" || fail "no Windows os falsos nao sao .cmd"
  [ "$(tr -cd '\r' < "$B/git.cmd" | wc -c)" -gt 0 ] && pass "os .cmd saem em CRLF" || fail "os .cmd nao estao em CRLF"
  [ ! -e "$B/git" ] && pass "no Windows nao sobra script de shell sem extensao (o que abria o 'escolher programa')" || fail "sobrou script sem extensao no Windows"
else
  [ -x "$B/git" ] && [ ! -e "$B/git.cmd" ] && pass "no Linux os falsos sao scripts de shell executaveis" || fail "no Linux os falsos estao errados"
fi

if [ -z "$PW" ]; then echo "  [NAO EXECUTADO] execucao dos falsos: nenhum PowerShell encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  [ "$(roda_falso '& git version')" = "git version 2.50.0" ] && pass "falso_saida: o PowerShell executa e recebe o texto" || fail "falso_saida nao imprimiu o texto"
  PATH="$B" "$PW" -NoProfile -Command '& docker info; exit $LASTEXITCODE' >/dev/null 2>&1; C=$?
  [ "$C" -eq 1 ] && pass "falso_saida: o codigo de saida 1 chega ao PowerShell" || fail "falso_saida: codigo $C (esperado 1)"
  rm -f "$T/chamadas.txt"; roda_falso '& winget install --id Git.Git; & winget install --id OpenJS.NodeJS.LTS' >/dev/null
  [ "$(wc -l < "$T/chamadas.txt" 2>/dev/null)" -eq 2 ] && grep -q 'install --id Git.Git' "$T/chamadas.txt" && grep -q 'install --id OpenJS.NodeJS.LTS' "$T/chamadas.txt" && pass "falso_anota: anota os argumentos, uma linha por chamada" || fail "falso_anota nao anotou como esperado"
  [ "$(roda_falso '& node --version')" = "v22.22.0" ] && pass "falso_script: ramo --version" || fail "falso_script: ramo --version"
  [ "$(roda_falso '& node apps/x.ts')" = "outro: apps/x.ts" ] && pass "falso_script: outros argumentos" || fail "falso_script: outros argumentos"
  # Get-Command (o que o instalador usa para saber se o programa existe) enxerga os falsos e so eles
  [ "$(roda_falso '[bool](Get-Command git -ErrorAction SilentlyContinue)')" = "True" ] && pass "Get-Command acha o falso" || fail "Get-Command nao acha o falso"
  [ "$(roda_falso '[bool](Get-Command python -ErrorAction SilentlyContinue)')" = "False" ] && pass "com o PATH so dos falsos, o python real NAO aparece (isolamento)" || fail "o PATH dos falsos deixou passar um python real"
fi

# vivo / matar: com um processo de verdade criado pelo proprio teste
if [ "$SO" = windows ]; then
  PIDN=$(powershell -NoProfile -Command '(Start-Process -FilePath ping -ArgumentList "-n","30","127.0.0.1" -WindowStyle Hidden -PassThru).Id' | tr -d '\r')
else
  sleep 30 & PIDN=$!
fi
vivo "$PIDN" && pass "vivo: reconhece um processo em execucao" || fail "vivo nao reconheceu o processo"
matar "$PIDN"; sleep 1
vivo "$PIDN" && fail "matar nao encerrou o processo" || pass "matar encerra e vivo percebe"

# caminho_nativo
N=$(caminho_nativo "$T/x")
if [ "$SO" = windows ]; then case "$N" in [A-Za-z]:/*) pass "caminho_nativo: C:/... no Windows" ;; *) fail "caminho_nativo no Windows devolveu $N" ;; esac
else [ "$N" = "$T/x" ] && pass "caminho_nativo: igual no Linux" || fail "caminho_nativo no Linux alterou o caminho"; fi

# limpar_pasta: apaga uma pasta (mesmo com a tentativa repetida) e nao deixa sobra
D="$T/lixo"; mkdir -p "$D/a/b"; echo x > "$D/a/b/f.txt"
limpar_pasta "$D"; [ ! -e "$D" ] && pass "limpar_pasta apaga a pasta e o que tem dentro" || fail "limpar_pasta nao apagou"

rm -rf "$T"
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
