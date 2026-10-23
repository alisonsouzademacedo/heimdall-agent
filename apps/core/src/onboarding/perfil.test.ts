// Perfil ideal POR TIPO DE COMPUTADOR (docs/plano/fase-1-perfis-de-computador.md). Cada teste e um tipo de maquina real ou limite.
// Regra de honestidade: so o perfil de 8 GB tem itens "medido" (medicao de 2026-10-20 na maquina do dono); os demais sao documentacao/estimativa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { escolherPerfil, descreverPerfil, type Perfil } from './perfil.ts';
import type { Medidas } from './ambiente.ts';

const GIB = 1024 ** 3;
const MIB = 1024 ** 2;
const base: Medidas = { plataforma: 'win32', memTotalBytes: 16 * GIB, memLivreBytes: 8 * GIB, discoLivreBytes: 100 * GIB, nodeVersao: 'v24.20.0', dockerRodando: true, arch: 'x64', cpus: 8, gpuNvidia: null };
const maq = (o: Partial<Medidas>): Medidas => ({ ...base, ...o });
const texto = (p: Perfil): string => p.itens.map((i) => `${i.rotulo}: ${i.valor}`).join('\n');
const tudo = (p: Perfil): string => [p.nome, p.resumo, texto(p), p.avisos.join('\n'), p.passos.join('\n')].join('\n');

// O notebook do dono (medido em 2026-10-20): 8029 MB, 84 GB livres, i5-9300H com 8 CPUs logicas, GTX 1650 com 4 GB, ~1 GB livre com programas abertos.
const DONO = maq({ memTotalBytes: 8029 * MIB, memLivreBytes: 1054 * MIB, discoLivreBytes: 84 * GIB, cpus: 8, gpuNvidia: { nome: 'NVIDIA GeForce GTX 1650', vramMb: 4096 } });

test('4 GB: insuficiente, nao recomendado, aponta o servidor externo (D8) e nao sugere modelo nenhum', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 4 * GIB, memLivreBytes: 2 * GIB }));
  assert.equal(p.id, 'insuficiente');
  assert.equal(p.adequacao, 'nao_recomendado');
  assert.match(p.passos.join(' '), /servidor/i);
  assert.doesNotMatch(tudo(p), /large|medium|turbo/i);
});

test('o notebook do dono (8 GB, GTX 1650, ~1 GB livre): perfil "enxuto", apertado, com os numeros medidos', () => {
  const p = escolherPerfil(DONO);
  assert.equal(p.id, 'enxuto');
  assert.equal(p.adequacao, 'apertado');
  const t = texto(p);
  assert.match(t, /slim/);
  assert.match(t, /onnx/i);
  assert.match(t, /small/);
  assert.match(t, /int8/);
  assert.doesNotMatch(tudo(p), /large|medium|turbo/i, 'modelo grande de Whisper nao cabe em 8 GB');
  assert.ok(p.itens.filter((i) => i.origem === 'medido').length >= 4, 'o perfil de 8 GB tem de citar o que foi MEDIDO');
  assert.match(p.avisos.join(' '), /livre/i, 'com ~1 GB livre tem de avisar para fechar programas');
});

// Servidor Linux de 8 GB (ex.: VPS): os numeros dos servicos foram medidos no Windows. No Linux nao ha a VM do WSL nem o Docker Desktop
// (cerca de 2,5 GB medidos no Windows), entao a folga tende a ser MAIOR, mas isso NAO foi medido: o perfil nao pode copiar a conclusao do Windows.
test('Linux com 8 GB (VPS): nao repete a conclusao do Windows, diz que o Linux nao foi medido e nao cita a VM do WSL', () => {
  const p = escolherPerfil(maq({ plataforma: 'linux', memTotalBytes: 7.8 * GIB, memLivreBytes: 5.7 * GIB, discoLivreBytes: 33 * GIB, cpus: 4 }));
  assert.equal(p.id, 'enxuto');
  assert.doesNotMatch(p.resumo, /Windows chegou/i, 'a conclusao "memoria livre do Windows" nao vale no Linux');
  assert.doesNotMatch(texto(p), /VM do Docker \(WSL\)/, 'nao existe VM do WSL no Linux');
  assert.match(p.avisos.join(' '), /medid\w+ (num|no) (notebook )?Windows/i, 'avisa que os numeros vieram do Windows');
  assert.match(p.avisos.join(' '), /Linux.*nao.*medid|nao.*medid.*Linux/i, 'avisa que o Linux nao foi medido');
  assert.match(tudo(p), /Docker Engine/);
});

test('8 GB com a placa de video: a GPU aparece como opcao NAO VERIFICADA, nunca como padrao', () => {
  const t = tudo(escolherPerfil(DONO));
  assert.match(t, /GPU/);
  assert.match(t, /nao verificad|a verificar/i);
  assert.doesNotMatch(texto(escolherPerfil(DONO)), /float16/, 'o padrao do perfil de 8 GB e CPU int8');
});

test('8 GB com bastante memoria livre: nao avisa de memoria livre', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 8029 * MIB, memLivreBytes: 6 * GIB }));
  assert.equal(p.id, 'enxuto');
  assert.doesNotMatch(p.avisos.join(' '), /memoria livre/i);
});

test('16 GB no Windows sem placa de video: "equilibrado", imagem completa do Hindsight, sem GPU', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 16 * GIB }));
  assert.equal(p.id, 'equilibrado');
  assert.equal(p.adequacao, 'ok');
  assert.match(texto(p), /completa/i);
  assert.doesNotMatch(texto(p), /float16/);
  assert.match(tudo(p), /Docker Desktop/);
});

test('32 GB no Linux com NVIDIA de 12 GB: "folgado", Whisper em float16 na GPU (CUDA 12), Docker Engine', () => {
  const p = escolherPerfil(maq({ plataforma: 'linux', memTotalBytes: 32 * GIB, gpuNvidia: { nome: 'NVIDIA GeForce RTX 3060', vramMb: 12288 } }));
  assert.equal(p.id, 'folgado');
  assert.equal(p.adequacao, 'ok');
  assert.match(texto(p), /float16/);
  assert.match(texto(p), /faster-whisper na GPU/, 'o Whisper do perfil folgado com GPU boa roda na GPU');
  assert.match(tudo(p), /CUDA 12/);
  assert.match(tudo(p), /Docker Engine/);
  assert.doesNotMatch(tudo(p), /Docker Desktop/);
});

test('Mac Apple Silicon (arm64) com 16 GB: sem GPU NVIDIA, Docker Desktop, avisa que e arm64', () => {
  const p = escolherPerfil(maq({ plataforma: 'darwin', arch: 'arm64', memTotalBytes: 16 * GIB }));
  assert.equal(p.id, 'equilibrado');
  assert.match(tudo(p), /Docker Desktop/);
  assert.match(tudo(p), /arm64/);
  assert.match(tudo(p), /sem GPU NVIDIA/);
  assert.doesNotMatch(texto(p), /float16/);
});

test('disco pequeno derruba a adequacao mesmo com muita memoria (menos de 30 GB livres)', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 32 * GIB, discoLivreBytes: 20 * GIB }));
  assert.equal(p.adequacao, 'nao_recomendado');
  assert.match(p.avisos.join(' '), /disco/i);
});

test('disco de 30 a 50 GB: avisa da folga, mas nao reprova', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 16 * GIB, discoLivreBytes: 40 * GIB }));
  assert.equal(p.adequacao, 'ok');
  assert.match(p.avisos.join(' '), /disco/i);
});

test('poucas CPUs (2): avisa que a transcricao sera lenta (nao medido)', () => {
  const p = escolherPerfil(maq({ memTotalBytes: 8029 * MIB, memLivreBytes: 6 * GIB, cpus: 2 }));
  assert.match(p.avisos.join(' '), /CPU|nucleo/i);
});

test('limites de memoria usam o arredondamento do verificador (7,5 GiB conta como 8; 7,49 como 7)', () => {
  const id = (gib: number) => escolherPerfil(maq({ memTotalBytes: gib * GIB })).id;
  assert.equal(id(7.49), 'insuficiente');
  assert.equal(id(7.5), 'enxuto');
  assert.equal(id(11.49), 'enxuto');
  assert.equal(id(11.5), 'equilibrado');
  assert.equal(id(23.49), 'equilibrado');
  assert.equal(id(23.5), 'folgado');
});

test('aviso de memoria livre: 1,99 GiB avisa; 2 GiB nao', () => {
  assert.match(escolherPerfil(maq({ memTotalBytes: 8029 * MIB, memLivreBytes: 1.99 * GIB })).avisos.join(' '), /memoria livre/i);
  assert.doesNotMatch(escolherPerfil(maq({ memTotalBytes: 8029 * MIB, memLivreBytes: 2 * GIB })).avisos.join(' '), /memoria livre/i);
});

test('honestidade: so o perfil de 8 GB tem itens "medido"; equilibrado e folgado sao documentacao ou estimativa', () => {
  const validas = new Set(['medido', 'documentacao', 'estimativa']);
  for (const m of [DONO, maq({}), maq({ memTotalBytes: 32 * GIB }), maq({ memTotalBytes: 4 * GIB })]) {
    const p = escolherPerfil(m);
    for (const i of p.itens) assert.ok(validas.has(i.origem), `${p.id}: origem invalida ${i.origem}`);
    if (p.id === 'equilibrado' || p.id === 'folgado') assert.ok(p.itens.every((i) => i.origem !== 'medido'), `${p.id} nao foi medido`);
  }
});

test('sistema desconhecido: nao recomendado, com aviso', () => {
  const p = escolherPerfil(maq({ plataforma: 'sunos' }));
  assert.equal(p.adequacao, 'nao_recomendado');
  assert.match(p.avisos.join(' '), /sistema/i);
});

test('funcao pura: nao altera a medida recebida e devolve o mesmo resultado duas vezes', () => {
  const m = Object.freeze({ ...DONO, gpuNvidia: Object.freeze({ ...DONO.gpuNvidia! }) });
  assert.deepEqual(escolherPerfil(m), escolherPerfil(m));
});

test('descreverPerfil: texto para o console com nome, adequacao, cada item, aviso e passo', () => {
  const p = escolherPerfil(DONO);
  const linhas = descreverPerfil(p);
  assert.match(linhas[0]!, /Perfil recomendado/);
  assert.ok(linhas[0]!.includes(p.nome));
  const junto = linhas.join('\n');
  for (const i of p.itens) assert.ok(junto.includes(i.rotulo), `falta o item ${i.rotulo}`);
  for (const a of p.avisos) assert.ok(junto.includes(a));
  for (const s of p.passos) assert.ok(junto.includes(s));
});

test('disco com tudo instalado: 28 GB livres nao reprova o perfil (o limite de 30 GB e para instalar)', () => {
  const instalado = escolherPerfil(maq({ plataforma: 'linux', memTotalBytes: 7.8 * GIB, memLivreBytes: 5 * GIB, discoLivreBytes: 28 * GIB, cpus: 4, dockerRodando: true, imagensFaltando: [] }));
  assert.doesNotMatch(instalado.avisos.join(' '), /30 GB/);
  const naoInstalado = escolherPerfil(maq({ plataforma: 'linux', memTotalBytes: 7.8 * GIB, memLivreBytes: 5 * GIB, discoLivreBytes: 28 * GIB, cpus: 4, dockerRodando: true, imagensFaltando: ['x:1'] }));
  assert.match(naoInstalado.avisos.join(' '), /30 GB/);
});
