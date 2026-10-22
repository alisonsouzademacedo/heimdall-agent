# Execução da fase 2 — concluir o produto e preparar a VPS

**Origem:** pedido do dono em 2026-10-22 (6 itens). **Decisão:** D31 — a validação de ponta a ponta será feita **direto na VPS**; o Omarchy local fica como ambiente de desenvolvimento. **Estado:** em execução.

Regra que não muda: o Heimdall **só envia ao self-chat do dono**; dados e segredos ficam fora do git; Linux-only; **não retroceder** — ajustar e completar o que existe, sem reconstruir.

## Definição de pronto (o portão para subir na VPS)

1. Os 6 itens abaixo concluídos (ou explicitamente adiados pelo dono, com registro).
2. `sh tests/run-all.sh` verde **em Linux** e CI do GitHub verde.
3. O que sobrar de trabalho manual for **só intervenção humana**: ler QR, login do ChatGPT, credenciais/configuração do CRM, decisões de acesso e o deploy em si.
4. Roteiro de deploy na VPS escrito e testado (clone, `.env`, volume da memória, acervo, subir, verificar).

## Itens do dono → frentes de trabalho

### 1. Linux-only (remover a camada Windows) — **feito em 2026-10-22**
Removidos 26 arquivos: `iniciar.cmd`, `instalar/` (instalador, launcher `heimdall.ps1`, `docker-fora.cmd`, `PROMPT-IA.txt`), `spike/preflight/preflight.ps1`, `tests/instalar/`, `tests/preflight/`, `tests/lib/` (falso `.cmd`/PowerShell). Ajustados o workflow (um job Ubuntu), `check_ci.sh` (trava contra a volta da camada Windows), `check_higiene.sh`, `.gitattributes`, `.gitignore`, `README.md`, `AGENTS.md`, `servidor.ts` (mensagem que citava `iniciar.cmd`) e o prompt de continuidade. Registro: `pendencias/2026-10-22-revisao-linux-only.md`.

**Falta ainda:** o **supervisor/ligador Linux** (equivalente ao antigo `heimdall.ps1`: subir/parar/estado dos processos, com pid + hora de início registrados — `LICOES.md`, 2026-10-21) e a revisão dos runbooks 01/08/09/10. Entra na frente 5/F.
**Supervisor feito em 2026-10-22 (VPS):** `scripts/heimdall.sh` + `tests/ops/check_supervisor.sh` + `heimdall.service` (systemd de usuário) ativado com o OK do dono; ver `runbooks/11-supervisor-linux.md`.

### 2. Skill de design (UI UX Pro Max)
Instalar com o mesmo processo das skills do Superpowers: clone e revisão de segurança, cópia da documentação em `docs/ui-ux-pro-max/` (com origem e licença), skill em `.claude/skills/`, entrada em `.claude/skills/ORIGEM.md`, linha na tabela do `AGENTS.md` e ajuste de `tests/docs/check_docs.sh`. Só então usar na tela (item 4).

### 3. Limpeza da documentação
Fazer **inventário antes de apagar**: classificar cada documento em *manter / atualizar / fundir / arquivar*. Nada é apagado sem revisão do dono; o histórico fica no git e, quando útil, em `docs/arquivo/`. Já ajustados: `README.md`, `AGENTS.md`, `PROMPT-CONTINUIDADE-LINUX.md`, nota de histórico no runbook 10. **Feito em 2026-10-22:** `docs/wsl/` e `PROMPT-INICIAL-NOTEBOOK.md` movidos para `docs/arquivo/` (com índice e trava no `check_docs.sh`); `runbooks/09-ligar-as-pecas.md` (Windows) arquivado como `docs/arquivo/runbooks/09-ligar-as-pecas-windows.md`; notas de histórico nos runbooks 01/08 e nas specs `fase-1-*`. **Pendente:** menções a Windows em comentários de testes e revisão final dos links históricos em `PROGRESS.md`/`LICOES.md` (são registro, não instrução).

### 4. Tela de onboarding (não genérica)
Base visual: protótipo em `docs/plano/prototipo-onboarding/` (glassmorphism escuro, Fira Code/Fira Sans, Cormorant, dourado, formato canvas) — nunca aplicado à tela real. A tela deve **mostrar a verdade** de cada etapa (fonte e estado ao vivo), não só ilustração. Por isso a ordem recomendada é estabilizar os estados da frente 5 e só então fechar o visual; o esqueleto visual pode começar depois da frente 2.

### 5. Ponte completa (Hermes–Baileys–Hindsight–Whisper–Markitdown–ChatGPT Plus–Krayin)
| Componente | O que já existe | O que falta | Intervenção humana |
|---|---|---|---|
| Hermes | container no Compose, API em 127.0.0.1:8642, ponte do self-chat | testar o modelo real; expor estado no onboarding | login do ChatGPT |
| Baileys (listener) | escuta só leitura, mídia, testes com Baileys real | QR real, histórico completo, reconexão, estado no onboarding | ler o QR |
| Hindsight (memória) | container, volume, embeddings ONNX, envio de conteúdo | status real ("memória preparada": contagem, última absorção), restauro no VPS | — |
| Whisper (faster-whisper) | media-worker, fila, testes | rodar áudio real de ponta a ponta, estado no onboarding | — |
| Markitdown (PDF) | media-worker, testes | rodar PDF real, estado no onboarding | — |
| ChatGPT Plus | plano do dono, uso pelo Hermes | detectar login/estado e provar extração real | login |
| Krayin (CRM) | decisão D17/D18, documentação em `docs/krayin/`, **fundação local** (config segura, cliente REST, teste de conexão e passo 12) e **Fase A local** (vínculo, proposta `C1`–`C5`, aprovação/recusa no self-chat) | subir no Compose da VPS, funil de 5 etapas, API/token real, validar payloads e testar o fluxo com lead real; ganho/objeção irreversível ainda sem sinal | credenciais/configuração |

### 6. Onboarding como facilitador para leigo
Cada etapa precisa de: **status ao vivo** (fonte real, não texto fixo), **ação guiada** (com confirmação), **explicação simples** e **critério de pronto**. Cobrir todos os passos 1–13, incluindo WhatsApp, provedor de LLM/ChatGPT Plus, memória, CRM, testes e relatórios. Requer endpoints de estado no núcleo e testes de navegador (`tests/navegadores/`).

## Ordem recomendada
1. (feito) item 1 — Linux-only.
2. Item 2 — skill de design (destrava o item 4).
3. Item 5 — ponte, começando pelos **estados** que a tela vai mostrar; Krayin é a maior frente e deve começar cedo.
4. Item 4/6 — tela completa, ligada aos estados reais (visual + facilitador).
5. Item 3 — limpeza de documentação em paralelo e revisão final.
6. Frente F — deploy e validação na VPS.

## Frente F — preparação da VPS
- **Perguntas ao dono:** provedor, distribuição, RAM/vCPU/disco, Docker já instalado, acesso (SSH/chave), como abrir a tela (túnel SSH ou Tailscale), onde ficam os backups.
- **O que sobe:** clone do GitHub (branch `main`); `infra/compose/.env` (reaproveitar — a senha combina com o volume da memória); `data/acervo.sqlite` (+`-wal`/`-shm`), `data/midias/`, `data/bugs/`, `data/backup-volume-pg_data.tar.gz`; **não** subir `auth_info/` nem `logs/`.
- **Recursos estimados:** Postgres 1 GB + Hindsight 2 GB + Hermes 1 GB + media-worker 2 GB (quando ligado) — recomendo **8 GB de RAM** e 4 vCPU para o teste, além de disco para o acervo e as mídias; confirmar com o dono.
- **Sessão única (D2):** VPS e máquina local **nunca** com a mesma sessão do WhatsApp ao mesmo tempo; o teste de ponta a ponta acontece em um lugar só.

## Riscos e cuidados
- Escopo largo (CRM + tela + ponte): uma frente por vez, com teste; não abrir recurso novo.
- Dados de clientes na VPS: manter o espírito da D23 (sem exposição pública) e backup antes de qualquer migração.
- CI vermelho desde 21/10: a remoção da camada Windows pode ter resolvido; confirmar no GitHub Actions após o push.
- Nada de segredo, conversa ou token em commit, log ou resposta.

## Estado na VPS (2026-10-22, noite)
Feito: Compose completo no servidor (com Krayin, tetos de CPU e memória), supervisor e reinício automático, cliente do CRM validado contra o Krayin real (`/api/v1`), tela no ar em `127.0.0.1:8765`. Falta só intervenção humana (túnel, QR, login do ChatGPT, funil do Krayin): `runbooks/12-primeiro-acesso-vps.md`. Decisões pendentes no topo de `PROGRESS.md`.
