#!/usr/bin/env sh
# Higiene do repositorio: dados e segredos fora do git (AGENTS.md regra 2) e arquivos de instrucao protegidos.
# Uso: sh tests/repo/check_higiene.sh
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

# 1. Nenhum arquivo de dados, banco, login ou ambiente versionado
# .env.example e um modelo com valor de mentira (confirmado abaixo); qualquer outro .env e proibido
BAD=$(git ls-files | grep -v '^\.env\.example$' | grep -E '(^|/)data/|\.sqlite|\.db$|auth_info|(^|/)\.env($|\.)|preflight-(resultado|relatorio)' )
if [ -z "$BAD" ]; then pass "nenhum dado/segredo versionado"; else fail "arquivo proibido versionado"; echo "$BAD" | head -5; fi

# 2. .gitignore cobre os itens essenciais
for p in '.env' 'data/' '*.sqlite' '*.sqlite3' '*.sqlite-*' '*.db' 'auth_info*/'; do
  if grep -qxF "$p" .gitignore; then pass ".gitignore tem $p"; else fail ".gitignore sem $p"; fi
done

# 2b. Nenhum par de arquivos que so difere por maiusculas/minusculas (no Windows os dois viram UM arquivo e um sobrescreve o outro; LICOES.md, 2026-10-19)
DUP=$(git ls-files | awk '{ k = tolower($0); c[k]++; n[k] = n[k] " " $0 } END { for (k in c) if (c[k] > 1) print n[k] }')
if [ -z "$DUP" ]; then pass "nenhum nome de arquivo repetido so por maiuscula/minuscula"; else fail "nomes que colidem no Windows:$DUP"; fi

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
