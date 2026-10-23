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

test('modelo por pedido: model, provider e model_options.reasoning_effort vao no corpo; sem escolha, nada disso vai', async () => {
  const s = await servidor((res) => json(res, 200, ok('ok')));
  try {
    const escolhas: Record<string, { model: string; provider: string; esforco: string | null } | undefined> = {
      barato: { model: 'gpt-6-luna', provider: 'openai-codex', esforco: 'low' },
      semEsforco: { model: 'gpt-6-luna', provider: 'openai-codex', esforco: null },
      padrao: undefined
    };
    const c = criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456', escolherModelo: (sessao) => escolhas[sessao] });
    for (const k of Object.keys(escolhas)) await c.perguntar('oi', { sessao: k });
    const [barato, semEsforco, padrao] = s.pedidos.map((p) => p.corpo as Record<string, unknown>);
    assert.equal(barato!.model, 'gpt-6-luna'); assert.equal(barato!.provider, 'openai-codex');
    assert.deepEqual(barato!.model_options, { reasoning_effort: 'low' });
    assert.equal(semEsforco!.model, 'gpt-6-luna'); assert.equal('model_options' in semEsforco!, false);
    assert.equal(padrao!.model, 'hermes-agent'); assert.equal('provider' in padrao!, false); assert.equal('model_options' in padrao!, false);
  } finally { await s.fechar(); }
});

test('consumo: cada resposta devolve os tokens reais do campo usage, o tempo e o modelo; erro no registro nunca derruba a resposta; falha de HTTP nao registra', async () => {
  const visto: { sessao: string; entrada: number; saida: number; modelo: string | null; ms: number }[] = [];
  const s = await servidor((res) => json(res, 200, { ...ok('ok'), model: 'gpt-6-luna', usage: { prompt_tokens: 2280, completion_tokens: 5, total_tokens: 2285 } }));
  try {
    const c = criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456', aoConsumir: (x) => visto.push(x) });
    assert.equal(await c.perguntar('oi', { sessao: 'heimdall:self-chat' }), 'ok');
    assert.equal(visto.length, 1);
    assert.deepEqual({ sessao: visto[0]!.sessao, entrada: visto[0]!.entrada, saida: visto[0]!.saida, modelo: visto[0]!.modelo }, { sessao: 'heimdall:self-chat', entrada: 2280, saida: 5, modelo: 'gpt-6-luna' });
    assert.ok(visto[0]!.ms >= 0);
    const quebrado = criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456', aoConsumir: () => { throw new Error('banco travado'); } });
    assert.equal(await quebrado.perguntar('oi', { sessao: 'x' }), 'ok', 'o registro nao pode derrubar a resposta');
  } finally { await s.fechar(); }
  const falho = await servidor((res) => json(res, 500, {}));
  try {
    const n = visto.length;
    await assert.rejects(criarClienteHermes({ url: falho.url, chave: 'k-sintetica-123456', aoConsumir: (x) => visto.push(x) }).perguntar('oi', { sessao: 'x' }), /hermes_http_500/);
    assert.equal(visto.length, n, 'pedido que falhou nao gasta cota registrada');
  } finally { await falho.fechar(); }
  const semUso = await servidor((res) => json(res, 200, ok('ok')));
  try {
    const v2: { entrada: number }[] = [];
    await criarClienteHermes({ url: semUso.url, chave: 'k-sintetica-123456', aoConsumir: (x) => v2.push(x) }).perguntar('oi', { sessao: 'x' });
    assert.equal(v2.length, 1, 'sem usage: registra a chamada mesmo assim');
    assert.equal(v2[0]!.entrada, 0, 'com 0 tokens');
  } finally { await semUso.fechar(); }
});

test('aviso do proprio Hermes de que nao ha provedor/login NAO e resposta: vira falha (o dono nao recebe esse texto)', async () => {
  const aviso = '⚠️ Provider authentication failed: Hermes is not connected to any AI provider yet. Run `hermes model` to pick one, type `/login` in chat, or add a key with `hermes auth add <provider>`.';
  const s = await servidor((res) => json(res, 200, ok(aviso)));
  try { await assert.rejects(criarClienteHermes({ url: s.url, chave: 'k-sintetica-123456' }).perguntar('oi', { sessao: 'x' }), /hermes_sem_provedor/); } finally { await s.fechar(); }
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
