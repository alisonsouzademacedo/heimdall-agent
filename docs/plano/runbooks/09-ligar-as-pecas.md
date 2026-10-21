# 9. Ligar as peças (roteiro para a IA local no Windows)

Tudo abaixo já foi **testado na nuvem com dados sintéticos e com Docker real**; o que falta é validar com o **WhatsApp real, os logins e os dados do dono**. Faça nesta ordem, pare em cada "PARAR e pedir ao dono" (regra 4 do `AGENTS.md`) e registre a saída real em `../PROGRESS.md`.

## Atalho: um comando só (`instalar\heimdall.ps1`)
`powershell -NoProfile -ExecutionPolicy Bypass -File instalar\heimdall.ps1 -Acao iniciar` cria `infra\compose\.env` com senha e chave aleatórias (se não existir; nunca sobrescreve), sobe o Docker Compose, instala as dependências que faltarem (`npm ci`), inicia os 5 processos escondidos com registro em `data\logs\` e mostra o link da tela. Outras ações: `-Acao estado`, `-Acao parar` (`-ComDocker` para parar também os serviços), `-Acao config-hermes` (gera e grava o `config.yaml` do Hermes e o reinicia), e `-SomenteMostrar` mostra o plano sem fazer nada. **Não verificado no Windows real** (testado com `node` e `docker` falsos no PowerShell 7); a IA local deve rodar e, se algo falhar, abrir relatório em `data\bugs\`.

## Processos (cada um é uma janela do PowerShell; todos leem/gravam `data\acervo.sqlite`)
| Processo | Comando (na raiz do projeto) | O que faz | Fala com |
|---|---|---|---|
| Serviços | `docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml up -d` | PostgreSQL, Hindsight (só 127.0.0.1:8888) e Hermes (só 127.0.0.1:8642). O Hermes espera o Hindsight ficar saudável | — |
| Listener | `cd apps\listener; npm ci; cd ..\..; node apps/listener/src/iniciar.ts` | Escuta o WhatsApp (só leitura), baixa áudios e PDFs, entrega a caixa de saída **só ao self-chat** | WhatsApp |
| Executor | `cd apps\trabalhos; npm ci; cd ..\..; node apps/trabalhos/src/iniciar.ts` | Transcreve áudios e converte PDFs no contêiner (sem internet) | Docker |
| Memória | `cd apps\memoria; npm ci; cd ..\..; node apps/memoria/src/iniciar.ts` | Envia as conversas dos **dias fechados** ao Hindsight | Hindsight local |
| Ponte | `cd apps\ponte; npm ci; cd ..\..; node apps/ponte/src/iniciar.ts` | Responde o self-chat (Hermes), aplica correções `A1 já resolvi`, confirma "apagar", gera diário e semanal | Hermes local |
| Tela | (já existe) `iniciar.cmd` abre a tela de configuração | Mostra estado | — |

Antes de subir os serviços: gerar o `config.yaml` do Hermes e gravá-lo no volume (o Compose não faz isso):
`node apps/ponte/scripts/gerar-config.ts heimdall > config.yaml` e, com o contêiner criado, `docker cp config.yaml <contêiner-do-hermes>:/opt/data/config.yaml` (é o que `tests/infra/smoke_hermes.sh` faz). Depois reiniciar o Hermes.

## Ordem de validação
1. `sh tests/run-all.sh` (linha de base; anotar o resultado). Depois, com Docker (pedir confirmação ao dono, baixa imagens): `sh tests/infra/smoke_docker.sh`, `smoke_midia.sh`, `smoke_executor.sh`, `smoke_hindsight.sh`, `smoke_hermes.sh`. **Não verificado no Windows**: esses scripts rodaram no Linux; no Git Bash do Windows os `docker run` dos smokes usam `drun` e `hpath` (`tests/infra/lib_docker.sh`), que já resolvem a conversão de caminhos (verificado em 2026-10-20); se ainda falhar, é bug de instalação: `data\bugs\`.
2. **Logins (PARAR e pedir ao dono):** ChatGPT no Hermes (`hermes model` dentro do contêiner) e no Hindsight (`hindsight-admin chatgpt login`, ver `07-logins.md`). Até lá o Hindsight está com `HINDSIGHT_API_LLM_PROVIDER=none`: guarda e busca trechos, mas **não extrai fatos nem observações**, e o Hermes não responde.
3. **QR do WhatsApp (PARAR e pedir ao dono):** subir o listener; o QR fica em `configuracao` (`whatsapp.qr`) e deve aparecer no passo "Conectar o WhatsApp" da tela. O dono escaneia em *Aparelhos conectados*. Esperado: estado `conectado`, número mascarado (só os 4 últimos dígitos), QR apagado, uma reconexão normal logo depois (código 515). **Não verificado:** tudo isto com um WhatsApp real.
4. **Histórico:** acompanhar `whatsapp.historico` e `whatsapp.contagem` (progresso do `messaging-history.set`). Conferir: nenhuma mensagem duplicada, conversas `dm`/`grupo`/`self` certas, PN e LID no mesmo contato. **Não verificado:** quanto histórico o WhatsApp entrega de fato.
5. **Áudio e PDF reais (o dono manda um áudio e um PDF dele):** a fila `baixar_midia` → `transcrever`/`converter_pdf` termina em `ok`; o texto aparece na mensagem. Conferir a qualidade em português (**não medida**) e o tempo de transcrição com 8 GB.
6. **Apagar e editar ao vivo:** o dono edita e apaga uma mensagem de teste; no acervo ela fica `editada`/`apagada` (o texto original fica guardado).
7. **Memória:** depois de virar o dia, a memória envia `conv:<conversa>:<AAAA-MM-DD>` ao Hindsight (`sync_hindsight`). Com o provedor `none`, só confere que foi aceito.
8. **Self-chat:** o dono escreve "oi" para si mesmo; a ponte responde (precisa do Hermes logado). `A1 já resolvi` funciona depois de um relatório com o código A1. A resposta do Heimdall nunca é tratada como comando (marca `🛡️` na frente).
9. **Relatórios:** forçar um diário e um semanal de teste (ver o passo "Agenda" da tela) e conferir que cabem em uma tela. **Os horários reais só podem ser vistos às 08:00.**

## Armadilhas já encontradas (resumo; detalhes em `../LICOES.md`)
- O Hermes só conecta o MCP do Hindsight **na partida**: sem o healthcheck do Hindsight no Compose ele fica "estacionado". Está corrigido e testado.
- `/v1/toolsets` do Hermes **não lista MCP**; usar `hermes tools list --platform api_server` e `hermes mcp test hindsight`.
- Os 5 processos migram o MESMO `acervo.sqlite` ao subir juntos: `migrar()` usa `BEGIN IMMEDIATE` e relê a versao dentro da transação (antes, o da memória morria com `table fila already exists`; `LICOES.md`, 2026-10-20). Todo processo novo deve definir `busy_timeout` antes de migrar.
- No Windows, `parar()` de qualquer processo precisa fechar o banco antes de devolver (senão apagar a pasta falha com EBUSY).
- No Windows `python3` é o atalho falso da Loja: todo script `tests/**/check_*.sh` que usa Python deve escolher o interpretador que roda (`python3`, `python`, `py`), como `check_core.sh` e `check_infra.sh`. Verificação que lê "saída vazia" como sucesso esconde esse erro.
- A API do Hermes dá acesso a todas as ferramentas se o config não for aplicado: conferir sempre `smoke_hermes.sh` depois de mudar o config.

## Não implementado ainda (ver `PROGRESS.md`)
Servidor MCP próprio do Heimdall (adiado: ver `fase-1-mcp.md`, seção "Decisão de 2026-10-20"), relatórios como arquivo `.md` anexo (hoje saem como texto), os passos Cadastro, Conectar o modelo, Processar, Voz e Backup da tela (os demais passos e o painel já funcionam: QR, progresso, teste do self-chat, relatório de teste, painel).

## Extração de compromissos e sinais (novo)
A ponte, a cada giro, agenda os dias fechados de conversas de cliente que mudaram e processa até 2 trabalhos `extrair`, perguntando ao Hermes (sessão `heimdall:extracao:<ref>`) com as regras de `prompts/extracao/compromissos-e-sinais.md`. O código valida a resposta (ids de mensagem reais, confiança mínima 0,6, só o mesmo cliente) antes de gravar. **Não verificado:** a qualidade do modelo em português real; confira nos primeiros dias se os itens "H1…" e as dúvidas do diário fazem sentido e, se não, ajuste o prompt (não o código).

## Backup, rodízio e aviso dos 90 dias (novo)
- Depois do backup do dia, a ponte apaga da pasta de backup só `acervo-AAAA-MM-DD.sqlite` **inválido** ou **com mais de 30 dias** (nunca o de hoje nem o último válido; outros arquivos da pasta não são tocados).
- O relatório (diário ou semanal) avisa quando há áudio/PDF com mais de 90 dias; para apagar só os arquivos, escreva no self-chat `apagar arquivos antigos` e depois a frase de confirmação que o Heimdall devolver.
- **Armadilha:** se o HD externo estiver desconectado, o backup do dia não é feito e o rodízio não roda; o painel mostra o erro.

