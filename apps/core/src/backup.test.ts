import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar, contar, versaoAtual, type Banco } from './db.ts';
import { fazerBackup, restaurarBackup, devoFazerBackup } from './backup.ts';
import { reaplicarEsquecimento } from './apagar.ts';

const AGORA = Date.parse('2026-10-21T12:00:00Z');

function comDados(): Banco {
  const db = abrirBanco(); migrar(db);
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa'), (2, 'Beta')").run();
  db.prepare("INSERT INTO conversas (jid, tipo) VALUES ('1@s.whatsapp.net','dm')").run();
  db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, texto, origem_evento) VALUES (1,'A',0,1,'texto','oi','notify')").run();
  return db;
}
function pasta(): string { return mkdtempSync(join(tmpdir(), 'heimdall-backup-')); }

test('primeiro uso do dia: sem backup anterior ou de ontem, faz; de hoje, nao', () => {
  assert.equal(devoFazerBackup(null, AGORA), true);
  assert.equal(devoFazerBackup(Date.parse('2026-10-20T20:00:00Z'), AGORA), true);
  assert.equal(devoFazerBackup(Date.parse('2026-10-21T09:00:00Z'), AGORA), false);
});

test('a virada do dia usa o fuso de Sao Paulo, nao UTC', () => {
  const ultimo = Date.parse('2026-10-21T01:00:00Z'); // 22:00 de 20/10 em SP
  assert.equal(devoFazerBackup(ultimo, Date.parse('2026-10-21T14:00:00Z')), true); // 11:00 de 21/10 em SP
  const ultimo2 = Date.parse('2026-10-21T04:00:00Z'); // 01:00 de 21/10 em SP
  assert.equal(devoFazerBackup(ultimo2, Date.parse('2026-10-21T23:00:00Z')), false); // ainda 21/10 em SP
});

test('backup e restauracao devolvem exatamente os mesmos dados', () => {
  const dir = pasta();
  try {
    const db = comDados();
    fazerBackup(db, join(dir, 'b.sqlite'));
    const r = restaurarBackup(join(dir, 'b.sqlite'), join(dir, 'restaurado.sqlite'), [], AGORA);
    for (const t of ['clientes', 'conversas', 'mensagens']) assert.equal(contar(r, t), contar(db, t), t);
    assert.equal(versaoAtual(r), versaoAtual(db));
    assert.equal((r.prepare('SELECT texto FROM mensagens').get() as { texto: string }).texto, 'oi');
    r.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('backup nao sobrescreve arquivo existente', () => {
  const dir = pasta();
  try {
    const db = comDados();
    fazerBackup(db, join(dir, 'b.sqlite'));
    assert.throws(() => fazerBackup(db, join(dir, 'b.sqlite')), /ja existe/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('backup e uma foto consistente: mudancas posteriores nao entram nele', () => {
  const dir = pasta();
  try {
    const db = comDados();
    fazerBackup(db, join(dir, 'b.sqlite'));
    db.prepare("INSERT INTO clientes (id, nome) VALUES (3, 'Depois')").run();
    const r = restaurarBackup(join(dir, 'b.sqlite'), join(dir, 'r.sqlite'), [], AGORA);
    assert.equal(contar(r, 'clientes'), 2);
    r.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('restaurar reaplica a lista de esquecimento externa (o cliente apagado nao volta)', () => {
  const dir = pasta();
  try {
    const db = comDados();
    const uidAlfa = (db.prepare('SELECT uid FROM clientes WHERE id = 1').get() as { uid: string }).uid;
    fazerBackup(db, join(dir, 'b.sqlite')); // backup feito ANTES do apagamento
    const r = restaurarBackup(join(dir, 'b.sqlite'), join(dir, 'r.sqlite'), [uidAlfa], AGORA);
    assert.equal(contar(r, 'clientes'), 1);
    assert.equal((r.prepare('SELECT nome FROM clientes').get() as { nome: string }).nome, 'Beta');
    r.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('restaurar sobe o esquema de um backup antigo para a versao atual', () => {
  const dir = pasta();
  try {
    const antigo = abrirBanco(join(dir, 'antigo.sqlite'));
    migrar(antigo, 1);
    antigo.close();
    const r = restaurarBackup(join(dir, 'antigo.sqlite'), join(dir, 'novo.sqlite'), [], AGORA);
    assert.equal(versaoAtual(r) >= 2, true);
    r.close();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('restauracao recusa backup inexistente e destino ja existente', () => {
  const dir = pasta();
  try {
    assert.throws(() => restaurarBackup(join(dir, 'nao-existe.sqlite'), join(dir, 'x.sqlite'), [], AGORA), /nao encontrado/);
    const db = comDados();
    fazerBackup(db, join(dir, 'b.sqlite'));
    restaurarBackup(join(dir, 'b.sqlite'), join(dir, 'x.sqlite'), [], AGORA).close();
    assert.throws(() => restaurarBackup(join(dir, 'b.sqlite'), join(dir, 'x.sqlite'), [], AGORA), /ja existe/);
    assert.equal(existsSync(join(dir, 'b.sqlite')), true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('reaplicarEsquecimento exportado funciona direto sobre um banco', () => {
  const db = comDados();
  assert.deepEqual(reaplicarEsquecimento(db, ['naoexiste'], AGORA), []);
  assert.equal(contar(db, 'clientes'), 2);
});
