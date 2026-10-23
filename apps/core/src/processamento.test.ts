import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { definirExtracaoLiberada } from './extracao.ts';
import { registrarConsumo, definirTetoDiario } from './consumo.ts';
import { definirModelo } from './modelos.ts';
import { enfileirar, pegarProximo, concluir, falhar } from './fila.ts';
import { estadoDoProcessamento, iniciarRodada } from './processamento.ts';

const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
const HOJE = D10 + 30 * 3_600_000; // 2025-10-11 21:00 em Sao Paulo

// Um cliente com N dias fechados de conversa (cada dia vira uma consulta ao modelo).
function cenario(dias: number): Banco {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => HOJE });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  for (let i = 0; i < dias; i++) {
    escuta.mensagens([{ key: { id: `M${i}`, remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { conversation: `oi ${i}` }, messageTimestamp: Math.floor((D10 - i * 86_400_000) / 1000) }], 'notify');
  }
  db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = '5511999990001@s.whatsapp.net')").run();
  return db;
}

test('sem nenhum cliente cadastrado a tela sabe dizer que nao ha o que processar (0 clientes, 0 consultas)', () => {
  const db = abrirBanco(); migrar(db);
  const e = estadoDoProcessamento(db, HOJE);
  assert.equal(e.clientes, 0);
  assert.equal(e.consultasPrevistas, 0);
  assert.equal(e.rodada, null);
  assert.equal(e.estimativa, null);
});

test('conta dias novos, rodada, progresso, consumo, media, estimativa, teto e modelos', () => {
  const db = cenario(4);
  const e0 = estadoDoProcessamento(db, HOJE);
  assert.deepEqual({ c: e0.clientes, novos: e0.diasNovos, previstas: e0.consultasPrevistas, lib: e0.liberada }, { c: 1, novos: 4, previstas: 4, lib: false });
  definirExtracaoLiberada(db, true);
  iniciarRodada(db, HOJE);
  assert.deepEqual({ ...estadoDoProcessamento(db, HOJE).rodada }, { inicio: HOJE, total: 4, concluidas: 0, falhas: 0, percentual: 0 });
  // dois dias enfileirados: um concluido, outro desiste
  for (const ref of ['ext:1:a', 'ext:1:b', 'ext:1:c']) enfileirar(db, 'extrair', ref, HOJE);
  const j1 = pegarProximo(db, ['extrair'], HOJE)!; concluir(db, j1.id, HOJE + 1000);
  const j2 = pegarProximo(db, ['extrair'], HOJE)!; falhar(db, j2.id, 'x', HOJE + 2000, { definitiva: true });
  for (let i = 0; i < 3; i++) registrarConsumo(db, { tarefa: 'extracao', modelo: 'gpt-6-luna', entrada: 2400, saida: 100, ms: 5000 }, HOJE + 3000);
  definirTetoDiario(db, 100_000);
  definirModelo(db, 'relatorio', { model: 'gpt-6.1-sol', esforco: 'medium' });
  const e = estadoDoProcessamento(db, HOJE + 4000);
  assert.deepEqual({ ...e.rodada }, { inicio: HOJE, total: 4, concluidas: 1, falhas: 1, percentual: 50 });
  assert.deepEqual(e.consumo.hoje.extracao, { chamadas: 3, entrada: 7200, saida: 300 });
  assert.deepEqual(e.media, { amostras: 3, entrada: 2400, saida: 100, ms: 5000 });
  assert.deepEqual(e.teto, { diario: 100_000, usadoHoje: 7500, atingido: false });
  assert.equal(e.modelos.relatorio.model, 'gpt-6.1-sol');
  assert.equal(e.modelos.conversa.model, 'gpt-6-luna');
  // estimativa = o que falta (dias novos + refeitos + fila) x a media medida; so com amostras suficientes
  assert.ok(e.estimativa !== null);
  assert.equal(e.estimativa!.consultasRestantes, e.diasNovos + e.diasRefeitos + e.naFila);
  assert.equal(e.estimativa!.tokens, e.estimativa!.consultasRestantes * 2500);
  assert.equal(e.estimativa!.minutos, Math.round((e.estimativa!.consultasRestantes * 5000) / 60000));
});

test('estimativa so aparece com pelo menos 3 consultas medidas (antes disso seria chute)', () => {
  const db = cenario(3);
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 2400, saida: 100, ms: 5000 }, HOJE);
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 2400, saida: 100, ms: 5000 }, HOJE);
  assert.equal(estadoDoProcessamento(db, HOJE).estimativa, null);
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 2400, saida: 100, ms: 5000 }, HOJE);
  assert.notEqual(estadoDoProcessamento(db, HOJE).estimativa, null);
});

test('liberar de novo retoma a rodada que nao terminou; rodada terminada vira uma nova', () => {
  const db = cenario(2);
  iniciarRodada(db, HOJE);
  assert.equal(estadoDoProcessamento(db, HOJE).rodada!.inicio, HOJE);
  iniciarRodada(db, HOJE + 5000); // pausou e liberou: a rodada continua
  assert.equal(estadoDoProcessamento(db, HOJE + 5000).rodada!.inicio, HOJE, 'retoma de onde parou');
  for (const ref of ['ext:1:a', 'ext:1:b']) { enfileirar(db, 'extrair', ref, HOJE); concluir(db, pegarProximo(db, ['extrair'], HOJE)!.id, HOJE + 6000); }
  assert.equal(estadoDoProcessamento(db, HOJE + 7000).rodada!.percentual, 100);
  iniciarRodada(db, HOJE + 9000);
  assert.equal(estadoDoProcessamento(db, HOJE + 9000).rodada!.inicio, HOJE + 9000, 'terminada: comeca outra');
});

test('teto atingido aparece como tal', () => {
  const db = cenario(1);
  definirTetoDiario(db, 10_000);
  registrarConsumo(db, { tarefa: 'extracao', modelo: null, entrada: 10_000, saida: 1, ms: 1 }, HOJE);
  assert.equal(estadoDoProcessamento(db, HOJE).teto.atingido, true);
});

test('candidatos: conta os contatos que responderam e ainda nao sao clientes (so conta, nao cadastra)', () => {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => HOJE });
  escuta.mensagens([{ key: { id: 'X1', remoteJid: '5511999990009@s.whatsapp.net', fromMe: true }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
  escuta.mensagens([{ key: { id: 'X2', remoteJid: '5511999990009@s.whatsapp.net', fromMe: false }, message: { conversation: 'oi, aqui e a Bia da Padaria' }, messageTimestamp: Math.floor(D10 / 1000) + 60 }], 'notify');
  const e = estadoDoProcessamento(db, HOJE);
  assert.deepEqual({ candidatos: e.candidatos, clientes: e.clientes }, { candidatos: 1, clientes: 0 });
});
