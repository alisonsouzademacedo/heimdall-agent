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

## Biblioteca de documentação (no repo, para contexto)
`docs/hermes-agent/` (458 págs) · `docs/baileys/` (1.778) · `docs/openai-codex/` (203) · `docs/hindsight/` (152). Firecrawl: conectado; usado só quando o site não publica `llms-full.txt`.

## Análises feitas
- `fase-1-planejamento.md`: o que o Hermes faz e o achado de que a escuta passiva não é nativa.
- `fase-1-whatsapp-baileys-hermes.md`: 12 problemas do cruzamento Baileys × bridge do Hermes e arquitetura.
- `fase-1-memoria-hermes.md`: como o Hermes trata memória e a arquitetura em 3 camadas.
- `fase-1-memoria-e-llm.md`: Hindsight × Mem0 × claude-mem × Obsidian; assinaturas × provedores.

## Riscos abertos (por gravidade)
1. **Cota do ChatGPT Plus** descrita pela OpenAI como "algumas sessões focadas por semana"; limites exatos não vistos. Serviço 24h com texto + áudio + PDF pode estourar. Medir no spike; plano B definido (modelo local para extração em lote).
2. **Termos de uso** da OpenAI para automação 24h com plano de consumidor: a OpenAI recomenda chave de API para automação; o provedor `chatgpt` do Hindsight exige "plano que permita uso em apps de terceiros" (Plus não confirmado).
3. **Conta do WhatsApp:** cliente não oficial (Baileys); risco de restrição.
4. **LGPD:** conversas de clientes processadas por LLM externo; base legal e retenção indefinidas.
5. **Hindsight auto-hospedado:** há discussão pública de falha ao hospedar por conta própria; não lida ainda.
6. **Versões:** Baileys v8 muda o formato de login; Hermes fixa Baileys 7.0.0-rc13.

## O que falta
**Etapas de planejamento (ordem proposta)**
1. Áudio (STT): sem API paga, o provável é `faster-whisper` local (CPU); validar qualidade em português e custo de CPU.
2. PDF → .md: conversão fora do Hermes (o listener grava o arquivo); PDF escaneado exige OCR/visão.
3. Relatórios: formato, horário, quem gera (cron do Hermes vs. listener) e quem entrega (listener, pela ponte Q).
4. MCP: como o Hermes consulta o acervo (MCP do Hindsight ou próprio).
5. Kanban/CRM (fase 2): qual CRM, tem API/MCP, funis e etapas.
6. Modelo de dados do acervo (tabelas, dossiês, retenção) e formato do `data/`.

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
