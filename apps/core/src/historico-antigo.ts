// Historico antigo sob demanda (fetchMessageHistory, docs/baileys/advanced/history-sync.md). SEM rede e SEM socket aqui: este modulo so decide
// QUAL conversa pedir, em que ponto, e registra o resultado. Quem fala com o WhatsApp e apps/listener/src/historico-antigo.ts.
// O pedido vai ao PROPRIO aparelho do dono (mensagem "peer" para meJid; messages-send.js do Baileys instalado), nunca a um contato: regra 1.
// Idempotente e retomavel: o estado fica em "historico_pedidos"; a mensagem repetida ja e ignorada pela ingestao (INSERT OR IGNORE).
import type { Banco } from './db.ts';

export interface ConfigHistorico { liberado: boolean; ritmoMs: number; tamanhoPagina: number; maxPaginas: number; esperaRespostaMs: number }
// 60 s e o ritmo conservador sugerido ao dono (o risco de o WhatsApp limitar a conta nao foi medido).
const PADRAO: ConfigHistorico = { liberado: false, ritmoMs: 60_000, tamanhoPagina: 50, maxPaginas: 40, esperaRespostaMs: 45_000 };
const CHAVE = 'historico.antigo';
export const PRAZO_PEDIDO_PRESO_MS = 10 * 60_000;
export const MAX_FALHAS = 3;
const VAZIAS_PARA_CONCLUIR = 2;
const ESPERA_POR_FALHA_MS = 30_000;

export function lerConfigHistorico(db: Banco): ConfigHistorico {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(CHAVE) as { valor: string } | undefined;
  let j: Partial<ConfigHistorico> = {};
  try { j = r ? (JSON.parse(r.valor) as Partial<ConfigHistorico>) : {}; } catch { j = {}; }
  const n = (v: unknown, p: number, min: number, max: number): number => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? Math.floor(v) : p);
  return {
    liberado: j.liberado === true,
    ritmoMs: n(j.ritmoMs, PADRAO.ritmoMs, 5_000, 3_600_000),
    tamanhoPagina: n(j.tamanhoPagina, PADRAO.tamanhoPagina, 1, 50),
    maxPaginas: n(j.maxPaginas, PADRAO.maxPaginas, 1, 1000),
    esperaRespostaMs: n(j.esperaRespostaMs, PADRAO.esperaRespostaMs, 1_000, 600_000)
  };
}
export function gravarConfigHistorico(db: Banco, parcial: Partial<ConfigHistorico>): void {
  const novo = { ...lerConfigHistorico(db), ...parcial };
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(CHAVE, JSON.stringify(novo));
}

export interface PedidoHistorico {
  conversaId: number;
  remoteJid: string;
  chave: { remoteJid: string; fromMe: boolean; id: string };
  tsMs: number;
  count: number;
}

const maisAntiga = (db: Banco, conversaId: number) =>
  db.prepare('SELECT wa_msg_id AS id, de_mim AS d, enviada_em AS t FROM mensagens WHERE conversa_id = ? ORDER BY enviada_em ASC, id ASC LIMIT 1').get(conversaId) as { id: string; d: number; t: number } | undefined;

// A proxima conversa a pedir, ou null (trava fechada, nada a pedir). Quem teve menos pedidos vai primeiro (reparte entre as conversas).
export function proximoPedido(db: Banco, agora: number): PedidoHistorico | null {
  const c = lerConfigHistorico(db);
  if (!c.liberado) return null;
  db.prepare("INSERT OR IGNORE INTO historico_pedidos (conversa_id) SELECT cv.id FROM conversas cv WHERE cv.tipo IN ('dm','grupo') AND EXISTS (SELECT 1 FROM mensagens m WHERE m.conversa_id = cv.id)").run();
  const linhas = db.prepare(
    `SELECT h.conversa_id AS id, cv.jid AS jid, h.falhas AS falhas, h.atualizado_em AS em, h.estado AS estado FROM historico_pedidos h JOIN conversas cv ON cv.id = h.conversa_id
     WHERE (h.estado = 'pendente' OR (h.estado = 'em_andamento' AND h.atualizado_em <= ?)) ORDER BY h.pedidos, h.conversa_id`
  ).all(agora - PRAZO_PEDIDO_PRESO_MS) as { id: number; jid: string; falhas: number; em: number; estado: string }[];
  for (const l of linhas) {
    if (l.estado === 'pendente' && l.falhas > 0 && agora < l.em + l.falhas * ESPERA_POR_FALHA_MS) continue; // espera depois de falha
    const m = maisAntiga(db, l.id);
    if (!m) continue;
    return { conversaId: l.id, remoteJid: l.jid, chave: { remoteJid: l.jid, fromMe: m.d === 1, id: m.id }, tsMs: m.t, count: c.tamanhoPagina };
  }
  return null;
}

export function iniciarPedido(db: Banco, conversaId: number, agora: number): void {
  const m = maisAntiga(db, conversaId);
  db.prepare("UPDATE historico_pedidos SET estado = 'em_andamento', pedidos = pedidos + 1, cursor_antes = ?, atualizado_em = ? WHERE conversa_id = ?").run(m?.t ?? null, agora, conversaId);
}

// Depois de esperar a resposta: quantas mensagens MAIS ANTIGAS que o ponto do pedido entraram? Zero duas vezes seguidas = a conversa acabou.
export function concluirPedido(db: Banco, conversaId: number, agora: number): { novas: number; estado: string } {
  const c = lerConfigHistorico(db);
  const h = db.prepare('SELECT pedidos, vazias, cursor_antes AS cursor FROM historico_pedidos WHERE conversa_id = ?').get(conversaId) as { pedidos: number; vazias: number; cursor: number | null } | undefined;
  if (!h) return { novas: 0, estado: 'pendente' };
  const novas = h.cursor === null ? 0 : Number((db.prepare('SELECT COUNT(*) AS n FROM mensagens WHERE conversa_id = ? AND enviada_em < ?').get(conversaId, h.cursor) as { n: number }).n);
  const vazias = novas > 0 ? 0 : h.vazias + 1;
  const estado = vazias >= VAZIAS_PARA_CONCLUIR ? 'concluida' : h.pedidos >= c.maxPaginas ? 'esgotada' : 'pendente';
  db.prepare('UPDATE historico_pedidos SET estado = ?, vazias = ?, novas = novas + ?, ultima_resposta_em = ?, falhas = 0, atualizado_em = ? WHERE conversa_id = ?').run(estado, vazias, novas, agora, agora, conversaId);
  return { novas, estado };
}

export function falharPedido(db: Banco, conversaId: number, agora: number): void {
  db.prepare("UPDATE historico_pedidos SET falhas = falhas + 1, estado = CASE WHEN falhas + 1 >= ? THEN 'esgotada' ELSE 'pendente' END, atualizado_em = ? WHERE conversa_id = ?").run(MAX_FALHAS, agora, conversaId);
}

export interface ResumoHistorico { conversas: number; pendentes: number; emAndamento: number; concluidas: number; esgotadas: number; pedidos: number; novas: number; liberado: boolean }
export function resumoHistoricoAntigo(db: Banco): ResumoHistorico {
  // O total e o de TODAS as conversas elegiveis (dm e grupo com mensagem), nao so das que ja ganharam linha em
  // historico_pedidos: antes de liberar, a tela precisa mostrar o tamanho real do trabalho (as ainda nao pedidas).
  const total = (db.prepare(
    "SELECT COUNT(*) AS n FROM conversas cv WHERE cv.tipo IN ('dm','grupo') AND EXISTS (SELECT 1 FROM mensagens m WHERE m.conversa_id = cv.id)"
  ).get() as { n: number }).n;
  const r: ResumoHistorico = { conversas: total, pendentes: 0, emAndamento: 0, concluidas: 0, esgotadas: 0, pedidos: 0, novas: 0, liberado: lerConfigHistorico(db).liberado };
  for (const l of db.prepare('SELECT estado, COUNT(*) AS n, SUM(pedidos) AS p, SUM(novas) AS nv FROM historico_pedidos GROUP BY estado').all() as { estado: string; n: number; p: number | null; nv: number | null }[]) {
    r.pedidos += l.p ?? 0; r.novas += l.nv ?? 0;
    if (l.estado === 'pendente') r.pendentes = l.n; else if (l.estado === 'em_andamento') r.emAndamento = l.n; else if (l.estado === 'concluida') r.concluidas = l.n; else if (l.estado === 'esgotada') r.esgotadas = l.n;
  }
  // Quem ainda nao tem linha (nunca pedida) tambem esta pendente. Nunca negativo, mesmo se sobrar linha de conversa apagada.
  r.pendentes = Math.max(0, total - r.concluidas - r.esgotadas - r.emAndamento);
  return r;
}
