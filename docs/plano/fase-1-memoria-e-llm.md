# Fase 1 — Escolha da memória, ponte e LLMs

Status: **planejamento**. Nada instalado. Cada repositório escolhido terá a documentação varrida com o Firecrawl e salva em `docs/<nome>/`.

## Decisão fechada
- **Ponte listener ↔ Hermes: opção Q** (API Server do Hermes; o listener chama o Hermes com o self-chat e ele mesmo envia a resposta, travado no próprio JID).

## Candidatos de memória (dados das páginas públicas do GitHub em 2026-10-18; confirmar na documentação de cada um)
| | Hindsight | Mem0 | claude-mem | Obsidian |
|---|---|---|---|---|
| O que é | Memória de agente com grafo e linha do tempo | Camada de memória para agentes | Memória para sessões de coding agents (captura uso de ferramentas e resume) | Aplicativo para editar/visualizar markdown local |
| Estrelas | 51,0 mil | 67,4 mil | 101,5 mil | não é repositório |
| Licença | MIT | Apache-2.0 | Apache-2.0 | proprietário (conferir termos) |
| Roda local | Sim (PostgreSQL + pgvector) | Sim (docker compose; Qdrant) | Sim (SQLite + Chroma; Bun/uv) | Sim |
| LLM para extrair | 25+ provedores: Ollama/LM Studio local, endpoints OpenAI-compatíveis e **logins de assinatura** (`openai-codex` p/ ChatGPT Plus/Pro, `claude-code` p/ Claude Pro/Max) | Padrão `gpt-5-mini` (API da OpenAI); outros suportados | Claude Agent SDK, Gemini, OpenRouter | nenhum |
| Recuperação | Semântica + BM25 + grafo (entidades/temporal/causal) + filtro por tempo | Semântica + BM25 + entidades, raciocínio temporal | Busca híbrida com Chroma | Busca de texto, links |
| Plugin no Hermes | Sim (catálogo, mantido pela vectorize-io) | Sim (catálogo) | Cita Hermes como suportado | Não precisa: Hermes lê .md |
| Encaixe no Heimdall | **Forte:** conversas de vendas têm entidades (cliente, empresa) e tempo | Bom, mas padrão exige API paga | **Fraco:** feito para observar sessões de código, não importar acervo de chat | **Complemento:** visualizar os dossiês da camada 2 |

Recomendação provisória: **Hindsight** como memória de recuperação; **Obsidian** só como visualizador do cofre de dossiês; Mem0 como reserva; claude-mem descartado para o acervo de WhatsApp.

## Assinaturas × Hermes (fonte: `docs/hermes-agent/integrations/providers.md`)
| Plano | Funciona no Hermes? | Observação |
|---|---|---|
| ChatGPT Plus | **Sim**, `hermes model` → ChatGPT/Codex (login por código) | Consumo da cota do plano **não documentado**; ver limites do Codex na OpenAI |
| Claude Pro | **Não** no Hermes (OAuth exige Max + créditos extras) | Pelo Hindsight, o provedor `claude-code` cita Pro/Max: mecanismo diferente, **verificar** termos da Anthropic |
| Google AI Plus | **Sem caminho** (provedor Gemini só aceita chave de API) | Chave gratuita do AI Studio é pequena demais para agente (docs do Hermes) |

Consequências: agente principal no ChatGPT Plus; destilação e memória via Hindsight com `openai-codex`, `claude-code` ou modelo local; Google AI Plus fica sem papel até haver caminho documentado.
Riscos: cotas por janela de tempo podem esgotar na importação do histórico completo (fila com pausa e retomada); termos de uso de automação 24h em plano de consumidor; política de retenção/treinamento de cada plano (LGPD).

## RAG × fine-tuning
Memória de recuperação (RAG) é o que Hindsight/Mem0 fazem. **Fine-tuning não está disponível** com planos de assinatura (exige API do provedor) e não é recomendado aqui: o conhecimento muda todo dia e os dados são sensíveis. Retomar só se o RAG mostrar limite.

## Próximos passos (planejamento)
1. Usuário confirma Hindsight (ou outro) → varrer a documentação com o Firecrawl e salvar em `docs/hindsight/`.
2. Ler os guias de assinatura de cada provedor (OpenAI Codex, Claude Code, Google) e registrar limites e termos.
3. Etapas seguintes: áudio, PDF, relatórios, MCP, Kanban.

## Achados das documentações oficiais (2026-10-18)
Fontes: `docs/openai-codex/docs/pricing.md`, `docs/openai-codex/docs/auth/ci-cd-auth.md`, `docs/hindsight/developer/models.md`, `docs/hindsight/sdks/integrations/hermes.md`.

**OpenAI / ChatGPT Plus**
- Plus custa US$ 20/mês e é descrito como "algumas sessões focadas de código por semana". Os números exatos de limite **não aparecem** nas páginas lidas (apontam para a Central de Ajuda).
- Para automação, a OpenAI diz que "a forma certa é uma chave de API". Login ChatGPT em servidor é um fluxo **avançado**, só em infraestrutura privada confiável, com uma única máquina ou fila serializada usando o `auth.json`, que deve ser tratado como senha.
- O GPT-5.5 deixa o Codex com login ChatGPT em 14/10/2026; modelos atuais: GPT-6.1 Sol e GPT-6 Luna. Rever nomes de modelo nas configurações.

**Hindsight × assinaturas**
| Provedor do Hindsight | Mecanismo | Observação da própria doc |
|---|---|---|
| `chatgpt` | "Sign in with ChatGPT" para apps open-source; API pública `/v1/responses`; credenciais próprias | Rota suportada; exige plano que permita uso em apps de terceiros; **não compartilha nem rotaciona** os tokens do Codex CLI |
| `openai-codex` | Reusa o login do Codex CLI e chama endpoint privado | "Somente uso pessoal de desenvolvimento" |
| `claude-code` | Claude Agent SDK com Claude Pro/Max | Aviso de termos: "somente local e pessoal, não usar em produção"; usa a cota do plano |
| `ollama` / `lmstudio` | Modelo local | Sem custo de cota; exige hardware |
- Plugin do Hermes: `hermes plugins install hindsight` + `hermes memory setup`. O plugin antigo via pip está **obsoleto**.

**Consequências para o Heimdall**
1. Para o Hindsight, o caminho de assinatura mais defensável é `chatgpt` (rota suportada), com credenciais separadas das do Hermes.
2. Claude Pro serve só para uso pessoal/desenvolvimento, não para o serviço 24h.
3. A cota do Plus é pequena. Importar o histórico inteiro e destilar tudo com o Plus tende a estourar. Alternativas a decidir: modelo local para a extração em lote; Plus só para o agente principal; ou uma chave de API para o pipeline.
