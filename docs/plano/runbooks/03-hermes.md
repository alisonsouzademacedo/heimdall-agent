# 3. Hermes Agent (em contêiner)

Fontes: `docs/hermes-agent/user-guide/docker.md`, `user-guide/features/{api-server,cron,mcp,memory}.md`, `user-guide/configuration.md` (seções "Timezone" e "Global Toolset Disable"), `reference/toolsets-reference.md`, `integrations/providers.md`, `docs/hindsight/sdks/integrations/hermes.md`.

## No repositório
O serviço está em `infra/compose/docker-compose.yml` (imagem `nousresearch/hermes-agent:v0.22.2`, `gateway run`, API só em `127.0.0.1:8642`, `API_SERVER_KEY` obrigatória, volume nomeado `hermes-data`, 1 GB de limite, **nenhuma plataforma de mensagens**). `config.yaml` (fuso, ferramentas travadas, MCP do Hindsight) **é gerado por `node apps/ponte/scripts/gerar-config.ts`** e gravado no volume por `docker cp` (o Compose não o faz; `tests/infra/smoke_hermes.sh` mostra o passo a passo e **confere com o Hermes real** que só `memory` e `session_search` ficam ligados). O Hermes só sobe com o Hindsight saudável. Teste estático: `tests/infra/check_infra.sh`.

## Requisitos
Imagem `nousresearch/hermes-agent` (amd64 e arm64; Python 3.14 dentro da imagem). Recursos do contêiner: **mínimo 1 GB de RAM, 1 CPU, 500 MB de disco; recomendado 2 a 4 GB, 2 CPUs, 2 GB+** (com ferramentas de navegador ativas, pelo menos 2 GB). Usar tag fixa (`X.Y.Z`) ou digest; `latest` e `stable` andam.

## Dados e volume
Tudo mora em `/opt/data` (`config.yaml`, `.env`, `SOUL.md`, `sessions/`, `memories/`, `skills/`, `cron/`, `hooks/`, `logs/`). **Usar volume nomeado** (`-v hermes-data:/opt/data`) em vez de pasta do computador, por causa do banco de sessões `state.db` em modo WAL (R2). Para editar `SOUL.md` ou `config.yaml` num volume nomeado: `docker exec` ou `docker cp`. **Nunca dois contêineres do Hermes no mesmo diretório de dados.**

## Passos
1. **Configuração inicial interativa** (documentada com pasta montada; com volume nomeado trocar `-v`):
   `docker run -it --rm -v hermes-data:/opt/data nousresearch/hermes-agent setup`
2. **Modelo:** com o contêiner rodando, `docker exec -it hermes hermes model` e escolher **ChatGPT or Codex Subscription** (login por código de dispositivo). Credenciais em `/opt/data/auth.json`. `-i` (manter entrada aberta) e `-t` (terminal) são opções documentadas do `docker exec` (`docs/docker/reference/cli/docker/container/exec.md`, que traz `docker exec -it mycontainer sh`); a documentação do Hermes mostra `docker exec hermes hermes ...` para comandos sem interação e `docker run -it --rm ... setup` para o assistente. O que falta confirmar é só o comportamento real do menu `hermes model` dentro do contêiner.
3. **Gateway em segundo plano** (forma da documentação, a adaptar):
   `docker run -d --name hermes --restart unless-stopped -v hermes-data:/opt/data -p 127.0.0.1:8642:8642 -e API_SERVER_ENABLED=true -e API_SERVER_HOST=0.0.0.0 -e API_SERVER_KEY=<chave longa> nousresearch/hermes-agent gateway run`
   `API_SERVER_HOST=0.0.0.0` vale **dentro** do contêiner; a porta no computador fica em `127.0.0.1` (R1). `API_SERVER_KEY` tem no mínimo 8 caracteres (gerar com `openssl rand -hex 32`) e é **obrigatória em toda instalação**, mesmo em loopback.
4. **Fuso** em `config.yaml`: `timezone: "America/Sao_Paulo"`. Afeta agendamentos e o relógio do agente. `hermes doctor` acusa nome inválido.
5. **Restringir ferramentas** em `config.yaml` (R8):
   ```yaml
   agent:
     disabled_toolsets: [terminal, browser, code_execution, delegation, computer_use, web, image_gen, video_gen, tts]
   ```
   Aplica-se depois da configuração por plataforma. Lista a revisar no spike: o conjunto `hermes-api-server` mantém terminal, arquivos e navegador. **Nenhuma plataforma de mensagens (WhatsApp, Telegram etc.) é ativada no Hermes**: ele não tem caminho de envio.
6. **Memória (plugin do Hindsight)**, modo `local_external` (detalhes em `02-hindsight.md`): `hermes plugins install hindsight`, depois `hermes memory setup` → `hindsight`.
7. **MCPs** em `config.yaml`:
   ```yaml
   mcp_servers:
     hindsight:
       url: "http://hindsight:8888/mcp/<bank_id>/"
       tools:
         exclude: ["*delete*", "create_bank", "clear_*"]   # [validar] nomes reais na lista de ferramentas
     heimdall:
       url: "http://core:<porta>/mcp"                       # nosso, ainda a construir
   ```
   Chaves documentadas: `url`, `headers`, `tools.include`, `tools.exclude` (aceita padrões `*`; `include` vence `exclude`), `timeout`, `connect_timeout`, `enabled`.
8. **Relatórios** (cron): `hermes cron create "0 8 * * 2-5" "<instrução>" --name "Relatório diário" --deliver local` e `... "0 8 * * 1" ... --name "Relatório semanal"`. `--deliver local` grava em `/opt/data/cron/output/<job_id>/<data-hora>.md`; **a resposta final do agente é o que vai para o destino** (o agente não envia nada). O `core` lê esse arquivo e envia ao self-chat. Alternativa: criar e rodar as tarefas pela API (`POST /api/jobs`, `POST /api/jobs/{id}/run`). **[validar]** o corpo do `POST /api/jobs` (a página diz "mesmo formato do `hermes cron`") e o acesso do `core` ao diretório `cron/output` (volume compartilhado só de leitura).
9. **Personalidade:** `SOUL.md` em `/opt/data`. **Perfil mínimo na memória nativa** (`USER.md`, 1.375 caracteres).

## Ponte Q (o `core` fala com o Hermes)
`POST http://hermes:8642/v1/chat/completions` com `Authorization: Bearer <API_SERVER_KEY>`, ou a API de sessões (`POST /api/sessions`, `POST /api/sessions/{id}/chat`, que mantém a conversa). Cabeçalho `X-Hermes-Session-Key` fixa o escopo de memória da conversa (máx. 256 caracteres). **Não aceita arquivos enviados**, só texto e imagem: por isso áudio e PDF são convertidos antes, pelo `core`. **[validar]** qual endpoint dá melhor continuidade para o self-chat.

## Verificação
`GET http://127.0.0.1:8642/health`; uma chamada de teste ao `/v1/chat/completions`; `docker exec hermes hermes doctor`; `docker logs hermes`; logs em `/opt/data/logs/`.

## Armadilhas
- O Hermes conecta o MCP **só na partida** (healthcheck do Hindsight no Compose); `/v1/toolsets` não lista MCP: use `hermes tools list --platform api_server` e `hermes mcp test hindsight`.
- A lista branca é `platform_toolsets.api_server`; a lista negra `agent.disabled_toolsets` vale por cima. Use as duas.
- `HERMES_DASHBOARD_INSECURE` é ignorado; painel fora do loopback exige autenticação. Não precisamos do painel.
- Dois consumidores do plano ChatGPT disputam a cota de 5 horas (R4).
- A imagem é imutável (`/opt/hermes`); atualizar é trocar de imagem, não `hermes update`.
- Instalação direta no computador (script `install.sh`/`install.ps1`) é alternativa documentada, mas o plano usa Docker.

## Desfazer
`docker rm -f hermes`; o volume `hermes-data` preserva configuração e memória (remover só com intenção).

## Não verificado
O menu `hermes model` dentro do contêiner (o `-it` em si está documentado); lista exata de toolsets a desabilitar; formato do corpo de `POST /api/jobs`; leitura de `cron/output` pelo `core`.
