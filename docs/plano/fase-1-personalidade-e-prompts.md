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

## Decisões do usuário sobre os relatórios (2026-10-20)
Formato e ordem aprovados; limite de ~350/450 palavras aprovado, com a condição de **caber em uma tela**; o Heimdall deve **sugerir seções novas** quando um padrão se repetir (exemplo do dono: 7 dias seguidos), sempre com aprovação dele no self-chat.

## Escrito: extração
`prompts/extracao/compromissos-e-sinais.md` (aguarda revisão do dono; saída JSON alinhada às tabelas `compromissos` e `sinais_potencial` de `fase-1-modelo-de-dados.md`).

## Escrito: objeções
`prompts/objecoes/catalogo.md`: 5 contornáveis e **4** irreversíveis (o dono acrescentou "empresário que não quer crescer" às três já citadas). Os ângulos de contorno são hipóteses a validar.

## Escrito: SOUL e calibração
`prompts/SOUL.md` (bloco fixo de limites + estilo mínimo) e `docs/plano/fase-1-calibracao-da-personalidade.md` (quando roda, o que o dono vê, como aprova, como reverte). Aguarda revisão.

## Ainda a escrever
Skills iniciais; **passo de calibração** da personalidade (quando roda, o que o usuário vê, como aprova).

## Decisão (antes pergunta em aberto)
O Heimdall pode usar o perfil de voz também para **sugerir rascunhos de resposta** ao usuário nos relatórios (sem nunca enviar)? **Resposta do usuário: sim, pode.** Os rascunhos aparecem só nos relatórios, como sugestão para ele copiar; o Heimdall nunca envia (regra 1).

## Skills iniciais (escritas em 2026-10-20; aguardam revisão)
Em `prompts/skills/<nome>/SKILL.md`, no formato do Hermes (`docs/hermes-agent/user-guide/features/skills.md`: frontmatter com `name`, `description` curta, `version`, seções "When to Use / Procedure / Pitfalls / Verification"). Seis skills: `relatorio-diario`, `relatorio-semanal`, `extrair-compromissos-e-sinais`, `classificar-objecao`, `calibrar-personalidade`, `conversar-no-self-chat`.
- Nas skills, os textos longos (regras comuns, esqueletos, catálogo, extração, calibração) ficam em `references/`. **O repositório guarda uma cópia só** (em `prompts/relatorios/`, `prompts/extracao/`, `prompts/objecoes/`, `docs/plano/`); o script de instalação copia para `references/` de cada skill no volume do Hermes (`/opt/data/skills/`). Ainda não escrito.
- Os nomes de ferramentas (`dados_do_relatorio`, `cliente`, `registrar_feedback` etc.) vêm do rascunho de `fase-1-mcp.md`; **ainda não existem**.
- Recomendado ligar `skills.write_approval: true` no início: o Hermes pode criar e alterar skills sozinho (`skill_manage`), e com a trava cada mudança fica pendente até o dono aprovar (`/skills pending`, `/skills approve`). Confirmar no spike que o fluxo funciona pelo self-chat.
- O `description` das skills foi mantido abaixo de 60 caracteres (padrão citado para `/learn` na documentação).
