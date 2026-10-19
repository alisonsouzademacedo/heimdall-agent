---
name: calibrar-personalidade
description: Propoe ao dono uma nova voz do Heimdall
version: 0.1.0
metadata:
  hermes:
    tags: [heimdall, personalidade]
    category: heimdall
---

# Calibrar personalidade

## When to Use
Após a carga inicial, no máximo uma vez por mês, ou quando o dono pedir "recalibra a personalidade". Plano completo: `references/calibracao.md`.

## Procedure
1. Leia **só as mensagens do dono** (`de_mim`) e escreva `data/perfil-de-voz.md`: tom, formalidade, aberturas e fechamentos, expressões frequentes, tamanho típico, diferença entre cliente, gestor e colega.
2. Proponha o bloco adaptativo do `SOUL.md`. Não mexa no bloco fixo de limites.
3. Mande ao dono, no self-chat, uma mensagem com: perfil em 5 a 8 linhas, três exemplos antes/depois e o bloco proposto. Comandos: `aprovar`, `ajustar: ...`, `recusar`, `voltar versão`.
4. Nada muda sem `aprovar`. A montagem e a guarda de versões são feitas pelo código.

## Pitfalls
- Não copie conteúdo de clientes para o perfil.
- Não afirme traço que você não viu nas mensagens.
- O perfil de voz serve a rascunhos de resposta; você nunca os envia.

## Verification
Cada traço do perfil tem exemplo real nas mensagens do dono; o bloco fixo de limites ficou intacto.
