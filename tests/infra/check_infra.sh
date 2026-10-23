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
# No Windows "python3" costuma ser o atalho falso da Loja: usa o primeiro interpretador que RODA de verdade (LICOES.md, 2026-10-19 e 2026-10-20).
PY=""; for c in python3 python py; do if "$c" -c "import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)" >/dev/null 2>&1; then PY="$c"; break; fi; done
[ -n "$PY" ] || { fail "Python 3 nao encontrado (o teste da infra precisa dele)"; PY=false; }
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

# ---- comandos do trabalhador de audio e PDF (apps/media-worker) ----
TR=apps/media-worker/transcrever.py
CP=apps/media-worker/converter_pdf.py
[ -s "$TR" ] && [ -s "$CP" ] && pass "existem transcrever.py e converter_pdf.py" || fail "faltam transcrever.py e/ou converter_pdf.py"
grep -qE '^COPY .*transcrever\.py.*converter_pdf\.py|^COPY .*converter_pdf\.py.*transcrever\.py' "$MW" && pass "a imagem leva os dois comandos" || fail "a imagem nao copia os comandos"
grep -q 'local_files_only=True' "$TR" && pass "transcrever: modelo so do disco (local_files_only=True), nunca da internet" || fail "transcrever pode baixar modelo da internet"
grep -qE "language=['\"]pt['\"]" "$TR" && grep -q 'vad_filter=True' "$TR" && grep -q 'condition_on_previous_text=False' "$TR" && pass "transcrever: portugues, filtro de silencio e sem repeticao em cadeia" || fail "transcrever sem os parametros combinados (language, vad_filter, condition_on_previous_text)"
# Medido em 2026-10-22 (CPU sem AVX, teto de 2 CPUs, 30 s de audio): 1 thread 117 s; 2 threads 73 s; 3 threads 130 s; padrao (4) 128 s. Mais threads que CPUs piora muito:
# cpu_threads do Whisper tem de ser IGUAL ao teto de CPU do trabalhador no Compose (runbook 06).
TH=$(sed -n 's/.*cpu_threads=\([0-9][0-9]*\).*/\1/p' "$TR" | head -1)
CPUS=$(awk '/^  media-worker:/{f=1;next} /^  [a-z]/{f=0} f && /^    cpus:/{gsub(/[^0-9.]/,"",$2); print $2; exit}' "$DC")
{ [ -n "$TH" ] && [ -n "$CPUS" ] && [ "$TH" = "${CPUS%.*}" ]; } && pass "transcrever: cpu_threads=$TH igual ao teto de CPU do trabalhador no Compose (cpus: $CPUS)" || fail "transcrever: cpu_threads ('$TH') nao confere com o cpus do Compose ('$CPUS'); com mais threads que CPUs a transcricao fica ate 1,7x mais lenta"
grep -q 'convert_local' "$CP" && ! grep -qE '\.convert\(' "$CP" && pass "PDF: so convert_local (a forma estreita que o README manda; nunca convert() com URL)" || fail "PDF usa convert() em vez de convert_local()"
grep -q '%PDF-' "$CP" && pass "PDF: confere o cabecalho %PDF- (um arquivo qualquer com nome .pdf nao vira \"texto\")" || fail "PDF: nao confere o cabecalho %PDF-"
grep -q 'enable_plugins=False' "$CP" && pass "PDF: plugins desligados" || fail "PDF com plugins ligados"
grep -q "/entrada/" "$TR" && grep -q "/entrada/" "$CP" && pass "os dois comandos so aceitam arquivos dentro de /entrada" || fail "comando aceita caminho fora de /entrada"
! grep -qE '^import (requests|urllib|http|socket)|^from (requests|urllib|http|socket)' "$TR" "$CP" && pass "os comandos nao importam bibliotecas de rede" || fail "comando importa biblioteca de rede"

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
# O Hermes so liga o MCP do Hindsight na partida; se o Hindsight ainda estiver carregando o modelo, o servidor MCP fica "estacionado" e nao volta (descoberto no smoke_hermes.sh, 2026-10-20).
"$PY" -I - "$DC" <<'PY' && pass "o Hermes espera o Hindsight ficar SAUDAVEL (healthcheck + depends_on service_healthy)" || fail "o Hermes nao espera o Hindsight ficar saudavel (o MCP da memoria fica estacionado)"
import re, sys
t = open(sys.argv[1], encoding='utf-8').read()
def bloco(nome):
    m = re.search(r'^  %s:\n(.*?)(?=^  \S|\Z)' % nome, t, re.S | re.M)
    return m.group(1) if m else ''
h, r = bloco('hindsight'), bloco('hermes')
ok = 'healthcheck:' in h and '/health' in h and re.search(r'depends_on:\s*\n\s+hindsight:\s*\n\s+condition:\s*service_healthy', r) is not None
sys.exit(0 if ok else 1)
PY
# Os 3 servicos de estado precisam de tempo para fechar limpo: com os 10 s padrao do Compose, Hindsight e Hermes sairam com codigo 137 (morte forcada) em 2026-10-21.
"$PY" -I - "$DC" <<'PY' && pass "postgres, hindsight e hermes tem stop_grace_period de pelo menos 30 s (parada limpa, sem codigo 137)" || fail "algum servico de estado (postgres/hindsight/hermes) sem stop_grace_period >= 30s"
import re, sys
t = open(sys.argv[1], encoding='utf-8').read()
def seg(v):
    m = re.fullmatch(r'(\d+)(s|m)', v.strip())
    return int(m.group(1)) * (60 if m.group(2) == 'm' else 1) if m else 0
ok = True
for nome in ('postgres', 'hindsight', 'hermes'):
    m = re.search(r'^  %s:\n(.*?)(?=^  \S|\Z)' % nome, t, re.S | re.M)
    g = re.search(r'^    stop_grace_period:\s*(\S+)', m.group(1) if m else '', re.M)
    ok = ok and g is not None and seg(g.group(1)) >= 30
sys.exit(0 if ok else 1)
PY
grep -qE 'hermes-data:/opt/data' "$DC" && grep -qE '^volumes:' "$DC" && grep -qE '^\s+hermes-data:' "$DC" && pass "estado do Hermes em volume NOMEADO (nao pasta do Windows: corrompe o state.db)" || fail "estado do Hermes nao esta em volume nomeado"
grep -qE 'pg_data:/var/lib/postgresql/18/docker' "$DC" && pass "Postgres 18 em volume nomeado, no caminho da receita oficial" || fail "Postgres fora do volume nomeado da receita"
grep -qE 'internal:\s*true' "$DC" && pass "existe uma rede interna (sem internet) para o trabalhador de audio" || fail "sem rede interna"
grep -qE 'profiles:' "$DC" && pass "o trabalhador de audio so roda sob demanda (profile), um audio por vez" || fail "trabalhador de audio sobe sozinho"
grep -q 'ENV_EXEMPLO_SEM_SEGREDO' "$ENVX" && pass "modelo.env so traz valores de mentira" || fail "modelo.env sem a marca de valores de mentira"

# ---- Git Bash no Windows converte /app/... em C:/Program Files/Git/app/... antes de o Docker ver (LICOES.md, 2026-10-20) ----
# Por isso os smokes nunca chamam "docker run" solto: usam drun (sem conversao de caminho) e hpath (caminho nativo das pastas do computador).
SOLTO=$(grep -nE '^[^#]*\bdocker run\b' tests/infra/smoke_*.sh | grep -v 'drun()' | grep -v '^\s*#')
[ -z "$SOLTO" ] && pass "os smokes nao chamam docker run solto (usam drun/hpath, que funcionam no Git Bash do Windows)" || { fail "docker run solto nos smokes (no Windows o Git Bash estraga os caminhos): use drun e hpath de tests/infra/lib_docker.sh"; echo "$SOLTO" | cut -c1-140; }
grep -q '^drun()' tests/infra/lib_docker.sh && grep -q '^hpath()' tests/infra/lib_docker.sh && pass "lib_docker.sh define drun e hpath" || fail "lib_docker.sh sem drun/hpath"
# ---- Krayin (CRM, passo 4 da migracao para a VPS; runbook 04): imagem por digest, MySQL proprio, so 127.0.0.1, sem e-mail ----
KR=infra/krayin/Dockerfile
[ -s "$KR" ] && pass "existe $KR (imagem do Krayin com o pacote da API)" || fail "falta $KR"
grep -qE '^FROM webkul/krayin:2\.2\.0@sha256:5a5e6e86bdede8ecd72db7805c4a471c9111513efae95de3e8c80a7bb0e517b9$' "$KR" 2>/dev/null && pass "Krayin 2.2.0 preso pelo digest da imagem (a tag sozinha pode mudar)" || fail "Krayin nao esta preso por tag E digest"
grep -qE 'composer require .*krayin/rest-api:[0-9]+\.[0-9]+\.[0-9]+' "$KR" 2>/dev/null && pass "pacote krayin/rest-api com versao exata" || fail "krayin/rest-api sem versao exata"
grep -qE '^\s+krayin:' "$DC" && grep -qE '^\s+krayin-mysql:' "$DC" && pass "Compose tem krayin e krayin-mysql (MySQL proprio, nao o interno da imagem)" || fail "faltam os servicos krayin e krayin-mysql"
grep -qE '127\.0\.0\.1:8082:80' "$DC" && pass "Krayin publicado so em 127.0.0.1:8082" || fail "Krayin fora de 127.0.0.1:8082"
grep -qE 'image:\s*mysql:8\.0\.[0-9]+\s*$' "$DC" && pass "MySQL com versao exata (8.0.x, minimo exigido pelo Krayin: 8.0.32)" || fail "MySQL sem versao exata 8.0.x"
grep -qiE 'phpmyadmin' "$DC" "$ENVX" && fail "phpMyAdmin no Compose (nao deve existir)" || pass "sem phpMyAdmin"
for v in KRAYIN_DB_PASSWORD KRAYIN_DB_ROOT_PASSWORD KRAYIN_APP_KEY; do grep -qE "\\$\{$v:\?" "$DC" && pass "$v obrigatoria (sem valor padrao)" || fail "$v nao e obrigatoria no Compose"; done
grep -qE 'MAIL_MAILER:\s*"?log"?' "$DC" && pass "Krayin com MAIL_MAILER=log (nenhum e-mail sai: regra 1)" || fail "Krayin sem MAIL_MAILER=log"
grep -qiE 'MAIL_MAILER:\s*"?smtp|MAIL_HOST|SENDGRID|MAILGUN|SES_' "$DC" "$ENVX" && fail "Krayin com configuracao de envio de e-mail" || pass "nenhuma configuracao de envio de e-mail no Compose"
grep -qE 'APP_URL:\s*http://127\.0\.0\.1:8082' "$DC" && pass "APP_URL do Krayin aponta para o tunel (127.0.0.1:8082)" || fail "APP_URL do Krayin nao e http://127.0.0.1:8082"
KI=infra/krayin/instalar.sh
[ -s "$KI" ] && sh -n "$KI" 2>/dev/null && pass "infra/krayin/instalar.sh existe e tem sintaxe valida" || fail "falta infra/krayin/instalar.sh ou a sintaxe esta errada"
grep -qE 'admin123' "$KI" 2>/dev/null && grep -qE 'Hash::check' "$KI" && pass "instalar.sh troca a senha padrao admin123 e so se ela ainda for a padrao (nao desfaz troca do dono)" || fail "instalar.sh nao trata a senha padrao admin123 com Hash::check"
grep -qE 'echo[^|]*\$\{?[A-Za-z_]*(PASSWORD|SENHA|APP_KEY)' "$KI" 2>/dev/null && fail "instalar.sh imprime senha ou chave" || pass "instalar.sh nao imprime senha nem chave"
grep -qE 'krayin-rest-api:install' "$KR" 2>/dev/null && pass "o pacote da API e configurado na construcao da imagem (sobrevive a down/up)" || fail "krayin-rest-api:install nao roda na construcao da imagem"
KG=infra/krayin/gerar-token.sh
[ -s "$KG" ] && sh -n "$KG" 2>/dev/null && pass "infra/krayin/gerar-token.sh existe e tem sintaxe valida" || fail "falta infra/krayin/gerar-token.sh"
grep -q 'salvarConfigCrm' "$KG" 2>/dev/null && grep -q '/api/v1/login' "$KG" && pass "gerar-token.sh usa o login real (/api/v1) e grava data/krayin.json pelo codigo do projeto (modo 0600)" || fail "gerar-token.sh nao usa /api/v1/login e salvarConfigCrm"
grep -qE 'echo[^|]*\$\{?[A-Za-z_]*(TOKEN|PASSWORD|SENHA)|node[^|]*\$\{?[A-Za-z_]*TOKEN|printf[^|]*\$\{?[A-Za-z_]*TOKEN' "$KG" 2>/dev/null && fail "gerar-token.sh imprime ou passa o token por argumento" || pass "gerar-token.sh nao imprime o token nem o passa por argumento"
# Armadilha medida em 2026-10-22: o entrypoint.sh da imagem do Krayin aplica APP_TIMEZONE com sed "s/.../.../"; "America/Sao_Paulo" tem barra e quebra o sed (o contêiner reinicia em laco).
grep -qE '^\s+APP_TIMEZONE:' "$DC" && fail "APP_TIMEZONE no Compose do Krayin (valor com barra quebra o entrypoint da imagem; runbook 04, Armadilhas)" || pass "sem APP_TIMEZONE no Compose do Krayin (o sed do entrypoint nao aceita valor com barra)"
python3 -I - "$DC" <<'PY' && pass "krayin-mysql nao publica porta e esta so numa rede interna; volume do banco nomeado" || fail "krayin-mysql exposto, fora de rede interna ou sem volume nomeado"
import re, sys
t = open(sys.argv[1], encoding='utf-8').read()
m = re.search(r'^  krayin-mysql:\n(.*?)(?=^  \S|^\S|\Z)', t, re.S | re.M)
b = m.group(1) if m else ''
ok = bool(b) and 'ports:' not in b and 'krayin_db' in b and re.search(r'krayin_mysql_data:/var/lib/mysql', b)
sys.exit(0 if ok else 1)
PY

# ---- Compose: o proprio Docker valida (portas, interpolacao, redes) ----
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  CFG=$(docker compose --env-file "$ENVX" -f "$DC" --profile trabalho config --format json 2>/tmp/heimdall-compose-erro.txt)
  if [ -n "$CFG" ]; then
    pass "docker compose config aceita o arquivo"
    echo "$CFG" | "$PY" -I -c "
import sys, json
c = json.load(sys.stdin); bad = []
for nome, s in c['services'].items():
    for p in s.get('ports', []) or []:
        if p.get('host_ip') != '127.0.0.1': bad.append(nome + ':' + str(p.get('published')) + ' fora do 127.0.0.1')
    if nome == 'media-worker' and s.get('ports'): bad.append('media-worker publica porta')
    for v in s.get('volumes', []) or []:
        if v.get('type') == 'bind' and nome != 'media-worker': bad.append(nome + ' monta pasta do computador: ' + str(v.get('source')))
    if not (s.get('mem_limit') or s.get('deploy', {}).get('resources', {}).get('limits', {}).get('memory')): bad.append(nome + ' sem limite de memoria')
    if not (s.get('cpus') or s.get('deploy', {}).get('resources', {}).get('limits', {}).get('cpus')): bad.append(nome + ' sem teto de CPU (servidor compartilhado com sites de clientes)')
if bad: print('\n'.join(bad))
" > /tmp/heimdall-compose-regras.txt
    if [ -s /tmp/heimdall-compose-regras.txt ]; then fail "regras do Compose violadas:"; cat /tmp/heimdall-compose-regras.txt; else pass "portas so em 127.0.0.1; sem pasta do computador (exceto a entrada do audio); todo servico com limite de memoria"; fi
    echo "$CFG" | "$PY" -I -c "
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
