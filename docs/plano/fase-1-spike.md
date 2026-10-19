# Spike — testes de viabilidade antes de construir

**O que é:** uma rodada curta de experimentos com **código descartável**, para provar (ou derrubar) as suposições mais arriscadas do plano **antes** de construir o Heimdall de verdade. Não é o produto. Cada experimento responde uma pergunta com um número ou um sim/não, e o resultado ajusta o plano.

**Onde roda:** na máquina que o usuário escolher (local ou VPS), não nesta sessão em nuvem: o WhatsApp exige o usuário para ler o QR, e a sessão em nuvem é efêmera e sem GPU. A decisão local × VPS (D8) é tomada **com os números do spike**.

## E0 — Verificação do ambiente (pronto)
Antes de tudo: `spike/preflight/` detecta sistema, hardware e requisitos. Ver `docs/plano/fase-1-requisitos-e-preflight.md`.

## Estado em 2026-10-19
Feitos na nuvem, com dados sintéticos e testes (código em `apps/core/`): **E9** (motor de regras), **E10** (pacote e texto-base do relatório diário; falta o semanal e o texto escrito pelo modelo), **E13 em parte** (envio travado + testes de arquitetura; falta revisar o código de integração com o Baileys quando existir). Preparado, não executado: varredura do Strix (`fase-1-testes-de-seguranca-strix.md`). **Dependem do notebook e do dono:** E1, E2, E3, E4, E5, E6, E7, E8, E11, E12.

## Suposições a provar
| # | Pergunta | Como testar | Passa se | Se falhar |
|---|---|---|---|---|
| E1 | O Baileys, só leitura, captura tudo (DM, grupos, self-chat, áudio, PDF) sem duplicar e sem enviar nada? | Parear como aparelho vinculado; registrar `messages.upsert` (`notify` e `append`) e `messaging-history.set`; checar LID × número; baixar mídia na chegada | Todos os tipos capturados, ids únicos, nenhum envio para terceiros no código | Reavaliar o cliente (o Hermes fixa Baileys 7.0.0-rc13; v8 muda o login) |
| E2 | Dá para **enviar um `.md` como documento** ao self-chat e reconhecer o self-chat pelo LID? | Enviar documento com `mimetype` e `fileName`; comparar com `creds.me.id` e `creds.me.lid` | Chega íntegro e abre como `.md` | Enviar como texto (formatação do WhatsApp) |
| E3 | A **ponte Q** funciona: self-chat → API Server do Hermes → resposta enviada pelo listener? | Ligar o API Server; encaminhar uma mensagem; devolver a resposta; checar continuidade de conversa e login do Hermes pelo ChatGPT Plus | Ida e volta correta, memória do self-chat mantida | Avaliar o plugin de plataforma (opção P) |
| E4 | O **cron do Hermes** gera o relatório às 08:00 de Santa Maria e grava o `.md`? | Configurar `timezone: America/Sao_Paulo`; tarefa de teste `0 8 * * 2-5` e `0 8 * * 1`; entrega `local` | Arquivo gerado no horário certo | Agendar fora do Hermes e só chamar o agente |
| E5 | O **Hindsight** roda auto-hospedado com o login do ChatGPT (`chatgpt`) e recupera bem? | Docker; reter um dia de conversa sintético e uma transcrição; `recall` e `reflect`; medir a **cota do Plus por documento** | Respostas corretas e consumo × volume previsto cabe no Plus | Modelo local para extração em lote ou outra memória (Mem0) |
| E6 | O **Whisper** (faster-whisper) atende na máquina escolhida? | Teste de capacidade; áudio de 3 min em português; tempo real, RAM, erros em nomes | Cabe com folga; qualidade aceitável | Modelo menor ou GPU |
| E7 | O **markitdown** extrai bem a transcrição do **Meet**? | PDFs reais já extraídos do WhatsApp do dono (sem material fornecido): rótulos de quem fala, horários, tabelas; limites e processo isolado | Falas e participantes preservados | Outra conversão ou texto bruto |
| E8 | O **Krayin** instala, o funil de 5 etapas existe e a API cobre o necessário? | Docker; instalar `krayin/rest-api`; criar pipeline; criar organização, pessoa e lead; **mover etapa**; Ganho; Perdido (com motivo); **medir RAM** parado e em uso | Todas as operações via token; consumo aceitável | Funil próprio |
| E9 | O **motor de regras** acerta (7 tentativas, 2 dias úteis, zera ao responder, aguardando usuário)? | Testes automatizados com dados sintéticos e calendário de dias úteis em `America/Sao_Paulo` | Todos os casos esperados passam | Corrigir antes de ligar ao modelo |
| E10 | O **relatório** cabe em uma página e usa os dados certos? | Dados sintéticos → MCP/stub → relatório diário e semanal | ≤ 1 página, seções na ordem acordada | Ajustar prompt e priorização |
| E11 | **Correlação de transcrição:** compromisso marcado no chat + PDF do Pedro → cliente certo sem perguntar? | Conversa sintética marcando reunião + PDF de exemplo | Liga ao cliente correto | Ajustar extração de compromissos |
| E12 | **Cota do ChatGPT Plus** aguenta o dia? | Somar consumo de E3, E5, E10, E11 e extrações; extrapolar | Cabe no volume real | Modelo local para o lote |
| E13 | **Segurança:** o Heimdall só consegue escrever no self-chat? | Revisar caminhos de envio; tentar enviar a outro JID; filtro de ferramentas do MCP; limites do PDF | Nenhuma via de envio a terceiros | Fechar a via antes de seguir |

## Ordem sugerida
E1 e E2 (WhatsApp) → E9 (regras, sem dependências) → E6 e E7 (áudio e PDF) → E3 e E4 (Hermes) → E5 (Hindsight) → E8 (Krayin) → E10 e E11 (relatório e correlação) → E12 e E13 (fechamento).

## O que o usuário precisa fornecer
- A máquina de teste (local ou VPS) com Docker; especificações.
- Estar presente para **ler o QR** e autorizar o login do ChatGPT.
- **Nenhum material de teste** (decisão de 2026-10-19): o Heimdall baixa os dados do WhatsApp e escolhe, entre os PDFs e áudios reais extraídos, alguns para o teste de conversão e transcrição. Esse teste fica na tela de onboarding. Os resultados do teste ficam só em `data/`.
- O Heimdall nunca fala com terceiros durante o spike: só leitura e self-chat.

## Entregável do spike
Um relatório `docs/plano/spike-resultados.md` com, para cada E: resultado, números (memória, tempo, cota) e decisão. Disso saem: máquina escolhida, arquitetura final e o plano de construção.
