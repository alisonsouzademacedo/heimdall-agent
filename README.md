# Heimdall

Agente que **só escuta** o WhatsApp comercial de um SDR. Ele absorve texto, áudio e PDF, aprende com o tempo e entrega relatórios de **uma tela** no próprio self-chat do dono (diário de terça a sexta às 08:00, semanal na segunda às 08:00).

> **Regra número 1:** o Heimdall nunca envia mensagem a ninguém além do self-chat do dono. Isso é garantido por código e por testes (`apps/core/src/envio.ts`).

## Como começar (Windows 11)

1. Baixe o projeto: **Code → Download ZIP** (branch `main`) e extraia, por exemplo, em `C:\Heimdall`.
2. Dê dois cliques em **`iniciar.cmd`**. Se o Windows avisar, clique em *Mais informações → Executar assim mesmo*.
3. Responda `S` ou `N` a cada programa que faltar (Git, Node.js, Python, Docker). Ele pergunta antes de instalar qualquer coisa.
4. O instalador liga a pasta ao GitHub, roda os testes e abre a **tela de configuração** no navegador. Deixe a janela preta aberta.

Se algo falhar, um relatório sem segredos é gravado em `data\bugs\` e o texto inicial para a IA é copiado para a área de transferência (`instalar/PROMPT-IA.txt`). Detalhes: [`instalar/README.md`](instalar/README.md) e [`docs/plano/PROMPT-INICIAL-NOTEBOOK.md`](docs/plano/PROMPT-INICIAL-NOTEBOOK.md).

## Estado atual

Veja [`docs/plano/PROGRESS.md`](docs/plano/PROGRESS.md). Em resumo: o núcleo (regras de acompanhamento, envio travado ao self-chat, banco, ingestão, apagar com confirmação, backup, relatórios, aprendizado, contrato MCP), o instalador e o passo "Ambiente" da tela estão prontos e testados em Linux **e num Windows 11 real** (também no GitHub, com Node 22 e 24). No Windows do dono o **Docker Desktop já funciona** (WSL ativado pelo caminho manual da Microsoft, `docs/wsl/`) e a **memória foi medida em 8 GB**: cabe, mas sem margem (`docs/plano/fase-1-orcamento-de-memoria.md`). O instalador e a tela mostram o **perfil recomendado para cada computador** (`docs/plano/fase-1-perfis-de-computador.md`). **Ainda não existem:** os Dockerfiles e o Compose do Heimdall, os passos 2 a 12 da tela de configuração e o relatório semanal. **Onde roda (D30):** primeiro no Windows, até validar; depois migra para uma VPS já com o aprendizado (`docs/plano/fase-2-migracao-para-vps.md`).

## Mapa do repositório

| Pasta / arquivo | O que é |
|---|---|
| `iniciar.cmd`, `instalar/` | Instalador de um clique e texto inicial para a IA |
| `apps/core/` | Núcleo em TypeScript (sem dependências de execução) e a tela de onboarding |
| `prompts/`, `templates/` | Personalidade, skills e modelos de cadastro |
| `docs/plano/` | Planejamento, decisões (D1 a D29), roteiros (`runbooks/`), lições aprendidas, orçamento de memória e **perfis por tipo de computador** (`fase-1-perfis-de-computador.md`) |
| `docs/<ferramenta>/` | Cópia da documentação oficial de cada ferramenta usada |
| `spike/preflight/` | Verificação do computador antes de instalar |
| `tests/` | Testes de regressão, segurança, instalador e documentação |
| `AGENTS.md` / `CLAUDE.md` | Regras para qualquer IA que trabalhe aqui |

## Testes

```
sh tests/run-all.sh          # tudo (precisa de Node 22.18+ e, para o instalador, PowerShell 7)
cd apps/core && npm test     # só o núcleo
```

O GitHub roda tudo isso a cada alteração (`.github/workflows/testes.yml`).

## Privacidade

Dados de clientes e segredos ficam em `data/` e em arquivos de ambiente, **fora do git** (`.gitignore`). O repositório só contém código, documentação e dados sintéticos de teste.
