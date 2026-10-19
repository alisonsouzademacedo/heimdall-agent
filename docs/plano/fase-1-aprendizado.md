# Fase 1 — Como o Heimdall aprende com as suas correções

Status: **proposta para aprovação** (item 3 do planejamento). Fontes lidas por inteiro: `docs/hermes-agent/user-guide/features/memory.md`, `.../skills.md`, `docs/hindsight/developer/{mental-models,reflect}.md`; e os planos `fase-1-memoria-hermes.md`, `fase-1-modelo-de-dados.md`, `fase-1-mcp.md`, `fase-1-relatorios.md`, `fase-1-calibracao-da-personalidade.md`.

## Ideia central
Toda correção sua é guardada **como você disse** e depois vira, no máximo, uma de **seis coisas** com destinos diferentes. Nada que o modelo "achou" muda regra sem a sua aprovação, e tudo pode ser desfeito.

## Tipos de correção e para onde vão
| # | Você diz (exemplos) | O que acontece | Onde fica | Aprovação |
|---|---|---|---|---|
| 1 | "O prazo era 45 dias, não 30" (fato errado) | Corrige o registro derivado (compromisso, sinal). A mensagem original **nunca** é alterada. Entra no Hindsight como correção | acervo + Hindsight | Não precisa (você disse o fato) |
| 2 | "A3 já resolvi" · "esse cliente não é prioridade" · "para de cobrar a Alfa até dia 30" | Ajuste **só desse cliente ou item**, aplicado por **código**: prioridade, silêncio até uma data, marcar resolvido | tabela de ajustes por cliente | Não precisa |
| 3 | "Isso não é potencial" · "esse aqui era potencial e você não viu" | Registra o caso. Quando houver **3 casos parecidos em 30 dias** (número inicial, ajustável), o Heimdall **propõe** mudar o critério | `criterios` (arquivo versionado) | **Sim** |
| 4 | "Fala menos formal" · "não gosto de rascunho tão longo" | Vira insumo da calibração de voz | `perfil-de-voz` e bloco adaptativo do `SOUL.md` | **Sim** (fluxo de `fase-1-calibracao-da-personalidade.md`) |
| 5 | "Sempre que o cliente pedir orçamento por áudio, me avisa primeiro" (procedimento) | Proposta de skill nova ou ajuste de skill | `/opt/data/skills/` | **Sim** (`skills.write_approval`) |
| 6 | "Essa resposta funcionou" · objeção respondida do seu jeito | Candidato a contorno no catálogo de objeções | `prompts/objecoes/` (versão viva em `data/`) | **Sim** |

Fatos que valem sempre e cabem em poucas linhas ("não ligar antes das 9h") podem ir para `USER.md`/`MEMORY.md` do Hermes (limites 1.375 e 2.200 caracteres; `docs/hermes-agent/user-guide/features/memory.md`), **com `memory.write_approval: true`**.

## Regras que o código garante (testáveis)
1. **Bruto intocável:** correção nunca altera mensagem, áudio, transcrição ou PDF originais.
2. **Regras que você decidiu não mudam sozinhas:** 7 tentativas, intervalo de 2 dias úteis, "aguardando você no topo". Só mudam por **ordem explícita sua** ("agora são 8 tentativas"); o Heimdall pode *sugerir*, nunca aplicar.
3. **Só você ensina:** correção vale se vier do **seu** self-chat. Texto de cliente, PDF ou transcrição **nunca** vira regra (proteção contra instruções escondidas em mensagens).
4. **Versões e desfazer:** cada mudança de critério gera uma versão (`data/criterios/AAAA-MM-DD-vN`). "Desfaz a última" volta uma versão.
5. **Recusou, não insiste:** proposta recusada fica registrada e não é repetida com a mesma evidência.
6. **Antes de aplicar um critério novo**, o código roda os testes de regras com dados sintéticos; se algum falhar, a proposta nem chega a você.

## Como você corrige sem esforço
- Cada item do relatório tem um **código curto** (`A1`, `F2`, `P1`: aguardando, follow-up, potencial). Você responde no self-chat: `A1 já respondi`, `P2 não é potencial: só pediu catálogo`, `F1 pausa até 30/10`.
- Texto livre também funciona; o Heimdall pergunta se não entender (uma pergunta curta).
- Cada correção recebe confirmação em **uma linha** ("Registrado: Alfa fora de 'aguardando' até nova mensagem").
- Os códigos ocupam pouco espaço e preservam a regra de caber em uma tela.

## Aprender sem você precisar dizer nada (resultado das recomendações)
Cada recomendação do relatório é gravada (`recomendacoes`: relatório, item, cliente, tipo) e, nos dias seguintes, o código marca o **resultado**: o cliente respondeu em quantos dias? avançou? Isso mostra quais abordagens e quais contornos de objeção funcionam e alimenta os tipos 3 e 6. O semanal mostra só números ("follow-ups com resposta em até 3 dias: X de Y").

## Papel de cada peça
- **Código/acervo:** executa ajustes e critérios (determinístico, igual toda vez).
- **Hindsight:** guarda correções como memória (`feedback:<id>`, tags `tipo:feedback`, `cliente:<id>`) e mantém **mental models** (páginas-resumo que se reescrevem sozinhas quando chega conhecimento novo; `docs/hindsight/developer/mental-models.md`), por exemplo "Como o dono avalia potencial" e "Preferências do dono". Um mental model **não substitui** os critérios em código; é contexto para o modelo redigir melhor.
- **Hermes:** memória curta sempre ligada (`USER.md`/`MEMORY.md`), skills (procedimentos) e a revisão em segundo plano, que grava memória e skills depois de turnos.
- **Importante:** o Hermes só aprende com o que passa por ele como conversa (`fase-1-memoria-hermes.md`). Por isso o self-chat é o canal de aprendizado, e as correções também vão ao Hindsight pelo nosso pipeline.

## Ajustes de dados propostos
Na tabela `feedback` de `fase-1-modelo-de-dados.md` acrescentar: `tipo` (1 a 6 acima), `estado` (`registrado`, `aplicado`, `proposto`, `aprovado`, `recusado`, `desfeito`), `item_codigo` (A1, F2...). Tabelas novas: `ajustes_cliente` (cliente, tipo, valor, até quando), `criterios_versoes` (versão, conteúdo, aprovado_em), `recomendacoes` (relatório, item_codigo, cliente, tipo, resultado, medido_em).

## Pontos que só o spike confirma (não verificado)
- Se o Hermes mantém **uma sessão contínua** no self-chat via API Server. A documentação diz que o aprendizado de memória acontece nas **fronteiras de sessão** (`/new`) e que chats de mensageria podem virar uma sessão de semanas; precisamos de uma rotina para iniciar sessão nova (por exemplo, depois do relatório da manhã).
- Se os comandos `/memory pending|approve` e `/skills pending|approve` funcionam pelo caminho da nossa ponte (API Server). Se não, a aprovação é feita pelo nosso próprio fluxo no listener (`aprovar` / `recusar`).
- Qual limite de "casos parecidos" evita aprender de menos ou demais (3 em 30 dias é palpite).
- Custo em cota: revisão em segundo plano gasta tokens (`auxiliary.background_review`; dá para desligar ou usar modelo mais barato).

## Testes de regressão previstos (quando houver código)
Correção não altera o bruto · ajuste por cliente expira na data · regra decidida pelo dono não muda sem ordem explícita · texto de cliente nunca cria critério · proposta só nasce com o mínimo de casos · "desfaz" restaura a versão anterior · proposta recusada não se repete.
