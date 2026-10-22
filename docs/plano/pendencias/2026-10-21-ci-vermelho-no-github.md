# Pendência: CI do GitHub vermelho desde 2026-10-21 (ubuntu e Windows) — na máquina do dono os mesmos testes passam

**Estado (2026-10-21 ~19:26 local):** aberta. Todas as rodadas de 21/10 no GitHub falharam; o CI estava verde em 20/10 (`#77`, `main` em `ff86dad`). As rodadas novas do fim do dia (`#90`–`#93`, commits `2dd3bf6`, `346fe0e`, `4a3fa08` na `main` e na `windows-python-nos-testes`) estavam **em andamento** na hora deste registro; pelo histórico (os mesmos passos), o esperado é falharem igual. **Não é consequência do trabalho de desligamento/migração** — já falhava antes.

## Sintoma (evidência das rodadas vermelhas)
Rodadas `#78` e `#79`–`#89` (`88bea7d`, `82fa46a`, `0bd4030`…): `conclusion = failure`. Passos que falham (o resto do trabalho fica **pulado**, não verde):
- Job **testes** (ubuntu-latest): passo `Rodar todos os testes` → `REQUIRE_PWSH=1 REQUIRE_NODE=1 sh tests/run-all.sh` (`.github/workflows/testes.yml`, linhas 20-21).
- Jobs **windows (22)** e **windows (24)**: passo `Instalador - comportamento no Windows (falsos .cmd)` → `REQUIRE_PWSH=1 sh tests/instalar/check_instalar.sh` (linhas 84-85). Os passos seguintes (launcher, preflight) foram pulados.
- As anotações do GitHub dizem apenas "Process completed with exit code 1." (sem nome de teste), e os logs exigem login: **conferir no navegador logado** (ou reproduzir localmente).

## O que já se sabe (local, 21/10, Windows 11 do dono)
- `REQUIRE_PWSH=1 sh tests/instalar/check_instalar.sh` → **"RESULTADO: tudo passou"** (rc=0). O passo que falha no runner Windows passa aqui: **é defeito do ambiente do CI** — a classe que o `AGENTS.md` proíbe ("teste não pode depender do estado do computador").
- `sh tests/run-all.sh` no Windows do dono (Git Bash) passou (22 arquivos de teste, registrado na rodada anterior de 21/10). O lado **Linux** do `run-all` ainda não foi reproduzido — é exatamente onde a próxima IA vai trabalhar.

## Hipóteses (NÃO verificadas)
1. Dependência escondida do ambiente do runner: versão do `pwsh`, presença/ausência de `winget`/`py`/`cmd` falsos no Git Bash do runner, ordem do `PATH`, `cmd.exe` do Windows Server (2022/2025).
2. Mudança de imagem do runner (o GitHub avisa: `ubuntu-latest` migra para Ubuntu 26 a partir de 19/10/2026). `#77` estava verde em 20/10 — não confirma nem descarta.
3. Alguma mudança de 21/10 nos testes do instalador (`check_instalar.sh` cresceu ~67 linhas no dia) introduziu dependência de ambiente.

## Próximo passo (máquina nova / Linux)
1. Reproduzir o lado Ubuntu: `REQUIRE_PWSH=1 REQUIRE_NODE=1 sh tests/run-all.sh` e anotar **qual arquivo de teste falha**. Corrigir com **teste que falhava primeiro** (a regra do `AGENTS.md`), sem enfraquecer nada.
2. Reproduzir o passo do instalador (falsos `.cmd`) num ambiente que simule o runner; a suíte já roda com `HEIMDALL_TESTE=1` — achar o que difere do Windows do dono.
3. Conferir no navegador logado as rodadas `#90`–`#93` para ver os nomes dos testes que falharam (os logs exigem login).
4. Registrar em `LICOES.md`, atualizar instruções e commitar. Só então declarar o CI verde.

## Referências
- `.github/workflows/testes.yml`; `tests/run-all.sh`; `tests/instalar/check_instalar.sh`; `tests/lib/so.sh`.
- Registro da descoberta: `docs/plano/PROGRESS.md` (entrada de 2026-10-21, noite 2).

## Atualização (2026-10-22)
As rodadas `#90`–`#94` (commits `2dd3bf6`, `346fe0e`, `4a3fa08` ×2 e `dfc9daf` na `main`) concluíram todas em **failure**, com exatamente os mesmos passos: ubuntu `Rodar todos os testes`; windows 22/24 `Instalador - comportamento no Windows (falsos .cmd)`. O vermelho não é intermitente nem deste trabalho — é sistemático e anterior (verde mais recente: `#77`, 20/10). A limpeza Linux-only proposta em `pendencias/2026-10-22-revisao-linux-only.md` faz os passos do job Windows sumirem junto com o job; o lado Ubuntu precisa ser reproduzido no Linux (`sh tests/run-all.sh`) e corrigido com teste que falhava primeiro.
