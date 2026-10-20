#!/usr/bin/env sh
# Testes do launcher (instalar/heimdall.ps1): so ASCII, sem comando perigoso, sintaxe, e comportamento com node e docker FALSOS no PATH
# (nada sobe de verdade). Uso: sh tests/instalar/check_launcher.sh  (REQUIRE_PWSH=1 exige o PowerShell 7)
cd "$(dirname "$0")/../.." || exit 2
PS1=instalar/heimdall.ps1
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

BAD=$(grep -nE '\$[A-Za-z_][A-Za-z0-9_]*:([^A-Za-z0-9_]|$)' "$PS1" | grep -vE '\$(env|script|global|local|private|using):')
[ -z "$BAD" ] && pass "nenhum \"\$nome:\" perigoso" || { fail "padrao \"\$nome:\" perigoso"; echo "$BAD" | cut -c1-120; }
grep -nP '[^\x00-\x7F]' "$PS1" >/dev/null && fail "caracteres fora de ASCII" || pass "so ASCII"
grep -qiE 'Invoke-Expression|\biex\b|Set-ExecutionPolicy|Add-MpPreference|-Verb RunAs|Invoke-WebRequest|Invoke-RestMethod|curl |wget ' "$PS1" && fail "o launcher usa comando perigoso ou de rede" || pass "sem iex, rede, politica de execucao nem administrador"
for s in apps/core/src/onboarding/iniciar.ts apps/listener/src/iniciar.ts apps/trabalhos/src/iniciar.ts apps/memoria/src/iniciar.ts apps/ponte/src/iniciar.ts apps/ponte/scripts/gerar-config.ts; do
  [ -f "$s" ] && grep -qF "$s" "$PS1" && pass "o launcher aponta para $s (existe)" || fail "launcher e arquivo nao batem: $s"
done
grep -q "Test-Path \$envCompose" "$PS1" && grep -q "nao vou mexer nele" "$PS1" && pass "nunca sobrescreve o .env existente do Compose" || fail "o launcher nao protege o .env existente"

PW="${PWSH:-}"
[ -z "$PW" ] && command -v pwsh >/dev/null 2>&1 && PW=$(command -v pwsh)
if [ -z "$PW" ] || [ ! -x "$PW" ]; then
  echo "  [NAO EXECUTADO] testes de comportamento: PowerShell 7 nao encontrado"; [ "${REQUIRE_PWSH:-0}" = 1 ] && FAIL=$((FAIL+1))
else
  export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
  PS1_PATH="$PWD/$PS1" "$PW" -NoProfile -Command '$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile($env:PS1_PATH,[ref]$null,[ref]$e); if($e.Count){$e|%{$_.Message};exit 1}' >/dev/null 2>&1 && pass "o PowerShell analisa o launcher sem erros" || fail "erro de sintaxe no launcher"

  T=$(mktemp -d)
  # Copia do projeto so com o que o launcher usa (nao mexe no .env nem em data/ do projeto de verdade).
  R="$T/proj"; mkdir -p "$R/instalar" "$R/infra/compose" "$R/data"
  cp "$PS1" "$R/instalar/heimdall.ps1"; : > "$R/infra/compose/docker-compose.yml"
  for p in apps/core/src/onboarding apps/listener/src apps/trabalhos/src apps/memoria/src apps/ponte/src apps/ponte/scripts; do mkdir -p "$R/$p"; done
  for p in listener trabalhos memoria ponte; do mkdir -p "$R/apps/$p/node_modules"; done
  B="$T/bin"; mkdir -p "$B"
  # vivo <pid>: existe e nao e zumbi (processo morto que o pai ainda nao recolheu conta como parado)
  vivo() { kill -0 "$1" 2>/dev/null && ! grep -q '^State:.*Z' "/proc/$1/status" 2>/dev/null; }
  # node falso: "--version" responde v22.22.0; a tela imprime o link; os demais ficam vivos por um tempo
  cat > "$B/node" <<'EOF'
#!/bin/sh
if [ "$1" = "--version" ]; then echo v22.22.0; exit 0; fi
case "$1" in
  *scripts/gerar-config.ts) echo "timezone: x"; exit 0;;
  *onboarding/iniciar.ts) echo "Se o navegador nao abrir sozinho, copie este endereco: http://127.0.0.1:8765/?codigo=teste123";;
esac
sleep 25
EOF
  printf '#!/bin/sh\necho "$@" >> "%s/docker-chamadas.txt"\nexit 0\n' "$T" > "$B/docker"; chmod +x "$B/node" "$B/docker"
  roda() { (cd "$R" && PATH="$B:$PATH" HEIMDALL_DATA="$R/data" "$PW" -NoProfile -File "$R/instalar/heimdall.ps1" -SemPausa "$@" > "$T/saida.txt" 2>&1); return $?; }

  # 1) somente mostrar: nada e criado nem iniciado
  roda -Acao iniciar -SomenteMostrar; C=$?
  [ "$C" -eq 0 ] && pass "somente mostrar termina bem" || fail "somente mostrar: codigo $C"
  [ ! -e "$R/infra/compose/.env" ] && [ ! -e "$R/data/processos.json" ] && [ ! -e "$T/docker-chamadas.txt" ] && pass "somente mostrar NAO cria .env, nao registra processo e nao chama o Docker" || fail "somente mostrar mexeu em algo"
  [ "$(grep -c 'PLANO.*node apps/' "$T/saida.txt")" -eq 5 ] && pass "o plano lista os 5 processos" || fail "o plano nao lista os 5 processos"

  # 2) iniciar de verdade (com falsos)
  roda -Acao iniciar; C=$?
  [ "$C" -eq 0 ] && pass "iniciar termina bem" || { fail "iniciar: codigo $C"; head -20 "$T/saida.txt"; }
  [ -s "$R/infra/compose/.env" ] && grep -q '^POSTGRES_PASSWORD=[0-9a-f]\{32\}$' "$R/infra/compose/.env" && grep -q '^API_SERVER_KEY=[0-9a-f]\{64\}$' "$R/infra/compose/.env" && grep -q '^HINDSIGHT_API_LLM_PROVIDER=none$' "$R/infra/compose/.env" && pass "criou o .env com senha e chave aleatorias e LLM = none" || fail ".env criado errado"
  grep -q 'compose --env-file .*\.env -f .*docker-compose.yml up -d' "$T/docker-chamadas.txt" && pass "chamou docker compose up -d com o .env e o arquivo do projeto" || fail "nao chamou docker compose up"
  N=$(grep -cE '"(tela|listener|executor|memoria|ponte)": *[0-9]{2,}' "$R/data/processos.json"); [ "$N" -eq 5 ] && pass "registrou 5 processos em data/processos.json" || fail "registro de processos: $N"
  grep -q 'http://127.0.0.1:8765/?codigo=teste123' "$T/saida.txt" && pass "mostra o link da tela (com o codigo de uso unico) lido do registro" || fail "nao mostrou o link da tela"
  PIDS=$(grep -oE ': *[0-9]{2,}' "$R/data/processos.json" | grep -oE '[0-9]+' | tr '\n' ' ')
  [ "$(echo $PIDS | wc -w)" -eq 5 ] || fail "nao achei os 5 pids no registro"
  ALL=1; for p in $PIDS; do vivo "$p" || ALL=0; done; [ "$ALL" -eq 1 ] && pass "os 5 processos estao vivos" || fail "algum processo nao esta vivo"
  ENV1=$(cat "$R/infra/compose/.env")

  # 3) iniciar de novo: nao duplica processo e nao mexe no .env
  roda -Acao iniciar; [ "$(grep -c 'ja esta rodando' "$T/saida.txt")" -eq 5 ] && pass "iniciar de novo nao duplica processos" || fail "duplicou processos"
  [ "$ENV1" = "$(cat "$R/infra/compose/.env")" ] && pass ".env existente nao foi alterado" || fail ".env foi sobrescrito"

  # 4) estado e parar
  roda -Acao estado -SemDocker; [ "$(grep -c 'rodando (pid' "$T/saida.txt")" -eq 5 ] && pass "estado mostra os 5 rodando" || fail "estado errado"
  roda -Acao parar; sleep 1
  ALL=1; for p in $PIDS; do vivo "$p" && ALL=0; done; [ "$ALL" -eq 1 ] && pass "parar encerrou os 5 processos" || fail "algum processo continuou vivo"
  ! grep -q 'stop' "$T/docker-chamadas.txt" && pass "parar sem -ComDocker nao derruba o Docker" || fail "parar derrubou o Docker sem pedir"
  roda -Acao parar -ComDocker; grep -q 'compose --env-file .*stop' "$T/docker-chamadas.txt" && pass "parar -ComDocker tambem para o Docker" || fail "-ComDocker nao parou o Docker"
  rm -f "$T/docker-chamadas.txt"

  # 5) node antigo: recusa iniciar
  printf '#!/bin/sh\nif [ "$1" = "--version" ]; then echo v20.11.0; exit 0; fi\nexit 0\n' > "$B/node"
  roda -Acao iniciar -SemDocker; C=$?
  [ "$C" -ne 0 ] && grep -q "Node.js 22.18" "$T/saida.txt" && pass "Node 20 e recusado com explicacao" || fail "Node antigo passou"
  # 6) config-hermes: gera, copia para o conteiner e reinicia
  printf '#!/bin/sh\nif [ "$1" = "--version" ]; then echo v22.22.0; exit 0; fi\necho "timezone: x"\n' > "$B/node"
  printf '#!/bin/sh\necho "$@" >> "%s/docker-chamadas.txt"\ncase "$*" in *"ps -aq hermes"*) echo cont123;; esac\nexit 0\n' "$T" > "$B/docker"; chmod +x "$B/docker"
  roda -Acao config-hermes; grep -q 'cp .*:/opt/data/config.yaml' "$T/docker-chamadas.txt" 2>/dev/null && grep -q 'restart hermes' "$T/docker-chamadas.txt" && pass "config-hermes copia o config para o volume e reinicia o Hermes" || { fail "config-hermes nao fez o fluxo"; head -5 "$T/saida.txt"; }
  for p in $PIDS; do kill "$p" 2>/dev/null; done
  rm -rf "$T"
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
