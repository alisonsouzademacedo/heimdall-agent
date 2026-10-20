#!/usr/bin/env sh
# Imagens e Compose do Heimdall (infra/ e apps/media-worker/): versoes FIXAS, portas so em 127.0.0.1, volumes nomeados, sem caminho de envio.
# Origem das receitas: runbooks 02, 03 e 06 (medido em 2026-10-20). Testes ESTATICOS sempre; a validacao do Compose pelo "docker compose config" roda
# quando o Docker existe (REQUIRE_DOCKER=1 faz a falta contar como falha). Construir as imagens e subir os servicos e um teste a parte: tests/infra/smoke_docker.sh.
# Uso: sh tests/infra/check_infra.sh
cd "$(dirname "$0")/../.." || exit 2
FAIL=0
pass() { echo "  [PASSOU] $1"; }
fail() { echo "  [FALHOU] $1"; FAIL=$((FAIL+1)); }

HS=infra/hindsight/Dockerfile
MW=apps/media-worker/Dockerfile
REQ=apps/media-worker/requirements.txt
DC=infra/compose/docker-compose.yml
ENVX=infra/compose/modelo.env
for f in "$HS" "$MW" "$REQ" "$DC" "$ENVX"; do [ -s "$f" ] && pass "existe $f" || fail "falta $f"; done
[ "$FAIL" -eq 0 ] || { echo "RESULTADO: $FAIL falha(s)"; exit 1; }

# ---- versoes fixas: nada de latest/stable/main, nada sem tag ----
FLUTUA=$(grep -hE '^\s*(FROM|image:)' "$HS" "$MW" "$DC" | grep -E ':(latest|stable|main)\b|^FROM [^:@ ]+( |$)' )
[ -z "$FLUTUA" ] && pass "nenhuma imagem com tag flutuante (latest/stable/main) ou sem tag" || { fail "imagem com versao flutuante:"; echo "$FLUTUA"; }
grep -qE '^FROM ghcr\.io/vectorize-io/hindsight:1\.0\.0-slim$' "$HS" && pass "Hindsight parte da imagem slim 1.0.0" || fail "Hindsight nao parte de ghcr.io/vectorize-io/hindsight:1.0.0-slim"
grep -qF "hindsight-api-slim[local-onnx]==1.0.0" "$HS" && pass "Hindsight instala o extra local-onnx na mesma versao (sem ele o provedor onnx nao sobe: runbook 02)" || fail "falta hindsight-api-slim[local-onnx]==1.0.0"
grep -qE 'transformers==5\.15\.1' "$HS" && grep -qE 'safetensors==0\.8\.0' "$HS" && pass "transformers e safetensors fixados nas versoes medidas (transformers mais novo quebra com tokenizers)" || fail "transformers/safetensors nao fixados"
LAST_USER=$(grep -E '^USER ' "$HS" | tail -1)
[ "$LAST_USER" = "USER hindsight" ] && pass "a imagem do Hindsight termina como usuario nao-root (hindsight)" || fail "a imagem do Hindsight nao volta ao usuario hindsight ($LAST_USER)"
grep -qE '^FROM python:3\.12-slim' "$MW" && pass "trabalhador de audio parte de python:3.12-slim" || fail "trabalhador de audio nao parte de python:3.12-slim"

# ---- trabalhador de audio: av fixo (faster-whisper 1.2.1 quebra com av 19; runbook 06) ----
SOLTAS=$(grep -vE '^\s*(#|$)' "$REQ" | grep -vE '^[A-Za-z0-9_.-]+(\[[A-Za-z0-9_,.-]+\])?==[A-Za-z0-9_.+!-]+$')
[ -z "$SOLTAS" ] && pass "requirements.txt: toda dependencia com versao exata (==)" || { fail "dependencia sem versao exata:"; echo "$SOLTAS" | head -3; }
grep -qE '^av==16\.1\.0$' "$REQ" && pass "av fixado em 16.1.0 (o mais novo, 19.x, quebra a transcricao)" || fail "av nao fixado em 16.1.0"
grep -qE '^faster-whisper==1\.2\.1$' "$REQ" && pass "faster-whisper fixado em 1.2.1" || fail "faster-whisper nao fixado em 1.2.1"
grep -qiE '^markitdown(\[[a-z,]+\])?==' "$REQ" && pass "markitdown fixado" || fail "markitdown nao fixado"
grep -qE 'pip install .*-r +requirements\.txt|pip install .*--requirement' "$MW" && pass "a imagem instala SO pelo requirements.txt" || fail "a imagem nao instala pelo requirements.txt"
grep -qE 'download_model' "$MW" && pass "o modelo do Whisper e baixado na construcao da imagem (a rede interna nao tera internet)" || fail "modelo do Whisper nao embutido na imagem"
grep -qE '^USER ' "$MW" && ! grep -E '^USER ' "$MW" | tail -1 | grep -qE 'root' && pass "trabalhador de audio roda sem root" || fail "trabalhador de audio roda como root"

# ---- Compose: leitura do arquivo ----
grep -qE '^\s*privileged:\s*true' "$DC" && fail "container privilegiado" || pass "nenhum container privilegiado"
grep -qE 'network_mode:\s*host' "$DC" && fail "network_mode: host" || pass "nenhum network_mode: host"
grep -qE 'docker\.sock' "$DC" && fail "o Compose monta o docker.sock (controle total da maquina)" || pass "o Compose nao monta o docker.sock"
grep -qiE 'WHATSAPP|TELEGRAM|DISCORD|SLACK|SIGNAL_|MATRIX_|SMS' "$DC" "$ENVX" && fail "o Compose/ambiente configura plataforma de mensagens (regra 1: o Hermes nao tem caminho de envio)" || pass "nenhuma plataforma de mensagens configurada (regra 1)"
grep -qE 'API_SERVER_KEY:\s*\$\{API_SERVER_KEY:\?' "$DC" && pass "API_SERVER_KEY obrigatoria (sem valor padrao)" || fail "API_SERVER_KEY nao e obrigatoria"
grep -qE 'POSTGRES_PASSWORD:\s*\$\{[A-Z_]+:\?' "$DC" && pass "senha do Postgres obrigatoria (sem valor padrao)" || fail "senha do Postgres com valor padrao"
grep -qE 'HINDSIGHT_API_EMBEDDINGS_PROVIDER:\s*onnx' "$DC" && grep -qE 'HINDSIGHT_API_EMBEDDINGS_ONNX_MODEL_ID:\s*intfloat/multilingual-e5-small' "$DC" && pass "Hindsight com embeddings multilingue (nao o padrao em ingles)" || fail "Hindsight sem embeddings multilingue"
grep -qE 'HINDSIGHT_API_TEXT_SEARCH_EXTENSION_NATIVE_LANGUAGE:\s*portuguese' "$DC" && pass "busca por palavras com o dicionario portuguese" || fail "busca por palavras sem o dicionario portuguese (padrao: english)"
grep -qE 'HINDSIGHT_API_RERANKER_PROVIDER:\s*rrf' "$DC" && pass "reranker rrf (sem modelo; qualidade em portugues nao medida)" || fail "reranker nao e rrf"
grep -qE 'HINDSIGHT_API_LLM_PROVIDER:\s*\$\{HINDSIGHT_API_LLM_PROVIDER:\?' "$DC" && pass "provedor de LLM do Hindsight sempre explicito (nao fica 'none' por esquecimento)" || fail "provedor de LLM do Hindsight nao e obrigatorio"
grep -qE 'API_SERVER_ENABLED:\s*"?true' "$DC" && grep -qE 'command:\s*gateway run' "$DC" && pass "Hermes com gateway run e API ligada" || fail "Hermes sem gateway run/API"
grep -qE 'hermes-data:/opt/data' "$DC" && grep -qE '^volumes:' "$DC" && grep -qE '^\s+hermes-data:' "$DC" && pass "estado do Hermes em volume NOMEADO (nao pasta do Windows: corrompe o state.db)" || fail "estado do Hermes nao esta em volume nomeado"
grep -qE 'pg_data:/var/lib/postgresql/18/docker' "$DC" && pass "Postgres 18 em volume nomeado, no caminho da receita oficial" || fail "Postgres fora do volume nomeado da receita"
grep -qE 'internal:\s*true' "$DC" && pass "existe uma rede interna (sem internet) para o trabalhador de audio" || fail "sem rede interna"
grep -qE 'profiles:' "$DC" && pass "o trabalhador de audio so roda sob demanda (profile), um audio por vez" || fail "trabalhador de audio sobe sozinho"
grep -q 'ENV_EXEMPLO_SEM_SEGREDO' "$ENVX" && pass "modelo.env so traz valores de mentira" || fail "modelo.env sem a marca de valores de mentira"

# ---- Compose: o proprio Docker valida (portas, interpolacao, redes) ----
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  CFG=$(docker compose --env-file "$ENVX" -f "$DC" --profile trabalho config --format json 2>/tmp/heimdall-compose-erro.txt)
  if [ -n "$CFG" ]; then
    pass "docker compose config aceita o arquivo"
    echo "$CFG" | python3 -I -c "
import sys, json
c = json.load(sys.stdin); bad = []
for nome, s in c['services'].items():
    for p in s.get('ports', []) or []:
        if p.get('host_ip') != '127.0.0.1': bad.append(nome + ':' + str(p.get('published')) + ' fora do 127.0.0.1')
    if nome == 'media-worker' and s.get('ports'): bad.append('media-worker publica porta')
    for v in s.get('volumes', []) or []:
        if v.get('type') == 'bind' and nome != 'media-worker': bad.append(nome + ' monta pasta do computador: ' + str(v.get('source')))
    if not (s.get('mem_limit') or s.get('deploy', {}).get('resources', {}).get('limits', {}).get('memory')): bad.append(nome + ' sem limite de memoria')
if bad: print('\n'.join(bad))
" > /tmp/heimdall-compose-regras.txt
    if [ -s /tmp/heimdall-compose-regras.txt ]; then fail "regras do Compose violadas:"; cat /tmp/heimdall-compose-regras.txt; else pass "portas so em 127.0.0.1; sem pasta do computador (exceto a entrada do audio); todo servico com limite de memoria"; fi
    echo "$CFG" | python3 -I -c "
import sys, json
c = json.load(sys.stdin)
ok = c['networks'].get('isolada', {}).get('internal') is True and list(c['services']['media-worker']['networks']) == ['isolada']
sys.exit(0 if ok else 1)" && pass "o trabalhador de audio so esta na rede 'isolada' (internal: true)" || fail "o trabalhador de audio nao esta so na rede interna"
  else fail "docker compose config recusou o arquivo:"; head -5 /tmp/heimdall-compose-erro.txt; fi
else
  echo "  [NAO EXECUTADO] docker compose config: Docker nao encontrado"; [ "${REQUIRE_DOCKER:-0}" = 1 ] && FAIL=$((FAIL+1))
fi

[ "$FAIL" -eq 0 ] && echo "RESULTADO: tudo passou" || echo "RESULTADO: $FAIL falha(s)"
[ "$FAIL" -eq 0 ]
