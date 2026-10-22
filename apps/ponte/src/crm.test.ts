// A porta do CRM nao guarda a configuracao no inicio: o onboarding pode salvar o token com a ponte rodando.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { salvarConfigCrm } from '../../core/src/crm/config.ts';
import { criarPortaCrm } from './crm.ts';

const AGORA = Date.parse('2026-10-22T11:00:00Z');

test('sem configuracao a porta nao faz nada; depois de salvar o token, ela ja enxerga o CRM sem reiniciar', async () => {
  const raiz = mkdtempSync(join(tmpdir(), 'heimdall-crm-'));
  const db = abrirBanco();
  migrar(db);
  try {
    const porta = criarPortaCrm(raiz);
    assert.deepEqual(await porta.propor(db, AGORA), []);
    assert.equal(await porta.aplicar(db, 'ok 1', AGORA), null);

    salvarConfigCrm(raiz, { url: 'https://krayin.example.com', token: 'x'.repeat(32) });
    const r = await porta.aplicar(db, 'ok 1', AGORA);
    assert.equal(r?.semPropostas, true);
  } finally {
    db.close();
    rmSync(raiz, { recursive: true, force: true });
  }
});
