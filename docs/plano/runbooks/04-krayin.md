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
