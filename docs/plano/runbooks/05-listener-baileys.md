# 5. Escuta com Baileys (núcleo do Heimdall)

Fontes: `docs/baileys/{installation,quickstart,faq}.md`, `concepts/{events,jids,socket-config,data-store}.md`, `authentication/{qr-code,session-management}.md`, `advanced/{history-sync,troubleshooting}.md`, `messaging/media-messages.md`, `migration/{v7,v8}.md`; `docs/hermes-agent/user-guide/messaging/whatsapp.md` (comparação).

## Requisitos
Node.js **20.0.0 ou superior** (a instalação falha em versão anterior). Pacote `@whiskeysockets/baileys`. `@hapi/boom` para ler os códigos de desconexão. Dependências opcionais (miniaturas, pré-visualização de links, `audio-decode`) **não são necessárias** para só escutar.

## Versão
A documentação recomenda a versão **estável**; a borda (`master` do GitHub) "não tem garantia de estabilidade". O bridge do Hermes fixa `7.0.0-rc13`. O Baileys **v8** muda o formato de login e exige migração com ferramenta própria. **Decidir e registrar a versão no spike (E1)** e não atualizar sem backup. Não chamar `fetchLatestWaWebVersion` a cada conexão (a FAQ desaconselha).

## Configuração do socket (justificativa de cada item na documentação)
- `auth`: **estado de login em banco** (SQLite separado do acervo), com `makeCacheableSignalKeyStore`. **Não usar `useMultiFileAuthState` em produção** ("não recomendado... causará erros de autenticação"). A pasta de login contém chaves de longa duração (tratar como chave SSH).
- `browser: Browsers.macOS('DESKTOP')` (maiúsculo; ver Armadilhas) e `syncFullHistory: true` para receber o histórico completo (a FAQ e `history-sync.md`); aumenta tempo de início e memória.
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
- **A libsignal despeja a sessão de criptografia no `console` (chaves incluídas) e isso cai no `data/logs/listener.log`** (2026-10-21). Toda saída do processo do listener passa por `protegerConsole()` (`console-seguro.ts`); não use `console.log` com objetos de sessão/credenciais e confira o log com `grep -c "privKey\|chainKey\|rootKey" data/logs/listener.log` (só contar, nunca mostrar). Depois de reiniciar o listener com a correção, o log antigo precisa ser limpo (apagar o arquivo é decisão do dono).
- **WhatsApp recusa `browser[1] = 'Desktop'` com histórico completo (428 em 0,6 s, QR nunca aparece; provado em 2026-10-20).** O Baileys envia `webSubPlatform = DARWIN/WIN32` nessa combinação. `'DESKTOP'` (maiúsculo) e `'Chrome'` recebem o QR. Correção **pendente de OK do dono**: `docs/plano/pendencias/2026-10-21-whatsapp-428-desktop.md`. Para ver o motivo de um corte, ligar o registro do Baileys **só num teste isolado** (sessão nova, sem mensagens); o listener real fica em silêncio de propósito.
- **Na carga do histórico a ordem dos eventos não é garantida:** a edição/apagada pode chegar antes da mensagem original. A escuta guarda a alteração em `alteracoes_pendentes` e aplica quando a original entra (2026-10-21; teste: `tests/carga/ingestao-historico.test.ts`).
- **A lista de contatos e os nomes de grupos costumam chegar antes das mensagens:** ficam em `nomes_pendentes` e são aplicados quando o contato/grupo aparece (2026-10-21). A lista sozinha **não** cria contato: só entra no acervo quem conversou.
- **Se a carga cair no meio, o WhatsApp pode NÃO reenviar o histórico** (a documentação fala em histórico "na primeira sincronização": `docs/baileys/authentication/qr-code.md`). Os testes provam que reenviar é seguro (nada duplica), mas **não** provam que o WhatsApp reenvia. Não verificado; o recurso sob demanda existe (`fetchMessageHistory`, `docs/baileys/advanced/history-sync.md`) e ainda não é usado.
- Mensagens recebidas com o núcleo desligado e histórico chegam como `append`; guardar ambos e deduplicar por `key.id`.
- O Baileys **não reconecta sozinho** (`troubleshooting.md`).
- Todo processo com banco aberto precisa de `parar()` que **espera** o laço terminar e fecha o banco antes de devolver; no Windows um arquivo SQLite aberto impede apagar a pasta (EBUSY) e os testes só ficam vermelhos lá.
- Risco de restrição da conta por usar cliente não oficial (decisão do usuário: aceito).

## Não verificado
Envio de documento; alcance real do histórico; tratamento do nono dígito de números brasileiros.

## Historico antigo sob demanda (fetchMessageHistory) - 2026-10-21
- **Regra 1 (analise, lida no Baileys instalado 7.0.0-rc14):** `fetchMessageHistory(count, oldestMsgKey, oldestMsgTimestamp)` monta um `historySyncOnDemandRequest` e o envia por `sendPeerDataOperationMessage`, que faz `relayMessage(meJid, ..., { category: 'peer' })` (`lib/Socket/messages-send.js`, linhas 342 a 367): o destino e a **propria conta do dono**; o `chatJid` dentro do pedido so diz QUAL conversa buscar. Nao e mensagem a contato. `oldestMsgTimestampMs` e em **milissegundos**.
- Trava de arquitetura: `apps/listener/src/arquitetura.test.ts` garante que `fetchMessageHistory` so aparece em `apps/listener/src/historico-antigo.ts` (em nenhum outro arquivo de nenhum pacote), que la nao ha `sendMessage`/`relayMessage`, e que `sendMessage` continua so em `transporte.ts`.
- Funcionamento: por conversa (DM e grupo; self-chat nunca) pede a pagina mais antiga que a mais antiga guardada; espera a resposta (chega como `messaging-history.set`, gravada pela escuta, duplicadas ignoradas); duas respostas vazias seguidas = conversa concluida; limite de paginas = esgotada; 3 falhas = esgotada. Estado em `historico_pedidos` (v12): queda no meio continua de onde parou, sem repetir pedido concluido.
- **Padrao FECHADO.** So roda com `historico.antigo.liberado` e WhatsApp `conectado`. Ritmo padrao: 30 s entre pedidos, paginas de 50, espera de resposta de 45 s (minimo aceito 15 s). **O risco de o WhatsApp limitar a conta com muitos pedidos NAO esta verificado:** o valor deve ser decidido pelo dono antes de rodar de verdade.
- **Nao verificado (so o celular responde):** quanto o WhatsApp devolve por conversa; se o aparelho atende pedidos de conversas muito antigas.
