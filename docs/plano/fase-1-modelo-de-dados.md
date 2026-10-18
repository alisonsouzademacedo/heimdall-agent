# Fase 1 — Modelo de dados

Status: **proposta para aprovação**. Fontes: `docs/baileys/concepts/jids.md`, `docs/baileys/concepts/events.md`, `docs/hindsight/developer/api/retain.md` e `documents.md`, `docs/hermes-agent/.../memory.md`, e as regras de `fase-1-relatorios.md`.

## Princípios
1. **Bruto primeiro, derivado depois.** Mensagens, mídias e transcrições são a verdade e nunca são reescritas. Estados, contagens, compromissos e dossiês são **derivados** e podem ser recalculados. Assim, mudar a regra (ex.: 7 tentativas para 8) não exige reimportar nada.
2. **Identidade por LID.** O Baileys trata o LID (`@lid`) como identificador canônico e o número (`@s.whatsapp.net`) como alias; nunca comparar JIDs como texto. Uma tabela liga todos os JIDs conhecidos de uma mesma pessoa.
3. **Idempotência.** Reprocessar a mesma mensagem (reconexão, histórico) não duplica: chave única por conversa + id da mensagem do WhatsApp.
4. **Tempo em UTC**, exibido em `America/Sao_Paulo`; dias úteis calculados por tabela de calendário (feriados editáveis).
5. **Regras em código**, parâmetros em arquivo versionado (intervalo = 2 dias úteis, máximo = 7 tentativas).
6. **Dados de clientes nunca no git** (`data/`).

## Onde cada coisa mora
| Lugar | Conteúdo | É a verdade? |
|---|---|---|
| `data/acervo.sqlite` | tabelas abaixo | **Sim** (bruto) |
| `data/midias/` | áudios e PDFs originais, nome por hash | **Sim** |
| `data/md/` | PDF convertido em `.md` | derivado (refazível) |
| `data/dossies/` | um `.md` por cliente (camada 2, legível, abre no Obsidian) | derivado |
| `data/relatorios/` | `AAAA-MM-DD-diario.md`, `AAAA-Www-semanal.md` | saída |
| Hindsight (PostgreSQL) | memória semântica e grafo | derivado |
| Hermes (`MEMORY.md`, `USER.md`, skills, `state.db`) | seu jeito de vender, correções, conversa do self-chat | próprio |
| Baileys auth (banco separado) | credenciais da sessão do WhatsApp | segredo |

## Tabelas do acervo (rascunho)
**Pessoas e clientes**
- `contatos`: id, nome, **papel** (`cliente`, `interno`, `fornecedor`, `pessoal`, `desconhecido`), `papel_fonte` (`cadastro`, `inferido`, `confirmado`), `cliente_id`
- `contato_jids`: jid, contato_id, tipo (`lid`/`pn`) — aliases
- `clientes`: id, nome (empresa ou negócio), notas. Um cliente pode ter vários contatos; um contato "pessoa sem empresa" cria um cliente com o mesmo nome.

**Conversas e mensagens (bruto)**
- `conversas`: id, jid, tipo (`dm`, `grupo`, `self`), nome
- `mensagens`: id, conversa_id, **wa_msg_id**, remetente_contato_id, **de_mim**, enviada_em, tipo (`texto`, `audio`, `pdf`, `ignorada`), texto, citada_wa_msg_id, estado (`ativa`, `editada`, `apagada`), texto_original, origem_evento (`notify`, `append`, `historico`). Único: (conversa_id, wa_msg_id).
- `midias`: id, mensagem_id, tipo (`audio`/`pdf`), caminho, sha256, bytes, mimetype, duracao_s, download (`ok`, `expirado`, `falhou`). Único: sha256 (deduplica PDF reenviado).
- `transcricoes` (áudio): midia_id, modelo, idioma, texto, avisos, criada_em
- `documentos` (PDF): midia_id, caminho_md, paginas, estado (`ok`, `sem_texto`, `erro`), data_reuniao (se achada), correlacionado_cliente_id, confianca, motivo

**Derivados do negócio**
- `compromissos`: id, cliente_id, tipo (`reuniao`, `retorno`, `proposta`, `outro`), titulo, data_hora (pode ser vazio), criado_por_contato_id, origem_mensagem_id, estado (`marcado`, `realizado`, `transcricao_recebida`, `cumprido`, `cancelado`), documento_id, confianca, motivo
- `sinais_potencial`: cliente_id, mensagem_id, tipo (`pediu_proposta`, `perguntou_preco`, `marcou_reuniao`, `trouxe_decisor`), em
- `acompanhamento` (cache, recalculável): cliente_id, estado, ultima_resposta_cliente_em, ultima_msg_usuario_em, **tentativas_desde_ultima_resposta**, proximo_followup_em, aguardando_usuario_desde, calculado_em
- `dossies`: cliente_id, caminho, versao, atualizado_em
- `relatorios`: id, tipo, periodo_inicio, periodo_fim, gerado_em, caminho, enviado_em
- `feedback`: id, texto, referencia_tipo, referencia_id, mensagem_self_id, aplicado_em — correções do usuário no self-chat

**Operação**
- `fila`: id, tipo (`transcrever`, `converter_pdf`, `extrair`, `retain`), referencia, estado, tentativas, proximo_em — **fila durável**; a escuta nunca espera o processamento
- `sync_hindsight`: tipo, referencia, document_id, hash_conteudo, sincronizado_em — controla o que já foi para o Hindsight
- `calendario`: data, util (bool), motivo — feriados, editável

## Regras de acompanhamento como consulta (derivadas das mensagens)
- **Cliente que respondeu:** existe mensagem de contato `cliente` em conversa `dm` (ou associável).
- **Tentativa:** mensagem do usuário após a última resposta do cliente, respeitado o intervalo; várias mensagens no mesmo intervalo contam uma.
- **Follow-up devido:** `ultima_msg_usuario_em` + 2 dias úteis ≤ agora, cliente respondeu alguma vez, tentativas < 7, sem resposta depois.
- **Desconsiderado:** tentativas ≥ 7 sem resposta; volta a `ativo` ao chegar nova mensagem do cliente (contagem zera).
- **Aguardando usuário:** última mensagem é do cliente e **precisa** de resposta (classificação do modelo; na dúvida, inclui).
- **Interno:** `papel = interno` (ex.: Pedro) fica fora das regras comerciais.

## Como entra no Hindsight (fato da documentação)
O Hindsight indica reter uma **conversa inteira como um item**, em texto "Nome (hora): fala", com `timestamp` (âncora para entender "segunda passada") e `document_id`. **Reter de novo o mesmo `document_id` apaga a versão anterior e reprocessa tudo** — caro em cota se feito a cada mensagem. Proposta:
- **Um documento por cliente por dia**: `conv:<cliente_id>:<AAAA-MM-DD>`, enviado **no fechamento do dia**, com `timestamp` do dia. Dia fechado não é reprocessado.
- **Uma transcrição = um documento**: `reuniao:<documento_id>`, `timestamp` da reunião (ou do PDF).
- `tags`: `cliente:<id>`, `tipo:conversa|reuniao|audio`, `papel:cliente|interno`.
- Compromissos e correções entram como itens curtos com `context` próprio.
Consequência: a "memória inteira" é montada de dias fechados + reuniões; o dia corrente é consultado direto no acervo (o MCP do Heimdall).

## Fluxo
mensagem chega → `mensagens` (+ `midias`) → `fila` → transcrever/converter → extração (compromissos, sinais, papel, correlação) → recalcula `acompanhamento` → atualiza `dossies` → no fechamento do dia, `retain` no Hindsight.

## Decisões pendentes (usuário)
1. **Mensagens apagadas ou editadas pelo remetente:** manter o texto original (marcado como apagado) ou descartar? (proposta: manter, marcado)
2. **Grupos:** como tratar cobrança de resposta em grupo — só quando mencionarem o usuário, ou nunca? E há grupos de clientes ou só internos?
3. **Retenção (LGPD):** por quanto tempo guardar áudio e PDF originais, e se o usuário quer um comando para apagar tudo de um cliente.
4. **Cliente = empresa** com vários contatos (proposta) ou cada pessoa é um cliente?
