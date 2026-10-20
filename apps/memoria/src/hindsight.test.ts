// Cliente do Hindsight contra um servidor HTTP falso em 127.0.0.1. A conversa real e o modelo real ficam no roteiro de fumaça.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { criarClienteHindsight } from './hindsight.ts';
import { FalhaDefinitiva } from '../../core/src/midia.ts';
import type { ItemRetain } from '../../core/src/memoria.ts';

const ITEM: ItemRetain = { documentId: 'conv:1:2025-10-10', content: 'Ana (2025-10-10T12:00:00-03:00): oi', context: 'conversa de WhatsApp', timestamp: '2025-10-10T23:59:59-03:00', tags: ['conversa:1'] };

async function servidor(resp: (req: IncomingMessage, corpo: string, res: ServerResponse) => void) {
  const pedidos: { metodo: string; url: string; corpo: unknown; auth?: string }[] = [];
  const s = createServer((req, res) => {
    let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
      pedidos.push({ metodo: req.method ?? '', url: req.url ?? '', corpo: b ? JSON.parse(b) : null, auth: req.headers.authorization });
      resp(req, b, res);
    });
  });
  await new Promise<void>((r) => s.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${(s.address() as AddressInfo).port}`;
  return { url, pedidos, fechar: () => new Promise<void>((r) => { s.close(() => r()); s.closeAllConnections(); }) };
}
const json = (res: ServerResponse, status: number, corpo: unknown) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(corpo)); };

test('reter: POST /memories com o item no formato da API, assincrono e com operation_id estavel (reenvio nao duplica trabalho)', async () => {
  const s = await servidor((_q, _b, res) => json(res, 200, { success: true, bank_id: 'heimdall', items_count: 1, async: true, operation_id: 'x' }));
  try {
    const c = criarClienteHindsight({ url: s.url, banco: 'heimdall' });
    await c.reter(ITEM); await c.reter(ITEM);
    const [a, b] = s.pedidos as [typeof s.pedidos[0], typeof s.pedidos[0]];
    assert.equal(a.metodo, 'POST');
    assert.equal(a.url, '/v1/default/banks/heimdall/memories');
    const corpo = a.corpo as { async: boolean; operation_id: string; items: Record<string, unknown>[] };
    assert.equal(corpo.async, true);
    assert.deepEqual(corpo.items, [{ content: ITEM.content, context: ITEM.context, timestamp: ITEM.timestamp, document_id: ITEM.documentId, tags: ITEM.tags }]);
    assert.match(corpo.operation_id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    assert.equal((b.corpo as { operation_id: string }).operation_id, corpo.operation_id, 'mesmo conteudo, mesmo id');
    await c.reter({ ...ITEM, content: ITEM.content + ' mais' });
    assert.notEqual((s.pedidos[2]!.corpo as { operation_id: string }).operation_id, corpo.operation_id, 'conteudo novo, id novo');
  } finally { await s.fechar(); }
});

test('reter: 409 (operation_id ja existe) conta como entregue; 5xx e 429 sao tentativas futuras; outro 4xx e definitivo', async () => {
  for (const [status, esperado] of [[409, 'ok'], [500, 'tenta'], [503, 'tenta'], [429, 'tenta'], [422, 'definitivo'], [400, 'definitivo']] as const) {
    const s = await servidor((_q, _b, res) => json(res, status, { detail: 'x' }));
    try {
      const c = criarClienteHindsight({ url: s.url });
      const r = await c.reter(ITEM).then(() => 'ok', (e) => (e instanceof FalhaDefinitiva ? 'definitivo' : 'tenta'));
      assert.equal(r, esperado, String(status));
    } finally { await s.fechar(); }
  }
});

test('reter: servidor desligado e resposta "success: false" sao falhas que se repetem (nao definitivas)', async () => {
  const s = await servidor((_q, _b, res) => json(res, 200, { success: false }));
  const url = s.url;
  try { await assert.rejects(criarClienteHindsight({ url }).reter(ITEM), (e: Error) => !(e instanceof FalhaDefinitiva)); } finally { await s.fechar(); }
  await assert.rejects(criarClienteHindsight({ url, tempoLimiteMs: 500 }).reter(ITEM), (e: Error) => !(e instanceof FalhaDefinitiva), 'sem servidor');
});

test('lembrar: POST /memories/recall com query, tipos, orcamento e filtro de tags; devolve so o que o relatorio precisa', async () => {
  const s = await servidor((_q, _b, res) => json(res, 200, { results: [{ id: 'f1', text: 'Ana quer orçamento', type: 'experience', tags: ['conversa:1'], occurred_start: '2025-10-10T12:00:00Z', scores: { final: 0.9 }, document_id: 'conv:1:2025-10-10' }] }));
  try {
    const c = criarClienteHindsight({ url: s.url, banco: 'heimdall' });
    const r = await c.lembrar('o que a Ana pediu?', { tipos: ['experience', 'observation'], maxTokens: 1500, tags: ['conversa:1'] });
    assert.equal(s.pedidos[0]!.url, '/v1/default/banks/heimdall/memories/recall');
    assert.deepEqual(s.pedidos[0]!.corpo, { query: 'o que a Ana pediu?', types: ['experience', 'observation'], max_tokens: 1500, budget: 'mid', tags: ['conversa:1'], tags_match: 'any_strict' });
    assert.deepEqual(r, [{ id: 'f1', texto: 'Ana quer orçamento', tipo: 'experience', documento: 'conv:1:2025-10-10', quando: '2025-10-10T12:00:00Z' }]);
  } finally { await s.fechar(); }
});

test('chave opcional vai como Bearer; sem chave nao manda cabecalho', async () => {
  const s = await servidor((_q, _b, res) => json(res, 200, { success: true }));
  try {
    await criarClienteHindsight({ url: s.url }).reter(ITEM);
    await criarClienteHindsight({ url: s.url, chave: 'k-sintetica' }).reter(ITEM);
    assert.deepEqual(s.pedidos.map((p) => p.auth), [undefined, 'Bearer k-sintetica']);
  } finally { await s.fechar(); }
});

test('so fala com a propria maquina: endereco que nao e 127.0.0.1/localhost e recusado na criacao', () => {
  for (const url of ['http://example.com:8888', 'http://192.168.0.5:8888', 'https://127.0.0.1:8888', 'ftp://127.0.0.1', 'lixo']) assert.throws(() => criarClienteHindsight({ url }), /local|invalido|http/i, url);
  assert.doesNotThrow(() => criarClienteHindsight({ url: 'http://127.0.0.1:8888' }));
  assert.doesNotThrow(() => criarClienteHindsight({ url: 'http://localhost:8888' }));
});

test('saude: true quando /health responde 200, false caso contrario (nunca lanca)', async () => {
  const s = await servidor((q, _b, res) => (q.url === '/health' ? json(res, 200, { status: 'healthy' }) : json(res, 404, {})));
  try { assert.equal(await criarClienteHindsight({ url: s.url }).saude(), true); } finally { await s.fechar(); }
  assert.equal(await criarClienteHindsight({ url: s.url, tempoLimiteMs: 300 }).saude(), false);
});

test('apagarDocumento: DELETE so em /documents/<id>; 404 = nao existia; 5xx falha; id fora do formato e recusado antes de sair', async () => {
  const s = await servidor((q, _b, res) => (q.url!.endsWith('conv%3A1%3A2025-10-11') ? json(res, 404, {}) : q.url!.endsWith('2025-10-12') ? json(res, 503, {}) : json(res, 200, { success: true, memory_units_deleted: 3 })));
  try {
    const c = criarClienteHindsight({ url: s.url, banco: 'heimdall' });
    assert.equal(await c.apagarDocumento('conv:1:2025-10-10'), 'apagado');
    assert.equal(await c.apagarDocumento('conv:1:2025-10-11'), 'nao_existia');
    await assert.rejects(c.apagarDocumento('conv:1:2025-10-12'), /http_503/);
    await assert.rejects(c.apagarDocumento('../banks/heimdall'), /invalido/);
    await assert.rejects(c.apagarDocumento('conv:1:2025-10-10/../x'), /invalido/);
    assert.deepEqual(s.pedidos.map((p) => [p.metodo, p.url]), [['DELETE', '/v1/default/banks/heimdall/documents/conv%3A1%3A2025-10-10'], ['DELETE', '/v1/default/banks/heimdall/documents/conv%3A1%3A2025-10-11'], ['DELETE', '/v1/default/banks/heimdall/documents/conv%3A1%3A2025-10-12']]);
  } finally { await s.fechar(); }
});
