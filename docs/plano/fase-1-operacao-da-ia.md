# Como a IA instala e opera o repositório

Contexto (usuário, 2026-10-19): o repositório será instalado e configurado por uma IA (Claude Code, Codex, Antigravity ou outra). O usuário não é programador. Precisa de regras para a IA não alucinar, não estragar o que funciona e consultar a documentação completa.

## O que foi criado
- `AGENTS.md` (raiz): regras para qualquer IA. 6,5 KB.
- `CLAUDE.md` (raiz): importa o `AGENTS.md` (o Claude Code lê `CLAUDE.md`).
- `docs/plano/PROGRESS.md`: diário de trabalho e memória do projeto.

## Compatibilidade com cada IA (verificado nas documentações salvas)
O usuário usará **as três**: Claude Code, Codex e Antigravity.
| IA | Como lê as regras | Fonte |
|---|---|---|
| Codex | `AGENTS.md`; soma limitada a **32 KiB** por padrão (`project_doc_max_bytes`) | `docs/openai-codex/docs/agent-configuration/agents-md.md` |
| Claude Code | Se existir `CLAUDE.md`, lê só os `CLAUDE.md`; um `CLAUDE.md` que **importa** o `AGENTS.md` carrega os dois. É exatamente o nosso arranjo. Recomenda `CLAUDE.md` com menos de 200 linhas (nosso `AGENTS.md` tem 59) | `docs/claude-code/memory.md` |
| Antigravity | Lê `AGENTS.md` (ou `GEMINI.md`) **sem cabeçalho**, sempre ativo, em cada pasta do projeto; aceita `@[rótulo](caminho)` para incluir arquivos; arquivos em `.agents/rules/` **exigem** cabeçalho com `trigger`, senão são descartados em silêncio | `docs/antigravity/rules.md` |
| Hermes | `AGENTS.md` e `CLAUDE.md` | `docs/hermes-agent/user-guide/features/context-files.md` |
Conclusão: o mesmo `AGENTS.md` serve às quatro, sem adaptação. Cuidado: **não** criar `GEMINI.md` nem `.agents/rules/` sem necessidade, para evitar regras duplicadas ou conflitantes.

## "Ler o contexto completo, não por palavra-chave"
A intenção é correta e virou regra (leitura por **páginas inteiras**, a partir do `INDEX.md`, com registro dos arquivos lidos). Há um limite físico: a biblioteca tem cerca de **39 MB** (~10 milhões de tokens), e nenhuma IA carrega isso de uma vez. Por isso o protocolo é **ler por inteiro os documentos do componente da tarefa**, não a biblioteca inteira, e registrar quais foram lidos. Tamanhos: Hermes 12 MB, Baileys 11 MB (a maior parte é referência do protocolo, consultada por arquivo), Codex 6,7 MB, Docker 5,7 MB (metade é referência de comandos), Hindsight 2,9 MB, Krayin 0,8 MB, Whisper, faster-whisper e markitdown ~0,6 MB juntos.

Complemento recomendado (ainda não feito): um **roteiro de instalação verificado por componente** (`docs/plano/runbooks/`), com cada passo apontando para a página de origem. Reduz a necessidade de reler tudo e dá à IA um caminho já conferido.

## Memória para a IA que instala: um sistema como o Hindsight?
**Recomendação: não, por enquanto; usar arquivos no próprio repositório.**
- O risco de alucinação aqui vem de a IA *confiar em memória própria*. Um banco de memória semântica **também pode devolver fatos errados ou desatualizados** e é mais difícil de auditar.
- Arquivos em texto versionados no git são **legíveis pelo dono, revisáveis e restauráveis**: `AGENTS.md` (regras), `docs/plano/README.md` (decisões), `PROGRESS.md` (estado e evidências), `docs/` (fontes).
- O Hindsight cuida da memória **do Heimdall** (conversas de clientes). Misturar a memória de quem constrói com a de quem opera complica e vaza contexto.
- Reavaliar se o volume de registros crescer a ponto de a IA não achar o que precisa.

## Regra "cada erro resolvido vira aprendizado permanente" (decisão do usuário, 2026-10-20)
Para a IA que instala o Heimdall: cada erro corrigido exige (1) um **teste de regressão** que falhava antes, (2) a correção com todos os testes passando, (3) **atualização das instruções** (roteiro do componente e, se geral, `AGENTS.md`), (4) uma linha em `docs/plano/LICOES.md`, (5) correção da documentação do projeto se a causa foi uma suposição errada, e (6) só então o commit. A regra está em `AGENTS.md`, com a salvaguarda de que a IA **só acrescenta** instruções e **nunca remove ou enfraquece as regras inegociáveis** sem aprovação do dono, e com o limite de tamanho do `AGENTS.md` (32 KiB no Codex).

## Testes de regressão (explicação simples)
São testes automáticos que rodam **sempre**, antes e depois de qualquer mudança, para provar que o que funcionava continua funcionando. A IA muda o código, roda os testes, e se algo quebrou o sistema acusa na hora. As regras em `AGENTS.md` impedem a IA de "consertar" apagando ou enfraquecendo os testes. Categorias obrigatórias estão listadas lá (regras de follow-up, segurança de envio, entrada de mensagens, banco, MCP e relatórios), sempre com dados sintéticos.

Ainda não existe código nem testes; o comando para rodá-los será definido quando o primeiro componente for construído.

## Limites desta proposta
- Regras em arquivo **reduzem**, mas não **eliminam**, o risco de uma IA ignorá-las. A garantia forte vem de testes automáticos que falham e, depois, de integração contínua no repositório (ainda não configurada).
- A leitura das regras foi verificada **na documentação** de cada IA, mas o `AGENTS.md` ainda não foi testado na prática em cada uma (versões do Claude Code e do Antigravity do usuário não conhecidas; a leitura direta de `AGENTS.md` pelo Claude Code exige a versão 2.1.277 ou superior, e por isso o `CLAUDE.md` de importação é mantido).
