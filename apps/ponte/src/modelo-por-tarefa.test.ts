import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { definirModelo } from '../../core/src/modelos.ts';
import { escolhaDeModelo, consumoParaBanco } from './modelo-por-tarefa.ts';
import { resumoDeConsumo } from '../../core/src/consumo.ts';

test('a escolha de modelo sai do banco a cada pedido: muda na tela, vale no pedido seguinte, sem reiniciar a ponte', () => {
  const db = abrirBanco(); migrar(db);
  const escolher = escolhaDeModelo(db);
  assert.deepEqual(escolher('heimdall:self-chat'), { model: 'gpt-6-luna', provider: 'openai-codex', esforco: 'low' });
  assert.equal(escolher('heimdall:relatorios'), undefined, 'relatorio fica no padrao do Hermes');
  definirModelo(db, 'relatorio', { model: 'gpt-6.1-sol', esforco: 'medium' });
  assert.deepEqual(escolher('heimdall:relatorios'), { model: 'gpt-6.1-sol', provider: 'openai-codex', esforco: 'medium' });
  definirModelo(db, 'conversa', { model: null, esforco: null });
  assert.equal(escolher('heimdall:self-chat'), undefined);
});

test('o consumo vai para o banco com a tarefa certa (pela sessao), so numeros', () => {
  const db = abrirBanco(); migrar(db);
  const anotar = consumoParaBanco(db, () => Date.UTC(2026, 9, 23, 15));
  anotar({ sessao: 'heimdall:extracao:ext:1:2026-10-20', entrada: 2500, saida: 200, modelo: 'gpt-6-luna', ms: 4000 });
  anotar({ sessao: 'heimdall:self-chat', entrada: 2300, saida: 30, modelo: null, ms: 3000 });
  const r = resumoDeConsumo(db, Date.UTC(2026, 9, 23, 15));
  assert.deepEqual(r.hoje.extracao, { chamadas: 1, entrada: 2500, saida: 200 });
  assert.deepEqual(r.hoje.conversa, { chamadas: 1, entrada: 2300, saida: 30 });
});
