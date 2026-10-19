# Heimdall — quadro de planejamento

Última atualização: 2026-10-18. Fase atual: **planejamento** (nada instalado, nenhum código escrito).

## Objetivo
Agente que só escuta o WhatsApp comercial do SDR (texto, áudio, PDF → .md; resto ignorado), acumula memória, aprende e entrega relatório diário e semanal (.md) no self-chat. Só conversa com o dono, só no self-chat. Fase 2: CRM Kanban (cadastrar, mover, ganho e perda).

## Decisões fechadas
| # | Decisão | Origem |
|---|---|---|
| D1 | Cliente WhatsApp: **Baileys** | usuário |
| D2 | **Um aparelho vinculado só** (sessão única) | usuário |
| D3 | Escutar **todas** as conversas e **todos os grupos**; mensagens enviadas pelo usuário entram | usuário |
| D4 | Histórico anterior: já tratado pelo usuário; **baixa prioridade** | usuário |
| D5 | Ponte listener ↔ Hermes: **opção Q** (API Server do Hermes; o listener envia a resposta, travado no próprio JID) | usuário |
| D6 | Hermes é o centro; memória de recuperação: **Hindsight** (a confirmar no spike) | usuário + análise |
| D7 | LLM: **ChatGPT Plus para tudo** (texto, áudio, documentos); sem API paga | usuário |
| D8 | Onde roda (local ou VPS): **decidir depois** | usuário |
| D9 | Dados de clientes nunca vão para o git (`data/` ignorado) | análise |
| D11 | PDF: **markitdown** (só PDF, transcrições de reuniões do Google Meet); outros documentos e imagens ficam de fora por enquanto; exemplos de PDF só na configuração | usuário |
| D13 | O PDF vem normalmente do **Pedro** (gestor interno); papéis dos contatos aprendidos no início, com cadastro explícito prioritário | usuário |
| D14 | Relatórios: semanal segunda 08:00 (semana anterior inteira), diário terça a sexta 08:00 (dia anterior); fuso `America/Sao_Paulo`; uma página; recomendações permitidas; sem alertas fora de hora; funil só na fase do CRM | usuário |
| D15 | Follow-up só para cliente que já respondeu; 2 dias entre tentativas; **7 tentativas sem retorno desconsideram** o cliente; cada resposta zera; "usuário sem responder" sempre no topo do próximo relatório; retornos marcados aparecem no relatório do dia | usuário |
| D16 | Modelo de dados aprovado: manter apagadas/editadas marcadas; grupos só internos, absorvidos sem avisos; retenção mínima de 90 dias com aviso e apagar sob comando; cliente = empresa | usuário |
| D17 | Funil: Contato iniciado → 1ª Reunião Agendada → 2ª Reunião Agendada → Fechamento/Ganho → Perdido/Arquivado (7 tentativas ou objeção irreversível); CRM do zero; Heimdall propõe e o usuário aprova (movimentos no relatório das 08:00) | usuário |
| D18 | CRM: **Krayin** (funil de 5 etapas; propõe e usuário aprova) — peso medido no spike (E8) | usuário |
| D19 | O usuário usará **Claude Code, Codex e Antigravity**; os três leem o mesmo `AGENTS.md` (verificado na documentação) | usuário + verificação |
| D20 | Sincronização e extração do **histórico completo obrigatórias** na primeira vez; processamento com estratégias de carga (`fase-1-carga-inicial.md`) | usuário |
| D21 | Interface em **português do Brasil** | usuário |
| D22 | Instalação feita por **IA**; instalador próprio fica para depois | usuário |
| D12 | O Heimdall correlaciona a transcrição ao cliente pelo compromisso combinado no WhatsApp; **compromissos** viram entidade própria; pergunta no self-chat quando a confiança for baixa | usuário + análise |
| D10 | Áudio: **Whisper local via `faster-whisper`**; modelo escolhido por teste de capacidade da máquina; poucos áudios, até 3 min cada | usuário |

## Biblioteca de documentação (no repo, para contexto)
`docs/hermes-agent/` (458 págs) · `docs/baileys/` (1.778) · `docs/openai-codex/` (203) · `docs/hindsight/` (152) · `docs/whisper/` (repo + anúncio) · `docs/faster-whisper/` (README, código, benchmarks) · `docs/markitdown/` (README, pacotes, conversor de PDF) · `docs/krayin/` · `docs/docker/` (693 págs, subconjunto) · `docs/claude-code/` (48) · `docs/antigravity/` (71). Firecrawl: conectado; usado só quando o site não publica `llms-full.txt`.

## Análises feitas
- `fase-1-planejamento.md`: o que o Hermes faz e o achado de que a escuta passiva não é nativa.
- `fase-1-whatsapp-baileys-hermes.md`: 12 problemas do cruzamento Baileys × bridge do Hermes e arquitetura.
- `fase-1-memoria-hermes.md`: como o Hermes trata memória e a arquitetura em 3 camadas.
- `fase-1-memoria-e-llm.md`: Hindsight × Mem0 × claude-mem × Obsidian; assinaturas × provedores.
- `fase-1-audio.md`: Whisper local, teste de capacidade da máquina, riscos.
- `fase-1-pdf.md`: markitdown, escopo só PDF, segurança e fluxo.
- `fase-1-relatorios.md`: horários, regras de follow-up, estados do cliente.
- `fase-1-mcp.md`: MCP do Hindsight + MCP próprio.
- `fase-1-modelo-de-dados.md`: tabelas, princípios e fluxo para o Hindsight.
- `fase-2-crm.md`: Krayin, funil, autonomia.
- `fase-1-spike.md`: 13 experimentos de viabilidade antes de construir.
- `fase-1-operacao-da-ia.md`: regras para a IA instaladora (`AGENTS.md`), memória, testes de regressão.
- `fase-1-carga-inicial.md`: 14 estratégias para a primeira carga de dados.
- `fase-1-onboarding-visual.md`: tela de configuração em 9 passos, só na primeira vez.
- `fase-1-requisitos-e-preflight.md`: requisitos por sistema e verificador automático (`spike/preflight/`).

## Riscos avaliados e aceitos pelo usuário (2026-10-18)
O usuário avaliou e decidiu seguir, com base em testes próprios: cota do ChatGPT Plus (fluxo majoritariamente texto, "não é muito"), termos de uso da assinatura em agentes externos, risco da conta do WhatsApp (o agente só escuta, não responde a terceiros nem dispara em massa), LGPD (confia no provedor) e bugs (testes automáticos de regressão em produção). Mantidos aqui só como pontos a **medir** no spike, não como bloqueios.

Ainda abertos (técnicos): Hindsight auto-hospedado (discussão pública de falha, não lida); Baileys v8 muda o formato de login e o Hermes fixa Baileys 7.0.0-rc13.

## O que falta
**Etapas de planejamento (ordem proposta)**
1. ~~Áudio (STT)~~: planejado em `fase-1-audio.md` (Whisper local; teste de capacidade). Volume informado (poucos, até 3 min).
2. ~~PDF → .md~~: planejado em `fase-1-pdf.md` (markitdown). Faltam PDFs reais de amostra.
3. ~~Relatórios~~: decididos em `fase-1-relatorios.md`. Falta fechar as regras iniciais de "sem retorno" e "potencial" (propostas no documento).
4. MCP: como o Hermes consulta o acervo (MCP do Hindsight ou próprio).
5. ~~Kanban/CRM~~: **Krayin** escolhido (`fase-2-crm.md`); documentação em `docs/krayin/`.
6. ~~Modelo de dados~~: proposto em `fase-1-modelo-de-dados.md`; aprovado.

**Spike (antes de construir)**
- Ler o código do bridge do Hermes direto (a análise atual veio de resumo parcial).
- API Server do Hermes: sessões, memória e latência numa conversa de self-chat.
- Hindsight em Docker local com `chatgpt` e Plus; medir cota por mensagem.
- Baileys só leitura: logar `notify` e `append` de DM e grupo; mídia na chegada.

**Perguntas do onboarding ainda sem resposta**
1. Aceita o risco de restrição da conta comercial?
3. Os clientes sabem do assistente (LGPD)?
4. Quais serviços externos aceita receber o conteúdo (LLM, transcrição)? Contatos a excluir (família, pessoal)?
9–11. Horário do diário e do semanal, fuso, conteúdo, idioma, tamanho; há modelo de relatório?
12–13. O que ele deve aprender, como você corrige, e se pode sugerir respostas sem enviá-las.
15–16. Linguagem do código (Python/TypeScript) e qual CRM.
