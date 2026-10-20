// Tradutor dos eventos do Baileys para o que o acervo entende. Os formatos vem da documentacao (docs/baileys/concepts/events.md,
// proto-reference/) e do codigo da biblioteca instalada (apps/listener/node_modules/@whiskeysockets/baileys/lib/Utils/process-message.js):
// REVOKE e MESSAGE_EDIT chegam em "messages.update", nao em "messages.upsert". Dados 100% sinteticos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { traduzirMensagem, traduzirAtualizacao, paraMilissegundos, type MensagemBaileys } from './traduzir.ts';

const CLIENTE = '5511999990001@s.whatsapp.net';
const GRUPO = '120363000000000001@g.us';
const msg = (extra: Partial<MensagemBaileys> & { message: MensagemBaileys['message'] }, key: Partial<MensagemBaileys['key']> = {}): MensagemBaileys => ({
  key: { id: 'ABC1', remoteJid: CLIENTE, fromMe: false, ...key },
  messageTimestamp: 1_760_000_000,
  ...extra
});
const unico = <T,>(xs: T[]): T => { assert.equal(xs.length, 1); return xs[0]!; };

test('texto simples: vira "registrar" com o tempo em milissegundos e a origem', () => {
  const a = unico(traduzirMensagem(msg({ message: { conversation: 'Oi, tudo bem?' }, pushName: 'Carlos' }), 'notify'));
  assert.equal(a.tipo, 'registrar');
  if (a.tipo !== 'registrar') return;
  assert.deepEqual(a.evento, { waMsgId: 'ABC1', remoteJid: CLIENTE, remoteJidAlt: undefined, participante: undefined, fromMe: false, quandoMs: 1_760_000_000_000, tipo: 'texto', texto: 'Oi, tudo bem?', origem: 'notify', nomeContato: 'Carlos' });
  assert.equal(a.midia, undefined);
});

test('texto estendido (resposta, link) e legenda nao se confundem: so extendedTextMessage.text conta como texto', () => {
  const a = unico(traduzirMensagem(msg({ message: { extendedTextMessage: { text: 'veja https://exemplo.com.br' } } }), 'append'));
  assert.equal(a.tipo === 'registrar' && a.evento.texto, 'veja https://exemplo.com.br');
  assert.equal(a.tipo === 'registrar' && a.evento.origem, 'append');
});

test('o nome do contato (pushName) so vale para mensagens dos outros, nunca as do dono', () => {
  const a = unico(traduzirMensagem(msg({ message: { conversation: 'ok' }, pushName: 'Nome do Dono' }, { fromMe: true }), 'notify'));
  assert.equal(a.tipo === 'registrar' && a.evento.nomeContato, undefined);
});

test('nota de voz (ptt) e audio comum: tipo "audio" com o que precisa para baixar depois', () => {
  const m = msg({ message: { audioMessage: { ptt: true, seconds: 42, mimetype: 'audio/ogg; codecs=opus', fileLength: 12345 } } });
  const a = unico(traduzirMensagem(m, 'notify'));
  assert.equal(a.tipo, 'registrar');
  if (a.tipo !== 'registrar') return;
  assert.equal(a.evento.tipo, 'audio');
  assert.equal(a.evento.texto, undefined);
  assert.deepEqual(a.midia, { tipo: 'audio', mimetype: 'audio/ogg; codecs=opus', nomeArquivo: undefined, bytes: 12345, segundos: 42 });
});

test('PDF: pelo tipo MIME ou pela extensao .pdf; outros documentos (docx, planilha) ficam de fora (decisao D11)', () => {
  const pdf1 = unico(traduzirMensagem(msg({ message: { documentMessage: { mimetype: 'application/pdf', fileName: 'ata.pdf', fileLength: 2000 } } }), 'notify'));
  assert.equal(pdf1.tipo === 'registrar' && pdf1.evento.tipo, 'pdf');
  assert.equal(pdf1.tipo === 'registrar' && pdf1.midia?.nomeArquivo, 'ata.pdf');
  const pdf2 = unico(traduzirMensagem(msg({ message: { documentMessage: { mimetype: 'application/octet-stream', fileName: 'Transcricao Reuniao.PDF' } } }), 'notify'));
  assert.equal(pdf2.tipo === 'registrar' && pdf2.evento.tipo, 'pdf');
  const docx = unico(traduzirMensagem(msg({ message: { documentMessage: { mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileName: 'proposta.docx' } } }), 'notify'));
  assert.equal(docx.tipo === 'registrar' && docx.evento.tipo, 'outro');
  assert.equal(docx.tipo === 'registrar' && docx.midia, undefined);
});

test('imagem, video, figurinha, contato e localizacao: tipo "outro" (guardado como ignorado, sem texto)', () => {
  for (const message of [{ imageMessage: { caption: 'foto' } }, { videoMessage: {} }, { stickerMessage: {} }, { contactMessage: {} }, { locationMessage: {} }]) {
    const a = unico(traduzirMensagem(msg({ message }), 'notify'));
    assert.equal(a.tipo === 'registrar' && a.evento.tipo, 'outro');
    assert.equal(a.tipo === 'registrar' && a.evento.texto, undefined, 'legenda de imagem nao entra: so texto, audio e PDF');
  }
});

test('embrulhos (mensagem temporaria, ver uma vez, documento com legenda) sao abertos antes de classificar', () => {
  const temp = unico(traduzirMensagem(msg({ message: { ephemeralMessage: { message: { conversation: 'texto temporario' } } } }), 'notify'));
  assert.equal(temp.tipo === 'registrar' && temp.evento.texto, 'texto temporario');
  const uma = unico(traduzirMensagem(msg({ message: { viewOnceMessageV2: { message: { audioMessage: { ptt: true, seconds: 3 } } } } }), 'notify'));
  assert.equal(uma.tipo === 'registrar' && uma.evento.tipo, 'audio');
  const leg = unico(traduzirMensagem(msg({ message: { documentWithCaptionMessage: { message: { documentMessage: { mimetype: 'application/pdf', fileName: 'x.pdf' } } } } }), 'notify'));
  assert.equal(leg.tipo === 'registrar' && leg.evento.tipo, 'pdf');
});

test('grupo: guarda quem falou (participant) e a forma alternativa PN/LID; DM guarda remoteJidAlt', () => {
  const g = unico(traduzirMensagem(msg({ message: { conversation: 'bom dia' } }, { remoteJid: GRUPO, participant: '123456789012345@lid', participantAlt: '5511999990002@s.whatsapp.net' }), 'notify'));
  assert.equal(g.tipo === 'registrar' && g.evento.participante, '123456789012345@lid');
  assert.equal(g.tipo === 'registrar' && g.evento.remoteJidAlt, '5511999990002@s.whatsapp.net', 'em grupo a forma alternativa e a do participante');
  const d = unico(traduzirMensagem(msg({ message: { conversation: 'oi' } }, { remoteJid: '123456789012345@lid', remoteJidAlt: CLIENTE }), 'notify'));
  assert.equal(d.tipo === 'registrar' && d.evento.remoteJidAlt, CLIENTE);
});

test('status, listas de transmissao e canais sao ignorados (nao entram no acervo)', () => {
  for (const jid of ['status@broadcast', '1760000000@broadcast', '12345@newsletter']) {
    const a = unico(traduzirMensagem(msg({ message: { conversation: 'x' } }, { remoteJid: jid }), 'notify'));
    assert.equal(a.tipo, 'ignorar', jid);
  }
});

test('o "envelope" de apagar/editar que chega em messages.upsert NAO e uma mensagem nova', () => {
  const env = msg({ message: { protocolMessage: { type: 0, key: { id: 'ORIG1', remoteJid: CLIENTE } } } });
  const a = unico(traduzirMensagem(env, 'notify'));
  assert.equal(a.tipo, 'ignorar');
  const ed = msg({ message: { protocolMessage: { type: 14, key: { id: 'ORIG1' }, editedMessage: { conversation: 'novo' } } } });
  assert.equal(unico(traduzirMensagem(ed, 'notify')).tipo, 'ignorar');
});

test('reacao, enquete, chaves de grupo e mensagem vazia: ignorados, com o motivo', () => {
  for (const message of [{ reactionMessage: { text: '👍' } }, { pollUpdateMessage: {} }, { senderKeyDistributionMessage: {} }, {}]) {
    const a = unico(traduzirMensagem(msg({ message }), 'notify'));
    assert.equal(a.tipo, 'ignorar');
    if (a.tipo === 'ignorar') assert.ok(a.motivo.length > 0);
  }
  assert.equal(unico(traduzirMensagem(msg({ message: null }), 'notify')).tipo, 'ignorar');
});

test('chave incompleta (sem id ou sem conversa) ou sem data: ignorada, nunca inventada', () => {
  assert.equal(unico(traduzirMensagem({ key: { remoteJid: CLIENTE }, message: { conversation: 'x' }, messageTimestamp: 1 }, 'notify')).tipo, 'ignorar');
  assert.equal(unico(traduzirMensagem({ key: { id: 'A' }, message: { conversation: 'x' }, messageTimestamp: 1 }, 'notify')).tipo, 'ignorar');
  const semData = unico(traduzirMensagem({ key: { id: 'A', remoteJid: CLIENTE }, message: { conversation: 'x' } }, 'notify'));
  assert.equal(semData.tipo, 'ignorar');
  if (semData.tipo === 'ignorar') assert.match(semData.motivo, /data/);
});

test('data em todas as formas que o Baileys entrega: numero, texto, Long {low,high} e objeto com toNumber()', () => {
  assert.equal(paraMilissegundos(1_760_000_000), 1_760_000_000_000);
  assert.equal(paraMilissegundos('1760000000'), 1_760_000_000_000);
  assert.equal(paraMilissegundos({ low: 1_760_000_000, high: 0, unsigned: true }), 1_760_000_000_000);
  assert.equal(paraMilissegundos({ low: 5, high: 1 }), (4_294_967_296 + 5) * 1000);
  assert.equal(paraMilissegundos({ toNumber: () => 1_760_000_001 }), 1_760_000_001_000);
  assert.equal(paraMilissegundos(null), null);
  assert.equal(paraMilissegundos(undefined), null);
  assert.equal(paraMilissegundos('abc'), null);
  assert.equal(paraMilissegundos(0), null, 'zero nao e data');
  assert.equal(paraMilissegundos(-5), null);
});

test('historico: a mesma mensagem, com origem "historico"', () => {
  const a = unico(traduzirMensagem(msg({ message: { conversation: 'antiga' } }), 'historico'));
  assert.equal(a.tipo === 'registrar' && a.evento.origem, 'historico');
});

// ---- messages.update: apagar e editar (formatos lidos no process-message.js da biblioteca instalada) ----
test('apagada para todos: update { message: null, messageStubType: REVOKE } vira "apagar" com o id da mensagem ORIGINAL', () => {
  const a = unico(traduzirAtualizacao({ key: { id: 'ORIG1', remoteJid: CLIENTE, fromMe: false }, update: { message: null, messageStubType: 1, key: { id: 'ENV9', remoteJid: CLIENTE } } }));
  assert.deepEqual(a, { tipo: 'apagar', remoteJid: CLIENTE, waMsgId: 'ORIG1' });
});

test('editada: update.message.editedMessage.message vira "editar" com o texto novo (conversa simples ou texto estendido)', () => {
  const a = unico(traduzirAtualizacao({ key: { id: 'ORIG1', remoteJid: CLIENTE }, update: { message: { editedMessage: { message: { conversation: 'texto corrigido' } } }, messageTimestamp: 1_760_000_100 } }));
  assert.deepEqual(a, { tipo: 'editar', remoteJid: CLIENTE, waMsgId: 'ORIG1', novoTexto: 'texto corrigido' });
  const b = unico(traduzirAtualizacao({ key: { id: 'ORIG2', remoteJid: GRUPO }, update: { message: { editedMessage: { message: { extendedTextMessage: { text: 'outro' } } } } } }));
  assert.equal(b.tipo === 'editar' && b.novoTexto, 'outro');
});

test('edicao de algo que nao e texto (legenda de imagem, audio) nao altera nada', () => {
  const a = unico(traduzirAtualizacao({ key: { id: 'X', remoteJid: CLIENTE }, update: { message: { editedMessage: { message: { imageMessage: { caption: 'nova legenda' } } } } } }));
  assert.equal(a.tipo, 'ignorar');
});

test('atualizacoes comuns (recibo de entrega/leitura, reacao, enquete) nao geram nada', () => {
  assert.deepEqual(traduzirAtualizacao({ key: { id: 'A', remoteJid: CLIENTE }, update: { status: 3 } }), []);
  assert.deepEqual(traduzirAtualizacao({ key: { id: 'A', remoteJid: CLIENTE }, update: { pollUpdates: [] } }), []);
});

test('atualizacao sem id ou sem conversa: ignorada', () => {
  assert.equal(unico(traduzirAtualizacao({ key: { remoteJid: CLIENTE }, update: { message: null, messageStubType: 1 } })).tipo, 'ignorar');
  assert.equal(unico(traduzirAtualizacao({ key: { id: 'A' }, update: { message: null, messageStubType: 1 } })).tipo, 'ignorar');
});
