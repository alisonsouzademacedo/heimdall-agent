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

# Superpowers (obra, MIT): biblioteca de "skills" para agentes. Copia da documentacao em docs/superpowers (versao fixada pelo commit na origem de cada pagina)
# e UM SUBCONJUNTO revisado instalado em .claude/skills. Regras: o instalado e identico ao original; nada de hook; o que gasta muito ou publica nao entra.
[ -s docs/superpowers/INDEX.md ] && pass "INDEX.md do Superpowers existe" || fail "falta docs/superpowers/INDEX.md"
[ -s docs/superpowers/LICENSE ] && grep -q 'MIT License' docs/superpowers/LICENSE && pass "licenca MIT do Superpowers guardada" || fail "falta a licenca do Superpowers"
SEM_ORIGEM_SP=$(for f in $(find docs/superpowers -name '*.md' ! -name INDEX.md 2>/dev/null); do head -1 "$f" | grep -q '^<!-- source: https://github.com/obra/superpowers/blob/[0-9a-f]\{40\}/' || echo "$f"; done)
[ -z "$SEM_ORIGEM_SP" ] && [ -n "$(find docs/superpowers -name '*.md' ! -name INDEX.md 2>/dev/null)" ] && pass "toda pagina do Superpowers indica a origem com o commit fixado" || { fail "paginas do Superpowers ausentes ou sem origem"; echo "$SEM_ORIGEM_SP" | head -3; }
INSTALADAS="test-driven-development systematic-debugging verification-before-completion requesting-code-review receiving-code-review"
for sk in $INSTALADAS; do
  DIF=$(for f in $(find ".claude/skills/$sk" -name '*.md'); do rel=${f#.claude/skills/}; tail -n +2 "docs/superpowers/skills/$rel" | cmp -s - "$f" || echo "$f"; done)
  [ -d ".claude/skills/$sk" ] && [ -z "$DIF" ] && pass "skill instalada identica a documentacao: $sk" || { fail "skill ausente ou alterada: $sk"; echo "$DIF" | head -2; }
done
EXTRAS=$(ls .claude/skills 2>/dev/null | grep -vE '^(test-driven-development|systematic-debugging|verification-before-completion|requesting-code-review|receiving-code-review|ORIGEM.md)$')
[ -z "$EXTRAS" ] && pass "so as 5 skills revisadas estao instaladas (nada alem da lista)" || { fail "skill instalada fora da lista revisada:"; echo "$EXTRAS"; }
for sk in using-superpowers brainstorming writing-plans executing-plans subagent-driven-development dispatching-parallel-agents using-git-worktrees finishing-a-development-branch writing-skills diagnosing-superpowers; do
  [ ! -e ".claude/skills/$sk" ] && pass "nao instalada (decisao registrada no INDEX): $sk" || fail "skill proibida instalada: $sk"
done
! grep -rqE 'SessionStart|session-start|hooks' .claude --include=*.json 2>/dev/null && [ ! -e .claude/hooks ] && pass "nenhum hook do Superpowers instalado" || fail "ha hook em .claude (o Superpowers nao instala hook neste projeto)"
! grep -rlE 'curl |wget |git push|rm -rf|sudo ' .claude/skills 2>/dev/null | grep -q . && pass "as skills instaladas nao pedem rede, push, rm -rf nem sudo" || fail "skill instalada com comando de rede/publicacao/apagar"
grep -qF 'docs/superpowers' AGENTS.md && pass "AGENTS.md lista a pasta docs/superpowers na tabela" || fail "AGENTS.md nao lista docs/superpowers"
grep -qiE 'AGENTS.md prevalece|prevalece sobre' AGENTS.md && pass "AGENTS.md diz que ele prevalece sobre as skills" || fail "AGENTS.md nao diz que prevalece sobre as skills"

# Auditoria 2026-10-20: a raspagem do Hindsight trouxe 16 paginas "Page Not Found" e o INDEX mandava ler uma pagina que nao existe (sdks/mcp).
for d in hindsight hermes-agent baileys whisper faster-whisper markitdown krayin openai-codex; do
  NF=$(grep -rlE '^# Page Not Found|^Page Not Found' "docs/$d" --include='*.md' 2>/dev/null | grep -v INDEX.md | head -3)
  [ -z "$NF" ] && pass "docs/$d sem paginas 'Page Not Found'" || { fail "paginas 404 em docs/$d:"; echo "$NF"; }
done
# Toda pagina "Leia primeiro" da tabela do AGENTS.md precisa existir (com .md ou .py ou como pasta).
existe() { [ -e "docs/$1" ] || [ -e "docs/$1.md" ] || [ -e "docs/$1.py" ] || [ -d "docs/$1" ]; }
for p in hermes-agent/getting-started/installation hermes-agent/user-guide/configuration hermes-agent/user-guide/features/cron hermes-agent/user-guide/features/mcp \
  hermes-agent/user-guide/features/memory hermes-agent/user-guide/features/hooks hermes-agent/user-guide/features/api-server hermes-agent/user-guide/messaging/whatsapp \
  hermes-agent/integrations/providers baileys/introduction baileys/quickstart baileys/faq baileys/concepts baileys/authentication baileys/messaging baileys/advanced baileys/migration \
  hindsight/developer/installation hindsight/developer/configuration hindsight/developer/models hindsight/developer/retain hindsight/developer/retrieval hindsight/developer/mcp-server hindsight/developer/api \
  openai-codex/docs/auth openai-codex/docs/sign-in-with-chatgpt openai-codex/docs/pricing openai-codex/docs/agent-configuration/agents-md \
  whisper/repo/README faster-whisper/repo/README faster-whisper/source/transcribe faster-whisper/source/vad markitdown/repo/README markitdown/source/_pdf_converter krayin/INDEX \
  docker/desktop/setup docker/engine/install docker/compose docker/desktop/troubleshoot-and-support claude-code/memory claude-code/best-practices claude-code/permissions \
  claude-code/hooks-guide claude-code/settings claude-code/security antigravity/rules antigravity/getting-started antigravity/permissions antigravity/sandbox antigravity/mcp \
  antigravity/cli/best-practices wsl/INDEX wsl/install-manual wsl/wsl-config; do
  existe "$p" && pass "Leia primeiro existe: $p" || fail "Leia primeiro FALTA: docs/$p"
done

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
