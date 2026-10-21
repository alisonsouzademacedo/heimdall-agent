// O laco que pede o historico antigo ao aparelho do dono: ritmo, parar se desconectar, trava fechada. Socket falso; nada de rede.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { gravarEstado } from '../../core/src/whatsapp/estado.ts';
import { gravarConfigHistorico, resumoHistoricoAntigo } from '../../core/src/historico-antigo.ts';
import { iniciarHistoricoAntigo, type SockHistorico } from './historico-antigo.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const A = '5511999990001@s.whatsapp.net';
const T0 = Date.UTC(2026, 9, 21, 15, 0, 0);

function cenario(conectado = true) {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => T0 });
  const msg = (id: string, tsSeg: number) => escuta.mensagens([{ key: { id, remoteJid: A, fromMe: false }, message: { conversation: `x ${id}` }, messageTimestamp: tsSeg }], 'historico');
  msg('A1', Math.floor(T0 / 1000) - 86400);
  if (conectado) gravarEstado(db, { estado: 'conectado', dono: DONO }, T0);
  return { db, msg };
}
// o "aparelho": responde a cada pedido com as mensagens mais antigas que ele ainda tem
function aparelho(c: { msg: (id: string, ts: number) => unknown }, restantes: { id: string; ts: number }[]) {
  const chamadas: { count: number; id: string; tsMs: number }[] = [];
  const sock: SockHistorico = { fetchMessageHistory: async (count, key, tsMs) => {
    chamadas.push({ count, id: key.id, tsMs });
    for (const m of restantes.splice(0, 2)) c.msg(m.id, m.ts);
    return 'id';
  } };
  return { sock, chamadas };
}
function rodar(db: Banco, sock: () => SockHistorico | null, paradaApos: number) {
  const esperas: number[] = [];
  let h: ReturnType<typeof iniciarHistoricoAntigo>;
  h = iniciarHistoricoAntigo({ banco: db, sock, agora: () => T0, esperar: async (ms) => { esperas.push(ms); if (esperas.length >= paradaApos) h.parar(); } });
  return { h, esperas };
}

test('com a trava fechada (padrao) nenhum pedido e feito', async () => {
  const c = cenario(); const a = aparelho(c, []);
  const { h } = rodar(c.db, () => a.sock, 3); await h.terminou;
  assert.equal(a.chamadas.length, 0);
});

test('liberado e conectado: pede paginas ate o aparelho nao ter mais nada, esperando a resposta e o ritmo entre os pedidos', async () => {
  const c = cenario(); const base = Math.floor(T0 / 1000) - 86400 * 5;
  const a = aparelho(c, [{ id: 'O1', ts: base }, { id: 'O2', ts: base - 10 }, { id: 'O3', ts: base - 20 }]);
  gravarConfigHistorico(c.db, { liberado: true, ritmoMs: 20_000, esperaRespostaMs: 5_000, tamanhoPagina: 2 });
  const { h, esperas } = rodar(c.db, () => a.sock, 40); await h.terminou;
  assert.equal(a.chamadas.length, 4, 'pagina 1 (2 novas), pagina 2 (1 nova), 2 vazias seguidas');
  assert.deepEqual(a.chamadas.map((x) => x.count), [2, 2, 2, 2]);
  assert.equal(a.chamadas[0]!.id, 'A1'); assert.equal(a.chamadas[1]!.id, 'O2', 'a segunda pagina parte da mais antiga recebida');
  assert.ok(esperas.includes(5_000) && esperas.includes(20_000), 'espera a resposta e depois o ritmo');
  const r = resumoHistoricoAntigo(c.db);
  assert.deepEqual({ concluidas: r.concluidas, novas: r.novas }, { concluidas: 1, novas: 3 });
  assert.equal(contar(c.db, 'mensagens'), 4);
});

test('se o WhatsApp deixa de estar conectado, nao pede (e nao gasta tentativa)', async () => {
  const c = cenario(false); const a = aparelho(c, []);
  gravarConfigHistorico(c.db, { liberado: true });
  const { h } = rodar(c.db, () => a.sock, 3); await h.terminou;
  assert.equal(a.chamadas.length, 0);
  gravarEstado(c.db, { estado: 'reconectar', codigo: 428 }, T0);
  const b = rodar(c.db, () => a.sock, 3); await b.h.terminou;
  assert.equal(a.chamadas.length, 0);
});

test('sem socket aberto nao pede; erro ao pedir nao derruba o laco e conta como falha', async () => {
  const c = cenario(); gravarConfigHistorico(c.db, { liberado: true, ritmoMs: 5_000 });
  const x = rodar(c.db, () => null, 3); await x.h.terminou;
  assert.equal(resumoHistoricoAntigo(c.db).pedidos, 0);
  const ruim: SockHistorico = { fetchMessageHistory: async () => { throw new Error('Not authenticated'); } };
  const y = rodar(c.db, () => ruim, 6); await y.h.terminou;
  assert.ok((c.db.prepare('SELECT falhas FROM historico_pedidos').get() as { falhas: number }).falhas >= 1);
});
