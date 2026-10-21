// Cadastro da equipe INTERNA com numero inteligente: aceita o jeito humano de digitar, gera as duas variantes (com e sem o 9), casa com os contatos
// ja importados SEM consultar o WhatsApp. Numeros 100% SINTETICOS. O nono digito brasileiro nao esta documentado em docs/baileys/: por isso as duas formas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { normalizarTelefone, cadastrarMembro, listarEquipe } from './cadastro.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const T = 1_760_000_000_000;
const novo = () => { const db = abrirBanco(); migrar(db); return { db, escuta: criarEscuta(db, DONO, { agora: () => T }) }; };
const v = (s: string) => { const r = normalizarTelefone(s); assert.equal(r.ok, true, s); return r.ok ? r.variantes : []; };

test('formatos humanos: com/sem +, parenteses, tracos, espacos, com/sem codigo do pais dao as MESMAS duas variantes (DDD 11)', () => {
  const esperado = ['5511999990001', '551199990001'];
  for (const s of ['+55 11 99999-0001', '5511999990001', '(11) 99999-0001', '11 999990001', '(11)999990001', '+5511999990001', '  55 (11) 9 9999 0001 ']) assert.deepEqual(v(s), esperado, s);
});

test('o DDD 55 (Santa Maria) nao se confunde com o codigo do pais: "(55) 999990001" = DDD 55 + 9 digitos', () => {
  assert.deepEqual(v('(55) 999990001'), ['5555999990001', '555599990001']);
  assert.deepEqual(v('55 55 99999-0001'), ['5555999990001', '555599990001']);
  assert.deepEqual(v('+55 (55) 9999-0001'), ['555599990001', '5555999990001'], 'digitado sem o 9: a variante digitada vai primeiro');
});

test('sem o 9 (conta antiga) gera as duas formas, a digitada primeiro; telefone fixo gera uma so', () => {
  assert.deepEqual(v('(11) 9999-0001'), ['551199990001', '5511999990001']);
  assert.deepEqual(v('(11) 3333-4444'), ['551133334444'], 'fixo (comeca em 2 a 5): nao ganha 9');
});

test('entradas invalidas dizem o motivo: vazio, curto, letras, sem DDD, DDD inexistente, comprido demais', () => {
  for (const [s, re] of [['', /informe/i], ['123', /curto|digitos/i], ['abc', /digitos/i], ['99999-0001', /DDD/], ['(05) 99999-0001', /DDD/], ['+55 11 99999-0001 123456', /longo|digitos/i]] as const) {
    const r = normalizarTelefone(s);
    assert.equal(r.ok, false, s);
    if (!r.ok) assert.match(r.motivo, re, s);
  }
});

test('exibicao: mostra o que foi entendido no formato +55 DD 9XXXX-XXXX', () => {
  const r = normalizarTelefone('(11) 99999-0001');
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.exibir, ['+55 11 99999-0001', '+55 11 9999-0001']);
});

test('cadastrar: acha o contato ja importado por QUALQUER variante (digitou sem o 9, o acervo tem com o 9) e marca como interno', () => {
  const { db, escuta } = novo();
  escuta.mensagens([{ key: { id: 'M1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: 1_760_000_000, pushName: 'Beto' }], 'historico');
  const r = cadastrarMembro(db, { nome: 'Beto da equipe', funcao: 'SDR', telefone: '(11) 9999-0001' }, T);
  assert.deepEqual({ ok: r.ok, achou: r.ok && r.achou }, { ok: true, achou: true });
  const c = db.prepare("SELECT papel, papel_fonte AS fonte FROM contatos WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = '5511999990001@s.whatsapp.net')").get() as { papel: string; fonte: string };
  assert.deepEqual({ ...c }, { papel: 'interno', fonte: 'cadastro' });
  assert.equal(contar(db, 'contatos'), 1, 'nao criou contato novo');
  assert.equal(contar(db, 'equipe'), 1);
});

test('cadastrar numero que nao esta entre os contatos: guarda as duas variantes na MESMA pessoa e avisa; mensagem futura por qualquer variante cai nela', () => {
  const { db, escuta } = novo();
  const r = cadastrarMembro(db, { nome: 'Carla', funcao: '', telefone: '(11) 99999-0002' }, T);
  assert.ok(r.ok && r.achou === false);
  if (r.ok) assert.match(r.aviso ?? '', /nao achei/i);
  assert.doesNotMatch(r.ok ? (r.aviso ?? '') : '', /99999-0002|9999-0002/, 'o aviso nao pode mostrar o numero inteiro');
  assert.equal(contar(db, 'contatos'), 1);
  assert.equal(contar(db, 'contato_jids'), 2);
  escuta.mensagens([{ key: { id: 'M9', remoteJid: '551199990002@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: 1_760_000_000 }], 'historico'); // chegou pela forma SEM o 9
  assert.equal(contar(db, 'contatos'), 1, 'nao virou outro contato');
  assert.equal((db.prepare('SELECT papel FROM contatos').get() as { papel: string }).papel, 'interno');
});

test('a mesma pessoa duas vezes (outra variante do mesmo numero) e recusada; cliente nao entra na equipe; nome e obrigatorio', () => {
  const { db, escuta } = novo();
  assert.ok(cadastrarMembro(db, { nome: 'Dani', funcao: '', telefone: '(11) 99999-0003' }, T).ok);
  const dup = cadastrarMembro(db, { nome: 'Dani de novo', funcao: '', telefone: '+55 11 9999-0003' }, T);
  assert.equal(dup.ok, false);
  if (!dup.ok) assert.match(dup.motivo, /ja esta/i);
  escuta.mensagens([{ key: { id: 'C1', remoteJid: '5511999990004@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: 1_760_000_000 }], 'historico');
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = '5511999990004@s.whatsapp.net')").run();
  const cli = cadastrarMembro(db, { nome: 'Fulano', funcao: '', telefone: '(11) 99999-0004' }, T);
  assert.equal(cli.ok, false);
  if (!cli.ok) assert.match(cli.motivo, /cliente/i);
  assert.equal(cadastrarMembro(db, { nome: '   ', funcao: '', telefone: '(11) 99999-0005' }, T).ok, false);
  assert.equal(contar(db, 'equipe'), 1);
});

test('listar a equipe nao mostra o numero inteiro (so o final) e tira caracteres de controle do nome', () => {
  const { db } = novo();
  cadastrarMembro(db, { nome: 'Edu\u0000\n<b>', funcao: 'Closer', telefone: '(11) 99999-0006' }, T);
  const l = listarEquipe(db);
  assert.equal(l.length, 1);
  assert.doesNotMatch(l[0]!.nome, /[\u0000-\u001f<>]/);
  assert.equal(l[0]!.telefone, '+55 11 *****-0006');
  assert.equal(l[0]!.achou, false);
});
