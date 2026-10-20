// Cliente da API do Hermes (POST /v1/chat/completions, docs/hermes-agent/user-guide/features/api-server.md) contra um servidor falso em 127.0.0.1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { criarClienteHermes, RespostaVazia } from './hermes.ts';

async function servidor(resp: (res: ServerResponse, corpo: unknown) => void) {
  const pedidos: { metodo: string; url: string; corpo: unknown; cab: Record<string, string | string[] | undefined> }[] = [];
  const s = createServer((req, res) => {
    let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
      const corpo = b ? JSON.parse(b) : null;
      pedidos.push({ metodo: req.method ?? '', url: req.url ?? '', corpo, cab: req.headers });
      resp(res, corpo);
    });
  });
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${(s.address() as AddressInfo).port}`, pedidos, fechar: () => new Promise<void>((r) => { s.close(() => r()); s.closeAllConnections(); }) };
}
const json = (res: ServerResponse, status: number, corpo: unknown) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(corpo)); };
const ok = (texto: string, fim = 'stop') => ({ choices: [{ index: 0, message: { role: 'assistant', content: texto }, finish_reason: fim }] });

test('perguntar: chave Bearer, chave de sessao estavel, mensagens de sistema e do dono; devolve so o texto da resposta', async () => {
  const s = await servidor((res) => json(res, 200, ok('Tudo certo, Alison.')));
  try {
    const c = criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456' });
    const r = await c.perguntar('Como estao os follow-ups?', { sessao: 'heimdall:self-chat', sistema: 'Hoje e 2025-10-10.' });
    assert.equal(r, 'Tudo certo, Alison.');
    const p = s.pedidos[0]!;
    assert.equal(p.url, '/v1/chat/completions');
    assert.equal(p.cab.authorization, 'Bearer k-sintetica-123456');
    assert.equal(p.cab['x-hermes-session-key'], 'heimdall:self-chat');
    assert.deepEqual(p.corpo, { model: 'hermes-agent', stream: false, messages: [{ role: 'system', content: 'Hoje e 2025-10-10.' }, { role: 'user', content: 'Como estao os follow-ups?' }] });
  } finally { await s.fechar(); }
});

test('resposta que nao terminou bem nao vira mensagem para o dono: erro, interrompida e vazia sao falhas', async () => {
  for (const [fim, texto] of [['error', 'parcial'], ['cancelled', 'parcial'], ['stop', ''], ['stop', '   ']] as const) {
    const s = await servidor((res) => json(res, 200, ok(texto, fim)));
    try { await assert.rejects(criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456' }).perguntar('oi', { sessao: 'x' }), fim === 'stop' ? RespostaVazia : /hermes_/, `${fim}/${texto}`); } finally { await s.fechar(); }
  }
});

test('HTTP: 401/403 e 4xx sao erros claros sem o corpo; 429/5xx/queda de rede tambem falham (a ponte tenta de novo depois)', async () => {
  for (const status of [401, 403, 409, 429, 500, 503]) {
    const s = await servidor((res) => json(res, status, { error: { message: 'segredo-do-corpo' } }));
    try { await assert.rejects(criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456' }).perguntar('oi', { sessao: 'x' }), (e: Error) => e.message === `hermes_http_${status}` && !e.message.includes('segredo')); } finally { await s.fechar(); }
  }
  await assert.rejects(criarClienteHermes({ url: 'http://127.0.0.1:1', chave: 'k-sintetica-123456', tempoLimiteMs: 500 }).perguntar('oi', { sessao: 'x' }), /hermes_/);
});

test('so fala com a propria maquina e exige chave', () => {
  for (const url of ['http://example.com:8642', 'https://127.0.0.1:8642', 'lixo']) assert.throws(() => criarClienteHermes({ url, chave: 'k-sintetica-123456' }), /local|invalido|http/i, url);
  assert.throws(() => criarClienteHermes({ url: 'http://127.0.0.1:8642', chave: '' }), /chave/i);
  assert.throws(() => criarClienteHermes({ url: 'http://127.0.0.1:8642', chave: 'curta' }), /chave/i, 'o Hermes exige no minimo 8 caracteres');
});

test('chave de sessao com quebra de linha ou grande demais e recusada (limite do Hermes: 256, sem controle)', async () => {
  const c = criarClienteHermes({ url: 'http://127.0.0.1:8642', chave: 'k-sintetica-123456' });
  await assert.rejects(c.perguntar('oi', { sessao: 'a\nb' }), /sessao/i);
  await assert.rejects(c.perguntar('oi', { sessao: 'x'.repeat(257) }), /sessao/i);
});

test('saude: /health 200 => true; qualquer outra coisa => false, sem lancar', async () => {
  const s = await servidor((res) => json(res, 200, { status: 'ok' }));
  try { assert.equal(await criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456' }).saude(), true); } finally { await s.fechar(); }
  assert.equal(await criarClienteHermes({ url: 'http://127.0.0.1:1', chave: 'k-sintetica-123456', tempoLimiteMs: 300 }).saude(), false);
});
