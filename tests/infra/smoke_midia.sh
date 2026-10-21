#!/usr/bin/env sh
# Teste de fumaca dos comandos do trabalhador de audio e PDF (apps/media-worker) com o Docker de verdade, SEM internet (--network none) e com a
# pasta de entrada somente leitura, como no Compose. Usa audio e PDF SINTETICOS (um tom e um PDF de uma linha): prova o encanamento, NAO a
# qualidade da transcricao (isso so a prática com áudios reais mostra: runbooks/08-testes-de-fumaca.md).
# Variaveis: REQUIRE_DOCKER=1 · HEIMDALL_CA_PEM=/caminho/ca.pem (so para construir a imagem atras de inspecao TLS)
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }
if ! docker info >/dev/null 2>&1; then echo "  [NAO EXECUTADO] Docker nao esta rodando"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; fi
. tests/infra/lib_docker.sh
[ -n "$PY" ] || { echo "  [NAO EXECUTADO] Python 3 nao encontrado"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && exit 1; exit 0; }
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
IMG=heimdall-media-worker:1.0.0
construir apps/media-worker "$IMG" python:3.12-slim && pass "imagem do trabalhador construida" || { fail "imagem nao construiu"; tail -5 "$T/build.txt"; echo "RESULTADO: $FAIL falha(s)"; exit 1; }

mkdir -p "$T/entrada"
"$PY" -I - "$T/entrada" <<'PY'
import math, struct, sys, wave
pasta = sys.argv[1]
with wave.open(pasta + '/tom.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
    w.writeframes(b''.join(struct.pack('<h', int(8000 * math.sin(2 * math.pi * 440 * i / 16000))) for i in range(32000)))
corpo = b"BT /F1 24 Tf 72 700 Td (Ola Heimdall reuniao de segunda) Tj ET"
objs = [b"<< /Type /Catalog /Pages 2 0 R >>", b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
        b"<< /Length %d >>\nstream\n" % len(corpo) + corpo + b"\nendstream", b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
pdf = b"%PDF-1.4\n"; off = []
for i, o in enumerate(objs, 1):
    off.append(len(pdf)); pdf += b"%d 0 obj\n" % i + o + b"\nendobj\n"
x = len(pdf); pdf += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1) + b"".join(b"%010d 00000 n \n" % o for o in off)
pdf += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, x)
open(pasta + '/ata.pdf', 'wb').write(pdf)
open(pasta + '/lixo.pdf', 'wb').write(b"isto nao e um pdf de verdade")
PY
chmod -R a+rX "$T/entrada"
run() { drun --rm --network none -v "$(hpath "$T")/entrada:/entrada:ro" "$IMG" python "$@"; }

SAIDA=$(run /app/transcrever.py /entrada/tom.wav 2>"$T/err1.txt"); COD=$?
[ "$COD" = 0 ] && pass "transcrever: sai com codigo 0 num tom de 2 s, sem internet" || { fail "transcrever saiu com $COD"; cat "$T/err1.txt" | head -3; }
printf '%s\n' "$SAIDA" | "$PY" -I -c "
import sys, json
d = json.loads(sys.stdin.read().strip().splitlines()[-1])
assert isinstance(d['texto'], str) and isinstance(d['idioma'], str) and 1.5 < d['duracao_s'] < 2.5, d
" 2>/dev/null && pass "transcrever: uma linha JSON com texto, idioma e duracao" || fail "transcrever: saida nao e o JSON combinado ($SAIDA)"

run /app/transcrever.py /etc/passwd >/dev/null 2>"$T/err2.txt"; COD=$?
[ "$COD" = 3 ] && grep -q 'arquivo_fora_de_entrada' "$T/err2.txt" && pass "transcrever: arquivo fora de /entrada e recusado (codigo 3, definitivo)" || fail "transcrever aceitou arquivo fora de /entrada (codigo $COD)"
run /app/transcrever.py /entrada/../etc/passwd >/dev/null 2>/dev/null; [ "$?" = 3 ] && pass "transcrever: truque com .. tambem e recusado" || fail "transcrever caiu no truque com .."
run /app/transcrever.py /entrada/nao-existe.ogg >/dev/null 2>/dev/null; [ "$?" = 3 ] && pass "transcrever: arquivo inexistente e definitivo (3)" || fail "arquivo inexistente nao deu 3"

SAIDA=$(run /app/converter_pdf.py /entrada/ata.pdf 2>"$T/err3.txt"); COD=$?
[ "$COD" = 0 ] && printf '%s\n' "$SAIDA" | "$PY" -I -c "
import sys, json
d = json.loads(sys.stdin.read().strip().splitlines()[-1])
assert 'Ola Heimdall reuniao de segunda' in d['markdown'], d
" && pass "PDF: o texto do PDF sintetico chega no JSON, sem internet" || { fail "PDF: conversao falhou (codigo $COD)"; head -3 "$T/err3.txt"; }

run /app/converter_pdf.py /entrada/lixo.pdf >"$T/out4.txt" 2>"$T/err4.txt"; COD=$?
[ "$COD" = 3 ] && grep -q 'nao_e_pdf' "$T/err4.txt" && ! grep -q 'isto nao e um pdf' "$T/err4.txt" "$T/out4.txt" && pass "arquivo .pdf que nao e PDF: recusado (3, nao_e_pdf) sem ecoar o conteudo" || fail "arquivo falso .pdf nao foi recusado (codigo $COD)"
run /app/converter_pdf.py /etc/passwd >/dev/null 2>/dev/null; [ "$?" = 3 ] && pass "PDF: arquivo fora de /entrada e recusado (3)" || fail "PDF aceitou arquivo fora de /entrada"

# o contêiner nao consegue gravar na entrada (somente leitura) nem acessar a rede
drun --rm --network none -v "$(hpath "$T")/entrada:/entrada:ro" "$IMG" sh -c 'touch /entrada/x' >/dev/null 2>&1 && fail "a pasta de entrada aceitou escrita" || pass "a pasta de entrada e somente leitura"
drun --rm --network none "$IMG" python -c "import socket; socket.create_connection(('1.1.1.1', 443), timeout=3)" >/dev/null 2>&1 && fail "o contêiner alcancou a internet" || pass "sem internet dentro do contêiner"
[ "$(drun --rm "$IMG" id -u)" != 0 ] && pass "o trabalhador roda sem root" || fail "o trabalhador roda como root"

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
