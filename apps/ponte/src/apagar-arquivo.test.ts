// Apagar o ARQUIVO de uma midia quando o dono confirma "apagar": so arquivos que o proprio Heimdall gravou (nome = hash), nunca outro caminho.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarApagadorDeMidia } from './apagar-arquivo.ts';

const SHA = 'a'.repeat(64);
function cenario() {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-apagar-'));
  mkdirSync(join(dir, 'midias'));
  writeFileSync(join(dir, 'midias', `${SHA}.ogg`), 'audio');
  writeFileSync(join(dir, 'midias', `${'b'.repeat(64)}.pdf`), 'pdf');
  writeFileSync(join(dir, 'acervo.sqlite'), 'banco');
  writeFileSync(join(dir, 'segredo.txt'), 'nao apagar');
  return { dir, limpar: () => rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }) };
}

test('apaga a midia gravada pelo Heimdall (caminho como fica no banco) e so ela', () => {
  const c = cenario();
  try {
    const apagar = criarApagadorDeMidia(c.dir);
    assert.equal(apagar(`data/midias/${SHA}.ogg`), true);
    assert.equal(existsSync(join(c.dir, 'midias', `${SHA}.ogg`)), false);
    assert.equal(existsSync(join(c.dir, 'midias', `${'b'.repeat(64)}.pdf`)), true, 'a outra midia fica');
    assert.equal(apagar(`data/midias/${SHA}.ogg`), true, 'repetir e inofensivo (arquivo ja sumiu)');
  } finally { c.limpar(); }
});

test('recusa qualquer caminho que nao seja o de uma midia nossa (traversal, absoluto, outro nome, outra extensao, maiuscula)', () => {
  const c = cenario();
  try {
    const apagar = criarApagadorDeMidia(c.dir);
    for (const ruim of ['data/midias/../acervo.sqlite', '../acervo.sqlite', join(c.dir, 'acervo.sqlite'), '/etc/passwd', 'data/acervo.sqlite', 'data/midias/segredo.txt', `data/midias/${SHA}.exe`, `data/midias/${'A'.repeat(64)}.ogg`, `data/midias/${SHA}.ogg/..`, `data\\midias\\${SHA}.ogg`, '', `midias/${SHA}.ogg`, `data/midias/${SHA}.ogg\0x`]) {
      assert.equal(apagar(ruim), false, JSON.stringify(ruim));
    }
    for (const f of ['acervo.sqlite', 'segredo.txt']) assert.equal(existsSync(join(c.dir, f)), true, f);
    assert.equal(existsSync(join(c.dir, 'midias', `${SHA}.ogg`)), true);
  } finally { c.limpar(); }
});
