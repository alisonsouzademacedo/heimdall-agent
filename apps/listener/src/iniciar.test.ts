// O processo do listener inteiro, com uma conexao FALSA no lugar do Baileys: estado, QR, historico e mensagens vao parar no SQLite.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { iniciarListener } from './iniciar.ts';
import { abrirBanco } from '../../core/src/db.ts';
import { lerEstado, lerQr } from '../../core/src/whatsapp/estado.ts';
import type { EventosMinimos, SocketMinimo } from './ligar.ts';

function conexaoFalsa() {
  const enviados: unknown[] = [];
  let h: ((e: Partial<EventosMinimos>) => void | Promise<void>) | null = null;
  const sock = {
    user: { id: '5511900000000:7@s.whatsapp.net', lid: '999888777666555@lid' },
    ev: { process(f: typeof h) { h = f; } },
    sendMessage: async (jid: string, c: unknown) => { enviados.push({ jid, c }); return { key: { id: 'E1' }, message: { conversation: 'x' } }; },
    end() {}
  } as unknown as SocketMinimo & { sendMessage: (j: string, c: unknown) => Promise<unknown>; end(): void };
  return { sock, emitir: async (e: Partial<EventosMinimos>) => { await h!(e); }, enviados };
}

test('liga tudo: QR e estado na tabela de configuracao, mensagens no acervo, envio so ao dono', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-listener-'));
  try {
    const f = conexaoFalsa();
    const l = await iniciarListener({ pastaDados: dir, abrir: async () => ({ sock: f.sock as never, salvarCreds: async () => {} }), esperar: async () => {} });
    await f.emitir({ 'connection.update': { qr: 'QR-TESTE' } });
    const ver = abrirBanco(join(dir, 'acervo.sqlite'));
    assert.equal(lerQr(ver)?.qr, 'QR-TESTE');
    await f.emitir({ 'connection.update': { connection: 'open' } });
    assert.equal(lerEstado(ver).estado, 'conectado');
    assert.equal(lerEstado(ver).dono, '…0000');
    assert.equal(lerQr(ver), null);
    await f.emitir({ 'messages.upsert': { type: 'notify', messages: [{ key: { id: 'M1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: 1_760_000_000 }] } });
    assert.equal((ver.prepare('SELECT COUNT(*) AS n FROM mensagens').get() as { n: number }).n, 1);
    assert.equal(lerEstado(ver).contagem?.inseridas, 1);
    await l.envio()!.texto('ola, dono');
    assert.deepEqual(f.enviados, [{ jid: '5511900000000@s.whatsapp.net', c: { text: 'ola, dono' } }]);
    ver.close();
    await l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('antes de conectar nao existe envio (envio() e nulo); apos deslogar, volta a ser nulo e o supervisor nao reconecta', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-listener-'));
  try {
    const f = conexaoFalsa(); let aberturas = 0;
    const l = await iniciarListener({ pastaDados: dir, abrir: async () => { aberturas++; return { sock: f.sock as never, salvarCreds: async () => {} }; }, esperar: async () => {} });
    assert.equal(l.envio(), null);
    await f.emitir({ 'connection.update': { connection: 'open' } });
    assert.notEqual(l.envio(), null);
    await f.emitir({ 'connection.update': { connection: 'close', lastDisconnect: { error: { output: { statusCode: 401 } } } } });
    assert.equal(l.envio(), null);
    await new Promise((r) => setImmediate(r));
    assert.equal(aberturas, 1);
    const ver = abrirBanco(join(dir, 'acervo.sqlite'));
    assert.equal(lerEstado(ver).estado, 'deslogado');
    ver.close(); await l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('audio recebido: a escuta enfileira, o laco baixa quando ha conexao, grava pelo hash e enfileira a transcricao', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-listener-'));
  try {
    const f = conexaoFalsa();
    const l = await iniciarListener({
      pastaDados: dir,
      abrir: async () => ({ sock: f.sock as never, salvarCreds: async () => {} }),
      baixador: () => async () => new TextEncoder().encode('audio-sintetico'),
      intervaloBaixarMs: 5,
      serializar: (m) => JSON.stringify({ id: m.key.id })
    });
    const ver = abrirBanco(join(dir, 'acervo.sqlite'));
    await f.emitir({ 'connection.update': { connection: 'open' } });
    await f.emitir({ 'messages.upsert': { type: 'notify', messages: [{ key: { id: 'V1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 4 } }, messageTimestamp: 1_760_000_000 }] } });
    for (let i = 0; i < 200 && (ver.prepare('SELECT COUNT(*) AS n FROM midias').get() as { n: number }).n === 0; i++) await new Promise((r) => setTimeout(r, 10));
    const m = ver.prepare('SELECT caminho, sha256 FROM midias').get() as { caminho: string; sha256: string };
    assert.ok(m, 'a midia foi baixada');
    assert.equal(m.caminho, `data/midias/${m.sha256}.ogg`);
    assert.equal(readFileSync(join(dir, 'midias', `${m.sha256}.ogg`), 'utf8'), 'audio-sintetico');
    assert.equal((ver.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'transcrever' AND estado = 'pendente'").get() as { n: number }).n, 1);
    ver.close(); await l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('sem conexao o laco espera: a midia fica na fila, sem gastar tentativa', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-listener-'));
  try {
    const f = conexaoFalsa();
    const l = await iniciarListener({ pastaDados: dir, abrir: async () => ({ sock: f.sock as never, salvarCreds: async () => {} }), baixador: () => async () => new Uint8Array([1]), intervaloBaixarMs: 5, serializar: (m) => JSON.stringify({ id: m.key.id }) });
    // identidade existe no socket falso, mas a conexao NAO foi aberta (nenhum connection.update "open")
    await f.emitir({ 'messages.upsert': { type: 'notify', messages: [{ key: { id: 'V2', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true } }, messageTimestamp: 1_760_000_000 }] } });
    await new Promise((r) => setTimeout(r, 100));
    const ver = abrirBanco(join(dir, 'acervo.sqlite'));
    assert.equal((ver.prepare('SELECT COUNT(*) AS n FROM midias').get() as { n: number }).n, 0);
    assert.deepEqual({ ...(ver.prepare("SELECT estado, tentativas FROM fila WHERE tipo = 'baixar_midia'").get() as object) }, { estado: 'pendente', tentativas: 0 });
    ver.close(); await l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('caixa de saida: o texto pendente sai pelo Envio so quando ha conexao, vai so ao dono e fica marcado como enviado com o id do WhatsApp', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-listener-'));
  try {
    const f = conexaoFalsa();
    const l = await iniciarListener({ pastaDados: dir, abrir: async () => ({ sock: f.sock as never, salvarCreds: async () => {} }), esperar: async () => {}, intervaloEntregaMs: 10, intervaloBaixarMs: 10 });
    const ver = abrirBanco(join(dir, 'acervo.sqlite'));
    ver.exec('PRAGMA busy_timeout = 5000');
    const { enfileirarSaida, MARCA } = await import('../../core/src/saida.ts');
    enfileirarSaida(ver, 'relatorio', 'bom dia, dono');
    await new Promise((r) => setTimeout(r, 120));
    assert.deepEqual(f.enviados, [], 'sem conexao nada sai');
    await f.emitir({ 'connection.update': { connection: 'open' } });
    for (let i = 0; i < 50 && f.enviados.length === 0; i++) await new Promise((r) => setTimeout(r, 40));
    assert.deepEqual(f.enviados, [{ jid: '5511900000000@s.whatsapp.net', c: { text: `${MARCA}bom dia, dono` } }]);
    for (let i = 0; i < 50 && (ver.prepare("SELECT estado FROM saida").get() as { estado: string }).estado !== 'enviada'; i++) await new Promise((r) => setTimeout(r, 40));
    assert.deepEqual({ ...(ver.prepare('SELECT estado, wa_msg_id FROM saida').get() as Record<string, string>) }, { estado: 'enviada', wa_msg_id: 'E1' });
    ver.close();
    await l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});
