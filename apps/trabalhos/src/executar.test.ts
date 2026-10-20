// Execucao de um programa SEM shell, com tempo limite e saida limitada; e a leitura do resultado combinado (uma linha JSON no stdout).
import test from 'node:test';
import assert from 'node:assert/strict';
import { executar, interpretar } from './executar.ts';
import { FalhaDefinitiva } from '../../core/src/midia.ts';

const node = (codigo: string) => ({ cmd: process.execPath, args: ['-e', codigo] });

test('captura stdout, stderr e o codigo de saida', async () => {
  const c = node("process.stdout.write('oi'); process.stderr.write('erro:x'); process.exit(3)");
  const r = await executar(c.cmd, c.args, { timeoutMs: 10_000 });
  assert.deepEqual({ cod: r.codigo, out: r.stdout, err: r.stderr, exp: r.expirou }, { cod: 3, out: 'oi', err: 'erro:x', exp: false });
});

test('tempo esgotado: mata o processo e avisa', async () => {
  const c = node('setInterval(() => {}, 1000)');
  const t0 = Date.now();
  const r = await executar(c.cmd, c.args, { timeoutMs: 300 });
  assert.equal(r.expirou, true);
  assert.ok(Date.now() - t0 < 5000);
});

test('saida enorme e cortada (nao enche a memoria) e a de erro fica curta', async () => {
  const c = node("process.stdout.write('a'.repeat(5_000_000)); process.stderr.write('e'.repeat(100000))");
  const r = await executar(c.cmd, c.args, { timeoutMs: 10_000, maxStdout: 1000 });
  assert.ok(r.stdout.length <= 1000);
  assert.ok(r.stderr.length <= 2000);
});

test('programa que nao existe: erro claro, nao excecao solta', async () => {
  const r = await executar('programa-que-nao-existe-xyz', [], { timeoutMs: 2000 });
  assert.equal(r.codigo, null);
  assert.match(r.erroDeInicio ?? '', /ENOENT|nao foi possivel/i);
});

test('nao usa shell: metacaracteres nos argumentos nao sao interpretados', async () => {
  const r = await executar(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', '--', 'a;echo INJETADO&&b'], { timeoutMs: 5000 });
  assert.equal(r.stdout, 'a;echo INJETADO&&b');
});

test('interpretar: transcricao ok -> texto; PDF ok -> markdown (a ultima linha do stdout e o JSON)', () => {
  assert.deepEqual(interpretar('transcrever', { codigo: 0, stdout: 'aviso qualquer\n{"texto":"ola","idioma":"pt","duracao_s":2.0}\n', stderr: '', expirou: false }), { texto: 'ola' });
  assert.deepEqual(interpretar('converter_pdf', { codigo: 0, stdout: '{"markdown":"# T"}', stderr: '', expirou: false }), { markdown: '# T' });
});

test('interpretar: codigo 3 = falha definitiva; tempo esgotado e codigo 1 = falha comum; JSON quebrado = falha comum', () => {
  assert.throws(() => interpretar('transcrever', { codigo: 3, stdout: '', stderr: 'erro:audio_longo', expirou: false }), (e: unknown) => e instanceof FalhaDefinitiva && /audio_longo/.test((e as Error).message));
  assert.throws(() => interpretar('transcrever', { codigo: 1, stdout: '', stderr: 'erro:transcricao:RuntimeError', expirou: false }), (e: unknown) => !(e instanceof FalhaDefinitiva) && /transcricao:RuntimeError/.test((e as Error).message));
  assert.throws(() => interpretar('transcrever', { codigo: null, stdout: '', stderr: '', expirou: true }), (e: unknown) => !(e instanceof FalhaDefinitiva) && /tempo_esgotado/.test((e as Error).message));
  assert.throws(() => interpretar('transcrever', { codigo: 0, stdout: 'nao e json', stderr: '', expirou: false }), /saida_invalida/);
  assert.throws(() => interpretar('converter_pdf', { codigo: 0, stdout: '{"texto":"x"}', stderr: '', expirou: false }), /saida_invalida/);
  assert.throws(() => interpretar('transcrever', { codigo: null, stdout: '', stderr: '', expirou: false, erroDeInicio: 'ENOENT docker' }), /docker/);
});

test('o erro mostrado nunca carrega conteudo da conversa: so as primeiras palavras de "erro:<motivo>"', () => {
  try {
    interpretar('transcrever', { codigo: 1, stdout: 'texto secreto do cliente', stderr: 'erro:transcricao:ValueError\nTraceback ... conteudo ...', expirou: false });
    assert.fail('deveria falhar');
  } catch (e) {
    assert.ok(!/secreto|Traceback|conteudo/.test((e as Error).message));
  }
});
