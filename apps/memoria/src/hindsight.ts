// Cliente HTTP do Hindsight (API REST local, docs/hindsight/developer/api/{retain,recall}.md e api-reference.md). Unica ponta de rede do envio de
// memoria. Regras: so 127.0.0.1/localhost (o Hindsight roda no Compose com a porta presa ao loopback); so POST de retain/recall e GET de saude;
// nenhuma chamada que apague memoria. Erros: 5xx, 429 e queda de rede repetem; os demais 4xx sao definitivos; 409 de operation_id = ja entregue.
import { createHash } from 'node:crypto';
import { FalhaDefinitiva } from '../../core/src/midia.ts';
import type { ItemRetain, PortaApagarMemoria, PortaMemoria } from '../../core/src/memoria.ts';

export interface OpcoesHindsight {
  url: string;
  banco?: string;
  chave?: string;
  tempoLimiteMs?: number;
  fetchImpl?: typeof fetch;
}
export type TipoMemoria = 'world' | 'experience' | 'observation';
export interface OpcoesLembrar { tipos?: TipoMemoria[]; maxTokens?: number; tags?: string[]; orcamento?: 'low' | 'mid' | 'high' }
export interface Lembranca { id: string; texto: string; tipo: string; documento: string | null; quando: string | null }
export interface ClienteHindsight extends PortaMemoria, PortaApagarMemoria {
  lembrar(pergunta: string, opcoes?: OpcoesLembrar): Promise<Lembranca[]>;
  saude(): Promise<boolean>;
}

const LOCAL = new Set(['127.0.0.1', 'localhost']);

// UUID estavel a partir do documento e do conteudo: reenviar o MESMO conteudo apos uma resposta perdida nao cria trabalho duplicado no Hindsight.
function operacaoId(item: ItemRetain): string {
  const h = createHash('sha256').update(JSON.stringify([item.documentId, item.content, item.context, item.timestamp, item.tags])).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function criarClienteHindsight(o: OpcoesHindsight): ClienteHindsight {
  let base: URL;
  try { base = new URL(o.url); } catch { throw new Error('Endereco do Hindsight invalido'); }
  if (base.protocol !== 'http:') throw new Error('O Hindsight local usa http (nao https)');
  if (!LOCAL.has(base.hostname)) throw new Error('O Hindsight so pode ser local (127.0.0.1 ou localhost)');
  const banco = encodeURIComponent(o.banco ?? 'heimdall');
  const f = o.fetchImpl ?? fetch;
  const limite = o.tempoLimiteMs ?? 60_000;

  async function pedir(metodo: 'GET' | 'POST' | 'DELETE', caminho: string, corpo?: unknown): Promise<{ status: number; json: unknown }> {
    const cab: Record<string, string> = {};
    if (corpo !== undefined) cab['content-type'] = 'application/json';
    if (o.chave) cab.authorization = `Bearer ${o.chave}`;
    const r = await f(new URL(caminho, base), { method: metodo, headers: cab, body: corpo === undefined ? undefined : JSON.stringify(corpo), signal: AbortSignal.timeout(limite) });
    let json: unknown = null;
    try { json = await r.json(); } catch { /* corpo vazio ou nao JSON */ }
    return { status: r.status, json };
  }

  return {
    async reter(item) {
      const r = await pedir('POST', `/v1/default/banks/${banco}/memories`, {
        async: true,
        operation_id: operacaoId(item),
        items: [{ content: item.content, context: item.context, timestamp: item.timestamp, document_id: item.documentId, tags: item.tags }]
      });
      if (r.status === 409) return; // esse operation_id ja foi aceito antes
      if (r.status === 429 || r.status >= 500) throw new Error(`http_${r.status}`);
      if (r.status >= 400) throw new FalhaDefinitiva(`http_${r.status}`);
      if ((r.json as { success?: boolean } | null)?.success !== true) throw new Error('resposta_sem_sucesso');
    },
    async lembrar(pergunta, op = {}) {
      const corpo: Record<string, unknown> = { query: pergunta, types: op.tipos, max_tokens: op.maxTokens ?? 2000, budget: op.orcamento ?? 'mid' };
      if (op.tags && op.tags.length > 0) { corpo.tags = op.tags; corpo.tags_match = 'any_strict'; }
      const r = await pedir('POST', `/v1/default/banks/${banco}/memories/recall`, corpo);
      if (r.status >= 400) throw new Error(`http_${r.status}`);
      const lista = ((r.json as { results?: Record<string, unknown>[] } | null)?.results ?? []);
      return lista.map((x) => ({ id: String(x.id), texto: String(x.text), tipo: String(x.type), documento: (x.document_id as string | null) ?? null, quando: (x.occurred_start as string | null) ?? null }));
    },
    // Unico DELETE do cliente: um documento de conversa nosso (conv:<n>:<AAAA-MM-DD>), para esquecer um cliente apagado. Nunca o banco inteiro.
    async apagarDocumento(documentId) {
      if (!/^conv:\d+:\d{4}-\d{2}-\d{2}$/.test(documentId)) throw new Error('documento invalido');
      const r = await pedir('DELETE', `/v1/default/banks/${banco}/documents/${encodeURIComponent(documentId)}`);
      if (r.status === 404) return 'nao_existia';
      if (r.status >= 400) throw new Error(`http_${r.status}`);
      return 'apagado';
    },
    async saude() {
      try { return (await pedir('GET', '/health')).status === 200; } catch { return false; }
    }
  };
}
