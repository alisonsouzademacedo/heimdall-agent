import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliar, resumoDeFalhas, abrirNavegador, medirSistema, type Medidas } from './ambiente.ts';

const GIB = 1024 ** 3;
const bom: Medidas = { plataforma: 'win32', memTotalBytes: 16 * GIB, memLivreBytes: 8 * GIB, discoLivreBytes: 100 * GIB, nodeVersao: 'v22.22.0', dockerRodando: true };
const estado = (v: ReturnType<typeof avaliar>, id: string) => v.find((x) => x.id === id)!.estado;

test('maquina boa: tudo ok', () => {
  assert.deepEqual(avaliar(bom).map((v) => v.estado), ['ok', 'ok', 'ok', 'ok', 'ok', 'ok']);
  assert.equal(resumoDeFalhas(avaliar(bom)), '');
});

test('o notebook do dono (7,8 GiB, 84 GB livres) conta como 8 GB: atencao, nao falha', () => {
  const v = avaliar({ ...bom, memTotalBytes: 8029 * 1024 * 1024, discoLivreBytes: 84 * GIB, memLivreBytes: 1.3 * GIB });
  assert.equal(estado(v, 'memoria'), 'atencao');
  assert.equal(estado(v, 'memoria-livre'), 'atencao');
  assert.equal(estado(v, 'disco'), 'ok');
  assert.match(v.find((x) => x.id === 'memoria')!.rotulo, /8 GB/);
});

test('limites de memoria: 4 GB falha, 8 atencao, 16 ok', () => {
  assert.equal(estado(avaliar({ ...bom, memTotalBytes: 4 * GIB }), 'memoria'), 'falha');
  assert.equal(estado(avaliar({ ...bom, memTotalBytes: 8 * GIB }), 'memoria'), 'atencao');
  assert.equal(estado(avaliar({ ...bom, memTotalBytes: 16 * GIB }), 'memoria'), 'ok');
});

test('limites de disco: 29 GB falha, 30 atencao, 50 ok', () => {
  assert.equal(estado(avaliar({ ...bom, discoLivreBytes: 29.5 * GIB }), 'disco'), 'falha');
  assert.equal(estado(avaliar({ ...bom, discoLivreBytes: 30 * GIB }), 'disco'), 'atencao');
  assert.equal(estado(avaliar({ ...bom, discoLivreBytes: 50 * GIB }), 'disco'), 'ok');
});

test('Node: 22.17 falha, 22.18 e 24 passam', () => {
  assert.equal(estado(avaliar({ ...bom, nodeVersao: 'v22.17.9' }), 'node'), 'falha');
  assert.equal(estado(avaliar({ ...bom, nodeVersao: 'v22.18.0' }), 'node'), 'ok');
  assert.equal(estado(avaliar({ ...bom, nodeVersao: 'v24.1.0' }), 'node'), 'ok');
  assert.equal(estado(avaliar({ ...bom, nodeVersao: 'lixo' }), 'node'), 'falha');
});

test('Docker parado e uma falha e entra no resumo de falhas', () => {
  const v = avaliar({ ...bom, dockerRodando: false });
  assert.equal(estado(v, 'docker'), 'falha');
  assert.match(resumoDeFalhas(v), /Docker/);
});

test('sistema desconhecido falha', () => {
  assert.equal(estado(avaliar({ ...bom, plataforma: 'sunos' }), 'sistema'), 'falha');
});

test('abrirNavegador so aceita enderecos locais do proprio Heimdall', () => {
  for (const ruim of ['https://127.0.0.1:8765/', 'http://evil.com/', 'http://127.0.0.1.evil.com:8765/', 'file:///etc/passwd', 'http://127.0.0.1:8765/?x=1&calc', 'http://127.0.0.1:8765/ ; calc', 'javascript:alert(1)', '']) {
    assert.equal(abrirNavegador(ruim), false, ruim);
  }
});

test('medirSistema devolve numeros plausiveis sem lancar erro', () => {
  const m = medirSistema(process.cwd());
  assert.ok(m.memTotalBytes > 0 && m.memLivreBytes > 0 && m.discoLivreBytes >= 0);
  assert.equal(m.nodeVersao, process.version);
  assert.equal(typeof m.dockerRodando, 'boolean');
});
