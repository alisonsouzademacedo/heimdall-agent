// Fila durável do acervo (tabela "fila", migracao v4). A escuta nunca espera o processamento: tudo que e pesado entra aqui e e consumido
// por outro processo (download da midia no listener; transcricao e PDF no executor). Sem tipo "enviar": a regra 1 vale ate para a fila.
import type { Banco } from './db.ts';

export type TipoTrabalho = 'baixar_midia' | 'transcrever' | 'converter_pdf' | 'extrair' | 'retain';
export interface Trabalho { id: number; tipo: TipoTrabalho; referencia: string; tentativas: number }

export const MAX_TENTATIVAS = 5;
export const ESPERAS_RETENTATIVA_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000] as const;

export function enfileirar(db: Banco, tipo: TipoTrabalho, referencia: string, agora: number = Date.now()): boolean {
  const r = db.prepare('INSERT OR IGNORE INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?)').run(tipo, referencia, agora, agora, agora);
  return Number(r.changes) === 1;
}

// Para trabalho que se REPETE quando o conteudo muda (ex.: reenviar um documento ao Hindsight): concluido ou abandonado volta a pendente,
// com a contagem de tentativas zerada; pendente ou em andamento fica como esta. Devolve true quando ha trabalho novo a fazer.
export function reenfileirar(db: Banco, tipo: TipoTrabalho, referencia: string, agora: number = Date.now()): boolean {
  if (enfileirar(db, tipo, referencia, agora)) return true;
  const r = db.prepare("UPDATE fila SET estado = 'pendente', tentativas = 0, erro = NULL, proximo_em = ?, atualizado_em = ? WHERE tipo = ? AND referencia = ? AND estado IN ('ok','erro','abandonada')").run(agora, agora, tipo, referencia);
  return Number(r.changes) === 1;
}

// Pega o trabalho pronto mais antigo dos tipos pedidos e o marca "em_andamento" na mesma instrucao (dois consumidores nunca pegam o mesmo).
export function pegarProximo(db: Banco, tipos: readonly TipoTrabalho[], agora: number = Date.now()): Trabalho | null {
  if (tipos.length === 0) return null;
  const marcas = tipos.map(() => '?').join(',');
  const r = db
    .prepare(
      `UPDATE fila SET estado = 'em_andamento', tentativas = tentativas + 1, atualizado_em = ?
       WHERE id = (SELECT id FROM fila WHERE estado = 'pendente' AND proximo_em <= ? AND tipo IN (${marcas}) ORDER BY proximo_em, id LIMIT 1)
       RETURNING id, tipo, referencia, tentativas`
    )
    .get(agora, agora, ...tipos) as unknown as Trabalho | undefined;
  return r ?? null;
}

// Registra o hash do conteudo de um trabalho recem-abandonado; "abandonadaComEsteConteudo" diz se vale tentar de novo (so se o conteudo mudou).
export function registrarAbandono(db: Banco, id: number, hashConteudo: string): void {
  db.prepare("UPDATE fila SET hash_abandono = ? WHERE id = ? AND estado = 'abandonada'").run(hashConteudo, id);
}
export function abandonadaComEsteConteudo(db: Banco, tipo: TipoTrabalho, referencia: string, hashConteudo: string): boolean {
  const r = db.prepare("SELECT hash_abandono AS h FROM fila WHERE tipo = ? AND referencia = ? AND estado = 'abandonada'").get(tipo, referencia) as { h: string | null } | undefined;
  return r !== undefined && r.h === hashConteudo;
}

// Ha trabalho pronto agora para algum destes tipos? Os agendadores varrem o acervo INTEIRO: so valem a pena quando a fila esvazia
// (o trabalho remonta o conteudo na hora de rodar, entao nada fica desatualizado esperando). LICOES.md, 2026-10-21.
export function haProntos(db: Banco, tipos: readonly TipoTrabalho[], agora: number = Date.now()): boolean {
  if (tipos.length === 0) return false;
  const marcas = tipos.map(() => '?').join(',');
  return db.prepare(`SELECT 1 AS x FROM fila WHERE estado = 'pendente' AND proximo_em <= ? AND tipo IN (${marcas}) LIMIT 1`).get(agora, ...tipos) !== undefined;
}

export function concluir(db: Banco, id: number, agora: number = Date.now()): void {
  db.prepare("UPDATE fila SET estado = 'ok', erro = NULL, atualizado_em = ? WHERE id = ?").run(agora, id);
}

// So o MOTIVO do erro e guardado (curto, sem quebra de linha): conteudo de conversa nunca vai para a fila (regra 2).
function limparErro(erro: string): string {
  return erro.replace(/\s+/g, ' ').trim().slice(0, 300);
}

export function falhar(db: Banco, id: number, erro: string, agora: number = Date.now(), opcoes: { definitiva?: boolean } = {}): 'reagendada' | 'abandonada' {
  const t = db.prepare('SELECT tentativas FROM fila WHERE id = ?').get(id) as { tentativas: number } | undefined;
  if (!t) return 'abandonada';
  if (opcoes.definitiva || t.tentativas >= MAX_TENTATIVAS) {
    db.prepare("UPDATE fila SET estado = 'abandonada', erro = ?, atualizado_em = ? WHERE id = ?").run(limparErro(erro), agora, id);
    return 'abandonada';
  }
  const espera = ESPERAS_RETENTATIVA_MS[Math.min(t.tentativas - 1, ESPERAS_RETENTATIVA_MS.length - 1)]!;
  db.prepare("UPDATE fila SET estado = 'pendente', erro = ?, proximo_em = ?, atualizado_em = ? WHERE id = ?").run(limparErro(erro), agora + espera, agora, id);
  return 'reagendada';
}

// Depois de uma queda: o que ficou "em andamento" alem do prazo volta para a fila (a tentativa interrompida continua contada).
export function recuperarTravados(db: Banco, agora: number, prazoMs: number): number {
  const corte = agora - prazoMs;
  const abandonados = db.prepare("UPDATE fila SET estado = 'abandonada', erro = 'travou_muitas_vezes', atualizado_em = ? WHERE estado = 'em_andamento' AND atualizado_em < ? AND tentativas >= ?").run(agora, corte, MAX_TENTATIVAS);
  const r = db.prepare("UPDATE fila SET estado = 'pendente', proximo_em = ?, atualizado_em = ? WHERE estado = 'em_andamento' AND atualizado_em < ?").run(agora, agora, corte);
  return Number(r.changes) + Number(abandonados.changes);
}

export function resumoDaFila(db: Banco): Record<'pendente' | 'em_andamento' | 'ok' | 'erro' | 'abandonada', number> {
  const base = { pendente: 0, em_andamento: 0, ok: 0, erro: 0, abandonada: 0 };
  for (const l of db.prepare('SELECT estado, COUNT(*) AS n FROM fila GROUP BY estado').all() as { estado: keyof typeof base; n: number }[]) base[l.estado] = l.n;
  return base;
}
