#!/usr/bin/env sh
# Garante que a varredura do Strix esta montada com as travas certas (nao roda o Strix de verdade: usa um falso).
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
S=tests/seguranca/strix/rodar-strix.sh

sh -n "$S" && pass "script com sintaxe valida" || fail "script com sintaxe invalida"
[ -s tests/seguranca/strix/instrucoes.md ] && pass "instrucoes do teste existem" || fail "faltam instrucoes"
grep -q "Não edite nenhum arquivo" tests/seguranca/strix/instrucoes.md && pass "instrucoes proibem editar o alvo" || fail "instrucoes sem a regra de nao editar"
grep -q "nenhum código pode criar outro caminho de envio" tests/seguranca/strix/instrucoes.md && pass "instrucoes citam a regra 1 (envio so ao self-chat)" || fail "instrucoes sem a regra 1"
grep -qx 'strix_runs/' .gitignore && pass ".gitignore cobre strix_runs/" || fail ".gitignore sem strix_runs/"
if grep -rqi "strix" .github/workflows 2>/dev/null; then fail "workflow do GitHub chama o Strix (gasta dinheiro sem o dono aprovar)"; else pass "nenhum workflow chama o Strix sem aprovacao do dono"; fi

T=$(mktemp -d); BIN="$T/bin"; mkdir -p "$BIN"
printf '#!/bin/sh\nexit 0\n' > "$BIN/docker"
cat > "$BIN/strix" <<FALSO
#!/bin/sh
printf "%s\\n" "\$*" > "$T/args.txt"
echo "STRIX_TELEMETRY=\$STRIX_TELEMETRY" > "$T/env.txt"
pwd > "$T/cwd.txt"
for ultimo; do :; done
# o Strix real pode gravar no alvo: simulamos isso e conferimos que o original nao muda
alvo=""; prev=""; for a in "\$@"; do [ "\$prev" = "--target" ] && alvo="\$a"; prev="\$a"; done
echo "$T/alvo-alterado" > "\$alvo/ARQUIVO_NOVO.txt"
mkdir -p strix_runs/run1 && echo ok > strix_runs/run1/findings.sarif
exit 0
FALSO
chmod +x "$BIN/docker" "$BIN/strix"

# 1) sem confirmar o custo: nao pode chamar o Strix
PATH="$BIN:$PATH" STRIX_LLM=x LLM_API_KEY=y sh "$S" >/dev/null 2>&1; CODIGO=$?
[ "$CODIGO" -eq 3 ] && [ ! -f "$T/args.txt" ] && pass "sem CONFIRMO_CUSTO=sim nao roda" || fail "rodou sem confirmar o custo (codigo $CODIGO)"
# 2) sem chave
PATH="$BIN:$PATH" CONFIRMO_CUSTO=sim STRIX_LLM=x sh "$S" >/dev/null 2>&1; CODIGO=$?
[ "$CODIGO" -eq 3 ] && [ ! -f "$T/args.txt" ] && pass "sem LLM_API_KEY nao roda" || fail "rodou sem chave (codigo $CODIGO)"
# 3) modo invalido
PATH="$BIN:$PATH" CONFIRMO_CUSTO=sim STRIX_LLM=x LLM_API_KEY=y sh "$S" ultra >/dev/null 2>&1; CODIGO=$?
[ "$CODIGO" -eq 3 ] && [ ! -f "$T/args.txt" ] && pass "modo invalido nao roda" || fail "aceitou modo invalido"
# 4) execucao completa com o Strix falso
ANTES=$(git status --porcelain | wc -l)
PATH="$BIN:$PATH" CONFIRMO_CUSTO=sim STRIX_LLM=x LLM_API_KEY=y STRIX_ORCAMENTO_USD=3 sh "$S" quick >/dev/null 2>&1; CODIGO=$?
[ "$CODIGO" -eq 0 ] && [ -f "$T/args.txt" ] && pass "com tudo definido, chama o Strix uma vez" || fail "nao chamou o Strix (codigo $CODIGO)"
ARGS=$(cat "$T/args.txt" 2>/dev/null)
for trecho in "-n --target" "--scan-mode quick" "--max-budget 3" "--fail-on high" "--instruction-file"; do
  case "$ARGS" in *"$trecho"*) pass "argumento presente: $trecho";; *) fail "argumento ausente: $trecho";; esac
done
grep -qx "STRIX_TELEMETRY=0" "$T/env.txt" 2>/dev/null && pass "telemetria do Strix desligada" || fail "telemetria ligada"
ALVO=$(echo "$ARGS" | sed -n 's/.*--target \([^ ]*\).*/\1/p')
case "$ALVO" in "$PWD"|"$PWD"/*) fail "alvo e a pasta real do projeto";; /*) pass "alvo e uma copia fora do projeto";; *) fail "alvo estranho: $ALVO";; esac
[ ! -e ARQUIVO_NOVO.txt ] && [ "$(git status --porcelain | wc -l)" -eq "$ANTES" ] && pass "o projeto real nao foi alterado pela varredura" || fail "a varredura alterou o projeto real"
if git ls-files | grep -q "^data/"; then fail "data/ versionado"; else pass "resultados ficam em data/ (fora do git)"; fi
rm -rf "$T" data/seguranca ARQUIVO_NOVO.txt 2>/dev/null  # limpeza (o ARQUIVO_NOVO so existiria se a trava falhasse)

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
