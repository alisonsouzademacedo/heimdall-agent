import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { avaliar, resumoDeFalhas, abrirNavegador, medirSistema, lerNvidiaSmi, lerVersaoWsl, windowsBuildSuficiente, imagensDoCompose, type Medidas } from './ambiente.ts';

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

// Docker Desktop no Windows precisa de virtualizacao ligada na BIOS e de WSL 2 (docs/docker/desktop/setup/install/windows-install.md).
// Medidas ausentes (undefined) = nao se aplica ou nao foi medido: a verificacao nem aparece (outros sistemas).
test('virtualizacao desligada e uma falha, explica a BIOS e entra no resumo de falhas', () => {
  const v = avaliar({ ...bom, virtualizacao: false, wsl: true });
  assert.equal(estado(v, 'virtualizacao'), 'falha');
  assert.match(v.find((x) => x.id === 'virtualizacao')!.detalhe, /BIOS/);
  assert.match(resumoDeFalhas(v), /irtualiza/);
});

test('virtualizacao ligada mas WSL ausente: so o WSL falha, e diz como instalar', () => {
  const v = avaliar({ ...bom, virtualizacao: true, wsl: false });
  assert.equal(estado(v, 'virtualizacao'), 'ok');
  assert.equal(estado(v, 'wsl'), 'falha');
  assert.match(v.find((x) => x.id === 'wsl')!.detalhe, /wsl --install/);
  // Na maquina do dono 'wsl --install' respondeu em circulo; o que funcionou foi o caminho manual da Microsoft (docs/wsl/install-manual.md).
  const d = v.find((x) => x.id === 'wsl')!.detalhe;
  assert.match(d, /dism\.exe \/online \/enable-feature \/featurename:Microsoft-Windows-Subsystem-Linux/);
  assert.match(d, /dism\.exe \/online \/enable-feature \/featurename:VirtualMachinePlatform/);
  assert.match(d, /docs\/wsl\/install-manual\.md/);
});

test('virtualizacao e WSL presentes: ambas ok e a maquina boa segue sem falhas', () => {
  const v = avaliar({ ...bom, virtualizacao: true, wsl: true });
  assert.deepEqual([estado(v, 'virtualizacao'), estado(v, 'wsl')], ['ok', 'ok']);
  assert.equal(resumoDeFalhas(v), '');
});

test('sem medida (outro sistema): as verificacoes de virtualizacao e WSL nao aparecem', () => {
  assert.deepEqual(avaliar(bom).filter((x) => x.id === 'virtualizacao' || x.id === 'wsl'), []);
});

test('no Windows, medirSistema mede virtualizacao e WSL (booleanos); fora dele, deixa vazio', () => {
  const m = medirSistema(process.cwd());
  if (m.plataforma === 'win32') { assert.equal(typeof m.virtualizacao, 'boolean'); assert.equal(typeof m.wsl, 'boolean'); }
  else { assert.equal(m.virtualizacao, undefined); assert.equal(m.wsl, undefined); }
});

// Dados para o perfil por tipo de computador (perfil.ts): arquitetura, CPUs e placa de video NVIDIA.
test('lerNvidiaSmi: le "nome, memoria" do nvidia-smi; varias placas: fica com a de mais memoria; lixo: nada', () => {
  assert.deepEqual(lerNvidiaSmi('NVIDIA GeForce GTX 1650, 4096\n'), { nome: 'NVIDIA GeForce GTX 1650', vramMb: 4096 });
  assert.deepEqual(lerNvidiaSmi('NVIDIA T400, 2048\r\nNVIDIA RTX A4000, 16376\r\n'), { nome: 'NVIDIA RTX A4000', vramMb: 16376 });
  assert.equal(lerNvidiaSmi(''), null);
  assert.equal(lerNvidiaSmi('NVIDIA-SMI has failed because it could not communicate with the NVIDIA driver'), null);
  assert.equal(lerNvidiaSmi('Placa, nao-e-numero'), null);
});

test('medirSistema tambem mede arquitetura, CPUs e placa NVIDIA (ou nenhuma)', () => {
  const m = medirSistema(process.cwd());
  assert.equal(typeof m.arch, 'string');
  assert.ok(typeof m.cpus === 'number' && m.cpus >= 1);
  assert.ok(m.gpuNvidia === null || (typeof m.gpuNvidia!.nome === 'string' && m.gpuNvidia!.vramMb > 0));
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

// Versoes minimas: docs/docker/desktop/setup/install/windows-install.md (WSL 2.1.5; Windows 10 22H2 = build 19045; Windows 11 23H2 = build 22631).
test('lerVersaoWsl: acha o numero na saida do "wsl --version", mesmo em UTF-16 (caracteres nulos) ou com texto em outro idioma', () => {
  assert.equal(lerVersaoWsl('WSL version: 2.4.13.0\nKernel version: 5.15'), '2.4.13');
  assert.equal(lerVersaoWsl('WSL vers\u00e3o: 2.1.5.0'.split('').join('\u0000')), '2.1.5');
  assert.equal(lerVersaoWsl('sem numero'), null);
  assert.equal(lerVersaoWsl(''), null);
});

test('WSL: 2.1.4 falha e manda atualizar; 2.1.5 e 2.6.0 passam; ilegivel vira atencao', () => {
  const v = (wslVersao: string | null) => avaliar({ ...bom, virtualizacao: true, wsl: true, wslVersao });
  assert.equal(estado(v('2.1.4'), 'wsl-versao'), 'falha');
  assert.match(v('2.1.4').find((x) => x.id === 'wsl-versao')!.detalhe, /wsl --update/);
  assert.equal(estado(v('2.1.5'), 'wsl-versao'), 'ok');
  assert.equal(estado(v('2.6.0'), 'wsl-versao'), 'ok');
  assert.equal(estado(v('1.9.9'), 'wsl-versao'), 'falha');
  assert.equal(estado(v(null), 'wsl-versao'), 'atencao');
});

test('WSL ausente: nao acrescenta a linha de versao (ja existe a linha "WSL 2")', () => {
  assert.equal(avaliar({ ...bom, virtualizacao: true, wsl: false, wslVersao: null }).some((x) => x.id === 'wsl-versao'), false);
  assert.equal(avaliar(bom).some((x) => x.id === 'wsl-versao'), false);
});

test('windowsBuildSuficiente: 10 exige 19045; 11 exige 22631 (22000 a 22630 e Windows 11 antigo)', () => {
  for (const [b, esperado] of [[19044, false], [19045, true], [21999, true], [22000, false], [22621, false], [22630, false], [22631, true], [26100, true]] as const) {
    assert.equal(windowsBuildSuficiente(b), esperado, String(b));
  }
});

test('versao do Windows antiga vira atencao (nao bloqueia: nao foi testado em maquina antiga) e cita a exigencia do Docker', () => {
  const v = avaliar({ ...bom, windowsBuild: 19044 });
  assert.equal(estado(v, 'windows-versao'), 'atencao');
  assert.match(v.find((x) => x.id === 'windows-versao')!.detalhe, /22H2.*19045|19045.*22H2/);
  assert.equal(estado(avaliar({ ...bom, windowsBuild: 22631 }), 'windows-versao'), 'ok');
  assert.equal(avaliar(bom).some((x) => x.id === 'windows-versao'), false);
});

test('imagensDoCompose: lista as imagens do arquivo, sem repetir e ignorando comentarios', () => {
  const compose = 'services:\n  a:\n    image: pgvector/pgvector:pg18\n  b:\n    # image: velha:1\n    image: heimdall-x:1.0.0-onnx   # construida aqui\n  c:\n    image: pgvector/pgvector:pg18\n';
  assert.deepEqual(imagensDoCompose(compose), ['pgvector/pgvector:pg18', 'heimdall-x:1.0.0-onnx']);
  assert.deepEqual(imagensDoCompose('nada aqui'), []);
});

test('imagensDoCompose: o Compose real do projeto tem imagens com versao fixa', () => {
  const real = readFileSync(fileURLToPath(new URL('../../../../infra/compose/docker-compose.yml', import.meta.url)), 'utf8');
  const lista = imagensDoCompose(real);
  assert.ok(lista.length >= 4, lista.join(','));
  for (const img of lista) assert.match(img, /:[A-Za-z0-9._-]+$/, `sem tag: ${img}`);
});

test('imagens: faltando mostra os comandos exatos (so mostra, nao baixa) e Docker parado nao mede imagens', () => {
  const v = avaliar({ ...bom, imagensFaltando: ['nousresearch/hermes-agent:v0.22.2'] });
  assert.equal(estado(v, 'imagens'), 'atencao');
  const d = v.find((x) => x.id === 'imagens')!.detalhe;
  assert.match(d, /nousresearch\/hermes-agent:v0\.22\.2/);
  assert.match(d, /docker compose .*pull --ignore-buildable/);
  assert.match(d, /docker compose .*build/);
  assert.equal(estado(avaliar({ ...bom, imagensFaltando: [] }), 'imagens'), 'ok');
  assert.equal(avaliar({ ...bom, imagensFaltando: ['x:1'], dockerRodando: false }).some((x) => x.id === 'imagens'), false);
  assert.equal(avaliar(bom).some((x) => x.id === 'imagens'), false);
});
