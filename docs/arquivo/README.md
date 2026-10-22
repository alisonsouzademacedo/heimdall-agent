# Arquivo — documentação que não é fonte ativa

Este diretório guarda documentos **históricos**: eles explicam como algo foi feito no passado, mas **não valem mais como instrução**. Não use nada daqui para operar o Heimdall hoje. O código e os testes são a verdade; o plano atual está em `docs/plano/README.md` e a tabela de componentes ativos está no `AGENTS.md`.

## O que está aqui
- `wsl/` — documentação do WSL 2 (Windows). O projeto virou **Linux-only** em 2026-10-22 (máquina do dono com Omarchy e VPS Linux); o WSL não é mais alvo. Guardo o material porque ele foi usado na máquina antiga e pode ajudar a entender o histórico.
- `PROMPT-INICIAL-NOTEBOOK.md` — roteiro do instalador do Windows (`iniciar.cmd` + `instalar/instalar.ps1`), removido em 2026-10-22. O roteiro atual de instalação é o `README.md` da raiz + `docs/plano/fase-2-execucao.md`.

## Regras
- Nada daqui é verificado por `tests/docs/check_docs.sh`; a biblioteca ativa é a de `docs/` fora deste diretório.
- Se um documento arquivado voltar a ser necessário, ele precisa ser revisado, indicar a origem (`<!-- source: ... -->`) e entrar na tabela do `AGENTS.md`; não basta movê-lo de volta.
- O histórico completo continua no git; este diretório é para leitura, não para orientar a IA.
