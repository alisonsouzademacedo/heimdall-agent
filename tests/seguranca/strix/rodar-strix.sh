#!/usr/bin/env sh
# Roda o Strix (docs/strix/) contra uma COPIA do codigo versionado. CUSTA DINHEIRO (chave de API do modelo).
# O Strix monta a pasta-alvo GRAVAVEL no ambiente isolado (docs/strix/usage/cli.md): por isso nunca apontamos para a pasta real.
# Uso:  CONFIRMO_CUSTO=sim STRIX_LLM=openai/gpt-5.4 LLM_API_KEY=... sh tests/seguranca/strix/rodar-strix.sh [quick|standard|deep]
# Variaveis: STRIX_ORCAMENTO_USD (padrao 10) limita o gasto (--max-budget).
RAIZ=$(cd "$(dirname "$0")/../../.." && pwd)
MODO="${1:-standard}"
ORCAMENTO="${STRIX_ORCAMENTO_USD:-10}"

nao() { echo "NAO RODEI: $1" >&2; exit 3; }
case "$MODO" in quick|standard|deep) ;; *) nao "modo invalido: $MODO (use quick, standard ou deep)";; esac
[ "${CONFIRMO_CUSTO:-}" = sim ] || nao "isto gasta dinheiro da sua chave de API. Rode de novo com CONFIRMO_CUSTO=sim"
[ -n "${STRIX_LLM:-}" ] || nao "defina STRIX_LLM (ex.: openai/gpt-5.4)"
[ -n "${LLM_API_KEY:-}" ] || nao "defina LLM_API_KEY (a chave nunca vai para o git)"
command -v strix >/dev/null 2>&1 || nao "o comando strix nao esta instalado (docs/strix/quickstart.md)"
docker info >/dev/null 2>&1 || nao "o Docker nao esta rodando"

TMP=$(mktemp -d) || nao "sem pasta temporaria"
COPIA="$TMP/alvo"
mkdir -p "$COPIA"
# Somente arquivos versionados: nada de data/, .env, bancos ou logins.
(cd "$RAIZ" && git archive HEAD) | tar -x -C "$COPIA" || nao "git archive falhou"

export STRIX_TELEMETRY=0   # docs/strix/advanced/configuration.md: telemetria ligada por padrao
cd "$TMP" || exit 1        # o Strix grava strix_runs/ na pasta atual
strix -n --target "$COPIA" --scan-mode "$MODO" \
  --instruction-file "$RAIZ/tests/seguranca/strix/instrucoes.md" \
  --max-budget "$ORCAMENTO" --fail-on high
STATUS=$?

DEST="$RAIZ/data/seguranca/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST" && [ -d "$TMP/strix_runs" ] && cp -R "$TMP/strix_runs/." "$DEST/"
echo "Resultado do Strix (codigo $STATUS: 0 limpo, 1 erro, 2 achados) em: $DEST (pasta fora do git)"
exit "$STATUS"
