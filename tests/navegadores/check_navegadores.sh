#!/usr/bin/env sh
# Tela de configuracao em varios navegadores (Chromium, Firefox, WebKit e Edge/Chrome ja instalados). Playwright e FERRAMENTA DE TESTE externa
# (nao entra no package.json; registrada em docs/plano/PROGRESS.md). Sem ele, ou sem navegador, o teste diz NAO EXECUTADO (REQUIRE_NAVEGADOR=1 conta como falha).
# Uso: sh tests/navegadores/check_navegadores.sh
cd "$(dirname "$0")/../.." || exit 2
if [ -z "$PLAYWRIGHT_MODULE" ]; then
  R=$(npm root -g 2>/dev/null); [ -n "$R" ] && [ -d "$R/playwright" ] && PLAYWRIGHT_MODULE="$R/playwright"
fi
if [ -z "$PLAYWRIGHT_MODULE" ] || [ ! -d "$PLAYWRIGHT_MODULE" ]; then
  echo "  [NAO EXECUTADO] Playwright nao encontrado (instale: npm i -g playwright@1.56.1, ou defina PLAYWRIGHT_MODULE)"
  [ "${REQUIRE_NAVEGADOR:-0}" = 1 ] && { echo "RESULTADO: falhou (REQUIRE_NAVEGADOR=1)"; exit 1; }
  exit 0
fi
export PLAYWRIGHT_MODULE
node tests/navegadores/tela.mjs; C=$?
[ "$C" -eq 0 ] && echo "RESULTADO: tudo passou (ou nao executado)" || echo "RESULTADO: falhou"
exit $C
