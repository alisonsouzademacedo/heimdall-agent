# Prompt de continuidade — Heimdall na máquina nova (Linux/Omarchy)

**Como usar:** abra a IA dentro da pasta do repositório clonado e cole o bloco abaixo (fonte única: este arquivo).

---

Você é a IA que vai continuar o projeto Heimdall numa máquina nova (Omarchy/Linux). Sou o dono; não sou programador: explique em português simples e mostre evidência real de tudo.

ANTES DE QUALQUER AÇÃO, leia por inteiro, nesta ordem:
1) `AGENTS.md` (as 6 regras inegociáveis valem acima de tudo)
2) `docs/plano/PROGRESS.md` — últimas entradas de 2026-10-21 (noite e noite 2): onde paramos
3) `docs/plano/LICOES.md` (topo, entradas de 2026-10-21) e `docs/plano/runbooks/README.md` (seção "Onde ficam os dados reais")
4) `docs/plano/pendencias/2026-10-21-historico-antigo-respostas-vazias.md` e `docs/plano/pendencias/2026-10-21-whatsapp-428-desktop.md`
5) `docs/plano/runbooks/10-testes-windows-e-linux.md` (matriz dos dois sistemas)

CONTEXTO DA MIGRAÇÃO: a máquina antiga (Windows 11) foi formatada para o Omarchy. Tudo está no GitHub (branch `main`; o clone já traz tudo; o repositório é público). O dono copiou do pendrive para DENTRO deste clone: `data/acervo.sqlite` (+ `-wal`/`-shm`), `data/midias/`, `data/bugs/`, `data/backup-volume-pg_data.tar.gz` (memória do Hindsight exportada; restauro testado no Windows: 1491 arquivos nos dois lados) e `infra/compose/.env` (a senha do Postgres que combina com o volume). Confira que tudo chegou; se faltar algo, pare e avise o dono.

PASSOS (um de cada vez; antes de cada um diga o que vai fazer e como eu confiro; PARE e peça minha confirmação antes de instalar programas, abrir portas, login, QR ou apagar qualquer coisa):
1. Linha de base: rode os testes existentes ANTES de mexer (a matriz de `runbooks/10` diz como rodar em Linux; `sh tests/run-all.sh`). Mostre a saída real. **Atenção: o CI do GitHub está vermelho desde 21/10 (ubuntu e Windows) — veja `pendencias/2026-10-21-ci-vermelho-no-github.md`; se algum teste falhar aqui no Linux, é a mesma falha: conserte-a (com teste que falhava primeiro) antes de seguir.**
2. Adapte o que era só de Windows (o lançador `instalar/heimdall.ps1`, `docker-fora.cmd` e os trechos de WSL não valem aqui — a matriz do runbook 10 separa os dois sistemas; ainda não existe instalador de um clique em Linux). Mudança pequena, com teste que falhava antes, registro em `LICOES.md`/roteiros e commit.
3. Restaure a memória do Hindsight ANTES de o Postgres subir pela primeira vez: `docker volume create heimdall_pg_data` e `docker run --rm -v heimdall_pg_data:/de -v "$PWD/data:/para:ro" alpine tar xzf /para/backup-volume-pg_data.tar.gz -C /de`.
4. Suba os serviços (Compose + os processos), pareie o WhatsApp (QR — me peça na hora, diga exatamente o que fazer) e confira no banco: `whatsapp.estado` conectado; acervo com ~6.526 mensagens e 662 conversas.
5. Libere a busca antiga (passo "Sincronizar" da tela) e deixe a volta completa rodar (~19 h para o 1º pedido de cada conversa; ~38 h para todas concluírem). Critério de decisão e próximos passos: `pendencias/2026-10-21-historico-antigo-respostas-vazias.md`.
6. Fila restante: deixar o CI verde de novo (ver passo 1); itens 28/29 do `runbooks/08-testes-de-fumaca.md` (teste do modelo Hermes real precisa do meu login do ChatGPT); o que o PROGRESS apontar como "não verificado"; e o resto da migração, incluindo a limpeza Linux-only proposta em `pendencias/2026-10-22-revisao-linux-only.md`.

REGRAS DE OURO: o Heimdall só envia mensagem ao meu self-chat (nunca a ninguém mais); dados e segredos nunca vão para git, commit ou chat (nunca imprima token, chave ou conversa); o push ao GitHub está autorizado (a cada passo, com mensagem clara); todo erro resolvido vira teste que falhava + correção + `LICOES.md` + roteiro; não enfraqueça testes; mudanças pequenas; atualize `PROGRESS.md` a cada passo. Eu alterno entre IAs (você, Codex, Claude Code): a documentação precisa bastar sozinha.

Comece pelo passo 1 (linha de base).

---

## Notas
- Se o clone abrir noutra branch (o padrão do GitHub pode ainda apontar para uma branch antiga), rode `git switch main` e confira `git log --oneline -1`.
- Guardar o pendrive de backup sem mexer até a máquina nova estar funcionando.
