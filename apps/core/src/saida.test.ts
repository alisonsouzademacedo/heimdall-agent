// Caixa de saida para o dono: o UNICO caminho para texto sair do Heimdall e esta tabela, que nao tem coluna de destino. Quem entrega
// (o listener, pelo Envio travado no self-chat) so existe com conexao aberta. Aqui: regras da caixa, marca anti-eco e tentativas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from './db.ts';
import { MARCA, enfileirarSaida, proximaSaida, marcarEnviada, marcarFalhaSaida, ehMensagemNossa, resumoDaSaida, MAX_TENTATIVAS_SAIDA } from './saida.ts';
import { ESPERAS_RETENTATIVA_MS } from './fila.ts';

const db = () => { const d = abrirBanco(); migrar(d); return d; };

test('a tabela saida nao tem coluna de destino (so existe o dono)', () => {
  const colunas = (db().prepare("PRAGMA table_info(saida)").all() as { name: string }[]).map((c) => c.name);
  assert.ok(colunas.length > 3);
  assert.deepEqual(colunas.filter((c) => /dest|para|jid|numero|phone|to_/i.test(c)), []);
});

test('enfileirar: o texto ganha a marca do Heimdall; vazio e grande demais sao recusados; a chave evita repetir o mesmo relatorio', () => {
  const d = db();
  const id = enfileirarSaida(d, 'resposta', 'Oi, tudo certo', 1000)!;
  assert.ok(id > 0);
  assert.equal(proximaSaida(d, 1000)!.texto, `${MARCA}Oi, tudo certo`);
  assert.throws(() => enfileirarSaida(d, 'resposta', '   ', 1000), /vazio/);
  assert.throws(() => enfileirarSaida(d, 'resposta', 'x'.repeat(60_001), 1000), /grande/);
  assert.ok(enfileirarSaida(d, 'relatorio', 'diario', 1000, 'relatorio:diario:2025-10-10'));
  assert.equal(enfileirarSaida(d, 'relatorio', 'diario outra vez', 2000, 'relatorio:diario:2025-10-10'), null, 'mesma chave: nao duplica');
  assert.equal(resumoDaSaida(d).pendente, 2);
});

test('a marca nao e duplicada se o texto ja a traz', () => {
  const d = db(); enfileirarSaida(d, 'aviso', `${MARCA}ja marcado`, 1);
  assert.equal(proximaSaida(d, 1)!.texto, `${MARCA}ja marcado`);
});

test('ordem de chegada; marcar enviada guarda o id do WhatsApp e tira da fila; nao reenvia', () => {
  const d = db();
  const a = enfileirarSaida(d, 'resposta', 'primeira', 1)!; const b = enfileirarSaida(d, 'resposta', 'segunda', 2)!;
  assert.equal(proximaSaida(d, 10)!.id, a);
  marcarEnviada(d, a, 'WA-1', 10);
  assert.equal(proximaSaida(d, 10)!.id, b);
  marcarEnviada(d, b, null, 11);
  assert.equal(proximaSaida(d, 100), null);
  assert.deepEqual(resumoDaSaida(d), { pendente: 0, enviada: 2, abandonada: 0 });
});

test('falha: espera crescente e, na ultima tentativa, abandona (o texto fica guardado, nada e apagado)', () => {
  const d = db(); const id = enfileirarSaida(d, 'resposta', 'x', 0)!;
  let t = 0;
  for (let i = 1; i < MAX_TENTATIVAS_SAIDA; i++) {
    assert.equal(marcarFalhaSaida(d, id, 'sem conexao', t), 'reagendada');
    const esperado = ESPERAS_RETENTATIVA_MS[Math.min(i - 1, ESPERAS_RETENTATIVA_MS.length - 1)]!;
    assert.equal(proximaSaida(d, t + esperado - 1), null, `tentativa ${i}: ainda esperando`);
    t += esperado;
    assert.equal(proximaSaida(d, t)!.id, id);
  }
  assert.equal(marcarFalhaSaida(d, id, 'sem conexao', t), 'abandonada');
  assert.equal(proximaSaida(d, t + 1e12), null);
  assert.equal(resumoDaSaida(d).abandonada, 1);
  assert.equal((d.prepare('SELECT texto FROM saida').get() as { texto: string }).texto.includes('x'), true);
});

test('eco: mensagem com a marca ou com id que nos enviamos nao e comando do dono', () => {
  const d = db(); const id = enfileirarSaida(d, 'resposta', 'ola', 1)!; marcarEnviada(d, id, 'WA-9', 2);
  assert.equal(ehMensagemNossa(d, `${MARCA}qualquer coisa`, 'OUTRO'), true);
  assert.equal(ehMensagemNossa(d, 'texto sem marca', 'WA-9'), true);
  assert.equal(ehMensagemNossa(d, 'texto do dono', 'WA-1'), false);
});

test('o erro guardado e so o motivo curto, sem quebra de linha', () => {
  const d = db(); const id = enfileirarSaida(d, 'resposta', 'segredo-123', 0)!;
  marcarFalhaSaida(d, id, 'falhou\ncom segredo-123 e mais ' + 'z'.repeat(500), 0);
  const e = (d.prepare('SELECT erro FROM saida').get() as { erro: string }).erro;
  assert.equal(e.includes('\n'), false); assert.ok(e.length <= 300);
});
