// Rodizio dos backups: apaga so os que o proprio Heimdall gravou (acervo-AAAA-MM-DD.sqlite) e que estao invalidos ou passaram da retencao,
// e nunca o mais recente valido. Dados sinteticos; pastas temporarias.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from './db.ts';
import { fazerBackup } from './backup-copia.ts';
import { escolherParaApagar, backupValido, rodizioDeBackups, RETENCAO_BACKUP_DIAS } from './backup-rodizio.ts';

const nome = (d: string) => `acervo-${d}.sqlite`;

test('decisao: invalido sempre sai; valido so sai se passou da retencao; o mais recente valido nunca sai; hoje nunca sai', () => {
  const lista = [
    { nome: nome('2026-08-01'), valido: true },   // velho
    { nome: nome('2026-09-05'), valido: true },   // velho (46 dias)
    { nome: nome('2026-09-25'), valido: false },  // invalido recente
    { nome: nome('2026-10-10'), valido: true },   // dentro da retencao
    { nome: nome('2026-10-20'), valido: false },  // hoje, mesmo invalido, nao mexe
  ];
  assert.deepEqual(escolherParaApagar(lista, '2026-10-20').sort(), [nome('2026-08-01'), nome('2026-09-05'), nome('2026-09-25')]);
  assert.equal(RETENCAO_BACKUP_DIAS, 30);
});

test('decisao: se TODOS os validos estao velhos, o mais recente deles fica (nunca ficar sem backup)', () => {
  const lista = [{ nome: nome('2026-06-01'), valido: true }, { nome: nome('2026-07-01'), valido: true }];
  assert.deepEqual(escolherParaApagar(lista, '2026-10-20'), [nome('2026-06-01')]);
});

test('decisao: arquivo com outro nome nunca e candidato', () => {
  const lista = [{ nome: 'foto.jpg', valido: false }, { nome: 'acervo-2026-08-01.sqlite.bak', valido: false }, { nome: 'acervo-2026-8-1.sqlite', valido: false }, { nome: '../acervo-2026-08-01.sqlite', valido: false }];
  assert.deepEqual(escolherParaApagar(lista, '2026-10-20'), []);
});

test('backupValido: copia real passa; texto qualquer e arquivo vazio nao', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'hd-rodizio-'));
  try {
    const db = abrirBanco(); migrar(db);
    fazerBackup(db, join(pasta, nome('2026-10-19'))); db.close();
    writeFileSync(join(pasta, nome('2026-10-18')), 'isto nao e um banco');
    writeFileSync(join(pasta, nome('2026-10-17')), '');
    assert.equal(backupValido(join(pasta, nome('2026-10-19'))), true);
    assert.equal(backupValido(join(pasta, nome('2026-10-18'))), false);
    assert.equal(backupValido(join(pasta, nome('2026-10-17'))), false);
    assert.equal(backupValido(join(pasta, 'nao-existe.sqlite')), false);
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('rodizio na pasta: apaga o invalido e o velho, preserva o resto (inclusive arquivos que nao sao nossos) e devolve o que apagou', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'hd-rodizio-'));
  try {
    const db = abrirBanco(); migrar(db);
    for (const d of ['2026-08-01', '2026-10-10', '2026-10-19']) fazerBackup(db, join(pasta, nome(d)));
    db.close();
    writeFileSync(join(pasta, nome('2026-10-15')), 'lixo');
    writeFileSync(join(pasta, 'minhas-fotos.zip'), 'nao mexer');
    const apagados: string[] = [];
    const r = rodizioDeBackups(pasta, '2026-10-20', (n) => { apagados.push(n); rmSync(join(pasta, n)); });
    assert.deepEqual(apagados.sort(), [nome('2026-08-01'), nome('2026-10-15')]);
    assert.deepEqual(r.apagados.sort(), apagados.sort());
    assert.deepEqual(readdirSync(pasta).sort(), ['minhas-fotos.zip', nome('2026-10-10'), nome('2026-10-19')].sort());
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('rodizio: pasta que nao existe nao quebra e nao apaga nada', () => {
  assert.deepEqual(rodizioDeBackups(join(tmpdir(), 'hd-nao-existe-xyz'), '2026-10-20', () => { throw new Error('nao deveria apagar'); }).apagados, []);
});

test('decisao: exatamente 30 dias fica; 31 dias sai (com um valido mais novo para sobrar)', () => {
  const lista = [{ nome: nome('2026-09-20'), valido: true }, { nome: nome('2026-09-19'), valido: true }, { nome: nome('2026-10-19'), valido: true }];
  assert.deepEqual(escolherParaApagar(lista, '2026-10-20'), [nome('2026-09-19')]);
});
