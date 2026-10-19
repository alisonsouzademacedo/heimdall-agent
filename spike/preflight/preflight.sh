#!/usr/bin/env sh
# Heimdall preflight (macOS e Linux/WSL2). Só lê informações da máquina; não instala nada nem envia dados.
# Uso: sh preflight.sh        -> relatório na tela e preflight-resultado.json na pasta atual
# Código de saída: 0 = atende, 1 = atende com ressalvas, 2 = não atende
LC_ALL=C; export LC_ALL
OUT="${PREFLIGHT_OUT:-preflight-resultado.json}"
FAIL=0; WARN=0; LINES=""
say() { printf '%s\n' "$1"; }
ok()   { say "  [OK]      $1"; }
warn() { say "  [ATENCAO] $1"; WARN=$((WARN+1)); }
bad()  { say "  [FALHA]   $1"; FAIL=$((FAIL+1)); }
have() { command -v "$1" >/dev/null 2>&1; }
json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

# ---------- sistema ----------
KERNEL=$(uname -s); ARCH=$(uname -m); OS_NAME="$KERNEL"; OS_VER=""; WSL=0
case "$KERNEL" in
  Darwin) OS_NAME="macOS"; OS_VER=$(sw_vers -productVersion 2>/dev/null) ;;
  Linux)
    if [ -r /etc/os-release ]; then OS_NAME=$(. /etc/os-release; echo "${NAME:-Linux}"); OS_VER=$(. /etc/os-release; echo "${VERSION_ID:-}"); else OS_NAME="Linux"; fi
    if grep -qi microsoft /proc/version 2>/dev/null; then WSL=1; fi ;;
esac

# ---------- hardware ----------
CORES=$( (nproc 2>/dev/null) || (sysctl -n hw.ncpu 2>/dev/null) || echo 0 )
CPU_MODEL=""; AVX2="desconhecido"; RAM_MB=0; RAM_AVAIL_MB=0
if [ "$KERNEL" = "Darwin" ]; then
  CPU_MODEL=$(sysctl -n machdep.cpu.brand_string 2>/dev/null)
  RAM_MB=$(( $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1048576 ))
  if [ "$ARCH" = "arm64" ]; then AVX2="nao_se_aplica(arm64)"; else sysctl -n machdep.cpu.leaf7_features 2>/dev/null | grep -qi avx2 && AVX2="sim" || AVX2="nao"; fi
else
  CPU_MODEL=$(grep -m1 'model name' /proc/cpuinfo 2>/dev/null | cut -d: -f2- | sed 's/^ *//')
  RAM_MB=$(( $(awk '/MemTotal/{print $2}' /proc/meminfo 2>/dev/null || echo 0) / 1024 ))
  RAM_AVAIL_MB=$(( $(awk '/MemAvailable/{print $2}' /proc/meminfo 2>/dev/null || echo 0) / 1024 ))
  if grep -qiw avx2 /proc/cpuinfo 2>/dev/null; then AVX2="sim"; elif [ "$ARCH" = "aarch64" ]; then AVX2="nao_se_aplica(arm64)"; else AVX2="nao"; fi
fi
DISK_FREE_GB=$(df -Pk . 2>/dev/null | awk 'NR==2{printf "%d", $4/1048576}')
GPU_NAME=""; GPU_VRAM_MB=0
if have nvidia-smi; then
  G=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>/dev/null | head -n1)
  GPU_NAME=$(echo "$G" | cut -d, -f1 | sed 's/^ *//;s/ *$//'); GPU_VRAM_MB=$(echo "$G" | cut -d, -f2 | tr -dc '0-9'); GPU_VRAM_MB=${GPU_VRAM_MB:-0}
fi

# ---------- ferramentas ----------
ver() { "$@" 2>&1 | head -n1; }
DOCKER_V=""; DOCKER_UP="nao"; NODE_V=""; PY_V=""; GIT_V=""
have docker && DOCKER_V=$(ver docker --version) && (docker info >/dev/null 2>&1 && DOCKER_UP="sim")
have node && NODE_V=$(ver node --version)
have python3 && PY_V=$(ver python3 --version)
have git && GIT_V=$(ver git --version)

# ---------- rede ----------
reach() { if have curl; then curl -sS -m 8 -o /dev/null -I "https://$1" >/dev/null 2>&1 && echo sim || echo nao; else echo "sem_curl"; fi; }
NET_WA=$(reach web.whatsapp.com); NET_CHATGPT=$(reach chatgpt.com); NET_HF=$(reach huggingface.co); NET_GH=$(reach github.com)

# ---------- fuso ----------
TZ_NAME=$( (timedatectl show -p Timezone --value 2>/dev/null) || (readlink /etc/localtime 2>/dev/null | sed 's#.*/zoneinfo/##') || date +%Z )

# ---------- portas ----------
port_free() { if have lsof; then lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1 && echo ocupada || echo livre; elif have ss; then ss -ltn 2>/dev/null | awk '{print $4}' | grep -q ":$1\$" && echo ocupada || echo livre; else echo desconhecido; fi; }
P1455=$(port_free 1455); P8888=$(port_free 8888)

# ---------- relatório ----------
say "=== Heimdall: verificação do ambiente ==="
say ""; say "Sistema:  $OS_NAME $OS_VER ($ARCH)$( [ $WSL = 1 ] && echo ' [WSL2]')"
say "CPU:      ${CPU_MODEL:-?} | $CORES nucleos | AVX2: $AVX2"
say "Memoria:  $((RAM_MB/1024)) GB total$( [ "$RAM_AVAIL_MB" -gt 0 ] && echo ", $((RAM_AVAIL_MB/1024)) GB livres agora")"
say "Disco:    ${DISK_FREE_GB:-?} GB livres nesta pasta"
say "GPU:      ${GPU_NAME:-nenhuma NVIDIA detectada}${GPU_NAME:+ ($((GPU_VRAM_MB/1024)) GB de VRAM)}"
say "Fuso:     ${TZ_NAME:-?}"
say ""; say "Verificacoes:"

# sistema suportado (docs do Hermes: macOS Apple Silicon, Windows 10/11, Linux/WSL2 x86_64/aarch64)
case "$KERNEL/$ARCH" in
  Darwin/arm64) ok "macOS Apple Silicon: suporte completo" ;;
  Darwin/x86_64) warn "Mac Intel: o Hermes Desktop e partes do Hindsight tem suporte limitado; usar a instalacao por linha de comando" ;;
  Linux/x86_64|Linux/aarch64) ok "Linux $ARCH: suportado" ;;
  *) bad "sistema/arquitetura nao suportado: $KERNEL/$ARCH" ;;
esac
# memoria: minimo 8 GB, recomendado 16 GB (estimativa nossa; ver docs/plano/fase-1-requisitos-e-preflight.md)
if [ "$RAM_MB" -ge 15000 ]; then ok "memoria $((RAM_MB/1024)) GB (recomendado: 16 GB ou mais)"
elif [ "$RAM_MB" -ge 7500 ]; then warn "memoria $((RAM_MB/1024)) GB: atende o minimo (8 GB), mas apertado para rodar tudo junto"
else bad "memoria $((RAM_MB/1024)) GB: abaixo do minimo (8 GB)"; fi
if [ "$CORES" -ge 4 ]; then ok "CPU com $CORES nucleos"; else warn "CPU com $CORES nucleos (recomendado: 4 ou mais)"; fi
if [ "${DISK_FREE_GB:-0}" -ge 50 ]; then ok "disco livre ${DISK_FREE_GB} GB"; elif [ "${DISK_FREE_GB:-0}" -ge 30 ]; then warn "disco livre ${DISK_FREE_GB} GB: atende o minimo (30 GB), recomendado 50 GB ou mais (a imagem do Hindsight sozinha tem cerca de 9 GB)"; else bad "disco livre ${DISK_FREE_GB:-0} GB (minimo: 30 GB)"; fi
[ "$AVX2" = "nao" ] && warn "CPU sem AVX2: a transcricao de audio (faster-whisper) pode ficar muito lenta"
# docker
if [ -z "$DOCKER_V" ]; then bad "Docker nao encontrado (necessario para Hindsight e Krayin)"
elif [ "$DOCKER_UP" = "sim" ]; then ok "Docker ativo ($DOCKER_V)"; else warn "Docker instalado, mas o servico nao esta rodando"; fi
# node
if [ -n "$NODE_V" ]; then MAJ=$(echo "$NODE_V" | tr -dc '0-9.' | cut -d. -f1); [ "${MAJ:-0}" -ge 20 ] && ok "Node $NODE_V (Baileys exige 20 ou mais)" || bad "Node $NODE_V: o Baileys exige 20 ou mais"; else warn "Node nao encontrado (o Baileys exige 20 ou mais)"; fi
[ -n "$PY_V" ] && ok "$PY_V" || warn "Python 3 nao encontrado (markitdown e faster-whisper; o Hermes traz o proprio Python)"
[ -n "$GIT_V" ] && ok "$GIT_V" || warn "Git nao encontrado"
# rede
for h in "web.whatsapp.com:$NET_WA" "chatgpt.com:$NET_CHATGPT" "huggingface.co:$NET_HF" "github.com:$NET_GH"; do
  n=${h%%:*}; r=${h##*:}; [ "$r" = "sim" ] && ok "rede: $n acessivel" || warn "rede: $n inacessivel ($r)"; done
# portas
[ "$P1455" = "livre" ] && ok "porta 1455 livre (login do ChatGPT)" || warn "porta 1455: $P1455 (login do ChatGPT no Hindsight usa 127.0.0.1:1455)"
[ "$P8888" = "livre" ] && ok "porta 8888 livre (Hindsight)" || warn "porta 8888: $P8888 (Hindsight)"
# fuso
[ "$TZ_NAME" = "America/Sao_Paulo" ] && ok "fuso America/Sao_Paulo" || warn "fuso do sistema: ${TZ_NAME:-?} (o Heimdall usa America/Sao_Paulo; sera configurado no Hermes)"

# modelo de transcricao sugerido (candidato inicial; confirmar com o teste real E6)
WHISPER="small (CPU, int8)"
if [ "$GPU_VRAM_MB" -ge 10000 ]; then WHISPER="large-v3 (GPU NVIDIA, float16)"
elif [ "$GPU_VRAM_MB" -ge 6000 ]; then WHISPER="turbo (GPU NVIDIA, float16)"
elif [ "$GPU_VRAM_MB" -ge 5000 ]; then WHISPER="medium (GPU NVIDIA)"
elif [ "$RAM_MB" -ge 15000 ] && [ "$CORES" -ge 8 ]; then WHISPER="turbo ou large-v3 na CPU (int8): testar; com poucos audios curtos o tempo nao e problema"
elif [ "$RAM_MB" -ge 11000 ]; then WHISPER="medium (CPU, int8)"; fi
say ""; say "Modelo de transcricao sugerido (a confirmar no teste): $WHISPER"

VERDICT="ATENDE"; CODE=0
[ "$WARN" -gt 0 ] && VERDICT="ATENDE COM RESSALVAS" && CODE=1
[ "$FAIL" -gt 0 ] && VERDICT="NAO ATENDE" && CODE=2
say ""; say "Resultado: $VERDICT ($FAIL falha(s), $WARN atencao(oes))"

# ---------- json ----------
{
printf '{\n'
printf '  "resultado": "%s", "falhas": %s, "atencoes": %s,\n' "$VERDICT" "$FAIL" "$WARN"
printf '  "sistema": {"nome": "%s", "versao": "%s", "arquitetura": "%s", "wsl": %s},\n' "$(json_escape "$OS_NAME")" "$(json_escape "$OS_VER")" "$ARCH" "$( [ $WSL = 1 ] && echo true || echo false)"
printf '  "hardware": {"cpu": "%s", "nucleos": %s, "avx2": "%s", "ram_mb": %s, "ram_livre_mb": %s, "disco_livre_gb": %s, "gpu": "%s", "vram_mb": %s},\n' "$(json_escape "$CPU_MODEL")" "$CORES" "$AVX2" "$RAM_MB" "$RAM_AVAIL_MB" "${DISK_FREE_GB:-0}" "$(json_escape "$GPU_NAME")" "$GPU_VRAM_MB"
printf '  "ferramentas": {"docker": "%s", "docker_ativo": "%s", "node": "%s", "python": "%s", "git": "%s"},\n' "$(json_escape "$DOCKER_V")" "$DOCKER_UP" "$(json_escape "$NODE_V")" "$(json_escape "$PY_V")" "$(json_escape "$GIT_V")"
printf '  "rede": {"web.whatsapp.com": "%s", "chatgpt.com": "%s", "huggingface.co": "%s", "github.com": "%s"},\n' "$NET_WA" "$NET_CHATGPT" "$NET_HF" "$NET_GH"
printf '  "fuso": "%s", "portas": {"1455": "%s", "8888": "%s"},\n' "$(json_escape "$TZ_NAME")" "$P1455" "$P8888"
printf '  "whisper_sugerido": "%s"\n}\n' "$(json_escape "$WHISPER")"
} > "$OUT"
say "Detalhes gravados em $OUT"
exit $CODE
