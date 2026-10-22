#!/usr/bin/env sh
# Prepara o Krayin do Heimdall (runbooks/04-krayin.md). Pode rodar de novo sem estragar nada:
#  1) cria as tabelas e os dados basicos SO se o banco estiver vazio (o instalador oficial usa migrate:fresh, que APAGA tudo);
#  2) troca a senha padrao admin123 pelo valor de KRAYIN_ADMIN_PASSWORD, SO se ela ainda for a padrao (nao desfaz troca feita pelo dono).
# Segredos vem do .env (fora do git); este script nunca os imprime.
# Uso: sh infra/krayin/instalar.sh
set -eu
cd "$(dirname "$0")/../compose"
[ -f .env ] || { echo "falta infra/compose/.env (modelo: modelo.env)"; exit 2; }
DC="docker compose --env-file .env -f docker-compose.yml"
ADMIN_EMAIL=$(sed -n 's/^KRAYIN_ADMIN_EMAIL=//p' .env)
ADMIN_PASSWORD=$(sed -n 's/^KRAYIN_ADMIN_PASSWORD=//p' .env)
[ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ] || { echo "defina KRAYIN_ADMIN_EMAIL e KRAYIN_ADMIN_PASSWORD no .env"; exit 2; }

TEM_TABELAS=$($DC exec -T krayin php -r 'require "/var/www/laravel-crm/vendor/autoload.php"; $app = require "/var/www/laravel-crm/bootstrap/app.php"; $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo Illuminate\Support\Facades\Schema::hasTable("users") ? "sim" : "nao";')
if [ "$TEM_TABELAS" = "nao" ]; then
  echo "Banco vazio: instalando o Krayin (tabelas e dados basicos)..."
  $DC exec -T krayin php artisan krayin-crm:install --skip-env-check --skip-admin-creation --no-interaction >/dev/null
else
  echo "Banco ja instalado: nada a recriar."
fi

# Admin: a senha vai por variavel de ambiente do comando, nunca por argumento nem eco.
$DC exec -T -e ADM_EMAIL="$ADMIN_EMAIL" -e ADM_SENHA="$ADMIN_PASSWORD" krayin php -r '
require "/var/www/laravel-crm/vendor/autoload.php";
$app = require "/var/www/laravel-crm/bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB; use Illuminate\Support\Facades\Hash;
$u = DB::table("users")->where("id", 1)->first();
if ($u && Hash::check("admin123", $u->password)) {
  DB::table("users")->where("id", 1)->update(["email" => getenv("ADM_EMAIL"), "name" => "Dono", "password" => Hash::make(getenv("ADM_SENHA"))]);
  echo "Senha padrao trocada pela do .env.\n";
} else { echo "Senha padrao ja foi trocada: mantida.\n"; }'
