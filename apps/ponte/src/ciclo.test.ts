// Laco da ponte: processa o self-chat de tempos em tempos e para quando pedido; erro inesperado nao derruba o laco.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { iniciarPonte, lerChaveDoEnv } from './ciclo.ts';
import type { PortasAgenda } from './agenda.ts';
import { lerServicos } from '../../core/src/whatsapp/estado.ts';
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

test('laco: gera o relatorio do dia (uma vez) alem de responder o self-chat', async () => {
  const db = abrirBanco(); migrar(db);
  const agenda: PortasAgenda = { redator: null, instrucoes: { comum: '', diario: '', semanal: '' } };
  const QUARTA_8H = Date.parse('2026-10-21T11:00:00Z');
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, agenda, agora: () => QUARTA_8H, intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
  let giros = 0;
  await p.terminou;
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM saida WHERE tipo = 'relatorio'").get() as { n: number }).n, 1, 'tres giros, um relatorio so');
});

test('laco: anota na tabela de configuracao se o Hermes responde (a tela mostra); falha ao checar vira "sem resposta", nunca derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  const respostas = [true, false];
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, saudeHermes: async () => { const r = respostas.shift(); if (r === undefined) throw new Error('caiu'); return r; }, agora: () => 5000, intervaloMs: 1, esperar: async () => { if (!respostas.length) p.parar(); } });
  await p.terminou;
  assert.deepEqual(lerServicos(db), { hermes: { ok: false, em: 5000 } });
});

test('laco: faz o backup do dia no destino escolhido (uma vez por dia) sem atrapalhar o resto', async () => {
  const { mkdtempSync, readdirSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { definirDestinoDeBackup } = await import('../../core/src/backup-copia.ts');
  const db = abrirBanco(); migrar(db);
  const pasta = mkdtempSync(join(tmpdir(), 'heimdall-ponte-bk-'));
  try {
    assert.equal(definirDestinoDeBackup(db, pasta).ok, true);
    let giros = 0;
    const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, agora: () => Date.parse('2026-10-21T11:00:00Z'), intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
    await p.terminou;
    assert.deepEqual(readdirSync(pasta), ['acervo-2026-10-21.sqlite'], 'tres giros, um backup so');
  } finally { rmSync(pasta, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});
