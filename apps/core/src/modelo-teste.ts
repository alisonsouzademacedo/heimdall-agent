// Teste de chamada ao modelo (Hermes). A TELA so grava o pedido; quem fala com o Hermes e a PONTE (ela ja tem a chave e a rede local), entao a tela
// nunca recebe nem guarda token ou chave. O resultado e so ok/falhou + tempo + motivo curto: o texto da resposta NUNCA e guardado (regra 2).
import type { Banco } from './db.ts';

export interface TesteModelo { estado: 'nenhum' | 'pedido' | 'ok' | 'falhou'; pedidoEm: number | null; em: number | null; ms: number | null; motivo: string | null }
const CHAVE = 'modelo.teste';
const PEDIDO_VALE_MS = 120_000;
const VAZIO: TesteModelo = { estado: 'nenhum', pedidoEm: null, em: null, ms: null, motivo: null };

function gravar(db: Banco, t: TesteModelo): void {
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(CHAVE, JSON.stringify(t));
}
export function lerTesteDoModelo(db: Banco): TesteModelo {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(CHAVE) as { valor: string } | undefined;
  if (!r) return { ...VAZIO };
  try { return { ...VAZIO, ...(JSON.parse(r.valor) as Partial<TesteModelo>) }; } catch { return { ...VAZIO }; }
}
// Devolve false se ja ha um pedido recente esperando a ponte (nao empilha).
export function pedirTesteDoModelo(db: Banco, agora: number): boolean {
  const t = lerTesteDoModelo(db);
  if (t.estado === 'pedido' && t.pedidoEm !== null && agora - t.pedidoEm < PEDIDO_VALE_MS) return false;
  gravar(db, { ...VAZIO, estado: 'pedido', pedidoEm: agora });
  return true;
}
export interface PortaTesteModelo { perguntar(texto: string, opcoes: { sessao: string }): Promise<string> }
// So age se ha pedido. Pergunta algo trivial, mede o tempo e guarda ok/falhou. O que o modelo respondeu nao e guardado.
export async function executarTesteDoModelo(db: Banco, porta: PortaTesteModelo, agora: number, relogio: () => number = Date.now): Promise<boolean> {
  if (lerTesteDoModelo(db).estado !== 'pedido') return false;
  const ini = relogio();
  try {
    const resposta = await porta.perguntar('Responda apenas com a palavra ok.', { sessao: 'heimdall:teste-modelo' });
    const ms = Math.max(0, relogio() - ini);
    gravar(db, resposta.trim() === '' ? { ...VAZIO, estado: 'falhou', em: agora, ms, motivo: 'resposta_vazia' } : { ...VAZIO, estado: 'ok', em: agora, ms });
  } catch (e) {
    const motivo = (e instanceof Error ? e.message : 'erro').replace(/\s+/g, ' ').trim().slice(0, 120);
    gravar(db, { ...VAZIO, estado: 'falhou', em: agora, ms: Math.max(0, relogio() - ini), motivo: motivo === '' ? 'erro' : motivo });
  }
  return true;
}
