import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sanitizar, slug, montarRelatorio, gravarRelatorio, nomeDoArquivo, listarAbertos, MAX_SAIDA, type DadosBug } from './bugs.ts';

// Segredos FALSOS montados em tempo de execucao (o teste de higiene do repositorio procura padroes de chave nos arquivos).
const FAKE_SK = ['sk', 'abcdefghijklmnopqrstuvwxyz123456'].join('-');
const FAKE_GHP = ['ghp', 'abcdefghijklmnopqrstuvwxyz1234567890'].join('_');
const AGORA = Date.parse('2026-10-19T19:30:00Z');
const base: DadosBug = { etapa: 'Docker Desktop', resumo: 'Instalador do Docker falhou', origem: 'instalador' };

test('sanitizar: remove chaves de API, tokens do GitHub e Bearer', () => {
  const t = `erro com ${FAKE_SK} e ${FAKE_GHP} e github_pat_11ABCDEFG0123456789abcdef e Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def`;
  const r = sanitizar(t);
  for (const segredo of ['abcdefghijklmnopqrstuvwxyz123456', 'ghp_abcdef', '11ABCDEFG0123456789', 'eyJhbGciOiJIUzI1NiJ9']) assert.ok(!r.includes(segredo), segredo);
});

test('sanitizar: mascara o valor depois de token=, api_key:, senha= mas mantem o nome do campo', () => {
  const r = sanitizar('API_KEY=meusegredo123 token: abc.def senha="troca123" password=x');
  assert.ok(!r.includes('meusegredo123') && !r.includes('troca123'));
  assert.match(r, /API_KEY=\*\*\*/);
  assert.match(r, /senha="\*\*\*/i);
});

test('sanitizar: telefones, JIDs, e-mails e usuario do Windows/Linux', () => {
  const r = sanitizar('contato 5555999990000@s.whatsapp.net grupo 123456-789@g.us fone +55 55 99999-0000 mail joao@empresa.com.br pasta C:\\Users\\Joao\\Heimdall e /home/maria/x');
  for (const vazou of ['5555999990000', '123456-789', '99999-0000', 'joao@empresa', 'Joao', 'maria']) assert.ok(!r.includes(vazou), vazou);
  assert.match(r, /C:\\Users\\<usuario>\\Heimdall/);
});

test('sanitizar: chave privada e hash longo', () => {
  const r = sanitizar(['-----BEGIN RSA', 'PRIVATE KEY-----'].join(' ') + '\nMIIabc\n' + ['-----END RSA', 'PRIVATE KEY-----'].join(' ') + ' e ' + 'a'.repeat(50));
  assert.ok(!r.includes('MIIabc'));
  assert.ok(!r.includes('a'.repeat(50)));
});

test('sanitizar nao estraga texto comum de erro', () => {
  const t = "npm ERR! code ENOENT\nnpm ERR! path C:\\Heimdall\\apps\\core\\package.json\nnode v22.22.0";
  assert.equal(sanitizar(t), t);
});

test('slug: sem acento, minusculo, limitado e nunca vazio', () => {
  assert.equal(slug('Docker Desktop'), 'docker-desktop');
  assert.equal(slug('Instalação: Ação!'), 'instalacao-acao');
  assert.equal(slug('../../etc/passwd'), 'etc-passwd');
  assert.equal(slug('???'), 'sem-nome');
  assert.ok(slug('x'.repeat(100)).length <= 40);
});

test('relatorio: tem cabecalho legivel por maquina, secoes e instrucoes para a IA', () => {
  const md = montarRelatorio({ ...base, comando: 'Docker Desktop Installer.exe install --user', saida: 'falhou', codigoSaida: 1, ambiente: { Sistema: 'Windows 11', Node: 'v22.22.0' } }, AGORA);
  assert.match(md, /^---\ntipo: bug\nid: 20261019-193000-docker-desktop\norigem: instalador\netapa: docker-desktop\nestado: aberto\ncriado_em: 2026-10-19T19:30:00.000Z\n---/);
  assert.match(md, /# Bug: Instalador do Docker falhou/);
  assert.match(md, /Codigo de saida: 1/);
  assert.match(md, /- sistema: Windows 11/);
  assert.match(md, /Bugs de instalacao/);
  assert.match(md, /teste automatizado que FALHA/);
});

test('relatorio: segredo no comando, no resumo e na saida nunca chega ao arquivo', () => {
  const md = montarRelatorio({ ...base, resumo: 'falha com token=abc123segredo', comando: 'curl -H "Authorization: Bearer abcdefghijklmnop12345" x', saida: FAKE_SK, ambiente: { chave: FAKE_GHP } }, AGORA);
  for (const vazou of ['abc123segredo', 'abcdefghijklmnop12345', 'abcdefghijklmnopqrstuvwxyz123456', 'ghp_abcdef']) assert.ok(!md.includes(vazou), vazou);
});

test('relatorio: saida enorme e cortada no FINAL (onde esta o erro)', () => {
  const md = montarRelatorio({ ...base, saida: 'inicio '.repeat(2000) + 'ERRO-FINAL' }, AGORA);
  assert.match(md, /cortado/);
  assert.match(md, /ERRO-FINAL/);
  assert.ok(md.length < MAX_SAIDA + 3000);
});

test('gravar: cria a pasta, nao sobrescreve e numera repeticoes no mesmo segundo', () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-bugs-'));
  try {
    const pasta = join(dir, 'data', 'bugs');
    const a = gravarRelatorio(pasta, base, AGORA);
    const b = gravarRelatorio(pasta, base, AGORA);
    assert.notEqual(a, b);
    assert.deepEqual(readdirSync(pasta).sort(), [nomeDoArquivo(base, AGORA), nomeDoArquivo(base, AGORA).replace('.md', '-2.md')].sort());
    assert.match(readFileSync(a, 'utf8'), /estado: aberto/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('listar abertos: so os com estado aberto; resolvido some da lista', () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-bugs-'));
  try {
    const a = gravarRelatorio(dir, base, AGORA);
    gravarRelatorio(dir, { ...base, etapa: 'git' }, AGORA);
    assert.equal(listarAbertos(dir).length, 2);
    const fs = readFileSync(a, 'utf8').replace('estado: aberto', 'estado: resolvido');
    // marca como resolvido regravando por cima (a IA faz isso editando o arquivo)
    return import('node:fs').then(({ writeFileSync }) => { writeFileSync(a, fs); assert.equal(listarAbertos(dir).length, 1); assert.deepEqual(listarAbertos(join(dir, 'nao-existe')), []); }).finally(() => rmSync(dir, { recursive: true, force: true }));
  } catch (e) { rmSync(dir, { recursive: true, force: true }); throw e; }
});
