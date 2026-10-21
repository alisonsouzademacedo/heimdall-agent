// A escuta liga o tradutor ao acervo: grava mensagens, edicoes e apagadas e enfileira as midias, tudo de forma idempotente.
// Dados sinteticos. Nada aqui envia mensagem: a escuta so le e grava.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar } from '../db.ts';
import { criarEscuta } from './escuta.ts';
import type { MensagemBaileys, AtualizacaoBaileys } from './traduzir.ts';

const DONO = { pn: '5511900000000:7@s.whatsapp.net', lid: '999888777666555@lid' };
const CLIENTE = '5511999990001@s.whatsapp.net';
const novo = () => { const db = abrirBanco(); migrar(db); return { db, escuta: criarEscuta(db, DONO, { agora: () => 1_760_000_500_000 }) }; };
const m = (id: string, message: MensagemBaileys['message'], extra: Partial<MensagemBaileys['key']> = {}, ts = 1_760_000_000): MensagemBaileys => ({ key: { id, remoteJid: CLIENTE, fromMe: false, ...extra }, message, messageTimestamp: ts, pushName: 'Carlos' });
const up = (id: string, update: AtualizacaoBaileys['update'], remoteJid = CLIENTE): AtualizacaoBaileys => ({ key: { id, remoteJid }, update });

test('mensagem de texto entra no acervo; a mesma mensagem de novo e duplicada (nada muda)', () => {
  const { db, escuta } = novo();
  const r1 = escuta.mensagens([m('A1', { conversation: 'Oi, preciso de orcamento' })], 'notify');
  assert.deepEqual({ ins: r1.inseridas, dup: r1.duplicadas }, { ins: 1, dup: 0 });
  const r2 = escuta.mensagens([m('A1', { conversation: 'Oi, preciso de orcamento' })], 'historico');
  assert.deepEqual({ ins: r2.inseridas, dup: r2.duplicadas }, { ins: 0, dup: 1 });
  assert.equal(contar(db, 'mensagens'), 1);
  assert.equal(contar(db, 'fila'), 0, 'texto nao vai para a fila');
});

test('lote: uma mensagem ruim no meio nao derruba as outras, e o resumo conta o que foi ignorado e por que', () => {
  const { db, escuta } = novo();
  const r = escuta.mensagens([
    m('B1', { conversation: 'um' }),
    m('B2', { reactionMessage: { text: 'ok' } }),
    m('B3', { conversation: 'dois' }, { remoteJid: 'status@broadcast' }),
    m('B4', { conversation: 'tres' }, {}, 1_760_000_050),
    { key: { id: 'B5', remoteJid: CLIENTE }, message: { conversation: 'sem data' } }
  ], 'historico');
  assert.equal(r.inseridas, 2);
  assert.equal(contar(db, 'mensagens'), 2);
  assert.equal(r.ignoradas.total, 3);
  assert.ok(Object.keys(r.ignoradas.porMotivo).some((k) => /reacao/.test(k)));
  assert.ok(Object.keys(r.ignoradas.porMotivo).some((k) => /data/.test(k)));
});

test('audio e PDF: a mensagem entra, o descritor da midia e guardado e um trabalho "baixar_midia" entra na fila na mesma operacao', () => {
  const { db, escuta } = novo();
  const serial = (x: MensagemBaileys) => JSON.stringify({ id: x.key.id, message: x.message });
  const r = escuta.mensagens([
    m('C1', { audioMessage: { ptt: true, seconds: 20, mimetype: 'audio/ogg; codecs=opus' } }),
    m('C2', { documentMessage: { mimetype: 'application/pdf', fileName: 'ata.pdf' } }),
    m('C3', { documentMessage: { mimetype: 'application/zip', fileName: 'x.zip' } })
  ], 'notify', serial);
  assert.equal(r.inseridas, 3);
  assert.equal(r.midiasEnfileiradas, 2);
  const fila = db.prepare("SELECT tipo, referencia, estado, tentativas FROM fila ORDER BY id").all() as { tipo: string; referencia: string; estado: string; tentativas: number }[];
  assert.equal(fila.length, 2);
  assert.ok(fila.every((f) => f.tipo === 'baixar_midia' && f.estado === 'pendente' && f.tentativas === 0));
  const origem = db.prepare('SELECT descritor FROM midias_origem').all() as { descritor: string }[];
  assert.equal(origem.length, 2);
  assert.ok(origem.some((o) => JSON.parse(o.descritor).id === 'C1'));
  // reprocessar o mesmo historico nao duplica fila nem descritor
  escuta.mensagens([m('C1', { audioMessage: { ptt: true, seconds: 20 } })], 'historico', serial);
  assert.equal(contar(db, 'fila'), 2);
  assert.equal(contar(db, 'midias_origem'), 2);
});

test('edicao guarda o original uma vez; apagada fica marcada e o texto continua guardado', () => {
  const { db, escuta } = novo();
  escuta.mensagens([m('D1', { conversation: 'versao 1' })], 'notify');
  const e1 = escuta.atualizacoes([up('D1', { message: { editedMessage: { message: { conversation: 'versao 2' } } } })]);
  assert.equal(e1.editadas, 1);
  escuta.atualizacoes([up('D1', { message: { editedMessage: { message: { conversation: 'versao 3' } } } })]);
  const r = db.prepare("SELECT texto, texto_original, estado FROM mensagens WHERE wa_msg_id = 'D1'").get() as { texto: string; texto_original: string; estado: string };
  assert.deepEqual({ ...r }, { texto: 'versao 3', texto_original: 'versao 1', estado: 'editada' });
  const a = escuta.atualizacoes([up('D1', { message: null, messageStubType: 1 })]);
  assert.equal(a.apagadas, 1);
  const f = db.prepare("SELECT texto, estado FROM mensagens WHERE wa_msg_id = 'D1'").get() as { texto: string; estado: string };
  assert.deepEqual({ ...f }, { texto: 'versao 3', estado: 'apagada' }, 'nunca remove: so marca');
  assert.equal(contar(db, 'mensagens'), 1);
});

test('edicao/apagada de mensagem que nunca chegou (ex.: antes do historico): contada como "nao encontrada", sem erro', () => {
  const { escuta } = novo();
  const r = escuta.atualizacoes([up('NUNCA', { message: null, messageStubType: 1 }), up('NUNCA2', { message: { editedMessage: { message: { conversation: 'x' } } } })]);
  assert.equal(r.naoEncontradas, 2);
  assert.equal(r.apagadas + r.editadas, 0);
});

test('recibos e reacoes em messages.update nao fazem nada e nao quebram', () => {
  const { escuta } = novo();
  const r = escuta.atualizacoes([up('Z', { status: 3 }), up('Z', { pollUpdates: [] })]);
  assert.deepEqual({ e: r.editadas, a: r.apagadas, n: r.naoEncontradas, i: r.ignoradas.total }, { e: 0, a: 0, n: 0, i: 0 });
});

test('self-chat: PN e LID do dono sao a MESMA conversa; mensagem do dono para si e registrada como de_mim', () => {
  const { db, escuta } = novo();
  escuta.mensagens([m('S1', { conversation: 'A1 ja respondi' }, { remoteJid: '5511900000000@s.whatsapp.net', fromMe: true })], 'notify');
  escuta.mensagens([m('S2', { conversation: 'F2 nao e potencial' }, { remoteJid: '999888777666555@lid', fromMe: true })], 'notify');
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'self'").get() as { n: number }).n, 1);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM mensagens WHERE de_mim = 1').get() as { n: number }).n, 2);
});

test('contadores acumulam entre chamadas (resumo para os relatorios de problema)', () => {
  const { escuta } = novo();
  escuta.mensagens([m('E1', { conversation: 'a' })], 'notify');
  escuta.mensagens([m('E2', { conversation: 'b' }), m('E1', { conversation: 'a' })], 'notify');
  const t = escuta.totais();
  assert.deepEqual({ ins: t.inseridas, dup: t.duplicadas }, { ins: 2, dup: 1 });
  assert.equal(t.ultimaMensagemEm, 1_760_000_000_000);
});

test('uma falha de gravacao numa mensagem desfaz SO aquela mensagem (savepoint) e o lote continua', () => {
  const { db, escuta } = novo();
  // sabotagem: tabela de midias_origem some; a mensagem de audio falha ao enfileirar, as demais entram
  db.exec('DROP TABLE midias_origem');
  const r = escuta.mensagens([m('F1', { conversation: 'antes' }), m('F2', { audioMessage: { ptt: true } }), m('F3', { conversation: 'depois' })], 'notify');
  assert.equal(r.inseridas, 2);
  assert.equal(r.falhas, 1);
  const ids = (db.prepare('SELECT wa_msg_id FROM mensagens ORDER BY id').all() as { wa_msg_id: string }[]).map((x) => x.wa_msg_id);
  assert.deepEqual(ids, ['F1', 'F3'], 'a mensagem que falhou nao ficou pela metade');
});

// ---- contatos, mapeamentos PN<->LID e nomes de conversa (vem junto do historico: messaging-history.set) ----
test('mapeamento PN<->LID liga as duas formas ao MESMO contato, mesmo antes de existir mensagem', () => {
  const { db, escuta } = novo();
  escuta.mapeamentos([{ pn: '5511999990003@s.whatsapp.net', lid: '555444333222111@lid' }]);
  escuta.mensagens([m('M1', { conversation: 'pelo pn' }, { remoteJid: '5511999990003@s.whatsapp.net' }), m('M2', { conversation: 'pelo lid' }, { remoteJid: '555444333222111@lid' })], 'notify');
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'dm'").get() as { n: number }).n, 1, 'uma conversa so');
  assert.equal(contar(db, 'contatos'), 1);
  escuta.mapeamentos([{ pn: '5511999990003@s.whatsapp.net', lid: '555444333222111@lid' }]); // repetir nao muda
  assert.equal(contar(db, 'contatos'), 1);
});

test('mapeamento invalido (jid quebrado, os dois PN) e ignorado sem erro', () => {
  const { db, escuta } = novo();
  escuta.mapeamentos([{ pn: 'lixo', lid: 'x@lid' }, { pn: '5511999990004@s.whatsapp.net', lid: '5511999990005@s.whatsapp.net' }, { pn: '', lid: '' }]);
  assert.equal(contar(db, 'contatos'), 0);
});

test('nomes de contato do historico preenchem so quem ainda nao tem nome; nunca sobrescrevem o cadastro', () => {
  const { db, escuta } = novo();
  escuta.mensagens([m('N1', { conversation: 'oi' }, { remoteJid: '5511999990006@s.whatsapp.net' })], 'notify');
  db.prepare("UPDATE contatos SET nome = NULL").run();
  escuta.contatos([{ id: '5511999990006@s.whatsapp.net', name: 'Marina (agenda)', notify: 'Marina' }]);
  assert.equal((db.prepare('SELECT nome FROM contatos').get() as { nome: string }).nome, 'Marina (agenda)');
  db.prepare("UPDATE contatos SET nome = 'Nome do cadastro', papel_fonte = 'cadastro'").run();
  escuta.contatos([{ id: '5511999990006@s.whatsapp.net', name: 'Outro nome' }]);
  assert.equal((db.prepare('SELECT nome FROM contatos').get() as { nome: string }).nome, 'Nome do cadastro');
  assert.equal(contar(db, 'contatos'), 1, 'contato desconhecido nao e criado so por constar na agenda');
  escuta.contatos([{ id: '5511999990099@s.whatsapp.net', name: 'Sem conversa' }]);
  assert.equal(contar(db, 'contatos'), 1);
});

test('nome de grupo vindo das conversas do historico', () => {
  const { db, escuta } = novo();
  escuta.mensagens([m('G1', { conversation: 'oi grupo' }, { remoteJid: '120363000000000009@g.us', participant: '5511999990007@s.whatsapp.net' })], 'notify');
  escuta.conversas([{ id: '120363000000000009@g.us', name: 'Obra Fabrica Norte' }, { id: '5511999990007@s.whatsapp.net', name: 'nao e grupo' }]);
  assert.equal((db.prepare("SELECT nome FROM conversas WHERE tipo = 'grupo'").get() as { nome: string }).nome, 'Obra Fabrica Norte');
});

const pendentes = (db: ReturnType<typeof novo>['db']) => (db.prepare('SELECT COUNT(*) AS n FROM alteracoes_pendentes WHERE aplicada_em IS NULL').get() as { n: number }).n;
// Ressincronizacao: durante a carga do historico o WhatsApp pode entregar a edicao/apagada ANTES da mensagem original (LICOES.md, 2026-10-21).
test('edicao que chega antes da mensagem original e guardada e aplicada quando a original entra', () => {
  const { db, escuta } = novo();
  const r0 = escuta.atualizacoes([up('P1', { message: { editedMessage: { message: { conversation: 'texto corrigido' } } } })]);
  assert.equal(r0.naoEncontradas, 1);
  assert.equal(contar(db, 'mensagens'), 0, 'a edicao sozinha nao cria mensagem');
  escuta.mensagens([m('P1', { conversation: 'texto original' })], 'historico');
  const l = db.prepare("SELECT texto, texto_original AS o, estado FROM mensagens WHERE wa_msg_id = 'P1'").get() as { texto: string; o: string; estado: string };
  assert.deepEqual({ ...l }, { texto: 'texto corrigido', o: 'texto original', estado: 'editada' });
  assert.equal(pendentes(db), 0, 'depois de aplicada, a pendencia fica marcada como aplicada (nada e apagado)');
});

test('apagada que chega antes da mensagem original: a mensagem entra ja marcada como apagada (o texto continua guardado)', () => {
  const { db, escuta } = novo();
  escuta.atualizacoes([up('P2', { message: null, messageStubType: 1 })]);
  escuta.mensagens([m('P2', { conversation: 'texto que foi apagado' })], 'historico');
  const l = db.prepare("SELECT texto, estado FROM mensagens WHERE wa_msg_id = 'P2'").get() as { texto: string; estado: string };
  assert.deepEqual({ ...l }, { texto: 'texto que foi apagado', estado: 'apagada' });
});

test('varias edicoes antes da original: vale a ultima recebida; a mesma original de novo nao reaplica nada', () => {
  const { db, escuta } = novo();
  escuta.atualizacoes([up('P3', { message: { editedMessage: { message: { conversation: 'primeira edicao' } } } })]);
  escuta.atualizacoes([up('P3', { message: { editedMessage: { message: { conversation: 'segunda edicao' } } } })]);
  assert.equal(contar(db, 'alteracoes_pendentes'), 1, 'uma pendencia por mensagem e tipo');
  assert.equal(pendentes(db), 1);
  escuta.mensagens([m('P3', { conversation: 'original' })], 'historico');
  escuta.mensagens([m('P3', { conversation: 'original' })], 'historico');
  const l = db.prepare("SELECT texto, texto_original AS o FROM mensagens WHERE wa_msg_id = 'P3'").get() as { texto: string; o: string };
  assert.deepEqual({ ...l }, { texto: 'segunda edicao', o: 'original' });
});

test('edicao de uma mensagem que nunca chega fica so como pendencia (nao inventa mensagem) e a pendencia de outra conversa nao e aplicada por engano', () => {
  const { db, escuta } = novo();
  escuta.atualizacoes([up('P4', { message: { editedMessage: { message: { conversation: 'x' } } } }, '5511999990002@s.whatsapp.net')]);
  escuta.mensagens([m('P4', { conversation: 'mesma id, outro cliente' })], 'historico'); // CLIENTE (0001), nao o 0002
  const l = db.prepare("SELECT texto, estado FROM mensagens WHERE wa_msg_id = 'P4'").get() as { texto: string; estado: string };
  assert.deepEqual({ ...l }, { texto: 'mesma id, outro cliente', estado: 'ativa' });
  assert.equal(pendentes(db), 1, 'a pendencia do outro cliente continua esperando');
});
