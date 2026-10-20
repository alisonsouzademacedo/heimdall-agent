// Laco da ponte: processa o self-chat de tempos em tempos e para quando pedido; erro inesperado nao derruba o laco.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { iniciarPonte, lerChaveDoEnv, EXTRACOES_POR_GIRO } from './ciclo.ts';
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

test('laco: roda a extracao de compromissos (no maximo EXTRACOES_POR_GIRO por giro) e uma falha do modelo nao derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  const DONO = '5511900000000@s.whatsapp.net';
  const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
  const HOJE = D10 + 30 * 3_600_000;
  const escuta = criarEscuta(db, { pn: DONO }, { agora: () => HOJE });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  for (const [i, jid] of ['5511999990001', '5511999990002', '5511999990003'].entries()) {
    escuta.mensagens([{ key: { id: `M${i}`, remoteJid: `${jid}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
    db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(`${jid}@s.whatsapp.net`);
  }
  const pedidos: string[] = [];
  const extracao = { instrucoes: 'REGRAS', porta: { extrair: async (_p: string, sessao: string) => { pedidos.push(sessao); throw new Error('modelo fora do ar'); } } };
  let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, extracao, agora: () => HOJE, intervaloMs: 1, esperar: async () => { if (++giros >= 1) p.parar(); } });
  await p.terminou;
  assert.equal(pedidos.length, EXTRACOES_POR_GIRO, 'dois por giro, nao a fila inteira');
  assert.ok(pedidos.every((s) => s.startsWith('heimdall:extracao:ext:')));
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair'").get() as { n: number }).n, 3, 'falha nao perde o trabalho: ele volta para tentar depois');
});

test('laco: depois de fazer o backup do dia, apaga os backups invalidos e velhos da pasta de destino (e so eles)', async () => {
  const { mkdtempSync, writeFileSync, readdirSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { definirDestinoDeBackup } = await import('../../core/src/backup-copia.ts');
  const { apagarBackup } = await import('./apagar-backup.ts');
  const pasta = mkdtempSync(join(tmpdir(), 'hd-ciclo-bk-'));
  try {
    const db = abrirBanco(); migrar(db);
    assert.equal(definirDestinoDeBackup(db, pasta).ok, true);
    writeFileSync(join(pasta, 'acervo-2026-10-01.sqlite'), 'lixo, nao e banco');
    writeFileSync(join(pasta, 'meus-documentos.txt'), 'nao e nosso');
    const QUARTA = Date.parse('2026-10-21T15:00:00Z');
    const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, apagarBackup: (d, n) => { apagarBackup(d, n); }, agora: () => QUARTA, intervaloMs: 1, esperar: async () => p.parar() });
    await p.terminou;
    assert.deepEqual(readdirSync(pasta).sort(), ['acervo-2026-10-21.sqlite', 'meus-documentos.txt']);
    db.close();
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});
