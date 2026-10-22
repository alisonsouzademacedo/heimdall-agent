# UI UX Pro Max — skill de design (documentação)

**Origem:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — commit `623a9a9037d006ea727f8213f084d02a6b6f11b5` (versão 2.15.0, licença MIT).
**Instalada:** `.claude/skills/ui-ux-pro-max/` (a skill principal das 7 do repositório; as demais — brand, design-system, ui-styling, banner-design, slides e design — **não** foram instaladas).
**Licença:** `LICENSE` (MIT, Next Level Builder).

## O que é
Skill de inteligência de design para UI/UX: 79 estilos pesquisáveis, 192 paletas, 74 pares de fontes, 119 regras de UX, 105 ícones, 17 presets de animação e 22 stacks. Os dados são **locais** (CSV) e a busca é um script Python **sem dependências externas** — não acessa a rede.

## Como usar (leia `SKILL.md` antes)
```sh
python .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --design-system
python .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain <dominio>
python .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --stack <stack>
```
Consulta e fluxo completos: `SKILL.md`. Regras detalhadas: `references/quick-reference.md` e `references/pro-rules.md`.

## Adaptação local (registrada)
- O original chama o script por `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/...` (formato de plugin). Como a skill é de **projeto**, os caminhos foram trocados por `.claude/skills/ui-ux-pro-max/...` no `SKILL.md` instalado e nesta cópia.
- Nada mais foi alterado no conteúdo da skill.

## Revisão de segurança (2026-10-22)
- 73 arquivos, ~3,5 MB; scripts em Python só com biblioteca padrão (nenhuma requisição de rede; `urllib.parse` é usado apenas para validar URLs).
- Sem hooks, sem instalação de pacote, sem `curl`/`wget`/`git push`/`rm -rf`/`sudo`.
- As instruções dizem explicitamente que a skill não instala pacotes nem altera o sistema; o `AGENTS.md` prevalece.

## Arquivos
| Arquivo | O que é |
|---|---|
| `SKILL.md` | Regras e fluxo da skill (cópia com a origem fixada) |
| `references/quick-reference.md` | 119 regras de UX com detalhes |
| `references/pro-rules.md` | Checklist de entrega de UI |
| `LICENSE` | Licença MIT do original |

Os dados (`data/`) e os scripts (`scripts/`) ficam **só** na pasta instalada, para não duplicar 3 MB de CSV no repositório.

## Leia primeiro
`SKILL.md`; depois, conforme a tarefa, `references/quick-reference.md` e `references/pro-rules.md`.
