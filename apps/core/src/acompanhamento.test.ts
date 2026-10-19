import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularAcompanhamento, CONFIG_PADRAO, PRIORIDADE_ESTADO, type MensagemCliente } from './acompanhamento.ts';

// Todas as horas abaixo sao 10:00 em Sao Paulo (13:00 UTC), salvo indicacao.
const sp = (dia: string, hora = '13:00') => Date.parse(`${dia}T${hora}:00Z`);
const cli = (dia: string, extra: Partial<MensagemCliente> = {}): MensagemCliente => ({ em: sp(dia), deMim: false, ...extra });
// O dono escreve sempre DEPOIS do cliente no mesmo dia (14:00 contra 10:00 de SP) quando nao se diz a hora.
const eu = (dia: string, hora = '17:00'): MensagemCliente => ({ em: sp(dia, hora), deMim: true });
// Calendario de referencia: 2026-10-19 seg, 20 ter, 21 qua, 22 qui, 23 sex, 24 sab, 25 dom, 26 seg, 27 ter...

test('cliente que nunca respondeu nao gera follow-up', () => {
  const r = calcularAcompanhamento('cliente', [eu('2026-10-19'), eu('2026-10-22'), eu('2026-10-27')], sp('2026-11-10'));
  assert.equal(r.estado, 'sem_resposta_nunca');
  assert.equal(r.proximoFollowUpDia, null);
});

test('sem nenhuma mensagem tambem e sem_resposta_nunca', () => {
  assert.equal(calcularAcompanhamento('cliente', [], sp('2026-10-20')).estado, 'sem_resposta_nunca');
});

test('mensagem do cliente que pede resposta: aguardando o usuario, desde quando', () => {
  const r = calcularAcompanhamento('cliente', [eu('2026-10-19'), cli('2026-10-20')], sp('2026-10-22'));
  assert.equal(r.estado, 'aguardando_usuario');
  assert.equal(r.aguardandoUsuarioDesde, sp('2026-10-20'));
});

test('"ok"/"obrigado" (nao pede resposta) nao deixa o usuario devendo', () => {
  const r = calcularAcompanhamento('cliente', [eu('2026-10-19'), cli('2026-10-20', { precisaResposta: false })], sp('2026-10-22'));
  assert.equal(r.estado, 'ativo');
  assert.equal(r.aguardandoUsuarioDesde, null);
});

test('na duvida (precisaResposta ausente) conta como devendo', () => {
  assert.equal(calcularAcompanhamento('cliente', [cli('2026-10-20')], sp('2026-10-20')).estado, 'aguardando_usuario');
});

test('follow-up devido so depois de 2 dias uteis', () => {
  const msgs = [cli('2026-10-19'), eu('2026-10-19')]; // segunda; vence quarta
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-20')).estado, 'ativo');
  const quarta = calcularAcompanhamento('cliente', msgs, sp('2026-10-21'));
  assert.equal(quarta.estado, 'follow_up_devido');
  assert.equal(quarta.tentativas, 1);
  assert.equal(quarta.proximoFollowUpDia, '2026-10-21');
});

test('mensagem na sexta vence na terca (fim de semana nao conta)', () => {
  const msgs = [cli('2026-10-22'), eu('2026-10-23')];
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-26')).estado, 'ativo'); // segunda
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-27')).estado, 'follow_up_devido'); // terca
});

test('feriado empurra o vencimento', () => {
  const cfg = { ...CONFIG_PADRAO, feriados: new Set(['2026-10-20']) };
  const msgs = [cli('2026-10-19'), eu('2026-10-19')];
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-21'), cfg).estado, 'ativo');
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-22'), cfg).estado, 'follow_up_devido');
});

test('varias mensagens dentro do mesmo intervalo contam como UMA tentativa', () => {
  const msgs = [cli('2026-10-19'), eu('2026-10-19', '15:00'), eu('2026-10-19', '19:00'), eu('2026-10-20')];
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-20')).tentativas, 1);
});

test('mensagem depois do intervalo abre nova tentativa', () => {
  const msgs = [cli('2026-10-19'), eu('2026-10-19'), eu('2026-10-21')]; // quarta = 2 dias uteis depois
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-21', '23:00')).tentativas, 2);
});

function seteTentativas(): MensagemCliente[] {
  // Respondeu uma vez; depois 7 tentativas espacadas por 2 dias uteis cada.
  return [cli('2026-10-01'), eu('2026-10-01'), eu('2026-10-05'), eu('2026-10-07'), eu('2026-10-09'), eu('2026-10-13'), eu('2026-10-15'), eu('2026-10-19')];
}

test('6 tentativas ainda geram follow-up; a 7a desconsidera o cliente', () => {
  const todas = seteTentativas();
  const seis = todas.slice(0, 7);
  assert.equal(calcularAcompanhamento('cliente', seis, sp('2026-10-30')).tentativas, 6);
  assert.equal(calcularAcompanhamento('cliente', seis, sp('2026-10-30')).estado, 'follow_up_devido');
  const sete = calcularAcompanhamento('cliente', todas, sp('2026-10-30'));
  assert.equal(sete.tentativas, 7);
  assert.equal(sete.estado, 'desconsiderado');
});

test('resposta do cliente zera a contagem e reativa o desconsiderado', () => {
  const msgs = [...seteTentativas(), cli('2026-10-20')];
  const r = calcularAcompanhamento('cliente', msgs, sp('2026-10-21'));
  assert.equal(r.estado, 'aguardando_usuario');
  assert.equal(r.tentativas, 0);
  const depois = calcularAcompanhamento('cliente', [...msgs, eu('2026-10-21')], sp('2026-10-21', '23:00'));
  assert.equal(depois.tentativas, 1);
  assert.equal(depois.estado, 'ativo');
});

test('papel interno e dono_pessoal ficam fora das regras comerciais', () => {
  for (const papel of ['interno', 'dono_pessoal', 'fornecedor', 'pessoal'] as const) {
    assert.equal(calcularAcompanhamento(papel, [cli('2026-10-20')], sp('2026-10-22')).estado, 'fora_das_regras', papel);
  }
});

test('fuso: mensagem as 23:30 de sexta em SP conta como sexta, nao como sabado de UTC', () => {
  const sextaNoite = Date.parse('2026-10-24T02:30:00Z'); // sexta 23:30 em SP
  const msgs = [cli('2026-10-22'), { em: sextaNoite, deMim: true }];
  // sexta + 2 dias uteis = terca. Segunda ainda nao vence.
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-26')).estado, 'ativo');
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-27')).estado, 'follow_up_devido');
});

test('mensagens no futuro (relogio errado) sao ignoradas e a ordem de entrada nao importa', () => {
  const msgs = [eu('2026-10-19'), cli('2026-10-19'), cli('2027-01-01')];
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-20')).ultimaRespostaClienteEm, sp('2026-10-19'));
});

test('configuracao propria: 3 tentativas desconsideram', () => {
  const cfg = { ...CONFIG_PADRAO, maxTentativas: 3 };
  const msgs = [cli('2026-10-01'), eu('2026-10-01'), eu('2026-10-05'), eu('2026-10-07')];
  assert.equal(calcularAcompanhamento('cliente', msgs, sp('2026-10-08'), cfg).estado, 'desconsiderado');
});

test('prioridade: aguardando o usuario vem antes de qualquer outro estado', () => {
  const ordem = Object.entries(PRIORIDADE_ESTADO).sort((a, b) => a[1] - b[1]).map(([k]) => k);
  assert.equal(ordem[0], 'aguardando_usuario');
  assert.equal(ordem[1], 'follow_up_devido');
});
