# 10. Testes e caminhos por sistema operacional (Windows e Linux)

Este roteiro diz **o que o Heimdall faz em cada sistema**, **quais testes rodam onde** e **como escrever um teste que roda nos dois**. Origem: decisão do dono em 2026-10-20 ("criar um ambiente de testes e soluções para ambos os sistemas, tudo documentado e com testes de regressão") e `LICOES.md` (2026-10-20, "programas falsos"). O que não foi executado está marcado **[não verificado]**.

## 1. Como o Heimdall escolhe o caminho por sistema
| Sistema | Entrada | O que acontece | Situação |
|---|---|---|---|
| **Windows 11** | duplo clique em `iniciar.cmd` → `instalar\instalar.ps1`; depois `instalar\heimdall.ps1` (launcher) | O instalador verifica, **explica, pergunta** e só então instala (`winget`; o Docker pelo instalador oficial, com assinatura conferida). Virtualização, WSL, memória livre e o `engine.sock` preso do Docker só são medidos aqui. O Docker é aberto por `instalar\docker-fora.cmd` (fora do app Claude; ver `01-docker.md`). | Existe e foi testado no Windows do dono |
| **Linux (inclui a VPS)** | **não há instalador**. O `instalar.ps1` detecta que não é Windows (`$env:OS`) e **recusa** com a mensagem "siga docs/plano/runbooks/" (`instalar.ps1`, linhas 58 a 62) | Instalação manual pelos roteiros `01` a `09` e migração em `../fase-2-migracao-para-vps.md` (decisão D30) | **[não verificado]** em máquina Linux real; um instalador Linux (`instalar.sh`) **ainda não existe** e seria um passo próprio |
| **macOS** | nenhuma | fora do escopo | não previsto |

A detecção do sistema nos **testes** é separada: `tests/lib/so.sh` define `SO` = `windows`, `linux` ou `mac` (por `uname -s`). Os testes de shell usam isso para criar os programas falsos certos. **Os testes de comportamento do instalador do Windows rodam também no Linux** (com `HEIMDALL_TESTE=1`, que faz o instalador aceitar rodar fora do Windows), para o GitHub pegar erros sem precisar de uma máquina Windows.

## 2. Quais testes rodam onde
| Conjunto | Windows (Git Bash + PowerShell 7) | Linux (GitHub Ubuntu + PowerShell 7) | Observação |
|---|---|---|---|
| `tests/lib/check_so.sh` (a biblioteca de falsos) | sim | sim | alicerce das duas suítes abaixo |
| `tests/instalar/check_instalar.sh` | sim (cenário L, memória, só aqui) | sim (cenário L marcado "não se aplica") | falsos `.cmd` no Windows, `sh` no Linux |
| `tests/instalar/check_launcher.sh` | sim | sim | o `node` falso fica vivo ~25 s (`ping` no Windows, `sleep` no Linux) |
| `tests/instalar/check_fora_do_pacote.sh` | sim | sim | |
| `tests/preflight/check_ps1.sh` (verificador de ambiente) | sim (`caminho_nativo` nos caminhos) | sim | testes 2 e 3 exigem o PowerShell 7 |
| `tests/instalar/check_socket_real.sh` | sim | sim | socket Unix de verdade, precisa do PowerShell 7 |
| `tests/instalar/check_docker_reparo.sh` | sim | sim | |
| `tests/instalar/check_ambiente_windows.sh`, `check_assinatura.sh` | sim | parte Windows pulada | assinatura digital só existe no Windows |
| `apps/*` (`npm test`) | sim | sim | sem dependência de sistema |
| `tests/infra/smoke_*.sh` | sim (**[não verificado]** todos) | sim (rodados na nuvem) | Docker real, pesados, manuais |
| `tests/navegadores/check_navegadores.sh` (tela) | sim (Chrome instalado; `PLAYWRIGHT_MODULE` apontado à mão) | só onde houver Playwright + navegador; senão `[NAO EXECUTADO]` | `REQUIRE_NAVEGADOR=1` faz a falta contar como falha |

Rodar: `sh tests/run-all.sh` (tudo), ou um conjunto: `REQUIRE_PWSH=1 sh tests/instalar/check_launcher.sh` (`REQUIRE_PWSH=1` faz a falta do PowerShell 7 contar como falha). **PowerShell 7 no Windows:** `winget install --id Microsoft.PowerShell` (instalado nesta máquina em 2026-10-20, versão 7.6.7).

**Honestidade sobre o Linux:** depois de criar `tests/lib/so.sh`, os conjuntos acima foram executados **no Windows**. O caminho Linux usa os mesmos comandos de antes, mas **só o GitHub (Ubuntu) o confirma** [não verificado localmente].

## 3. Ganchos de teste (variáveis `HEIMDALL_TESTE_*`)
Todos só valem com `HEIMDALL_TESTE=1` (exceto onde indicado) e existem para o teste **não depender do computador onde roda**. Cada gancho é testado **dos dois lados**.
| Variável | O que fixa | Onde |
|---|---|---|
| `HEIMDALL_TESTE=1` | liga o modo de teste (o instalador aceita rodar fora do Windows; o Docker não é baixado; a tela não abre; `AtualizaPath` não troca o PATH) | `instalar.ps1`, `fora-do-pacote.ps1` |
| `HEIMDALL_TESTE_VIRT` / `_WSL` (0 ou 1) | virtualização ligada e WSL instalado | `instalar.ps1` |
| `HEIMDALL_TESTE_DOCKER_RODANDO` (0 ou 1) | o Docker "está funcionando" | `instalar.ps1`, `heimdall.ps1` |
| `HEIMDALL_TESTE_SECRETS_DIR` | pasta do `docker-secrets-engine` (falsa) | `instalar.ps1` |
| `HEIMDALL_TESTE_MEM_LIVRE_MB` | memória livre em MB (só no Windows, que é onde se mede) | `instalar.ps1` |
| `HEIMDALL_TESTE_EMPACOTADO` (0 ou 1) | "este terminal está dentro do app Claude" | `fora-do-pacote.ps1` |
| `HEIMDALL_TESTE_ABRIR_LOG` | só anota o comando de abrir, em vez de abrir | `fora-do-pacote.ps1` |
| `HEIMDALL_SEM_NAVEGADOR=1` | a tela não abre o navegador (sem `HEIMDALL_TESTE`) | `apps/core/src/onboarding/iniciar.ts` |

## 4. Como escrever um teste que roda nos dois sistemas
1. No começo do `.sh`: `. tests/lib/so.sh`.
2. **Nunca** crie programa falso como script sem extensão (`printf '#!/bin/sh...' > pasta/node`): no Windows o sistema abre a janela "escolher um programa" e o teste falha. Use `falso_saida`, `falso_anota` ou `falso_script` (um corpo por sistema; `.cmd` em CRLF no Windows).
3. Variável de ambiente ou arquivo `.cmd` com caminho: use `caminho_nativo` (vira `C:/...` no Windows).
4. PATH só com os falsos? No Windows o **Git real** precisa das pastas dele: `PATH="$B$PATH_GIT"`.
5. Processo de teste que você criou: `vivo <pid>` e `matar <pid>` (nunca por nome). Apagar a pasta no fim: `limpar_pasta` (o falso fica vivo ~25 s segurando os logs no Windows).
6. O que só existe em um sistema (memória livre no Windows) vira um cenário que imprime `[NAO SE APLICA]` no outro. **Nunca** pular um teste em silêncio: a regra 5 do `AGENTS.md` continua valendo.

## Armadilhas (resumo; detalhes em `../LICOES.md`, 2026-10-20)
- Falso sem extensão no Windows → janelas "escolher programa" para `node` e `python` e dezenas de falhas falsas.
- `AtualizaPath` troca o PATH inteiro pelo do sistema: no teste, apagava os falsos (instalou 1 de 3 programas). Em teste ele não troca.
- Git real com PATH restrito → `git fetch` trava com código `-1073741819` (violação de acesso). Use `PATH_GIT`.
- Git Bash converte `/app/...` em `C:/Program Files/Git/app/...` nos argumentos de `docker run`. Nos smokes use `drun` e `hpath` de `tests/infra/lib_docker.sh` (nunca `docker run` solto; o `check_infra.sh` confere).
- `$?` depois de um pipe é do último comando do pipe (era o `tr`, não o programa testado).
- O comando `python3` no Windows é o atalho falso da Loja (`LICOES.md`, 2026-10-19).
- Teste de navegador (`tests/navegadores/tela.mjs`): o predicado de `waitForFunction` tem de ser **função**, nunca texto — com texto os relógios da página PARAM durante a espera (medido: 0 ticks de 1 s e 0 chamadas de rede em 12 s) e o teste falha mesmo com a tela certa (`LICOES.md`, 2026-10-21).
