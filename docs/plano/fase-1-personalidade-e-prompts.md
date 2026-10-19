# Personalidade e prompts do Heimdall

Status: **decisão de direção tomada; prompts ainda não escritos** (item 2 do planejamento).

## Decisão do usuário (2026-10-20)
O usuário **não vai fornecer exemplos** de como escreve nem de como o Heimdall deve falar. Em vez disso:
**quando o Heimdall processar todo o conteúdo, ele deve interpretar como o usuário fala e criar sua própria personalidade.**

## O que isso muda no desenho
1. **`SOUL.md` inicial é mínimo.** Define só o essencial: assessor comercial do SDR, objetivo e direto, português do Brasil, honesto sobre o que sabe e não sabe, nunca fala com terceiros (só self-chat). Sem estilo inventado.
2. **Perfil de voz aprendido.** Na primeira carga, o Heimdall analisa as mensagens **enviadas pelo usuário** (já no acervo, de todas as conversas, inclusive com o Pedro) e produz `perfil-de-voz.md`: tom, formalidade, jeito de abrir e fechar conversas, expressões frequentes, tamanho típico das mensagens, como trata cliente, gestor e colega. A cada ciclo de aprendizado, atualiza.
3. **Personalidade própria do Heimdall derivada do perfil.** Com base nesse perfil, o Heimdall propõe uma versão de `SOUL.md` (como ele se dirige ao usuário no self-chat e como redige os relatórios).
4. **Controle (proposta minha, o usuário pode mudar):** o Heimdall **propõe** a mudança de personalidade e o usuário **aprova ou corrige no self-chat**; cada versão do `SOUL.md` é guardada e pode ser desfeita. Motivo: personalidade que muda sozinha sem ninguém ver pode se afastar do que o usuário quer. Se o usuário preferir atualização automática, basta decidir.
5. **Salvaguarda fixa:** aprender o jeito de falar do usuário **não autoriza** o Heimdall a escrever em nome dele para terceiros; a regra de só enviar ao self-chat continua valendo.

## Onde cada coisa mora
- `prompts/SOUL.md` no repositório = versão inicial mínima; a versão viva fica em `/opt/data/SOUL.md` no volume do Hermes (e histórico das versões em `data/`).
- `data/perfil-de-voz.md` = dados do usuário (fora do git).
- O que o Hermes grava sozinho em memória e skills continua limitado pelas travas do Hermes (`memory.write_approval` permite exigir aprovação; ver `docs/hermes-agent/user-guide/features/memory.md`).

## Escrito em 2026-10-20 (aguarda revisão do dono)
- `prompts/relatorios/{comum,diario,semanal}.md` e exemplo sintético em `prompts/relatorios/exemplos/`. Regras de `docs/plano/fase-1-relatorios.md` (D14, D15) aplicadas; estados e contagens vêm calculados do código, o modelo só redige.

## Ainda a escrever
Extração de compromissos e sinais de potencial; catálogo de objeções (contornáveis x irreversíveis, com os exemplos do usuário: doença grave na família, falência da fábrica, total satisfação com o marketing atual); skills iniciais; **passo de calibração** da personalidade (quando roda, o que o usuário vê, como aprova).

## Decisão (antes pergunta em aberto)
O Heimdall pode usar o perfil de voz também para **sugerir rascunhos de resposta** ao usuário nos relatórios (sem nunca enviar)? **Resposta do usuário: sim, pode.** Os rascunhos aparecem só nos relatórios, como sugestão para ele copiar; o Heimdall nunca envia (regra 1).
