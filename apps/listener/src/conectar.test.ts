// Configuracao do socket (sem abrir conexao nenhuma: so conferimos o objeto que iria para o makeWASocket).
import test from 'node:test';
import assert from 'node:assert/strict';
import { montarConfig } from './conectar.ts';

const auth = { creds: {} as never, keys: { get: async () => ({}), set: async () => {} } as never };
const cfg = montarConfig({ auth, getMessage: async () => undefined });

test('historico completo com identidade de desktop (documentado: so assim o WhatsApp manda o historico estendido)', () => {
  assert.equal(cfg.syncFullHistory, true);
  assert.equal(cfg.browser[0], 'Mac OS');
  assert.equal(cfg.browser[1], 'Desktop');
});

test('o celular continua recebendo notificacoes (markOnlineOnConnect desligado)', () => {
  assert.equal(cfg.markOnlineOnConnect, false);
});

test('transmissoes, status e canais sao ignorados ja na entrada', () => {
  assert.equal(cfg.shouldIgnoreJid!('status@broadcast'), true);
  assert.equal(cfg.shouldIgnoreJid!('1234567890@broadcast'), true);
  assert.equal(cfg.shouldIgnoreJid!('12345@newsletter'), true);
  assert.equal(cfg.shouldIgnoreJid!('5511999990001@s.whatsapp.net'), false);
  assert.equal(cfg.shouldIgnoreJid!('120363000000000001@g.us'), false);
});

test('sem pre-visualizacao de link e sem recursos que enviam algo sozinhos', () => {
  assert.equal(cfg.generateHighQualityLinkPreview, false);
});

test('o registro de log do Baileys fica em silencio (nao imprime conteudo de conversa)', () => {
  assert.equal(cfg.logger.level, 'silent');
});
