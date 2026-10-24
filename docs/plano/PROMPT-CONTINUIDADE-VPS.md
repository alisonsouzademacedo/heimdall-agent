# Prompt de continuidade — VPS (atualizado no fim da sessão de 22 a 23/10/2026)

Cole o texto abaixo no Claude Code aberto em `~/heimdall` (de preferência dentro do `tmux`). Fonte única: este arquivo.

---
Você está na VPS (Ubuntu 24.04, 4 vCPUs sem AVX, ~7,8 GB), usuário `pedro`, em `~/heimdall`. O servidor **hospeda sites ONLINE de clientes**: NUNCA pare, reinicie, apague ou altere nginx, pm2, firewall, SSH, fail2ban nem contêineres, `crontab` ou arquivos de outros projetos (o `crontab` do `pedro` é do projeto V360 Dashboard, não do Heimdall); nada de `docker system/image/builder prune`; testes pesados com `nice -n 19`. O dono não é programador (usa Omarchy/Linux): explique em português simples, sem presumir o gênero de ninguém. **Nunca mate processo por texto (`pkill -f`, `ps | grep | kill`): use o PID de `data/processos.json`. Não edite arquivos enquanto `tests/run-all.sh` roda.**

ANTES DE AGIR, leia por inteiro: `AGENTS.md` (regras inegociáveis e as de método), o topo de `docs/plano/PROGRESS.md`, **`docs/plano/pendencias/2026-10-23-fechamento-da-sessao.md`** (estado real, números, decisões e próximos passos), `docs/plano/runbooks/13-operacao-na-vps.md` e a seção "Registro" de `docs/plano/LICOES.md` de 2026-10-23. Decisões do dono: `docs/plano/README.md`, D33 a D38.

ESTADO (verificado em 2026-10-23): piloto (MVP) funcionando. WhatsApp conectado (reconecta sem QR); 257 clientes cadastrados (quem respondeu); extração completa de 529 consultas (218 nomes, 110 empresas, 81 compromissos, 68 sinais) com Luna/esforço baixo; CRM com o "Funil Heimdall" (teste verde); backup local em `~/heimdall-backups` (mesmo disco); relatórios de teste e teste do self-chat enviados; agenda automática às 08:00 (segunda semanal, terça a sexta diário). Extração **liberada**, teto 600.000 tokens/dia (consome cota do ChatGPT Plus; pausar pela tela). Nenhum cron do Heimdall; o supervisor é o `heimdall.service`.

NÃO IMPLEMENTADO: voz e personalidade; MCP próprio (o Hermes não lê o acervo); dossiês; aprendizado pelo resultado; agrupar clientes por empresa; transcrição melhor que o Whisper `small`; backup fora da VPS; "dar a busca antiga por concluída".

PRIMEIRO: (1) confira `sh scripts/heimdall.sh estado`, `hermes auth status openai-codex` e a cota (`hermes usage --provider openai-codex --json`); (2) pergunte ao dono se leu os 2 relatórios de teste, respondeu ao teste do self-chat e conferiu `data/revisao/` (conversas reais: depois apagar); (3) veja se a agenda de segunda 26/10 às 08:00 saiu (semanal) e como ficou. Depois siga a seção 8 do fechamento, **nesta ordem**: refazer ~80 dias com o calendário (**pedir OK: ~350 mil tokens**), voz e personalidade, cliente = empresa, backup fora da VPS.

REGRAS DE OURO: o Heimdall só envia ao self-chat; segredos, o link da tela, números e conversas nunca em git, log ou resposta; **teste que falha primeiro e nunca enfraquecer teste; fluxo que depende do modelo só está "pronto" depois do teste REAL (`sh tests/infra/smoke_extracao_real.sh`), com as contagens à vista; não faça chamadas ao modelo (sondas) sem o dono pedir**; mudanças pequenas; registrar no `PROGRESS.md` e `LICOES.md`; commit com `Co-Authored-By`; push só com `PLAYWRIGHT_MODULE=$HOME/.local/share/heimdall-playwright/node_modules/playwright nice -n 19 sh tests/run-all.sh` verde, sem `--force`, via `git@github.com:alisonsouzademacedo/heimdall-agent.git`.
---
