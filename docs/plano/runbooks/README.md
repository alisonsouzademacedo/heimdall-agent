# Roteiros de instalação por componente

**Estado: documentados a partir das páginas citadas; nenhum foi executado.** O spike (`../fase-1-spike.md`) executa cada roteiro e registra divergências em `../PROGRESS.md`. Onde a documentação não cobre algo, o roteiro diz **[validar]**. Quem executar deve seguir o `AGENTS.md` (ler a página de origem inteira antes de agir).

## Ordem
0. `spike/preflight/` (verificador de ambiente) → 1. [Docker](01-docker.md) → 2. [Hindsight e PostgreSQL](02-hindsight.md) → 3. [Hermes](03-hermes.md) → 4. [Logins](07-logins.md) → 5. [Krayin](04-krayin.md) → 6. [Trabalhador de áudio e PDF](06-media-worker.md) → 7. [Escuta com Baileys (núcleo)](05-listener-baileys.md) → 8. Integrações → 9. [Testes de fumaça](08-testes-de-fumaca.md)

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
- **R8. Restringir as ferramentas do Hermes** e proteger a API com chave: a API dá acesso a **todas as ferramentas, incluindo terminal** (`docs/hermes-agent/user-guide/features/api-server.md`, "Security"); a documentação registra uma campanha de junho de 2026 que explorou painéis e APIs expostos (`docker.md`).
