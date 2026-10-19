import test from 'node:test';
import assert from 'node:assert/strict';
import { FERRAMENTAS, validarEntrada, EntradaInvalida } from './mcp-contrato.ts';

test('nomes unicos e toda ferramenta tem descricao', () => {
  const nomes = FERRAMENTAS.map((f) => f.nome);
  assert.equal(new Set(nomes).size, nomes.length);
  for (const f of FERRAMENTAS) assert.ok(f.descricao.length > 10, f.nome);
});

test('a UNICA escrita e registrar_feedback, e ela so grava em "feedback"', () => {
  const escritoras = FERRAMENTAS.filter((f) => f.escreve);
  assert.deepEqual(escritoras.map((f) => f.nome), ['registrar_feedback']);
  assert.deepEqual(escritoras[0]!.escreveEm, ['feedback']);
  for (const f of FERRAMENTAS.filter((x) => !x.escreve)) assert.equal(f.escreveEm, undefined, f.nome);
});

test('nenhuma ferramenta envia mensagem nem apaga dados (pelo nome e pela descricao)', () => {
  const proibido = /(apag|delet|remov|exclu|envi|send|drop|clear|limpar|destru)/i;
  for (const f of FERRAMENTAS) {
    assert.doesNotMatch(f.nome, proibido, f.nome);
    assert.doesNotMatch(f.descricao.replace('nao envia', ''), proibido, `${f.nome}: ${f.descricao}`);
  }
});

test('entrada valida passa', () => {
  validarEntrada('followups_devidos', { data: '2026-10-21' });
  validarEntrada('cliente', { id: 7 });
  validarEntrada('dados_do_relatorio', { tipo: 'diario', data: '2026-10-21' });
  validarEntrada('registrar_feedback', { texto: 'A1 ja resolvi' });
  validarEntrada('registrar_feedback', { texto: 'x', referencia: 'A1' });
  validarEntrada('clientes_aguardando_usuario', {});
});

test('campos que faltam, sobram ou tem tipo errado sao recusados', () => {
  const ruins: [string, Record<string, unknown>][] = [
    ['followups_devidos', {}],
    ['followups_devidos', { data: '21/10/2026' }],
    ['followups_devidos', { data: '2026-13-45' }],
    ['followups_devidos', { data: '2026-10-21', extra: 1 }],
    ['cliente', { id: '7' }],
    ['cliente', { id: 0 }],
    ['cliente', { id: 1.5 }],
    ['dados_do_relatorio', { tipo: 'mensal', data: '2026-10-21' }],
    ['registrar_feedback', { texto: '' }],
    ['registrar_feedback', { texto: 'x'.repeat(2001) }],
    ['clientes_aguardando_usuario', { qualquer: 1 }],
    ['ferramenta_inexistente', {}],
    ['apagar_cliente', { id: 1 }]
  ];
  for (const [nome, args] of ruins) assert.throws(() => validarEntrada(nome, args), EntradaInvalida, `${nome} ${JSON.stringify(args)}`);
});
