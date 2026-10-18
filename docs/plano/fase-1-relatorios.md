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

## Perguntas em aberto (rígidas)
1. **Horário e fuso** do diário e do semanal; dia da semana do semanal. O "dia" vai de 00h a 24h ou do expediente?
2. **Conteúdo:** o rascunho acima serve? O que tirar, o que acrescentar?
3. **Tamanho:** curto (1 página) ou detalhado por cliente?
4. **Idioma:** português do Brasil.
5. **Clientes sem atividade no dia:** aparecem ou não?
6. **Tom:** direto e objetivo, ou mais analítico com recomendações ("sugiro retomar contato com X")?
7. Pode haver **alertas fora de hora** (ex.: reunião em 30 min), ou só os dois relatórios?
8. Usa **funil/etapas** (lead, reunião, proposta...) já definidos? Entram no relatório agora ou só com o CRM (fase 2)?
