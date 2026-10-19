# Carga inicial: como lidar com muitos dados na primeira vez

Decisão do usuário (2026-10-19): a sincronização e a extração do histórico completo do WhatsApp são **obrigatórias** no início (criar contexto, memória e autoaprendizado). Como a primeira carga é grande, é preciso estratégia para não dar erro.

Fontes: `docs/baileys/` (history-sync, events, troubleshooting, media-messages, socket-config), `docs/hindsight/developer/configuration.md` e `retain.md`, `docs/faster-whisper/`, `docs/plano/fase-1-modelo-de-dados.md`. Itens marcados **[validar]** dependem de teste no spike.

## Ideias que realmente ajudam
**1. Separar em etapas, cada uma com fila durável e ponto de retomada.**
`recebimento bruto → mídia → transcrição/PDF → extração → memória`. Só a primeira precisa acompanhar o telefone; as demais rodam no ritmo da máquina. Fila em tabela no próprio SQLite (já no modelo de dados), sem serviço extra. Qualquer queda retoma de onde parou, sem duplicar (chaves únicas).

**2. "Orçamento" antes de começar.**
Depois do recebimento bruto, a tela conta mensagens, minutos de áudio e páginas de PDF e mostra: *tempo estimado* e *uso estimado da cota do plano*. O usuário confirma e só então começa o processamento pesado. Evita surpresa de cota e de horas.

**3. Processar do mais novo para o mais antigo.**
Os últimos 30 a 60 dias (e os clientes ativos e com compromisso) primeiro. O Heimdall já fica útil (relatórios, follow-ups) enquanto o histórico antigo continua em segundo plano até o fim. O usuário não perde nada: tudo é processado, só em ordem de importância.

**4. Duas profundidades de memória [validar].**
O Hindsight permite rodar **sem LLM** (`HINDSIGHT_API_LLM_PROVIDER=none`): ele guarda os textos em blocos e a busca (semântica, palavra-chave e grafo) funciona, sem gastar cota; só deixa de extrair fatos e de gerar análises. Proposta: histórico antigo entra em **blocos**, e a **extração completa** vale para o período recente e para clientes ativos; um cliente antigo que reaparece é **promovido** (reprocessar o documento, que a documentação diz substituir a versão anterior). A documentação fala em configuração de LLM por banco: avaliar dois bancos (histórico e ativo) e o custo de consultar os dois. Cota economizada: a maior parte.

**5. Controlar o ritmo, não deixar no padrão.**
O padrão do Hindsight permite **32 chamadas simultâneas** ao modelo (`HINDSIGHT_API_LLM_MAX_CONCURRENT`); com um plano de assinatura convém algo como **2 a 4**, e há limite próprio para a extração (`HINDSIGHT_API_RETAIN_LLM_MAX_CONCURRENT`). Ele já tenta de novo com espera crescente (3 tentativas, de 1 s até 60 s). Do nosso lado: **teto diário de uso** (parar ao atingir uma fração da cota e retomar no dia seguinte) e **janela noturna** para o lote pesado. Foi exatamente o erro 429 que encontramos ao baixar documentação em ritmo alto.

**5b. A cota é uma janela de 5 horas, compartilhada.**
Segundo a documentação do Hindsight, no ChatGPT Plus o limite de **cinco horas é compartilhado com todos os apps que usam o plano, incluindo o Codex** (e, portanto, com o Hermes e com a IA instaladora). Quando o limite é atingido, o Hindsight **adia a extração e tenta de novo 30 minutos depois**, sem falhar. Planejar o lote pesado para horários em que o usuário não esteja usando o plano e reservar parte da janela para o Hermes responder no self-chat.

**5c. Controles do próprio ChatGPT (verificado em `docs/openai-codex/siwc/`).**
Em ChatGPT → Configurações → Uso, o usuário pode **limitar o uso semanal de cada app entre 10% e 100%**: reservar uma fatia para o Heimdall e deixar o resto para o Codex que instala e para o Hermes. O erro 429 `subscription_sharing_usage_limit_exceeded` significa **pausar**, não falhar (o limite pode ser do app e não do plano inteiro). No **Pro** o limite de 5 horas não se aplica. A transcrição de áudio **não** pode usar esse fluxo (a API de transcrição e a entrada de áudio não são suportadas): continua local.

**6. Cadeia de contingência de modelos [validar].**
O Hindsight aceita uma cadeia de modelos com troca automática quando um falha, e roteamento por metadados. Exemplo: primeiro o login do ChatGPT; se a cota acabar ou der erro, segue para um modelo local. Opcional e depende de hardware.

**7. Reduzir o volume antes de chegar ao modelo.**
- Agrupar por **cliente e dia** (um documento por cliente-dia, como no modelo de dados) em vez de uma chamada por mensagem.
- Descartar ruído por regra (figurinhas, reações, "ok") sem usar modelo.
- Deduplicar por hash (PDF reenviado).
- Ignorar listas de transmissão, canais e status com `shouldIgnoreJid` do Baileys, que também evita decifrar essas mensagens.

**8. Memória sob controle na entrada.**
O histórico chega em blocos (`messaging-history.set`, do mais novo para o mais antigo, com `progress`). Gravar cada bloco no banco e liberar a memória; baixar mídia em **fluxo** (`downloadMediaMessage` aceita `stream`), nunca guardar tudo na RAM. A documentação do Baileys avisa que históricos grandes aumentam o tempo de início e a memória.

**9. Mídia expirada não é erro.**
O WhatsApp apaga mídia antiga dos servidores (a baixa dá erro 404 ou 410). O Baileys tenta pedir reenvio (`updateMediaMessage`). Se falhar, registrar como `expirado`, mostrar a contagem na tela e seguir. Muitos áudios e PDFs antigos provavelmente já terão expirado **[validar a proporção]**.

**10. Quarentena em vez de travar.**
Um item que falha várias vezes (PDF corrompido, áudio ilegível) vai para uma tabela de quarentena; o resto continua. A tela lista as quarentenas e permite tentar de novo.

**11. Isolar o trabalho pesado.**
A transcrição (Whisper) roda em **processo separado**, um áudio por vez na CPU, com o modelo carregado uma única vez, para nunca atrasar a escuta ao vivo.

**12. Ensaio antes da carga completa.**
Passo opcional "teste rápido": processar só os **últimos 7 dias** de ponta a ponta e conferir o resultado antes de liberar a carga inteira.

**13. Conferência final por perguntas conhecidas.**
Ao terminar, fazer perguntas de verificação ("o que combinei com o cliente X?", "quais reuniões ocorreram em setembro?") e comparar com a realidade antes de ligar os relatórios automáticos.

**14. Visibilidade.**
Barra por etapa, tempo restante por média móvel, contadores por tipo (mensagens, áudios, PDFs), erros, quarentenas e **uso da cota**. Botão de pausar e retomar.

## Limites e incertezas
- O Baileys só recebe **o que o telefone entregar**; o alcance real do histórico precisa ser medido (E1 do spike).
- Quanta cota cada documento consome é o número mais incerto (E5 e E12 do spike).
- A promoção de "blocos" para "extração completa" depende de comportamento do Hindsight que ainda não foi testado.

## Efeito no onboarding visual
O passo 3 (extração) e o passo 5 (processamento) passam a incluir: tela de **orçamento** com confirmação, **processamento por prioridade** (recente primeiro), teto diário de cota, quarentena visível e **teste rápido** de 7 dias.
