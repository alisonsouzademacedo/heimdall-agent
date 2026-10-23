# Prompt de continuidade — VPS (atualizado em 2026-10-23, noite)

Cole o texto abaixo no Claude Code aberto em `~/heimdall` (de preferência dentro do `tmux`).

---
Você está na VPS de produção (Ubuntu 24.04, 4 vCPUs sem AVX, ~7,8 GB), usuário `pedro`, em `~/heimdall`. O servidor hospeda sites ONLINE de clientes: NUNCA pare, reinicie, apague ou altere nginx, pm2, firewall, SSH, fail2ban nem contêineres de outros projetos; nada de `docker system/image/builder prune`; testes pesados com `nice -n 19`. O dono não é programador (usa Omarchy/Linux): explique em português simples. A senha do SSH dele foi colada numa conversa antiga: lembre-o de trocá-la (`passwd`) e de usar chave.

ANTES DE AGIR, leia por inteiro: `AGENTS.md`, o topo de `docs/plano/PROGRESS.md`, `docs/plano/pendencias/2026-10-23-observacoes-do-dono-na-tela.md` (seções 6 a 8) e `docs/plano/runbooks/{03,07,12}`.

ESTADO: tudo no GitHub (`main`, bateria verde: núcleo 503 + ponte 74 testes, 13 arquivos, mutações detectadas, navegador real). WhatsApp conectado (busca antiga PAUSADA). Hermes logado (ChatGPT Plus, `hermes auth status openai-codex`). Padrão de modelo: GPT-6 Luna/esforço baixo em conversa, extração e teste; relatórios no padrão do Hermes (Sol). Prompt do Hermes enxuto (~2,3 mil tokens por pedido). Self-chat: só `/heimdall ...` vai ao modelo; `/heimdall ajuda|hoje|aguardando|followups|cliente <nome>` respondem por código, sem token. Tela (túnel SSH, `heimdall` no Omarchy): passo Processar com barra ao vivo, tokens, teto diário (padrão 300.000), botão "Cadastrar como clientes os N contatos que responderam" e escolha de modelo por tarefa. Extração vai do dia mais novo para o mais antigo e identifica nome e empresa nas conversas (só confiança >= 0,7).

OBJETIVO: acompanhar ao vivo, com o dono, o primeiro processamento real: (1) cópia de segurança do acervo; (2) ele cadastra os clientes pela tela; (3) teto baixo (ex.: 30.000) e "Começar"; (4) você monitora `/api/processamento` (progresso, tokens, média por consulta), `hermes usage --provider openai-codex --json` (janelas de 5 h e semanal) e a tabela `consumo_modelo`; (5) conferir 5 extrações a olho contra a conversa (nome, empresa, compromissos); (6) medir a cota antes de subir o teto. Nunca imprima conversa, token ou o link da tela.

PENDÊNCIAS COM O DONO: disco (30 GB livres; o cache de construção do Docker tem ~9,5 GB, é compartilhado e não dá para separar o que é nosso); apagar `~/heimdall-import/` (78 MB, só com OK explícito); experimento de UM arquivo com erro 403 (pedir reenvio ao celular; `baixar.ts` só pede em 404/410); regra de grupos de clientes por empresa; Hindsight 1.1.0 (recomendado seguir sem modelo); lacunas (b) SOUL.md e skills no Hermes, (c) MCP próprio do Heimdall, (d) dossiês e aprendizado pelo resultado.

REGRAS: o Heimdall só envia ao self-chat; segredos e conversas nunca em git, log ou resposta; teste que falha primeiro; nunca enfraquecer teste; mudanças pequenas; registrar no `PROGRESS.md`/`LICOES.md`; commit com `Co-Authored-By`; push só com `nice -n 19 sh tests/run-all.sh` verde (use `PLAYWRIGHT_MODULE=$HOME/.local/share/heimdall-playwright/node_modules/playwright`), sem `--force`, via `git@github.com:alisonsouzademacedo/heimdall-agent.git`.
---
