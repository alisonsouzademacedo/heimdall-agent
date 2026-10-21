// Envio da conversa ao Hindsight: um documento por conversa por dia FECHADO (docs/plano/fase-1-modelo-de-dados.md). A porta de rede e falsa.
// Dados sinteticos. O Hindsight de verdade e testado em tests/infra (Docker) e, com o modelo real, no roteiro de fumaca.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { pegarProximo, resumoDaFila, concluir } from './fila.ts';
import { FalhaDefinitiva } from './midia.ts';
import { agendarRetain, montarItem, processarRetain, processarApagarMemoria, type ItemRetain, type PortaMemoria } from './memoria.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
// 2025-10-10 12:00 em Sao Paulo (UTC-3) e 2025-10-11 12:00.
const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
const D11 = Date.UTC(2025, 9, 11, 15, 0, 0);
const HOJE = D11 + 3_600_000;
const seg = (ms: number) => Math.floor(ms / 1000);

function cenario() {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => HOJE });
  const texto = (id: string, quando: number, conversation: string, fromMe = false, jid = '5511999990001@s.whatsapp.net', participant?: string) =>
    escuta.mensagens([{ key: { id, remoteJid: jid, fromMe, participant }, message: { conversation }, messageTimestamp: seg(quando), pushName: fromMe ? undefined : 'Ana da Loja' }], 'notify');
  const enviados: ItemRetain[] = [];
  const porta: PortaMemoria = { reter: async (item) => { enviados.push(item); } };
  return { db, escuta, texto, enviados, porta };
}

test('monta o documento: "Nome (hora): fala", em ordem, com marcas de editada/apagada e sem a mensagem ignorada', () => {
  const c = cenario();
  c.texto('M1', D10, 'Oi, quero o orçamento');
  c.texto('M2', D10 + 60_000, 'Claro, envio hoje', true);
  c.texto('M3', D10 + 120_000, 'Pode ser até sexta?');
  c.escuta.atualizacoes([{ key: { id: 'M3', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, update: { message: { editedMessage: { message: { conversation: 'Pode ser até quinta?' } } } } }]);
  c.texto('M4', D10 + 180_000, 'esqueça isso');
  c.escuta.atualizacoes([{ key: { id: 'M4', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, update: { message: null, messageStubType: 1 } }]);
  const item = montarItem(c.db, 'conv:1:2025-10-10')!;
  assert.equal(item.documentId, 'conv:1:2025-10-10');
  assert.equal(item.timestamp, '2025-10-10T23:59:59-03:00');
  assert.match(item.context, /WhatsApp/);
  const linhas = item.content.split('\n');
  assert.equal(linhas.length, 4);
  assert.match(linhas[0]!, /^Ana da Loja \(2025-10-10T12:00:00-03:00\): Oi, quero o orçamento$/);
  assert.match(linhas[1]!, /^Eu \(2025-10-10T12:01:00-03:00\): Claro, envio hoje$/);
  assert.match(linhas[2]!, /: \[editada\] Pode ser até quinta\?$/);
  assert.match(linhas[3]!, /: \[apagada pelo autor\] esqueça isso$/);
  assert.deepEqual(item.tags.filter((t) => t.startsWith('conversa:') || t.startsWith('chat:')), ['conversa:1', 'chat:dm']);
});

test('so dias fechados viram trabalho: o dia de hoje fica de fora e o self-chat nunca entra', () => {
  const c = cenario();
  c.texto('A', D10, 'ontem');
  c.texto('B', D11, 'hoje');
  c.texto('S', D10, 'nota para mim', true, DONO.pn);
  const novos = agendarRetain(c.db, HOJE);
  assert.deepEqual(novos, ['conv:1:2025-10-10']);
  assert.equal(resumoDaFila(c.db).pendente, 1);
  assert.equal(agendarRetain(c.db, HOJE).length, 0, 'segunda varredura: nada novo, nao duplica');
});

test('processar: envia uma vez, grava o hash e nao reenvia o que nao mudou', async () => {
  const c = cenario(); c.texto('A', D10, 'oi');
  agendarRetain(c.db, HOJE);
  const job = pegarProximo(c.db, ['retain'], HOJE)!;
  assert.equal(await processarRetain(c.db, job, c.porta, HOJE), 'ok');
  assert.equal(c.enviados.length, 1);
  const s = c.db.prepare('SELECT tipo, referencia, document_id, hash_conteudo FROM sync_hindsight').get() as Record<string, string>;
  assert.deepEqual({ t: s.tipo, r: s.referencia, d: s.document_id }, { t: 'conv', r: 'conv:1:2025-10-10', d: 'conv:1:2025-10-10' });
  assert.match(s.hash_conteudo!, /^[a-f0-9]{64}$/);
  assert.equal(agendarRetain(c.db, HOJE + 1).length, 0, 'conteudo igual: nao agenda');
});

test('dia ja enviado que muda (mensagem tardia do historico, edicao, apagar) volta para a fila e e reenviado com o mesmo document_id', async () => {
  const c = cenario(); c.texto('A', D10, 'oi');
  agendarRetain(c.db, HOJE);
  await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE)!, c.porta, HOJE);
  c.texto('B', D10 + 1000, 'chegou depois pelo historico');
  assert.deepEqual(agendarRetain(c.db, HOJE + 10), ['conv:1:2025-10-10']);
  await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE + 10)!, c.porta, HOJE + 10);
  assert.equal(c.enviados.length, 2);
  assert.equal(c.enviados[1]!.documentId, c.enviados[0]!.documentId);
  assert.match(c.enviados[1]!.content, /chegou depois/);
});

test('falha da rede reagenda (com a espera da fila); recusa definitiva abandona; nada e marcado como enviado', async () => {
  const c = cenario(); c.texto('A', D10, 'oi');
  agendarRetain(c.db, HOJE);
  const falha: PortaMemoria = { reter: async () => { throw new Error('conexao recusada'); } };
  assert.equal(await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE)!, falha, HOJE), 'reagendada');
  assert.equal(contar(c.db, 'sync_hindsight'), 0);
  const recusa: PortaMemoria = { reter: async () => { throw new FalhaDefinitiva('http_422'); } };
  const job = pegarProximo(c.db, ['retain'], HOJE + 3_600_000)!;
  assert.equal(await processarRetain(c.db, job, recusa, HOJE + 3_600_000), 'abandonada');
  assert.equal(contar(c.db, 'sync_hindsight'), 0);
});

test('referencia desconhecida ou dia sem mensagens: conclui sem enviar nada', async () => {
  const c = cenario();
  c.db.prepare("INSERT INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES ('retain','conv:99:2025-01-01',0,0,0)").run();
  c.db.prepare("INSERT INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES ('retain','lixo',0,0,0)").run();
  for (let i = 0; i < 2; i++) { const j = pegarProximo(c.db, ['retain'], 5)!; await processarRetain(c.db, j, c.porta, 5); }
  assert.equal(c.enviados.length, 0);
  assert.equal(resumoDaFila(c.db).ok + resumoDaFila(c.db).abandonada, 2);
});

test('grupo: remetente pelo nome do participante e etiqueta chat:grupo; mensagem de midia ainda sem texto fica de fora', () => {
  const c = cenario();
  const grupo = '120363000000000001@g.us';
  c.texto('G1', D10, 'bom dia time', false, grupo, '5511988880002@s.whatsapp.net');
  c.escuta.mensagens([{ key: { id: 'G2', remoteJid: grupo, fromMe: false, participant: '5511988880002@s.whatsapp.net' }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: seg(D10 + 5000) }], 'notify', () => '{}');
  const item = montarItem(c.db, 'conv:1:2025-10-10')!;
  assert.equal(item.content.split('\n').length, 1);
  assert.ok(item.tags.includes('chat:grupo'));
});

test('o conteudo da conversa nunca aparece no erro guardado na fila (regra 2)', async () => {
  const c = cenario(); c.texto('A', D10, 'segredo-do-cliente-123');
  agendarRetain(c.db, HOJE);
  const porta: PortaMemoria = { reter: async (i) => { throw new Error(`falhou com ${i.content}`); } };
  await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE)!, porta, HOJE);
  const erro = (c.db.prepare('SELECT erro FROM fila').get() as { erro: string }).erro;
  assert.equal(erro.includes('segredo-do-cliente-123'), false);
  void concluir;
});

test('o self-chat nunca vira documento, nem se um trabalho "retain" for enfileirado por engano para ele', async () => {
  const c = cenario();
  c.texto('S', D10, 'nota para mim mesmo', true, DONO.pn); // conversa 1 = self
  assert.equal(montarItem(c.db, 'conv:1:2025-10-10'), null);
  c.db.prepare("INSERT INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES ('retain','conv:1:2025-10-10',0,0,0)").run();
  assert.equal(await processarRetain(c.db, pegarProximo(c.db, ['retain'], 5)!, c.porta, 5), 'ok');
  assert.equal(c.enviados.length, 0);
});

test('trabalho "retain" de um dia ja enviado e identico conclui sem chamar a porta (nao reenvia por engano)', async () => {
  const c = cenario(); c.texto('A', D10, 'oi');
  agendarRetain(c.db, HOJE);
  await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE)!, c.porta, HOJE);
  assert.equal(c.enviados.length, 1);
  c.db.prepare("UPDATE fila SET estado = 'pendente', tentativas = 0, proximo_em = 0").run(); // o mesmo trabalho volta a fila sem o conteudo ter mudado
  assert.equal(await processarRetain(c.db, pegarProximo(c.db, ['retain'], HOJE + 5)!, c.porta, HOJE + 5), 'ok');
  assert.equal(c.enviados.length, 1, 'nada novo para enviar');
});

test('apagar memoria: documentos pedidos por apagar.ts sao apagados no Hindsight (404 = ja nao existe = feito); falha tenta de novo e desiste depois de 5', async () => {
  const c = cenario();
  const ins = c.db.prepare('INSERT INTO memoria_apagar (document_id, pedido_em) VALUES (?, 1)');
  ins.run('conv:1:2025-10-10'); ins.run('conv:1:2025-10-11'); ins.run('conv:1:2025-10-12');
  const chamados: string[] = [];
  const porta = { apagarDocumento: async (id: string) => { chamados.push(id); if (id.endsWith('11')) throw new Error('hindsight_fora'); return id.endsWith('12') ? 'nao_existia' as const : 'apagado' as const; } };
  assert.equal(await processarApagarMemoria(c.db, porta, 100), 2);
  assert.deepEqual(chamados.sort(), ['conv:1:2025-10-10', 'conv:1:2025-10-11', 'conv:1:2025-10-12']);
  const est = () => Object.fromEntries((c.db.prepare('SELECT document_id AS d, estado AS e, tentativas AS t FROM memoria_apagar').all() as { d: string; e: string; t: number }[]).map((r) => [r.d, `${r.e}/${r.t}`]));
  assert.deepEqual(est(), { 'conv:1:2025-10-10': 'feito/1', 'conv:1:2025-10-11': 'pendente/1', 'conv:1:2025-10-12': 'feito/1' });
  for (let i = 0; i < 6; i++) await processarApagarMemoria(c.db, porta, 100 + i);
  assert.equal(est()['conv:1:2025-10-11'], 'pendente/5', 'depois de 5 tentativas para de insistir (fica visivel como pendente, sem sumir)');
  assert.equal(await processarApagarMemoria(c.db, { apagarDocumento: async () => 'apagado' }, 999), 0, 'o que passou do limite nao e tentado de novo sozinho');
  assert.equal((c.db.prepare("SELECT erro FROM memoria_apagar WHERE document_id = 'conv:1:2025-10-11'").get() as { erro: string }).erro, 'falha_ao_apagar_no_hindsight');
});

test('apagar memoria: id de documento fora do formato conv:<n>:<dia> nunca vai ao Hindsight', async () => {
  const c = cenario();
  c.db.prepare("INSERT INTO memoria_apagar (document_id, pedido_em) VALUES ('../banks/heimdall', 1), ('cadastro:usuario', 1)").run();
  const chamados: string[] = [];
  await processarApagarMemoria(c.db, { apagarDocumento: async (id) => { chamados.push(id); return 'apagado'; } }, 5);
  assert.deepEqual(chamados, []);
  assert.equal((c.db.prepare("SELECT COUNT(*) AS n FROM memoria_apagar WHERE estado = 'feito'").get() as { n: number }).n, 0);
});

// Carga do historico (LICOES.md, 2026-10-21): o que o Hindsight recusou de vez nao pode voltar a cada varredura.
test('recusado de vez (falha definitiva) nao volta para a fila enquanto a conversa nao mudar; se mudar, volta', async () => {
  const c = cenario();
  c.texto('M1', D10, 'Oi, quero o orçamento');
  assert.deepEqual(agendarRetain(c.db, HOJE), ['conv:1:2025-10-10']);
  const job = pegarProximo(c.db, ['retain'], HOJE)!;
  assert.equal(await processarRetain(c.db, job, { reter: async () => { throw new FalhaDefinitiva('conteudo_recusado'); } }, HOJE), 'abandonada');
  assert.deepEqual(agendarRetain(c.db, HOJE + 1000), [], 'mesma conversa: nao adianta mandar de novo');
  c.texto('M2', D10 + 60_000, 'Segue o valor', true);
  assert.deepEqual(agendarRetain(c.db, HOJE + 2000), ['conv:1:2025-10-10'], 'a conversa mudou: tenta de novo');
});
