#!/usr/bin/env sh
# Teste de FUMACA com Docker de verdade: constroi as imagens do Heimdall (infra/hindsight e apps/media-worker), confere o que o runbook 02 e o 06 descobriram
# (Hindsight com onnx; audio com av fixo), e sobe PostgreSQL + Hindsight pelo Compose conferindo /health e que a porta so atende em 127.0.0.1.
# E pesado (baixa imagens e o modelo de embeddings, cerca de 3 GB) e usa o projeto Compose "heimdall-smoke" (volumes proprios, apagados no fim):
# NAO mexe nos dados de uma instalacao real. Precisa das portas 8888 e 9999 livres. Nao roda no run-all; rode a mao ou no GitHub (workflow manual).
# Variaveis: REQUIRE_DOCKER=1 (sem Docker = falha) · HEIMDALL_CA_PEM=/caminho/ca.pem (rede com inspecao TLS/proxy: o certificado entra so no TESTE, nunca nas imagens do projeto)
#            SMOKE_HERMES=1 (tambem baixa e sobe o Hermes, 4,5 GB) · SMOKE_MANTER=1 (nao apaga volumes/imagens no fim)
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

if ! docker info >/dev/null 2>&1; then
  echo "  [NAO EXECUTADO] Docker nao esta rodando"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0
fi
for porta in 8888 9999; do
  if (exec 3<>/dev/tcp/127.0.0.1/$porta) 2>/dev/null; then echo "  [NAO EXECUTADO] porta $porta ocupada (instalacao real rodando?): nao vou interferir"; exit 0; fi
done

T=$(mktemp -d)
PROJ=heimdall-smoke
ENVF="$T/env"
printf 'POSTGRES_PASSWORD=%s\nAPI_SERVER_KEY=%s\nHINDSIGHT_API_LLM_PROVIDER=none\n' "smoke$(date +%s)$$" "chave-smoke-$(date +%s)-0123456789" > "$ENVF"
cleanup() {
  if [ "${SMOKE_MANTER:-0}" != 1 ]; then
    docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml --profile trabalho down -v --remove-orphans >/dev/null 2>&1
  fi
  rm -rf "$T"
}
trap cleanup EXIT

# ---- construcao (com certificado extra SO quando a rede inspeciona TLS) ----
build() { # build <contexto> <tag> <imagem-base>
  ctx="$1"; tag="$2"; base="$3"
  if [ -n "${HEIMDALL_CA_PEM:-}" ] && [ -r "$HEIMDALL_CA_PEM" ]; then
    mkdir -p "$T/ca" && cp "$HEIMDALL_CA_PEM" "$T/ca/ca.crt"
    printf 'FROM %s\nUSER root\nCOPY ca.crt /usr/local/share/ca-certificates/ca.crt\nRUN cat /usr/local/share/ca-certificates/ca.crt >> /etc/ssl/certs/ca-certificates.crt\nENV UV_SYSTEM_CERTS=1 SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt PIP_CERT=/etc/ssl/certs/ca-certificates.crt\n' "$base" > "$T/ca/Dockerfile"
    docker build -q -t "smoke-base-$(echo "$tag" | tr ':/' '__')" "$T/ca" >/dev/null || return 1
    docker buildx build --load --build-context "$base=docker-image://smoke-base-$(echo "$tag" | tr ':/' '__')" -t "$tag" "$ctx" >"$T/build.txt" 2>&1
  else
    docker build -t "$tag" "$ctx" >"$T/build.txt" 2>&1
  fi
}
build infra/hindsight heimdall-hindsight:1.0.0-onnx ghcr.io/vectorize-io/hindsight:1.0.0-slim && pass "imagem do Hindsight construida (slim + local-onnx)" || { fail "imagem do Hindsight nao construiu"; tail -5 "$T/build.txt"; }
build apps/media-worker heimdall-media-worker:1.0.0 python:3.12-slim && pass "imagem do trabalhador de audio construida (modelo small embutido)" || { fail "imagem do trabalhador de audio nao construiu"; tail -5 "$T/build.txt"; }

# ---- Hindsight: o que o runbook 02 descobriu ----
docker run --rm heimdall-hindsight:1.0.0-onnx /app/api/.venv/bin/python -c "import onnxruntime, transformers, safetensors" >/dev/null 2>&1 && pass "Hindsight: onnxruntime, transformers e safetensors importam (o provedor onnx pode subir)" || fail "Hindsight: faltam pacotes do onnx"
[ "$(docker run --rm --entrypoint id heimdall-hindsight:1.0.0-onnx -un 2>/dev/null)" = hindsight ] && pass "Hindsight roda como usuario nao-root" || fail "Hindsight roda como root"

# ---- Trabalhador de audio: o que o runbook 06 descobriu ----
MW="docker run --rm --network none heimdall-media-worker:1.0.0"
[ "$($MW python -c 'import av; print(av.__version__)' 2>/dev/null)" = "16.1.0" ] && pass "audio: av 16.1.0 (sem o erro 'metadata_errors' do av 19)" || fail "audio: av diferente de 16.1.0"
cat > "$T/audio.py" <<'PY'
import math, struct, wave, numpy as np
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
# 2 s de tom (nao e fala: so prova que decodificar e carregar o modelo OFFLINE funcionam; qualidade de transcricao NAO e avaliada aqui)
with wave.open('/tmp/tom.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
    w.writeframes(b''.join(struct.pack('<h', int(8000 * math.sin(2 * math.pi * 440 * i / 16000))) for i in range(32000)))
a = decode_audio('/tmp/tom.wav', sampling_rate=16000)
assert isinstance(a, np.ndarray) and 31000 < len(a) < 33000, len(a)
m = WhisperModel('/modelos/small', device='cpu', compute_type='int8', local_files_only=True)
segs, info = m.transcribe(a, language='pt', vad_filter=True)
list(segs)
print('ok', info.language)
PY
docker run --rm --network none -v "$T/audio.py:/tmp/audio.py:ro" heimdall-media-worker:1.0.0 python /tmp/audio.py 2>&1 | tail -1 | grep -q '^ok pt' && pass "audio: decodifica WAV e carrega o modelo small SEM internet (rede desligada)" || fail "audio: decodificar/carregar o modelo falhou"
cat > "$T/pdf.py" <<'PY'
import io
from markitdown import MarkItDown
corpo = b"BT /F1 24 Tf 72 700 Td (Ola Heimdall reuniao) Tj ET"
objs = [b"<< /Type /Catalog /Pages 2 0 R >>", b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length %d >>\nstream\n" % len(corpo) + corpo + b"\nendstream", b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
pdf = b"%PDF-1.4\n"; off = []
for i, o in enumerate(objs, 1):
    off.append(len(pdf)); pdf += b"%d 0 obj\n" % i + o + b"\nendobj\n"
x = len(pdf); pdf += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1) + b"".join(b"%010d 00000 n \n" % o for o in off)
pdf += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, x)
t = MarkItDown().convert_stream(io.BytesIO(pdf), file_extension='.pdf').text_content
assert 'Ola Heimdall' in t, t
print('ok')
PY
docker run --rm --network none -v "$T/pdf.py:/tmp/pdf.py:ro" heimdall-media-worker:1.0.0 python /tmp/pdf.py 2>&1 | tail -1 | grep -q '^ok' && pass "PDF: o markitdown le o texto de um PDF sintetico (convert_stream)" || fail "PDF: markitdown nao leu o PDF sintetico"

# ---- Compose: PostgreSQL + Hindsight de verdade ----
SERV="postgres hindsight"; [ "${SMOKE_HERMES:-0}" = 1 ] && SERV="$SERV hermes"
docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml up -d --no-build $SERV >"$T/up.txt" 2>&1 && pass "docker compose up ($SERV)" || { fail "docker compose up falhou"; tail -8 "$T/up.txt"; }
OK=0; i=0
while [ $i -lt 60 ]; do
  if python3 -I -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8888/health', timeout=5).status == 200 else 1)" 2>/dev/null; then OK=1; break; fi
  i=$((i+1)); sleep 5
done
[ "$OK" = 1 ] && pass "Hindsight respondeu /health em 127.0.0.1:8888 (baixou e carregou o modelo multilingue)" || { fail "Hindsight nao ficou saudavel em 5 min"; docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml logs --tail 15 hindsight 2>&1 | cut -c1-200; }
# a porta publicada so atende no loopback: tentar pelo IP da rede deve ser recusado
IPREDE=$(python3 -I -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try: s.connect(('192.0.2.1', 9)); print(s.getsockname()[0])
except OSError: pass")
if [ -n "$IPREDE" ] && [ "$IPREDE" != "127.0.0.1" ]; then
  python3 -I -c "
import socket,sys
s = socket.socket(); s.settimeout(3)
try: s.connect(('$IPREDE', 8888)); sys.exit(1)
except OSError: sys.exit(0)" && pass "a porta 8888 NAO atende pelo IP da rede ($IPREDE): so no loopback" || fail "a porta 8888 atende pelo IP da rede"
else echo "  [NAO EXECUTADO] sem IP de rede para testar a porta"; fi
docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml exec -T hindsight id -un 2>/dev/null | grep -q '^hindsight' && pass "Hindsight no Compose roda como nao-root" || fail "Hindsight no Compose nao esta como hindsight"
docker compose -p "$PROJ" --env-file "$ENVF" -f infra/compose/docker-compose.yml exec -T hindsight sh -c 'touch /home/hindsight/chatgpt/t && touch /home/hindsight/.cache/t' >/dev/null 2>&1 && pass "volumes do login e do cache de modelos sao gravaveis pelo usuario do Hindsight" || fail "volume nao gravavel (o login do ChatGPT e o download do modelo falhariam)"
if [ "${SMOKE_HERMES:-0}" = 1 ]; then
  KEY=$(grep '^API_SERVER_KEY=' "$ENVF" | cut -d= -f2)
  OKH=0; i=0; while [ $i -lt 36 ]; do python3 -I -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8642/health', timeout=5).status == 200 else 1)" 2>/dev/null && { OKH=1; break; }; i=$((i+1)); sleep 5; done
  [ "$OKH" = 1 ] && pass "Hermes respondeu /health em 127.0.0.1:8642" || fail "Hermes nao respondeu /health"
  : "$KEY"
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
