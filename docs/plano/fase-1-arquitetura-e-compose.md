# Arquitetura, estrutura do repositório e serviços (Docker Compose)

Status: **proposta**. Nenhum arquivo de Compose foi escrito nem testado; será criado e testado no spike, pela IA, seguindo o `AGENTS.md`. Fontes: `docs/hermes-agent/user-guide/docker.md` e `features/api-server.md`, `docs/hindsight/developer/installation.md`, `models.md` e `configuration.md`, `docs/krayin/devdocs/2.2/introduction/installation.md`, `docs/docker/` (Compose e rede).

## Decisões do usuário (2026-10-19)
- **Acesso só na máquina** por enquanto. Quando o Heimdall estiver validado, o usuário comprará um domínio e abrirá pela internet (fase futura, exige HTTPS e autenticação).
- Linguagem: **TypeScript/Node** para o núcleo (recomendação aceita); **Python** só onde a ferramenta exige.
- Instalação por IA; instalador próprio depois.

## Estrutura proposta do repositório
```
apps/core/            TypeScript: escuta (Baileys), API, tela de onboarding, filas, motor de regras, MCP do Heimdall
apps/media-worker/    Python: faster-whisper (áudio) e markitdown (PDF), em processo isolado
infra/compose/        docker-compose e modelo de variáveis de ambiente
prompts/              SOUL.md, modelos dos relatórios, extração de compromissos/sinais, skills iniciais
templates/cadastro/   modelos em branco do cadastro
tests/                testes de regressão (dados sintéticos)
docs/                 documentação (já existe)
spike/                experimentos descartáveis (verificador de ambiente já existe)
data/                 dados reais; fora do git
```

## Serviços
| Serviço | Origem (documentação) | Portas | Dados | Observações |
|---|---|---|---|---|
| `hermes` | imagem `nousresearch/hermes-agent`, comando `gateway run` | API compatível com OpenAI em **8642** (opcional; necessária para a ponte Q) | `~/.hermes` montado em `/opt/data` | API só liga com `API_SERVER_ENABLED=true`; fora do `127.0.0.1` do contêiner exige `API_SERVER_HOST=0.0.0.0` e `API_SERVER_KEY` (mín. 8 caracteres); fuso por `timezone: America/Sao_Paulo`; login do ChatGPT por código de dispositivo, guardado no volume |
| `hindsight` | imagem `ghcr.io/vectorize-io/hindsight` | API **8888**, painel **9999** | volume `hindsight-data`; `--shm-size=1g`; usuário não-root (UID 1000) | O banco embutido (pg0) é descrito como **só para desenvolvimento**; produção pede PostgreSQL externo |
| `postgres` | PostgreSQL com pgvector (exigência do Hindsight) | interna | volume próprio | 0,5 GB mínimo, 1 GB+ recomendado |
| `krayin` | imagem `webkul/krayin` (Docker Hub) ou Compose com Nginx, PHP e MySQL | 80 no contêiner (ex.: **8082** no host) | volumes da aplicação e do MySQL | A imagem única é descrita como ambiente rápido/descartável; para persistir, usar Compose com volumes **[validar]**. 3 GB de RAM declarados |
| `mysql` | exigência do Krayin | interna | volume próprio | só se for pelo Compose do Krayin |
| `core` | nosso (TypeScript) | tela de onboarding (porta a definir) | `data/` | escuta, filas, regras, MCP, envio travado no self-chat |
| `media-worker` | nosso (Python) | nenhuma | `data/midias`, `data/md` | sem acesso à internet depois de baixar o modelo (rede `internal`) |

## Rede e acesso (verificado em `docs/docker/`)
- **Publicar portas só no `127.0.0.1`** (`-p 127.0.0.1:porta:porta`): a documentação do Docker diz que, sem isso, a porta publicada fica acessível também **fora** da máquina. Todas as portas do Heimdall seguem essa regra enquanto o acesso for só local.
- Rede interna do Compose entre `core`, `hermes`, `hindsight`, `krayin` e `media-worker`; o Compose permite marcar uma rede como `internal` (sem conectividade externa). O `media-worker` fica nela porque processa PDFs de terceiros; o modelo do Whisper deve ser baixado **antes**, em passo separado.
- O Compose permite `healthcheck` e `depends_on` esperando o serviço ficar saudável: usar para a ordem de subida (banco → Hindsight → Hermes → core).

## Ponte Q (já decidida)
`core` recebe o self-chat → chama a API do Hermes (8642, com chave) → recebe a resposta → **envia ele mesmo** ao self-chat. O Hermes conecta-se aos MCPs (Hindsight e Heimdall) pela rede interna; o MCP do Hindsight oferece ferramentas de apagar e criar banco, que devem ser ocultadas com `tools.exclude` do Hermes.

## Logins e a cota do ChatGPT (achados importantes)
- **Três consumidores** usam o mesmo plano: o **Hermes** (agente), o **Hindsight** (extração e memória) e, durante a instalação, a **IA instaladora** (se for o Codex). A documentação do Hindsight diz que, no Plus, o **limite de 5 horas é compartilhado com todos os apps que usam o plano, incluindo o Codex**. Ao bater no limite, o Hindsight **adia a extração e tenta de novo 30 minutos depois**, em vez de falhar. Isso entra no orçamento da carga inicial (`fase-1-carga-inicial.md`).
- **Login do Hindsight dentro do Docker:** o retorno do login volta para `127.0.0.1:1455` na máquina que tem o navegador. A documentação manda entrar **na máquina com navegador** e **copiar o arquivo de credenciais** para o servidor (`login --from-file`), mantendo o local sem revogar (`logout --local-only`). O diretório de credenciais precisa ser um **volume gravável** (os tokens rotacionam). Usar **um diretório por conta do ChatGPT**.
- O Hermes usa **credenciais próprias** (login por código de dispositivo); o `provider chatgpt` do Hindsight **não compartilha nem rotaciona** os tokens do Codex CLI.

## Versão comercial (decisão do usuário)
Primeiro para o próprio usuário, com o plano do ChatGPT. Para o viés comercial, **o ideal é que o cliente tenha a sua API** (chave de API). Consequências de planejamento: o provedor de modelo precisa ser **configurável** (login do ChatGPT ou chave de API) no Hermes e no Hindsight, e o passo 4 do onboarding oferece as duas opções; o custo por token passa a ser do cliente, e a cota de 5 horas deixa de ser um limite.

## Não verificado / a medir
Consumo de memória do Hermes e do `core`; se a imagem única do Krayin persiste dados sem Compose; compatibilidade entre as portas padrão (8642, 8888, 9999, 8082, 1455) e o que já roda na máquina do usuário (o verificador já checa 1455 e 8888).
