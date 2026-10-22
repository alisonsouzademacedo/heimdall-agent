# Pendência: revisão do repositório para Linux único (limpeza da camada Windows e gordura morta)

**Estado:** **executada em 2026-10-22** (o dono pediu para começar na hora, sem esperar a migração). A camada Windows foi removida e o CI ficou só com o job Ubuntu; a suíte completa foi rodada nesta máquina. O que ainda falta está na seção "Execução" abaixo e no programa `../fase-2-execucao.md`.

## Inventário (leitura real do repositório, 2026-10-22)
- Testes: **45 arquivos** em `tests/`. Por pasta: instalar 11, infra 7, carga 7, seguranca 3, repo 2, navegadores 2, preflight 2, core 2, lib 2; +1 em cada: run-all, trabalhos, prompts, listener, docs, ponte, memoria.
- Código de produção só de Windows: `iniciar.cmd`; `instalar/` (`assinatura.ps1`, `docker-fora.cmd`, `docker-fora.ps1`, `docker-reparo.ps1`, `fora-do-pacote.ps1`, `heimdall.ps1`, `instalar.ps1`; o `PROMPT-IA.txt` e o `README.md` do instalador morrem junto); `spike/preflight/preflight.ps1`.
- CI: job `windows` (Node 22 e 24) do `.github/workflows/testes.yml`.

## O que morre com o Windows (15 arquivos de teste)
- `tests/instalar/` (11): `assinatura.teste.ps1`, `check_ambiente_windows.sh`, `check_assinatura.sh`, `check_docker_reparo.sh`, `check_fora_do_pacote.sh`, `check_instalar.sh`, `check_launcher.sh`, `check_socket_real.sh`, `docker-reparo.teste.ps1`, `fora-do-pacote.teste.ps1`, `socket-real.teste.ps1`.
- `tests/preflight/` (2): `check_ps1.sh`, `mocks.ps1`.
- `tests/lib/` (2): `so.sh`, `check_so.sh` — a biblioteca de falsos para os dois sistemas existe só para servir as suítes acima (conferido: só elas a carregam).

**Atenção antes de deletar:** extrair as lições que valem no Linux para o futuro ligador/supervisor (registro com pid **e hora de início** — `LICOES.md`, 2026-10-21; nunca confiar só no pid, o sistema reaproveita números). A lição fica sempre; o teste vira um teste **Linux novo** quando o ligador Linux nascer.

## O que precisa de ajuste (higiene do repositório)
- `tests/repo/check_higiene.sh`: cita `iniciar.cmd` (par de fim de linha CRLF) e regras de Windows; ajustar.
- `tests/repo/check_ci.sh`: confere o job `windows` e passos Windows; reescrever para o CI só-Linux.
- `.github/workflows/testes.yml`: remover o job `windows`; manter o job do Ubuntu.
- Textos e regras que citam Windows: `AGENTS.md` (tabela do WSL/Docker Desktop e a regra do Docker Desktop dentro do app Claude; trocar "Windows primeiro" por "Linux" onde couber; **manter** as regras gerais de Node/encoding/versões), `README.md` da raiz (fluxo de instalação), `docs/plano/PROMPT-INICIAL-NOTEBOOK.md`, runbooks 01, 08, 09 e 10, `apps/core/src/onboarding/servidor.ts` (menciona `iniciar.cmd`). Os documentos `fase-1-*` são registro histórico: não reescrever.

## O que fica (o "seguro" contra alucinação — não mexer)
`tests/core` (inclui o teste de mutação), `tests/carga`, `tests/listener`, `tests/memoria`, `tests/ponte`, `tests/trabalhos`, `tests/prompts`, `tests/seguranca`, `tests/navegadores`, `tests/infra`, `tests/docs`, `tests/run-all.sh`; `docs/plano/LICOES.md`; toda a biblioteca `docs/`.

**Regra:** um teste só morre junto com a **função** que ele protege; nenhum teste de regra viva é apagado.

## Execução em 2026-10-22 (o que foi feito)

- **Produção Windows removida:** `iniciar.cmd`, `instalar/` inteiro (instalador, `heimdall.ps1`, `docker-fora.cmd`, `docker-reparo.ps1`, `fora-do-pacote.ps1`, `assinatura.ps1`, `PROMPT-IA.txt`, `README.md` do instalador) e `spike/preflight/preflight.ps1`.
- **Testes Windows removidos junto com a função** (26 arquivos no total): `tests/instalar/` (11), `tests/preflight/` (2), `tests/lib/` (2).
- **Ajustes:** `.github/workflows/testes.yml` (só job Ubuntu, `REQUIRE_NODE=1`), `tests/repo/check_ci.sh` (reescrito para Linux-only, com trava contra a volta da camada Windows), `tests/repo/check_higiene.sh` (par de fim de linha só do `.sh`), `.gitattributes`, `.gitignore`, `README.md`, `AGENTS.md`, `apps/core/src/onboarding/servidor.ts` (mensagem que citava `iniciar.cmd`), `docs/plano/PROMPT-CONTINUIDADE-LINUX.md` e nota de histórico no runbook 10.
- **O que fica em aberto:** supervisor/ligador Linux (equivalente ao `heimdall.ps1`, com pid + hora de início), revisão dos runbooks 01/08/09/10 e validação final da suíte em Linux/VPS.
- **Decisão do dono (2026-10-22, por mensagem):** remover também `spike/preflight/` e `tests/seguranca/` (preparação do Strix). Feito nesta mesma limpeza; o `preflight` não é mais usado pela tela e o Strix não foi adotado.

## Ordem proposta (um commit pequeno por passo; suíte completa depois de cada um)
1. Linha de base na máquina Linux (`sh tests/run-all.sh`) e identificação da falha do Ubuntu no CI (`pendencias/2026-10-21-ci-vermelho-no-github.md`). Se a falha estiver nas suítes que vão morrer (instalar/launcher/preflight), a própria limpeza a resolve.
2. Deletar produção Windows + os 15 testes deles (mesmo commit, para nunca haver teste órfão nem código sem teste).
3. Ajustar `check_higiene.sh`, `check_ci.sh` e o workflow (remover o job Windows).
4. Atualizar `AGENTS.md`, `README.md`, runbooks e `servidor.ts` para Linux único (manter as regras gerais; remover só o que era do Windows).
5. Rodar: suíte completa, `tsc`, mutação; registrar em `LICOES.md` o que a limpeza ensinou; atualizar `PROGRESS.md`.
6. Segunda olhada em "gordura morta" restante (ex.: `tests/seguranca/strix` — Strix não adotado, custa por uso; resto de `spike/preflight/`) — item a item, com OK do dono.

## Perguntas para o dono
1. Fazer esta limpeza **depois** da migração (recomendado) ou antes?
2. `spike/preflight/preflight.sh` (versão Linux do preflight) pode morrer também? A tela já faz a verificação de ambiente em Node (`apps/core/src/onboarding/ambiente.ts`).
3. Manter `tests/seguranca/strix` para o futuro ou remover agora?
