# Como começar no notebook (versão com instalador)

Decisão do dono (2026-10-19): a **única** coisa que ele faz é baixar o código do GitHub; o instalador do projeto cuida do resto, perguntando antes de instalar cada programa. Não há material de teste a fornecer: o Heimdall usa PDFs e áudios reais já extraídos do WhatsApp dele (teste dentro da tela de onboarding).

## Passo a passo
1. **Feche programas pesados** (o notebook tem 8 GB).
2. **Baixe o projeto** (branch `main`): `https://github.com/alisonsouzademacedo/heimdall-agent` → botão verde **Code → Download ZIP** → extraia (ex.: `C:\Heimdall`). Com Git instalado: `git clone https://github.com/alisonsouzademacedo/heimdall-agent.git C:\Heimdall`.
3. **Dê duplo clique em `iniciar.cmd`.** Se o Windows avisar "protegeu o computador" (acontece com arquivos baixados), clique em **Mais informações → Executar assim mesmo**.
4. O instalador (`instalar\instalar.ps1`) mostra o que já existe e o que falta (Git, Node.js 22.18+, Python 3, Docker Desktop). Para **cada item que falta ele pergunta** `[S/N]` e só então instala. Cada resposta é sua; ele nunca aceita termos de uso por você. Depois **liga a pasta ao GitHub** e **abre a tela de configuração** no navegador (deixe a janela preta aberta). Se algo falhar, ele grava um **relatório de bug** em `data\bugs\` para a IA corrigir (ver `fase-1-instalador-e-bugs.md`).
5. Se instalar algo, **feche a janela e dê duplo clique em `iniciar.cmd` de novo** (o Windows só enxerga programa novo numa janela nova). O Docker Desktop pode pedir reinício e que você o abra uma vez e aceite os termos.
6. Ele roda os testes do núcleo e **copia para a área de transferência o texto inicial para a IA** (`instalar\PROMPT-IA.txt`). Abra uma IA **dentro da pasta do projeto** (Claude Code: `winget install Anthropic.ClaudeCode`, comando da documentação oficial; depois `claude`) e cole com **CTRL+V**. A IA continua: trata os relatórios de bug abertos, escreve o Docker Compose (Hindsight, Hermes), termina os passos da tela de onboarding (hoje só o passo Ambiente funciona), sempre parando antes de qualquer coisa que dependa de você (QR, logins, primeiro envio ao GitHub). No futuro a ideia é dispensar a IA: só executar e ver a tela.

## O que o instalador faz e não faz (testado em `tests/instalar/`)
- Faz: detecta, explica, pergunta, instala (Git, Node.js e Python por `winget`, com os IDs da documentação do Codex em `docs/openai-codex/docs/codex-manual.md`; Docker Desktop pelo instalador oficial e o comando `install --user` de `docs/docker/desktop/setup/install/windows-install.md`).
- Não faz: aceitar termos por você, mexer na segurança do Windows, instalar sem perguntar, enviar dados a lugar nenhum, baixar nada além do instalador do Docker.
- **Não verificado em um Windows de verdade** (testado com programas falsos no PowerShell 7): se o `winget` está presente e funcionando na sua máquina, e como o Docker Desktop se comporta com a virtualização. Se algo falhar, mande o arquivo `instalar-relatorio.txt` (fica na pasta do projeto, fora do git).

## Texto inicial da IA
Fica em `instalar/PROMPT-IA.txt` (fonte única). O instalador o copia sozinho; se preferir, abra o arquivo e copie.
