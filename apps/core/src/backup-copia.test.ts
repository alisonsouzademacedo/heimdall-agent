// Backup automatico do acervo no destino escolhido pelo dono (HD externo, outro disco, pen drive): so COPIA (VACUUM INTO), nunca apaga nem restaura.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { validarDestinoDeBackup, definirDestinoDeBackup, backupDoDia, lerBackup } from './backup-copia.ts';

const AGORA = Date.parse('2026-10-21T12:00:00Z');
const pasta = () => mkdtempSync(join(tmpdir(), 'heimdall-bk-'));
const limpar = (p: string) => rmSync(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
const comDados = (): Banco => { const d = abrirBanco(); migrar(d); d.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run(); return d; };

test('destino: pasta existente e gravavel passa; inexistente, relativa, arquivo comum e nome com aspa nao', () => {
  const p = pasta();
  try {
    assert.deepEqual(validarDestinoDeBackup(p), { ok: true });
    writeFileSync(join(p, 'arquivo.txt'), 'x');
    for (const ruim of [join(p, 'nao-existe'), 'pasta/relativa', '', join(p, 'arquivo.txt'), join(p, "a'b")]) assert.equal(validarDestinoDeBackup(ruim).ok, false, JSON.stringify(ruim));
    const r = validarDestinoDeBackup(join(p, 'nao-existe')) as { ok: false; motivo: string };
    assert.match(r.motivo, /existe|pasta/i);
  } finally { limpar(p); }
});

test('destino: falta de espaco e recusada com o motivo (espaco livre injetado)', () => {
  const p = pasta();
  try {
    const r = validarDestinoDeBackup(p, { espacoLivre: () => 1000, tamanhoDoAcervo: 600 }) as { ok: false; motivo: string };
    assert.equal(r.ok, false); assert.match(r.motivo, /espa/i);
    assert.equal(validarDestinoDeBackup(p, { espacoLivre: () => 10 ** 12, tamanhoDoAcervo: 600 }).ok, true);
  } finally { limpar(p); }
});

test('sem destino configurado: nada e feito e o estado diz "sem_destino"', () => {
  const db = comDados();
  assert.equal(backupDoDia(db, AGORA), 'sem_destino');
  assert.deepEqual(lerBackup(db), { destino: null, ultimoEm: null, erro: null });
});

test('definir o destino valida antes de gravar; destino ruim nao e gravado', () => {
  const db = comDados(); const p = pasta();
  try {
    assert.equal(definirDestinoDeBackup(db, join(p, 'nao-existe')).ok, false);
    assert.equal(lerBackup(db).destino, null);
    assert.equal(definirDestinoDeBackup(db, p).ok, true);
    assert.equal(lerBackup(db).destino, p);
  } finally { limpar(p); }
});

test('primeiro uso do dia faz o backup (arquivo acervo-AAAA-MM-DD.sqlite com os dados); no mesmo dia nao repete; no dia seguinte faz outro', () => {
  const db = comDados(); const p = pasta();
  try {
    definirDestinoDeBackup(db, p);
    assert.equal(backupDoDia(db, AGORA), 'feito');
    assert.deepEqual(readdirSync(p), ['acervo-2026-10-21.sqlite']);
    const copia = abrirBanco(join(p, 'acervo-2026-10-21.sqlite'));
    assert.equal((copia.prepare('SELECT COUNT(*) AS n FROM clientes').get() as { n: number }).n, 1);
    copia.close();
    assert.equal(backupDoDia(db, AGORA + 3_600_000), 'em_dia');
    assert.equal(backupDoDia(db, AGORA + 24 * 3_600_000), 'feito');
    assert.deepEqual(readdirSync(p).sort(), ['acervo-2026-10-21.sqlite', 'acervo-2026-10-22.sqlite']);
    assert.equal(lerBackup(db).ultimoEm, AGORA + 24 * 3_600_000);
  } finally { limpar(p); }
});

test('falha (disco removido): o erro curto fica anotado, nada quebra, e tenta de novo no proximo ciclo', () => {
  const db = comDados(); const p = pasta();
  definirDestinoDeBackup(db, p);
  limpar(p); // o pen drive saiu
  assert.equal(backupDoDia(db, AGORA), 'erro');
  const e = lerBackup(db);
  assert.equal(e.ultimoEm, null); assert.ok(e.erro && e.erro.length <= 200 && !e.erro.includes('\n'));
  const p2 = pasta();
  try {
    definirDestinoDeBackup(db, p2);
    assert.equal(backupDoDia(db, AGORA + 1000), 'feito');
    assert.equal(lerBackup(db).erro, null, 'o erro some quando da certo');
  } finally { limpar(p2); }
});

test('arquivo de backup do dia que ja existe nao e sobrescrito (conta como feito)', () => {
  const db = comDados(); const p = pasta();
  try {
    definirDestinoDeBackup(db, p);
    writeFileSync(join(p, 'acervo-2026-10-21.sqlite'), 'de um backup anterior');
    assert.equal(backupDoDia(db, AGORA), 'feito');
    assert.equal(existsSync(join(p, 'acervo-2026-10-21.sqlite')), true);
    assert.equal(readdirSync(p).length, 1);
  } finally { limpar(p); }
});
