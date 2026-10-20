// Entregador da caixa de saida: pega o proximo texto pendente e o entrega pelo Envio (so o self-chat). Sem conexao, espera sem gastar tentativa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { enfileirarSaida, resumoDaSaida, MARCA } from '../../core/src/saida.ts';
import type { Envio } from '../../core/src/envio.ts';
import { entregarProxima, iniciarEntregador } from './entrega.ts';

const db = () => { const d = abrirBanco(); migrar(d); return d; };
function envioFalso(falhar = false) {
  const textos: string[] = [];
  const envio: Envio = { texto: async (t) => { if (falhar) throw new Error('socket fechado'); textos.push(t); }, documento: async () => { throw new Error('nao usado'); } };
  return { envio, textos };
}

test('entrega o texto marcado, guarda o id do WhatsApp e marca como enviada', async () => {
  const d = db(); enfileirarSaida(d, 'relatorio', 'relatorio do dia', 1);
  const e = envioFalso();
  assert.equal(await entregarProxima(d, e.envio, () => 'WA-77', 10), 'enviada');
  assert.deepEqual(e.textos, [`${MARCA}relatorio do dia`]);
  assert.equal((d.prepare('SELECT wa_msg_id FROM saida').get() as { wa_msg_id: string }).wa_msg_id, 'WA-77');
  assert.equal(await entregarProxima(d, e.envio, () => null, 11), 'vazia');
});

test('falha ao enviar: reagenda com a espera da fila e nao perde o texto', async () => {
  const d = db(); enfileirarSaida(d, 'resposta', 'oi', 1);
  assert.equal(await entregarProxima(d, envioFalso(true).envio, () => null, 10), 'falhou');
  assert.equal(resumoDaSaida(d).pendente, 1);
  assert.equal(await entregarProxima(d, envioFalso().envio, () => null, 11), 'vazia', 'ainda esperando');
  assert.equal(await entregarProxima(d, envioFalso().envio, () => 'WA-1', 10 + 61_000), 'enviada');
});

test('laco: sem conexao (envio nulo) espera sem gastar tentativa; com conexao entrega; parar encerra', async () => {
  const d = db(); enfileirarSaida(d, 'aviso', 'a', 1);
  const e = envioFalso(); let conectado = false; const esperas: number[] = [];
  const l = iniciarEntregador({ banco: d, envio: () => (conectado ? e.envio : null), ultimoId: () => 'WA-1', agora: () => 1000, intervaloMs: 500,
    esperar: async (ms) => { esperas.push(ms); if (esperas.length === 2) conectado = true; if (esperas.length >= 4) l.parar(); } });
  await l.terminou;
  assert.deepEqual(e.textos, [`${MARCA}a`]);
  assert.equal((d.prepare('SELECT tentativas FROM saida').get() as { tentativas: number }).tentativas, 0, 'a espera sem conexao nao conta tentativa');
});
