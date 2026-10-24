# 13. Operação diária na VPS (comandos conferidos em 2026-10-23)

Para o dono e para qualquer IA. Todos os comandos abaixo foram **executados nesta sessão**, salvo onde diz **[NV]**. A VPS é **compartilhada com sites de clientes**: nunca mexer em nginx, pm2, firewall, SSH, fail2ban nem em contêineres de outros projetos, e **nunca** `docker system/image/builder prune`.

## Ver como está
- Processos e contêineres: `sh scripts/heimdall.sh estado` (tela, listener, executor, memória, ponte; Postgres, Hindsight, Hermes, Krayin, MySQL).
- Tela: no computador do dono, `heimdall` (túnel + link novo; ver `12-primeiro-acesso-vps.md`). No servidor: `sh scripts/heimdall.sh link` (o link tem código de uso único: **nunca colar em conversa, log ou commit**) e `sh scripts/heimdall.sh novo-link` (reinicia só a tela).
- Progresso, tokens e teto: passo **Processar** da tela. Cota real do plano: `docker exec heimdall-hermes-1 hermes usage --provider openai-codex --json` (mostra a janela de 5 h e a semanal; as porcentagens são arredondadas).
- Login do modelo: `docker exec heimdall-hermes-1 hermes auth status openai-codex` (deve dizer `logged in`). Refazer: `ssh -t heimdall "docker exec -it heimdall-hermes-1 hermes model"`.
- Gasto "por fora": o Hermes guarda a própria contagem em `/opt/data/state.db` (tabela `session_model_usage`); comparar com o painel do Heimdall serve de conferência.

## Parar, pausar e reiniciar
- **Pausar só o gasto de cota:** botão **Pausar processamento** (passo Processar). O teto diário (`processamento.teto_diario`, hoje 600.000 tokens) também pausa sozinho até o dia seguinte.
- **Pausar a busca antiga:** botão **Pausar busca antiga** (passo Sincronizar). Ela se encerra sozinha com 10 respostas vazias seguidas e só pausa com 5 falhas seguidas.
- **Parar o Heimdall:** `systemctl --user stop heimdall.service` (os contêineres continuam). Tudo: `sh scripts/heimdall.sh parar --com-docker`. Religar: `systemctl --user start heimdall.service`.
- **Reiniciar UM processo** (o supervisor o religa): `kill <PID>` com o PID de `data/processos.json`. O listener reconecta ao WhatsApp **sem QR** (comprovado duas vezes). **Nunca** `pkill -f` nem `ps | grep | kill` por texto: o padrão casa com o próprio comando e o derruba (aconteceu duas vezes).
- **Aplicar mudança do `config.yaml` do Hermes:** `sh scripts/heimdall.sh config-hermes` (preserva a seção `model:` do login; reinicia só o Hermes depois de o Hindsight estar saudável).
- Nada de `docker compose create/up` para "preparar" o Hermes (recria Postgres e Hindsight; `LICOES.md`, 2026-10-22).

## O que roda sozinho
- **`heimdall.service`** (systemd de usuário, reinício automático) supervisiona os 5 processos. **Não há cron do Heimdall.** O `crontab` do usuário `pedro` tem tarefas de **outro projeto** (V360 Dashboard): não são nossas, não mexer.
- **Agenda (08:00, fuso de São Paulo):** segunda = relatório **semanal**; terça a sexta = **diário**; fim de semana nenhum. Entregue **só no self-chat**. Se o servidor estiver fora do ar às 08:00, sai quando voltar, até as 20:00.
- **Extração:** processa os dias novos que fecham, do mais novo para o mais antigo, dentro do teto diário. **Backup:** o primeiro uso do dia grava `~/heimdall-backups/acervo-AAAA-MM-DD.sqlite` (rodízio de 30 dias; só mexe em nomes nesse formato).

## Falar com o Heimdall (self-chat do WhatsApp)
Só `/heimdall <pergunta>` vai ao modelo. Respondem **por código, sem gastar token:** `/heimdall ajuda`, `hoje`, `aguardando`, `followups`, `cliente <nome>`. Sem prefixo funcionam só os comandos curtos: `ok 1 e 3` / `C1 ok, C2 não` (CRM), `A1`, `F2`, `P1` (correções do relatório) e a frase de confirmar apagar. O resto do que o dono escreve ali fica guardado, sem resposta.

## Testar
- Bateria completa (~40 min; **não edite arquivos enquanto ela roda**, o resultado não vale): `PLAYWRIGHT_MODULE=$HOME/.local/share/heimdall-playwright/node_modules/playwright nice -n 19 sh tests/run-all.sh`.
- **Teste real da extração** (obrigatório antes de dizer "pronto" em qualquer mudança que dependa da resposta do modelo; gasta ~5,6 mil tokens por dia de conversa, roda numa **cópia** do acervo e imprime só contagens): `sh tests/infra/smoke_extracao_real.sh 8`.
- Teste de navegador da tela: `HEIMDALL_CAPTURAS=<pasta> sh tests/navegadores/check_navegadores.sh` (Chromium sem janela).

## Backup e restauração
- Pasta: `~/heimdall-backups/` (modo 700; arquivos 600). **Está no mesmo disco da VPS: protege de erro e de banco corrompido, não de perder o servidor.** Copiar para fora (ex.: `scp` do computador do dono) é um próximo passo.
- `antes-do-processamento-2026-10-23.sqlite`: instantâneo de antes dos clientes e da extração (o rodízio não o toca; pode ser apagado quando o dono quiser).
- **Restauração:** código em `apps/core/src/backup.ts` (reaplica a lista de esquecimento); **não foi exercitada nesta sessão [NV]**. Antes de restaurar, parar o serviço e guardar uma cópia do acervo atual.

## Dados sensíveis (regra 2 do AGENTS.md)
`data/` e `infra/compose/.env` ficam fora do git. `data/revisao/*.md` (revisão de qualidade) contém **conversas reais**: ler, conferir e apagar. Nunca imprimir token, chave, link da tela, número ou conteúdo de conversa em log, commit ou resposta.
