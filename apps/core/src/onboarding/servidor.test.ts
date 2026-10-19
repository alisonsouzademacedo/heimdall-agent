import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from '../db.ts';
import { iniciarServidor, MAX_CORPO, MAX_ERROS_CODIGO, type Servidor } from './servidor.ts';
import { PASSOS } from './passos.ts';
import { HTML, JS, CSS } from './recursos.ts';
import type { Verificacao } from './ambiente.ts';

const FAKE_SK = ['sk', 'abcdefghijklmnopqrstuvwxyz123456'].join('-'); // segredo FALSO montado em tempo de execucao
const CODIGO = 'codigo-de-teste-123';
const OK: Verificacao[] = [{ id: 'docker', rotulo: 'Docker', detalhe: 'Rodando', estado: 'ok' }];
const RUIM: Verificacao[] = [{ id: 'docker', rotulo: 'Docker', detalhe: 'parado', estado: 'falha' }];

interface Ctx { s: Servidor; dir: string; banco: ReturnType<typeof abrirBanco>; sonda: { v: Verificacao[] }; fim: () => Promise<void> }
async function subir(): Promise<Ctx> {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-tela-'));
  const banco = abrirBanco(); migrar(banco);
  const sonda = { v: OK };
  const s = await iniciarServidor({ banco, codigo: CODIGO, pastaBugs: join(dir, 'bugs'), sondar: () => sonda.v, agora: () => Date.parse('2026-10-19T20:00:00Z') });
  return { s, dir, banco, sonda, fim: async () => { await s.fechar(); rmSync(dir, { recursive: true, force: true }); } };
}
// requisicao com controle total dos cabecalhos (fetch nao deixa mudar o Host)
function req(c: Ctx, metodo: string, caminho: string, cab: Record<string, string> = {}, corpo?: string): Promise<{ status: number; cab: Record<string, string | string[] | undefined>; texto: string }> {
  return new Promise((resolve, reject) => {
    const r = request({ host: '127.0.0.1', port: c.s.porta, method: metodo, path: caminho, headers: { Host: `127.0.0.1:${c.s.porta}`, ...cab } }, (res) => {
      let t = ''; res.on('data', (d) => (t += d)); res.on('end', () => resolve({ status: res.statusCode!, cab: res.headers, texto: t }));
    });
    r.on('error', reject);
    if (corpo !== undefined) r.write(corpo);
    r.end();
  });
}
async function entrar(c: Ctx): Promise<string> {
  const r = await req(c, 'GET', `/?codigo=${CODIGO}`);
  assert.equal(r.status, 302);
  return String((r.cab['set-cookie'] as string[])[0]).split(';')[0]!;
}
const POST = (cookie: string) => ({ Cookie: cookie, 'X-Heimdall': '1', 'Content-Type': 'application/json' });

test('escuta SO em 127.0.0.1', async () => {
  const c = await subir();
  try { assert.match(c.s.url, /^http:\/\/127\.0\.0\.1:\d+$/); } finally { await c.fim(); }
});

test('sem sessao: tudo e recusado (pagina e API)', async () => {
  const c = await subir();
  try {
    for (const p of ['/', '/api/estado', '/app.js', '/app.css']) assert.equal((await req(c, 'GET', p)).status, 401, p);
    assert.equal((await req(c, 'POST', '/api/bug', POST('hm=' + 'a'.repeat(64)), '{}')).status, 401);
    assert.equal((await req(c, 'GET', '/api/estado', { Cookie: 'hm=' + 'f'.repeat(64) })).status, 401);
  } finally { await c.fim(); }
});

test('codigo certo: cookie HttpOnly + SameSite=Strict; depois a tela abre', async () => {
  const c = await subir();
  try {
    const r = await req(c, 'GET', `/?codigo=${CODIGO}`);
    assert.equal(r.status, 302);
    const sc = String((r.cab['set-cookie'] as string[])[0]);
    assert.match(sc, /^hm=[0-9a-f]{64}; HttpOnly; SameSite=Strict; Path=\/$/);
    const cookie = sc.split(';')[0]!;
    const home = await req(c, 'GET', '/', { Cookie: cookie });
    assert.equal(home.status, 200);
    assert.match(home.texto, /HEIMDALL/);
  } finally { await c.fim(); }
});

test('o codigo e de USO UNICO', async () => {
  const c = await subir();
  try {
    await entrar(c);
    assert.equal((await req(c, 'GET', `/?codigo=${CODIGO}`)).status, 403);
  } finally { await c.fim(); }
});

test('codigo errado e recusado e apos 5 erros ate o certo e bloqueado', async () => {
  const c = await subir();
  try {
    for (let i = 0; i < MAX_ERROS_CODIGO; i++) assert.equal((await req(c, 'GET', '/?codigo=errado')).status, 403);
    assert.equal((await req(c, 'GET', `/?codigo=${CODIGO}`)).status, 403);
  } finally { await c.fim(); }
});

test('Host falso (DNS rebinding) e recusado mesmo com sessao valida', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    for (const h of ['evil.com', `evil.com:${c.s.porta}`, '127.0.0.1', ' ', `LOCALHOST:${c.s.porta}`.replace('LOCALHOST', 'evil')]) assert.equal((await req(c, 'GET', '/api/estado', { Cookie: cookie, Host: h })).status, 403, h);
    assert.equal((await req(c, 'GET', '/api/estado', { Cookie: cookie, Host: `localhost:${c.s.porta}` })).status, 200);
  } finally { await c.fim(); }
});

test('POST exige o cabecalho proprio, Origin local e JSON', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const corpo = JSON.stringify({ etapa: 'ambiente', descricao: 'teste' });
    assert.equal((await req(c, 'POST', '/api/bug', { Cookie: cookie, 'Content-Type': 'application/json' }, corpo)).status, 403); // sem X-Heimdall
    assert.equal((await req(c, 'POST', '/api/bug', { ...POST(cookie), Origin: 'http://evil.com' }, corpo)).status, 403); // outro site
    assert.equal((await req(c, 'POST', '/api/bug', { ...POST(cookie), 'Content-Type': 'text/plain' }, corpo)).status, 415);
    assert.equal((await req(c, 'POST', '/api/bug', { ...POST(cookie), Origin: `http://127.0.0.1:${c.s.porta}` }, corpo)).status, 200);
  } finally { await c.fim(); }
});

test('corpo grande demais e recusado; JSON quebrado tambem', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const r = await req(c, 'POST', '/api/bug', POST(cookie), JSON.stringify({ etapa: 'ambiente', descricao: 'x'.repeat(MAX_CORPO + 10) })).catch(() => ({ status: 413 }));
    assert.equal(r.status, 413);
    assert.equal((await req(c, 'POST', '/api/bug', POST(cookie), '{quebrado')).status, 400);
  } finally { await c.fim(); }
});

test('metodos estranhos e rotas inexistentes', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    assert.equal((await req(c, 'DELETE', '/api/estado', { Cookie: cookie })).status, 405);
    assert.equal((await req(c, 'PUT', '/api/bug', POST(cookie), '{}')).status, 405);
    assert.equal((await req(c, 'GET', '/api/nao-existe', { Cookie: cookie })).status, 404);
    assert.equal((await req(c, 'POST', '/api/enviar', POST(cookie), '{}')).status, 404); // nao existe rota de envio
  } finally { await c.fim(); }
});

test('estado lista os 12 passos; so o ambiente esta pronto; persiste no banco', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const e = JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto);
    assert.equal(e.passos.length, 12);
    assert.deepEqual(e.passos.map((p: { id: string }) => p.id), PASSOS.map((p) => p.id));
    assert.equal(PASSOS.filter((p) => p.pronto).length, 1);
    assert.ok(e.passos.every((p: { estado: string }) => p.estado === 'pendente'));
    assert.equal(e.bugsAbertos, 0);
  } finally { await c.fim(); }
});

test('testar ambiente: verde quando tudo ok, vermelho com o motivo quando ha falha, e grava no banco', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    let r = JSON.parse((await req(c, 'POST', '/api/ambiente/testar', POST(cookie), '{}')).texto);
    assert.equal(r.ok, true);
    assert.equal((c.banco.prepare("SELECT estado FROM onboarding_etapas WHERE passo = 'ambiente'").get() as { estado: string }).estado, 'verde');
    c.sonda.v = RUIM;
    r = JSON.parse((await req(c, 'POST', '/api/ambiente/testar', POST(cookie), '{}')).texto);
    assert.equal(r.ok, false);
    const linha = c.banco.prepare("SELECT estado, erro FROM onboarding_etapas WHERE passo = 'ambiente'").get() as { estado: string; erro: string };
    assert.deepEqual({ ...linha }, { estado: 'vermelho', erro: 'Docker' });
  } finally { await c.fim(); }
});

test('retomavel: um servidor novo sobre o mesmo banco mostra o passo ja verde', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    await req(c, 'POST', '/api/ambiente/testar', POST(cookie), '{}');
    const s2 = await iniciarServidor({ banco: c.banco, codigo: 'outro', pastaBugs: join(c.dir, 'bugs'), sondar: () => OK });
    try {
      const r = await new Promise<string>((resolve, reject) => { const q = request({ host: '127.0.0.1', port: s2.porta, path: '/?codigo=outro', headers: { Host: `127.0.0.1:${s2.porta}` } }, (res) => resolve(String((res.headers['set-cookie'] as string[])[0]).split(';')[0]!)); q.on('error', reject); q.end(); });
      const est = await new Promise<string>((resolve, reject) => { const q = request({ host: '127.0.0.1', port: s2.porta, path: '/api/estado', headers: { Host: `127.0.0.1:${s2.porta}`, Cookie: r } }, (res) => { let t = ''; res.on('data', (d) => (t += d)); res.on('end', () => resolve(t)); }); q.on('error', reject); q.end(); });
      assert.equal(JSON.parse(est).passos[0].estado, 'verde');
    } finally { await s2.fechar(); }
  } finally { await c.fim(); }
});

test('relatar problema: grava o arquivo em bugs/, sem segredos, e a contagem de abertos sobe', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const r = JSON.parse((await req(c, 'POST', '/api/bug', POST(cookie), JSON.stringify({ etapa: 'ambiente', descricao: `O Docker nao abre. minha chave ${FAKE_SK} e token=segredo99` }))).texto);
    assert.match(r.arquivo, /^20261019-200000-onboarding-ambiente\.md$/);
    assert.deepEqual(readdirSync(join(c.dir, 'bugs')), [r.arquivo]);
    const arq = readFileSync(join(c.dir, 'bugs', r.arquivo), 'utf8');
    assert.match(arq, /origem: onboarding/);
    assert.ok(!arq.includes('abcdefghijklmnopqrstuvwxyz123456') && !arq.includes('segredo99'));
    assert.ok(!r.arquivo.includes('/') && !JSON.stringify(r).includes(c.dir)); // nao devolve o caminho do disco
    assert.equal(JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto).bugsAbertos, 1);
  } finally { await c.fim(); }
});

test('relatar problema: etapa desconhecida, descricao vazia ou enorme sao recusadas', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    for (const corpo of [{ etapa: '../../etc', descricao: 'x' }, { etapa: 'ambiente', descricao: '   ' }, { etapa: 'ambiente', descricao: 'x'.repeat(4001) }, { etapa: 5, descricao: 'x' }, {}]) {
      assert.equal((await req(c, 'POST', '/api/bug', POST(cookie), JSON.stringify(corpo))).status, 400, JSON.stringify(corpo).slice(0, 40));
    }
    assert.throws(() => readdirSync(join(c.dir, 'bugs')));
  } finally { await c.fim(); }
});

test('toda resposta leva politica de seguranca restritiva e nenhum recurso externo', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    for (const p of ['/', '/app.js', '/app.css', '/api/estado']) {
      const r = await req(c, 'GET', p, { Cookie: cookie });
      assert.match(String(r.cab['content-security-policy']), /default-src 'none'.*frame-ancestors 'none'/, p);
      assert.equal(r.cab['x-content-type-options'], 'nosniff');
      assert.equal(r.cab['cache-control'], 'no-store');
    }
    for (const conteudo of [HTML, JS, CSS]) assert.doesNotMatch(conteudo, /https?:\/\/(?!127\.0\.0\.1)/);
    assert.doesNotMatch(JS, /innerHTML|outerHTML|document\.write|eval\(/);
  } finally { await c.fim(); }
});

test('a pagina nao carrega o codigo nem a sessao', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const home = (await req(c, 'GET', '/', { Cookie: cookie })).texto + (await req(c, 'GET', '/app.js', { Cookie: cookie })).texto;
    assert.ok(!home.includes(CODIGO) && !home.includes(cookie.split('=')[1]!));
  } finally { await c.fim(); }
});
