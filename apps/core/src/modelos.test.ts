import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from './db.ts';
import { lerModelo, definirModelo, tarefaDaSessao, MODELO_PADRAO, PROVEDOR_DO_MODELO } from './modelos.ts';

const novo = () => { const db = abrirBanco(); migrar(db); return db; };

test('padrao: conversa, extracao e teste usam o modelo barato com raciocinio baixo; relatorio nao muda o modelo do Hermes', () => {
  const db = novo();
  for (const t of ['conversa', 'extracao', 'teste'] as const) assert.deepEqual(lerModelo(db, t), { model: 'gpt-6-luna', esforco: 'low' }, t);
  assert.deepEqual(lerModelo(db, 'relatorio'), { model: null, esforco: null });
  assert.equal(PROVEDOR_DO_MODELO, 'openai-codex');
  assert.deepEqual(MODELO_PADRAO.relatorio, { model: null, esforco: null });
});

test('definir grava por tarefa, valida o formato e a escolha vale na leitura seguinte', () => {
  const db = novo();
  assert.deepEqual(definirModelo(db, 'relatorio', { model: 'gpt-6.1-sol', esforco: 'medium' }), { ok: true });
  assert.deepEqual(lerModelo(db, 'relatorio'), { model: 'gpt-6.1-sol', esforco: 'medium' });
  assert.deepEqual(lerModelo(db, 'conversa'), { model: 'gpt-6-luna', esforco: 'low' }, 'as outras tarefas nao mudam');
  assert.equal(definirModelo(db, 'conversa', { model: 'modelo com espaco', esforco: 'low' }).ok, false);
  assert.equal(definirModelo(db, 'conversa', { model: 'gpt-6-luna', esforco: 'altissimo' as never }).ok, false);
  assert.equal(definirModelo(db, 'conversa', { model: '"; DROP', esforco: null }).ok, false);
  assert.deepEqual(lerModelo(db, 'conversa'), { model: 'gpt-6-luna', esforco: 'low' }, 'recusado nao grava');
  assert.deepEqual(definirModelo(db, 'extracao', { model: null, esforco: null }), { ok: true }, 'null = deixar o padrao do Hermes');
  assert.deepEqual(lerModelo(db, 'extracao'), { model: null, esforco: null });
});

test('valor corrompido no banco volta ao padrao (nunca derruba a ponte)', () => {
  const db = novo();
  db.prepare("INSERT INTO configuracao (chave, valor) VALUES ('modelo.tarefa.conversa', 'isto nao e json')").run();
  assert.deepEqual(lerModelo(db, 'conversa'), { model: 'gpt-6-luna', esforco: 'low' });
});

test('a tarefa vem da chave de sessao: self-chat = conversa, extracao:<ref> = extracao, teste = teste, o resto = relatorio', () => {
  assert.equal(tarefaDaSessao('heimdall:self-chat'), 'conversa');
  assert.equal(tarefaDaSessao('heimdall:extracao:ext:12:2026-10-20'), 'extracao');
  assert.equal(tarefaDaSessao('heimdall:teste-modelo'), 'teste');
  assert.equal(tarefaDaSessao('heimdall:relatorios'), 'relatorio');
  assert.equal(tarefaDaSessao('qualquer:outra'), 'relatorio');
});
