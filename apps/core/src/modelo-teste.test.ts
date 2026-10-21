// Teste de chamada ao modelo (Hermes) pedido pela tela e executado pela PONTE. A tela nunca recebe token nem chave; o resultado guarda so
// ok/falhou, o tempo e um motivo curto, NUNCA o texto da resposta. Sem rede aqui: o Hermes e uma porta falsa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from './db.ts';
import { pedirTesteDoModelo, lerTesteDoModelo, executarTesteDoModelo } from './modelo-teste.ts';

const novo = () => { const db = abrirBanco(); migrar(db); return db; };
const T = 1_760_000_000_000;

test('pedir: nenhum teste ao comeco; pedir marca "pedido"; pedir de novo logo em seguida nao empilha', () => {
  const db = novo();
  assert.equal(lerTesteDoModelo(db).estado, 'nenhum');
  assert.equal(pedirTesteDoModelo(db, T), true);
  assert.equal(lerTesteDoModelo(db).estado, 'pedido');
  assert.equal(pedirTesteDoModelo(db, T + 1000), false);
  assert.equal(pedirTesteDoModelo(db, T + 3 * 60_000), true, 'pedido antigo sem resposta (ponte parada) pode ser refeito');
});

test('executar: so age se ha pedido; chama o modelo UMA vez; guarda ok e o tempo, e nunca o texto da resposta', async () => {
  const db = novo(); let chamadas = 0;
  const porta = { perguntar: async () => { chamadas++; return 'RESPOSTA-SECRETA-DO-MODELO'; } };
  assert.equal(await executarTesteDoModelo(db, porta, T), false, 'sem pedido nao chama');
  pedirTesteDoModelo(db, T);
  assert.equal(await executarTesteDoModelo(db, porta, T + 10), true);
  assert.equal(await executarTesteDoModelo(db, porta, T + 20), false, 'ja respondido');
  const r = lerTesteDoModelo(db);
  assert.deepEqual({ e: r.estado, c: chamadas }, { e: 'ok', c: 1 });
  assert.ok(typeof r.ms === 'number');
  assert.doesNotMatch(JSON.stringify(db.prepare('SELECT * FROM configuracao').all()), /RESPOSTA-SECRETA/);
});

test('executar: falha do modelo (fora do ar, sem login, resposta vazia) vira "falhou" com motivo curto, sem derrubar nada', async () => {
  const db = novo();
  pedirTesteDoModelo(db, T);
  await executarTesteDoModelo(db, { perguntar: async () => { throw new Error('connect ECONNREFUSED 127.0.0.1:8642\nlinha 2 com detalhes'); } }, T + 5);
  const r = lerTesteDoModelo(db);
  assert.equal(r.estado, 'falhou');
  assert.ok(r.motivo && r.motivo.length <= 120 && !/\n/.test(r.motivo));
  pedirTesteDoModelo(db, T + 200_000);
  await executarTesteDoModelo(db, { perguntar: async () => '   ' }, T + 200_010);
  assert.deepEqual({ e: lerTesteDoModelo(db).estado, m: lerTesteDoModelo(db).motivo }, { e: 'falhou', m: 'resposta_vazia' });
});
