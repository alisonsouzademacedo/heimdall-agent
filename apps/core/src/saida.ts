// Caixa de saida para o dono. Este arquivo NAO envia nada: guarda o que deve ser dito ao dono e o estado da entrega. Quem entrega e o listener,
// pelo Envio de envio.ts (so o self-chat). Nao ha destino na tabela, entao nenhum codigo daqui consegue endereçar outra pessoa.
import type { Banco } from './db.ts';
import { ESPERAS_RETENTATIVA_MS } from './fila.ts';
import { LIMITES_PADRAO } from './envio.ts';

// Toda mensagem nossa comeca com a marca: no self-chat o dono e o Heimdall escrevem na MESMA conversa, e a marca impede responder ao proprio eco.
export const MARCA = '🛡️ ';
export const MAX_TENTATIVAS_SAIDA = 5;
export type TipoSaida = 'resposta' | 'relatorio' | 'aviso';
export interface Saida { id: number; tipo: TipoSaida; texto: string; tentativas: number }

export function enfileirarSaida(db: Banco, tipo: TipoSaida, texto: string, agora: number = Date.now(), chave?: string): number | null {
  if (typeof texto !== 'string' || texto.trim() === '') throw new Error('texto vazio');
  const completo = texto.startsWith(MARCA) ? texto : `${MARCA}${texto}`;
  if (completo.length > LIMITES_PADRAO.maxTexto) throw new Error('texto grande demais');
  const r = db.prepare('INSERT OR IGNORE INTO saida (tipo, texto, chave, proximo_em, criada_em) VALUES (?, ?, ?, ?, ?)').run(tipo, completo, chave ?? null, agora, agora);
  return Number(r.changes) === 1 ? Number(r.lastInsertRowid) : null;
}

export function proximaSaida(db: Banco, agora: number = Date.now()): Saida | null {
  return (db.prepare("SELECT id, tipo, texto, tentativas FROM saida WHERE estado = 'pendente' AND proximo_em <= ? ORDER BY id LIMIT 1").get(agora) as unknown as Saida | undefined) ?? null;
}

export function marcarEnviada(db: Banco, id: number, waMsgId: string | null, agora: number = Date.now()): void {
  db.prepare("UPDATE saida SET estado = 'enviada', wa_msg_id = ?, enviada_em = ?, erro = NULL WHERE id = ?").run(waMsgId, agora, id);
}

// So o MOTIVO fica guardado (curto, sem quebra de linha).
export function marcarFalhaSaida(db: Banco, id: number, motivo: string, agora: number = Date.now()): 'reagendada' | 'abandonada' {
  const limpo = motivo.replace(/\s+/g, ' ').trim().slice(0, 300);
  const t = (db.prepare('SELECT tentativas FROM saida WHERE id = ?').get(id) as { tentativas: number } | undefined)?.tentativas ?? 0;
  const tentativas = t + 1;
  if (tentativas >= MAX_TENTATIVAS_SAIDA) {
    db.prepare("UPDATE saida SET estado = 'abandonada', tentativas = ?, erro = ? WHERE id = ?").run(tentativas, limpo, id);
    return 'abandonada';
  }
  const espera = ESPERAS_RETENTATIVA_MS[Math.min(tentativas - 1, ESPERAS_RETENTATIVA_MS.length - 1)]!;
  db.prepare("UPDATE saida SET tentativas = ?, erro = ?, proximo_em = ? WHERE id = ?").run(tentativas, limpo, agora + espera, id);
  return 'reagendada';
}

export function ehMensagemNossa(db: Banco, texto: string | null, waMsgId: string): boolean {
  if (texto?.startsWith(MARCA)) return true;
  return db.prepare('SELECT 1 AS x FROM saida WHERE wa_msg_id = ?').get(waMsgId) !== undefined;
}

export function resumoDaSaida(db: Banco): Record<'pendente' | 'enviada' | 'abandonada', number> {
  const base = { pendente: 0, enviada: 0, abandonada: 0 };
  for (const l of db.prepare('SELECT estado, COUNT(*) AS n FROM saida GROUP BY estado').all() as { estado: keyof typeof base; n: number }[]) base[l.estado] = l.n;
  return base;
}
