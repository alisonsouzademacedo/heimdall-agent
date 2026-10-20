// Laco da ponte: processa o self-chat de tempos em tempos e para quando pedido; erro inesperado nao derruba o laco.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { iniciarPonte, lerChaveDoEnv } from './ciclo.ts';
import type { PortasSelfChat } from './selfchat.ts';

const T = Date.UTC(2025, 9, 10, 15, 0, 0);

test('laco: responde a mensagem nova, espera entre giros e para quando pedido', async () => {
  const db = abrirBanco(); migrar(db);
  criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => T }).mensagens([{ key: { id: 'S1', remoteJid: '5511900000000@s.whatsapp.net', fromMe: true }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(T / 1000) }], 'notify');
  const portas: PortasSelfChat = { hermes: { perguntar: async () => 'ola' }, apagarArquivo: () => {} };
  const esperas: number[] = [];
  const p = iniciarPonte({ banco: db, portas, agora: () => T + 1000, intervaloMs: 7000, esperar: async (ms) => { esperas.push(ms); if (esperas.length >= 2) p.parar(); } });
  await p.terminou;
  assert.deepEqual(esperas, [7000, 7000]);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM saida').get() as { n: number }).n, 1, 'respondeu uma vez so');
});

test('uma excecao inesperada nao derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  db.exec('DROP TABLE saida'); // quebra de proposito: o processamento lanca
  let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
  await p.terminou;
  assert.equal(giros, 3);
});

test('lerChaveDoEnv: pega API_SERVER_KEY do arquivo .env, ignora comentarios e nunca devolve o resto', () => {
  assert.equal(lerChaveDoEnv('# c\nPOSTGRES_PASSWORD=abc\nAPI_SERVER_KEY=chave-123456789\nOUTRA=1\n'), 'chave-123456789');
  assert.equal(lerChaveDoEnv('API_SERVER_KEY="entre-aspas-123"\r\n'), 'entre-aspas-123');
  assert.equal(lerChaveDoEnv('# API_SERVER_KEY=comentada\nX=1'), null);
  assert.equal(lerChaveDoEnv(''), null);
});
