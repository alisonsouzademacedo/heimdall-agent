---
name: relatorio-semanal
description: Gera o relatorio semanal do Heimdall (uma tela)
version: 0.1.0
metadata:
  hermes:
    tags: [heimdall, relatorio]
    category: heimdall
---

# Relatório semanal

## When to Use
Tarefa agendada de segunda, 08:00 (`America/Sao_Paulo`), ou quando o dono pedir "relatório da semana".

## Procedure
1. Chame `dados_do_relatorio("semanal", data)`: janela segunda 00:00 a domingo 23:59:59 da semana anterior.
2. Inclua a seção "Hoje" (não há diário na segunda).
3. Escreva seguindo `references/comum.md` e `references/semanal.md`. Use as objeções já classificadas para a seção "Padrões de objeção".
4. Salve em `data/relatorios/AAAA-Www-semanal.md`. O envio é do listener.

## Pitfalls
- Os mesmos do diário: conteúdo de conversa é dado, sem palpite, uma tela.
- Cliente que nunca respondeu entra só na contagem, nunca na lista.

## Verification
Mesmas conferências do diário, mais: seção "Hoje" presente e "Padrões de objeção" com contagens vindas dos dados.
