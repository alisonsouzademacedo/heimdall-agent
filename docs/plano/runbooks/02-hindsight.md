# 2. Hindsight e PostgreSQL

Fontes: `docs/hindsight/developer/{installation,configuration,models,mcp-server,monitoring,services}.md`, `docs/hindsight/sdks/integrations/hermes.md`.

## Decisões
- **PostgreSQL 14+ com pgvector, em contêiner próprio.** O banco embutido (pg0) é "só para desenvolvimento". A documentação do Hindsight **não indica uma imagem de Postgres**; escolher uma imagem oficial com pgvector **[validar]**. `HINDSIGHT_API_VECTOR_EXTENSION=pgvector` é o padrão.
- **Imagem:** `ghcr.io/vectorize-io/hindsight:<tag fixa>`. **Completa** (~9 GB amd64, ~3,7 GB arm64; embeddings e reranker locais; API 1,5 GB de RAM mínimo e 2 GB recomendado) ou **slim** (~500 MB, 512 MB de RAM, exige provedores externos de embeddings e reranker). Com plano de assinatura e sem chave de API, a **completa** é o caminho simples. Disco: reservar os 9 GB.
- **Modelo:** `HINDSIGHT_API_LLM_PROVIDER=chatgpt` (rota suportada "Sign in with ChatGPT"); ver `07-logins.md`.

## Variáveis principais (todas citadas na página `configuration.md`)
`HINDSIGHT_API_DATABASE_URL=postgresql://usuario:senha@postgres:5432/hindsight` · `HINDSIGHT_API_LLM_PROVIDER=chatgpt` · `HINDSIGHT_API_LLM_CHATGPT_HOME=<volume gravável>` · `HINDSIGHT_API_WORKER_ID=<valor estável>` (recomendado em produção, senão a identidade muda a cada reinício) · `HINDSIGHT_API_LLM_MAX_CONCURRENT=2` a `4` (padrão 32) · `HINDSIGHT_API_RETAIN_LLM_MAX_CONCURRENT` (limite extra da extração).

## Execução (forma da documentação, a adaptar ao Compose)
`docker run ... --shm-size=1g -p 8888:8888 -p 9999:9999 -v hindsight-data:/home/hindsight/.pg0 ghcr.io/vectorize-io/hindsight:latest`. Adaptações: porta com `127.0.0.1:` (R1); `HINDSIGHT_API_DATABASE_URL` apontando para o Postgres; volume nomeado para as credenciais do ChatGPT; **usuário não-root (UID 1000)**: volume nomeado funciona; pasta do computador exige `chown` para UID 1000.

## Verificação
`GET http://127.0.0.1:8888/health/live` (processo vivo) e `/health` ou `/health/ready` (consulta o banco). Painel em `http://127.0.0.1:9999`.

## MCP
Modo **banco único** recomendado: `http://hindsight:8888/mcp/{bank_id}/` (27 ferramentas; isolamento por banco). No Hermes, ocultar ferramentas que apagam ou criam com `mcp_servers.<nome>.tools.exclude` (ver `03-hermes.md`). **[validar]** autenticação do MCP (seção "Authentication" de `mcp-server.md`).

## Plugin do Hermes (memória)
Modo **`local_external`**: `mode: local_external`, `api_url: http://hindsight:8888`, `bank_id` em `$HERMES_HOME/hindsight/config.json`. Instalar com `hermes plugins install hindsight` e ativar com `hermes memory setup` (escolher `hindsight`); **ativar não é o mesmo que `plugins enable`** (`sdks/integrations/hermes.md`). O plugin antigo via pip está obsoleto. `recall_types` padrão é só `observation` (conhecimento consolidado, que depende do modelo); **no modo sem LLM não há observações**: definir `recall_types: "observation,world,experience"` **[validar]**.

## Armadilhas
- A imagem completa é grande; baixar uma vez.
- Reenviar o mesmo `document_id` apaga e reprocessa (custa cota).
- Login do ChatGPT dentro do contêiner: o retorno é `127.0.0.1:1455` da máquina do navegador; usar `login --from-file` (`07-logins.md`).

## Não verificado
Imagem de Postgres com pgvector; autenticação do MCP; comportamento do banco "sem LLM" por banco.
