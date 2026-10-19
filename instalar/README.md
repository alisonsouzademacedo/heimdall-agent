# Instalador do Heimdall (Windows 11)

Duplo clique em `iniciar.cmd` (na pasta de cima). Passo a passo e limites: `docs/plano/PROMPT-INICIAL-NOTEBOOK.md`.

Parâmetros de `instalar.ps1` (para testes ou para ver sem instalar): `-SomenteMostrar` (não instala nada), `-Sim` (responde S a tudo; só para teste), `-SemPausa`, `-SemTestes`, `-SemClipboard`. Exemplo, sem instalar nada:
`powershell -ExecutionPolicy Bypass -File .\instalar\instalar.ps1 -SomenteMostrar`

Arquivos: `instalar.ps1` (o instalador), `assinatura.ps1` (confere a assinatura digital do instalador do Docker antes de executá-lo), `PROMPT-IA.txt`. O instalador também verifica virtualização e WSL (necessários ao Docker). Testes: `tests/instalar/check_{instalar,ambiente_windows,assinatura}.sh`.

Regras do arquivo (aprendidas com erro real, ver `docs/plano/LICOES.md`): só caracteres ASCII; usar `${nome}:` antes de dois-pontos. Testes: `sh tests/instalar/check_instalar.sh`.
