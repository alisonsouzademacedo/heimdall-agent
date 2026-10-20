// Laco da memoria: agenda os dias fechados de tempos em tempos e envia um trabalho "retain" por vez. Porta falsa, relogio falso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { resumoDaFila } from '../../core/src/fila.ts';
import type { ItemRetain } from '../../core/src/memoria.ts';
import { rodarCiclo, iniciarMemoria } from './ciclo.ts';
import { lerServicos } from '../../core/src/whatsapp/estado.ts';

const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
const HOJE = D10 + 30 * 3_600_000;
function cenario() {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => HOJE });
  escuta.mensagens([{ key: { id: 'A', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
  const enviados: ItemRetain[] = [];
  return { db, enviados, porta: { reter: async (i: ItemRetain) => { enviados.push(i); } } };
}

test('rodarCiclo: agenda, envia e depois fica vazio', async () => {
  const c = cenario();
  assert.equal(await rodarCiclo(c.db, c.porta, HOJE), 'ok');
  assert.equal(c.enviados.length, 1);
  assert.equal(await rodarCiclo(c.db, c.porta, HOJE + 1), 'vazio');
  assert.equal(resumoDaFila(c.db).ok, 1);
});

test('iniciarMemoria: recupera trabalho travado, agenda de tempos em tempos e para quando pedido', async () => {
  const c = cenario();
  c.db.prepare("INSERT INTO fila (tipo, referencia, estado, tentativas, proximo_em, criado_em, atualizado_em) VALUES ('retain','conv:1:2025-10-10','em_andamento',1,0,0,0)").run();
  let t = HOJE; const esperas: number[] = [];
  const m = iniciarMemoria({ banco: c.db, porta: c.porta, agora: () => t, intervaloMs: 5000, esperar: async (ms) => { esperas.push(ms); t += ms; if (esperas.length >= 2) m.parar(); } });
  await m.terminou;
  assert.equal(c.enviados.length, 1, 'o travado foi recuperado e enviado uma vez so');
  assert.deepEqual(esperas, [5000, 5000]);
});

test('porta fora do ar: o laco continua vivo e o trabalho fica para depois', async () => {
  const c = cenario();
  const fora = { reter: async () => { throw new Error('recusou'); } };
  assert.equal(await rodarCiclo(c.db, fora, HOJE), 'reagendada');
  assert.equal(await rodarCiclo(c.db, fora, HOJE + 1000), 'vazio', 'ainda dentro da espera da fila');
});

test('laco: anota se o Hindsight responde (a tela mostra); erro ao checar vira "sem resposta" e o laco continua', async () => {
  const c = cenario();
  const respostas = [true, false];
  const m = iniciarMemoria({ banco: c.db, porta: c.porta, saudeHindsight: async () => { const r = respostas.shift(); if (r === undefined) throw new Error('caiu'); return r; }, agora: () => HOJE, intervaloMs: 1, esperar: async () => { if (!respostas.length) m.parar(); } });
  await m.terminou;
  assert.deepEqual(lerServicos(c.db), { hindsight: { ok: false, em: HOJE } });
});
