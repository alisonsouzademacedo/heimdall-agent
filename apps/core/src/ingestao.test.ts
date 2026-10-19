import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { registrarMensagem, registrarEdicao, registrarApagada, mensagensParaAcompanhamento, resolverContato, type EventoMensagem } from './ingestao.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net', lid: '98765432100001:12@lid' };
const CLIENTE_PN = '5511988887777@s.whatsapp.net';
const CLIENTE_LID = '44455566677788@lid';

function novoBanco(): Banco { const db = abrirBanco(); migrar(db); return db; }
const msg = (extra: Partial<EventoMensagem> = {}): EventoMensagem => ({
  waMsgId: 'M1', remoteJid: CLIENTE_PN, fromMe: false, quandoMs: 1000, tipo: 'texto', texto: 'ola', origem: 'notify', ...extra
});

test('mensagem nova e inserida; a repetida (reconexao/historico) nao duplica', () => {
  const db = novoBanco();
  assert.equal(registrarMensagem(db, msg(), DONO), 'inserida');
  assert.equal(registrarMensagem(db, msg({ origem: 'historico' }), DONO), 'duplicada');
  assert.equal(registrarMensagem(db, msg({ origem: 'append' }), DONO), 'duplicada');
  assert.equal(contar(db, 'mensagens'), 1);
});

test('o mesmo id em conversas diferentes sao mensagens diferentes', () => {
  const db = novoBanco();
  registrarMensagem(db, msg(), DONO);
  assert.equal(registrarMensagem(db, msg({ remoteJid: '5511977776666@s.whatsapp.net' }), DONO), 'inserida');
  assert.equal(contar(db, 'mensagens'), 2);
});

test('so texto, audio e PDF sao guardados; o resto fica "ignorada" sem conteudo', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ waMsgId: 'A', tipo: 'audio' }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'P', tipo: 'pdf' }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'F', tipo: 'outro', texto: 'conteudo de figurinha' }), DONO);
  const r = db.prepare("SELECT tipo, texto FROM mensagens WHERE wa_msg_id = 'F'").get() as { tipo: string; texto: string | null };
  assert.equal(r.tipo, 'ignorada');
  assert.equal(r.texto, null);
});

test('edicao guarda o original uma so vez; edicoes seguintes nao o sobrescrevem', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ texto: 'prazo 30 dias' }), DONO);
  assert.equal(registrarEdicao(db, CLIENTE_PN, 'M1', 'prazo 45 dias'), 'alterada');
  assert.equal(registrarEdicao(db, CLIENTE_PN, 'M1', 'prazo 60 dias'), 'alterada');
  const r = db.prepare("SELECT texto, texto_original, estado FROM mensagens").get() as { texto: string; texto_original: string; estado: string };
  assert.deepEqual({ ...r }, { texto: 'prazo 60 dias', texto_original: 'prazo 30 dias', estado: 'editada' });
});

test('mensagem apagada continua no banco, marcada; editar uma apagada nao acontece', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ texto: 'segredo' }), DONO);
  assert.equal(registrarApagada(db, CLIENTE_PN, 'M1'), 'alterada');
  const r = db.prepare('SELECT texto, estado FROM mensagens').get() as { texto: string; estado: string };
  assert.deepEqual({ ...r }, { texto: 'segredo', estado: 'apagada' });
  assert.equal(registrarEdicao(db, CLIENTE_PN, 'M1', 'novo'), 'nao_encontrada');
});

test('editar ou apagar mensagem desconhecida nao quebra', () => {
  const db = novoBanco();
  assert.equal(registrarEdicao(db, CLIENTE_PN, 'NAO', 'x'), 'nao_encontrada');
  assert.equal(registrarApagada(db, CLIENTE_PN, 'NAO'), 'nao_encontrada');
  assert.equal(registrarApagada(db, 'lixo', 'NAO'), 'nao_encontrada');
});

test('conversas: self-chat, DM e grupo sao classificados', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ waMsgId: 'S', remoteJid: '5555999990000@s.whatsapp.net', fromMe: true }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'S2', remoteJid: '98765432100001@lid', fromMe: true }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'D' }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'G', remoteJid: '123-456@g.us', participante: CLIENTE_PN }), DONO);
  const tipos = db.prepare('SELECT jid, tipo FROM conversas ORDER BY jid').all() as { jid: string; tipo: string }[];
  const mapa = Object.fromEntries(tipos.map((t) => [t.jid, t.tipo]));
  assert.equal(Object.values(mapa).filter((x) => x === 'self').length, 1); // PN e LID do dono: uma so conversa
  assert.equal(mapa['5555999990000@s.whatsapp.net'], 'self');
  assert.equal(mapa[CLIENTE_PN], 'dm');
  assert.equal(mapa['123-456@g.us'], 'grupo');
});

test('transmissao, status e canal sao ignorados (nada e gravado)', () => {
  const db = novoBanco();
  for (const jid of ['status@broadcast', '123@broadcast', '99@newsletter', 'lixo']) {
    assert.equal(registrarMensagem(db, msg({ remoteJid: jid }), DONO), 'jid_invalido', jid);
  }
  assert.equal(contar(db, 'mensagens'), 0);
});

test('PN e LID do mesmo cliente viram UM contato e UMA conversa quando a forma alternativa e informada', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ waMsgId: 'A', remoteJid: CLIENTE_PN, remoteJidAlt: CLIENTE_LID }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'B', remoteJid: CLIENTE_LID, remoteJidAlt: CLIENTE_PN }), DONO);
  assert.equal(contar(db, 'contatos'), 1);
  assert.equal(contar(db, 'contato_jids'), 2);
  assert.equal(contar(db, 'conversas'), 1);
  assert.equal(contar(db, 'mensagens'), 2);
});

test('PN e LID do dono sao uma unica conversa de self-chat', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ waMsgId: 'S1', remoteJid: '5555999990000@s.whatsapp.net', fromMe: true }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'S2', remoteJid: '98765432100001@lid', fromMe: true }), DONO);
  assert.equal(contar(db, 'conversas'), 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'self'").get()!.n, 1);
});

test('editar/apagar achando a mensagem pela outra forma do JID (LID em vez de PN)', () => {
  const db = novoBanco();
  registrarMensagem(db, msg({ waMsgId: 'A', remoteJid: CLIENTE_PN, remoteJidAlt: CLIENTE_LID, texto: 'um' }), DONO);
  assert.equal(registrarEdicao(db, CLIENTE_LID, 'A', 'dois'), 'alterada');
  assert.equal((db.prepare('SELECT texto FROM mensagens').get() as { texto: string }).texto, 'dois');
});

test('resolverContato recusa JID que nao e de usuario e nao duplica ao repetir', () => {
  const db = novoBanco();
  assert.equal(resolverContato(db, '123-456@g.us'), null);
  const a = resolverContato(db, CLIENTE_PN);
  const b = resolverContato(db, `5511988887777:7@s.whatsapp.net`); // mesmo usuario, outro dispositivo
  assert.equal(a, b);
  assert.equal(contar(db, 'contatos'), 1);
});

test('mensagens para o motor de regras: so DM do cliente; self-chat e grupo ficam de fora', () => {
  const db = novoBanco();
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  registrarMensagem(db, msg({ waMsgId: 'C1', quandoMs: 1000 }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'E1', fromMe: true, quandoMs: 2000, texto: 'oi' }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'S1', remoteJid: '5555999990000@s.whatsapp.net', fromMe: true, quandoMs: 3000 }), DONO);
  registrarMensagem(db, msg({ waMsgId: 'G1', remoteJid: '123-456@g.us', participante: CLIENTE_PN, quandoMs: 4000 }), DONO);
  db.prepare('UPDATE contatos SET cliente_id = 1').run();
  const r = mensagensParaAcompanhamento(db, 1);
  assert.deepEqual(r.map((x) => [x.em, x.deMim]), [[1000, false], [2000, true]]);
});

test('mensagem do cliente apagada conta como resposta mas nao cobra resposta do dono', () => {
  const db = novoBanco();
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  registrarMensagem(db, msg(), DONO);
  db.prepare('UPDATE contatos SET cliente_id = 1').run();
  registrarApagada(db, CLIENTE_PN, 'M1');
  const r = mensagensParaAcompanhamento(db, 1);
  assert.equal(r.length, 1);
  assert.equal(r[0]!.precisaResposta, false);
});

test('mesma mensagem chegando por PN e depois por LID do mesmo contato NAO duplica', () => {
  const db = novoBanco();
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  assert.equal(registrarMensagem(db, msg({ waMsgId: 'A', remoteJid: CLIENTE_PN, remoteJidAlt: CLIENTE_LID, quandoMs: 5000 }), DONO), 'inserida');
  assert.equal(registrarMensagem(db, msg({ waMsgId: 'A', remoteJid: CLIENTE_LID, remoteJidAlt: CLIENTE_PN, quandoMs: 5000 }), DONO), 'duplicada');
  db.prepare('UPDATE contatos SET cliente_id = 1').run();
  assert.equal(mensagensParaAcompanhamento(db, 1).length, 1);
  assert.equal(contar(db, 'mensagens'), 1);
});
