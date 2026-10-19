# Heimdall preflight

Verifica se a máquina atende aos requisitos do Heimdall. **Só lê informações; não instala nada, não altera nada e não envia dados para fora.**

| Sistema | Comando |
|---|---|
| macOS ou Linux (inclui WSL2) | `sh preflight.sh` |
| Windows 10/11 | `powershell -ExecutionPolicy Bypass -File .\preflight.ps1` |

Saída: relatório na tela (`[OK]`, `[ATENCAO]`, `[FALHA]`) e `preflight-resultado.json` na pasta atual.
Código de saída: `0` atende · `1` atende com ressalvas · `2` não atende.

Estado de teste (2026-10-19):
- `preflight.sh`: **executado e validado no Linux** (Ubuntu 24.04, x86_64). **Não testado no macOS.**
- `preflight.ps1`: **não executado** (sem PowerShell no ambiente de desenvolvimento). Precisa de teste em Windows real.

Os limites usados (memória, disco, núcleos) estão em `docs/plano/fase-1-requisitos-e-preflight.md`, com a origem de cada um.
