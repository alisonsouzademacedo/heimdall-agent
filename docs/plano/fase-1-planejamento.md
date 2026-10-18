# Heimdall — Fase 1: planejamento

## Objetivo
Agente que **só escuta** o WhatsApp comercial do SDR (texto, áudio, PDF → .md; resto ignorado), acumula contexto/memória, aprende dia a dia e entrega relatório diário e semanal (.md) no **self-chat**. Conversa só com o dono, só no self-chat. Nunca responde a terceiros. (Fase 2: CRM Kanban com cadastro, movimentação, ganho e perda.)

## O que o Hermes já faz (fonte: docs em `docs/hermes-agent/`)
| Necessidade | Suporte nativo | Observação |
|---|---|---|
| Conectar ao WhatsApp | Sim, via bridge Baileys (WhatsApp Web, aparelho vinculado) ou Cloud API oficial | `hermes whatsapp` (QR). Baileys é não oficial: risco de restrição de conta |
| Self-chat | Sim, `WHATSAPP_MODE=self-chat` | Você fala consigo mesmo e o agente responde ali |
| Áudio → texto | Sim | STT automático (faster-whisper local, Groq ou OpenAI Whisper) |
| PDF → .md | Sim, `read_file` converte PDF/DOCX/XLSX para markdown | PDF só com camada de texto; escaneado exige OCR/visão |
| Relatórios agendados | Sim, cron com entrega em `WHATSAPP_HOME_CHANNEL` | Definir o home channel como o self-chat |
| Memória | Parcial | `MEMORY.md` 2.200 chars e `USER.md` 1.375 chars: curtos demais para acumular conversas. Precisa de provedor de memória externo ou armazenamento próprio |
| Aprender com o uso | Parcial | Skills criadas pelo agente + memória; aprendizado de conversas de terceiros exige pipeline próprio |
| MCP / ferramentas externas | Sim | Caminho para o CRM na fase 2 |
| Ingestão silenciosa | Sim, hook `pre_gateway_dispatch` com `skip` e `session_store.append_to_transcript` | Documentado para "listen-only" e "human handover" |
| Kanban | Existe, mas é quadro de tarefas **entre agentes**, não CRM de vendas | CRM da fase 2 será integração externa |

## Achado crítico: escuta passiva não é nativa
O Hermes foi desenhado como bot conversacional. No bridge Baileys, mensagens de remetentes **fora de `WHATSAPP_ALLOWED_USERS` são descartadas no próprio bridge** (`matchesAllowedUser(...)`; issues #7269, #53745 do repositório), antes de chegarem ao hook. Grupos seguem `group_policy` (`pairing` não encaminha nada). Ou seja, com a configuração padrão o Heimdall **não veria a conversa dos seus clientes**.

Para escutar tudo sem responder, há 3 desenhos:

| Opção | Como | Prós | Contras |
|---|---|---|---|
| **A. Hermes + allow-all + hook que ingere e dá `skip`** | `WHATSAPP_ALLOW_ALL_USERS=true`; hook `pre_gateway_dispatch` grava tudo no armazenamento e só deixa passar o self-chat | Tudo dentro do Hermes; um processo | **Falha aberta:** se o hook lançar exceção, o gateway "cai no despacho normal" e o agente pode responder a um cliente. Exige blindagem extra (sem ferramenta de envio, `send_message` desligado) |
| **B. Listener separado + Hermes só no self-chat** | Processo próprio (Baileys/GOWA) só lê e grava em SQLite/markdown; Hermes lê esse acervo e fala só com você | **Falha fechada:** o Hermes nunca tem sessão com terceiros; o que escuta não tem código de envio | Dois componentes; ingestão de áudio/PDF fica por nossa conta |
| **C. Patch no bridge do Hermes** | Fork do `bridge.js` para encaminhar tudo marcado como "ambiente" | Reaproveita o bridge | Fork para manter a cada mudança do WhatsApp |

**Recomendação provisória: B**, por segurança ("nunca responder ninguém" vira garantia estrutural). A confirmar no spike.

## Salvaguardas obrigatórias (qualquer opção)
1. O agente não pode ter caminho de envio para ninguém além do self-chat (toolset de mensagens desligado ou restrito; checar `hermes send` e `send_message`).
2. `unauthorized_dm_behavior: ignore` (nunca devolver código de pareamento a estranhos).
3. Sessão do WhatsApp (`~/.hermes/platforms/whatsapp/session`) protegida (`chmod 700`), fora do git.
4. Conta comercial real: usar como aparelho vinculado só leitura reduz, mas não elimina, o risco de restrição.
5. LGPD: conversas de clientes serão armazenadas e enviadas a um LLM/STT externo.

## Spike (antes de construir)
1. Subir Hermes em modo self-chat e confirmar entrega do relatório no self-chat via cron.
2. Com `WHATSAPP_DEBUG=true`, confirmar se mensagens de terceiros chegam ao bridge/gateway em cada opção.
3. Confirmar o comportamento do hook em exceção e o que de fato impede envio a terceiros.
4. Testar PDF → .md e áudio → texto com amostras reais.

## Perguntas de onboarding (pendentes)
Ver a conversa; respostas devem ser registradas aqui.
