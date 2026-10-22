# Instalador de um clique, tela de onboarding e relatório de bugs

> **Histórico (2026-10-22):** este documento descreve o instalador do **Windows**, removido junto com `iniciar.cmd`, `instalar/` e os testes daquela camada. O Heimdall é **Linux-only** desde 2026-10-22; as partes que ainda valem são o relatório de bugs sem segredos e a tela de onboarding. Para a instalação atual, veja `README.md` e `docs/plano/fase-2-execucao.md`.

Decisão do dono (2026-10-19): ele só baixa o ZIP do GitHub (`main`), descompacta, abre a pasta e executa **um arquivo**. Isso instala o que falta, liga a pasta ao Git e abre a tela de configuração. Se algo falhar, fica um **relatório de bug** que a IA transforma em teste, correção e commit. Na primeira rodada ele acompanha com uma IA; no futuro a meta é **só executar** e ver a tela.

## O fluxo hoje (`iniciar.cmd` → `instalar/instalar.ps1`)
1. Detecta Git, Node.js 22.18+, Python 3 e Docker Desktop; **pergunta antes de instalar cada um** (IDs do `winget` da documentação; Docker pelo instalador oficial). Não aceita termos por ele.
2. **Liga a pasta ao GitHub**: o ZIP vem sem `.git`; o instalador faz `git init`, `checkout main`, `remote add origin`, `fetch`, `reset` (sem mexer nos arquivos) e `branch --set-upstream-to`. Testado com um "GitHub" local: a pasta fica limpa e acompanhando `origin/main`. **Não verificado no Windows real:** conversão de fim de linha (`core.autocrlf`) pode fazer arquivos parecerem alterados.
3. Roda os testes do núcleo.
4. Copia para a área de transferência o texto inicial da IA (`instalar/PROMPT-IA.txt`).
5. **Abre a tela de configuração** (`apps/core/src/onboarding`): servidor só local (127.0.0.1) com código de uso único; abre o navegador sozinho. Hoje só o passo **Ambiente** funciona de verdade (verifica sistema, memória, disco, Node e Docker); os outros 11 aparecem como "ainda não ligado" e são construídos pela IA na primeira rodada, na ordem do protótipo (`docs/plano/prototipo-onboarding/`). A tela tem o botão **Relatar problema** em todos os passos.

## Relatório de bugs
- **Onde:** `data/bugs/AAAAMMDD-HHMMSS-<etapa>.md` (fora do git). Criado pelo **instalador** (falha do `winget`, do Docker, do Git, do `npm`, dos testes, exceção inesperada), pela **tela** (botão "Relatar problema") e pelo **núcleo** (`apps/core/src/bugs.ts`).
- **Conteúdo:** cabeçalho legível por máquina (`tipo`, `id`, `origem`, `etapa`, `estado: aberto`), ambiente (sistema, versões), comando, código de saída e o **fim** da saída (onde está o erro), mais as instruções para a IA.
- **Sem segredos:** chaves (`sk-`, `ghp_`, `github_pat_`, Bearer), `token=`/`senha=`, e-mails, telefones, identificadores do WhatsApp e o **nome de usuário do Windows** são mascarados antes de gravar (testado nos dois lados: `bugs.test.ts` e `tests/instalar/`).
- **Ciclo (AGENTS.md, "Bugs de instalação"):** a IA lista os abertos → teste que falha → correção → instruções → `LICOES.md` → `estado: resolvido` → commit e envio. O primeiro envio ao GitHub pede o login do dono.

## Para chegar ao "só executar, sem IA"
Falta construir (hoje é trabalho da IA na primeira rodada): Docker Compose com Hindsight, Hermes e o transcritor, versões fixadas; configuração automática do que não depende do dono (idioma português do Hindsight, ferramentas restritas do Hermes); os 11 passos restantes da tela (QR, cadastro, sincronização, extração, modelo, processamento, voz, self-chat, agenda, backup, painel); e o tratamento de erro de cada um com relatório de bug. O que **sempre** dependerá dele: ler o QR e fazer os logins.

## Limites conhecidos
O instalador foi testado em Linux com programas falsos e com o PowerShell 7 e, **desde 2026-10-19, rodou num Windows 11 real** (Git, Node e Python instalados pelo `winget`; 3 erros corrigidos; Docker adiado: virtualização desligada e WSL ausente, agora detectados pelo instalador; assinatura do instalador do Docker conferida antes de executar, mas **nunca testada contra o arquivo real**). A tela foi inspecionada num navegador do próprio Claude no Windows; **falta confirmar que o navegador padrão do dono abre a tela sozinho**. O instalador abre a tela dentro da própria janela do terminal (fechar a janela encerra a tela); virar serviço em segundo plano é trabalho futuro.
