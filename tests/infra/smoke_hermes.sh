#!/usr/bin/env sh
# FUMACA com o Hermes de verdade (Docker): grava o config.yaml gerado por apps/ponte no volume do Hermes, sobe Hindsight + Hermes pelo Compose
# (projeto "heimdall-smoke-r", volumes proprios, apagados no fim) e confere pela API do Hermes (/v1/toolsets) que SO as ferramentas permitidas estao
# ligadas e que o MCP do Hindsight entrou so com leitura. Sem modelo de linguagem: nao testa respostas. Pesado (imagem do Hermes ~4,5 GB).
# Precisa das portas 8888 e 8642 livres. Nao roda no run-all. Variaveis: REQUIRE_DOCKER=1 · HEIMDALL_CA_PEM=... · SMOKE_MANTER=1
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
if ! docker info >/dev/null 2>&1; then echo "  [NAO EXECUTADO] Docker nao esta rodando"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; fi
command -v node >/dev/null 2>&1 || { echo "  [NAO EXECUTADO] Node nao encontrado"; exit 0; }
. tests/infra/lib_docker.sh
for porta in 8888 8642; do
  if "$PY" -I -c "import socket,sys; s=socket.socket(); s.settimeout(2)
try: s.connect(('127.0.0.1', $porta)); sys.exit(0)
except OSError: sys.exit(1)"; then echo "  [NAO EXECUTADO] porta $porta ocupada (instalacao real rodando?): nao vou interferir"; exit 0; fi
done

T=$(mktemp -d); PROJ=heimdall-smoke-r; ENVF="$T/env"; CHAVE="chave-smoke-$(date +%s)-0123456789"
printf 'POSTGRES_PASSWORD=%s\nAPI_SERVER_KEY=%s\nHINDSIGHT_API_LLM_PROVIDER=none\n' "smoke$(date +%s)$$" "$CHAVE" > "$ENVF"
DC="docker compose -p $PROJ --env-file $ENVF -f infra/compose/docker-compose.yml"
cleanup() { [ "${SMOKE_MANTER:-0}" != 1 ] && $DC down -v --remove-orphans >/dev/null 2>&1; rm -rf "$T"; }
trap cleanup EXIT
construir infra/hindsight heimdall-hindsight:1.0.0-onnx ghcr.io/vectorize-io/hindsight:1.0.0-slim && pass "imagem do Hindsight pronta" || { fail "imagem do Hindsight nao construiu"; tail -5 "$T/build.txt"; }

node apps/ponte/scripts/gerar-config.ts heimdall > "$T/config.yaml" && [ -s "$T/config.yaml" ] && pass "config.yaml gerado" || fail "config.yaml nao foi gerado"
$DC create hermes >"$T/create.txt" 2>&1 || { fail "compose create hermes falhou"; tail -5 "$T/create.txt"; }
CONT=$($DC ps -aq hermes | head -1)
docker cp "$T/config.yaml" "$CONT:/opt/data/config.yaml" >/dev/null 2>&1 && pass "config.yaml gravado no volume do Hermes" || fail "nao consegui gravar o config.yaml no volume"
$DC up -d --no-build postgres hindsight hermes >"$T/up.txt" 2>&1 && pass "docker compose up (postgres, hindsight, hermes)" || { fail "compose up falhou"; tail -8 "$T/up.txt"; }

espera() { n=0; while [ $n -lt "$2" ]; do "$PY" -I -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('$1', timeout=5).status == 200 else 1)" 2>/dev/null && return 0; n=$((n+1)); sleep 5; done; return 1; }
espera http://127.0.0.1:8888/health 60 && pass "Hindsight saudavel" || fail "Hindsight nao ficou saudavel"
espera http://127.0.0.1:8642/health 36 && pass "Hermes respondeu /health em 127.0.0.1:8642" || { fail "Hermes nao respondeu /health"; $DC logs --tail 15 hermes 2>&1 | cut -c1-200; }

sleep 20  # o MCP conecta logo apos subir; sem isso o toolset do Hindsight ainda nao aparece
cat > "$T/ver.py" <<'PY'
import json, sys, urllib.request
req = urllib.request.Request('http://127.0.0.1:8642/v1/toolsets', headers={'Authorization': 'Bearer ' + sys.argv[1]})
d = json.load(urllib.request.urlopen(req, timeout=15))['data']
ligados = {t['name']: sorted(t['tools']) for t in d if t['enabled']}
print(json.dumps(ligados, sort_keys=True))
PY
LIG=$("$PY" -I "$T/ver.py" "$CHAVE" 2>"$T/ver.err")
[ -n "$LIG" ] && pass "toolsets lidos pela API do Hermes" || { fail "nao consegui ler /v1/toolsets"; head -3 "$T/ver.err"; }
echo "  (ligados: $LIG)"
echo "$LIG" | "$PY" -I -c "
import json,sys
l=json.load(sys.stdin)
proibidos=['terminal','file','browser','code_execution','web','delegation','cronjob','computer_use','skills','connections','kanban','tts','image_gen','video_gen','discord','discord_admin','a2a']
ruins=[n for n in l if n in proibidos]
sys.exit(1 if ruins else 0)" && pass "nenhum toolset perigoso esta ligado na API do Hermes" || fail "toolset perigoso ligado: $LIG"
echo "$LIG" | "$PY" -I -c "
import json,sys
l=json.load(sys.stdin)
ok={'memory','session_search'}
extra=[n for n in l if n not in ok and not n.startswith('mcp')]
sys.exit(1 if extra else 0)" && pass "so memory, session_search e MCPs estao ligados" || fail "toolset inesperado ligado: $LIG"
# MCP do Hindsight: o proprio Hermes lista, por plataforma, os servidores MCP e o filtro de ferramentas (hermes tools list); /v1/toolsets nao mostra MCP.
$DC exec -T hermes hermes tools list --platform api_server >"$T/tools.txt" 2>&1
grep -qE 'hindsight +\[include only: recall, reflect\]' "$T/tools.txt" && pass "MCP do Hindsight conectado so com recall e reflect (lista branca; nada que escreva ou apague)" || { fail "MCP do Hindsight ausente ou sem a lista branca"; tail -5 "$T/tools.txt"; }
$DC exec -T hermes hermes mcp test hindsight >"$T/mcp.txt" 2>&1
grep -q 'recall' "$T/mcp.txt" && pass "o servidor MCP do Hindsight responde e oferece recall (conexao de verdade, pela rede do Compose)" || { fail "o Hermes nao conseguiu falar com o MCP do Hindsight"; tail -5 "$T/mcp.txt" | cut -c1-200; }
$DC logs hermes 2>&1 | grep -qi "unknown toolset\|invalid timezone\|Traceback" && fail "o Hermes reclamou do config (veja os logs)" || pass "o Hermes subiu sem reclamar do config (fuso e toolsets)"
[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
