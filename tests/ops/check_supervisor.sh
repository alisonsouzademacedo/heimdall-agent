#!/usr/bin/env sh
# Testes do supervisor Linux (scripts/heimdall.sh): leitura do arquivo e comportamento com node e docker FALSOS no PATH (nada sobe de verdade).
# Cobre: registro {pid, inicio} (licao de 2026-10-21: pid reaproveitado nao pode enganar nem ser morto), reinicio automatico com espera crescente,
# "somente mostrar" sem efeitos, link da tela so por pedido (o codigo de uso unico nao vai para a saida normal) e a unidade systemd (so escrita, nunca ativada).
# Uso: sh tests/ops/check_supervisor.sh
cd "$(dirname "$0")/../.." || exit 2
SC=scripts/heimdall.sh
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
vivo() { [ -r "/proc/$1/stat" ] || return 1; s=$(cat "/proc/$1/stat" 2>/dev/null) || return 1; r=${s##*) }; set -- $r; [ "$1" != "Z" ]; }

[ -s "$SC" ] && pass "existe $SC" || { fail "falta $SC"; echo "RESULTADO: $FAIL falha(s)"; exit 1; }
sh -n "$SC" 2>/dev/null && pass "sintaxe valida" || fail "sintaxe invalida"
grep -vE '^\s*#|^\s*info "' "$SC" | grep -qE '\bsudo\b|\bwget\b|\bcurl\b|rm +-rf|iptables|\bufw\b|nginx|pm2|fail2ban|apt(-get)? +install' && fail "o supervisor usa comando de sistema, de rede ou de apagar" || pass "sem sudo, rede, rm -rf, firewall, nginx nem pm2 (o servidor tem sites de clientes)"
for s in apps/core/src/onboarding/iniciar.ts apps/listener/src/iniciar.ts apps/trabalhos/src/iniciar.ts apps/memoria/src/iniciar.ts apps/ponte/src/iniciar.ts apps/ponte/scripts/gerar-config.ts; do
  [ -f "$s" ] && grep -qF "$s" "$SC" && pass "aponta para $s (existe)" || fail "supervisor e arquivo nao batem: $s"
done
grep -qE '/proc/\$\{?[a-z_]*\}?/stat|/proc/\$1/stat' "$SC" && pass "hora de inicio lida de /proc/<pid>/stat" || fail "nao le a hora de inicio do processo"

T=$(mktemp -d); trap 'for p in $(ls "$T"/pids 2>/dev/null); do kill "$p" 2>/dev/null; done; rm -rf "$T"' EXIT
R="$T/proj"; mkdir -p "$R/scripts" "$R/infra/compose" "$R/data" "$T/pids"
cp "$SC" "$R/scripts/heimdall.sh"; : > "$R/infra/compose/docker-compose.yml"; printf 'POSTGRES_PASSWORD=falsa\nAPI_SERVER_KEY=falsa\n' > "$R/infra/compose/.env"
for p in apps/core/src/onboarding apps/listener/src apps/trabalhos/src apps/memoria/src apps/ponte/src apps/ponte/scripts; do mkdir -p "$R/$p"; done
for p in core listener trabalhos memoria ponte; do mkdir -p "$R/apps/$p/node_modules"; done
B="$T/bin"; mkdir -p "$B"
cat > "$B/node" <<'FAKE'
#!/bin/sh
if [ "$1" = "--version" ]; then echo "${FAKE_NODE_VERSION:-v24.22.1}"; exit 0; fi
case "$1" in
  *scripts/gerar-config.ts) echo "timezone: x"; exit 0;;
  *onboarding/iniciar.ts) echo "Se o navegador nao abrir sozinho, copie este endereco: http://127.0.0.1:8765/?codigo=teste123";;
  *trabalhos/src/iniciar.ts) echo x >> "$FAKE_CONTADOR"; [ -n "$FAKE_EXECUTOR_MORRE" ] && exit 1;;
esac
trap 'exit 0' TERM
sleep 30 &
wait
FAKE
cat > "$B/docker" <<FAKE
#!/bin/sh
echo "\$@" >> "$T/docker-chamadas.txt"
case "\$*" in
  *"ps -aq hermes"*) [ -n "\$FAKE_SEM_HERMES" ] || echo cont123;;
  *"ps -q hindsight"*) echo hind123;;
  inspect*) echo "\${FAKE_SAUDE:-healthy}";;
esac
exit 0
FAKE
chmod +x "$B/node" "$B/docker"
export FAKE_CONTADOR="$T/contador.txt"
roda() { (cd "$R" && PATH="$B:$PATH" HEIMDALL_INTERVALO_S=1 sh "$R/scripts/heimdall.sh" "$@" > "$T/saida.txt" 2>&1); return $?; }
pids_do_registro() { grep -oE '"pid": *[0-9]+' "$R/data/processos.json" | grep -oE '[0-9]+' | tr '\n' ' '; }

# 1) somente mostrar: nada e iniciado, registrado, criado nem chamado
roda iniciar --somente-mostrar; C=$?
[ "$C" -eq 0 ] && pass "somente mostrar termina bem" || fail "somente mostrar: codigo $C"
[ ! -e "$R/data/processos.json" ] && [ ! -e "$T/docker-chamadas.txt" ] && [ ! -d "$R/data/logs" ] && pass "somente mostrar NAO registra processo, nao cria logs e nao chama o Docker" || fail "somente mostrar mexeu em algo"
[ "$(grep -c 'PLANO.*node apps/' "$T/saida.txt")" -eq 5 ] && pass "o plano lista os 5 processos" || fail "o plano nao lista os 5 processos"

# 2) sem o .env do Compose: recusa em vez de inventar segredos
mv "$R/infra/compose/.env" "$T/env.guardado"
roda iniciar; C=$?
[ "$C" -ne 0 ] && grep -q 'infra/compose/.env' "$T/saida.txt" && [ ! -e "$R/data/processos.json" ] && pass "sem infra/compose/.env recusa iniciar (nao inventa senha)" || fail "iniciou sem o .env"
mv "$T/env.guardado" "$R/infra/compose/.env"

# 3) node antigo: recusa
FAKE_NODE_VERSION=v20.11.0 roda iniciar; C=$?
[ "$C" -ne 0 ] && grep -q 'Node.js 22.18' "$T/saida.txt" && [ ! -e "$R/data/processos.json" ] && pass "Node 20 e recusado com explicacao" || fail "Node antigo passou"

# 4) iniciar de verdade (com falsos)
roda iniciar; C=$?
[ "$C" -eq 0 ] && pass "iniciar termina bem" || { fail "iniciar: codigo $C"; head -20 "$T/saida.txt"; }
grep -q 'compose --env-file .*\.env -f .*docker-compose.yml up -d' "$T/docker-chamadas.txt" && pass "chamou docker compose up -d com o .env e o arquivo do projeto" || fail "nao chamou docker compose up"
N=$(grep -cE '"(tela|listener|executor|memoria|ponte)": *\{' "$R/data/processos.json"); I=$(grep -cE '"inicio": *[0-9]+' "$R/data/processos.json")
[ "$N" -eq 5 ] && [ "$I" -eq 5 ] && pass "registrou 5 processos com pid e hora de inicio em data/processos.json" || fail "registro: $N processos, $I horas de inicio"
PIDS=$(pids_do_registro); ALL=1; for p in $PIDS; do vivo "$p" || ALL=0; done
[ "$(echo $PIDS | wc -w)" -eq 5 ] && [ "$ALL" -eq 1 ] && pass "os 5 processos estao vivos" || fail "algum processo nao esta vivo"
for p in $PIDS; do : > "$T/pids/$p"; done
OK=1; for p in $PIDS; do s=$(cat /proc/$p/stat); r=${s##*) }; set -- $r; ini=${20}; grep -qE "\"pid\": *$p, *\"inicio\": *$ini\b" "$R/data/processos.json" || OK=0; done
[ "$OK" -eq 1 ] && pass "a hora de inicio registrada e a do processo de verdade (/proc/<pid>/stat)" || fail "hora de inicio registrada nao confere com /proc"
[ -s "$R/data/logs/listener.log" ] || [ -e "$R/data/logs/listener.log" ] && [ -e "$R/data/logs/listener.erro.log" ] && pass "cada processo tem log e log de erro em data/logs" || fail "faltam os logs"
! grep -q 'codigo=' "$T/saida.txt" && pass "iniciar NAO imprime o link com o codigo de uso unico da tela (nao vaza para chat/log)" || fail "iniciar imprimiu o codigo da tela"
sleep 1
roda link; grep -q 'http://127.0.0.1:8765/?codigo=teste123' "$T/saida.txt" && pass "'link' mostra o endereco da tela lido do log (so quando o dono pede)" || fail "'link' nao mostrou o endereco da tela"

# 5) iniciar de novo: nao duplica
roda iniciar; [ "$(grep -c 'ja esta rodando' "$T/saida.txt")" -eq 5 ] && [ "$(pids_do_registro)" = "$PIDS" ] && pass "iniciar de novo nao duplica processos nem muda os pids" || fail "duplicou processos"

# 6) estado
roda estado; [ "$(grep -c 'rodando (pid' "$T/saida.txt")" -eq 5 ] && pass "estado mostra os 5 rodando com pid" || fail "estado errado"

# 7) parar
roda parar; sleep 1
ALL=1; for p in $PIDS; do vivo "$p" && ALL=0; done; [ "$ALL" -eq 1 ] && pass "parar encerrou os 5 processos" || fail "algum processo continuou vivo"
! grep -q ' stop' "$T/docker-chamadas.txt" && pass "parar sem --com-docker nao derruba o Docker" || fail "parar derrubou o Docker sem pedir"
roda estado; [ "$(grep -c 'parado' "$T/saida.txt")" -ge 5 ] && pass "estado depois de parar: 5 parados" || fail "estado nao mostra parado"
roda parar --com-docker; grep -q 'compose --env-file .*stop' "$T/docker-chamadas.txt" && pass "parar --com-docker tambem para o Docker" || fail "--com-docker nao parou o Docker"
: > "$T/docker-chamadas.txt"; rm -f "$T/pids/"*

# 8) pid reaproveitado por programa ALHEIO (defeito de 2026-10-21): nao vale como nosso e nunca e morto
sleep 60 >/dev/null 2>&1 & D=$!; : > "$T/pids/$D"
vivo "$D" && pass "processo alheio de teste subiu (pid $D)" || fail "nao subiu o processo alheio"
printf '{\n"executor": {"pid": %s, "inicio": 1}\n}\n' "$D" > "$R/data/processos.json"
roda iniciar; grep -q 'executor iniciado' "$T/saida.txt" && pass "pid reaproveitado nao engana: o executor sobe de novo" || { fail "o executor NAO subiu (pid alheio valeu como nosso)"; grep executor "$T/saida.txt" | head -3; }
E=$(sed -n '/"executor"/p' "$R/data/processos.json" | grep -oE '"pid": *[0-9]+' | grep -oE '[0-9]+' | head -1)
{ [ -n "$E" ] && [ "$E" != "$D" ]; } && pass "o registro do executor aponta para o processo novo ($E), nao para o alheio" || fail "registro do executor errado (E=$E D=$D)"
for p in $(pids_do_registro); do : > "$T/pids/$p"; done
roda parar; sleep 1
vivo "$D" && pass "parar NAO mata o processo alheio" || fail "parar matou o processo alheio"
{ [ -n "$E" ] && vivo "$E"; } && fail "o executor novo nao foi parado" || pass "parar encerrou o executor novo"
kill "$D" 2>/dev/null

# 8b) mesmo pid vivo e linha de comando certa, mas hora de inicio diferente: tambem nao e nosso
roda iniciar; PIDS2=$(pids_do_registro); for p in $PIDS2; do : > "$T/pids/$p"; done
EX=$(sed -n '/"executor"/p' "$R/data/processos.json" | grep -oE '"pid": *[0-9]+' | grep -oE '[0-9]+' | head -1)
sed -i "s/\"executor\": {\"pid\": $EX, \"inicio\": [0-9]*/\"executor\": {\"pid\": $EX, \"inicio\": 1/" "$R/data/processos.json"
roda estado; grep -qE "executor +parado" "$T/saida.txt" && pass "hora de inicio diferente = outro processo: estado diz parado" || { fail "hora de inicio divergente foi aceita"; grep executor "$T/saida.txt" | head -2; }
roda parar; kill "$EX" 2>/dev/null; sleep 1

# 8c) programa ALHEIO com a hora de inicio CERTA no registro: so a linha de comando o denuncia
sleep 60 >/dev/null 2>&1 & A=$!; : > "$T/pids/$A"
s=$(cat /proc/$A/stat); r=${s##*) }; set -- $r; AINI=${20}
printf '{\n"executor": {"pid": %s, "inicio": %s}\n}\n' "$A" "$AINI" > "$R/data/processos.json"
roda estado; grep -qE "executor +parado" "$T/saida.txt" && pass "processo alheio com a hora de inicio certa tambem nao vale como nosso (linha de comando)" || fail "processo alheio com hora de inicio certa foi aceito como nosso"
roda parar; vivo "$A" && pass "parar NAO mata o programa alheio (mesmo com a hora de inicio igual)" || fail "parar matou o programa alheio"
kill "$A" 2>/dev/null; rm -f "$R/data/processos.json"

# 9) supervisionar: reinicia quem morreu, com espera crescente (nao fica em laco apertado)
rm -f "$R/data/processos.json" "$FAKE_CONTADOR"
(cd "$R" && PATH="$B:$PATH" HEIMDALL_INTERVALO_S=1 HEIMDALL_BACKOFF_BASE_S=0 HEIMDALL_MAX_CICLOS=6 FAKE_EXECUTOR_MORRE=1 sh "$R/scripts/heimdall.sh" supervisionar > "$T/sup.txt" 2>&1)
INI=$(wc -l < "$FAKE_CONTADOR" 2>/dev/null || echo 0)
[ "$INI" -ge 3 ] && pass "supervisionar reiniciou o executor que morreu (subiu $INI vezes em 6 ciclos)" || { fail "o executor so subiu $INI vez(es)"; tail -5 "$T/sup.txt"; }
for p in $(pids_do_registro); do kill "$p" 2>/dev/null; done; sleep 1
rm -f "$R/data/processos.json" "$FAKE_CONTADOR"
(cd "$R" && PATH="$B:$PATH" HEIMDALL_INTERVALO_S=1 HEIMDALL_BACKOFF_BASE_S=1000 HEIMDALL_MAX_CICLOS=5 FAKE_EXECUTOR_MORRE=1 sh "$R/scripts/heimdall.sh" supervisionar > "$T/sup.txt" 2>&1)
INI=$(wc -l < "$FAKE_CONTADOR" 2>/dev/null || echo 0)
[ "$INI" -le 2 ] && [ "$INI" -ge 1 ] && pass "com espera crescente grande o executor nao volta em laco apertado (subiu $INI vez(es))" || fail "espera crescente nao segurou o laco ($INI subidas)"
for p in $(pids_do_registro); do kill "$p" 2>/dev/null; done; sleep 1

# 9b) a checagem periodica do Docker so SOBE o que esta parado: nunca recria conteiner porque alguem editou o docker-compose.yml (2026-10-22)
rm -f "$R/data/processos.json"; : > "$T/docker-chamadas.txt"
(cd "$R" && PATH="$B:$PATH" HEIMDALL_INTERVALO_S=1 HEIMDALL_CICLOS_DOCKER=1 HEIMDALL_MAX_CICLOS=2 sh "$R/scripts/heimdall.sh" supervisionar > "$T/sup.txt" 2>&1)
grep -q 'up -d --no-recreate' "$T/docker-chamadas.txt" && pass "checagem periodica usa 'up -d --no-recreate' (nao recria servico sozinho)" || { fail "checagem periodica pode recriar conteineres (falta --no-recreate)"; cat "$T/docker-chamadas.txt"; }
[ "$(grep -c 'up -d$' "$T/docker-chamadas.txt")" -le 1 ] && pass "so a subida inicial usa 'up -d' simples" || fail "'up -d' simples repetido nos ciclos"
for p in $(pids_do_registro); do kill "$p" 2>/dev/null; done; sleep 1

# 10) config-hermes
: > "$T/docker-chamadas.txt"
roda config-hermes; grep -q 'cp .*:/opt/data/config.yaml' "$T/docker-chamadas.txt" && grep -q 'restart hermes' "$T/docker-chamadas.txt" && pass "config-hermes copia o config para o volume e reinicia o Hermes" || { fail "config-hermes nao fez o combinado"; cat "$T/docker-chamadas.txt"; }
# Licao de 2026-10-22: "compose create hermes" RECRIOU o Postgres e o Hindsight sem inicia-los (a memoria ficou parada).
grep -qE 'compose .* (create|up) ' "$T/docker-chamadas.txt" && fail "config-hermes chamou create/up (pode recriar o Postgres e o Hindsight)" || pass "config-hermes nao chama create nem up (nao recria os outros servicos)"
# O Hermes so liga o MCP da memoria na partida: so reinicia depois de o Hindsight estar saudavel.
LI=$(grep -n '^inspect' "$T/docker-chamadas.txt" | head -1 | cut -d: -f1); LR=$(grep -n 'restart hermes' "$T/docker-chamadas.txt" | head -1 | cut -d: -f1)
{ [ -n "$LI" ] && [ -n "$LR" ] && [ "$LI" -lt "$LR" ]; } && pass "config-hermes confere a saude do Hindsight ANTES de reiniciar o Hermes" || fail "config-hermes reiniciou o Hermes sem conferir a saude do Hindsight"
: > "$T/docker-chamadas.txt"
FAKE_SAUDE=starting HEIMDALL_ESPERA_HINDSIGHT_S=2 roda config-hermes; C=$?
{ [ "$C" -ne 0 ] && ! grep -q 'restart hermes' "$T/docker-chamadas.txt"; } && pass "Hindsight que nao fica saudavel: NAO reinicia o Hermes (o MCP ficaria estacionado) e avisa" || fail "reiniciou o Hermes com o Hindsight doente (codigo $C)"
: > "$T/docker-chamadas.txt"
FAKE_SEM_HERMES=1 roda config-hermes; C=$?
{ [ "$C" -ne 0 ] && grep -q 'iniciar' "$T/saida.txt" && ! grep -qE 'compose .* (create|up) ' "$T/docker-chamadas.txt"; } && pass "sem conteiner do Hermes: recusa e manda rodar 'iniciar' (nao cria nada sozinho)" || fail "sem conteiner do Hermes nao recusou direito"

# 11) unidade systemd: so escreve o arquivo, nunca ativa nada
mkdir -p "$T/unit"
HEIMDALL_UNIT_DIR="$T/unit" roda instalar-servico; C=$?
U="$T/unit/heimdall.service"
[ "$C" -eq 0 ] && [ -s "$U" ] && pass "instalar-servico escreve a unidade em HEIMDALL_UNIT_DIR" || fail "unidade nao escrita (codigo $C)"
grep -q '^Restart=always' "$U" && grep -qE "^ExecStart=.*scripts/heimdall.sh supervisionar" "$U" && grep -q '^WantedBy=default.target' "$U" && pass "unidade: Restart=always, supervisionar e default.target (systemd de usuario)" || fail "unidade sem Restart/ExecStart/WantedBy"
grep -qE '^(User|Group)=|^\[Install\][^$]*multi-user' "$U" && fail "a unidade e de sistema (User=/multi-user)" || pass "a unidade e de usuario (sem User=, sem multi-user)"
grep -q 'systemctl --user' "$T/saida.txt" && grep -q 'enable-linger' "$T/saida.txt" && pass "mostra ao dono os comandos de ativar (systemctl --user ... e enable-linger) em vez de executar" || fail "nao mostrou os comandos de ativacao"
[ ! -e "$T/systemctl-chamadas.txt" ] && pass "nada foi ativado sozinho (decisao e do dono: regra 4)" || fail "ativou algo sozinho"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
