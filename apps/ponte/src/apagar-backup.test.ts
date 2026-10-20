import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apagarBackup } from './apagar-backup.ts';

test('apaga so o nome gravado pelo Heimdall; qualquer outro nome, caminho com pasta ou curinga e recusado', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'hd-apb-'));
  try {
    writeFileSync(join(pasta, 'acervo-2026-08-01.sqlite'), 'x');
    writeFileSync(join(pasta, 'outro.sqlite'), 'x');
    mkdirSync(join(pasta, 'sub')); writeFileSync(join(pasta, 'sub', 'acervo-2026-08-01.sqlite'), 'x');
    for (const ruim of ['outro.sqlite', '*', 'acervo-*.sqlite', '../acervo-2026-08-01.sqlite', 'sub/acervo-2026-08-01.sqlite', 'acervo-2026-08-01.sqlite.bak', '']) assert.equal(apagarBackup(pasta, ruim), false, ruim);
    assert.deepEqual(readdirSync(pasta).sort(), ['acervo-2026-08-01.sqlite', 'outro.sqlite', 'sub']);
    assert.equal(apagarBackup(pasta, 'acervo-2026-08-01.sqlite'), true);
    assert.deepEqual(readdirSync(pasta).sort(), ['outro.sqlite', 'sub']);
    assert.equal(apagarBackup(pasta, 'acervo-2026-08-01.sqlite'), true, 'ja nao existe: tudo bem');
    assert.equal(apagarBackup('', 'acervo-2026-08-01.sqlite'), false);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});
