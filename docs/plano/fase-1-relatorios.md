# Fase 1 — Relatórios diário e semanal

Fontes: `docs/hermes-agent/user-guide/features/cron.md`, `docs/hermes-agent/user-guide/messaging/whatsapp.md`, `docs/baileys/messaging/media-messages.md`, `docs/markitdown/`.

## Requisitos do usuário
- Relatório **diário** e **semanal**, em **.md**, entregues **no self-chat**.
- Gerados a partir de todo o contexto acumulado (conversas, áudios, PDFs de reuniões).
- O usuário também conversa com o Heimdall no self-chat (poderá pedir relatórios sob demanda).

## O markitdown serve para gerar o relatório? Não
O markitdown **converte arquivos existentes para Markdown** (PDF, Word e outros → .md). Ele não escreve conteúdo. O relatório já nasce em Markdown, escrito pelo modelo (ChatGPT Plus) a partir do acervo; não há arquivo a converter. Papel do markitdown no projeto: só a entrada de PDFs.

## Como gerar e entregar (levantamento da documentação)
- **Geração:** tarefa agendada do Hermes (cron). Aceita agenda em linguagem natural ou expressão cron, roda numa sessão nova do agente, permite fixar modelo e esforço de raciocínio por tarefa, e permite entregar o resultado em **arquivo local**. Tarefas de cron não podem criar outras tarefas de cron.
- **Entrega no WhatsApp (ponte Q):** o cron grava o `.md` em `data/relatorios/` (entrega `local`), e o **listener** envia o arquivo ao self-chat. O Hermes não envia nada por conta própria.
- **Formato no WhatsApp:** enviar como **documento anexo `.md`** preserva a formatação original; o Baileys lista documentos como mídia suportada, mas **não encontrei exemplo de código para documentos** na documentação: validar `document` + `mimetype` + `fileName` no spike. Se fosse texto, o Hermes converteria `**negrito**` e `# título` para a formatação do WhatsApp (título vira negrito) e dividiria em blocos de 4.096 caracteres.
- Proposta: mensagem curta de abertura (3 a 5 linhas com o essencial) **mais** o `.md` anexo.
- Relatórios sob demanda: o usuário pede no self-chat ("relatório de hoje") e o Heimdall gera com o mesmo modelo.
- Arquivo guardado em `data/relatorios/AAAA-MM-DD-diario.md` e `AAAA-Www-semanal.md` (fora do git).

## Rascunho de estrutura (proposta para o usuário editar)
**Diário**
1. Resumo do dia (3 a 5 linhas)
2. Reuniões de hoje e de amanhã; reuniões que ocorreram e ainda **sem transcrição**
3. Por cliente com atividade: o que foi dito, objeções, interesse, próximos passos, promessas feitas por ambos
4. Follow-ups atrasados e prazos a vencer
5. Mensagens do gestor (Pedro): pedidos e feedback
6. Novos contatos e leads
7. O que o Heimdall aprendeu hoje e o que ficou incerto (correções que ele pede)
8. Números: mensagens, áudios transcritos, PDFs processados, falhas

**Semanal:** evolução por cliente (avanços e estagnações), funil e movimentos, padrões de objeção, reuniões realizadas e resultado, compromissos da semana seguinte, desempenho do próprio processo, aprendizados do agente.

## Decisões do usuário (2026-10-18)
| Tema | Decisão |
|---|---|
| Fuso | Santa Maria/RS → `America/Sao_Paulo` (UTC-3). O Hermes tem a opção `timezone` (IANA), que vale para o cron e para o relógio do agente |
| Semanal | **Segunda-feira, 08:00**. Abrange a semana inteira anterior, **da segunda passada** em diante |
| Diário | **Terça a sexta, 08:00**. Abrange o **dia anterior** (terça cobre segunda; sexta cobre quinta). Sem diário na segunda (o semanal cobre) nem no fim de semana |
| Conteúdo | Rascunho de estrutura aprovado. Foco: **ajudar com clientes, follow-ups, clientes que não deram retorno, clientes a quem o usuário não deu retorno, clientes com potencial** |
| Tamanho | **Curto, sempre uma página** |
| Clientes sem atividade | Podem aparecer **se houver follow-up pendente** |
| Tom | Pode **recomendar ações** |
| Alertas fora de hora | **Não**: só os relatórios e o que o usuário perguntar ou disser no self-chat |
| Funil/etapas | **Só na etapa do CRM** |

Janelas de tempo adotadas (confirmar): semanal = segunda anterior 00:00 até domingo 23:59:59; diário = dia anterior 00:00 a 23:59:59; ambos no fuso de Santa Maria. Pendências (follow-ups, sem retorno) são calculadas **no momento da geração**, às 08:00. A sexta-feira e o fim de semana só aparecem no semanal de segunda.

Agenda (cron, fuso `America/Sao_Paulo`): semanal `0 8 * * 1`; diário `0 8 * * 2-5`.

## O Heimdall como assessor
A intenção do usuário: começar como uma IA padrão e, com memória, contexto e aprendizado, tornar-se **extensão do usuário**, como um assessor ou funcionário. Implicações de planejamento:
- Os relatórios são o ponto de contato com o aprendizado: o usuário responde no self-chat (ex.: "esse cliente não é prioridade", "esse follow-up já resolvi") e isso vira memória.
- Cada recomendação precisa registrar o **motivo** (dado que a sustentou), para o usuário corrigir e o agente aprender o critério.
- Critério de "potencial", "sem retorno" e "follow-up" começa com regras simples explícitas e é refinado pelas correções. Definir as regras iniciais antes de implementar.
- Limite de uma página obriga priorização: ordenar por urgência e potencial, não listar tudo.

## Definições iniciais a fechar (próxima etapa de planejamento)
1. **Sem retorno do cliente:** quantos dias sem resposta do cliente após mensagem do usuário contam como "não deu retorno"? (proposta inicial: 2 dias úteis)
2. **Sem retorno do usuário:** quanto tempo sem o usuário responder uma mensagem do cliente? (proposta inicial: 1 dia útil)
3. **Follow-up pendente:** compromisso prometido por qualquer lado cujo prazo passou, ou combinado sem data.
4. **Potencial:** sinais iniciais (pediu proposta, perguntou preço/prazo, marcou reunião, trouxe decisor); a ser refinado.
O usuário pode simplesmente aceitar as propostas e ajustar com o uso.
