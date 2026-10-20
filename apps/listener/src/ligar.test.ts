// A ligacao entre o Baileys e o acervo, testada com um socket FALSO que emite os mesmos eventos (docs/baileys/concepts/events.md).
// O que so o WhatsApp real prova (QR, historico de verdade, nota de voz de verdade) esta em docs/plano/runbooks/08-testes-de-fumaca.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar } from '../../core/src/db.ts';
import { ligarEventos, type SocketMinimo, type EventosMinimos, type Estado } from './ligar.ts';

const CLIENTE = '5511999990001@s.whatsapp.net';
type Handler = (e: Partial<EventosMinimos>) => void | Promise<void>;

function socketFalso(user?: SocketMinimo['user']) {
  let handler: Handler | null = null;
  const sock: SocketMinimo = { user, ev: { process(h) { handler = h as Handler; } } };
  return { sock, emitir: async (e: Partial<EventosMinimos>) => { await handler!(e); } };
}
const msg = (id: string, texto: string, extra: object = {}) => ({ key: { id, remoteJid: CLIENTE, fromMe: false }, message: { conversation: texto }, messageTimestamp: 1_760_000_000, ...extra });
function montar(user: SocketMinimo['user'] = { id: '5511900000000:7@s.whatsapp.net', lid: '999888777666555@lid' }) {
  const db = abrirBanco(); migrar(db);
  const s = socketFalso(user);
  const estados: Estado[] = []; const qrs: string[] = []; const creds: number[] = []; const hist: { progresso: number | null; ultima: boolean }[] = [];
  ligarEventos({ sock: s.sock, banco: db, salvarCreds: async () => { creds.push(1); }, aoEstado: (e) => estados.push(e), aoQr: (q) => qrs.push(q), aoHistorico: (h) => hist.push(h) });
  return { db, s, estados, qrs, creds, hist };
}

test('QR chega pelo connection.update e vai para quem mostra (a tela); nada e gravado', async () => {
  const { s, qrs, db } = montar();
  await s.emitir({ 'connection.update': { qr: 'QRSTRING-1' } });
  assert.deepEqual(qrs, ['QRSTRING-1']);
  assert.equal(contar(db, 'mensagens'), 0);
});

test('conexao aberta -> estado "conectado" com a identidade do dono; creds.update salva as credenciais', async () => {
  const { s, estados, creds } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' }, 'creds.update': {} });
  assert.deepEqual(estados.at(-1), { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net', lid: '999888777666555@lid' } });
  assert.equal(creds.length, 1);
});

test('conexao aberta SEM numero de telefone do dono: estado "erro" e nada e gravado', async () => {
  const { s, estados, db } = montar({ id: '999888777666555@lid' });
  await s.emitir({ 'connection.update': { connection: 'open' } });
  assert.equal(estados.at(-1)?.estado, 'erro');
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('X1', 'oi')] } });
  assert.equal(contar(db, 'mensagens'), 0);
});

test('queda da conexao: deslogado (401) NAO reconecta e pede novo QR; qualquer outro codigo reconecta', async () => {
  const { s, estados } = montar();
  await s.emitir({ 'connection.update': { connection: 'close', lastDisconnect: { error: { output: { statusCode: 401 } } } } });
  assert.deepEqual(estados.at(-1), { estado: 'deslogado' });
  await s.emitir({ 'connection.update': { connection: 'close', lastDisconnect: { error: { output: { statusCode: 515 } } } } });
  assert.deepEqual(estados.at(-1), { estado: 'reconectar', codigo: 515 });
  await s.emitir({ 'connection.update': { connection: 'close', lastDisconnect: { error: new Error('rede caiu') } } });
  assert.deepEqual(estados.at(-1), { estado: 'reconectar', codigo: undefined });
});

test('mensagens ao vivo (notify) e historico entram no acervo; recebidas de novo nao duplicam', async () => {
  const { s, db, hist } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('N1', 'ao vivo')] } });
  await s.emitir({ 'messaging-history.set': { messages: [msg('H1', 'antiga 1', { messageTimestamp: 1_700_000_000 }), msg('N1', 'ao vivo')], chats: [], contacts: [], progress: 40, isLatest: false } });
  await s.emitir({ 'messaging-history.set': { messages: [msg('H2', 'antiga 2', { messageTimestamp: 1_700_000_100 })], chats: [], contacts: [], progress: 100, isLatest: true } });
  assert.equal(contar(db, 'mensagens'), 3);
  const origens = (db.prepare('SELECT wa_msg_id, origem_evento FROM mensagens ORDER BY wa_msg_id').all() as { wa_msg_id: string; origem_evento: string }[]).map((r) => `${r.wa_msg_id}:${r.origem_evento}`);
  assert.deepEqual(origens, ['H1:historico', 'H2:historico', 'N1:notify']);
  assert.deepEqual(hist, [{ progresso: 40, ultima: false }, { progresso: 100, ultima: true }]);
});

test('"append" (carregado do aparelho) entra como append, nao como ao vivo', async () => {
  const { s, db } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  await s.emitir({ 'messages.upsert': { type: 'append', messages: [msg('P1', 'carregada')] } });
  assert.equal((db.prepare('SELECT origem_evento FROM mensagens').get() as { origem_evento: string }).origem_evento, 'append');
});

test('eventos que chegam ANTES da identidade ficar disponivel esperam e entram depois (nada se perde)', async () => {
  const user: NonNullable<SocketMinimo['user']> = { id: 'lixo' };
  const db = abrirBanco(); migrar(db);
  const s = socketFalso();
  ligarEventos({ sock: s.sock, banco: db, salvarCreds: async () => {}, aoEstado: () => {}, aoQr: () => {}, aoHistorico: () => {} });
  await s.emitir({ 'messaging-history.set': { messages: [msg('E1', 'cedo demais')], chats: [], contacts: [], progress: 10, isLatest: false } });
  assert.equal(contar(db, 'mensagens'), 0, 'sem identidade ainda');
  s.sock.user = { id: '5511900000000:7@s.whatsapp.net' };
  void user;
  await s.emitir({ 'connection.update': { connection: 'open' } });
  assert.equal(contar(db, 'mensagens'), 1, 'depois da identidade, a fila de espera e gravada');
});

test('edicao e "apagada para todos" chegam por messages.update e atualizam sem remover', async () => {
  const { s, db } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('U1', 'versao 1')] } });
  await s.emitir({ 'messages.update': [{ key: { id: 'U1', remoteJid: CLIENTE }, update: { message: { editedMessage: { message: { conversation: 'versao 2' } } } } }] });
  await s.emitir({ 'messages.update': [{ key: { id: 'U1', remoteJid: CLIENTE }, update: { message: null, messageStubType: 1 } }] });
  const r = db.prepare('SELECT texto, texto_original, estado FROM mensagens').get() as { texto: string; texto_original: string; estado: string };
  assert.deepEqual({ ...r }, { texto: 'versao 2', texto_original: 'versao 1', estado: 'apagada' });
});

test('"messages.delete" (apagar so para mim / limpar conversa) NAO apaga nada do acervo', async () => {
  const { s, db } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('K1', 'guardada')] } });
  await s.emitir({ 'messages.delete': { keys: [{ id: 'K1', remoteJid: CLIENTE }] } });
  await s.emitir({ 'messages.delete': { jid: CLIENTE, all: true } });
  assert.equal(contar(db, 'mensagens'), 1);
  assert.equal((db.prepare('SELECT estado FROM mensagens').get() as { estado: string }).estado, 'ativa');
});

test('mapeamento PN<->LID, contatos e nomes de grupo do historico alimentam o acervo', async () => {
  const { s, db } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  await s.emitir({ 'lid-mapping.update': { pn: CLIENTE, lid: '555444333222111@lid' } });
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('L1', 'pelo pn'), { ...msg('L2', 'pelo lid'), key: { id: 'L2', remoteJid: '555444333222111@lid', fromMe: false } }] } });
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'dm'").get() as { n: number }).n, 1);
  db.prepare('UPDATE contatos SET nome = NULL').run();
  await s.emitir({ 'contacts.upsert': [{ id: CLIENTE, name: 'Carlos' }] });
  assert.equal((db.prepare('SELECT nome FROM contatos').get() as { nome: string }).nome, 'Carlos');
});

test('uma excecao dentro de um evento nao derruba a escuta: vira estado de aviso e o proximo evento funciona', async () => {
  const { s, db, estados } = montar();
  await s.emitir({ 'connection.update': { connection: 'open' } });
  db.exec('DROP TABLE conversas'); // sabotagem
  await s.emitir({ 'messages.upsert': { type: 'notify', messages: [msg('B1', 'quebra')] } });
  assert.ok(estados.some((e) => e.estado === 'aviso'));
});
