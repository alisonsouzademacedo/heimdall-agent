# Testes de segurança com o Strix

Status: **preparado, ainda não executado** (sem Docker em funcionamento e sem chave de modelo nesta sessão em nuvem). Documentação do Strix: `docs/strix/` (lida: `index`, `quickstart`, `usage/{cli,scan-modes,instructions}`, `advanced/configuration`, `llm-providers/{overview,openai,local}`, `tools/sandbox`, `integrations/{ci-cd,github-actions,coding-agents,mcp}`, `cloud/overview`; as demais páginas estão na biblioteca e não foram necessárias).

## O que o Strix é e o que ele pede
Ver `docs/strix/INDEX.md`. Em resumo: agentes que tentam explorar falhas de verdade dentro de um contêiner Docker e **só reportam o que conseguem provar**. Exige Docker rodando e **chave de API de modelo (pago por uso)**; não há login por assinatura nas páginas lidas.

## O que ele pode testar hoje
O núcleo (`apps/core`) ainda é uma biblioteca, **sem servidor web**. Então a varredura de agora é **white-box** sobre o código (`strix --target <pasta>`; modos `quick`, `standard`, `deep` em `usage/scan-modes.md`; o modo `deep` roda análise estática com `semgrep`, busca estrutural, segredos e cadeia de suprimentos). Quando existirem a **tela de onboarding** e o **servidor do MCP**, o alvo passa a incluir a aplicação no ar (autenticação do código de uso único, acesso só local, injeção por mensagem etc.).

## Três divisões de trabalho
| Quem | O quê | Estado |
|---|---|---|
| **Testes escritos por mim** (`apps/core/src/*.test.ts`, `tests/*/check_*.sh`) | Regras, envio travado, entrada, banco, apagar, aprendizado, relatórios, contrato do MCP, arquitetura e "teste dos testes" | **Rodando**, local e no GitHub |
| **Strix, varredura white-box** | Procura brechas que meus testes não imaginaram (segundo caminho de envio, falsificar o self-chat, apagar sem autorização, injeção de SQL e de caminho de arquivo, ReDoS, segredos) | **Pronto para rodar** (`tests/seguranca/strix/`); falta a chave e a sua aprovação do custo |
| **Strix, teste dinâmico** | Contra a tela e o MCP no ar | Depois que a tela existir |

## Como rodar (no notebook, com o Docker ligado)
```
# 1) Instalar o Strix (a documentação indica pipx ou o instalador deles; peça a confirmação do dono: regra 4)
# 2) Rodar contra uma COPIA do código, com teto de gasto:
CONFIRMO_CUSTO=sim STRIX_LLM=openai/gpt-5.4 LLM_API_KEY=... STRIX_ORCAMENTO_USD=10 \
  sh tests/seguranca/strix/rodar-strix.sh standard
```
O script (testado com um Strix de mentira em `tests/seguranca/check_strix_preparado.sh`):
- **recusa rodar** sem `CONFIRMO_CUSTO=sim`, sem modelo, sem chave, sem Docker ou com modo inválido;
- roda sobre uma **cópia** só dos arquivos versionados (o Strix monta a pasta-alvo **gravável**, `docs/strix/usage/cli.md`) e confere que o projeto real não mudou;
- desliga a **telemetria** (`STRIX_TELEMETRY=0`), liga o **teto de gasto** (`--max-budget`) e falha com achados `high` ou acima (`--fail-on high`);
- guarda os resultados em `data/seguranca/` (fora do git, pois podem conter trechos do código).

## Escolhas que dependem do dono
1. **Custo e chave.** Uma varredura `standard` leva de 30 minutos a 1 hora (`usage/scan-modes.md`) e gasta tokens de uma chave de API. O teto sugerido é US$ 10; o gasto real depende do modelo. **Não sei estimar** sem rodar.
2. **Modelo.** A documentação do Strix lista modelos em nuvem como recomendados e diz que modelos locais pequenos têm dificuldade; no notebook de 8 GB não cabe modelo local grande.
3. **Strix na nuvem (`app.strix.ai`)**: envia o código para o serviço deles; **não usado** sem decisão sua.
4. **Skills do Strix para a IA instaladora** (`npx skills add usestrix/strix`, `integrations/coding-agents.md`): instalam instruções de terceiros na IA; só com sua confirmação e depois de ler os arquivos (regra 4 e proteção contra instruções escondidas).
5. **Varredura em cada pull request (GitHub)** consta na documentação (`integrations/github-actions.md`), mas **não foi ligada**: gastaria dinheiro a cada envio. Ficaria como `.github/workflows/seguranca.yml` com `STRIX_LLM` e `LLM_API_KEY` guardados como segredos do repositório.

## Registro dos achados
Cada achado confirmado vira, nesta ordem (`AGENTS.md`, seção de erro resolvido): teste de regressão que falha → correção → atualização das instruções → linha em `LICOES.md`.
