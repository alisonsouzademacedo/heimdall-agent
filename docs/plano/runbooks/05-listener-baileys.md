# 5. Escuta com Baileys (núcleo do Heimdall)

Fontes: `docs/baileys/{installation,quickstart,faq}.md`, `concepts/{events,jids,socket-config,data-store}.md`, `authentication/{qr-code,session-management}.md`, `advanced/{history-sync,troubleshooting}.md`, `messaging/media-messages.md`, `migration/{v7,v8}.md`; `docs/hermes-agent/user-guide/messaging/whatsapp.md` (comparação).

## Requisitos
Node.js **20.0.0 ou superior** (a instalação falha em versão anterior). Pacote `@whiskeysockets/baileys`. `@hapi/boom` para ler os códigos de desconexão. Dependências opcionais (miniaturas, pré-visualização de links, `audio-decode`) **não são necessárias** para só escutar.

## Versão
A documentação recomenda a versão **estável**; a borda (`master` do GitHub) "não tem garantia de estabilidade". O bridge do Hermes fixa `7.0.0-rc13`. O Baileys **v8** muda o formato de login e exige migração com ferramenta própria. **Decidir e registrar a versão no spike (E1)** e não atualizar sem backup. Não chamar `fetchLatestWaWebVersion` a cada conexão (a FAQ desaconselha).

## Configuração do socket (justificativa de cada item na documentação)
- `auth`: **estado de login em banco** (SQLite separado do acervo), com `makeCacheableSignalKeyStore`. **Não usar `useMultiFileAuthState` em produção** ("não recomendado... causará erros de autenticação"). A pasta de login contém chaves de longa duração (tratar como chave SSH).
- `browser: Browsers.macOS('Desktop')` e `syncFullHistory: true` para receber o histórico completo (a FAQ e `history-sync.md`); aumenta tempo de início e memória.
- `markOnlineOnConnect: false` para o telefone continuar recebendo notificações.
- `shouldIgnoreJid`: descartar listas de transmissão, canais e status (`isJidBroadcast`, `isJidNewsletter`); descarta eventos e a decifragem.
- `getMessage`: devolver a mensagem original a partir do nosso banco (a documentação a chama de passo mais importante para reenvios).
- `cachedGroupMetadata`: relevante só para **enviar** a grupos, o que o Heimdall não faz.

## Eventos que o núcleo trata
`connection.update` (QR no campo `qr`; reconectar, **exceto** `DisconnectReason.loggedOut`, código 401; **após ler o QR o WhatsApp força uma reconexão**, `restartRequired`: é normal), `creds.update` (gravar na hora), `messages.upsert` (`notify` e `append`), `messages.update` (edição, exclusão, votos), `messaging-history.set` (histórico, com `progress` e `isLatest`), `lid-mapping.update`, `contacts.*`, `chats.*`, `groups.*`. Usar `sock.ev.process` para receber lotes por ciclo.

## Identificação
Chegam por **LID**; comparar com `areJidsSameUser` e `jidDecode`, **nunca** com `===` nem `split('@')`. Para o self-chat, comparar com `creds.me.id` **e** `creds.me.lid`. Telefones do cadastro: resolver com `sock.onWhatsApp` (usar o JID que ele devolve) e `signalRepository.lidMapping.getLIDsForPN`.

## Mídia
`downloadMediaMessage(msg, 'stream', {}, { reuploadRequest: sock.updateMediaMessage })`: baixar **na chegada**, em fluxo; o WhatsApp apaga mídia antiga (erros 404/410 viram `expirado`).

## Envio (travado)
O núcleo só tem **uma função de envio**, com destino fixo no JID do próprio dono (R7). **Não copiar o exemplo do `quickstart`**, que responde a toda mensagem recebida. Enviar `.md` como documento: `sendMessage(selfJid, { document: ..., mimetype, fileName })`. **[validar]**: a documentação lista documentos como suportados mas não traz exemplo.

## Verificação
Parear por QR (usuário); ver `connection: open`; receber uma mensagem de teste e vê-la no banco; reiniciar o processo e ver que **não** pede QR de novo; tentar enviar a outro número e ver que o teste de segurança falha como esperado.

## Armadilhas
- **WhatsApp recusa `browser[1] = 'Desktop'` com histórico completo (428 em 0,6 s, QR nunca aparece; provado em 2026-10-20).** O Baileys envia `webSubPlatform = DARWIN/WIN32` nessa combinação. `'DESKTOP'` (maiúsculo) e `'Chrome'` recebem o QR. Correção **pendente de OK do dono**: `docs/plano/pendencias/2026-10-21-whatsapp-428-desktop.md`. Para ver o motivo de um corte, ligar o registro do Baileys **só num teste isolado** (sessão nova, sem mensagens); o listener real fica em silêncio de propósito.
- Mensagens recebidas com o núcleo desligado e histórico chegam como `append`; guardar ambos e deduplicar por `key.id`.
- O Baileys **não reconecta sozinho** (`troubleshooting.md`).
- Todo processo com banco aberto precisa de `parar()` que **espera** o laço terminar e fecha o banco antes de devolver; no Windows um arquivo SQLite aberto impede apagar a pasta (EBUSY) e os testes só ficam vermelhos lá.
- Risco de restrição da conta por usar cliente não oficial (decisão do usuário: aceito).

## Não verificado
Envio de documento; alcance real do histórico; tratamento do nono dígito de números brasileiros.
