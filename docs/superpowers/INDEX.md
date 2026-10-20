# Superpowers — índice e decisão de uso

Fonte: https://github.com/obra/superpowers (licença **MIT**, © Jesse Vincent; texto em `LICENSE`). Versão copiada: **7.0.0**, commit `b739a8af570e10a95898f2bdf6cec97467fa6c12` (2026-10-20). Cada página traz a origem na primeira linha.
O que é: uma coleção de "skills" (instruções em Markdown que o agente carrega quando a tarefa pede) para trabalhar com método: testes primeiro, depurar pela causa, verificar antes de dizer "pronto", pedir e receber revisão.
Copiado aqui: `README.md`, `RELEASE-NOTES.md`, `AGENTS.md` (o do próprio Superpowers) e **todas** as páginas `.md` de `skills/` (15 skills). **Não copiado:** `docs/superpowers/plans` e `specs` do projeto deles (histórico de desenvolvimento, ~1 MB, sem uso aqui), os plugins de outros programas (Cursor, Codex etc.) e os scripts do servidor visual.
Leia primeiro (para quem for mexer): `skills/test-driven-development/SKILL.md`, `skills/systematic-debugging/SKILL.md`, `skills/verification-before-completion/SKILL.md`.

## O que foi instalado no projeto (`.claude/skills/`, idêntico ao original; o Claude Code carrega a partir da próxima sessão)
| Skill | Por que entrou |
|---|---|
| `test-driven-development` | Casa com a regra 5 do `AGENTS.md` (teste que falha antes, nunca enfraquecer teste) |
| `systematic-debugging` | Casa com "Cada erro resolvido vira aprendizado": causa raiz antes de corrigir |
| `verification-before-completion` | Casa com "mostre a saída real; nunca 'deve estar funcionando'" |
| `requesting-code-review`, `receiving-code-review` | Revisão independente do que foi feito (ver abaixo: só como roteiro, sem disparar agentes por conta própria) |

## O que NÃO foi instalado, e por quê
| Skill | Motivo |
|---|---|
| `using-superpowers` | Manda invocar skills **antes de qualquer resposta**, até antes de perguntar; isso briga com o protocolo "ler `AGENTS.md` e `PROGRESS.md` primeiro". Sua função (apresentar as skills) é cumprida pela lista de skills do Claude Code |
| `brainstorming`, `writing-plans` | Encadeiam para `subagent-driven-development` e `executing-plans` (abaixo); o planejamento do Heimdall já tem processo próprio (decisões D1 a D30, aprovação do dono). `brainstorming` ainda abre um servidor local e carrega uma imagem de fora |
| `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents` | Disparam muitos agentes em paralelo: **gasto alto** de créditos, sem pedido do dono |
| `using-git-worktrees`, `finishing-a-development-branch` | Criam áreas de trabalho extras e fazem `git push`/merge: conflita com a regra 4 (confirmar antes de ação difícil de desfazer) e com a regra "só merge quando o dono pedir" |
| `writing-skills`, `diagnosing-superpowers` | Meta (escrever skills) e envio de relatório ao repositório deles (rede): sem uso |
| **Hook de início de sessão** (`hooks/`) | Injeta texto em toda sessão sem o dono ver. Revisado: é inofensivo (só injeta `using-superpowers`), mas **não instalado** por transparência |

## Segurança (revisão feita antes de instalar)
Li os `SKILL.md` instalados e procurei por `curl`, `wget`, `git push`, `rm -rf`, `sudo`, `eval`, instalação de pacotes e endereços: nas 5 skills instaladas **não há nada** disso (`tests/docs/check_docs.sh` confere a cada rodada). `systematic-debugging/find-polluter.sh` só procura qual teste cria um arquivo (roda os testes do projeto um a um). Texto de skill é instrução para o agente; **`AGENTS.md` prevalece sobre qualquer skill**.

## Como a IA deve usar
Quando a tarefa for corrigir erro, escrever código novo ou declarar algo pronto, ler a skill correspondente **inteira** e seguir, sem contrariar o `AGENTS.md`. Revisão de código (as duas skills de revisão) é roteiro de leitura crítica do diff; **não** disparar subagentes sem o dono pedir (custo).
Atualizar: trocar a pasta copiada por uma versão nova, rever as diferenças (principalmente scripts e comandos) e só então atualizar o commit acima e `.claude/skills/`.
