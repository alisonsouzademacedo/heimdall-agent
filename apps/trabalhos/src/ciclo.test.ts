// Um ciclo do executor: pega UM trabalho de texto da fila, processa e registra o resultado. Nunca mexe em "baixar_midia" (isso e do listener).
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { enfileirar, resumoDaFila } from '../../core/src/fila.ts';
import { rodarCiclo, iniciarExecutor } from './ciclo.ts';
import type { PortasTexto } from '../../core/src/midia.ts';

const T0 = 1_760_000_000_000;
function banco() {
  const db = abrirBanco(); migrar(db);
  db.exec("INSERT INTO conversas (jid, tipo) VALUES ('a@s.whatsapp.net','dm')");
  db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (1,'m1',0,1,'audio','notify')").run();
  db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, bytes, criada_em) VALUES (1,'audio','data/midias/x.ogg','x',1,1)").run();
  db.prepare('INSERT INTO mensagem_midia (mensagem_id, midia_id) VALUES (1,1)').run();
  return db;
}
const portas = (texto: string): PortasTexto => ({ transcrever: async () => ({ texto }), converterPdf: async () => ({ markdown: 'x' }) });

test('fila vazia: nao faz nada', async () => {
  const db = banco();
  assert.equal(await rodarCiclo(db, portas('x'), T0), 'vazio');
});

test('transcreve e grava o texto na mensagem', async () => {
  const db = banco(); enfileirar(db, 'transcrever', '1', T0);
  assert.equal(await rodarCiclo(db, portas('bom dia'), T0), 'ok');
  assert.equal((db.prepare('SELECT texto FROM mensagens').get() as { texto: string }).texto, 'bom dia');
  assert.equal(resumoDaFila(db).ok, 1);
});

test('nao pega baixar_midia, extrair nem retain: isso e de outros processos', async () => {
  const db = banco(); enfileirar(db, 'baixar_midia', '1', T0); enfileirar(db, 'extrair', '1', T0); enfileirar(db, 'retain', '1', T0);
  assert.equal(await rodarCiclo(db, portas('x'), T0), 'vazio');
  assert.equal(resumoDaFila(db).pendente, 3);
});

test('falha reagenda; o executor segue vivo para o proximo ciclo', async () => {
  const db = banco(); enfileirar(db, 'transcrever', '1', T0);
  const ruim: PortasTexto = { transcrever: async () => { throw new Error('erro:docker parado'); }, converterPdf: async () => ({ markdown: '' }) };
  assert.equal(await rodarCiclo(db, ruim, T0), 'reagendada');
  assert.equal(await rodarCiclo(db, ruim, T0 + 1), 'vazio', 'ainda esperando a nova tentativa');
});

test('iniciarExecutor: recupera o que travou numa queda anterior e processa em laco ate parar', async () => {
  const db = banco(); enfileirar(db, 'transcrever', '1', T0);
  db.prepare("UPDATE fila SET estado = 'em_andamento', tentativas = 1, atualizado_em = ?").run(T0 - 3_600_000);
  let agora = T0; const esperas: number[] = [];
  const ex = iniciarExecutor({ banco: db, portas: portas('recuperado'), agora: () => agora, esperar: async (ms) => { esperas.push(ms); agora += ms; if (esperas.length >= 3) ex.parar(); }, intervaloMs: 5000, prazoTravadoMs: 600_000 });
  await ex.terminou;
  assert.equal((db.prepare('SELECT texto FROM mensagens').get() as { texto: string }).texto, 'recuperado');
  assert.ok(esperas.length >= 1 && esperas.every((e) => e === 5000));
});
