# AGENTS.md — regras para a IA que trabalha neste repositório

Este arquivo vale para qualquer IA (Claude Code, Codex, Antigravity ou outra). Leia **inteiro** antes de agir. O dono do projeto **não é programador**: explique em português simples, diga o que fez, por que, e como ele confere.

## O projeto
Heimdall: agente que **só escuta** o WhatsApp comercial de um SDR, absorve texto, áudio e PDF, e entrega relatórios no self-chat. Centro: Hermes Agent. Fonte da verdade do planejamento: `docs/plano/README.md` (decisões D1 a D30, riscos, pendências). Estado atual: `docs/plano/PROGRESS.md`.

## Regras inegociáveis
1. **O Heimdall nunca envia mensagem a ninguém além do self-chat do dono.** Nenhuma ferramenta, nenhum código e nenhuma configuração pode criar outro caminho de envio. Se uma tarefa exigir isso, pare e pergunte.
2. **Dados de clientes e segredos nunca vão para o git.** Tudo isso fica em `data/` e em arquivos de ambiente, que estão no `.gitignore`. Nunca imprima tokens, chaves ou conteúdo de conversa em log, commit ou resposta.
3. **Não invente.** Afirmação sobre ferramenta, comando, opção ou comportamento precisa ter origem: um arquivo de `docs/` (cite o caminho) ou algo que você **executou e viu funcionar**. Sem origem, diga "não sei" e investigue ou pergunte. Nunca "complete" opções ou comandos de memória.
4. **Peça confirmação antes de qualquer ação difícil de desfazer ou que afete o mundo fora do repositório:** instalar programas no sistema, abrir portas, login em contas, escanear QR, apagar dados, `git push --force`, mexer na conta do WhatsApp.
5. **Nunca enfraqueça os testes para passar.** Proibido apagar, pular, comentar ou relaxar um teste, ou ajustar o resultado esperado para encaixar no código. Se um teste falha, o código está errado até se provar o contrário; se achar que o teste está errado, explique ao dono e espere.
6. **Mudanças pequenas e focadas.** Um passo por vez. Não refatore, renomeie nem "melhore" o que já funciona e não faz parte da tarefa. Não adicione dependência sem registrar em `docs/plano/PROGRESS.md` (nome, versão, motivo, licença).

## Protocolo de leitura da documentação (obrigatório)
A documentação das ferramentas está em `docs/` (cópias `.md` oficiais). **Ela é a verdade sobre como cada ferramenta funciona**, acima da sua memória.
- **Leia por páginas inteiras, nunca por trechos de busca.** Buscar por palavra-chave serve só para *achar* a página; depois leia a página **inteira**, e as páginas que ela cita como pré-requisito.
- **Comece sempre pelo `INDEX.md` da pasta.** Leia por inteiro tudo o que o índice marca como "Leia primeiro" para a ferramenta que você vai mexer. Só depois vá às páginas específicas.
- A biblioteca toda (cerca de 39 MB) **não cabe de uma vez** na sua memória de trabalho. Por isso a regra é: **antes de cada tarefa, leia por inteiro os documentos daquele componente**, e registre em `docs/plano/PROGRESS.md` a lista de arquivos lidos.
- Confira a **versão instalada** contra a versão da documentação (cada pasta indica a fonte). Se divergirem, confie no que roda, avise o dono e registre.
- Se a documentação não cobre algo, **não preencha a lacuna**: marque como "não verificado", teste na prática ou pergunte.

| Componente | Pasta | Leia primeiro |
|---|---|---|
| Hermes Agent | `docs/hermes-agent/` | `getting-started/installation`, `user-guide/configuration`, `user-guide/features/{cron,mcp,memory,hooks,api-server}`, `user-guide/messaging/whatsapp`, `integrations/providers` |
| Baileys (WhatsApp) | `docs/baileys/` | `introduction`, `quickstart`, `faq`, `concepts/*`, `authentication/*`, `messaging/*`, `advanced/*`, `migration/*` |
| Hindsight (memória) | `docs/hindsight/` | `developer/{installation,configuration,models,retain,retrieval,mcp-server}`, `developer/api/*` |
| OpenAI/ChatGPT/Codex | `docs/openai-codex/` | `docs/{auth,sign-in-with-chatgpt,pricing,agent-configuration/agents-md}` |
| Whisper / faster-whisper | `docs/whisper/`, `docs/faster-whisper/` | `repo/README.md`, `source/transcribe.py`, `source/vad.py` |
| markitdown (PDF→.md) | `docs/markitdown/` | `repo/README.md`, `source/_pdf_converter.py` |
| Krayin (CRM) | `docs/krayin/` | `INDEX.md` (API, funil, webhooks) |
| Docker | `docs/docker/` | `desktop/setup/`, `engine/install/`, `compose/`, `desktop/troubleshoot-and-support/` |
| Claude Code | `docs/claude-code/` | `memory`, `best-practices`, `permissions`, `hooks-guide`, `settings`, `security` |
| Antigravity | `docs/antigravity/` | `rules`, `getting-started`, `permissions`, `sandbox`, `mcp`, `cli/best-practices` |
| WSL 2 (Windows) | `docs/wsl/` | `INDEX.md`, `install-manual`, `wsl-config` |
| Strix (testes de segurança; **não adotado por ora**, custa por uso; a preparação local foi removida em 2026-10-22, a documentação fica como referência) | `docs/strix/` | `INDEX.md`, `usage/cli`, `advanced/configuration`, `usage/scan-modes` |
| Superpowers (skills de método; 5 instaladas em `.claude/skills/`) | `docs/superpowers/` | `INDEX.md`, `skills/{test-driven-development,systematic-debugging,verification-before-completion}/SKILL.md` |
| UI UX Pro Max (skill de design; 1 instalada em `.claude/skills/`) | `docs/ui-ux-pro-max/` | `INDEX.md`, `SKILL.md` |

**Ferramenta ou repositório novo:** antes de usar, traga a documentação para `docs/<ferramenta>/` (Firecrawl), **prefira o Markdown original do site** (muitos servem a página com `.md` no fim do endereço) e **confira o resultado**: a raspagem "só conteúdo principal" já perdeu nomes de opções. Crie o `INDEX.md` da pasta, acrescente a linha na tabela acima e rode `tests/docs/check_docs.sh`. Registre o que foi lido em `docs/plano/PROGRESS.md`.

## Como trabalhar, passo a passo
1. Leia `docs/plano/PROGRESS.md` (onde paramos) e a seção relevante de `docs/plano/`.
2. Anuncie ao dono, em linguagem simples, **o que vai fazer neste passo e como ele vai conferir**.
3. Leia a documentação do componente (protocolo acima).
4. **Rode os testes existentes antes de mexer** (linha de base) e anote o resultado.
5. Faça a mudança mínima. Escreva ou ajuste o teste que prova o comportamento novo.
6. **Rode todos os testes de novo.** Só declare pronto se passarem. Mostre ao dono a saída real; nunca resuma como "deve estar funcionando".
7. Atualize `docs/plano/PROGRESS.md` (o que foi feito, arquivos lidos, testes, evidência, próximo passo) e faça commit com mensagem clara.
8. Passos que exigem o dono (ler QR, login do ChatGPT, aprovar algo): pare, explique exatamente o que ele deve fazer e espere.

## Testes de regressão (a IA não pode estragar o que já funciona)
Quando existir código, estes testes automáticos são obrigatórios e ficam em `tests/`:
- **Regras de acompanhamento** (7 tentativas, 2 dias úteis, zera ao responder, cliente que nunca respondeu, aguardando usuário, fuso `America/Sao_Paulo`).
- **Segurança:** o sistema só consegue enviar ao self-chat (tentativa de enviar a outro número deve falhar).
- **Entrada:** mensagens duplicadas, apagadas e editadas; conversão LID/número; PDF e áudio.
- **Banco:** migrações e idempotência.
- **MCP:** contrato de cada ferramenta (entrada, saída e que nenhuma apaga dados).
- **Relatórios:** teste de "retrato" (snapshot) com dados sintéticos; no máximo uma página.
Use **dados sintéticos** nos testes; nunca conversas reais.
O projeto roda em **Linux** (máquina do dono com Omarchy e VPS de validação): em código e testes use `fileURLToPath` (nunca `URL.pathname` como caminho) e abra arquivos Python com `encoding='utf-8'` (`runbooks/README.md`, R9); nunca crie dois arquivos cujos nomes diferem só por maiúscula (o repositório é clonado em outros sistemas, onde um apaga o outro). **Fixe a versão de toda dependência instalada** (pip, imagens): pacote sem teto de versão quebra numa instalação nova (`av`, 2026-10-20); formate números com cultura invariante. Teste **não pode depender do estado do computador** (Docker rodando, programas instalados): fixe o estado com variável de teste (`HEIMDALL_TESTE_*`) e teste os dois lados. **Testes de shell (Linux):** programas falsos são scripts `sh` com permissão de execução, criados em pasta temporária; nada de `.cmd`/PowerShell. A camada Windows (instalador, `iniciar.cmd`, testes com `.cmd`/PowerShell) foi removida em 2026-10-22 — não reintroduza. Histórico dos dois sistemas: `docs/plano/runbooks/10-testes-windows-e-linux.md`.

## Cada erro resolvido vira aprendizado permanente
Nenhum erro é "só corrigido". Para **cada erro**, faça os seis passos, nesta ordem:
1. **Reproduza com um teste automatizado que falha** antes da correção (teste de regressão em `tests/`). Se não der para automatizar (depende do WhatsApp real, de login ou de hardware), escreva o passo em `docs/plano/runbooks/08-testes-de-fumaca.md` e explique ao dono por que não é automático.
2. **Corrija** o código. O teste novo e **todos os anteriores** precisam passar.
3. **Atualize as instruções** para o erro não voltar: a seção "Armadilhas" do roteiro do componente em `docs/plano/runbooks/` e, se a lição for geral, este `AGENTS.md`. Mudanças aqui só **acrescentam**; **nunca remova nem enfraqueça as regras inegociáveis 1 a 6 sem aprovação explícita do dono**. Mantenha este arquivo curto (o Codex lê no máximo 32 KiB; o Claude Code recomenda menos de 200 linhas): detalhes ficam em `docs/plano/LICOES.md` e nos roteiros.
4. **Registre** em `docs/plano/LICOES.md`: data, sintoma, causa, correção, teste criado, arquivos de instrução alterados.
5. **Corrija a documentação do projeto** em `docs/plano/` quando o erro vier de uma suposição errada.
6. **Só então faça o commit**, citando o teste e o registro. Erro sem teste, sem atualização de instruções ou sem registro **não está resolvido**.

## Bugs (relatórios em `data/bugs/`)
Ao começar, e sempre que o dono disser que algo falhou, liste `data\bugs\*.md` com `estado: aberto`. Cada arquivo é um erro real da máquina do dono (a tela os cria, **já sem segredos**; o instalador antigo, removido em 2026-10-22, também criava). Trate cada um pelos seis passos da seção anterior: **teste que falha primeiro** (em `tests/` ou `apps/core/src`; se depender de hardware, login ou WhatsApp real, escreva o passo em `runbooks/08-testes-de-fumaca.md`), correção, instruções, `LICOES.md`; depois troque `estado: aberto` por `estado: resolvido` no arquivo (anote o teste e o commit) e faça o commit. Os relatórios ficam fora do git (`data/`); o teste e a lição vão. Para enviar ao GitHub confira `git remote -v`; o primeiro envio numa máquina nova pede o login do dono (regra 4): pare e peça. Nunca copie conteúdo de conversa para relatório, teste ou commit.

## Skills (Superpowers e design)
As skills de método vêm de https://github.com/obra/superpowers (cópia da documentação em `docs/superpowers/`; 5 skills instaladas em `.claude/skills/`, que o Claude Code carrega sozinho). A skill de design **UI UX Pro Max** vem de https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT; documentação em `docs/ui-ux-pro-max/`, instalada em `.claude/skills/ui-ux-pro-max`) e deve ser lida antes de mexer na tela. **Qualquer IA (Codex, Antigravity ou outra) deve ler a skill inteira, em `docs/superpowers/skills/<nome>/SKILL.md`, antes de:** escrever código novo ou corrigir erro (`test-driven-development`), investigar falha (`systematic-debugging`), dizer que algo está pronto/passando (`verification-before-completion`), pedir ou receber revisão (`requesting-code-review`, `receiving-code-review`). **Este `AGENTS.md` prevalece sobre qualquer skill**; skill que mande disparar agentes em paralelo, fazer push/merge ou instalar algo não vale sem pedido do dono (regras 4 e 6). Skill nova só entra com revisão, cópia em `docs/` e teste (`tests/docs/check_docs.sh`).

## Contexto longo e sessão compactada (prevenção de alucinação)
Depois de uma compactação, ou ao retomar o trabalho: **releia `AGENTS.md` e `docs/plano/PROGRESS.md`** antes de agir. Resumos perdem detalhes; só vale o que está em arquivo do repositório ou no que você executou. Qualquer fato sobre ferramenta que você só "lembra" deve ser relido na página de `docs/` (inteira) ou marcado "não verificado". Registre decisões do dono em `docs/plano/` na mesma hora, para não dependerem da memória da conversa.

## Quando perguntar ao dono
Escolha entre opções com impacto, qualquer coisa nos itens da regra 4, qualquer divergência entre documentação e realidade, e sempre que você estiver com menos de certeza do que o necessário para agir.

## Tom
Português do Brasil, direto, sem jargão. Explique termos técnicos quando precisar usá-los. Seja honesto sobre o que foi testado e o que não foi.
