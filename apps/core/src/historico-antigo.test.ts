// Historico antigo sob demanda (fetchMessageHistory): estado por conversa, retomada e idempotencia. Dados sinteticos; nenhum socket aqui.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { lerConfigHistorico, gravarConfigHistorico, proximoPedido, iniciarPedido, concluirPedido, falharPedido, resumoHistoricoAntigo, PRAZO_PEDIDO_PRESO_MS, LIMITE_VAZIAS_SEGUIDAS, LIMITE_FALHAS_SEGUIDAS } from './historico-antigo.ts';

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

// ---- Freio global (2026-10-23): o celular ja mostrou que nao tem mais historico -> nao esperar 2 respostas vazias de CADA conversa (~39 h) ----
function conversas(n: number) {
  const x = novo();
  for (let i = 0; i < n; i++) x.msg(`C${i}`, `551199999${String(1000 + i)}@s.whatsapp.net`, seg(1 + i));
  return x;
}
function pedir(db: Banco, agora: number, quantasNovas = 0): string | null {
  const p = proximoPedido(db, agora);
  if (!p) return null;
  iniciarPedido(db, p.conversaId, agora);
  if (quantasNovas > 0) for (let k = 0; k < quantasNovas; k++) db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, texto, origem_evento) VALUES (?, ?, 0, ?, 'texto', 'antiga', 'historico')").run(p.conversaId, `ANT-${agora}-${k}`, p.tsMs - 1000 * (k + 1));
  const r = concluirPedido(db, p.conversaId, agora);
  return r.estado;
}

test('freio: com N respostas vazias seguidas (de conversas diferentes) a busca se encerra sozinha e o resto vira "esgotada" (sem esperar 2 por conversa)', () => {
  const { db } = conversas(25);
  cfg(db);
  let t = T0;
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS - 1; i++) { pedir(db, t += 60_000); assert.equal(lerConfigHistorico(db).liberado, true, `ainda no pedido ${i + 1}`); }
  assert.equal(resumoHistoricoAntigo(db).encerrada, null);
  pedir(db, t += 60_000); // a N-esima resposta vazia
  const r = resumoHistoricoAntigo(db);
  assert.equal(lerConfigHistorico(db).liberado, false, 'para de pedir');
  assert.equal(r.encerrada, 'sem_retorno');
  assert.deepEqual({ pendentes: r.pendentes, emAndamento: r.emAndamento, pedidos: r.pedidos }, { pendentes: 0, emAndamento: 0, pedidos: LIMITE_VAZIAS_SEGUIDAS }, 'so os N pedidos foram feitos; as 25 conversas estao resolvidas');
  assert.equal(r.esgotadas, 25, 'todas viram "esgotada" (nao ha mais o que pedir)');
  assert.equal(proximoPedido(db, t + 1), null);
});

test('freio: uma resposta que TRAZ mensagens antigas zera a contagem (a busca continua enquanto o celular devolver algo)', () => {
  const { db } = conversas(40);
  cfg(db);
  let t = T0;
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS - 1; i++) pedir(db, t += 60_000);
  pedir(db, t += 60_000, 3); // trouxe mensagens: zera
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS - 1; i++) { pedir(db, t += 60_000); assert.equal(resumoHistoricoAntigo(db).encerrada, null); }
  assert.equal(lerConfigHistorico(db).liberado, true);
  pedir(db, t += 60_000);
  assert.equal(resumoHistoricoAntigo(db).encerrada, 'sem_retorno');
});

test('freio: conversa ja concluida continua concluida (o encerramento so resolve o que estava pendente)', () => {
  const { db } = conversas(25);
  cfg(db);
  let t = T0;
  // duas vazias seguidas na MESMA conversa a concluem; depois o freio encerra o resto
  const p = proximoPedido(db, t)!; iniciarPedido(db, p.conversaId, t); concluirPedido(db, p.conversaId, t);
  db.prepare("UPDATE historico_pedidos SET estado = 'pendente' WHERE conversa_id = ?").run(p.conversaId);
  iniciarPedido(db, p.conversaId, t); assert.equal(concluirPedido(db, p.conversaId, t).estado, 'concluida');
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS; i++) pedir(db, t += 60_000);
  const r = resumoHistoricoAntigo(db);
  assert.equal(r.encerrada, 'sem_retorno');
  assert.equal(r.concluidas, 1); assert.equal(r.esgotadas, 24);
});

test('freio de seguranca: varias falhas seguidas (o celular nao responde) PAUSAM a busca sem descartar nada', () => {
  const { db } = conversas(12);
  cfg(db);
  let t = T0;
  for (let i = 0; i < LIMITE_FALHAS_SEGUIDAS; i++) {
    const p = proximoPedido(db, t += 600_000)!; iniciarPedido(db, p.conversaId, t); falharPedido(db, p.conversaId, t);
  }
  const r = resumoHistoricoAntigo(db);
  assert.equal(lerConfigHistorico(db).liberado, false);
  assert.equal(r.encerrada, 'sem_resposta');
  assert.equal(r.esgotadas, 0, 'nada foi descartado: so pausou');
  assert.ok(r.pendentes > 0);
});

test('liberar de novo recomeca: zera as contagens e limpa o aviso de encerramento', () => {
  const { db } = conversas(25);
  cfg(db);
  let t = T0;
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS; i++) pedir(db, t += 60_000);
  assert.equal(resumoHistoricoAntigo(db).encerrada, 'sem_retorno');
  cfg(db); // o dono libera outra vez
  assert.equal(resumoHistoricoAntigo(db).encerrada, null);
  assert.equal(lerConfigHistorico(db).liberado, true);
});

// ---- Amostra mais forte (2026-10-23): o freio concluiu "o celular nao tem historico" com 10 conversas quaisquer, e o dono sabe que ha mensagens de nov/2025 ----
test('o pedido vai primeiro as conversas com MAIS mensagens (mais chance de ter historico antigo); entre iguais, a ordem de sempre', () => {
  const { db, msg } = novo();
  msg('P1', '5511999991001@s.whatsapp.net', seg(1));                                                       // 1 mensagem
  for (let i = 0; i < 5; i++) msg(`G${i}`, '5511999991002@s.whatsapp.net', seg(1 + i));                    // 5 mensagens
  for (let i = 0; i < 3; i++) msg(`M${i}`, '5511999991003@s.whatsapp.net', seg(1 + i));                    // 3 mensagens
  cfg(db);
  const jid = (p: ReturnType<typeof proximoPedido>) => p!.remoteJid.split('@')[0];
  const ordem: (string | undefined)[] = [];
  for (let t = T0, i = 0; i < 3; i++) { const p = proximoPedido(db, t += 60_000)!; ordem.push(jid(p)); iniciarPedido(db, p.conversaId, t); concluirPedido(db, p.conversaId, t); }
  assert.deepEqual(ordem, ['5511999991002', '5511999991003', '5511999991001'], 'a maior primeiro');
});

test('liberar de novo depois de a busca encerrar sozinha reabre so as conversas que NUNCA foram pedidas; as ja testadas continuam como estao', () => {
  const { db } = conversas(25);
  cfg(db);
  let t = T0;
  for (let i = 0; i < LIMITE_VAZIAS_SEGUIDAS; i++) pedir(db, t += 60_000);
  const antes = resumoHistoricoAntigo(db);
  assert.equal(antes.encerrada, 'sem_retorno');
  assert.equal(antes.esgotadas, 25);
  cfg(db); // o dono libera outra vez
  const depois = resumoHistoricoAntigo(db);
  assert.equal(depois.esgotadas, LIMITE_VAZIAS_SEGUIDAS, 'as 10 que foram pedidas e voltaram vazias seguem como estao');
  assert.equal(depois.pendentes, 25 - LIMITE_VAZIAS_SEGUIDAS, 'as 15 que nunca foram pedidas voltam a ser pedidas');
  assert.equal(depois.encerrada, null);
  assert.ok(proximoPedido(db, t + 60_000), 'ha o que pedir de novo');
});
