# Pendências da VPS (2026-10-22, noite) — o que ficou para a próxima sessão

**Origem:** fim da sessão de instalação na VPS (o dono trocou de modelo no meio; o tempo acabou). Tudo abaixo foi **achado e anotado, não feito**, salvo onde diz "feito". Siga o `AGENTS.md`: teste que falha primeiro, mudança pequena, `LICOES.md` quando for erro, `PROGRESS.md` ao fim.

**Regra do servidor (não muda):** a VPS hospeda sites de clientes. Nunca pare, reinicie nem altere nginx, pm2, firewall, SSH, fail2ban ou contêineres que não sejam do projeto Compose `heimdall`. **Nada de `docker system prune`, `docker image prune` ou `docker builder prune` sem filtro:** esses comandos também apagam coisas dos outros projetos.

## 0. Fechar a sessão anterior (fazer primeiro)
1. **Bateria final.** Foi iniciada com `sh tests/run-all.sh > <scratchpad>/final.txt` e roda em segundo plano. Se a sessão nova não achar esse arquivo, rode de novo: `sh tests/run-all.sh` (demora, por causa de `tests/core/mutacao.py`). Só faça commit com **0 falhas**. Se algo falhar: `systematic-debugging`, sem enfraquecer teste.
2. **Commit** das mudanças ainda pendentes (conferir com `git status`):
   - CRM: `chaveEtapa` aceita "1a"/"1ª"; teste de que o token não segue redirecionamento.
   - Tela, passo 12: manda criar só 3 etapas; exemplo de endereço `:8082`.
   - 3 quebras novas do CRM em `tests/core/mutacao.py`.
   - Supervisor: linha inútil removida; checagem periódica com `up -d --no-recreate`, com teste.
   - Comentários do Hindsight no Compose e no `modelo.env`.
   - Documentos: runbooks 02, 04, 07, 11, 12 e README; `fase-2-execucao.md`; `LICOES.md`; `PROGRESS.md`; este arquivo.
3. **Não enviar ao GitHub** sem o dono pedir. A branch local está rebaseada sobre `origin/main`, com 3 commits da VPS e mais o pendente.
4. **Entregar ao dono o roteiro** `runbooks/12-primeiro-acesso-vps.md` **com os valores reais**: o IP e a porta SSH que ele deu na conversa. Esses valores vão só na resposta, **nunca no repositório**.

## 1. Disco quase no mínimo (prioridade alta)
- **Medido:** 31 GB livres de 77 GB (eram ~50 GB no começo da sessão). A tela marca "atenção" porque o mínimo dela é 30 GB.
- **Para onde foi (`docker system df`):** imagens 16,9 GB; **cache de construção 7,8 GB** (63 entradas, nenhuma ativa); volumes 0,8 GB.
- Imagens do Heimdall: Hermes 4,55 GB, Krayin derivado 3,3 GB (a base `webkul/krayin:2.2.0`, de 3,14 GB, divide camadas com ele), Hindsight 2,08 GB, trabalhador de áudio 1,87 GB, MySQL 1,1 GB, pgvector 0,64 GB.
- **O que fazer:**
  - Medir o crescimento esperado (acervo, mídias e banco do Hindsight, depois da carga do WhatsApp).
  - Avaliar limpar **só** o cache de construção do Heimdall. O cache é compartilhado com os outros projetos. Pesquisar na documentação local (`docs/docker/reference/cli/docker/builder/prune.md`) um filtro que pegue só o nosso; sem isso, pedir decisão ao dono.
  - Não apagar a imagem do trabalhador de áudio: ela aparece como "reclaimable" só porque o contêiner dela roda sob demanda.
- **Não verificado:** quanto o acervo vai ocupar com o histórico real.

## 2. Parada limpa do MySQL do Krayin — **MEDIDO: não é necessário (2026-10-22, noite)**
> `docker stop` do MySQL e do Krayin: **1,4 s, código de saída 0**, com o banco quase vazio. Nada foi mudado. Reavaliar só se, com a carga do WhatsApp, algum serviço sair com 137.

- **Por quê:** a mesma lição do Postgres (`LICOES.md`, 2026-10-21: código 137 ao parar). O `krayin-mysql` está com a espera padrão.
- **Onde:** `infra/compose/docker-compose.yml` (serviço `krayin-mysql`, e talvez `krayin`). A opção `stop_grace_period` está documentada em `docs/docker/reference/compose-file/services.md`.
- **Teste primeiro:** ampliar a verificação de `tests/infra/check_infra.sh` (a que exige `stop_grace_period` em postgres/hindsight/hermes) para incluir `krayin-mysql`. Isso deixa o teste mais rígido, não mais frouxo: explicar ao dono.
- **Aplicar:** `sh scripts/heimdall.sh iniciar`. Desde 2026-10-22 o supervisor **não** aplica mudança do Compose sozinho.
- **Não verificado:** quanto tempo o MySQL leva para parar.

## 3. Rodízio dos logs — **FEITO (2026-10-22, noite)**
> Implementado no supervisor (`rodar_logs`, 10 MB, `.log.1` modo 600), com teste. Falta só conferir, com o WhatsApp real, que nenhum processo grava conversa/QR/token nesses logs (regra 2).

- **Por quê:** `scripts/heimdall.sh` (`iniciar_um`) grava com `>>` em `data/logs/<processo>.log` e `.erro.log`, e nada corta. Hoje são 32 KB, mas o listener com WhatsApp real vai crescer.
- **Proposta:** antes de subir um processo, se o log passar de N MB (sugestão: 10 MB), renomear para `.1`, guardando só uma cópia. Não usar o `logrotate` do sistema (precisa de `sudo` e mexe em `/etc`).
- **Teste primeiro:** em `tests/ops/check_supervisor.sh`, com um log falso grande.
- **Conferir também (regra 2):** que nenhum processo escreve conteúdo de conversa, número de telefone, QR ou token nesses logs. Não verificado com o WhatsApp real. O listener já tem `protegerConsole` (`LICOES.md`, 2026-10-21).

## 4. Threads do Whisper × teto de CPU
- **Fato:** `apps/media-worker/transcrever.py` cria o `WhisperModel` sem `cpu_threads`; o padrão é "4 by default" (`docs/faster-whisper/source/transcribe.py`, linha 654). O contêiner tem `cpus: 2.0`, então são 4 threads disputando 2 CPUs.
- **Hipótese (não medida):** `cpu_threads=2`, ou o mesmo valor do teto, pode ser igual ou mais rápido e atrapalhar menos os sites.
- **Como decidir:** medir antes e depois com o mesmo áudio sintético de 60 s da medição do `runbooks/06-media-worker.md`, seção "Medido na VPS Linux" (antes: 307 s, 5,11× o tempo real, pico 1389 MB). Só trocar se a medição mostrar ganho. A imagem precisa ser reconstruída, e `check_infra.sh` confere os parâmetros de `transcrever.py`.

## 5. Krayin em inglês e dólar
- **Fato:** `infra/krayin/instalar.sh` roda `krayin-crm:install --skip-env-check`. Com essa opção o instalador usa `locale` `en` e moeda `USD` (código lido em `packages/Webkul/Installer/src/Console/Commands/Installer.php`, dentro da imagem). A interface usa `APP_LOCALE=pt_BR`, mas os dados criados pelo instalador ("Default Pipeline", "New/Won/Lost") ficaram em inglês.
- **O que fazer:** ver nas Configurações do Krayin se dá para trocar moeda e idioma pela tela. É o caminho preferido: o dono faz, sem mexer no banco. Não rodar o instalador de novo: ele usa `migrate:fresh` e **apaga tudo**.

## 6. Link novo da tela sem reiniciar tudo — **FEITO (2026-10-22, noite): `sh scripts/heimdall.sh novo-link`**
> Reinicia só a tela e mostra o link novo; teste prova que os outros 4 processos mantêm o pid. Não verificado: se o listener reconecta sem QR depois de um reinício completo do serviço (WhatsApp real).

- **Hoje:** para gerar um código novo é preciso `systemctl --user restart heimdall.service`, que reinicia os 5 processos, inclusive o listener.
- **Proposta:** uma ação `novo-link` em `scripts/heimdall.sh`. Ela para **só a tela**, pelo registro pid + hora de início; espera o supervisor subi-la de novo (~10 a 15 s); e mostra o link. Teste primeiro em `check_supervisor.sh`.
- **Não verificado:** se o listener reconecta sem pedir QR depois de reiniciar, com o WhatsApp real.

## 7. Teste automático do Krayin com banco vazio
- **Fato:** o caminho "banco vazio" de `infra/krayin/instalar.sh` só rodou à mão. O banco já tinha sido instalado quando o script ficou pronto.
- **Proposta:** um `tests/infra/smoke_krayin.sh` no estilo do `smoke_docker.sh`: projeto Compose descartável e volumes apagados no fim; recusa rodar se a porta 8082 estiver ocupada, para nunca interferir na instalação real. A porta 8082 está fixa no Compose: precisaria virar variável com padrão 8082, sem mudar o comportamento atual. Conferir com o próprio `check_infra.sh`.

## 8. CRM: perder com motivo
- **Fato medido no Krayin real:** a rota de mover etapa ignora o `lost_reason`. O motivo grava com `PUT /api/v1/leads/{id}` (com `status: 0`) ou `PUT /api/v1/leads/attributes/edit/{id}` (`runbooks/04-krayin.md`).
- **Hoje:** `moverEtapa` em `apps/core/src/crm/krayin.ts` não manda motivo, e o fluxo da Fase A propõe "perdido após 7 tentativas" (`fase-2-crm.md`).
- **O que fazer:** decidir com o dono se o motivo (`tentativas_esgotadas` etc.) deve ir para o Krayin. Se sim, criar a chamada com teste de contrato. Nada apaga dados.

## 9. Decisões do dono (registradas no topo do `PROGRESS.md`)
Hindsight 1.0.0 × 1.1.0 (provedor `chatgpt`); velocidade do Whisper (`small` × menor × mais CPU); trazer ou não o acervo e a memória do Windows (o `.env` desta VPS é novo e não combina com o volume exportado de lá); envio ao GitHub.

## Feito nesta mesma janela (para não repetir)
- O supervisor não recria contêineres sozinho: a checagem periódica usa `up -d --no-recreate`, com teste. O serviço foi reiniciado e está `active` com os 5 processos.
- Linha inútil removida do supervisor.
- Comentários errados sobre `chatgpt` no Compose, no `modelo.env` e no runbook 07 corrigidos.
- Roteiro do dono (runbook 12) escrito, com marcadores no lugar do IP e da porta.
- Conferido que nenhum IP ou porta SSH foi para o git.
