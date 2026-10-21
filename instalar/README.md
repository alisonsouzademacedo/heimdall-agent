# Instalador do Heimdall (Windows 11)

Duplo clique em `iniciar.cmd` (na pasta de cima). Passo a passo e limites: `docs/plano/PROMPT-INICIAL-NOTEBOOK.md`.

Parâmetros de `instalar.ps1` (para testes ou para ver sem instalar): `-SomenteMostrar` (não instala nada), `-Sim` (responde S a tudo; só para teste), `-SemPausa`, `-SemTestes`, `-SemClipboard`. Exemplo, sem instalar nada:
`powershell -ExecutionPolicy Bypass -File .\instalar\instalar.ps1 -SomenteMostrar`

Ao abrir a tela, o console mostra o **perfil recomendado para este computador** (`apps/core/src/onboarding/perfil.ts`, doc: `docs/plano/fase-1-perfis-de-computador.md`).
`docker-fora.cmd` / `docker-fora.ps1` / `fora-do-pacote.ps1`: abre o Docker Desktop **fora do app Claude** (pelo Explorer) e repara antes o `engine.sock` preso (só remove arquivo de 0 bytes; não fecha o Docker nem para o WSL). O launcher usa isso sozinho. Por quê: `LICOES.md`, 2026-10-20 ("Docker do Claude"). Teste: `tests/instalar/check_fora_do_pacote.sh`.

`docker-reparo.ps1`: detecta e repara o Docker Desktop que não abre por socket preso (`engine.sock`) depois de desligamento; pergunta antes, para o WSL e move a pasta (nunca apaga). Teste: `tests/instalar/check_docker_reparo.sh`.
Arquivos: `instalar.ps1` (o instalador), `assinatura.ps1` (confere a assinatura digital do instalador do Docker antes de executá-lo), `PROMPT-IA.txt`. O instalador também verifica virtualização e WSL (necessários ao Docker). Testes: `tests/instalar/check_{instalar,ambiente_windows,assinatura}.sh`.

Regras do arquivo (aprendidas com erro real, ver `docs/plano/LICOES.md`): só caracteres ASCII; usar `${nome}:` antes de dois-pontos. Testes: `sh tests/instalar/check_instalar.sh`.
