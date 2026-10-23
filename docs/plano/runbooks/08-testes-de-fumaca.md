# 8. Testes de fumaça (depois de instalar tudo)

> **Histórico (2026-10-22):** os caminhos e comandos deste roteiro são da máquina Windows da fase 1. O projeto é **Linux-only**; os mesmos testes valem, mas os comandos Linux e o ligador serão escritos no item 5 de `../fase-2-execucao.md`. Não execute linhas com `C:\`, `PowerShell` ou `iniciar.cmd` como se fossem atuais.

Cada linha: o que rodar, o que se espera, de onde vem. Registrar a saída real em `../PROGRESS.md`.

| # | Teste | Resultado esperado | Origem |
|---|---|---|---|
| 1 | `docker version` e `docker run hello-world` | mensagem de confirmação | `ubuntu.md`, `windows-install.md` |
| 2 | `GET http://127.0.0.1:8888/health/live` e `/health` | 200 (o segundo consulta o banco) | `monitoring.md` do Hindsight |
| 3 | `hindsight-admin chatgpt status` | conta e validade, sem tokens | `models.md` |
| 4 | `GET http://127.0.0.1:8642/health` e uma chamada ao `/v1/chat/completions` com a chave | 200 e resposta do modelo | `api-server.md` |
| 5 | `docker exec hermes hermes doctor` | sem erro de fuso nem de banco de sessões | `configuration.md`, `docker.md` |
| 6 | Tentar abrir as portas **de fora da máquina** (outro dispositivo da rede) | recusado | R1 |
| 7 | Chamar `/v1/chat/completions` **sem** a chave | 401 | `api-server.md` |
| 8 | Hermes sem ferramenta de terminal/navegador: pedir "rode `ls`" | recusa ou ferramenta ausente | `configuration.md` (toolsets) |
| 9 | Krayin: login com nova senha; criar, mover e remover lead de teste pela API | todas as operações funcionam | `rest-api` |
| 10 | Listener: parear, receber mensagem de teste, reiniciar sem novo QR | mensagem no banco; sem QR | `session-management.md` |
| 11 | Listener: tentar enviar a outro número | falha (teste de segurança) | `AGENTS.md` regra 1 |
| 12 | Transcrever áudio de teste (pt) e converter PDF de exemplo | textos corretos | faster-whisper, markitdown |
| 13 | Cron de teste `--deliver local` (um minuto à frente) e ler `/opt/data/cron/output/` | arquivo `.md` gerado | `cron.md` |
| 14 | Relatório de teste enviado ao self-chat como `.md` | chega íntegro | spike E2 |
| 15 | `docker compose down` e `up` | nada se perde (volumes nomeados) | R2 |
| 16 | **Windows, hardware (nao automatico):** em PowerShell, systeminfo deve mostrar Virtualizacao Habilitada no Firmware: Sim (ou Um hipervisor foi detectado); wsl --status deve responder sem dizer que o WSL nao esta instalado | virtualizacao ligada na BIOS/UEFI pelo dono (depende do fabricante; o tecla de entrada nao foi verificada) e wsl --install como administrador, com reinicio | windows-install.md (requisitos e WSL: Verification and setup) |
| 17 | **Windows:** docker version e docker run hello-world depois do passo 16 e de abrir o Docker Desktop (aceite dos termos e feito pelo dono) | mensagem de confirmacao | windows-install.md |
| 18 | **Windows, Docker real (a IA local roda; peça a confirmação do dono: baixa cerca de 3 GB e um modelo de 470 MB):** `sh tests/infra/smoke_docker.sh` no Git Bash | `RESULTADO: tudo passou` (12 verificações no Linux em 2026-10-20) | `infra/`, runbooks 02 e 06 |
| 19 | **Windows:** `docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml up -d`, depois `docker stats`: soma dos contêineres perto de 3,1 GB no pico e o Windows sem faltar memória | nenhum contêiner morto (`oom=false`) | orçamento de memória 5d |
| 20 | **Windows:** `GET http://127.0.0.1:8888/health` responde e o IP da rede NÃO responde | só o loopback atende | R1 |
| 21 | **WhatsApp real, carga (o dono pareia):** anotar a hora, parear o QR e acompanhar na tela o contador de mensagens até parar de crescer; anotar quanto histórico chegou, o tempo e o uso de memória (Gerenciador de Tarefas). Não fechar nada durante a carga | contador estabiliza; `whatsapp.estado` fica `conectado`; sem avisos de gravação | `tests/carga/` prova o lado do código; só o WhatsApp mostra quanto histórico ele entrega |
| 22 | **WhatsApp real, queda no meio:** durante a carga (contador ainda subindo), fechar a janela do listener e abrir de novo | sem QR novo; o contador continua e **não** duplica. **Não verificado:** se o WhatsApp reenvia o que faltou (a doc fala de histórico "na primeira sincronização"); se o contador não voltar a subir, anotar quantas mensagens chegaram antes da queda | `docs/baileys/authentication/qr-code.md`, `history-sync.md` |
| 23 | **Modelo real, primeiras extrações:** com a carga concluída, deixar o Hermes extrair os primeiros dias e conferir 5 compromissos a olho contra a conversa | compromissos batem com o que foi combinado; dúvidas aparecem quando o áudio/data é ambígua | `prompts/extracao/compromissos-e-sinais.md` |
| 24 | **Modelo real, queda:** parar o Hermes no meio do processamento e subir de novo | a fila continua de onde parou; nenhum compromisso repetido | `tests/carga/processamento.test.ts` (parte automática) |
| 25 | **WhatsApp real, contatos:** depois da carga, abrir a tela (ou `data\acervo.sqlite`) e conferir 5 clientes conhecidos: o nome aparece certo e cada cliente tem **uma** conversa só (número e LID juntos) | nomes certos; sem conversa duplicada. **Não verificado:** se o WhatsApp entrega a lista de contatos inteira ou só quem conversou | `docs/baileys/concepts/events.md`, `advanced/history-sync.md` |
| 26 | **Tela, passos novos (dados sintéticos ou reais já carregados):** abrir Cadastro, salvar um membro da equipe, abrir Conectar o modelo e ler as instruções, abrir Processar e conferir as contagens | o membro aparece com o telefone mascarado; as instruções não mostram token nem caminho interno; as contagens batem com `GET /api/processamento` | `tests/navegadores/tela.mjs` (Chrome, 2026-10-21) |
| 27 | **WhatsApp real, histórico antigo pela tela:** no passo Sincronizar, escolher o intervalo (sugerido 60 s), clicar em "Liberar busca antiga", confirmar e acompanhar as conversas concluídas/esgotadas. Depois, pausar e conferir que a busca para | pedidos saem devagar e só ao próprio celular; `historico_pedidos` avança; pausar impede pedidos novos. **Não verificado:** quanto o aparelho devolve por conversa e se há risco de limitação da conta | `docs/baileys/advanced/history-sync.md`, runbook 05 |
| 28 | **Modelo real:** clicar em "Fazer chamada de teste" e esperar o resultado (a tela consulta a cada 2 s) | estado `ok` com o tempo em ms; se falhar, o motivo curto aparece e o passo fica vermelho | `/api/modelo`, `apps/ponte/src/ciclo.ts` |
| 29 | **Trava de processamento real:** antes de liberar, anotar `diasNovos` e `diasRefeitos` em `GET /api/processamento`; liberar pelo botão, confirmar e ver a fila `extrair` andar; pausar | nenhuma consulta ao modelo com a trava fechada; pausar não interrompe o dia já começado, mas não pega dias novos | `apps/core/src/extracao.ts`, `apps/ponte/src/ciclo.ts` |

**Não verificado no Windows:** o `smoke_docker.sh` passou no Linux (Docker Engine); no Git Bash do Windows os caminhos do `docker run -v` e o `mktemp` podem precisar de ajuste (`MSYS_NO_PATHCONV=1`). Se falhar, é um bug de instalação: relatório em `data\bugs\`, teste e correção. Em rede com inspeção de TLS (antivírus ou proxy), use `HEIMDALL_CA_PEM=<certificado>`: o certificado entra só nas imagens do TESTE.

## Resultados (2026-10-19, Acer Nitro AN515-54, Windows 11 Pro 26200, 8 GB)
- **Testes 1, 16 e 17 PASSARAM.** Virtualizacao ligada pelo dono na BIOS; WSL ativado pelo caminho manual (dism; ver runbooks/01-docker.md, Armadilhas): wsl --version = 3.0.3.0, kernel 6.18.54, hipervisor ativo. Docker Desktop 29.9.1 e Compose v5.6.0 instalados por iniciar.cmd (instalador de ~620 MB, nao 500; assinatura **valida de CN=Docker Inc, O=Docker Inc, L=Palo Alto**, conferida pelo instalador antes de executar). docker run hello-world respondeu Hello from Docker! (codigo 0).
- Medido: vmmemWSL ~2 GB e memoria livre ~1 GB logo apos o Docker abrir (com navegador e o app do Claude abertos).


## Resultados na VPS Linux (2026-10-22) — o que foi testado de verdade e o que só o teste real cobre
Servidor compartilhado (Ubuntu 24.04, 4 vCPUs sem AVX, 7,8 GB). Tudo com dados **sintéticos**, salvo as contagens do acervo real importado (nunca conteúdo).

### Testado e visto funcionando
| # (tabela acima) | O que | Evidência |
|---|---|---|
| 1, 15 | Docker; `recreate` sem perder dados | Compose recriado 3 vezes (inclusive por engano, `compose create`): Postgres e Hindsight voltaram com 1.035 documentos de memória; Krayin sobreviveu a `restart` e `--force-recreate` |
| 2 | Hindsight `/health/live` e `/health` | 200 e 200 |
| 4, 7 | Hermes `/health`, chamada sem chave, chamada com chave | 200; **401**; 200 com a mensagem "not connected to any AI provider" (falta o login) |
| 5 | `hermes doctor` | sem erro do Heimdall (avisos só de ferramentas desligadas de propósito) |
| 6, 20 | Portas de fora | 8888, 9999, 8642, 8082 e 8765 **recusadas pelo IP da rede** e atendendo só no loopback |
| 9 | Krayin: login, criar, mover (inclusive ganho/perdido), apagar lead pela API real | cliente do projeto contra o Krayin real; funil de teste criado e removido; sem lead nem funil de teste restante |
| 11 | Listener não envia a outro número | `apps/listener` (transporte e arquitetura) |
| 12 | Whisper e PDF **offline** (sem internet), `tests/infra/smoke_midia.sh` | **12 verificações passaram** (recusa arquivo fora de /entrada, PDF falso, pasta somente leitura, sem internet, sem root); medições no runbook 06; qualidade em português **não** avaliada |
| — | Reentrega do histórico depois de trocar de aparelho | `tests/carga/reentrega-apos-troca-de-aparelho.test.ts` (nada duplica, nada volta atrás; 3 quebras detectadas) |
| — | Migração do banco sobre uma **cópia do acervo real** | 13→14 só mudou `crm_leads`, `crm_propostas` e a versão; 3 execuções idênticas; integridade `ok`; 0 violações de chave estrangeira |
| — | Fluxo do CRM C1–C5 contra o Krayin real, com clientes sintéticos | propor → aprovar pelo "self-chat" → lead criado na etapa certa → movido de etapa → perdido (7 tentativas); **ganho nunca é proposto**; achou e corrigiu a resposta que aprovava o que o dono recusou |
| — | Supervisor sob o systemd (`heimdall.service`) | derrubar a ponte, o executor, a memória e o próprio supervisor: tudo voltou sozinho; `novo-link` trocou só o pid da tela |
| — | Tela (API): 13 passos, 5 fontes ao vivo, teste do CRM, ambiente | instância temporária em outra porta; todos `pendente` antes do WhatsApp, CRM falando com o Krayin real |

### Só o teste real cobre (NÃO verificado)
- **Ler o QR e a sincronização real:** quanto histórico o WhatsApp devolve num aparelho novo, se reenvia o que já temos, o tempo, o pico de memória (itens 21, 22, 25, 27).
- **Login do ChatGPT no Hermes** e qualquer chamada real ao modelo (itens 28, 29): qualidade em português, extração de compromissos, relatório redigido, cota do Plus.
- **Áudio e PDF reais** e a **qualidade** da transcrição em português (o Whisper roda a ~5× o tempo real nesta CPU sem AVX).
- **Relatórios às 08:00** (diário ter–sex, semanal seg) e a **ponte direta** no self-chat com o WhatsApp real (resposta livre, confirmação de apagar, correções por código, aprovação do CRM); só os testes automáticos cobrem.
- **Entrega de relatório como `.md` anexo** no WhatsApp (hoje sai como texto).
- **Reinício do servidor inteiro** (o `linger` do usuário está ativo e os contêineres têm `restart: unless-stopped`, mas não reiniciei a máquina: ela hospeda sites de clientes).
- **Teste da tela em navegador real** (`tests/navegadores/tela.mjs`): **Playwright 1.56.1 instalado na VPS em 2026-10-23** (só na pasta do usuário, sem `sudo`; Chromium sem janela). Rodar: `PLAYWRIGHT_MODULE=$HOME/.local/share/heimdall-playwright/node_modules/playwright nice -n 19 sh tests/navegadores/check_navegadores.sh` (com `HEIMDALL_CAPTURAS=<pasta>` salva uma captura do passo Processar). Firefox, WebKit, Edge e Chrome: não instalados (`[NAO EXECUTADO]`).
- **Hindsight com modelo** (1.1.0 + `chatgpt`) e o reprocessamento de documentos guardados em modo `chunks`.
- **Krayin:** o funil de 3 etapas do dono criado por ele na tela; kanban; mover cartão à mão.
- Itens de Windows (16 a 20) e `smoke_docker.sh` (recusa rodar com as portas reais ocupadas): não se aplicam a esta máquina.
