import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from './db.ts';
import { registrarConsumo, resumoDeConsumo, mediaDaTarefa, tetoDiario, definirTetoDiario, tetoAtingido, TETO_DIARIO_PADRAO } from './consumo.ts';

const novo = () => { const db = abrirBanco(); migrar(db); return db; };
const T = Date.UTC(2026, 9, 23, 15, 0, 0); // 2026-10-23 12:00 em Sao Paulo
const DIA = 86_400_000;

test('registra so numeros (nunca texto) e soma por tarefa em hoje, na semana e no total', () => {
  const db = novo();
  registrarConsumo(db, { tarefa: 'extracao', modelo: 'gpt-6-luna', entrada: 2300, saida: 150, ms: 4000 }, T);
  registrarConsumo(db, { tarefa: 'extracao', modelo: 'gpt-6-luna', entrada: 2700, saida: 250, ms: 6000 }, T + 1000);
  registrarConsumo(db, { tarefa: 'conversa', modelo: 'gpt-6-luna', entrada: 2280, saida: 20, ms: 3000 }, T + 2000);
  registrarConsumo(db, { tarefa: 'relatorio', modelo: null, entrada: 5000, saida: 900, ms: 20000 }, T - 3 * DIA); // dentro da semana, fora de hoje
  registrarConsumo(db, { tarefa: 'relatorio', modelo: null, entrada: 4000, saida: 800, ms: 15000 }, T - 20 * DIA); // so no total
  const r = resumoDeConsumo(db, T);
  assert.deepEqual(r.hoje.extracao, { chamadas: 2, entrada: 5000, saida: 400 });
  assert.deepEqual(r.hoje.conversa, { chamadas: 1, entrada: 2280, saida: 20 });
  assert.deepEqual(r.hoje.relatorio, { chamadas: 0, entrada: 0, saida: 0 });
  assert.deepEqual(r.semana.relatorio, { chamadas: 1, entrada: 5000, saida: 900 });
  assert.deepEqual(r.total.relatorio, { chamadas: 2, entrada: 9000, saida: 1700 });
  assert.equal(r.hoje.todas.entrada, 7280);
  assert.equal(r.total.todas.chamadas, 5);
  const colunas = (db.prepare('PRAGMA table_info(consumo_modelo)').all() as { name: string }[]).map((c) => c.name);
  assert.ok(!colunas.some((c) => /texto|conteudo|mensagem|resposta|pergunta/i.test(c)), 'a tabela nao tem coluna de conteudo');
});

test('numeros invalidos viram zero (nunca quebram nem gravam lixo)', () => {
  const db = novo();
  registrarConsumo(db, { tarefa: 'teste', modelo: 'x', entrada: Number.NaN, saida: -5, ms: Number.POSITIVE_INFINITY }, T);
  const r = resumoDeConsumo(db, T);
  assert.deepEqual(r.hoje.teste, { chamadas: 1, entrada: 0, saida: 0 });
});

test('media por chamada usa as ultimas amostras da tarefa e diz quantas amostras tem', () => {
  const db = novo();
  assert.deepEqual(mediaDaTarefa(db, 'extracao'), { amostras: 0, entrada: 0, saida: 0, ms: 0 });
  for (const [e, s, ms] of [[1000, 100, 1000], [3000, 300, 3000]] as const) registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: e, saida: s, ms }, T);
  assert.deepEqual(mediaDaTarefa(db, 'extracao'), { amostras: 2, entrada: 2000, saida: 200, ms: 2000 });
  assert.equal(mediaDaTarefa(db, 'extracao', 1).amostras, 1, 'janela das ultimas N');
  assert.equal(mediaDaTarefa(db, 'extracao', 1).entrada, 3000);
});

test('teto diario de tokens da extracao: padrao, validacao e quando e atingido (so conta a extracao de hoje)', () => {
  const db = novo();
  assert.equal(tetoDiario(db), TETO_DIARIO_PADRAO);
  assert.equal(definirTetoDiario(db, 500).ok, false, 'pequeno demais');
  assert.equal(definirTetoDiario(db, 1e12).ok, false, 'grande demais');
  assert.equal(definirTetoDiario(db, Number.NaN).ok, false);
  assert.deepEqual(definirTetoDiario(db, 10_000), { ok: true });
  assert.equal(tetoDiario(db), 10_000);
  registrarConsumo(db, { tarefa: 'conversa', modelo: null, entrada: 50_000, saida: 0, ms: 1 }, T); // outra tarefa: nao conta
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 9_000, saida: 500, ms: 1 }, T - DIA); // ontem: nao conta
  assert.equal(tetoAtingido(db, T), false);
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 9_000, saida: 900, ms: 1 }, T);
  assert.equal(tetoAtingido(db, T), false, '9.900 < 10.000');
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 100, saida: 0, ms: 1 }, T + 1);
  assert.equal(tetoAtingido(db, T + 1), true);
  assert.equal(tetoAtingido(db, T + DIA), false, 'no dia seguinte volta a rodar');
});
