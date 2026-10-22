#!/usr/bin/env sh
# Higiene do repositorio: dados e segredos fora do git (AGENTS.md regra 2) e arquivos de instrucao protegidos.
# Uso: sh tests/repo/check_higiene.sh
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# 1. Nenhum arquivo de dados, banco, login ou ambiente versionado
# .env.example e um modelo com valor de mentira (confirmado abaixo); qualquer outro .env e proibido
# A pasta data/ da skill de design e um catalogo estatico (CSV), nao dado de cliente: exceto ela, data/ segue proibida.
BAD=$(git ls-files | grep -v '^\.env\.example$' | grep -v '^\.claude/skills/ui-ux-pro-max/data/' | grep -E '(^|/)data/|\.sqlite|\.db$|auth_info|(^|/)\.env($|\.)|preflight-(resultado|relatorio)' )
if [ -z "$BAD" ]; then pass "nenhum dado/segredo versionado"; else fail "arquivo proibido versionado"; echo "$BAD" | head -5; fi

# 2. .gitignore cobre os itens essenciais
for p in '.env' 'data/' '*.sqlite' '*.sqlite3' '*.sqlite-*' '*.db' 'auth_info*/'; do
  if grep -qxF "$p" .gitignore; then pass ".gitignore tem $p"; else fail ".gitignore sem $p"; fi
done

# 2b. Nenhum par de arquivos que so difere por maiusculas/minusculas (em sistema de arquivos insensivel a caixa os dois viram UM arquivo e um sobrescreve o outro; LICOES.md, 2026-10-19)
DUP=$(git ls-files | awk '{ k = tolower($0); c[k]++; n[k] = n[k] " " $0 } END { for (k in c) if (c[k] > 1) print n[k] }')
if [ -z "$DUP" ]; then pass "nenhum nome de arquivo repetido so por maiuscula/minuscula"; else fail "nomes que colidem sem diferenca de maiusculas:$DUP"; fi

# 2c. Fim de linha fixado (.gitattributes): .sh sempre LF (CRLF quebra o shell em qualquer sistema; LICOES.md, 2026-10-19).
# git check-attr le o .gitattributes de verdade.
for par in 'tests/run-all.sh:lf'; do
  arq="${par%%:*}"; esperado="${par##*:}"
  atual=$(git check-attr eol -- "$arq" | sed 's/.*: //')
  if [ "$atual" = "$esperado" ]; then pass ".gitattributes fixa eol=$esperado em $arq"; else fail ".gitattributes nao fixa eol=$esperado em $arq (esta: $atual)"; fi
done

# 2d. Texto do projeto sem caracteres de controle nem UTF-8 invalido. Caso real (2026-10-20): o PowerShell comeu "`v" e "`0" dentro de aspas
# duplas ao gravar docs/plano/runbooks/08-testes-de-fumaca.md ("vmmemWSL" virou "<VT>mmemWSL"; "runbooks/0" virou <NUL>) e o Git passou a tratar o arquivo como binario.
# Vale para o que e nosso (nao para docs/<ferramenta>/, que sao copias de terceiros).
# Python que RODA de verdade (no Windows "python3" e o atalho falso da Loja e a checagem passaria vazia; LICOES.md, 2026-10-20).
PY=""; for c in python3 python py; do if "$c" -c "import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)" >/dev/null 2>&1; then PY="$c"; break; fi; done
[ -n "$PY" ] || { fail "Python 3 nao encontrado (a checagem de caracteres de controle precisa dele)"; PY=false; }
CTRL=$(git ls-files -- . ':!docs/antigravity' ':!docs/baileys' ':!docs/claude-code' ':!docs/docker' ':!docs/faster-whisper' ':!docs/hermes-agent' ':!docs/hindsight' ':!docs/krayin' ':!docs/markitdown' ':!docs/openai-codex' ':!docs/strix' ':!docs/whisper' ':!docs/wsl' | "$PY" -I -c "
import sys,re
bad=[]
for p in sys.stdin.read().split('\n'):
    if not p or p.endswith(('.png','.jpg','.ico','.gif','.lock')): continue
    try: b=open(p,'rb').read()
    except OSError: continue
    try: t=b.decode('utf-8')
    except UnicodeDecodeError: bad.append(p+' (UTF-8 invalido)'); continue
    for n,l in enumerate(t.split('\n'),1):
        if re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f]',l): bad.append('%s:%d'%(p,n))
print('\n'.join(bad[:10]))
")
if [ -z "$CTRL" ]; then pass "nenhum caractere de controle nem UTF-8 invalido nos arquivos do projeto"; else fail "caractere de controle ou UTF-8 invalido:"; echo "$CTRL"; fi

# 3. Padroes de chave nos arquivos versionados (fora de docs/, que sao copias de terceiros)
PAT='sk-[A-Za-z0-9_-]{20,}|fc-[a-f0-9]{24,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(API_KEY|TOKEN|SECRET)=[A-Za-z0-9]{20,}'
HITS=$(git ls-files | grep -v '^docs/' | grep -v '^tests/repo/' | xargs grep -lE "$PAT" 2>/dev/null)
if [ -z "$HITS" ]; then pass "nenhum padrao de chave nos arquivos versionados (fora de docs/)"; else fail "possivel segredo em: $HITS"; fi

# 3b. O modelo .env.example so pode ter valores de mentira (x repetido)
REAL=$(grep -E '^[A-Z_]+=' .env.example | grep -vE '=([a-z]{0,3}-?)?[xX]{6,}$')
if [ -z "$REAL" ]; then pass ".env.example so tem valores de mentira"; else fail ".env.example com valor que parece real"; fi

# 4. Arquivos de instrucao: tamanho e regras inegociaveis presentes
LINES=$(wc -l < AGENTS.md); BYTES=$(wc -c < AGENTS.md)
if [ "$LINES" -le 200 ] && [ "$BYTES" -le 32768 ]; then pass "AGENTS.md dentro do limite ($LINES linhas, $BYTES bytes)"; else fail "AGENTS.md grande demais ($LINES linhas, $BYTES bytes)"; fi
grep -qF '@AGENTS.md' CLAUDE.md && pass "CLAUDE.md importa AGENTS.md" || fail "CLAUDE.md nao importa AGENTS.md"
for frase in 'nunca envia mensagem a ninguém além do self-chat' 'Dados de clientes e segredos nunca vão para o git' 'Não invente' 'Peça confirmação' 'Nunca enfraqueça os testes' 'Mudanças pequenas e focadas'; do
  if grep -qF "$frase" AGENTS.md; then pass "regra presente: $frase"; else fail "regra removida ou alterada: $frase"; fi
done

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
