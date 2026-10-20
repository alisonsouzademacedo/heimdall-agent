// Gravacao dos arquivos de midia (data/midias/<sha256>.<ext>): atomica, idempotente, nome so por hash.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarGravadorMidia } from './arquivos.ts';

const SHA = 'c'.repeat(64);
function pasta() { return mkdtempSync(join(tmpdir(), 'heimdall-midias-')); }

test('grava em <dados>/midias/<sha>.<ext> e devolve o caminho relativo com barras normais', async () => {
  const d = pasta();
  try {
    const g = criarGravadorMidia(d);
    const caminho = await g(SHA, 'ogg', new TextEncoder().encode('abc'));
    assert.equal(caminho, `data/midias/${SHA}.ogg`);
    assert.equal(readFileSync(join(d, 'midias', `${SHA}.ogg`), 'utf8'), 'abc');
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('gravar de novo o mesmo hash nao muda nada; nao sobra arquivo temporario', async () => {
  const d = pasta();
  try {
    const g = criarGravadorMidia(d);
    await g(SHA, 'pdf', new TextEncoder().encode('primeiro'));
    await g(SHA, 'pdf', new TextEncoder().encode('primeiro'));
    assert.deepEqual(readdirSync(join(d, 'midias')), [`${SHA}.pdf`]);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('so aceita hash de 64 hex minusculos e extensao ogg/pdf (nome nunca vem de mensagem)', async () => {
  const d = pasta();
  try {
    const g = criarGravadorMidia(d);
    for (const [h, e] of [['../x', 'ogg'], [SHA.toUpperCase(), 'ogg'], [SHA, 'exe'], [SHA, '../ogg'], ['', 'pdf']] as const) await assert.rejects(() => g(h, e, new Uint8Array(1)), /nome/, `${h}.${e}`);
    assert.equal(existsSync(join(d, 'midias')) ? readdirSync(join(d, 'midias')).length : 0, 0);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
