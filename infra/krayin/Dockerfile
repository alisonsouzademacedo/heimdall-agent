# Krayin CRM 2.2.0 + pacote da API REST (runbooks/04-krayin.md). Imagem base presa pelo DIGEST (a tag 2.2.0 sozinha poderia mudar).
# O banco de dados NAO e o que vem dentro da imagem (senha padrao "krayin"): o Compose aponta DB_HOST para o MySQL proprio do Heimdall,
# o que desliga o MySQL interno (entrypoint.sh da imagem). O pacote krayin/rest-api e instalado AQUI, na construcao, para sobreviver a "docker compose down/up".
# Divergencia registrada: o README do pacote pede Krayin v2.2.6; a imagem publicada mais nova e a 2.2.0 (conferido no Docker Hub em 2026-10-22).
FROM webkul/krayin:2.2.0@sha256:5a5e6e86bdede8ecd72db7805c4a471c9111513efae95de3e8c80a7bb0e517b9
WORKDIR /var/www/laravel-crm
RUN composer require krayin/rest-api:2.2.0 --no-interaction --no-progress \
 && php artisan krayin-rest-api:install \
 && chown -R www-data:www-data /var/www/laravel-crm/vendor /var/www/laravel-crm/storage /var/www/laravel-crm/bootstrap/cache /var/www/laravel-crm/config
