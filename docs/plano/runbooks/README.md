# Roteiros de instalação por componente

**Estado: documentados a partir das páginas citadas; nenhum foi executado.** O spike (`../fase-1-spike.md`) executa cada roteiro e registra divergências em `../PROGRESS.md`. Onde a documentação não cobre algo, o roteiro diz **[validar]**. Quem executar deve seguir o `AGENTS.md` (ler a página de origem inteira antes de agir).

## Ordem
0. `spike/preflight/` (verificador de ambiente) → 1. [Docker](01-docker.md) → 2. [Hindsight e PostgreSQL](02-hindsight.md) → 3. [Hermes](03-hermes.md) → 4. [Logins](07-logins.md) → 5. [Krayin](04-krayin.md) → 6. [Trabalhador de áudio e PDF](06-media-worker.md) → 7. [Escuta com Baileys (núcleo)](05-listener-baileys.md) → 8. Integrações → 9. [Testes de fumaça](08-testes-de-fumaca.md) → 10. [Testes e caminhos por sistema (Windows e Linux)](10-testes-windows-e-linux.md)

**Setup por computador:** o instalador e a tela mostram o perfil ideal para a máquina (Insuficiente, Enxuto, Equilibrado, Folgado) com o que foi **medido** separado do que é estimativa: `../fase-1-perfis-de-computador.md`. Medição de memória e armadilhas de instalação descobertas: `../fase-1-orcamento-de-memoria.md`, `02-hindsight.md` e `06-media-worker.md`.

## Portas (todas publicadas só em `127.0.0.1`)
| Serviço | Porta | Observação |
|---|---|---|
| Hermes (API compatível com OpenAI) | 8642 | exige `API_SERVER_KEY` |
| Hindsight (API / painel) | 8888 / 9999 | |
| Krayin | 80 no contêiner; sugerido 8082 no host | |
| Login do ChatGPT (retorno local) | 1455 | só durante o login; fixa |
| Tela de onboarding do Heimdall | a definir | só local |

## Regras comuns (cada uma tem origem verificada)
- **R1. Publicar portas só no `127.0.0.1`** (`-p 127.0.0.1:8642:8642`). Sem isso a porta fica acessível fora da máquina (`docs/docker/engine/network/port-publishing.md`); no Linux, portas publicadas **ignoram as regras do ufw/firewalld** (`docs/docker/engine/install/ubuntu.md`, "Firewall limitations").
- **R2. Bancos em volumes nomeados do Docker**, não em pastas do computador montadas. No Docker Desktop (Windows e Mac) pastas montadas atravessam uma máquina virtual (virtiofs, 9p) e o modo WAL do SQLite pode corromper com escritores simultâneos (`docs/hermes-agent/user-guide/docker.md`, "Filesystem requirements for state.db"). Vale também para o **nosso** `acervo.sqlite`.
- **R3. Nunca dois contêineres do Hermes no mesmo diretório de dados** (`docker.md`).
- **R4. A cota do ChatGPT é uma janela de 5 horas compartilhada** com todos os apps do plano (`docs/hindsight/developer/models.md`). Fazer os logins em sequência (a porta 1455 é fixa).
- **R5. Versões fixas:** imagem do Hermes por tag `X.Y.Z` ou digest; imagem do Hindsight por tag; Krayin 2.2.6 (exigido pelo pacote da API); Baileys em versão escolhida e registrada.
- **R6. Segredos fora do git e senhas padrão trocadas** (Krayin: `admin@example.com` / `admin123`; MySQL do exemplo: `root`/`root`).
- **R7. Nunca copiar exemplos que enviam mensagens** (o exemplo do `quickstart` do Baileys responde a toda mensagem recebida).
- **R9. Windows: caminhos de arquivo.** Nunca usar `new URL(...).pathname` como caminho de disco (no Windows vira `/C:/...`); usar `fileURLToPath` (`node:url`). Em Python, abrir arquivos com `encoding='utf-8'` (o padrão do Windows é cp1252). Origem: `LICOES.md`, 2026-10-19.
- **R8. Restringir as ferramentas do Hermes** e proteger a API com chave: a API dá acesso a **todas as ferramentas, incluindo terminal** (`docs/hermes-agent/user-guide/features/api-server.md`, "Security"); a documentação registra uma campanha de junho de 2026 que explorou painéis e APIs expostos (`docker.md`).

## Pontos que estavam "não verificados" e foram conferidos nas documentações (2026-10-20)
| Ponto | Resultado | Onde está |
|---|---|---|
| Windows Home com Docker Desktop (WSL 2) | **Parcial**: Home roda contêineres Linux (explícito) e há seção "WSL 2 and Windows Home" (implícito); a lista de requisitos cita só Pro/Enterprise/Education. **Só a prática confirma** | `01-docker.md` |
| Plano Plus no login do Hindsight com o ChatGPT | **Parcial**: Plus e Pro são elegíveis (explícito, OpenAI); o fluxo vale para apps de código aberto e locais; elegibilidade individual só aparece no primeiro uso (403 `subscription_sharing_user_not_eligible`). **Só a prática confirma esta conta** | `07-logins.md`, `docs/openai-codex/siwc/` |
| Imagem de PostgreSQL com pgvector | **Explícito** na receita oficial `external-pg`: `pgvector/pgvector:pg18` | `02-hindsight.md`, `docs/hindsight/compose-recipes/` |
| `docker exec -it` | **Explícito** no Docker (`-i`, `-t`). Falta só o comportamento do menu `hermes model` | `03-hermes.md` |
| Instalação do `hindsight-admin` | **Explícito**: `pip install hindsight-api`, ou dentro do contêiner. Falta confirmar na versão slim | `02-hindsight.md` |

## O que só a prática vai responder (lista viva para o spike)
Windows Home com Docker Desktop; a conta Plus do usuário no fluxo do Hindsight; menu `hermes model` no contêiner; caminho real da API do Krayin (`/api/admin` ou `/api/v1`); persistência da imagem única do Krayin; campo de motivo de perda; envio de `.md` como documento no WhatsApp; nono dígito de números brasileiros; alcance real do histórico do Baileys; consumo de memória e cota; qualidade do Whisper em português e do PDF do Meet; `local_files_only` do faster-whisper; corpo do `POST /api/jobs` do Hermes; leitura de `cron/output` pelo núcleo; autenticação do MCP do Hindsight; imagem slim com `hindsight-admin`.
