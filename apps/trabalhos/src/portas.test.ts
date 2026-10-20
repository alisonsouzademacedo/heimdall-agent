// As portas reais do executor (transcrever e converter PDF pelo contêiner), com o "executar" trocado por um falso que anota o que rodaria.
import test from 'node:test';
import assert from 'node:assert/strict';
import { criarPortasDocker } from './portas.ts';
import { NOME_CONTAINER } from './docker.ts';
import { FalhaDefinitiva } from '../../core/src/midia.ts';
import type { Saida } from './executar.ts';

const OPC = { composeFile: '/c/docker-compose.yml', envFile: '/c/.env', pastaDados: '/d' };
const SHA = 'b'.repeat(64);
function falso(saidas: Saida[]) {
  const chamadas: { cmd: string; args: string[]; timeoutMs: number; env?: Record<string, string> }[] = [];
  const fn = async (cmd: string, args: string[], o: { timeoutMs: number; env?: Record<string, string> }): Promise<Saida> => { chamadas.push({ cmd, args, timeoutMs: o.timeoutMs, env: o.env }); return saidas.shift() ?? { codigo: 0, stdout: '', stderr: '', expirou: false }; };
  return { fn, chamadas };
}
const ok = (stdout: string): Saida => ({ codigo: 0, stdout, stderr: '', expirou: false });

test('transcrever: roda o comando montado, com a pasta de dados no ambiente, e devolve o texto', async () => {
  const f = falso([ok('{"texto":"ola mundo","idioma":"pt","duracao_s":3}')]);
  const p = criarPortasDocker(OPC, f.fn);
  assert.deepEqual(await p.transcrever(`data/midias/${SHA}.ogg`), { texto: 'ola mundo' });
  assert.equal(f.chamadas.length, 1);
  assert.equal(f.chamadas[0]!.cmd, 'docker');
  assert.ok(f.chamadas[0]!.args.includes(`/entrada/${SHA}.ogg`));
  assert.deepEqual(f.chamadas[0]!.env, { HEIMDALL_DATA: '/d' });
});

test('PDF: devolve o markdown', async () => {
  const f = falso([ok('{"markdown":"# Ata"}')]);
  assert.deepEqual(await criarPortasDocker(OPC, f.fn).converterPdf(`data/midias/${SHA}.pdf`), { markdown: '# Ata' });
});

test('tempo esgotado: remove o contêiner (matar o docker nao para o contêiner) e a falha pode ser repetida', async () => {
  const f = falso([{ codigo: null, stdout: '', stderr: '', expirou: true }, ok('')]);
  await assert.rejects(() => criarPortasDocker(OPC, f.fn).transcrever(`${SHA}.ogg`), (e: unknown) => !(e instanceof FalhaDefinitiva) && /tempo_esgotado/.test((e as Error).message));
  assert.equal(f.chamadas.length, 2);
  assert.deepEqual(f.chamadas[1]!.args, ['rm', '-f', NOME_CONTAINER]);
});

test('nome de arquivo invalido nem chega a rodar o Docker', async () => {
  const f = falso([]);
  await assert.rejects(() => criarPortasDocker(OPC, f.fn).transcrever('../../etc/passwd'), /nome de arquivo/);
  assert.equal(f.chamadas.length, 0);
});

test('tempo limite do audio e maior que o do PDF e ambos vem das opcoes', async () => {
  const f = falso([ok('{"texto":"x","idioma":"pt","duracao_s":1}'), ok('{"markdown":"x"}')]);
  const p = criarPortasDocker({ ...OPC, timeoutAudioMs: 111_000, timeoutPdfMs: 22_000 }, f.fn);
  await p.transcrever(`${SHA}.ogg`); await p.converterPdf(`${SHA}.pdf`);
  assert.deepEqual(f.chamadas.map((c) => c.timeoutMs), [111_000, 22_000]);
});
