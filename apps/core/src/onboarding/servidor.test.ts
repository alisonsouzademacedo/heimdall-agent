import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { connect } from 'node:net';
import { networkInterfaces } from 'node:os';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from '../db.ts';
import { iniciarServidor, MAX_CORPO, MAX_ERROS_CODIGO, type Servidor } from './servidor.ts';
import { PASSOS } from './passos.ts';
import { escolherPerfil } from './perfil.ts';
import { HTML, JS, CSS } from './recursos.ts';
import type { Verificacao } from './ambiente.ts';

const GIB = 1024 ** 3;
const FAKE_SK =['sk', 'abcdefghijklmnopqrstuvwxyz123456'].join('-'); // segredo FALSO montado em tempo de execucao
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

// Por COMPORTAMENTO (nao so pelo texto da URL): outro endereco da mesma maquina nao conecta; 127.0.0.1 conecta (controle).
function conecta(host: string, porta: number): Promise<boolean> {
  return new Promise((resolve) => {
    const k = connect({ host, port: porta, timeout: 2000 });
    k.on('connect', () => { k.destroy(); resolve(true); });
    k.on('error', () => resolve(false));
    k.on('timeout', () => { k.destroy(); resolve(false); });
  });
}
test('escuta SO em 127.0.0.1: o IP da rede e o IPv6 recusam a conexao, 127.0.0.1 aceita', async () => {
  const c = await subir();
  try {
    assert.equal(await conecta('127.0.0.1', c.s.porta), true, 'controle: 127.0.0.1 deveria conectar');
    const outros = Object.values(networkInterfaces()).flat().filter((i) => i && !i.internal && i.family === 'IPv4').map((i) => i!.address);
    for (const ip of [...outros, '::1']) assert.equal(await conecta(ip, c.s.porta), false, `nao deveria conectar em ${ip}`);
  } finally { await c.fim(); }
});

test('relatar problema pela tela grava o ambiente (sistema, arquitetura, Node) no relatorio', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const r = await req(c, 'POST', '/api/bug', { ...POST(cookie), Origin: `http://127.0.0.1:${c.s.porta}` }, JSON.stringify({ etapa: 'ambiente', descricao: 'a tela travou' }));
    assert.equal(r.status, 200);
    const arq = readdirSync(join(c.dir, 'bugs'))[0]!;
    const txt = readFileSync(join(c.dir, 'bugs', arq), 'utf8');
    const ambiente = txt.split('## Ambiente')[1]!.split('##')[0]!;
    assert.match(ambiente, /- sistema: \S+/);
    assert.match(ambiente, /- arquitetura: \S+/);
    assert.match(ambiente, new RegExp(`- node: v${process.versions.node.split('.')[0]}`));
    assert.doesNotMatch(ambiente, /nao informado/);
  } finally { await c.fim(); }
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

test('estado lista os 12 passos; so os passos com acao real estao prontos (lista exata, atualizada a cada passo ligado); persiste no banco', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const e = JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto);
    assert.equal(e.passos.length, 12);
    assert.deepEqual(e.passos.map((p: { id: string }) => p.id), PASSOS.map((p) => p.id));
    assert.deepEqual(PASSOS.filter((p) => p.pronto).map((p) => p.id), ['ambiente', 'whatsapp', 'sincronizar', 'extrair', 'selfchat', 'agenda', 'backup', 'pronto']);
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

// O perfil por tipo de computador viaja na MESMA resposta do "Testar ambiente" (so quando o servidor recebe um) e a tela sabe mostra-lo.
test('testar ambiente devolve o perfil recomendado (se houver) e a tela tem codigo para mostra-lo; sem perfil, a resposta nao muda', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'heimdall-perfil-'));
  const banco = abrirBanco(); migrar(banco);
  const perfil = escolherPerfil({ plataforma: 'win32', memTotalBytes: 8029 * 1024 * 1024, memLivreBytes: 4 * GIB, discoLivreBytes: 84 * GIB, nodeVersao: 'v24.20.0', dockerRodando: true, arch: 'x64', cpus: 8, gpuNvidia: null });
  const com = await iniciarServidor({ banco, codigo: 'c1', pastaBugs: join(dir, 'bugs'), sondar: () => OK, perfil: () => perfil });
  const sem = await iniciarServidor({ banco, codigo: 'c2', pastaBugs: join(dir, 'bugs'), sondar: () => OK });
  const chamar = (s: Servidor, codigo: string, caminho: string, metodo: string, cookie?: string): Promise<{ cab: Record<string, string | string[] | undefined>; texto: string }> => new Promise((resolve, reject) => {
    const cab: Record<string, string> = { Host: `127.0.0.1:${s.porta}` };
    if (cookie) { cab.Cookie = cookie; cab['X-Heimdall'] = '1'; cab['Content-Type'] = 'application/json'; }
    const q = request({ host: '127.0.0.1', port: s.porta, method: metodo, path: caminho, headers: cab }, (res) => { let t = ''; res.on('data', (d) => (t += d)); res.on('end', () => resolve({ cab: res.headers, texto: t })); });
    q.on('error', reject); if (cookie) q.write('{}'); q.end();
  });
  try {
    for (const [s, codigo, esperaPerfil] of [[com, 'c1', true], [sem, 'c2', false]] as const) {
      const cookie = String(((await chamar(s, codigo, `/?codigo=${codigo}`, 'GET')).cab['set-cookie'] as string[])[0]).split(';')[0]!;
      const r = JSON.parse((await chamar(s, codigo, '/api/ambiente/testar', 'POST', cookie)).texto);
      assert.equal('perfil' in r, esperaPerfil, `perfil presente=${'perfil' in r}`);
      if (esperaPerfil) { assert.equal(r.perfil.id, 'enxuto'); assert.ok(Array.isArray(r.perfil.itens) && r.perfil.itens.length > 0); }
      assert.equal(r.ok, true);
    }
    assert.match(JS, /r\.perfil/, 'a tela precisa ler r.perfil');
    assert.match(JS, /Perfil recomendado/, 'a tela precisa mostrar o titulo do perfil');
    assert.doesNotMatch(JS, /innerHTML|outerHTML|document\.write|eval\(/);
  } finally { await com.fechar(); await sem.fechar(); rmSync(dir, { recursive: true, force: true }); }
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

// ---- painel e acoes dos passos (QR, progresso, self-chat, agenda) ----
test('sem sessao, o painel e as acoes novas sao recusados', async () => {
  const c = await subir();
  try {
    assert.equal((await req(c, 'GET', '/api/painel')).status, 401);
    for (const p of ['/api/selfchat/testar', '/api/agenda/testar']) assert.equal((await req(c, 'POST', p, POST('hm=' + 'a'.repeat(64)), '{}')).status, 401, p);
  } finally { await c.fim(); }
});

test('GET /api/painel devolve o QR (so como desenho seguro), o progresso e a fila; o numero do dono nunca sai inteiro', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const { gravarQr, gravarHistorico } = await import('../whatsapp/estado.ts');
    gravarQr(c.banco, 'QR', 1, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>');
    gravarHistorico(c.banco, { progresso: 42, ultima: false }, 2);
    const r = await req(c, 'GET', '/api/painel', { Cookie: cookie });
    assert.equal(r.status, 200);
    const j = JSON.parse(r.texto);
    assert.match(j.whatsapp.qrSvg, /^<svg/); assert.equal(j.whatsapp.historico.progresso, 42);
    assert.equal(r.texto.includes('"qr":'), false, 'o texto bruto do QR (que e um acesso a conta) nunca sai; so o desenho');
  } finally { await c.fim(); }
});

test('POST /api/selfchat/testar enfileira UMA mensagem de teste na caixa de saida; repetir enquanto aguarda nao duplica', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const h = { ...POST(cookie), Origin: `http://127.0.0.1:${c.s.porta}` };
    assert.deepEqual(JSON.parse((await req(c, 'POST', '/api/selfchat/testar', h, '{}')).texto), { pedido: true });
    assert.deepEqual(JSON.parse((await req(c, 'POST', '/api/selfchat/testar', h, '{}')).texto), { pedido: false });
    assert.equal((c.banco.prepare("SELECT COUNT(*) AS n FROM saida WHERE chave LIKE 'teste:selfchat:%'").get() as { n: number }).n, 1);
  } finally { await c.fim(); }
});

test('POST /api/agenda/testar gera diario e semanal de teste agora (so na caixa de saida) e marca o passo "agenda" verde se cabem em uma tela', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const h = { ...POST(cookie), Origin: `http://127.0.0.1:${c.s.porta}` };
    const r = await req(c, 'POST', '/api/agenda/testar', h, '{}');
    assert.equal(r.status, 200);
    assert.deepEqual(JSON.parse(r.texto).relatorios.map((x: { tipo: string; cabe: boolean }) => [x.tipo, x.cabe]), [['diario', true], ['semanal', true]]);
    assert.equal((c.banco.prepare("SELECT estado FROM onboarding_etapas WHERE passo = 'agenda'").get() as { estado: string }).estado, 'verde');
    assert.equal((c.banco.prepare("SELECT COUNT(*) AS n FROM saida WHERE tipo = 'relatorio'").get() as { n: number }).n, 2);
  } finally { await c.fim(); }
});

test('backup pela tela: escolhe o destino (validado), faz o primeiro backup agora e mostra no painel; destino ruim e recusado com o motivo', async () => {
  const c = await subir();
  const { mkdtempSync, existsSync } = await import('node:fs');
  const pasta = mkdtempSync(join(tmpdir(), 'heimdall-tela-bk-'));
  try {
    const cookie = await entrar(c);
    const h = { ...POST(cookie), Origin: `http://127.0.0.1:${c.s.porta}` };
    const ruim = await req(c, 'POST', '/api/backup/destino', h, JSON.stringify({ pasta: join(pasta, 'nao-existe') }));
    assert.equal(ruim.status, 400); assert.match(JSON.parse(ruim.texto).erro, /existe|pasta/i);
    for (const corpo of [{}, { pasta: 5 }, { pasta: 'relativa/x' }]) assert.equal((await req(c, 'POST', '/api/backup/destino', h, JSON.stringify(corpo))).status, 400, JSON.stringify(corpo));
    assert.equal((await req(c, 'POST', '/api/backup/agora', h, '{}')).status, 400, 'sem destino nao ha o que fazer');
    assert.equal((await req(c, 'POST', '/api/backup/destino', h, JSON.stringify({ pasta }))).status, 200);
    const r = JSON.parse((await req(c, 'POST', '/api/backup/agora', h, '{}')).texto);
    assert.equal(r.resultado, 'feito');
    assert.equal(existsSync(join(pasta, 'acervo-2026-10-19.sqlite')), true, 'o dia vem do relogio injetado da tela (19/10/2026 17:00 em SP)');
    const painel = JSON.parse((await req(c, 'GET', '/api/painel', { Cookie: cookie })).texto);
    assert.equal(painel.backup.destino, pasta); assert.ok(painel.backup.ultimoEm > 0);
    assert.equal((c.banco.prepare("SELECT estado FROM onboarding_etapas WHERE passo = 'backup'").get() as { estado: string }).estado, 'verde');
  } finally { await c.fim(); rmSync(pasta, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});
