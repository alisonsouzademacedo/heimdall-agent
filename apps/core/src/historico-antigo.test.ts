// Historico antigo sob demanda (fetchMessageHistory): estado por conversa, retomada e idempotencia. Dados sinteticos; nenhum socket aqui.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { lerConfigHistorico, gravarConfigHistorico, proximoPedido, iniciarPedido, concluirPedido, falharPedido, resumoHistoricoAntigo, PRAZO_PEDIDO_PRESO_MS } from './historico-antigo.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const T0 = 1_760_000_000_000;
const A = '5511999990001@s.whatsapp.net';
const B = '5511999990002@s.whatsapp.net';
const GRUPO = '120363000000000001@g.us';
function novo() {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => T0 });
  const msg = (id: string, jid: string, tsSeg: number, fromMe = false) => escuta.mensagens([{ key: { id, remoteJid: jid, fromMe, ...(jid.endsWith('@g.us') ? { participant: A } : {}) }, message: { conversation: `texto ${id}` }, messageTimestamp: tsSeg }], 'historico');
  return { db, escuta, msg };
}
const seg = (dias: number) => Math.floor(T0 / 1000) - dias * 86400;
const cfg = (db: Banco, extra = {}) => gravarConfigHistorico(db, { liberado: true, ...extra });

test('configuracao: por padrao o historico antigo NAO roda (o dono libera e escolhe o ritmo)', () => {
  const { db } = novo();
  const c = lerConfigHistorico(db);
  assert.equal(c.liberado, false);
  assert.ok(c.ritmoMs >= 15_000, 'ritmo conservador por padrao');
  assert.ok(c.tamanhoPagina <= 50);
  assert.equal(proximoPedido(db, T0), null, 'trava fechada: nenhum pedido');
  cfg(db, { ritmoMs: 40_000 });
  assert.equal(lerConfigHistorico(db).ritmoMs, 40_000);
});

test('resumo ANTES de liberar: conta todas as conversas elegiveis como pendentes (a tela mostra o tamanho real)', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10)); msg('B1', B, seg(20)); msg('G1', GRUPO, seg(30)); msg('S1', DONO.pn, seg(5), true);
  const r = resumoHistoricoAntigo(db);
  assert.equal(r.conversas, 3, 'dm e grupo entram; self-chat fica de fora');
  assert.equal(r.pendentes, 3, 'nada foi pedido ainda');
  assert.equal(r.concluidas + r.esgotadas + r.emAndamento, 0);
});

test('pede mensagens mais antigas que a mais antiga guardada (chave e data em milissegundos); self-chat e conversa sem mensagem ficam de fora', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(1)); msg('A2', A, seg(5), true); msg('A3', A, seg(3));
  msg('G1', GRUPO, seg(2));
  msg('S1', DONO.pn, seg(1), true);
  cfg(db);
  const p = proximoPedido(db, T0)!;
  assert.equal(p.remoteJid, A);
  assert.deepEqual(p.chave, { remoteJid: A, fromMe: true, id: 'A2' });
  assert.equal(p.tsMs, seg(5) * 1000);
  assert.equal(p.count, lerConfigHistorico(db).tamanhoPagina);
  iniciarPedido(db, p.conversaId, T0);
  const g = proximoPedido(db, T0 + 1)!;
  assert.equal(g.remoteJid, GRUPO, 'grupo tambem entra');
  iniciarPedido(db, g.conversaId, T0 + 1);
  assert.equal(proximoPedido(db, T0 + 2), null, 'o self-chat nunca e pedido');
  assert.equal(resumoHistoricoAntigo(db).conversas, 2);
});

test('resposta com mensagens antigas: conta as novas e pede a pagina seguinte a partir da NOVA mais antiga; resposta repetida nao duplica', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10));
  cfg(db);
  const p1 = proximoPedido(db, T0)!; iniciarPedido(db, p1.conversaId, T0);
  msg('A0', A, seg(20)); msg('Z9', A, seg(30)); // o aparelho respondeu com 2 mais antigas
  assert.equal(concluirPedido(db, p1.conversaId, T0 + 1000).novas, 2);
  const p2 = proximoPedido(db, T0 + 2000)!;
  assert.equal(p2.chave.id, 'Z9', 'segunda pagina parte da nova mais antiga');
  iniciarPedido(db, p2.conversaId, T0 + 2000);
  msg('A0', A, seg(20)); msg('Z9', A, seg(30)); // a mesma resposta chega de novo
  assert.equal(contar(db, 'mensagens'), 3, 'nenhuma duplicada');
  const r = concluirPedido(db, p2.conversaId, T0 + 3000);
  assert.equal(r.novas, 0);
  assert.equal(resumoHistoricoAntigo(db).novas, 2);
});

test('duas respostas vazias seguidas -> conversa concluida; nao pede mais', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10)); cfg(db);
  for (let i = 0; i < 2; i++) { const p = proximoPedido(db, T0 + i * 1000)!; iniciarPedido(db, p.conversaId, T0 + i * 1000); concluirPedido(db, p.conversaId, T0 + i * 1000 + 500); }
  assert.equal(proximoPedido(db, T0 + 10_000), null);
  assert.deepEqual({ ...resumoHistoricoAntigo(db) }, { ...resumoHistoricoAntigo(db), concluidas: 1, pendentes: 0 });
});

test('limite de paginas por conversa -> esgotada (mesmo que o aparelho ainda devolva coisas)', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10)); cfg(db, { maxPaginas: 2 });
  for (let i = 0; i < 2; i++) { const p = proximoPedido(db, T0 + i * 1000)!; iniciarPedido(db, p.conversaId, T0 + i * 1000); msg(`N${i}`, A, seg(20 + i)); concluirPedido(db, p.conversaId, T0 + i * 1000 + 500); }
  assert.equal(proximoPedido(db, T0 + 10_000), null);
  assert.equal(resumoHistoricoAntigo(db).esgotadas, 1);
});

test('queda no meio: pedido preso volta depois do prazo; o que ja foi concluido nao e pedido de novo', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10)); msg('B1', B, seg(10)); cfg(db);
  const pa = proximoPedido(db, T0)!; iniciarPedido(db, pa.conversaId, T0); concluirPedido(db, pa.conversaId, T0 + 100); // pagina de A concluida (vazia)
  const pb = proximoPedido(db, T0 + 200)!; iniciarPedido(db, pb.conversaId, T0 + 200); // "o processo caiu" com B em andamento
  const logo = proximoPedido(db, T0 + 1000);
  assert.notEqual(logo?.conversaId, pb.conversaId, 'ainda dentro do prazo: nao repete B');
  const depois = proximoPedido(db, T0 + 200 + PRAZO_PEDIDO_PRESO_MS + 1)!;
  assert.ok([pa.conversaId, pb.conversaId].includes(depois.conversaId));
  assert.equal((db.prepare('SELECT pedidos FROM historico_pedidos WHERE conversa_id = ?').get(pa.conversaId) as { pedidos: number }).pedidos, 1, 'A so foi pedida uma vez');
});

test('falha ao enviar o pedido: tenta de novo mais tarde e desiste depois de 3 falhas (sem insistir na conta)', () => {
  const { db, msg } = novo();
  msg('A1', A, seg(10)); cfg(db);
  for (let i = 0; i < 3; i++) { const p = proximoPedido(db, T0 + i * 100_000)!; iniciarPedido(db, p.conversaId, T0 + i * 100_000); falharPedido(db, p.conversaId, T0 + i * 100_000 + 1); }
  assert.equal(proximoPedido(db, T0 + 10_000_000), null);
  assert.equal(resumoHistoricoAntigo(db).esgotadas, 1);
});
