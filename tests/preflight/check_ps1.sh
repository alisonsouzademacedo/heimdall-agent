#!/usr/bin/env sh
# Testes de regressão do verificador de ambiente para Windows (spike/preflight/preflight.ps1).
# Uso: sh tests/preflight/check_ps1.sh      (REQUIRE_PWSH=1 faz a falta do PowerShell 7 contar como falha)
# Procura o PowerShell 7 em: variável PWSH, PATH, ou no arquivo apontado por PWSH_PATH_FILE.
cd "$(dirname "$0")/../.." || exit 2
PS1=spike/preflight/preflight.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# Teste 1 (estático, sem PowerShell): "$nome:" seguido de qualquer coisa que não seja nome de variável faz o
# PowerShell tratar "$nome:" como unidade (como $env:) e recusar o script inteiro. Usar "${nome}:".
BAD=$(grep -nE '\$[A-Za-z_][A-Za-z0-9_]*:([^A-Za-z0-9_]|$)' "$PS1" | grep -vE '\$(env|script|global|local|private|using):')
if [ -z "$BAD" ]; then pass "nenhum \"\$nome:\" perigoso no .ps1"; else fail "padrão \"\$nome:\" perigoso (use \${nome}:)"; echo "$BAD" | cut -c1-140; fi

# Teste 1b: o Windows PowerShell 5.1 (o azul, que vem no Windows) lê arquivo sem marca de codificação como ANSI;
# qualquer caractere fora de ASCII (acento, travessão) pode quebrar textos. O .ps1 deve ser só ASCII.
NONASCII=$(grep -nP '[^\x00-\x7F]' "$PS1" | head -3)
if [ -z "$NONASCII" ]; then pass ".ps1 contém só caracteres ASCII"; else fail ".ps1 tem caracteres fora de ASCII"; echo "$NONASCII" | cut -c1-120; fi

# Localiza o PowerShell 7
PW="${PWSH:-}"
[ -z "$PW" ] && command -v pwsh >/dev/null 2>&1 && PW=$(command -v pwsh)
[ -z "$PW" ] && [ -n "$PWSH_PATH_FILE" ] && [ -r "$PWSH_PATH_FILE" ] && PW=$(cat "$PWSH_PATH_FILE")
if [ -z "$PW" ] || [ ! -x "$PW" ]; then
  echo "  [NAO EXECUTADO] testes 2 e 3: PowerShell 7 (pwsh) não encontrado"
  [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 PREFLIGHT_NOPAUSE=1
  # Teste 2: análise de sintaxe pelo próprio PowerShell
  ERR=$(PS1_PATH="$PS1" "$PW" -NoProfile -Command '$t=$null;$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($env:PS1_PATH,[ref]$t,[ref]$e);$e|ForEach-Object{"linha $($_.Extent.StartLineNumber): $($_.ErrorId)"}' 2>&1)
  if [ -z "$ERR" ]; then pass "o PowerShell analisa o .ps1 sem erros de sintaxe"; else fail "erros de sintaxe no .ps1"; echo "$ERR"; fi
  # Teste 3: executa o script inteiro com um Windows simulado e confere o resultado
  TMP=$(mktemp -d); OUT="$TMP/resultado.json"
  ( cd "$TMP" && PREFLIGHT_OUT="$OUT" "$PW" -NoProfile -Command ". '$OLDPWD/tests/preflight/mocks.ps1'; & '$OLDPWD/$PS1' *> '$TMP/saida.txt'; exit \$LASTEXITCODE" ) >/dev/null 2>&1
  CODE=$?
  if [ -s "$OUT" ] && grep -q '"resultado"' "$OUT" && grep -q '"whisper_sugerido"' "$OUT"; then pass "execução completa com Windows simulado (saída $CODE)"; else fail "o script não terminou ou não gravou o JSON"; tail -5 "$TMP/saida.txt" 2>/dev/null; fi
  grep -q 'Windows 11 Pro' "$TMP/saida.txt" 2>/dev/null && grep -q 'suportado' "$TMP/saida.txt" && pass "reconhece Windows 11 como suportado" || fail "não reconheceu o Windows simulado como suportado"
  rm -rf "$TMP"
fi
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
exit "$FAIL"
