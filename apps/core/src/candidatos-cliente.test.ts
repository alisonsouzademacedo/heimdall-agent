import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { resumirContatosDm, contarPorSituacao, cadastrarClientesQueResponderam, contarCandidatosACliente } from './candidatos-cliente.ts';
import { montarPacoteDiario } from './relatorio.ts';

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

function cenarioCadastro(): Banco {
  const db = banco();
  const a = contato(db, '5555111110001@s.whatsapp.net', 'Ana'); msg(db, a.conversaId, true, 1000); msg(db, a.conversaId, false, 2000); // respondeu
  const n = contato(db, '5555111110002@s.whatsapp.net', null); msg(db, n.conversaId, true, 1000); msg(db, n.conversaId, false, 3000); // respondeu, sem nome
  const so = contato(db, '5555111110003@s.whatsapp.net', 'SoEles'); msg(db, so.conversaId, false, 2000); // so ele falou
  const eu = contato(db, '5555111110004@s.whatsapp.net', 'SoEu'); msg(db, eu.conversaId, true, 2000); // so o dono falou
  const i = contato(db, '5555111110005@s.whatsapp.net', 'Colega', 'interno'); msg(db, i.conversaId, true, 1000); msg(db, i.conversaId, false, 2000); // equipe
  const f = contato(db, '5555111110006@s.whatsapp.net', 'Fornecedor', 'fornecedor'); msg(db, f.conversaId, true, 1000); msg(db, f.conversaId, false, 2000); // ja classificado
  return db;
}

test('cadastra como cliente so quem RESPONDEU (ida e volta) e ainda nao tem papel; interno, fornecedor, so-eles e so-eu ficam como estao', () => {
  const db = cenarioCadastro();
  assert.equal(contarCandidatosACliente(db), 2);
  const r = cadastrarClientesQueResponderam(db, 5000);
  assert.deepEqual(r, { criados: 2 });
  const linhas = db.prepare("SELECT k.nome AS contato, k.papel, k.papel_fonte AS fonte, c.nome, c.nome_origem AS origem, c.criado_em AS em FROM contatos k LEFT JOIN clientes c ON c.id = k.cliente_id ORDER BY k.id").all() as { contato: string | null; papel: string; fonte: string; nome: string | null; origem: string | null; em: number | null }[];
  assert.deepEqual(linhas.map((l) => [l.contato, l.papel, l.nome]), [
    ['Ana', 'cliente', 'Ana'], [null, 'cliente', 'Contato final 0002'], ['SoEles', 'desconhecido', null], ['SoEu', 'desconhecido', null], ['Colega', 'interno', null], ['Fornecedor', 'fornecedor', null]
  ]);
  for (const l of linhas.slice(0, 2)) { assert.equal(l.fonte, 'inferido', 'reversivel: nao e cadastro do dono'); assert.equal(l.origem, 'provisorio', 'a extracao pode melhorar o nome depois'); assert.equal(l.em, 5000); }
  assert.equal(contarCandidatosACliente(db), 0);
});

test('e idempotente: rodar de novo nao cria nada; quem responde depois entra na proxima rodada', () => {
  const db = cenarioCadastro();
  cadastrarClientesQueResponderam(db, 5000);
  assert.deepEqual(cadastrarClientesQueResponderam(db, 6000), { criados: 0 });
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM clientes').get() as { n: number }).n, 2);
  const conv = Number((db.prepare("SELECT id FROM conversas WHERE jid = '5555111110003@s.whatsapp.net'").get() as { id: number }).id);
  msg(db, conv, true, 7000); // o dono responde ao "SoEles": agora ha ida e volta
  assert.deepEqual(cadastrarClientesQueResponderam(db, 8000), { criados: 1 });
});

test('o cliente cadastrado entra no relatorio (o acompanhamento passa a enxergar o contato)', () => {
  const db = cenarioCadastro();
  cadastrarClientesQueResponderam(db, 5000);
  const dia = Date.parse('2025-10-08T13:00:00Z');
  db.prepare('UPDATE mensagens SET enviada_em = ? WHERE enviada_em = 2000 AND conversa_id = (SELECT id FROM conversas WHERE jid = ?)').run(dia, '5555111110001@s.whatsapp.net');
  db.prepare('UPDATE mensagens SET enviada_em = ? WHERE enviada_em = 1000 AND conversa_id = (SELECT id FROM conversas WHERE jid = ?)').run(dia - 86_400_000, '5555111110001@s.whatsapp.net');
  const p = montarPacoteDiario(db, Date.UTC(2025, 9, 10, 15));
  assert.ok(p.aguardando.some((x) => x.cliente === 'Ana'), 'Ana respondeu por ultimo: aguardando o dono');
});
