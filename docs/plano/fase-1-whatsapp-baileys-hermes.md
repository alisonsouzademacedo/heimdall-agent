# Fase 1 — WhatsApp: Baileys + Hermes (problemas e ajustes)

Base: `docs/baileys/` (baileys.wiki, 1.778 páginas) e `docs/hermes-agent/`. As afirmações sobre o código do bridge do Hermes vêm de leitura de `scripts/whatsapp-bridge/` no GitHub (resumo automático de `bridge.js` e `package.json`, trecho parcial; `bridge_helpers.js` não foi visto). **Confirmar no spike lendo o código direto.**

## O que o Baileys entrega
- Biblioteca TypeScript que fala o protocolo do WhatsApp Web (aparelho vinculado). Node >= 20. Não oficial.
- Tudo chega por eventos: `messages.upsert` (`notify` = tempo real; `append` = histórico/backfill), `messages.update` (edição, exclusão, votos), `messaging-history.set` (histórico), `connection.update`, `creds.update`.
- Para escutar, basta assinar eventos. Não existe barreira técnica no Baileys para ler todas as conversas.
- `shouldIgnoreJid` descarta eventos **e a decriptação** de broadcasts, newsletters ou contatos escolhidos. Serve para o "o restante é ignorado".
- Mídia: `downloadMediaMessage` (com `reuploadRequest`). O WhatsApp apaga a mídia dos servidores depois de um tempo.
- JIDs: PN (`@s.whatsapp.net`) e LID (`@lid`) coexistem. Nunca comparar com `===` nem `split('@')`; usar `areJidsSameUser`/`jidDecode`.

## O que o bridge do Hermes faz (v7.0.0-rc13 do Baileys, pin exato)
- `useMultiFileAuthState` (arquivos); `syncFullHistory: false`; navegador "Chrome"; `markOnlineOnConnect: false`; `getMessage` devolve placeholder (sem store de mensagens); sem `shouldIgnoreJid`.
- **Modo self-chat:** só aceita mensagens do próprio chat; qualquer mensagem de terceiros é rejeitada (`self_chat_mode_rejects_non_self`).
- **Modo bot:** DMs de quem não está em `WHATSAPP_ALLOWED_USERS` são descartadas, salvo `WHATSAPP_DM_POLICY=pairing`. Grupos seguem `group_policy`. Mensagens suas em outros chats são descartadas, salvo `WHATSAPP_FORWARD_OWNER_MESSAGES`.
- Mídia recebida vai para cache em disco; mensagens sem texto e sem mídia são descartadas; fila de entrada limitada a 100 (descarta a mais antiga).
- Endpoints de envio (`/send`, `/send-media`…) só aceitam localhost, mas **sem restrição de destinatário**.

## Problemas e ajustes
| # | Problema | Ajuste |
|---|---|---|
| 1 | **Self-chat e escuta de terceiros são mutuamente exclusivos** no bridge do Hermes. Não existe configuração que faça os dois | Camada própria de escuta (listener) ao lado do Hermes |
| 2 | **"Nunca responder ninguém" não é garantido pelo Hermes:** o `/send` aceita qualquer destino e o hook em exceção segue para o fluxo normal | Garantia estrutural: o Hermes só tem sessão em modo self-chat; o listener não tem código de envio, ou só um envio travado no próprio JID |
| 3 | Fila de 100 e descarte de mensagens vazias: perda de dados sob rajada | Listener grava em disco **antes** de qualquer processamento; fila durável |
| 4 | Mídia expira nos servidores e o cache do Hermes é efêmero | Baixar áudio e PDF **na chegada** (com `reuploadRequest`) e guardar o arquivo original |
| 5 | Mensagens recebidas com o listener offline e histórico anterior | Tratar `notify` e `append`; deduplicar por `key.id`; `fetchMessageHistory` para lacunas; histórico completo exige `Browsers.macOS('Desktop')` + `syncFullHistory: true`, com custo de memória |
| 6 | `useMultiFileAuthState` é dito "não para produção" pelo próprio Baileys (I/O pesado, erros de auth) | Auth state em SQLite próprio para o listener 24h |
| 7 | Versão: Hermes fixa 7.0.0-rc13 (candidata); Baileys v8 vem com **novo formato de auth** e adoção de whatsmeow | Fixar versão no listener; não atualizar sem backup e sem o helper de migração; acompanhar releases |
| 8 | LID × número: self-chat e remetentes chegam como `@lid` | Identificar o self-chat comparando com `creds.me.id` **e** `creds.me.lid`; guardar tudo por LID e manter a tabela PN↔LID |
| 9 | Dois aparelhos vinculados no mesmo número (listener + bridge do Hermes) dobram a superfície de detecção; limite do WhatsApp é 4 aparelhos | Medir no spike. Alternativa: sessão única, com o listener entregando o self-chat ao Hermes por um adaptador de plataforma (plugin) |
| 10 | Telefone sem notificações com sessão "online" | `markOnlineOnConnect: false` (já é o padrão no Hermes; replicar no listener) |
| 11 | Edições e exclusões de mensagens | Guardar `messages.update`; decidir se mantém o texto original |
| 12 | Risco de restrição de conta (cliente não oficial) e LGPD | Só leitura + envio mínimo ao próprio número; registrar base legal e retenção |

## Arquitetura proposta (a validar)
```
WhatsApp comercial ──(aparelho vinculado)──► Heimdall Listener (Baileys, só leitura)
                                               ├─ SQLite: mensagens, contatos, LID↔PN
                                               ├─ arquivos: áudio, PDF originais
                                               └─ pipeline: STT, PDF→.md, resumo por contato/dia
Hermes (self-chat)  ◄── lê o acervo (arquivos/MCP) ──┘
Hermes ──cron──► relatório .md diário/semanal ──► self-chat
```
Hermes fica só com o self-chat (sem terceiros por construção) e usa o acervo como memória de longo prazo.

## Spike mínimo
1. Listener com Baileys: parear, logar `messages.upsert` (notify e append) de DM e grupo, sem enviar nada.
2. Medir: chegada de áudio/PDF, expiração de mídia, comportamento em reconexão.
3. Hermes em self-chat com cron entregando um .md de teste.
4. Verificar convivência dos dois aparelhos vinculados e a leitura do código do bridge.

## Decisões pendentes
1. Dois aparelhos (listener + Hermes) ou sessão única com adaptador próprio?
2. Quanto histórico importar na partida?
3. Escutar grupos? Quais?
4. Mensagens que você envia entram no contexto?
5. Onde roda 24h (VPS)?
