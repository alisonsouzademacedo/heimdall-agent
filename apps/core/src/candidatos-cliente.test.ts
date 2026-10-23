import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { resumirContatosDm, contarPorSituacao } from './candidatos-cliente.ts';

// Dados sinteticos: nenhum nome ou numero real.
function banco(): Banco {
  const db = abrirBanco();
  migrar(db);
  return db;
}
function contato(db: Banco, jid: string, nome: string | null, papel = 'desconhecido'): { contatoId: number; conversaId: number } {
  const c = Number(db.prepare('INSERT INTO contatos (nome, papel) VALUES (?, ?)').run(nome, papel).lastInsertRowid);
  db.prepare("INSERT INTO contato_jids (jid, contato_id, tipo) VALUES (?, ?, 'pn')").run(jid, c);
  const v = Number(db.prepare("INSERT INTO conversas (jid, tipo, nome) VALUES (?, 'dm', ?)").run(jid, nome).lastInsertRowid);
  return { contatoId: c, conversaId: v };
}
let seq = 0;
function msg(db: Banco, conversaId: number, deMim: boolean, em: number, tipo = 'texto'): void {
  db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, texto, origem_evento) VALUES (?, ?, ?, ?, ?, 'x', 'historico')")
    .run(conversaId, `m${++seq}`, deMim ? 1 : 0, em, tipo);
}

test('classifica cada conversa direta pelo que realmente aconteceu, sem inventar papel', () => {
  const db = banco();
  const a = contato(db, '5555111110001@s.whatsapp.net', 'Ana');
  msg(db, a.conversaId, true, 1000); msg(db, a.conversaId, false, 2000);
  const b = contato(db, '5555111110002@s.whatsapp.net', 'Bia');
  msg(db, b.conversaId, false, 3000);
  const c = contato(db, '5555111110003@s.whatsapp.net', null);
  msg(db, c.conversaId, true, 4000); msg(db, c.conversaId, true, 5000);
  contato(db, '5555111110004@s.whatsapp.net', 'Dani');
  const r = resumirContatosDm(db);
  const por = (id: number) => r.find((x) => x.contatoId === id)!;
  assert.equal(por(a.contatoId).situacao, 'ida_e_volta');
  assert.equal(por(a.contatoId).deles, 1);
  assert.equal(por(a.contatoId).meus, 1);
  assert.equal(por(a.contatoId).ultimaEm, 2000);
  assert.equal(por(b.contatoId).situacao, 'so_eles');
  assert.equal(por(c.contatoId).situacao, 'so_eu');
  assert.equal(por(c.contatoId).temNome, false);
  assert.equal(r.find((x) => x.situacao === 'vazia')!.deles, 0);
  assert.deepEqual(contarPorSituacao(r), { ida_e_volta: 1, so_eles: 1, so_eu: 1, vazia: 1 });
});

test('mensagens ignoradas (reacoes, avisos) nao contam como conversa', () => {
  const db = banco();
  const a = contato(db, '5555111110001@s.whatsapp.net', 'Ana');
  msg(db, a.conversaId, true, 1000); msg(db, a.conversaId, false, 2000, 'ignorada');
  assert.equal(resumirContatosDm(db)[0]!.situacao, 'so_eu');
});

test('grupo e self-chat ficam de fora; quem ja tem papel mostra o papel; nada e escrito', () => {
  const db = banco();
  const i = contato(db, '5555111110009@s.whatsapp.net', 'Interno', 'interno');
  msg(db, i.conversaId, true, 1000); msg(db, i.conversaId, false, 2000);
  db.prepare("INSERT INTO conversas (jid, tipo, nome) VALUES ('g1@g.us', 'grupo', 'Grupo')").run();
  db.prepare("INSERT INTO conversas (jid, tipo, nome) VALUES ('5555999990000@s.whatsapp.net', 'self', NULL)").run();
  const antes = [contar(db, 'clientes'), contar(db, 'contatos'), contar(db, 'mensagens')];
  const r = resumirContatosDm(db);
  assert.equal(r.length, 1);
  assert.equal(r[0]!.papel, 'interno');
  assert.equal(r[0]!.clienteId, null);
  assert.deepEqual([contar(db, 'clientes'), contar(db, 'contatos'), contar(db, 'mensagens')], antes);
});
