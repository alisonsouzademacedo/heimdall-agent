// Comandos que o Heimdall responde POR CODIGO (zero token): /heimdall hoje, aguardando, followups, cliente <nome>, ajuda. Dados sinteticos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, type Banco } from '../../core/src/db.ts';
import { responderComando } from './comandos.ts';

const T = Date.UTC(2025, 9, 10, 15, 0, 0); // sexta 2025-10-10, 12:00 em Sao Paulo
const dia = (d: string, h = 13) => Date.parse(`${d}T${String(h).padStart(2, '0')}:00:00Z`);

function cliente(db: Banco, nome: string, jid: string, msgs: [boolean, number][]): number {
  const cl = Number(db.prepare('INSERT INTO clientes (nome) VALUES (?)').run(nome).lastInsertRowid);
  const co = Number(db.prepare("INSERT INTO contatos (nome, papel, cliente_id) VALUES (?, 'cliente', ?)").run(nome, cl).lastInsertRowid);
  db.prepare("INSERT INTO contato_jids (jid, contato_id, tipo) VALUES (?, ?, 'pn')").run(jid, co);
  const cv = Number(db.prepare("INSERT INTO conversas (jid, tipo, nome) VALUES (?, 'dm', ?)").run(jid, nome).lastInsertRowid);
  msgs.forEach(([deMim, em], i) => db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, texto, origem_evento) VALUES (?, ?, ?, ?, 'texto', 'x', 'historico')").run(cv, `${jid}-${i}`, deMim ? 1 : 0, em));
  return cl;
}
function cenario(): Banco {
  const db = abrirBanco(); migrar(db);
  // Alfa: o dono escreveu na terca e o cliente respondeu na quarta -> aguardando o dono.
  cliente(db, 'Alfa Ltda', '5511911110001@s.whatsapp.net', [[true, dia('2025-10-07')], [false, dia('2025-10-08')]]);
  // Beta: o cliente falou na quarta anterior e o dono respondeu na quinta (ha 5 dias uteis) -> follow-up devido.
  cliente(db, 'Beta Comércio', '5511911110002@s.whatsapp.net', [[false, dia('2025-10-01')], [true, dia('2025-10-02')]]);
  return db;
}

test('hoje: devolve o resumo do dia montado por codigo, com os dois clientes nas secoes certas', () => {
  const r = responderComando(cenario(), 'hoje', T)!;
  assert.match(r, /Alfa Ltda/); assert.match(r, /Beta Comércio/);
  assert.match(r, /Aguardando você/); assert.match(r, /Follow-ups devidos/);
});

test('aguardando e followups: cada lista traz so os clientes dela', () => {
  const db = cenario();
  const a = responderComando(db, 'aguardando', T)!;
  assert.match(a, /Alfa Ltda/); assert.doesNotMatch(a, /Beta/);
  const f = responderComando(db, 'followups', T)!;
  assert.match(f, /Beta Comércio/); assert.doesNotMatch(f, /Alfa/);
  assert.match(responderComando(abrirBancoVazio(), 'aguardando', T)!, /Ninguém|nenhum/i);
});
function abrirBancoVazio(): Banco { const db = abrirBanco(); migrar(db); return db; }

test('cliente <nome>: acha sem ligar para maiuscula ou acento, mostra o estado em portugues; sem achar ou com varios, diz o que fazer', () => {
  const db = cenario();
  const r = responderComando(db, 'cliente comercio', T)!;
  assert.match(r, /Beta Comércio/); assert.match(r, /follow-up devido/i); assert.match(r, /tentativa 1 de 7/i);
  assert.match(responderComando(db, 'cliente alfa', T)!, /aguardando resposta sua/i);
  assert.match(responderComando(db, 'cliente zzz', T)!, /não achei/i);
  const varios = responderComando(db, 'cliente a', T)!; // "a" esta nos dois nomes
  assert.match(varios, /Alfa Ltda/); assert.match(varios, /Beta Comércio/); assert.match(varios, /mais de um/i);
  assert.match(responderComando(db, 'cliente', T)!, /nome/i, 'sem nome: pede o nome');
});

test('ajuda lista os comandos; qualquer outra coisa nao e comando (vai ao modelo)', () => {
  const db = cenario();
  const aj = responderComando(db, 'ajuda', T)!;
  for (const c of ['hoje', 'aguardando', 'followups', 'cliente']) assert.match(aj, new RegExp(c));
  assert.equal(responderComando(db, 'hoje quem espera minha resposta?', T), null);
  assert.equal(responderComando(db, 'resuma a conversa com a Ana', T), null);
  assert.equal(responderComando(db, '', T), null);
});

test('responder comando nao escreve nada no banco', () => {
  const db = cenario();
  const antes = JSON.stringify(['clientes', 'contatos', 'mensagens', 'saida', 'ajustes_cliente'].map((t) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n));
  for (const c of ['hoje', 'aguardando', 'followups', 'cliente alfa', 'ajuda']) responderComando(db, c, T);
  assert.equal(JSON.stringify(['clientes', 'contatos', 'mensagens', 'saida', 'ajustes_cliente'].map((t) => (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n)), antes);
});
