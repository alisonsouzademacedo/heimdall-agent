#!/usr/bin/env sh
# Gera o token da API do Krayin e grava data/krayin.json (modo 0600), sem mostrar o token. Uso: sh infra/krayin/gerar-token.sh
# ATENCAO: cada login no Krayin REVOGA os tokens anteriores (README do pacote rest-api). Rode so quando precisar de um token novo.
# Os dados de acesso vem de infra/compose/.env (fora do git). O token passa por variavel de ambiente, nunca por argumento.
set -eu
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
cd "$RAIZ"
ENVF=infra/compose/.env
[ -f "$ENVF" ] || { echo "falta infra/compose/.env"; exit 2; }
EMAIL=$(sed -n 's/^KRAYIN_ADMIN_EMAIL=//p' "$ENVF")
SENHA=$(sed -n 's/^KRAYIN_ADMIN_PASSWORD=//p' "$ENVF")
URL=${KRAYIN_URL:-http://127.0.0.1:8082}
CORPO=$(EMAIL="$EMAIL" SENHA="$SENHA" node -e 'process.stdout.write(JSON.stringify({email:process.env.EMAIL,password:process.env.SENHA,device_name:"heimdall"}))')
RESP=$(curl -s -m 15 -X POST "$URL/api/v1/login" -H 'Accept: application/json' -H 'Content-Type: application/json' -d "$CORPO") || { echo "Krayin nao respondeu em $URL"; exit 1; }
KRAYIN_TOKEN=$(printf '%s' "$RESP" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).token||"")}catch{}})')
[ -n "$KRAYIN_TOKEN" ] || { echo "Login recusado pelo Krayin (confira KRAYIN_ADMIN_* no .env; se voce trocou a senha na tela, use a nova)."; exit 1; }
export KRAYIN_TOKEN KRAYIN_URL_CONF="$URL"
node --input-type=module -e 'import { salvarConfigCrm } from "./apps/core/src/crm/config.ts"; salvarConfigCrm(process.cwd(), { url: process.env.KRAYIN_URL_CONF, token: process.env.KRAYIN_TOKEN }); console.log("Token gravado em data/krayin.json (modo 0600). Os tokens anteriores foram revogados.");' 2>&1 | grep -v -E 'ExperimentalWarning|trace-warnings'
