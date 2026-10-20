#!/usr/bin/env sh
# Qualidade da biblioteca de documentacao (docs/): toda pagina tem origem e nao veio corrompida da raspagem.
# Licao registrada em docs/plano/LICOES.md: a raspagem "so conteudo principal" do Firecrawl perdeu os nomes das opcoes do Strix.
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

SEM_ORIGEM=$(for f in $(find docs/strix -name '*.md' ! -name INDEX.md); do head -1 "$f" | grep -q '^<!-- source: https://' || echo "$f"; done)
[ -z "$SEM_ORIGEM" ] && pass "toda pagina do Strix indica a origem" || { fail "paginas sem origem"; echo "$SEM_ORIGEM" | head -3; }

ESCAPADO=$(grep -rlE '^\\\\?[#>]' docs/strix --include=*.md | head -3)
[ -z "$ESCAPADO" ] && pass "nenhuma pagina com markdown 'escapado' (raspagem corrompida)" || { fail "markdown escapado em:"; echo "$ESCAPADO"; }

VAZIAS=$(find docs/strix -name '*.md' -size -200c | head -3)
[ -z "$VAZIAS" ] && pass "nenhuma pagina quase vazia" || { fail "paginas quase vazias:"; echo "$VAZIAS"; }

# A pagina de referencia da linha de comando precisa ter os nomes das opcoes (a raspagem ruim os perdia)
for opcao in '--target' '--scan-mode' '--max-budget' '--fail-on' '--instruction-file'; do
  grep -q -- "$opcao" docs/strix/usage/cli.md && pass "cli.md traz a opcao $opcao" || fail "cli.md perdeu a opcao $opcao"
done
[ -s docs/strix/INDEX.md ] && pass "INDEX.md do Strix existe" || fail "falta docs/strix/INDEX.md"

# WSL (Microsoft): o caminho manual com dism foi o que funcionou na maquina do dono (LICOES.md, 2026-10-19); a pagina precisa estar no repositorio, inteira.
[ -s docs/wsl/INDEX.md ] && pass "INDEX.md do WSL existe" || fail "falta docs/wsl/INDEX.md"
SEM_ORIGEM_WSL=$(for f in $(find docs/wsl -name '*.md' ! -name INDEX.md 2>/dev/null); do head -1 "$f" | grep -q '^<!-- source: https://' || echo "$f"; done)
[ -z "$SEM_ORIGEM_WSL" ] && [ -n "$(find docs/wsl -name '*.md' ! -name INDEX.md 2>/dev/null)" ] && pass "toda pagina do WSL indica a origem" || fail "paginas do WSL ausentes ou sem origem"
for termo in 'dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux' 'VirtualMachinePlatform' 'wsl --set-default-version 2'; do
  grep -qF -- "$termo" docs/wsl/install-manual.md 2>/dev/null && pass "install-manual.md traz: $termo" || fail "install-manual.md sem: $termo"
done
for termo in 'autoMemoryReclaim' 'vmIdleTimeout' 'memory=' 'processors='; do
  grep -qF -- "$termo" docs/wsl/wsl-config.md 2>/dev/null && pass "wsl-config.md traz: $termo" || fail "wsl-config.md sem: $termo"
done
grep -qF 'docs/wsl' AGENTS.md && pass "AGENTS.md lista a pasta docs/wsl na tabela" || fail "AGENTS.md nao lista docs/wsl"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
