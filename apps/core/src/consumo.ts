// Consumo do modelo (tokens) por tarefa: o dono precisa ver quanto cada coisa gasta da cota do plano. Guarda SO numeros (tokens de entrada e saida,
// tempo, modelo e dia), nunca texto de pergunta ou resposta (regra 2). Os numeros vem do campo "usage" que a API do Hermes devolve em cada resposta
// (docs/hermes-agent/user-guide/features/api-server.md, POST /v1/chat/completions; conferido no Hermes real em 2026-10-23).
import type { Banco } from './db.ts';
import { diaLocal, FUSO_PADRAO } from './calendario.ts';
import { TAREFAS, type Tarefa } from './modelos.ts';

export interface Consumo { tarefa: Tarefa; modelo: string | null; entrada: number; saida: number; ms: number }
export interface Soma { chamadas: number; entrada: number; saida: number }
export type SomaPorTarefa = Record<Tarefa, Soma> & { todas: Soma };

const DIA_MS = 86_400_000;
const inteiro = (n: unknown): number => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : 0);

export function registrarConsumo(db: Banco, c: Consumo, agora: number = Date.now(), fuso: string = FUSO_PADRAO): void {
  if (!TAREFAS.includes(c.tarefa)) return;
  const modelo = typeof c.modelo === 'string' ? c.modelo.slice(0, 64) : null;
  db.prepare('INSERT INTO consumo_modelo (em, dia, tarefa, modelo, entrada, saida, ms) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(agora, diaLocal(agora, fuso), c.tarefa, modelo, inteiro(c.entrada), inteiro(c.saida), inteiro(c.ms));
}

function somar(db: Banco, onde: { sql: string; param: string } | null): SomaPorTarefa {
  const vazio = (): Soma => ({ chamadas: 0, entrada: 0, saida: 0 });
  const r = { conversa: vazio(), extracao: vazio(), relatorio: vazio(), teste: vazio(), todas: vazio() } as SomaPorTarefa;
  const linhas = db.prepare(`SELECT tarefa, COUNT(*) AS n, SUM(entrada) AS e, SUM(saida) AS s FROM consumo_modelo ${onde ? `WHERE ${onde.sql}` : ''} GROUP BY tarefa`)
    .all(...(onde ? [onde.param] : [])) as { tarefa: Tarefa; n: number; e: number; s: number }[];
  for (const l of linhas) {
    if (!r[l.tarefa]) continue;
    r[l.tarefa] = { chamadas: l.n, entrada: l.e, saida: l.s };
    r.todas.chamadas += l.n; r.todas.entrada += l.e; r.todas.saida += l.s;
  }
  return r;
}

export function resumoDeConsumo(db: Banco, agora: number = Date.now(), fuso: string = FUSO_PADRAO): { hoje: SomaPorTarefa; semana: SomaPorTarefa; total: SomaPorTarefa } {
  return {
    hoje: somar(db, { sql: 'dia = ?', param: diaLocal(agora, fuso) }),
    semana: somar(db, { sql: 'dia >= ?', param: diaLocal(agora - 6 * DIA_MS, fuso) }),
    total: somar(db, null)
  };
}

export function mediaDaTarefa(db: Banco, tarefa: Tarefa, ultimas: number = 30): { amostras: number; entrada: number; saida: number; ms: number } {
  const r = db.prepare('SELECT COUNT(*) AS n, AVG(entrada) AS e, AVG(saida) AS s, AVG(ms) AS m FROM (SELECT entrada, saida, ms FROM consumo_modelo WHERE tarefa = ? ORDER BY id DESC LIMIT ?)')
    .get(tarefa, Math.max(1, Math.floor(ultimas))) as { n: number; e: number | null; s: number | null; m: number | null };
  return { amostras: r.n, entrada: Math.round(r.e ?? 0), saida: Math.round(r.s ?? 0), ms: Math.round(r.m ?? 0) };
}

/** Teto de tokens POR DIA para a extracao (a tarefa que pode gastar sem parar). Atingido = a ponte nao pega novos dias ate o dia seguinte. */
export const TETO_DIARIO_PADRAO = 300_000;
const TETO_MIN = 10_000, TETO_MAX = 100_000_000;
export function tetoDiario(db: Banco): number {
  const r = db.prepare("SELECT valor FROM configuracao WHERE chave = 'processamento.teto_diario'").get() as { valor: string } | undefined;
  const n = r ? Number(r.valor) : NaN;
  return Number.isFinite(n) && n >= TETO_MIN && n <= TETO_MAX ? Math.round(n) : TETO_DIARIO_PADRAO;
}
export function definirTetoDiario(db: Banco, tokens: number): { ok: true } | { ok: false; motivo: string } {
  if (typeof tokens !== 'number' || !Number.isFinite(tokens) || tokens < TETO_MIN || tokens > TETO_MAX) return { ok: false, motivo: `Informe um numero de tokens entre ${TETO_MIN.toLocaleString('pt-BR')} e ${TETO_MAX.toLocaleString('pt-BR')}.` };
  db.prepare("INSERT INTO configuracao (chave, valor) VALUES ('processamento.teto_diario', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor").run(String(Math.round(tokens)));
  return { ok: true };
}
export function tetoAtingido(db: Banco, agora: number = Date.now(), fuso: string = FUSO_PADRAO): boolean {
  const e = resumoDeConsumo(db, agora, fuso).hoje.extracao;
  return e.entrada + e.saida >= tetoDiario(db);
}
