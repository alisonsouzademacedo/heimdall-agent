---
name: extrair-compromissos-e-sinais
description: Extrai compromissos, sinais de potencial e pendencias
version: 0.1.0
metadata:
  hermes:
    tags: [heimdall, extracao]
    category: heimdall
---

# Extrair compromissos e sinais

## When to Use
Na fila de processamento (`fila.tipo = extrair`), depois que uma mensagem, um áudio transcrito ou um PDF convertido de um cliente entra no acervo.

## Procedure
1. Leia o material do cliente na janela e os compromissos já conhecidos (`cliente(id)`).
2. Siga `references/compromissos-e-sinais.md` e devolva só o JSON definido lá.
3. Se houver `duvidas`, elas vão ao dono no relatório seguinte (não pergunte fora do self-chat).

## Pitfalls
- Datas relativas contam a partir da data da mensagem, não de hoje.
- Sinais de potencial só valem quando o cliente os produz; contato `interno` não gera sinal.
- Na dúvida sobre "aguardando resposta", marque `true`.

## Verification
Todo item tem `mensagem_origem` e `motivo`; confiança abaixo de 0,6 virou dúvida, não afirmação.
