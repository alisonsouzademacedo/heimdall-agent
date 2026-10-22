# Heimdall

Agente que **só escuta** o WhatsApp comercial de um SDR. Ele absorve texto, áudio e PDF, aprende com o tempo e entrega relatórios de **uma tela** no próprio self-chat do dono (diário de terça a sexta às 08:00, semanal na segunda às 08:00).

> **Regra número 1:** o Heimdall nunca envia mensagem a ninguém além do self-chat do dono. Isso é garantido por código e por testes (`apps/core/src/envio.ts`).

## Como começar (Linux)

O projeto é **Linux-only** desde 22/10/2026: o alvo é a máquina do dono com Omarchy e a VPS de validação. A camada Windows (instalador, `iniciar.cmd`, testes de comportamento no Windows) foi removida de propósito — não reintroduza.

```sh
git clone https://github.com/alisonsouzademacedo/heimdall-agent.git
cd heimdall-agent
sh tests/run-all.sh        # precisa de Node 22.18+, Python 3 e, para os testes de infra, Docker
```

Ainda **não existe** ligador de um clique em Linux: o supervisor (equivalente ao antigo `iniciar.cmd`) e o roteiro de instalação na VPS fazem parte do plano [`docs/plano/fase-2-execucao.md`](docs/plano/fase-2-execucao.md). Se algo falhar, a tela grava um relatório sem segredos em `data/bugs/`.

## Estado atual

Veja [`docs/plano/PROGRESS.md`](docs/plano/PROGRESS.md). Em resumo: o núcleo (regras de acompanhamento, envio travado ao self-chat, banco, ingestão, apagar com confirmação, backup, relatórios, aprendizado, contrato MCP) e o passo "Ambiente" da tela estão prontos e testados em **Linux** (GitHub Actions, Node 22). As imagens e o Docker Compose do Heimdall existem e foram testados com Docker de verdade em Linux (`infra/`, `apps/media-worker/`, `tests/infra/`). **Já existem (testados na nuvem com dados sintéticos e Docker real):** a escuta do WhatsApp (Baileys, só leitura), a fila de áudio e PDF, o envio da memória ao Hindsight, a ponte do self-chat com o Hermes, os relatórios diário e semanal e a caixa de saída que só entrega ao self-chat. **Ainda não existem ou não foram validados com o WhatsApp real:** a leitura do QR, o histórico real, os logins, a extração por modelo, a integração com um Krayin real, o supervisor Linux e os passos 2 a 13 da tela (a interface está pronta; falta validar ao vivo) - é o programa da fase 2 ([`docs/plano/fase-2-execucao.md`](docs/plano/fase-2-execucao.md)). **Onde roda (D31):** a validação de ponta a ponta será feita **direto na VPS** (Linux); o Omarchy na máquina do dono fica como ambiente de desenvolvimento. A memória do Hindsight viaja no backup `data/backup-volume-pg_data.tar.gz` (fora do git).

## Mapa do repositório

| Pasta / arquivo | O que é |
|---|---|
| `apps/core/` | Núcleo em TypeScript (sem dependências de execução) e a tela de onboarding |
| `apps/listener/`, `apps/trabalhos/`, `apps/memoria/`, `apps/ponte/` | Os processos: WhatsApp, áudio/PDF, Hindsight e Hermes (cada um só fala com o que precisa) |
| `apps/media-worker/`, `infra/` | Imagem do trabalhador de áudio/PDF, imagem do Hindsight com embeddings em português e o Docker Compose (versões fixas, portas só em 127.0.0.1) |
| `prompts/`, `templates/` | Personalidade, skills e modelos de cadastro |
| `docs/plano/` | Planejamento, decisões (D1 a D32), roteiros (`runbooks/`), lições aprendidas e o programa atual (`fase-2-execucao.md`) |
| `docs/<ferramenta>/` | Cópia da documentação oficial de cada ferramenta usada |
| `tests/` | Testes de regressão e documentação (Linux) |
| `AGENTS.md` / `CLAUDE.md` | Regras para qualquer IA que trabalhe aqui |

## Testes

```
sh tests/run-all.sh          # tudo (precisa de Node 22.18+ e Python 3; Docker para os testes de infra)
cd apps/core && npm test     # só o núcleo
```

O GitHub roda tudo isso num job Ubuntu a cada alteração (`.github/workflows/testes.yml`).

## Privacidade

Dados de clientes e segredos ficam em `data/` e em arquivos de ambiente, **fora do git** (`.gitignore`). O repositório só contém código, documentação e dados sintéticos de teste.
