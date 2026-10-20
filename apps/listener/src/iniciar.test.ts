// O processo do listener inteiro, com uma conexao FALSA no lugar do Baileys: estado, QR, historico e mensagens vao parar no SQLite.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
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
    l.parar();
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
    ver.close(); l.parar();
  } finally { rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});
