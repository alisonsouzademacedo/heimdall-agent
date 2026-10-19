# PROGRESS — diário de trabalho da IA

Memória do projeto para qualquer IA que continue o trabalho. **Atualize ao fim de cada passo.** Não apague entradas antigas.

## Estado atual (2026-10-19)
- Fase: **planejamento concluído**; spike ainda não iniciado.
- Decisões: `docs/plano/README.md` (D1 a D18).
- Verificador de ambiente: `spike/preflight/` (`.sh` validado no Linux; `.ps1` e macOS **não validados**; o usuário tentou rodar no Windows e a janela fechou sozinha: corrigido com pausa e relatório em arquivo, **ainda não reconfirmado**).
- Documentação carregada em `docs/`: hermes-agent, baileys, openai-codex, hindsight, whisper, faster-whisper, markitdown, krayin, docker, claude-code, antigravity.

## Próximo passo
1. Usuário baixa o repositório no notebook (local) e roda o verificador de ambiente.
2. Iniciar o spike (`docs/plano/fase-1-spike.md`), na ordem sugerida.

## Registro (mais recente primeiro)
| Data | Passo | Documentos lidos por inteiro | Testes / evidência | Observações |
|---|---|---|---|---|
| 2026-10-19 | Docs do Claude Code (48 págs) e do Antigravity (71 págs); verificação de como cada IA lê `AGENTS.md`; estratégias de carga inicial | `docs/claude-code/memory.md` (seção AGENTS.md), `docs/antigravity/rules.md`, `docs/hindsight/developer/configuration.md` (LLM, concorrência, failover, modo sem LLM) | n/a (sem código) | Três IAs leem o mesmo `AGENTS.md`. Ideias de carga em `fase-1-carga-inicial.md`; itens marcados [validar] dependem do spike |
| 2026-10-19 | Criação de `AGENTS.md`, `CLAUDE.md` e deste diário | `docs/openai-codex/docs/agent-configuration/agents-md.md` | n/a (sem código ainda) | O Codex limita a soma dos `AGENTS.md` a 32 KiB por padrão; manter o arquivo curto |

## Dependências adotadas
(nenhuma instalada ainda)

## Divergências entre documentação e realidade
(nenhuma registrada ainda)
