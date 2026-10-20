# 2. Hindsight e PostgreSQL

Fontes: `docs/hindsight/developer/{installation,configuration,models,mcp-server,monitoring,services}.md`, `docs/hindsight/sdks/integrations/hermes.md`.

## Decisões
- **PostgreSQL 14+ com pgvector, em contêiner próprio.** O banco embutido (pg0) é "só para desenvolvimento". A página de instalação **não nomeia** uma imagem, mas a **receita oficial `external-pg`** do repositório do Hindsight (salva em `docs/hindsight/compose-recipes/external-pg/docker-compose.yaml`) usa **`pgvector/pgvector:pg18`** (versão configurável por `HINDSIGHT_DB_VERSION`, padrão 18), com `POSTGRES_USER`, `POSTGRES_PASSWORD` (obrigatória), `POSTGRES_DB`, volume `pg_data` montado em `/var/lib/postgresql/18/docker`, rede `hindsight-net` e `HINDSIGHT_API_DATABASE_URL=postgresql://usuario:senha@db:5432/banco`. **A receita publica 8888 e 9999 sem `127.0.0.1` e usa chave de API de modelo**: adaptar (R1) e usar o provedor `chatgpt`. `HINDSIGHT_API_VECTOR_EXTENSION=pgvector` é o padrão.
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

## `hindsight-admin` (de `developer/admin-cli.md`)
Vem com o pacote `hindsight-api`: `pip install hindsight-api` coloca o executável no `PATH`. Dentro do contêiner: `docker exec -it <contêiner> hindsight-admin ...` (o exemplo da página usa o nome `hindsight-api`). O pacote completo traz bibliotecas de aprendizado de máquina pesadas (a página do plugin cita 3,2 GB no Linux x86_64 para `hindsight-all`); **[validar]** se `hindsight-api-slim` basta para o comando de login do ChatGPT.

## Armadilhas
- A imagem completa é grande; baixar uma vez.
- Reenviar o mesmo `document_id` apaga e reprocessa (custa cota).
- Login do ChatGPT dentro do contêiner: o retorno é `127.0.0.1:1455` da máquina do navegador; usar `login --from-file` (`07-logins.md`).

## Armadilha: embeddings `onnx` na imagem slim (medido em 2026-10-20)
A imagem `ghcr.io/vectorize-io/hindsight:1.0.0-slim` **não sobe** com `HINDSIGHT_API_EMBEDDINGS_PROVIDER=onnx`: sai em ~16 s com `ImportError: onnxruntime and transformers are required for OnnxEmbeddings. Install with: pip install 'hindsight-api-slim[local-onnx]'`. A imagem já tem `onnxruntime`, `numpy`, `tokenizers` e `huggingface_hub`; **falta só `transformers`** (e `safetensors`). Como a imagem traz o `uv` (e o venv `/app/api/.venv` não tem `pip`): `USER root` / `RUN uv pip install --python /app/api/.venv/bin/python 'hindsight-api-slim[local-onnx]==1.0.0'` / `USER hindsight`; o resolvedor escolheu `transformers==5.15.1` e `safetensors==0.8.0` (~13 MB, **sem torch**). **Não instalar "o `transformers` mais novo"** (5.20.2 exige `tokenizers>=0.23.1`, contra o `<=0.23.0` do Hindsight). Com isso o Hindsight respondeu `/health` em ~30 s e baixou o modelo `intfloat/multilingual-e5-small` (~470 MB) na primeira subida. Memória: ~1,3 GB (ver `fase-1-orcamento-de-memoria.md`, seção 5d). **Receita no repositório:** `infra/hindsight/Dockerfile` (versões fixas, usuário não-root, diretórios do login e do cache de modelos com o dono certo); testes em `tests/infra/check_infra.sh` (estático) e `tests/infra/smoke_docker.sh` (constrói e sobe de verdade).

## Não verificado
Autenticação do MCP; comportamento do banco "sem LLM" por banco; se o `hindsight-admin` vem na imagem **slim** (a documentação diz que vem com o pacote `hindsight-api`).


## Armadilha: idioma (descoberta em 2026-10-20 ao planejar a troca de provedor)
Os padrões do Hindsight para embeddings, reranker e busca por palavras são **em inglês** (`docs/hindsight/developer/multilingual.md`). Todo o conteúdo do Heimdall é em português. **Antes da carga inicial** configurar modelos multilíngues e o dicionário `portuguese` (detalhes e opções em `docs/plano/fase-1-troca-de-provedor.md`). Trocar o modelo de embeddings depois exige migrar o banco.
