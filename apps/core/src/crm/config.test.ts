import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { caminhoConfigCrm, lerConfigCrm, salvarConfigCrm } from './config.ts';

const TOKEN = ['12', 'abcdefghijklmnopqrstuvwxyz'].join('|'); // token FALSO, montado em tempo de execucao

function temp(): { dir: string; fim: () => void } {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-crm-'));
  return { dir, fim: () => rmSync(dir, { recursive: true, force: true }) };
}

test('config do CRM: ida e volta grava o arquivo em data/ (fora do git) e nao inventa campos', () => {
  const t = temp();
  try {
    assert.equal(lerConfigCrm(t.dir), null);
    const c = salvarConfigCrm(t.dir, { url: 'http://127.0.0.1:8000/', token: `  ${TOKEN}  ` });
    assert.deepEqual(c, { url: 'http://127.0.0.1:8000', token: TOKEN });
    const lido = JSON.parse(readFileSync(caminhoConfigCrm(t.dir), 'utf8'));
    assert.deepEqual(lido, { url: 'http://127.0.0.1:8000', token: TOKEN });
    assert.deepEqual(lerConfigCrm(t.dir), c);
    if (process.platform !== 'win32') assert.equal(statSync(caminhoConfigCrm(t.dir)).mode & 0o777, 0o600);
  } finally { t.fim(); }
});

test('config do CRM: recusa URL e token invalidos sem ecoar o token', () => {
  const t = temp();
  try {
    const casos = [
      { url: 'ftp://127.0.0.1', token: TOKEN },
      { url: 'http://usuario:senha@127.0.0.1', token: TOKEN },
      { url: 'nao-e-url', token: TOKEN },
      { url: '', token: TOKEN },
      { url: 'http://127.0.0.1:8000', token: '' },
      { url: 'http://127.0.0.1:8000', token: 'curto' },
      { url: 'http://127.0.0.1:8000', token: `${TOKEN} com espaco` },
      { url: 'http://127.0.0.1:8000', token: `${TOKEN}\n` }
    ];
    for (const c of casos) {
      assert.throws(() => salvarConfigCrm(t.dir, c), (e: Error) => !e.message.includes(TOKEN) && /URL|token/i.test(e.message), JSON.stringify(c));
      assert.equal(lerConfigCrm(t.dir), null);
    }
  } finally { t.fim(); }
});

test('config do CRM: arquivo corrompido ou adulterado conta como nao configurado', () => {
  const t = temp();
  try {
    const p = caminhoConfigCrm(t.dir);
    salvarConfigCrm(t.dir, { url: 'http://127.0.0.1:8000', token: TOKEN });
    writeFileSync(p, '{quebrado', 'utf8');
    assert.equal(lerConfigCrm(t.dir), null);
    writeFileSync(p, JSON.stringify({ url: 'http://127.0.0.1:8000' }), 'utf8');
    assert.equal(lerConfigCrm(t.dir), null);
    writeFileSync(p, JSON.stringify({ url: 'http://127.0.0.1:8000', token: 'x' }), 'utf8');
    assert.equal(lerConfigCrm(t.dir), null);
  } finally { t.fim(); }
});
