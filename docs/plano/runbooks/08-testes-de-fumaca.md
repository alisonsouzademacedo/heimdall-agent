# 8. Testes de fumaça (depois de instalar tudo)

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

**Não verificado no Windows:** o `smoke_docker.sh` passou no Linux (Docker Engine); no Git Bash do Windows os caminhos do `docker run -v` e o `mktemp` podem precisar de ajuste (`MSYS_NO_PATHCONV=1`). Se falhar, é um bug de instalação: relatório em `data\bugs\`, teste e correção. Em rede com inspeção de TLS (antivírus ou proxy), use `HEIMDALL_CA_PEM=<certificado>`: o certificado entra só nas imagens do TESTE.

## Resultados (2026-10-19, Acer Nitro AN515-54, Windows 11 Pro 26200, 8 GB)
- **Testes 1, 16 e 17 PASSARAM.** Virtualizacao ligada pelo dono na BIOS; WSL ativado pelo caminho manual (dism; ver runbooks/01-docker.md, Armadilhas): wsl --version = 3.0.3.0, kernel 6.18.54, hipervisor ativo. Docker Desktop 29.9.1 e Compose v5.6.0 instalados por iniciar.cmd (instalador de ~620 MB, nao 500; assinatura **valida de CN=Docker Inc, O=Docker Inc, L=Palo Alto**, conferida pelo instalador antes de executar). docker run hello-world respondeu Hello from Docker! (codigo 0).
- Medido: vmmemWSL ~2 GB e memoria livre ~1 GB logo apos o Docker abrir (com navegador e o app do Claude abertos).
