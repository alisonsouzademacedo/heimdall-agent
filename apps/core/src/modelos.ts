// Modelo e esforco de raciocinio POR TAREFA. O plano Plus tem janela de 5 horas compartilhada e o modelo mais forte gasta muito mais dela
// (docs/openai-codex/docs/pricing.md: GPT-6.1 Sol 15-160 mensagens por janela, GPT-6 Luna 350-3.000; estimativas, nao limites fixos).
// A API do Hermes aceita model, provider e model_options.reasoning_effort POR PEDIDO (docs/hermes-agent/user-guide/features/api-server.md,
// "Per-request model selection"; niveis em user-guide/configuration.md). A escolha fica no banco e e lida a cada pedido: mudar na tela vale logo.
import type { Banco } from './db.ts';

export type Tarefa = 'conversa' | 'extracao' | 'relatorio' | 'teste';
export const TAREFAS: readonly Tarefa[] = ['conversa', 'extracao', 'relatorio', 'teste'];
export type Esforco = 'none' | 'minimal' | 'low' | 'medium' | 'high';
export const ESFORCOS: readonly Esforco[] = ['none', 'minimal', 'low', 'medium', 'high'];
/** model/esforco nulos = nao pedir nada: vale o padrao do Hermes (o que o login escolheu). */
export interface ModeloDaTarefa { model: string | null; esforco: Esforco | null }
export const PROVEDOR_DO_MODELO = 'openai-codex';

export const MODELO_PADRAO: Record<Tarefa, ModeloDaTarefa> = {
  conversa: { model: 'gpt-6-luna', esforco: 'low' },
  extracao: { model: 'gpt-6-luna', esforco: 'low' },
  teste: { model: 'gpt-6-luna', esforco: 'low' },
  relatorio: { model: null, esforco: null }
};

const chave = (t: Tarefa): string => `modelo.tarefa.${t}`;
const ID_MODELO = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function lerModelo(db: Banco, tarefa: Tarefa): ModeloDaTarefa {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(chave(tarefa)) as { valor: string } | undefined;
  if (!r) return { ...MODELO_PADRAO[tarefa] };
  try {
    const v = JSON.parse(r.valor) as Partial<ModeloDaTarefa>;
    const model = v.model === null || (typeof v.model === 'string' && ID_MODELO.test(v.model)) ? v.model : undefined;
    const esforco = v.esforco === null || (typeof v.esforco === 'string' && (ESFORCOS as readonly string[]).includes(v.esforco)) ? v.esforco : undefined;
    if (model === undefined || esforco === undefined) return { ...MODELO_PADRAO[tarefa] };
    return { model, esforco: esforco as Esforco | null };
  } catch { return { ...MODELO_PADRAO[tarefa] }; }
}

export function definirModelo(db: Banco, tarefa: Tarefa, m: ModeloDaTarefa): { ok: true } | { ok: false; motivo: string } {
  if (!TAREFAS.includes(tarefa)) return { ok: false, motivo: 'tarefa desconhecida' };
  if (m.model !== null && !(typeof m.model === 'string' && ID_MODELO.test(m.model))) return { ok: false, motivo: 'nome de modelo invalido (letras, numeros, ponto, - e _)' };
  if (m.esforco !== null && !(ESFORCOS as readonly string[]).includes(m.esforco)) return { ok: false, motivo: `esforco invalido (${ESFORCOS.join(', ')})` };
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(chave(tarefa), JSON.stringify({ model: m.model, esforco: m.esforco }));
  return { ok: true };
}

/** A chave de sessao que cada parte do Heimdall manda ao Hermes diz de que tarefa e o pedido. */
export function tarefaDaSessao(sessao: string): Tarefa {
  if (sessao === 'heimdall:self-chat') return 'conversa';
  if (sessao.startsWith('heimdall:extracao:')) return 'extracao';
  if (sessao.startsWith('heimdall:teste')) return 'teste';
  return 'relatorio';
}
