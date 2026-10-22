# WSL (Windows Subsystem for Linux) — documentação

Fonte: https://learn.microsoft.com/windows/wsl/ . As três páginas abaixo são o **Markdown original** do repositório público `MicrosoftDocs/WSL` (pasta `WSL/`), copiado em 2026-10-20, com a origem na primeira linha de cada arquivo (teste: `tests/docs/check_docs.sh`). Licença conferida em 2026-10-20 no repositório de origem: documentação sob **CC BY 4.0** (`LICENSE`), código de exemplo sob MIT (`LICENSE-CODE`); a atribuição é a linha de origem de cada página.

## Por que está aqui
O Docker Desktop no Windows precisa do WSL 2 (`docs/docker/desktop/setup/install/windows-install.md`). Na máquina do dono, `wsl --install` **não** funcionou (resposta circular, recursos opcionais desativados); o que funcionou foi o caminho manual com `dism` (`install-manual.md`). Registro em `docs/plano/LICOES.md` (2026-10-19) e `docs/plano/runbooks/01-docker.md`.

## Páginas
| Arquivo | Para quê |
|---|---|
| `install-manual.md` | Caminho manual: `dism.exe` para ativar "Subsistema do Windows para Linux" e "Plataforma de Máquina Virtual", kernel, `wsl --set-default-version 2` |
| `install.md` | O que `wsl --install` faz e suas opções |
| `wsl-config.md` | `.wslconfig`: `memory=`, `processors=`, `swap=`, `vmIdleTimeout`, `autoMemoryReclaim` (usado em `docs/plano/fase-1-orcamento-de-memoria.md`) |

## Não copiado (consultar online se precisar)
`troubleshooting.md` e as demais páginas do WSL. As issues do Docker citadas em `runbooks/01-docker.md` (`docker/for-win` 15057, 15063, 15064; `docker/desktop-feedback` 460, 554, 692) são relatos de usuários no GitHub, não documentação, e **não** foram copiadas.
