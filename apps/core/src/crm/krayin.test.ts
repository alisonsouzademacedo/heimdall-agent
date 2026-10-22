import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { criarLead, listarFunis, moverEtapa, normalizarNome, testarConexao, verificarFunil, type ConfigCrm, type FunilKrayin } from './krayin.ts';

const TOKEN = ['99', 'abcdefghijklmnopqrstuvwxyz'].join('|'); // token FALSO, montado em tempo de execucao

const FUNIL: FunilKrayin = {
  id: 9,
  nome: 'Comercial Heimdall',
  padrao: true,
  etapas: [
    { id: 101, nome: 'Contato iniciado', codigo: 'contato-iniciado' },
    { id: 102, nome: '1ª Reunião Agendada', codigo: '1a-reuniao-agendada' },
    { id: 103, nome: '2ª Reunião Agendada', codigo: '2a-reuniao-agendada' },
    { id: 104, nome: 'Fechamento', codigo: 'won' },
    { id: 105, nome: 'Sem continuidade', codigo: 'lost' }
  ]
};

interface Fake {
  url: string;
  pedidos: { metodo: string; caminho: string; autorizacao: string; corpo: unknown }[];
  funis: FunilKrayin[];
  status: number;
  fechar: () => Promise<void>;
}

async function subir(): Promise<Fake> {
  const f: Fake = { url: '', pedidos: [], funis: [FUNIL], status: 200, fechar: async () => {} };
  const s = createServer((req, res) => {
    let bruto = '';
    req.on('data', (d) => (bruto += d));
    req.on('end', () => {
      let corpo: unknown = null;
      try { corpo = bruto === '' ? null : JSON.parse(bruto); } catch { corpo = bruto; }
      f.pedidos.push({ metodo: req.method ?? '', caminho: req.url ?? '', autorizacao: String(req.headers.authorization ?? ''), corpo });
      if (req.headers.authorization !== `Bearer ${TOKEN}`) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'Unauthenticated.' })); return; }
      if (f.status !== 200) { res.writeHead(f.status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'falha proposital' })); return; }
      if (req.method === 'GET' && req.url === '/api/v1/settings/pipelines') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: f.funis.map((x) => ({ id: x.id, name: x.nome, is_default: x.padrao, stages: x.etapas.map((e) => ({ id: e.id, name: e.nome, code: e.codigo })) })) }));
        return;
      }
      if (req.method === 'POST' && req.url === '/api/v1/leads') {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: { id: 55 }, message: 'criado' }));
        return;
      }
      if (req.method === 'PUT' && req.url === '/api/v1/leads/stage/edit/55') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: { id: 55 }, message: 'movido' }));
        return;
      }
      res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ message: 'nao achei' }));
    });
  });
  await new Promise<void>((resolve) => s.listen(0, '127.0.0.1', () => resolve()));
  f.url = `http://127.0.0.1:${(s.address() as AddressInfo).port}`;
  f.fechar = () => new Promise((resolve) => s.close(() => resolve()));
  return f;
}

const cfg = (url: string): ConfigCrm => ({ url, token: TOKEN });

test('funil: entende names/codes, acha as 5 etapas e escolhe o funil padrao', async () => {
  const f = await subir();
  try {
    const r = await listarFunis(cfg(f.url));
    assert.equal(r.ok, true);
    assert.equal(r.funis.length, 1);
    const v = verificarFunil(r.funis);
    assert.equal(v.completo, true, JSON.stringify(v.faltando));
    assert.equal(v.funil?.id, 9);
    assert.equal(v.etapas.contato?.id, 101);
    assert.equal(v.etapas.ganho?.id, 104, 'usa o code won, mesmo com outro nome');
    assert.equal(v.etapas.perdido?.id, 105, 'usa o code lost, mesmo com outro nome');
  } finally { await f.fechar(); }
});

test('funil: lista o que falta sem inventar etapa', async () => {
  const f = await subir();
  f.funis = [{ ...FUNIL, etapas: FUNIL.etapas.filter((e) => e.id !== 102) }];
  try {
    const r = await listarFunis(cfg(f.url));
    const v = verificarFunil(r.funis);
    assert.equal(v.completo, false);
    assert.deepEqual(v.faltando, ['1ª Reunião Agendada']);
    assert.equal(v.etapas.primeira, null);
  } finally { await f.fechar(); }
});

test('redirecionamento: o token NAO e enviado para outro endereco (o Krayin redireciona, o cliente recusa)', async () => {
  let recebidoNoDestino = 0;
  const destino = createServer((_req, res) => { recebidoNoDestino++; res.end('{}'); });
  await new Promise<void>((ok) => destino.listen(0, '127.0.0.1', () => ok()));
  const origem = createServer((_req, res) => { res.writeHead(302, { Location: `http://127.0.0.1:${(destino.address() as AddressInfo).port}/roubo` }); res.end(); });
  await new Promise<void>((ok) => origem.listen(0, '127.0.0.1', () => ok()));
  try {
    const r = await listarFunis(cfg(`http://127.0.0.1:${(origem.address() as AddressInfo).port}`));
    assert.equal(r.ok, false, 'redirecionamento nao e seguido');
    assert.equal(recebidoNoDestino, 0, 'o outro endereco nao recebeu nenhum pedido (nem o token)');
  } finally {
    await new Promise<void>((ok) => origem.close(() => ok()));
    await new Promise<void>((ok) => destino.close(() => ok()));
  }
});

test('funil: aceita 1a/2a (sem o simbolo ordinal), sem acento e em outra caixa', () => {
  const funil: FunilKrayin = { id: 1, nome: 'Vendas', padrao: true, etapas: [
    { id: 1, nome: 'Novo', codigo: 'new' },
    { id: 2, nome: 'CONTATO INICIADO', codigo: null },
    { id: 3, nome: '1a reuniao agendada', codigo: null },
    { id: 4, nome: '2o Reuniao Agendada', codigo: null },
    { id: 5, nome: 'Ganho', codigo: 'won' },
    { id: 6, nome: 'Perdido', codigo: 'lost' }
  ] };
  const v = verificarFunil([funil]);
  assert.equal(v.completo, true, JSON.stringify(v.faltando));
  assert.equal(v.etapas.primeira?.id, 3);
  assert.equal(v.etapas.segunda?.id, 4);
  // nao confunde numeros: "2a" nao vale como primeira
  const trocado: FunilKrayin = { ...funil, etapas: funil.etapas.filter((e) => e.id !== 3) };
  assert.deepEqual(verificarFunil([trocado]).faltando, ['1ª Reunião Agendada']);
});

test('conexao: 401 vira motivo curto, sem ecoar o token', async () => {
  const f = await subir();
  try {
    const r = await testarConexao({ url: f.url, token: 'outro-token-que-nao-vale-123456' });
    assert.equal(r.ok, false);
    assert.match(String(r.motivo), /401/);
    assert.ok(!String(r.motivo).includes('outro-token'), String(r.motivo));
  } finally { await f.fechar(); }
});

test('lead: cria na etapa 1 com titulo/descricao e devolve o id', async () => {
  const f = await subir();
  try {
    const r = await criarLead(cfg(f.url), { titulo: 'Empresa Sintetica', descricao: 'Cliente respondeu no WhatsApp', etapaId: 101 });
    assert.deepEqual(r, { ok: true, id: 55 });
    const p = f.pedidos.find((x) => x.metodo === 'POST' && x.caminho === '/api/v1/leads');
    assert.deepEqual(p?.corpo, { title: 'Empresa Sintetica', description: 'Cliente respondeu no WhatsApp', lead_value: 0, lead_pipeline_stage_id: 101 });
    assert.equal(p?.autorizacao, `Bearer ${TOKEN}`);
  } finally { await f.fechar(); }
});

test('lead: mover etapa manda o id da etapa e recusa id invalido', async () => {
  const f = await subir();
  try {
    assert.deepEqual(await moverEtapa(cfg(f.url), 55, 103), { ok: true });
    const p = f.pedidos.find((x) => x.metodo === 'PUT' && x.caminho === '/api/v1/leads/stage/edit/55');
    assert.deepEqual(p?.corpo, { lead_pipeline_stage_id: 103 });
    assert.equal((await moverEtapa(cfg(f.url), 0, 103)).ok, false);
    assert.equal((await moverEtapa(cfg(f.url), 55, 0)).ok, false);
  } finally { await f.fechar(); }
});

test('normalizarNome tira acento, pontuacao e caixa', () => {
  assert.equal(normalizarNome('1ª Reunião Agendada'), '1 reuniao agendada');
  assert.equal(normalizarNome('  FECHAMENTO / Ganho '), 'fechamento ganho');
});
