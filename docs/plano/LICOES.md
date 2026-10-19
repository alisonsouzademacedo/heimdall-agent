# Lições aprendidas (registro de erros resolvidos)

Regra (`AGENTS.md`, "Cada erro resolvido vira aprendizado permanente"): todo erro resolvido gera **um teste de regressão**, **uma atualização das instruções** e **uma linha aqui**. Não apague entradas antigas. Entradas mais recentes primeiro.

## Modelo de entrada
| Data | Sintoma | Causa | Correção | Teste criado | Instruções alteradas |
|---|---|---|---|---|---|

## Registro
| Data | Sintoma | Causa | Correção | Teste criado | Instruções alteradas |
|---|---|---|---|---|---|
| 2026-10-20 | No Windows, o usuário digitou `-ExecutionPolicy Bypass -File .\preflight.ps1` e o PowerShell respondeu "o termo '-ExecutionPolicy' não é reconhecido" | A instrução não deixava claro que a linha **começa** pela palavra `powershell`; o usuário já estava dentro do PowerShell e copiou só os parâmetros | `spike/preflight/README.md` agora mostra a linha completa em bloco de código, explica o erro e traz uma alternativa de duas linhas (`Set-ExecutionPolicy -Scope Process Bypass` e `.\preflight.ps1`) | **Pendente:** confirmar em Windows real (sem PowerShell no ambiente de desenvolvimento). Passo manual registrado | `spike/preflight/README.md` |
| 2026-10-20 | Documentação do Codex salva com nomes de arquivo errados e páginas `?surface=` com o ".md" no meio do nome | O comando `tr "/" "__"` do shell troca cada barra por **um** sublinhado, não dois; páginas com consulta (`?surface=cli`) geravam nomes inválidos | Nomes refeitos a partir da lista de URLs; arquivos com consulta renomeados para `--surface-<valor>` | Nenhum (era um passo de preparação da biblioteca, não código). Verificação manual: contagem de páginas e `INDEX.md` conferidos | Nenhuma ainda; se virar rotina, criar script com teste |
| 2026-10-19 | Janela do PowerShell abria e fechava sozinha ao rodar o verificador de ambiente | O script termina e a janela fecha; sem pausa nem arquivo de saída não dá para ler o resultado; execução por duplo clique também pode ser barrada pela política de scripts | Pausa no fim (`Read-Host`), relatório em `preflight-relatorio.txt` e instruções passo a passo no `spike/preflight/README.md` | **Pendente:** teste em Windows real (não existe PowerShell no ambiente de desenvolvimento). Registrado como passo manual | `spike/preflight/README.md` |
| 2026-10-18 | Erro HTTP 429 ao raspar documentação com o Firecrawl em ritmo alto (140 de 220 páginas falharam) | Limite de taxa da API com 6 chamadas simultâneas | Reduzido para 2 simultâneas, 5 tentativas e espera crescente (10 s, 20 s...), repetindo só o que faltava | Nenhum automatizado (script descartável). A regra virou prática | `docs/plano/fase-1-carga-inicial.md` (item 5: controlar o ritmo) |
| 2026-10-18 | Páginas 404 salvas como se fossem documentação (3 do Baileys, 8 do Docker) | Endereços de alias ou de versões antigas existem no índice mas não no site | Arquivos 404 removidos; os índices explicam onde achar o conteúdo | Nenhum (preparação da biblioteca) | `docs/baileys/INDEX.md`, `docs/docker/INDEX.md` |

## Lições gerais já incorporadas às instruções
- Comandos para o usuário devem ser dados **completos, em bloco de código, prontos para copiar**, com o que fazer se der o erro mais provável. O usuário não é programador e copia só o que parece ser o comando.
- Conferir sempre o conteúdo baixado (tamanho, cabeçalho), não só o código HTTP 200.
- Qualquer chamada em lote a serviço externo precisa de limite de simultaneidade e de espera crescente.
- Verificadores e scripts de usuário precisam deixar o resultado em arquivo e não podem depender de a janela continuar aberta.
