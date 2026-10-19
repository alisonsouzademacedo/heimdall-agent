import test from 'node:test';
import assert from 'node:assert/strict';
import { diasEntre, diaLocal, diaDaSemana, somarDias, ehDiaUtil, somarDiasUteis, instanteLocal, janelaDiario, janelaSemanal, relatorioDoDia } from './calendario.ts';

const utc = (s: string) => Date.parse(s);

test('dia local respeita o fuso (23:30 de sexta em SP ja e sabado em UTC)', () => {
  const instante = utc('2026-10-24T02:30:00Z'); // sexta 23:30 em Sao Paulo (UTC-3)
  assert.equal(diaLocal(instante), '2026-10-23');
  assert.equal(diaLocal(instante, 'UTC'), '2026-10-24');
});

test('dia da semana e soma de dias', () => {
  assert.equal(diaDaSemana('2026-10-19'), 1); // segunda
  assert.equal(diaDaSemana('2026-10-25'), 0); // domingo
  assert.equal(somarDias('2026-10-31', 1), '2026-11-01');
  assert.equal(somarDias('2026-03-01', -1), '2026-02-28');
  assert.equal(somarDias('2028-02-28', 1), '2028-02-29'); // ano bissexto
});

test('dias uteis: fim de semana e feriados nao contam', () => {
  assert.equal(ehDiaUtil('2026-10-23'), true); // sexta
  assert.equal(ehDiaUtil('2026-10-24'), false); // sabado
  assert.equal(ehDiaUtil('2026-10-25'), false);
  assert.equal(ehDiaUtil('2026-10-23', new Set(['2026-10-23'])), false);
});

test('soma de dias uteis e estrita: sexta + 2 = terca; quarta + 2 = sexta', () => {
  assert.equal(somarDiasUteis('2026-10-23', 2), '2026-10-27');
  assert.equal(somarDiasUteis('2026-10-21', 2), '2026-10-23');
  assert.equal(somarDiasUteis('2026-10-21', 0), '2026-10-21');
});

test('soma de dias uteis a partir de sabado e domingo', () => {
  assert.equal(somarDiasUteis('2026-10-24', 2), '2026-10-27');
  assert.equal(somarDiasUteis('2026-10-25', 1), '2026-10-26');
});

test('feriado empurra o prazo', () => {
  assert.equal(somarDiasUteis('2026-10-21', 2, new Set(['2026-10-22'])), '2026-10-26');
});

test('soma de dias uteis recusa n invalido', () => {
  assert.throws(() => somarDiasUteis('2026-10-21', -1));
  assert.throws(() => somarDiasUteis('2026-10-21', 1.5));
});

test('instante local: meia-noite de Sao Paulo e 03:00 UTC', () => {
  assert.equal(instanteLocal('2026-10-20', 0, 0, 0, 0), utc('2026-10-20T03:00:00Z'));
  assert.equal(instanteLocal('2026-10-20', 23, 59, 59, 999), utc('2026-10-21T02:59:59.999Z'));
});

test('janela do diario: terca cobre segunda inteira', () => {
  const terca8h = utc('2026-10-20T11:00:00Z'); // terca 08:00 em Sao Paulo
  const j = janelaDiario(terca8h);
  assert.equal(j.primeiroDia, '2026-10-19');
  assert.equal(j.ultimoDia, '2026-10-19');
  assert.equal(j.inicio, utc('2026-10-19T03:00:00Z'));
  assert.equal(j.fim, utc('2026-10-20T02:59:59.999Z'));
});

test('janela do diario: sexta cobre quinta', () => {
  const j = janelaDiario(utc('2026-10-23T11:00:00Z'));
  assert.equal(j.primeiroDia, '2026-10-22');
});

test('janela do semanal: segunda cobre segunda a domingo da semana anterior', () => {
  const segunda8h = utc('2026-10-26T11:00:00Z');
  const j = janelaSemanal(segunda8h);
  assert.equal(j.primeiroDia, '2026-10-19');
  assert.equal(j.ultimoDia, '2026-10-25');
  assert.equal(j.inicio, utc('2026-10-19T03:00:00Z'));
  assert.equal(j.fim, utc('2026-10-26T02:59:59.999Z'));
});

test('janela semanal gerada no meio da semana ainda e a semana anterior fechada', () => {
  const j = janelaSemanal(utc('2026-10-22T15:00:00Z')); // quinta
  assert.equal(j.primeiroDia, '2026-10-12');
  assert.equal(j.ultimoDia, '2026-10-18');
});

test('qual relatorio roda em cada dia', () => {
  assert.equal(relatorioDoDia(utc('2026-10-26T11:00:00Z')), 'semanal'); // segunda
  assert.equal(relatorioDoDia(utc('2026-10-27T11:00:00Z')), 'diario'); // terca
  assert.equal(relatorioDoDia(utc('2026-10-30T11:00:00Z')), 'diario'); // sexta
  assert.equal(relatorioDoDia(utc('2026-10-31T11:00:00Z')), null); // sabado
  assert.equal(relatorioDoDia(utc('2026-11-01T11:00:00Z')), null); // domingo
});

test('08:00 em Sao Paulo cai no dia certo mesmo perto da virada em UTC', () => {
  // 08:00 de segunda em SP = 11:00 UTC; 02:00 UTC de segunda ainda e domingo em SP.
  assert.equal(relatorioDoDia(utc('2026-10-26T02:00:00Z')), null);
});

test('diferenca em dias corridos entre dias civis', () => {
  assert.equal(diasEntre('2026-10-19', '2026-10-21'), 2);
  assert.equal(diasEntre('2026-10-21', '2026-10-21'), 0);
  assert.equal(diasEntre('2026-10-31', '2026-11-02'), 2);
  assert.equal(diasEntre('2026-10-21', '2026-10-19'), -2);
});
