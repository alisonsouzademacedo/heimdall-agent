# Pendência: o WhatsApp corta a conexão (428) com `browser[1] = 'Desktop'` + histórico completo

**Estado:** causa **achada e provada**; correção **aguarda o OK do dono** (regra 5 do `AGENTS.md`: o teste antigo `conectar.test.ts` exige o valor errado). Nada de código foi alterado por causa disto.

## Sintoma
Na tela de configuração, passo "Conectar o WhatsApp": "Reconectando…" e nenhum QR. No acervo: `whatsapp.estado = {"estado":"reconectar","codigo":428}` repetindo. O listener estava vivo e reconectando sozinho.

## Evidência (2026-10-20, Windows do dono, Node 24.20, Baileys `7.0.0-rc14`; sessões novas e isoladas, sem tocar na conta do dono)
- Rede ok: `https://web.whatsapp.com` responde 200, certificado válido (DigiCert), sem proxy; o WebSocket cru abre.
- O aperto de mão com o servidor **completa** (registro detalhado: `connected to WA`, `serverHello`, `Noise handler transitioned to Transport state`) e o servidor **fecha em ~0,6 s** com "Connection Terminated" (código 428) quando recebe o registro do cliente.
- A versão do WhatsApp Web **não** é a causa: com `fetchLatestWaWebVersion()` (`[2,3000,1051082804]`, `isLatest: true`) o resultado foi igual.
- Comparação repetida (cada linha em sessão nova):

| `browser` | `syncFullHistory` | Resultado |
|---|---|---|
| `['Mac OS','Desktop',…]` (o que o código usa) | `true` | **fechou 428** (2 de 2) |
| `['Mac OS','Desktop',…]` | `false` | QR |
| `['Mac OS','DESKTOP',…]` (maiúsculo) | `true` | **QR** (2 de 2) |
| `['Mac OS','DESKTOP',…]` | `false` | QR |
| `Browsers.macOS('Chrome')`, `ubuntu('Chrome')`, `windows('Chrome')` | `true` (padrão do Baileys) | QR |
| `windows('Desktop')` | `true` | fechou 428 |

- Todas as 20 plataformas de `proto.DeviceProps.PlatformType` (exceto as de celular) foram **aceitas** com `['Mac OS', nome, …]` e histórico completo.

## Causa
`validate-connection.js` do Baileys: se `syncFullHistory` **e** `browser[0]` é `Mac OS`/`Windows` **e** `browser[1] === 'Desktop'` (comparação exata), envia `webInfo.webSubPlatform = DARWIN`/`WIN32`. É esse campo que o servidor passa a recusar. O pedido de histórico completo (`requireFullSync`) depende só de `syncFullHistory`; a plataforma (`platformType`) vem de `browser[1].toUpperCase()`, então `'DESKTOP'` mantém `platformType = DESKTOP` e **não** envia o `webSubPlatform` de desktop nativo.

## Correção proposta (não aplicada)
1. `apps/listener/src/conectar.ts`: `browser: Browsers.macOS('Desktop')` → `Browsers.macOS('DESKTOP')`, com comentário apontando para este arquivo e para o `LICOES.md`.
2. **Precisa do OK do dono:** `apps/listener/src/conectar.test.ts` hoje afirma `assert.equal(cfg.browser[1], 'Desktop')`; passaria a `'DESKTOP'` (a intenção do teste, "histórico completo com identidade de desktop", continua; só o valor muda porque o WhatsApp recusa o antigo).
3. Acrescentar o teste abaixo (falha hoje: vê `webSubPlatform = 3`, esperado `0`). Fica **fora** de `apps/` até a aprovação, para o CI não ficar vermelho.
4. Reiniciar o listener (`instalar\heimdall.ps1 -Acao iniciar`), abrir a tela e escanear o QR.
5. Registrar o resultado real: **quanto histórico o WhatsApp entrega** com `'DESKTOP'`. **Não verificado**: a documentação do Baileys (`docs/baileys/advanced/history-sync.md`) diz que o perfil Chrome limita o histórico e que o preset desktop traz o completo; só um pareamento de verdade mostra o que acontece com `'DESKTOP'`.

**Alternativa conservadora:** `Browsers.macOS('Chrome')` (aceito, mas a documentação diz que o histórico inicial é menor).

## Teste novo (para colar em `apps/listener/src/conectar.test.ts`, com a linha de `import` no topo)
```ts
import { generateRegistrationNode, DEFAULT_CONNECTION_CONFIG, proto } from '@whiskeysockets/baileys';

test('o registro enviado ao WhatsApp nao leva webSubPlatform de desktop nativo (o servidor corta com 428) e mantem historico completo e plataforma DESKTOP', () => {
  const config = { ...DEFAULT_CONNECTION_CONFIG, ...cfg };
  const chave = { public: new Uint8Array(32), private: new Uint8Array(32) };
  const reg = { registrationId: 1, signedPreKey: { keyId: 1, keyPair: chave, signature: new Uint8Array(64) }, signedIdentityKey: chave };
  const carga = generateRegistrationNode(reg as never, config as never);
  assert.equal(carga.webInfo?.webSubPlatform, proto.ClientPayload.WebInfo.WebSubPlatform.WEB_BROWSER);
  const props = proto.DeviceProps.decode(carga.devicePairingData!.deviceProps!);
  assert.equal(props.requireFullSync, true, 'o pedido de historico completo continua');
  assert.equal(props.platformType, proto.DeviceProps.PlatformType.DESKTOP, 'a plataforma continua DESKTOP');
});
```
(`cfg` é a constante que o arquivo já define: `montarConfig({ auth, getMessage: async () => undefined })`.)

## Por que os testes antigos não pegaram
O socket real nunca foi testado contra o WhatsApp (`conectar.ts` diz isso no cabeçalho): os testes só conferiam o objeto de configuração, e o valor `'Desktop'` veio da documentação. É a primeira conexão real.

## Segurança durante a investigação
Os testes de conexão usaram pastas de credenciais temporárias (apagadas); o registro do Baileys em nível detalhado foi ligado só nesses testes isolados, sem mensagens, e filtrado; nenhum QR, token ou conteúdo de conversa foi impresso ou gravado. O listener real foi parado para não insistir no servidor.
