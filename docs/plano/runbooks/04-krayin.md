# 4. Krayin CRM

Fontes: `docs/krayin/devdocs/2.2/introduction/{requirements,installation}.md`, `docs/krayin/rest-api/README.md`, `docs/krayin/rest-api/routes/lead-routes.php`, `docs/krayin/rest-api/controllers/Lead_LeadController.php`, `docs/krayin/user-guide/2.x/settings/{pipeline,webhooks}.md`, `docs/krayin/devdocs/llms-full.txt`.

## Requisitos
PHP 8.3+, Composer 2.5+, Apache 2 ou NGINX (com PHP-FPM, recomendado), **3 GB de RAM** (página `requirements.md`). Versões de banco: MySQL 8.0.32 ou superior e MariaDB 11.4 LTS ou superior (informação da página do repositório no GitHub, que **não está salva** em `docs/`; conferir na instalação). O pacote da API exige **Krayin v2.2.6** (README do `rest-api`).

## Duas formas via Docker (de `installation.md`)
1. **Imagem do Docker Hub** `webkul/krayin`: `docker pull webkul/krayin:latest` e `docker run -d -p 80:80 --name krayin-container webkul/krayin:latest` (para outra porta: `-p 8082:80`). A documentação a descreve como ambiente rápido e **descartável**. Adaptar a porta para `127.0.0.1:8082:80`.
2. **Repositório Docker no GitHub** com Compose (Apache/PHP, MySQL 8.0, phpMyAdmin) e `sh setup.sh`. O exemplo da página usa **MySQL root/root**, publica **3306** e **phpMyAdmin 8080**. **Não copiar assim**: trocar as senhas, não publicar MySQL nem phpMyAdmin, ou publicá-los só em `127.0.0.1`.
Preferência para o Heimdall: forma 2, com volumes nomeados para aplicação e banco **[validar]** se a forma 1 persiste dados sem Compose.

## Credenciais padrão (trocar na primeira entrada)
`admin@example.com` / `admin123`. Trocar logo após instalar.

## API REST (pacote separado)
Dentro da aplicação Krayin: `composer require krayin/rest-api`; no `.env`: `SANCTUM_STATEFUL_DOMAINS="${APP_URL}"` e `L5_SWAGGER_UI_PERSIST_AUTHORIZATION=true`; depois `php artisan krayin-rest-api:install`. Documentação Swagger em `/public/api/admin/documentation` (ou `.../api/admin/documentation`). Login: `POST /api/admin/login` devolve token; enviar `Authorization: Bearer <token>`.
**Inconsistência a resolver:** o portal fala em `/api/admin/leads`; o README do pacote fala em `/api/v1`; as rotas do código usam o prefixo `leads` dentro do grupo V1. **[validar]** o caminho real executando e lendo o Swagger.

## Funil
Configurações → Pipeline → Criar. Campos: nome, "dias para apodrecer" (*rotten days*), padrão, etapas. Criar as 5 etapas do usuário; as de **ganho** e **perda** devem ter os códigos `won` e `lost` (o código da API grava `closed_at` nessas etapas). Remover ou desativar o funil padrão do Krayin. Mover etapa: `PUT leads/stage/edit/{id}` com `lead_pipeline_stage_id`.

## Motivo de perda
Não é campo nativo documentado. Testar atributo personalizado do lead (Configurações → Atributos), tag ou nota em atividade. **[validar]**

## Webhooks
Configurações → Webhooks: URL, cabeçalhos, corpo (JSON), tipo de entidade (lead, pessoa, organização, produto, cotação, armazém). Usar para o `core` saber quando o usuário move um cartão à mão.

## Verificação
Abrir a tela de leads em modo Kanban; `POST /api/.../login` e `GET .../leads`; criar, mover e remover um lead de teste.

## Armadilhas
- Senhas e portas de exemplo são inseguras (R6, R1).
- `setup.sh` é um script de shell: rodar no host Linux (o projeto não tem mais camada Windows).
- Versão do pacote da API precisa casar com a do Krayin.
- Propostas `C1`–`C5` de um dia vencem no relatório diário seguinte, mesmo quando ele não traz proposta nova; resposta antiga do dono não vale para a leva nova.

## Desfazer
Parar e remover os contêineres; remover o volume do banco apaga os dados.

## Não verificado
Persistência da imagem única; caminho real da API; campo de motivo de perda; consumo de memória.


## Executado na VPS Linux (2026-10-22) — o que vale daqui para frente
**No repositório:** `infra/krayin/Dockerfile` (imagem `webkul/krayin:2.2.0` presa pelo digest `sha256:5a5e6e86bdede8ecd72db7805c4a471c9111513efae95de3e8c80a7bb0e517b9` + `composer require krayin/rest-api:2.2.0` + `krayin-rest-api:install` na construção), `infra/krayin/instalar.sh` (tabelas só se o banco estiver vazio; troca a senha padrão `admin123` só se ainda for a padrão) e os serviços `krayin` e `krayin-mysql` em `infra/compose/docker-compose.yml`. Senhas e `APP_KEY` em `infra/compose/.env` (fora do git; modelo em `modelo.env`). Testes: `tests/infra/check_infra.sh`.
**Como sobe:** `docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml up -d --build krayin` e depois `sh infra/krayin/instalar.sh`. Acesso: só `127.0.0.1:8082` (túnel SSH); o MySQL não publica porta e fica numa rede `internal`.
**Memória medida (parado):** Krayin ~96 MB, MySQL ~131 MB (limites 768 MB e 640 MB; MySQL com `performance_schema` desligado e buffer de 128 MB).
**Verificado na prática (não só na documentação):**
- **Caminho da API = `/api/v1`** (não `/api/admin`): `POST /api/v1/login`, `GET /api/v1/settings/pipelines`, `POST /api/v1/leads`, `PUT /api/v1/leads/stage/edit/{id}`, `PUT /api/v1/leads/{id}`, `DELETE /api/v1/leads/{id}`. Resolve a divergência da lista "só a prática responde".
- **Motivo de perda É nativo** (`lost_reason`, texto livre): grava-se com `PUT /api/v1/leads/{id}` junto com `status: 0`, ou com `PUT /api/v1/leads/attributes/edit/{id}`. **A rota de mover etapa ignora o `lost_reason`.** Mover para etapa `won`/`lost` grava `closed_at`; `status` continua 1 (só muda no `PUT` do lead).
- Persistência: um lead sobreviveu a `docker compose restart` e a `up -d --force-recreate` (banco no volume `krayin_mysql_data`).
- Pacote da API 2.2.0 funcionou com o Krayin 2.2.0, embora o README do pacote peça "Krayin v2.2.6" (não existe imagem 2.2.6 no Docker Hub; a mais nova é 2.2.0).
**Armadilhas (medidas):**
1. **`APP_TIMEZONE=America/Sao_Paulo` derruba a imagem:** o `entrypoint.sh` aplica com `sed s/.../.../` e a barra quebra (`unknown option to s`), em laço de reinício. Não definir `APP_TIMEZONE` (teste em `check_infra.sh`).
2. **O banco que vem dentro da imagem tem senha padrão `krayin` e o `APP_KEY` é fixo da imagem.** `DB_HOST` diferente de `127.0.0.1` desliga o MySQL interno; `APP_KEY` vem do `.env`.
3. **O instalador oficial usa `migrate:fresh` (APAGA tudo):** nunca rodar `krayin-crm:install` num banco com dados; o `instalar.sh` confere antes.
4. **O instalador cria o usuário `admin@example.com` / `admin123` e o funil "Default Pipeline"** (etapas `new`, `follow-up`, `prospect`, `negotiation`, `won`, `lost`). O `instalar.sh` troca a senha; o funil das 5 etapas do dono é criado por ele na tela.
5. **Cada `POST /api/v1/login` revoga os tokens anteriores do usuário** (README do pacote). O Heimdall deve guardar um token e **não** fazer login a cada chamada; um login manual derruba o token do Heimdall.
6. **Sem token válido a API responde 500, não 401** (acesso negado do mesmo jeito; não usar o código para "detectar token vencido" sem olhar o corpo).
7. **Rota que envia e-mail existe** (`POST /api/v1/leads/{id}/emails`): fica inofensiva porque `MAIL_MAILER=log` (a mensagem só vai para o log) e o cliente do Heimdall para o CRM nunca a chama. O contêiner do Krayin tem acesso à internet (rede padrão); não há webhook configurado.
8. **Composer avisou "64 security vulnerability advisories affecting 17 packages"** nas dependências do Krayin 2.2.0. Mitigação: só `127.0.0.1`, sem exposição pública.
9. O instalador sem `--skip-env-check` não foi usado: o idioma e a moeda ficaram `en`/`USD` (padrão do seeder). Ajustar em Configurações do Krayin se o dono quiser.
**Não verificado:** o caminho "banco vazio" do `instalar.sh` rodou só à mão (o banco já tinha sido instalado manualmente antes); funil de 5 etapas do dono; kanban; webhooks.
