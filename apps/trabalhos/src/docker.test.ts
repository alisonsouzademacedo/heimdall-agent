// O comando que o executor roda: SEMPRE "docker compose ... run --rm media-worker python /app/<script>.py /entrada/<sha256>.<ext>", sem shell.
import test from 'node:test';
import assert from 'node:assert/strict';
import { montarComando, comandoLimpeza, NOME_CONTAINER, nomeSeguro } from './docker.ts';

const OPC = { composeFile: 'C:\\Heimdall\\infra\\compose\\docker-compose.yml', envFile: 'C:\\Heimdall\\infra\\compose\\.env', pastaDados: 'C:\\Heimdall\\data' };
const SHA = 'a'.repeat(64);

test('transcrever: argumentos exatos e a pasta de dados vai por variavel de ambiente (nunca no texto do comando)', () => {
  const c = montarComando('transcrever', `data/midias/${SHA}.ogg`, OPC);
  assert.equal(c.cmd, 'docker');
  assert.deepEqual(c.args, ['compose', '--env-file', OPC.envFile, '-f', OPC.composeFile, '--profile', 'trabalho', 'run', '--rm', '-T', '--name', NOME_CONTAINER, 'media-worker', 'python', '/app/transcrever.py', `/entrada/${SHA}.ogg`]);
  assert.deepEqual(c.env, { HEIMDALL_DATA: OPC.pastaDados });
});

test('converter PDF usa o outro script e a extensao .pdf', () => {
  const c = montarComando('converter_pdf', `data\\midias\\${SHA}.pdf`, OPC);
  assert.deepEqual(c.args.slice(-3), ['python', '/app/converter_pdf.py', `/entrada/${SHA}.pdf`]);
});

test('so aceita nome gerado por nos: 64 hex minusculos + .ogg/.pdf; qualquer outra coisa e recusada (sem injecao de argumentos nem caminhos)', () => {
  for (const ruim of ['', '../../etc/passwd', `${SHA}.exe`, `${SHA.slice(1)}.ogg`, `${SHA.toUpperCase()}.ogg`, `${SHA}.ogg --privileged`, `${SHA}.ogg;rm -rf /`, `-v/:/x`, `${SHA}.ogg\n`, 'data/midias/']) {
    assert.throws(() => montarComando('transcrever', ruim, OPC), /nome de arquivo/, JSON.stringify(ruim));
  }
  assert.equal(nomeSeguro(`x/y/${SHA}.pdf`, 'pdf'), `${SHA}.pdf`);
  assert.throws(() => montarComando('transcrever', `${SHA}.pdf`, OPC), /nome de arquivo/, 'audio com extensao de PDF');
  assert.throws(() => montarComando('converter_pdf', `${SHA}.ogg`, OPC), /nome de arquivo/, 'PDF com extensao de audio');
});

test('o tipo precisa ser um dos dois conhecidos', () => {
  assert.throws(() => montarComando('baixar_midia' as never, `${SHA}.ogg`, OPC), /tipo/);
});

test('limpeza depois de tempo esgotado: remove o contêiner pelo nome fixo (matar o docker.exe nao para o contêiner)', () => {
  assert.deepEqual(comandoLimpeza(), { cmd: 'docker', args: ['rm', '-f', NOME_CONTAINER] });
  assert.match(NOME_CONTAINER, /^heimdall-trabalho$/);
});
