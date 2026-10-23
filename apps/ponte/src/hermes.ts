// Cliente da API local do Hermes (OpenAI-compativel): POST /v1/chat/completions com Bearer e X-Hermes-Session-Key
// (docs/hermes-agent/user-guide/features/api-server.md). Unica ponta de rede da ponte para o Hermes. So 127.0.0.1/localhost, so texto.
// O corpo de erro do servidor NUNCA entra na mensagem de erro (pode repetir conteudo de conversa).

export class RespostaVazia extends Error {
  constructor() { super('hermes_resposta_vazia'); this.name = 'RespostaVazia'; }
}

/** Modelo pedido a UM pedido (docs/hermes-agent/user-guide/features/api-server.md, "Per-request model selection"). */
export interface EscolhaDeModelo { model: string; provider: string; esforco: string | null }
/** Uma chamada que o modelo respondeu: so numeros (tokens do campo "usage" da API, tempo e modelo), nunca texto. */
export interface ConsumoDaChamada { sessao: string; entrada: number; saida: number; modelo: string | null; ms: number }
export interface OpcoesHermes { url: string; chave: string; tempoLimiteMs?: number; fetchImpl?: typeof fetch; escolherModelo?: (sessao: string) => EscolhaDeModelo | undefined; aoConsumir?: (c: ConsumoDaChamada) => void }
export interface OpcoesPergunta { sessao: string; sistema?: string }
export interface ClienteHermes {
  perguntar(texto: string, opcoes: OpcoesPergunta): Promise<string>;
  saude(): Promise<boolean>;
}

const LOCAL = new Set(['127.0.0.1', 'localhost']);

function pedidoDeModelo(e: EscolhaDeModelo | undefined): Record<string, unknown> {
  if (!e) return {};
  return { model: e.model, provider: e.provider, ...(e.esforco ? { model_options: { reasoning_effort: e.esforco } } : {}) };
}

export function criarClienteHermes(o: OpcoesHermes): ClienteHermes {
  let base: URL;
  try { base = new URL(o.url); } catch { throw new Error('Endereco do Hermes invalido'); }
  if (base.protocol !== 'http:') throw new Error('O Hermes local usa http (nao https)');
  if (!LOCAL.has(base.hostname)) throw new Error('O Hermes so pode ser local (127.0.0.1 ou localhost)');
  if (typeof o.chave !== 'string' || o.chave.length < 8) throw new Error('A chave da API do Hermes precisa de pelo menos 8 caracteres');
  const f = o.fetchImpl ?? fetch;
  const limite = o.tempoLimiteMs ?? 5 * 60_000;
  const cab = { authorization: `Bearer ${o.chave}` };

  return {
    async perguntar(texto, op) {
      if (op.sessao.length === 0 || op.sessao.length > 256 || /[\r\n\0]/.test(op.sessao)) throw new Error('chave de sessao invalida (1 a 256 caracteres, sem quebra de linha)');
      const messages: { role: string; content: string }[] = [];
      if (op.sistema) messages.push({ role: 'system', content: op.sistema });
      messages.push({ role: 'user', content: texto });
      const inicio = Date.now();
      let r: Response;
      try {
        r = await f(new URL('/v1/chat/completions', base), {
          method: 'POST',
          headers: { ...cab, 'content-type': 'application/json', 'x-hermes-session-key': op.sessao },
          body: JSON.stringify({ model: 'hermes-agent', stream: false, messages, ...pedidoDeModelo(o.escolherModelo?.(op.sessao)) }),
          signal: AbortSignal.timeout(limite)
        });
      } catch {
        throw new Error('hermes_sem_resposta');
      }
      if (!r.ok) throw new Error(`hermes_http_${r.status}`);
      type Corpo = { model?: unknown; usage?: { prompt_tokens?: unknown; completion_tokens?: unknown }; choices?: { message?: { content?: unknown }; finish_reason?: string }[] };
      let j: Corpo;
      try { j = (await r.json()) as Corpo; } catch { throw new Error('hermes_resposta_ilegivel'); }
      if (o.aoConsumir) {
        const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : 0);
        try { o.aoConsumir({ sessao: op.sessao, entrada: num(j?.usage?.prompt_tokens), saida: num(j?.usage?.completion_tokens), modelo: typeof j?.model === 'string' ? j.model : null, ms: Math.max(0, Date.now() - inicio) }); } catch { /* o registro nunca derruba a resposta */ }
      }
      const escolha = j?.choices?.[0];
      // "cancelled" (turno interrompido) e "error" (falha) nao sao respostas: nada disso vai ao dono.
      if (escolha?.finish_reason === 'error' || escolha?.finish_reason === 'cancelled') throw new Error(`hermes_${escolha.finish_reason}`);
      const conteudo = escolha?.message?.content;
      if (typeof conteudo !== 'string' || conteudo.trim() === '') throw new RespostaVazia();
      // O Hermes sem login devolve este aviso como se fosse resposta (HTTP 200, "stop"): nao e resposta, e o dono nao deve recebe-lo.
      if (/^\W*Provider authentication failed|not connected to any AI provider/i.test(conteudo)) throw new Error('hermes_sem_provedor');
      return conteudo.trim();
    },
    async saude() {
      try { return (await f(new URL('/health', base), { headers: cab, signal: AbortSignal.timeout(Math.min(limite, 10_000)) })).ok; } catch { return false; }
    }
  };
}
