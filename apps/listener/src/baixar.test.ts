// Baixar midia com a biblioteca REAL do Baileys, sem WhatsApp: um servidor local entrega um arquivo cifrado do jeito do WhatsApp
// (gerado pelo proprio encryptedStream da biblioteca), e o descritor passa pelo mesmo caminho do acervo (BufferJSON ida e volta).
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, rmSync } from 'node:fs';
import { encryptedStream } from '@whiskeysockets/baileys';
import { serializarMensagem, BufferJSON } from './conectar.ts';
import { criarBaixador } from './baixar.ts';

async function servir(bytes: Buffer, status = 200) {
  const pedidos: number[] = [];
  const srv = http.createServer((_req, res) => { pedidos.push(1); res.statusCode = status; res.setHeader('Content-Length', status === 200 ? bytes.length : 0); res.end(status === 200 ? bytes : undefined); });
  await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${(srv.address() as { port: number }).port}/midia`, fechar: () => srv.close(), pedidos };
}

test('audio cifrado -> descritor guardado no acervo -> baixado e decifrado igual ao original', async () => {
  const plano = Buffer.from('audio-sintetico-' + 'x'.repeat(7000));
  const enc = await encryptedStream(plano, 'audio', { opts: {} });
  const srv = await servir(readFileSync(enc.encFilePath));
  try {
    const msg = { key: { id: 'A1', remoteJid: '5511999990001@s.whatsapp.net' }, message: { audioMessage: { url: srv.url, mediaKey: enc.mediaKey, fileEncSha256: enc.fileEncSha256, fileSha256: enc.fileSha256, fileLength: enc.fileLength, mimetype: 'audio/ogg; codecs=opus', ptt: true } } };
    const descritor = serializarMensagem(msg); // o mesmo serializador que a escuta usa
    // BufferJSON guarda os bytes em base64 ({"type":"Buffer","data":"..."}); o JSON comum guardaria uma lista de numeros e perderia o tipo.
    assert.doesNotMatch(descritor, /"data":\[/, 'as chaves nao podem virar uma lista de numeros');
    assert.match(descritor, /"mediaKey":\{"type":"Buffer","data":"[A-Za-z0-9+\/=]+"\}/);
    const baixar = criarBaixador({ reuploadRequest: async (m) => m });
    const bytes = await baixar(descritor);
    assert.equal(Buffer.compare(Buffer.from(bytes), plano), 0);
  } finally { srv.fechar(); rmSync(enc.encFilePath, { force: true }); rmSync(enc.originalFilePath ?? '', { force: true }); }
});

test('PDF (documentMessage) tambem', async () => {
  const plano = Buffer.from('%PDF-1.4 sintetico ' + 'y'.repeat(3000));
  const enc = await encryptedStream(plano, 'document', { opts: {} });
  const srv = await servir(readFileSync(enc.encFilePath));
  try {
    const msg = { key: { id: 'P1' }, message: { documentMessage: { url: srv.url, mediaKey: enc.mediaKey, fileEncSha256: enc.fileEncSha256, fileSha256: enc.fileSha256, fileLength: enc.fileLength, mimetype: 'application/pdf', fileName: 'ata.pdf' } } };
    const bytes = await criarBaixador({ reuploadRequest: async (m) => m })(JSON.stringify(msg, BufferJSON.replacer));
    assert.equal(Buffer.compare(Buffer.from(bytes), plano), 0);
  } finally { srv.fechar(); rmSync(enc.encFilePath, { force: true }); rmSync(enc.originalFilePath ?? '', { force: true }); }
});

// Achado ao ler a biblioteca instalada (7.0.0-rc14): o download decifra com AES-CBC e NAO confere o MAC; por isso conferimos o fileSha256 do descritor.
test('arquivo adulterado: erro "hash_nao_confere", nunca bytes errados', async () => {
  const enc = await encryptedStream(Buffer.from('conteudo ' + 'z'.repeat(2000)), 'audio', { opts: {} });
  const ruim = readFileSync(enc.encFilePath); ruim[10] = ruim[10]! ^ 0xff;
  const srv = await servir(ruim);
  try {
    const msg = { key: { id: 'A2' }, message: { audioMessage: { url: srv.url, mediaKey: enc.mediaKey, fileEncSha256: enc.fileEncSha256, fileSha256: enc.fileSha256, fileLength: enc.fileLength } } };
    await assert.rejects(() => criarBaixador({ reuploadRequest: async (m) => m })(serializarMensagem(msg)), /hash_nao_confere/);
  } finally { srv.fechar(); rmSync(enc.encFilePath, { force: true }); rmSync(enc.originalFilePath ?? '', { force: true }); }
});

// Achado: o reenvio automatico da biblioteca confere error.status, mas o erro de download vem com statusCode (Boom): nunca dispara. Fazemos nos.
test('midia expirada (410): pede reenvio ao aparelho UMA vez e tenta de novo; sem sucesso, erro claro', async () => {
  const enc = await encryptedStream(Buffer.from('conteudo ' + 'w'.repeat(2000)), 'audio', { opts: {} });
  const srv = await servir(Buffer.alloc(0), 410);
  let pedidosReenvio = 0;
  try {
    const msg = { key: { id: 'A3' }, message: { audioMessage: { url: srv.url, mediaKey: enc.mediaKey, fileEncSha256: enc.fileEncSha256, fileSha256: enc.fileSha256, fileLength: enc.fileLength } } };
    await assert.rejects(() => criarBaixador({ reuploadRequest: async (m) => { pedidosReenvio++; return m; } })(serializarMensagem(msg)));
    assert.equal(pedidosReenvio, 1);
  } finally { srv.fechar(); rmSync(enc.encFilePath, { force: true }); rmSync(enc.originalFilePath ?? '', { force: true }); }
});

test('midia expirada e o reenvio funciona: a segunda tentativa usa a mensagem atualizada e entrega os bytes', async () => {
  const plano = Buffer.from('conteudo recuperado ' + 'q'.repeat(3000));
  const enc = await encryptedStream(plano, 'audio', { opts: {} });
  const velho = await servir(Buffer.alloc(0), 410);
  const novo = await servir(readFileSync(enc.encFilePath));
  try {
    const base = { mediaKey: enc.mediaKey, fileEncSha256: enc.fileEncSha256, fileSha256: enc.fileSha256, fileLength: enc.fileLength };
    const msg = { key: { id: 'A4' }, message: { audioMessage: { url: velho.url, ...base } } };
    const bytes = await criarBaixador({ reuploadRequest: async (m) => ({ ...m, message: { audioMessage: { url: novo.url, ...base } } }) })(serializarMensagem(msg));
    assert.equal(Buffer.compare(Buffer.from(bytes), plano), 0);
  } finally { velho.fechar(); novo.fechar(); rmSync(enc.encFilePath, { force: true }); rmSync(enc.originalFilePath ?? '', { force: true }); }
});

test('descritor quebrado ou sem midia: erro, sem derrubar', async () => {
  const b = criarBaixador({ reuploadRequest: async (m) => m });
  await assert.rejects(() => b('nao e json'));
  await assert.rejects(() => b(JSON.stringify({ key: { id: 'X' }, message: { conversation: 'texto' } })));
  await assert.rejects(() => b('{}'));
});
