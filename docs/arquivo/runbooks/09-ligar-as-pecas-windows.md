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
- Subida simultânea, 2ª etapa: o `abrirBanco` define `busy_timeout` como **primeiro** comando (antes, o executor morria com `database is locked` ao recuperar o WAL; `LICOES.md`, 2026-10-21). Conferir sempre `data\\processos.json` contra os processos vivos depois de `iniciar`.
- Os 5 processos migram o MESMO `acervo.sqlite` ao subir juntos: `migrar()` usa `BEGIN IMMEDIATE` e relê a versao dentro da transação (antes, o da memória morria com `table fila already exists`; `LICOES.md`, 2026-10-20). Todo processo novo deve definir `busy_timeout` antes de migrar.
- No Windows, `parar()` de qualquer processo precisa fechar o banco antes de devolver (senão apagar a pasta falha com EBUSY).
- No Windows `python3` é o atalho falso da Loja: todo script `tests/**/check_*.sh` que usa Python deve escolher o interpretador que roda (`python3`, `python`, `py`), como `check_core.sh` e `check_infra.sh`. Verificação que lê "saída vazia" como sucesso esconde esse erro.
- A API do Hermes dá acesso a todas as ferramentas se o config não for aplicado: conferir sempre `smoke_hermes.sh` depois de mudar o config.
- **Código de acesso da tela:** o link com `codigo=` é de **uso único** e abre a tela só naquela sessão. Nunca copie o link nem o código para chat, log, commit ou relatório. Para obter um link novo, feche a janela da tela e rode `instalar\heimdall.ps1 -Acao iniciar` de novo: o link aparece no fim da janela e em `data\logs\tela.log` (o log é local, fora do git).
- **Ao retomar trabalho de outra IA:** não aceite "está pronto" sem conferir `git status`, os processos vivos (`node`, `python`) e o Docker. Serviço parado ou mudança sem commit explica boa parte dos "sumiu/refiz".
- **Tela "Sincronizar" (cartão da busca antiga):** o relógio da tela (3 s) tem de repintar o TOPO E o cartão (`atualizarSincronizar` busca `/api/painel` e `/api/historico-antigo`); antes, os números do cartão e o botão "Liberar busca antiga" ficavam parados (defeito relatado pelo dono; `LICOES.md`, 2026-10-21). O botão muda para "Busca liberada (em andamento)" quando a trava abre e a estimativa usa `esperaRespostaSegundos` da API.
- **`data\processos.json` guarda pid + hora de inicio (`{"nome":{"pid":N,"inicio":ticks}}`):** um pid sozinho pode ser reaproveitado pelo Windows e o launcher diria "já está rodando" para o programa de outra pessoa (e o `parar` chegaria a matá-lo; `LICOES.md`, 2026-10-21). Ao mexer em `LePids`/`Vivo`/`GravaPids`, mantenha os dois campos; registro antigo só é aceito se o processo vivo for node.
- **Rodar o launcher de dentro de automação/captura de saída:** o script termina com `Pausa` (`Read-Host 'Pressione ENTER para fechar'`), pensado para humano; sem terminal o comando fica pendurado (minutos) mesmo com tudo já iniciado. Use **`-SemPausa`** sempre que a saída for capturada por outra sessão (os testes já usam; `LICOES.md`, 2026-10-21).

## Não implementado ainda (ver `PROGRESS.md`)
Servidor MCP próprio do Heimdall (adiado: ver `fase-1-mcp.md`, seção "Decisão de 2026-10-20"), relatórios como arquivo `.md` anexo (hoje saem como texto) e o passo **Voz** da tela. Os passos **Cadastro, Sincronizar (com a busca antiga), Extrair, Conectar o modelo e Processar** já estão ligados na tela (2026-10-21); falta conferir o comportamento com WhatsApp e modelo reais.

## Carga do histórico inteiro (primeira vez) — como acompanhar
Testes automáticos (sem WhatsApp real, dados sintéticos): `sh tests/carga/check_carga.sh` (padrão moderado) ou, para ver o limite, `HEIMDALL_CARGA_MENSAGENS=100000 HEIMDALL_CARGA_MENSAGENS_LLM=20000 sh tests/carga/check_carga.sh`. Cobrem: entrada de lotes grandes, reenvio total, queda no meio, lotes fora de ordem, falha de gravação, edição antes da original, e o processamento pelo modelo e pelo Hindsight com falhas (fora do ar, resposta inválida, recusa definitiva), queda com trabalho preso e reenvio de metade para o Hindsight.
Na prática (precisa do dono): parear o QR; acompanhar na tela o contador de mensagens e `whatsapp.estado`; **não fechar o listener durante a carga**; ver em `docs/plano/runbooks/08-testes-de-fumaca.md` (linhas 21 a 24) o que conferir e anotar. O processamento pelo modelo começa só nos **dias fechados** (hoje fica de fora) e anda **um dia por vez**: com muitos dias antigos leva horas, de propósito e sem perder nada (a fila continua de onde parou).

## Extração de compromissos e sinais (novo)
A ponte, a cada giro, agenda os dias fechados de conversas de cliente que mudaram e processa até 2 trabalhos `extrair`, perguntando ao Hermes (sessão `heimdall:extracao:<ref>`) com as regras de `prompts/extracao/compromissos-e-sinais.md`. O código valida a resposta (ids de mensagem reais, confiança mínima 0,6, só o mesmo cliente) antes de gravar. **Não verificado:** a qualidade do modelo em português real; confira nos primeiros dias se os itens "H1…" e as dúvidas do diário fazem sentido e, se não, ajuste o prompt (não o código).

## Backup, rodízio e aviso dos 90 dias (novo)
- Depois do backup do dia, a ponte apaga da pasta de backup só `acervo-AAAA-MM-DD.sqlite` **inválido** ou **com mais de 30 dias** (nunca o de hoje nem o último válido; outros arquivos da pasta não são tocados).
- O relatório (diário ou semanal) avisa quando há áudio/PDF com mais de 90 dias; para apagar só os arquivos, escreva no self-chat `apagar arquivos antigos` e depois a frase de confirmação que o Heimdall devolver.
- **Armadilha:** se o HD externo estiver desconectado, o backup do dia não é feito e o rodízio não roda; o painel mostra o erro.

