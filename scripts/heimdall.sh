#!/usr/bin/env sh
# Supervisor do Heimdall no Linux: sobe, para e mostra o estado dos 5 processos do Node (tela, listener, executor, memoria, ponte)
# e dos servicos do Docker Compose. Testado por tests/ops/check_supervisor.sh (com node e docker falsos).
#   sh scripts/heimdall.sh iniciar           sobe o Compose e os processos que nao estiverem rodando
#   sh scripts/heimdall.sh parar             para os processos (o Docker continua; --com-docker para tambem)
#   sh scripts/heimdall.sh estado            mostra o que esta rodando
#   sh scripts/heimdall.sh link              mostra o endereco da tela (com o codigo de uso unico: NAO cole em conversa nem em log)
#   sh scripts/heimdall.sh novo-link         reinicia SO a tela (codigo de uso unico novo) e mostra o link novo; os outros 4 processos nao sao tocados
#   sh scripts/heimdall.sh supervisionar     fica em primeiro plano, sobe tudo e REINICIA quem cair (espera crescente); e o que o systemd executa
#   sh scripts/heimdall.sh instalar-servico  escreve a unidade do systemd de USUARIO e mostra os comandos de ativar (nao ativa nada sozinho)
#   sh scripts/heimdall.sh config-hermes     gera o config.yaml do Hermes, grava no volume dele e reinicia o Hermes
#   --somente-mostrar  so mostra o plano       --sem-docker  nao mexe no Docker
# Registro em data/processos.json: para cada processo {pid, inicio} (inicio = campo 22 de /proc/<pid>/stat). So conta como "nosso" se o pid esta
# vivo, a hora de inicio confere E a linha de comando e o nosso script: o Linux reaproveita pids (LICOES.md, 2026-10-21).
# Variaveis: HEIMDALL_DATA, HEIMDALL_INTERVALO_S (10), HEIMDALL_BACKOFF_BASE_S (5), HEIMDALL_MAX_CICLOS (0 = sem fim), HEIMDALL_UNIT_DIR,
#   HEIMDALL_LOG_MAX_BYTES (10485760: acima disso o log vira .log.1), HEIMDALL_ESPERA_SUPERVISOR_S (15: tempo que o novo-link espera o supervisor religar a tela).
set -u
RAIZ=$(cd "$(dirname "$0")/.." && pwd)
cd "$RAIZ" || exit 2
DADOS=${HEIMDALL_DATA:-$RAIZ/data}
LOGS=$DADOS/logs
REG=$DADOS/processos.json
SUP=$DADOS/supervisor
ENVC=$RAIZ/infra/compose/.env
COMPOSE=$RAIZ/infra/compose/docker-compose.yml
INTERVALO=${HEIMDALL_INTERVALO_S:-10}
BACKOFF_BASE=${HEIMDALL_BACKOFF_BASE_S:-5}
MAX_CICLOS=${HEIMDALL_MAX_CICLOS:-0}
PROCESSOS="tela listener executor memoria ponte"

ACAO=${1:-estado}; [ $# -gt 0 ] && shift
SOMENTE=0; SEM_DOCKER=${HEIMDALL_SEM_DOCKER:-0}; COM_DOCKER=0
for a in "$@"; do case "$a" in --somente-mostrar) SOMENTE=1;; --sem-docker) SEM_DOCKER=1;; --com-docker) COM_DOCKER=1;; *) echo "opcao desconhecida: $a"; exit 2;; esac; done

info() { echo "  $1"; }
ok() { echo "  [OK]      $1"; }
plano() { echo "  [PLANO]   $1"; }
aviso() { echo "  [ATENCAO] $1"; }

script_de() { case $1 in tela) echo apps/core/src/onboarding/iniciar.ts;; listener) echo apps/listener/src/iniciar.ts;; executor) echo apps/trabalhos/src/iniciar.ts;; memoria) echo apps/memoria/src/iniciar.ts;; ponte) echo apps/ponte/src/iniciar.ts;; esac; }
pasta_de() { case $1 in tela) echo apps/core;; *) echo "apps/$(dirname "$(dirname "$(script_de "$1")")" | sed 's#^apps/##; s#/.*##')";; esac; }
compose() { docker compose --env-file "$ENVC" -f "$COMPOSE" "$@"; }

# ---- processos: vivo, hora de inicio, linha de comando ----
vivo() { [ -r "/proc/$1/stat" ] || return 1; _vs=$(cat "/proc/$1/stat" 2>/dev/null) || return 1; _vr=${_vs##*) }; set -- $_vr; [ "$1" != "Z" ]; }
inicio_de() { _is=$(cat "/proc/$1/stat" 2>/dev/null) || return 1; _ir=${_is##*) }; set -- $_ir; echo "${20}"; }
cmd_tem() { tr '\000' ' ' < "/proc/$1/cmdline" 2>/dev/null | grep -qF -- "$2"; }

# ---- registro (uma linha por processo; escrita atomica) ----
reg_linha() { [ -f "$REG" ] && sed -n "s/^\\(\"$1\": *{.*}\\),\\{0,1\\}\$/\\1/p" "$REG" | head -1; }
reg_get() { [ -f "$REG" ] && sed -n "s/^\"$1\": *{.*\"$2\": *\\([0-9][0-9]*\\).*\$/\\1/p" "$REG" | head -1; }
reg_gravar() { # $1 = nome a trocar; $2 = linha nova (vazia remove)
  mkdir -p "$DADOS"; _novo=""; _sep=""
  for _c in $PROCESSOS; do   # sh nao tem variavel local: nome proprio para nao mexer no "n" de quem chamou
    if [ "$_c" = "$1" ]; then _l=$2; else _l=$(reg_linha "$_c"); fi
    [ -n "$_l" ] || continue
    _novo="$_novo$_sep$_l"; _sep=",
"
  done
  printf '{\n%s\n}\n' "$_novo" > "$REG.tmp" && mv "$REG.tmp" "$REG"
}
nosso() { # $1 = nome
  _np=$(reg_get "$1" pid); _ni=$(reg_get "$1" inicio)
  [ -n "$_np" ] && [ -n "$_ni" ] || return 1
  vivo "$_np" || return 1
  [ "$(inicio_de "$_np")" = "$_ni" ] || return 1
  cmd_tem "$_np" "$(script_de "$1")"
}

versao_node_serve() {
  _nv=$(node --version 2>/dev/null | head -1)
  case $_nv in v[0-9]*) ;; *) return 1;; esac
  _nv=${_nv#v}; _maior=${_nv%%.*}; _resto=${_nv#*.}; _menor=${_resto%%.*}
  [ "$_maior" -gt 22 ] || { [ "$_maior" -eq 22 ] && [ "$_menor" -ge 18 ]; }
}

preparar() {
  versao_node_serve || { aviso "Preciso do Node.js 22.18 ou mais novo (node --version)."; return 1; }
  [ -f "$ENVC" ] || { aviso "Falta infra/compose/.env (modelo: infra/compose/modelo.env). Eu nao invento senhas."; return 1; }
  return 0
}

docker_subir() { # $1 = --no-recreate na checagem periodica: so sobe o que esta parado, nunca recria por causa de edicao no docker-compose.yml
  [ "$SEM_DOCKER" = 1 ] && return 0
  if [ "$SOMENTE" = 1 ]; then plano "docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml up -d"; return 0; fi
  compose up -d ${1:-} 2>&1 | while IFS= read -r l; do info "$l"; done
}

# Rodizio de logs: acima do limite o log vira .log.1 (so uma copia, modo 600: pode ter dado sensivel) e o original recomeca vazio.
# Copia e esvazia no lugar (o processo escreve com ">>", entao continua gravando no mesmo arquivo).
rodar_logs() {
  [ -d "$LOGS" ] || return 0
  _lmax=${HEIMDALL_LOG_MAX_BYTES:-10485760}
  for _lf in "$LOGS"/*.log; do
    [ -f "$_lf" ] || continue
    _lsz=$(wc -c < "$_lf" 2>/dev/null || echo 0)
    if [ "$_lsz" -gt "$_lmax" ]; then (umask 077; cp "$_lf" "$_lf.1") && : > "$_lf"; fi
  done
}

libera_trava() { rm -f "$SUP/partida.trava/pid"; rmdir "$SUP/partida.trava" 2>/dev/null; }
# Trava de partida: evita dois processos subirem ao mesmo tempo (supervisor e novo-link no mesmo instante). mkdir e atomico.
com_trava() {
  mkdir -p "$SUP"; _tw=0
  until mkdir "$SUP/partida.trava" 2>/dev/null; do
    _tp=$(cat "$SUP/partida.trava/pid" 2>/dev/null)
    if [ -n "$_tp" ] && ! vivo "$_tp"; then libera_trava; continue; fi
    sleep 0.2; _tw=$((_tw+1)); [ "$_tw" -gt 100 ] && return 1
  done
  echo $$ > "$SUP/partida.trava/pid"
  "$@"; _tr=$?
  libera_trava
  return $_tr
}

iniciar_um() { com_trava iniciar_um_sem_trava "$1"; }
iniciar_um_sem_trava() {
  n=$1; s=$(script_de "$n")
  if nosso "$n"; then ok "$n ja esta rodando (pid $(reg_get "$n" pid))"; return 0; fi
  rodar_logs
  if [ "$SOMENTE" = 1 ]; then plano "node $s   (registro em data/logs/$n.log)"; return 0; fi
  pasta=$(pasta_de "$n")
  if [ ! -d "$RAIZ/$pasta/node_modules" ] && [ -f "$RAIZ/$pasta/package-lock.json" ]; then
    info "instalando as dependencias de $pasta (npm ci, versoes fixas do package-lock.json)..."
    (cd "$RAIZ/$pasta" && npm ci --no-audit --no-fund >/dev/null 2>&1) || aviso "npm ci falhou em $pasta"
  fi
  mkdir -p "$LOGS"
  nohup node "$s" >> "$LOGS/$n.log" 2>> "$LOGS/$n.erro.log" < /dev/null &
  p=$!
  sleep 0.3
  if vivo "$p"; then
    reg_gravar "$n" "\"$n\": {\"pid\": $p, \"inicio\": $(inicio_de "$p"), \"iniciado_em\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
    ok "$n iniciado (pid $p)"
    return 0
  fi
  aviso "$n nao ficou de pe (veja data/logs/$n.erro.log)"
  return 1
}

parar_um() {
  n=$1
  if [ -z "$(reg_linha "$n")" ]; then info "$n: nao estava registrado"; return 0; fi
  if [ "$SOMENTE" = 1 ]; then plano "pararia $n (pid $(reg_get "$n" pid))"; return 0; fi
  if nosso "$n"; then
    p=$(reg_get "$n" pid); i=$(reg_get "$n" inicio)
    kill "$p" 2>/dev/null
    t=0; while vivo "$p" && [ "$t" -lt 25 ]; do sleep 0.2; t=$((t+1)); done
    if vivo "$p" && [ "$(inicio_de "$p")" = "$i" ]; then kill -9 "$p" 2>/dev/null; fi
    ok "$n parado"
  else
    info "$n: o registro ja nao apontava para um processo nosso (nao mexi em nenhum processo)"
  fi
  reg_gravar "$n" ""
}

acao_iniciar() {
  preparar || { [ "$SOMENTE" = 1 ] || return 1; }
  docker_subir
  for n in $PROCESSOS; do iniciar_um "$n"; done
  [ "$SOMENTE" = 1 ] && return 0
  info "Para ver o endereco da tela (com o codigo de uso unico): sh scripts/heimdall.sh link"
  info "Estado: sh scripts/heimdall.sh estado    Parar: sh scripts/heimdall.sh parar"
}

acao_parar() {
  for n in $PROCESSOS; do parar_um "$n"; done
  if [ "$COM_DOCKER" = 1 ] && [ "$SEM_DOCKER" != 1 ]; then
    if [ "$SOMENTE" = 1 ]; then plano "docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml stop"; else compose stop 2>&1 | while IFS= read -r l; do info "$l"; done; fi
  fi
}

acao_estado() {
  for n in $PROCESSOS; do
    if nosso "$n"; then
      printf '  [OK]      %-9s rodando (pid %s, desde %s)\n' "$n" "$(reg_get "$n" pid)" "$(sed -n "s/^\"$n\":.*\"iniciado_em\": *\"\\([^\"]*\\)\".*\$/\\1/p" "$REG" | head -1)"
    else
      printf '  [ATENCAO] %-9s parado\n' "$n"
      e="$LOGS/$n.erro.log"
      if [ -s "$e" ]; then grep -vE 'ExperimentalWarning|trace-warnings' "$e" | tail -3 | cut -c1-160 | while IFS= read -r l; do info "   erro.log: $l"; done; fi
    fi
  done
  if [ "$SEM_DOCKER" != 1 ]; then compose ps 2>&1 | while IFS= read -r l; do info "$l"; done; fi
}

acao_link() {
  l=$(grep -oE 'http://127\.0\.0\.1:[0-9]+/\?codigo=[A-Za-z0-9_-]+' "$LOGS/tela.log" 2>/dev/null | tail -1)
  if [ -n "$l" ]; then
    echo "$l"
    info "(vale para uma entrada; abra pelo tunel SSH. Nao cole este endereco em conversa, issue ou log. Se ja foi usado: reinicie a tela.)"
  else aviso "Ainda nao achei o link: a tela esta rodando? (sh scripts/heimdall.sh estado)"; return 1; fi
}

acao_novo_link() {
  if [ "$SOMENTE" = 1 ]; then plano "pararia so a tela, esperaria o supervisor religar (ou religaria) e mostraria o link novo"; return 0; fi
  _re='http://127\.0\.0\.1:[0-9]+/\?codigo=[A-Za-z0-9_-]+'
  _velho=$(grep -oE "$_re" "$LOGS/tela.log" 2>/dev/null | tail -1)
  nosso tela || info "a tela nao estava rodando; vou subi-la"
  parar_um tela
  # Com o supervisor ativo, ele religa a tela sozinho no proximo ciclo; sem ele, religamos aqui depois da espera.
  _nw=0; _nmax=${HEIMDALL_ESPERA_SUPERVISOR_S:-15}
  while [ "$_nw" -lt "$_nmax" ] && ! nosso tela; do sleep 1; _nw=$((_nw+1)); done
  nosso tela || iniciar_um tela
  # O link novo e o primeiro DIFERENTE do que havia antes de parar (o log so cresce).
  _nw=0; _novo=""
  while [ "$_nw" -lt 40 ]; do
    _novo=$(grep -oE "$_re" "$LOGS/tela.log" 2>/dev/null | tail -1)
    [ -n "$_novo" ] && [ "$_novo" != "$_velho" ] && break
    sleep 0.5; _nw=$((_nw+1))
  done
  if [ -n "$_novo" ] && [ "$_novo" != "$_velho" ]; then
    echo "$_novo"
    info "(vale para uma entrada; abra pelo tunel SSH. Nao cole este endereco em conversa, issue ou log.)"
  else aviso "A tela reiniciou, mas ainda nao achei o link novo: tente 'sh scripts/heimdall.sh link' em instantes."; return 1; fi
}

espera_de() { # $1 = nome: BASE * 2^(falhas-1), no maximo 300 s
  _ef=$(cat "$SUP/$1.falhas" 2>/dev/null || echo 0); _ee=$BACKOFF_BASE; _ek=1
  while [ "$_ek" -lt "$_ef" ] && [ "$_ee" -lt 300 ]; do _ee=$((_ee*2)); _ek=$((_ek+1)); done
  [ "$_ee" -gt 300 ] && _ee=300
  echo "$_ee"
}

acao_supervisionar() {
  preparar || return 1
  mkdir -p "$SUP"; trap 'exit 0' TERM INT
  docker_subir
  ciclo=0
  while :; do
    ciclo=$((ciclo+1)); agora=$(date +%s)
    rodar_logs
    for n in $PROCESSOS; do
      if nosso "$n"; then
        # de pe ha mais de 60 s: a fila de falhas zera
        ini=$(sed -n "s/^\"$n\":.*\"iniciado_em\": *\"\\([^\"]*\\)\".*\$/\\1/p" "$REG" | head -1)
        ts=$(date -u -d "$ini" +%s 2>/dev/null || echo "$agora")
        [ $((agora - ts)) -gt 60 ] && echo 0 > "$SUP/$n.falhas"
        continue
      fi
      libera=$(cat "$SUP/$n.libera" 2>/dev/null || echo 0)
      if [ "$agora" -lt "$libera" ]; then continue; fi
      f=$(cat "$SUP/$n.falhas" 2>/dev/null || echo 0); echo $((f+1)) > "$SUP/$n.falhas"
      echo $((agora + $(espera_de "$n"))) > "$SUP/$n.libera"
      iniciar_um "$n"
    done
    # de tempos em tempos, garante o Compose de pe (o Docker pode ter demorado a subir no boot)
    if [ $((ciclo % ${HEIMDALL_CICLOS_DOCKER:-30})) -eq 0 ]; then docker_subir --no-recreate >/dev/null 2>&1; fi
    if [ "$MAX_CICLOS" -gt 0 ] && [ "$ciclo" -ge "$MAX_CICLOS" ]; then return 0; fi
    sleep "$INTERVALO"
  done
}

acao_config_hermes() {
  if [ "$SOMENTE" = 1 ]; then plano "gerar o config.yaml (node apps/ponte/scripts/gerar-config.ts), copiar para o volume do Hermes (docker cp), esperar o Hindsight ficar saudavel e reiniciar o Hermes"; return 0; fi
  preparar || return 1
  # NUNCA "compose create/up" aqui: recria o Postgres e o Hindsight sem inicia-los (licao de 2026-10-22). O conteiner do Hermes tem de existir (iniciar).
  _cont=$(compose ps -aq hermes 2>/dev/null | head -1)
  [ -n "$_cont" ] || { aviso "Nao achei o conteiner do Hermes. Rode antes: sh scripts/heimdall.sh iniciar"; return 1; }
  _tmp=$(mktemp "${TMPDIR:-/tmp}/heimdall-hermes.XXXXXX") || return 1
  node apps/ponte/scripts/gerar-config.ts heimdall > "$_tmp" 2>/dev/null
  [ -s "$_tmp" ] || { aviso "Nao consegui gerar o config.yaml."; rm -f "$_tmp"; return 1; }
  docker cp "$_tmp" "$_cont:/opt/data/config.yaml" 2>&1 | while IFS= read -r l; do info "$l"; done
  rm -f "$_tmp"
  # O Hermes so liga o MCP da memoria na partida: o Hindsight precisa estar saudavel antes de reiniciar.
  _hind=$(compose ps -q hindsight 2>/dev/null | head -1); _t=0; _max=${HEIMDALL_ESPERA_HINDSIGHT_S:-420}; _saude=""
  while [ "$_t" -le "$_max" ]; do
    _saude=$(docker inspect -f '{{.State.Health.Status}}' "$_hind" 2>/dev/null)
    [ "$_saude" = "healthy" ] && break
    sleep 2; _t=$((_t+2))
  done
  if [ "$_saude" != "healthy" ]; then aviso "O Hindsight nao ficou saudavel (estado: ${_saude:-desconhecido}). Nao reiniciei o Hermes: o MCP da memoria ficaria estacionado. Rode de novo quando o Hindsight estiver saudavel."; return 1; fi
  compose restart hermes 2>&1 | while IFS= read -r l; do info "$l"; done
  ok "config.yaml do Hermes gravado; o Hermes foi reiniciado"
}

acao_instalar_servico() {
  dir=${HEIMDALL_UNIT_DIR:-$HOME/.config/systemd/user}
  if [ "$SOMENTE" = 1 ]; then plano "escreveria $dir/heimdall.service"; return 0; fi
  mkdir -p "$dir"
  cat > "$dir/heimdall.service" <<UNIT
[Unit]
Description=Heimdall: supervisor dos processos (tela, listener, executor, memoria e ponte)

[Service]
Type=simple
WorkingDirectory=$RAIZ
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/bin/sh $RAIZ/scripts/heimdall.sh supervisionar
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
UNIT
  ok "unidade escrita em $dir/heimdall.service (systemd de USUARIO; nada foi ativado)"
  info "Para ativar (decisao sua; eu nao rodo estes comandos sozinho):"
  info "  systemctl --user daemon-reload"
  info "  systemctl --user enable --now heimdall.service"
  info "  sudo loginctl enable-linger $(id -un)     # mantem o servico de pe sem sessao aberta e depois de reiniciar o servidor"
  info "Ver o estado: systemctl --user status heimdall.service    Parar: systemctl --user disable --now heimdall.service"
}

echo ""; echo "=== Heimdall: $ACAO ==="
[ "$SOMENTE" = 1 ] && info "(modo somente mostrar: nada sera iniciado, parado nem criado)"
case "$ACAO" in
  iniciar) acao_iniciar;;
  parar) acao_parar;;
  estado) acao_estado;;
  link) acao_link;;
  novo-link) acao_novo_link;;
  supervisionar) acao_supervisionar;;
  config-hermes) acao_config_hermes;;
  instalar-servico) acao_instalar_servico;;
  *) echo "acao desconhecida: $ACAO (use iniciar, parar, estado, link, novo-link, supervisionar, config-hermes ou instalar-servico)"; exit 2;;
esac
