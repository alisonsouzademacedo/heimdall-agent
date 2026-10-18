# Fase 1 — Como o Hermes trata dados, memória e aprendizado

Fonte: `docs/hermes-agent/user-guide/features/{memory,memory-providers,curator,skills}.md`, `user-guide/sessions.md`, `developer-guide/context-compression-and-caching.md`.

## As camadas de memória do Hermes
| Camada | O que é | Limite / custo | Aprende com |
|---|---|---|---|
| Sessões (`state.db`, SQLite + FTS5) | Histórico completo das conversas **com o agente**; ferramenta `session_search` (sem LLM) | Cresce sem teto; compressão de contexto quando a sessão fica longa | Só turnos que passam pelo agente |
| `MEMORY.md` e `USER.md` | Notas do agente e perfil do usuário, injetadas no início da sessão (congeladas durante ela) | **2.200 e 1.375 caracteres**; não compacta sozinha | O agente grava com a ferramenta `memory`; modelos fracos "dizem que salvaram" sem chamar a ferramenta |
| Revisão em segundo plano | Um fork do agente revisa a conversa depois dos turnos e grava memória e skills (`nudge_interval`) | Gasta tokens a cada revisão; dá para usar modelo mais barato | Conversas com o agente |
| Skills (`skill_manage`) | Memória procedural: o agente salva fluxos que funcionaram | Curador arquiva skills sem uso (14 dias "stale", 30 arquivadas) | Tarefas resolvidas |
| Provedor externo de memória (1 ativo) | Honcho, Hindsight (grafo de conhecimento), Mem0, Supermemory… Busca relevante antes de cada turno, sincroniza turnos, extrai ao fim da sessão | Depende do provedor; cloud ou self-hosted | Turnos do agente + escritas espelhadas |
| Arquivos de contexto | `SOUL.md` (personalidade global), `AGENTS.md` | Fixos, escritos por nós | Não aprendem |

## Resposta direta
- **Você ↔ Heimdall (self-chat):** o aprendizado nativo funciona. Preferências, correções e fluxos viram memória/skills; o histórico fica pesquisável.
- **Conversas, áudios e PDFs dos clientes:** o Hermes **não aprende com mensagens que não passam por ele como turnos**. A memória nativa é pequena de propósito e não "absorve" milhares de mensagens. É preciso um pipeline nosso.
- "Memória inteira" não é nativa: vem de um acervo bruto + conhecimento destilado + recuperação sob demanda.

## Desenho proposto (3 camadas)
1. **Acervo bruto (verdade):** SQLite + arquivos originais (áudio, PDF). Nada de LLM, nada perdido. Fora do git (`data/`).
2. **Conhecimento destilado (nosso pipeline, LLM em lote e barato):** dossiê por contato (.md), resumo por dia, fatos e entidades (empresa, cargo, dores, objeções, promessas, próximos passos, valores). Versão legível por você.
3. **Memória do Hermes:** `MEMORY.md`/`USER.md` com seu jeito de vender e regras; **um** provedor externo de recuperação semântica (decisão pendente) ou um MCP próprio sobre as camadas 1 e 2; cron para os relatórios.

## Como o Hermes se liga ao listener (sessão única, aparelho único)
| Opção | Como | Prós | Contras |
|---|---|---|---|
| **P. Plugin de plataforma** | Plugin Python em `~/.hermes/plugins/` implementa `connect/send/handle_message`; o listener entrega o self-chat; `send()` travado no próprio JID | Integra com gateway, cron e home channel | Mais código; Python + Node |
| **Q. API Server** | O listener chama o endpoint compatível com OpenAI do Hermes com as mensagens do self-chat e ele mesmo envia a resposta | Simples; o envio fica 100% no listener (trava estrutural) | Cron não entrega no WhatsApp: o listener entrega os .md gerados |

## Decisões tomadas (usuário)
1. Aparelho único (sessão única).
2. Importar tudo o que o Baileys conseguir puxar.
3. Escutar todos os grupos.
4. Mensagens enviadas pelo usuário entram no contexto.
5. Local ou VPS, a decidir depois.

## Pendências
- Provedor de memória: Hindsight, Honcho, Mem0, Supermemory ou MCP próprio? Local ou nuvem (LGPD)?
- P ou Q para a ponte listener ↔ Hermes?
- Modelos e orçamento: pipeline em lote (barato) vs. Hermes principal (forte).
- Dados de clientes **nunca** vão para este repositório.
