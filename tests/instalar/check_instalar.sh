#!/usr/bin/env sh
# Testes do instalador do Windows (instalar/instalar.ps1): so ASCII, sem ${var}: perigoso, sintaxe, e comportamento com
# programas FALSOS no PATH (nada e instalado de verdade). Uso: sh tests/instalar/check_instalar.sh  (REQUIRE_PWSH=1 exige o PowerShell 7)
cd "$(dirname "$0")/../.." || exit 2
PS1=instalar/instalar.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# ---- estaticos (sem PowerShell) ----
BAD=$(grep -nE '\$[A-Za-z_][A-Za-z0-9_]*:([^A-Za-z0-9_]|$)' "$PS1" | grep -vE '\$(env|script|global|local|private|using):')
[ -z "$BAD" ] && pass "nenhum \"\$nome:\" perigoso" || { fail "padrao \"\$nome:\" perigoso"; echo "$BAD" | cut -c1-120; }
if grep -nP '[^\x00-\x7F]' "$PS1" instalar/PROMPT-IA.txt iniciar.cmd >/dev/null; then fail "arquivo com caractere fora de ASCII"; else pass "instalador, prompt e iniciar.cmd so com ASCII"; fi
if grep -qiE 'Invoke-Expression|\biex\b|--accept-license|--quiet|Set-ExecutionPolicy|Add-MpPreference|-Verb RunAs' "$PS1"; then fail "o instalador usa comando proibido (iex, aceitar licenca por voce, mexer em seguranca do Windows, elevar sem pedir)"; else pass "sem iex, sem aceitar licenca pelo dono, sem mexer em seguranca do Windows"; fi
URLS=$(grep -oE 'https?://[^ "'"'"')]+' "$PS1" | sed -E 's|(https?://[^/]+).*|\1|' | sort -u | tr '\n' ' ')
for u in $URLS; do case "$u" in https://desktop.docker.com|https://git-scm.com|https://nodejs.org|https://www.python.org|https://docs.docker.com) ;; *) fail "endereco nao previsto no instalador: $u";; esac; done
pass "enderecos no instalador: $URLS"
grep -q 'Git.Git' "$PS1" && grep -q 'OpenJS.NodeJS.LTS' "$PS1" && grep -q 'Python.Python.3.14' "$PS1" && pass "IDs do winget iguais aos da documentacao (codex-manual.md)" || fail "IDs do winget diferem da documentacao"
grep -qF 'instalar\instalar.ps1' iniciar.cmd && grep -q "ExecutionPolicy Bypass" iniciar.cmd && grep -q "pause" iniciar.cmd && pass "iniciar.cmd chama o instalador e pausa" || fail "iniciar.cmd incompleto"
grep -qx 'instalar-relatorio.txt' .gitignore && pass ".gitignore cobre o relatorio do instalador" || fail ".gitignore sem instalar-relatorio.txt"

# ---- com PowerShell ----
PW="${PWSH:-}"
[ -z "$PW" ] && command -v pwsh >/dev/null 2>&1 && PW=$(command -v pwsh)
[ -z "$PW" ] && [ -n "$PWSH_PATH_FILE" ] && [ -r "$PWSH_PATH_FILE" ] && PW=$(cat "$PWSH_PATH_FILE")
if [ -z "$PW" ] || [ ! -x "$PW" ]; then
  echo "  [NAO EXECUTADO] testes de comportamento: PowerShell 7 nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 HEIMDALL_TESTE=1
  T=$(mktemp -d)
  # sintaxe pelo analisador do PowerShell
  PS1_PATH="$PWD/$PS1" "$PW" -NoProfile -Command '$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($env:PS1_PATH,[ref]$null,[ref]$e); if($e.Count){$e|%{$_.Message};exit 1}' >/dev/null 2>&1 && pass "o PowerShell analisa o instalador sem erros" || fail "erro de sintaxe no instalador"

  fake() { # fake <pasta> <nome> <saida> [codigo]
    printf '#!/bin/sh\necho "%s"\nexit %s\n' "$3" "${4:-0}" > "$1/$2"; chmod +x "$1/$2"; }
  novo_bin() { B="$T/$1"; mkdir -p "$B"; printf '#!/bin/sh\necho "$@" >> "%s/winget-chamadas.txt"\nexit 0\n' "$T" > "$B/winget"; chmod +x "$B/winget"; }
  roda() { # roda <bin> <entrada> [args...]
    b="$1"; entrada="$2"; shift 2
    printf '%s' "$entrada" | PATH="$b" "$PW" -NoProfile -File "$PWD/$PS1" -SemPausa -SemTestes -SemClipboard "$@" > "$T/saida.txt" 2>&1
    return $?; }

  # A) tudo instalado
  novo_bin a; fake "$T/a" git "git version 2.50.0"; fake "$T/a" node "v22.22.0"; fake "$T/a" python "Python 3.12.1"; fake "$T/a" docker "Docker version 29"
  rm -f "$T/winget-chamadas.txt"; roda "$T/a" "" -SomenteMostrar; C=$?
  [ "$C" -eq 0 ] && pass "A) tudo instalado: termina sem pendencias" || fail "A) codigo $C"
  [ "$(grep -c '\[OK\]' "$T/saida.txt")" -ge 4 ] && pass "A) mostra os 4 itens como OK" || fail "A) nao mostrou os 4 OK"
  [ ! -f "$T/winget-chamadas.txt" ] && pass "A) nao chamou o winget" || fail "A) chamou o winget sem precisar"

  # B) nada instalado, so mostrar
  novo_bin b; rm -f "$T/winget-chamadas.txt"; roda "$T/b" "" -SomenteMostrar; C=$?
  [ "$C" -eq 1 ] && pass "B) nada instalado: termina com pendencias" || fail "B) codigo $C"
  [ "$(grep -c 'FALTA' "$T/saida.txt")" -ge 4 ] && pass "B) lista os 4 itens que faltam" || fail "B) lista incompleta"
  [ ! -f "$T/winget-chamadas.txt" ] && pass "B) somente mostrar NAO instala nada" || fail "B) instalou em modo somente mostrar"

  # C) nada instalado, dono responde N a tudo
  rm -f "$T/winget-chamadas.txt"; roda "$T/b" "N
N
N
N
"; C=$?
  [ ! -f "$T/winget-chamadas.txt" ] && pass "C) respondendo N, nada e instalado" || fail "C) instalou mesmo com N"

  # D) nada instalado, dono responde S a tudo (Sim): winget com os IDs documentados
  rm -f "$T/winget-chamadas.txt"; roda "$T/b" "" -Sim; C=$?
  for id in Git.Git OpenJS.NodeJS.LTS Python.Python.3.14; do grep -q "install --id $id" "$T/winget-chamadas.txt" 2>/dev/null && pass "D) instalou com o ID $id" || fail "D) faltou o ID $id"; done
  [ "$(wc -l < "$T/winget-chamadas.txt")" -eq 3 ] && pass "D) exatamente 3 chamadas ao winget (Docker usa o instalador oficial)" || fail "D) numero inesperado de chamadas ao winget"
  grep -q "teste) baixaria" "$T/saida.txt" && pass "D) Docker: so descreve o download no modo de teste" || fail "D) Docker nao tratado"

  # E) Node antigo (v20) conta como faltando
  novo_bin e; fake "$T/e" git "git version 2.50.0"; fake "$T/e" node "v20.11.0"; fake "$T/e" python "Python 3.12.1"; fake "$T/e" docker "Docker version 29"
  rm -f "$T/winget-chamadas.txt"; roda "$T/e" "" -SomenteMostrar; C=$?
  [ "$C" -eq 1 ] && grep -q "Node.js 22.18" "$T/saida.txt" && grep -q "FALTA.*Node" "$T/saida.txt" && pass "E) Node 20 e tratado como insuficiente" || fail "E) Node antigo passou"
  # F) Node 22.17 (um abaixo do minimo) falha; 22.18 passa
  fake "$T/e" node "v22.17.9"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 1 ] && pass "F) Node 22.17 insuficiente" || fail "F) 22.17 passou"
  fake "$T/e" node "v22.18.0"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 0 ] && pass "F) Node 22.18 suficiente" || fail "F) 22.18 falhou"
  fake "$T/e" node "v24.1.0"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 0 ] && pass "F) Node 24 suficiente" || fail "F) Node 24 falhou"
  # G) Python que nao e o 3 (ex.: loja do Windows) nao conta
  fake "$T/e" python "Python 2.7.18"; roda "$T/e" "" -SomenteMostrar; [ $? -eq 1 ] && pass "G) Python 2 nao conta" || fail "G) Python 2 passou"
  # H) Docker instalado mas parado: avisa e termina com pendencia
  fake "$T/e" python "Python 3.12.1"; fake "$T/e" docker "erro" 1; roda "$T/e" "" -SomenteMostrar; C=$?
  grep -q "NAO esta rodando" "$T/saida.txt" && pass "H) Docker parado e avisado" || fail "H) Docker parado nao avisado"
  rm -rf "$T"
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
