#!/usr/bin/env sh
# Testes do listener (apps/listener): ligacao Baileys -> acervo, supervisor, transporte (so o self-chat), arquitetura e a conferencia do jid.ts
# com o Baileys REAL instalado. Nao abre conexao nenhuma com o WhatsApp. Uso: sh tests/listener/check_listener.sh  (REQUIRE_NODE=1 exige o Node)
cd "$(dirname "$0")/../.." || exit 2
# Saidas dos testes numa pasta temporaria PROPRIA, apagada ao sair (antes ficavam arquivos fixos em /tmp para sempre; LICOES.md, 2026-10-23).
SAIDAS=$(mktemp -d "${TMPDIR:-/tmp}/heimdall-saidas.XXXXXX"); trap 'rm -rf "$SAIDAS"' EXIT
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; [ "${REQUIRE_NODE:-0}" = 1 ] && exit 1; exit 0; }
cd apps/listener || exit 2
[ -d node_modules ] || npm ci --no-audit --no-fund >$SAIDAS/listener-npm.txt 2>&1 || { fail "npm ci falhou"; tail -5 $SAIDAS/listener-npm.txt; echo "RESULTADO: $FAIL falha(s)"; exit 1; }
if node --test "src/**/*.test.ts" >$SAIDAS/listener-test.txt 2>&1; then pass "testes do listener ($(grep -E '^(# |ℹ )pass ' $SAIDAS/listener-test.txt | awk '{print $NF}') passaram)"; else fail "testes do listener"; grep -E "^not ok" $SAIDAS/listener-test.txt | head; fi
if npx tsc --noEmit >$SAIDAS/listener-tsc.txt 2>&1; then pass "tipos do listener (tsc sem erros)"; else fail "tipos do listener"; head -10 $SAIDAS/listener-tsc.txt; fi
# versoes exatas (AGENTS.md): nada de ^ ou ~ nas dependencias do listener
if grep -E '"(\^|~|>=|\*|latest)' package.json | grep -v '"node"'; then fail "dependencia do listener sem versao exata"; else pass "dependencias do listener com versao exata"; fi
# origem do pacote: tudo do registro oficial do npm (nada de git+ ou arquivo local)
if grep '"resolved"' package-lock.json | grep -v 'registry.npmjs.org'; then fail "pacote fora do registro oficial do npm"; else pass "todos os pacotes vem do registro oficial do npm"; fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
