// Fila durável (tabela "fila"): quem pega, quando tenta de novo, quando desiste, e como se recupera de uma queda no meio do trabalho.
// Nunca existe um tipo "enviar": a regra 1 vale ate para a fila (o CHECK da tabela recusa).
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from './db.ts';
import { enfileirar, pegarProximo, concluir, falhar, recuperarTravados, resumoDaFila, ESPERAS_RETENTATIVA_MS, MAX_TENTATIVAS } from './fila.ts';

const novo = () => { const db = abrirBanco(); migrar(db); return db; };
const T0 = 1_760_000_000_000;

test('enfileirar e idempotente: o mesmo trabalho duas vezes e um so', () => {
  const db = novo();
  assert.equal(enfileirar(db, 'transcrever', '7', T0), true);
  assert.equal(enfileirar(db, 'transcrever', '7', T0 + 5), false);
  assert.equal(resumoDaFila(db).pendente, 1);
});

test('pegar devolve o mais antigo pronto, marca em andamento e conta a tentativa; so quem esta pronto', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  enfileirar(db, 'converter_pdf', '2', T0 + 10);
  enfileirar(db, 'transcrever', '3', T0 + 999_999);
  const a = pegarProximo(db, ['transcrever', 'converter_pdf'], T0 + 20)!;
  assert.deepEqual({ tipo: a.tipo, ref: a.referencia, tent: a.tentativas }, { tipo: 'transcrever', ref: '1', tent: 1 });
  const b = pegarProximo(db, ['transcrever', 'converter_pdf'], T0 + 20)!;
  assert.equal(b.referencia, '2');
  assert.equal(pegarProximo(db, ['transcrever', 'converter_pdf'], T0 + 20), null, 'o 3 ainda nao esta pronto e os outros estao em andamento');
  assert.equal(resumoDaFila(db).em_andamento, 2);
});

test('so pega os tipos pedidos (o listener nao pega transcricao e o executor nao pega download)', () => {
  const db = novo();
  enfileirar(db, 'baixar_midia', '1', T0);
  assert.equal(pegarProximo(db, ['transcrever', 'converter_pdf'], T0 + 1), null);
  assert.equal(pegarProximo(db, ['baixar_midia'], T0 + 1)!.referencia, '1');
});

test('dois consumidores nunca pegam o mesmo trabalho', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  const a = pegarProximo(db, ['transcrever'], T0 + 1);
  const b = pegarProximo(db, ['transcrever'], T0 + 1);
  assert.ok(a && !b);
});

test('concluir marca ok e nao volta mais', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  const j = pegarProximo(db, ['transcrever'], T0 + 1)!;
  concluir(db, j.id, T0 + 2);
  assert.equal(resumoDaFila(db).ok, 1);
  assert.equal(pegarProximo(db, ['transcrever'], T0 + 10 ** 12), null);
});

test('falhar: volta para a fila com espera crescente e guarda o erro; ao esgotar as tentativas e abandonada', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  let agora = T0;
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    const j = pegarProximo(db, ['transcrever'], agora)!;
    assert.equal(j.tentativas, i + 1);
    const r = falhar(db, j.id, `erro ${i}`, agora);
    if (i < MAX_TENTATIVAS - 1) {
      assert.equal(r, 'reagendada');
      const linha = db.prepare('SELECT proximo_em, erro, estado FROM fila').get() as { proximo_em: number; erro: string; estado: string };
      assert.equal(linha.estado, 'pendente');
      assert.equal(linha.proximo_em, agora + ESPERAS_RETENTATIVA_MS[Math.min(i, ESPERAS_RETENTATIVA_MS.length - 1)]!);
      assert.equal(pegarProximo(db, ['transcrever'], agora + 1), null, 'ainda esperando');
      agora = linha.proximo_em;
    } else assert.equal(r, 'abandonada');
  }
  const final = db.prepare('SELECT estado, erro, tentativas FROM fila').get() as { estado: string; erro: string; tentativas: number };
  assert.deepEqual({ ...final }, { estado: 'abandonada', erro: `erro ${MAX_TENTATIVAS - 1}`, tentativas: MAX_TENTATIVAS });
});

test('falha definitiva (ex.: PDF escaneado sem texto) abandona na hora, sem repetir', () => {
  const db = novo();
  enfileirar(db, 'converter_pdf', '9', T0);
  const j = pegarProximo(db, ['converter_pdf'], T0)!;
  assert.equal(falhar(db, j.id, 'sem_texto', T0, { definitiva: true }), 'abandonada');
  assert.equal(resumoDaFila(db).abandonada, 1);
});

test('queda no meio do trabalho: o que ficou "em andamento" ha muito tempo volta para a fila (sem gastar tentativa nova)', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  pegarProximo(db, ['transcrever'], T0);
  assert.equal(recuperarTravados(db, T0 + 60_000, 10 * 60_000), 0, 'ainda dentro do prazo');
  assert.equal(recuperarTravados(db, T0 + 11 * 60_000, 10 * 60_000), 1);
  const j = pegarProximo(db, ['transcrever'], T0 + 11 * 60_000)!;
  assert.equal(j.tentativas, 2, 'a tentativa interrompida conta, para uma bomba nao rodar para sempre');
});

test('o erro guardado nunca passa de 300 caracteres e nao carrega quebras de linha (so o motivo, nunca o conteudo da conversa)', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  const j = pegarProximo(db, ['transcrever'], T0)!;
  falhar(db, j.id, 'x'.repeat(1000) + '\nsegunda linha', T0);
  const e = (db.prepare('SELECT erro FROM fila').get() as { erro: string }).erro;
  assert.ok(e.length <= 300);
  assert.ok(!e.includes('\n'));
});

test('trabalho que trava a maquina toda vez (queda a cada tentativa) acaba abandonado, nao roda para sempre', () => {
  const db = novo();
  enfileirar(db, 'transcrever', '1', T0);
  let agora = T0;
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    assert.ok(pegarProximo(db, ['transcrever'], agora));
    agora += 11 * 60_000;
    recuperarTravados(db, agora, 10 * 60_000);
  }
  const r = db.prepare('SELECT estado, erro FROM fila').get() as { estado: string; erro: string };
  assert.deepEqual({ ...r }, { estado: 'abandonada', erro: 'travou_muitas_vezes' });
});
