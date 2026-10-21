// 2026-10-21: no 1o uso real o listener.log trouxe um despejo de sessao de criptografia (privKey, chainKey, rootKey, ephemeralKeyPair): a libsignal, por
// dentro do Baileys, escreve a sessao inteira em console.info/warn ("Closing session"), e o nosso logger silencioso nao alcanca o console.
// A regra 2 do AGENTS.md proibe chave em log. Dados SINTETICOS: nenhuma chave real aqui.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect } from 'node:util';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { protegerConsole } from './console-seguro.ts';

type Chamada = { metodo: string; args: unknown[] };
function consoleFalso() {
  const chamadas: Chamada[] = [];
  const c: Record<string, (...a: unknown[]) => void> = {};
  for (const m of ['log', 'info', 'warn', 'error', 'debug']) c[m] = (...args: unknown[]) => { chamadas.push({ metodo: m, args }); };
  return { c: c as unknown as Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>, chamadas };
}
const SESSAO = {
  registrationId: 123456,
  currentRatchet: {
    rootKey: Buffer.alloc(32, 7),
    ephemeralKeyPair: { pubKey: Buffer.alloc(33, 5), privKey: Buffer.alloc(32, 9) },
    lastRemoteEphemeralKey: Buffer.alloc(33, 3)
  },
  indexInfo: { remoteIdentityKey: Buffer.alloc(33, 4), baseKey: Buffer.alloc(33, 2) },
  _chains: { abc: { chainKey: { counter: 1, key: Buffer.alloc(32, 8) } } }
};
const PROIBIDOS = /privKey|pubKey|rootKey|chainKey|ephemeralKeyPair|remoteIdentityKey|_chains|currentRatchet/;

test('sessao de criptografia despejada pela libsignal em qualquer metodo do console nao chega ao registro', () => {
  const { c, chamadas } = consoleFalso();
  protegerConsole(c);
  for (const m of ['log', 'info', 'warn', 'error', 'debug'] as const) c[m]('Closing session:', SESSAO);
  assert.equal(chamadas.length, 5, 'os cinco metodos continuam escrevendo alguma coisa');
  for (const ch of chamadas) assert.doesNotMatch(inspect(ch.args, { depth: 8 }), PROIBIDOS, `metodo ${ch.metodo} vazou chave`);
});

test('texto comum do Heimdall passa sem alteracao', () => {
  const { c, chamadas } = consoleFalso();
  protegerConsole(c);
  c.log('Heimdall: escuta do WhatsApp ligada (so le e grava).');
  c.warn('aviso', 42, { ok: true });
  assert.deepEqual(chamadas[0]!.args, ['Heimdall: escuta do WhatsApp ligada (so le e grava).']);
  assert.deepEqual(chamadas[1]!.args, ['aviso', 42, { ok: true }]);
});

test('texto que cita campos de chave tambem e omitido (despejo ja formatado em string)', () => {
  const { c, chamadas } = consoleFalso();
  protegerConsole(c);
  c.info(inspect(SESSAO, { depth: 8 }));
  assert.doesNotMatch(inspect(chamadas[0]!.args), PROIBIDOS);
});

test('proteger duas vezes nao embrulha duas vezes (uma chamada, um registro)', () => {
  const { c, chamadas } = consoleFalso();
  protegerConsole(c);
  protegerConsole(c);
  c.log('uma vez');
  assert.equal(chamadas.length, 1);
});

test('o arranque do listener protege o console ANTES de abrir a conexao (senao a correcao ficaria so no papel)', () => {
  const fonte = readFileSync(fileURLToPath(new URL('./iniciar.ts', import.meta.url)), 'utf8');
  const proteger = fonte.indexOf('protegerConsole()');
  const iniciar = fonte.indexOf('await iniciarListener(');
  assert.ok(proteger > 0, 'iniciar.ts chama protegerConsole()');
  assert.ok(iniciar > 0 && proteger < iniciar, 'protegerConsole() vem antes de await iniciarListener(');
});

