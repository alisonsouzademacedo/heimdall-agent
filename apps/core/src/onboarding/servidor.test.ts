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
    assert.deepEqual(PASSOS.filter((p) => p.pronto).map((p) => p.id), ['ambiente', 'whatsapp', 'cadastro', 'sincronizar', 'extrair', 'modelo', 'processar', 'selfchat', 'agenda', 'backup', 'pronto']);
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

// D (2026-10-21): o passo "Processar" mostra a conta e so libera o modelo com confirmacao explicita do dono.
test('/api/processamento mostra a trava e a conta de dias (sem enfileirar); liberar exige confirmacao; pausar volta a fechar; sem sessao = 401', async () => {
  const c = await subir();
  try {
    assert.equal((await req(c, 'GET', '/api/processamento')).status, 401);
    assert.equal((await req(c, 'POST', '/api/processamento/liberar', POST('hm=' + 'a'.repeat(64)), '{"liberar":true,"confirmar":true}')).status, 401);
    const h = POST(await entrar(c));
    const g = JSON.parse((await req(c, 'GET', '/api/processamento', { Cookie: h.Cookie })).texto);
    assert.deepEqual({ liberada: g.liberada, novos: g.diasNovos, refeitos: g.diasRefeitos, fila: g.naFila }, { liberada: false, novos: 0, refeitos: 0, fila: 0 });
    assert.equal((await req(c, 'POST', '/api/processamento/liberar', h, '{"liberar":true}')).status, 400, 'sem confirmar nao libera');
    assert.equal(JSON.parse((await req(c, 'GET', '/api/processamento', { Cookie: h.Cookie })).texto).liberada, false);
    assert.equal((await req(c, 'POST', '/api/processamento/liberar', h, '{"liberar":true,"confirmar":true}')).status, 200);
    assert.equal(JSON.parse((await req(c, 'GET', '/api/processamento', { Cookie: h.Cookie })).texto).liberada, true);
    assert.equal((await req(c, 'POST', '/api/processamento/liberar', h, '{"liberar":false}')).status, 200, 'pausar nao pede confirmacao');
    assert.equal(JSON.parse((await req(c, 'GET', '/api/processamento', { Cookie: h.Cookie })).texto).liberada, false);
    assert.equal((await req(c, 'POST', '/api/processamento/liberar', h, '{"liberar":"sim"}')).status, 400, 'valor invalido');
  } finally { await c.fim(); }
});

// B (2026-10-21): o menu lateral mostra "processando" com barra e texto; o verde gravado antes nao vale mais para sincronizar/extrair.
test('/api/estado: sincronizar e extrair vem AO VIVO (processando, percentual e detalhe) mesmo que o banco tenha guardado verde antes', async () => {
  const c = await subir();
  try {
    const { gravarEstado, gravarHistorico } = await import('../whatsapp/estado.ts');
    const { criarEscuta } = await import('../whatsapp/escuta.ts');
    gravarEstado(c.banco, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, 1); gravarHistorico(c.banco, { progresso: 100, ultima: true }, 2);
    const e = criarEscuta(c.banco, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => 1_760_000_000_000 });
    for (let i = 0; i < 10; i++) e.mensagens([{ key: { id: `A${i}`, remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: 1_760_000_000 - i }], 'historico', () => '{}');
    // O historico antigo desta conversa ja foi concluido: sem isso, o passo fica pendente (busca pausada), de proposito.
    c.banco.prepare("INSERT OR IGNORE INTO historico_pedidos (conversa_id, estado) SELECT id, 'concluida' FROM conversas WHERE tipo IN ('dm','grupo')").run();
    c.banco.prepare("UPDATE fila SET estado = 'ok' WHERE id IN (SELECT id FROM fila ORDER BY id LIMIT 4)").run();
    c.banco.prepare("UPDATE onboarding_etapas SET estado = 'verde' WHERE passo IN ('sincronizar','extrair')").run(); // verde antigo, "pegajoso"
    const cookie = await entrar(c);
    const r = JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto);
    const por = (id: string) => r.passos.find((p: { id: string }) => p.id === id);
    assert.deepEqual({ e: por('extrair').estado, p: por('extrair').percentual }, { e: 'processando', p: 40 });
    assert.match(por('extrair').detalhe, /4 de 10 arquivos/);
    assert.equal(por('sincronizar').estado, 'verde', 'historico recebido por inteiro');
    assert.equal(por('whatsapp').percentual, null, 'passo sem total conhecido: nada de porcentagem inventada');
    assert.equal(typeof por('whatsapp').detalhe, 'string');
    c.banco.prepare("UPDATE fila SET estado = 'ok'").run();
    assert.equal(JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto).passos.find((p: { id: string }) => p.id === 'extrair').estado, 'verde');
  } finally { await c.fim(); }
});

// C: "Conectar o modelo": a tela guia, pede o teste e mostra o resultado; NUNCA recebe nem devolve token ou chave.
test('/api/modelo: pedir teste (uma vez), ler o resultado e as instrucoes; sem sessao = 401; resposta sem token/chave', async () => {
  const c = await subir();
  try {
    assert.equal((await req(c, 'GET', '/api/modelo')).status, 401);
    assert.equal((await req(c, 'POST', '/api/modelo/testar', POST('hm=' + 'a'.repeat(64)), '{}')).status, 401);
    const h = POST(await entrar(c));
    const g0 = JSON.parse((await req(c, 'GET', '/api/modelo', { Cookie: h.Cookie })).texto);
    assert.equal(g0.teste.estado, 'nenhum');
    assert.ok(g0.passos.some((p: string) => /hermes model/.test(p)), 'guia o login no terminal');
    assert.ok(g0.passos.some((p: string) => /5 horas|cota/i.test(p)), 'avisa da cota compartilhada');
    assert.doesNotMatch(g0.passos.join(' '), /runbooks\/|docs\/|decisao D26/i, 'a tela do dono nao mostra caminho de documentacao interna');
    assert.deepEqual(JSON.parse((await req(c, 'POST', '/api/modelo/testar', h, '{}')).texto), { pedido: true });
    assert.deepEqual(JSON.parse((await req(c, 'POST', '/api/modelo/testar', h, '{}')).texto), { pedido: false });
    const g1 = (await req(c, 'GET', '/api/modelo', { Cookie: h.Cookie })).texto;
    assert.equal(JSON.parse(g1).teste.estado, 'pedido');
    assert.doesNotMatch(g1, /sk-[A-Za-z0-9_-]{10,}|Bearer\s+\S{10,}|API_SERVER_KEY\s*=/);
    assert.doesNotMatch(JSON.stringify(JSON.parse(g1).teste), /sk-|token|bearer|chave|key/i, 'os DADOS do teste nao carregam nada parecido com credencial');
    const { executarTesteDoModelo } = await import('../modelo-teste.ts');
    await executarTesteDoModelo(c.banco, { perguntar: async () => 'ok' }, Date.now());
    assert.equal(JSON.parse((await req(c, 'GET', '/api/modelo', { Cookie: h.Cookie })).texto).teste.estado, 'ok');
    assert.equal((await req(c, 'POST', '/api/modelo/chave', h, '{"chave":"x"}')).status, 404, 'nao existe rota que receba chave');
  } finally { await c.fim(); }
});

test('/api/estado: teste do modelo que falhou deixa o passo vermelho (nao "aguardando")', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    const { pedirTesteDoModelo, executarTesteDoModelo } = await import('../modelo-teste.ts');
    assert.equal(pedirTesteDoModelo(c.banco, Date.now()), true);
    await executarTesteDoModelo(c.banco, { perguntar: async () => { throw new Error('sem conexao'); } }, Date.now());
    const e = JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: cookie })).texto);
    const m = e.passos.find((p: { id: string }) => p.id === 'modelo');
    assert.equal(m.estado, 'vermelho');
    assert.match(m.detalhe, /falhou/i);
  } finally { await c.fim(); }
});

test('a tela responde ao favicon (nada de 404 no console do navegador)', async () => {
  const c = await subir();
  try {
    const cookie = await entrar(c);
    assert.equal((await req(c, 'GET', '/favicon.ico', { Cookie: cookie })).status, 204);
  } finally { await c.fim(); }
});

// B: cadastro da equipe interna
test('/api/cadastro: entender o numero, cadastrar membro, listar sem mostrar o numero inteiro; sem sessao = 401', async () => {
  const c = await subir();
  try {
    assert.equal((await req(c, 'GET', '/api/cadastro')).status, 401);
    assert.equal((await req(c, 'POST', '/api/cadastro/membro', POST('hm=' + 'a'.repeat(64)), '{}')).status, 401);
    const h = POST(await entrar(c));
    const ent = JSON.parse((await req(c, 'POST', '/api/cadastro/entender', h, '{"telefone":"(11) 99999-0007"}')).texto);
    assert.deepEqual(ent.exibir, ['+55 11 99999-0007', '+55 11 9999-0007']);
    assert.equal((await req(c, 'POST', '/api/cadastro/entender', h, '{"telefone":"123"}')).status, 400);
    const ok = await req(c, 'POST', '/api/cadastro/membro', h, '{"nome":"Gil","funcao":"SDR","telefone":"(11) 99999-0007"}');
    assert.equal(ok.status, 200);
    assert.equal(JSON.parse(ok.texto).achou, false);
    assert.match(JSON.parse(ok.texto).aviso, /nao achei/i);
    assert.equal((await req(c, 'POST', '/api/cadastro/membro', h, '{"nome":"Gil 2","funcao":"","telefone":"+55 11 9999-0007"}')).status, 400, 'mesma pessoa de novo');
    const lista = (await req(c, 'GET', '/api/cadastro', { Cookie: h.Cookie })).texto;
    assert.equal(JSON.parse(lista).equipe.length, 1);
    assert.doesNotMatch(lista, /999990007|99999-0007/, 'nunca o numero inteiro');
    assert.equal(JSON.parse((await req(c, 'GET', '/api/estado', { Cookie: h.Cookie })).texto).passos.find((p: { id: string }) => p.id === 'cadastro').estado, 'verde', 'cadastro com ao menos um membro: verde');
  } finally { await c.fim(); }
});

// A: o dono libera (com confirmacao) e escolhe o ritmo do historico antigo; padrao FECHADO; 401 sem sessao.
test('/api/historico-antigo: mostra a trava e o ritmo; liberar exige confirmacao; ritmo tem limites; pausar nao pede confirmacao', async () => {
  const c = await subir();
  try {
    assert.equal((await req(c, 'GET', '/api/historico-antigo')).status, 401);
    assert.equal((await req(c, 'POST', '/api/historico-antigo/liberar', POST('hm=' + 'a'.repeat(64)), '{"liberar":true,"confirmar":true}')).status, 401);
    const h = POST(await entrar(c));
    const g = JSON.parse((await req(c, 'GET', '/api/historico-antigo', { Cookie: h.Cookie })).texto);
    assert.deepEqual({ l: g.config.liberado, r: g.config.ritmoSegundos >= 15, e: g.config.esperaRespostaSegundos, c: g.resumo.conversas }, { l: false, r: true, e: 45, c: 0 });
    assert.equal((await req(c, 'POST', '/api/historico-antigo/liberar', h, '{"liberar":true}')).status, 400, 'sem confirmar nao libera');
    assert.equal((await req(c, 'POST', '/api/historico-antigo/liberar', h, '{"liberar":true,"confirmar":true,"ritmoSegundos":2}')).status, 400, 'ritmo agressivo demais e recusado');
    assert.equal((await req(c, 'POST', '/api/historico-antigo/liberar', h, '{"liberar":true,"confirmar":true,"ritmoSegundos":60}')).status, 200);
    const g2 = JSON.parse((await req(c, 'GET', '/api/historico-antigo', { Cookie: h.Cookie })).texto);
    assert.deepEqual({ l: g2.config.liberado, r: g2.config.ritmoSegundos }, { l: true, r: 60 });
    assert.equal((await req(c, 'POST', '/api/historico-antigo/liberar', h, '{"liberar":false}')).status, 200);
    assert.equal(JSON.parse((await req(c, 'GET', '/api/historico-antigo', { Cookie: h.Cookie })).texto).config.liberado, false);
  } finally { await c.fim(); }
});

test('interface: recursos.ts contem renderizadores de cadastro, modelo, processar e busca antiga', () => {
  assert.match(JS, /function cadastro\(/, 'renderizador do passo cadastro deve existir');
  assert.match(JS, /function modelo\(/, 'renderizador do passo modelo deve existir');
  assert.match(JS, /function processar\(/, 'renderizador do passo processar deve existir');
  assert.match(JS, /cadastro:\s*cadastro/, 'RENDER deve conter cadastro');
  assert.match(JS, /modelo:\s*modelo/, 'RENDER deve conter modelo');
  assert.match(JS, /processar:\s*processar/, 'RENDER deve conter processar');
  assert.match(JS, /\/api\/cadastro\/entender/, 'deve chamar /api/cadastro/entender');
  assert.match(JS, /\/api\/cadastro\/membro/, 'deve chamar /api/cadastro/membro');
  assert.match(JS, /\/api\/modelo\/testar/, 'deve chamar /api/modelo/testar');
  assert.match(JS, /\/api\/processamento\/liberar/, 'deve chamar /api/processamento/liberar');
  assert.match(JS, /\/api\/historico-antigo\/liberar/, 'deve chamar /api/historico-antigo/liberar');
  assert.doesNotMatch(JS, /docs\/plano\//, 'texto de passo nao ligado nao deve exibir caminhos de documentacao interna');
  assert.doesNotMatch(JS, /innerHTML|outerHTML|document\.write|eval\(/, 'so textContent e DOM seguro');
  assert.match(CSS, /\.no\.processando/, 'CSS deve conter classe para passo em processamento');
});
