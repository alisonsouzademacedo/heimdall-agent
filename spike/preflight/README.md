# Heimdall preflight

Verifica se a máquina atende aos requisitos do Heimdall. **Só lê informações; não instala nada, não altera nada e não envia dados para fora.**

| Sistema | Comando |
|---|---|
| macOS ou Linux (inclui WSL2) | `sh preflight.sh` |
| Windows 10/11 | `powershell -ExecutionPolicy Bypass -File .\preflight.ps1` |

**Windows, passo a passo (não clique duas vezes no arquivo):**
1. Abra a pasta onde está o `preflight.ps1`, clique na barra de endereço, digite `powershell` e tecle Enter (abre o PowerShell já nessa pasta).
2. **Copie a linha inteira abaixo, começando pela palavra `powershell`, cole e tecle Enter:**
   ```
   powershell -ExecutionPolicy Bypass -File .\preflight.ps1
   ```
   Se aparecer "o termo '-ExecutionPolicy' não é reconhecido", faltou a palavra `powershell` no começo da linha.
3. **Outro jeito**, já dentro do PowerShell aberto (duas linhas, uma de cada vez):
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\preflight.ps1
   ```
   A primeira linha vale só para esta janela e não altera o computador de forma permanente.
4. Se aparecer um erro de "scripts desabilitados" ou "arquivo bloqueado", rode antes `Unblock-File .\preflight.ps1`.
5. A janela espera você teclar Enter no fim. O relatório também fica em `preflight-relatorio.txt`.

Saída: relatório na tela (`[OK]`, `[ATENCAO]`, `[FALHA]`) e `preflight-resultado.json` na pasta atual.
Código de saída: `0` atende · `1` atende com ressalvas · `2` não atende.

Estado de teste (2026-10-19):
- `preflight.sh`: **executado e validado no Linux** (Ubuntu 24.04, x86_64). **Não testado no macOS.**
- `preflight.ps1`: **não executado** (sem PowerShell no ambiente de desenvolvimento). Precisa de teste em Windows real.

Os limites usados (memória, disco, núcleos) estão em `docs/plano/fase-1-requisitos-e-preflight.md`, com a origem de cada um.
