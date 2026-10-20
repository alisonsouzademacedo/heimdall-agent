// Estado da conexao com o WhatsApp, guardado em "configuracao" (SQLite) para a tela, que roda em outro processo, ler sem canal novo.
// O numero e o LID do dono NUNCA ficam aqui por inteiro: so os quatro ultimos digitos, para o dono reconhecer a conta.
import type { Banco } from '../db.ts';
import type { IdentidadeDono } from '../envio.ts';

export type EstadoGravavel =
  | { estado: 'conectado'; dono: IdentidadeDono }
  | { estado: 'deslogado' }
  | { estado: 'reconectar'; codigo: number | undefined }
  | { estado: 'erro'; motivo: string }
  | { estado: 'aviso'; motivo: string };

export interface EstadoLido {
  estado: 'desconhecido' | EstadoGravavel['estado'];
  atualizadoEm: number | null;
  dono: string | null;
  motivo: string | null;
  codigo: number | null;
  aviso: { motivo: string; em: number } | null;
  historico: { progresso: number | null; ultima: boolean; em: number } | null;
  contagem: { inseridas: number; duplicadas: number; editadas: number; apagadas: number; midiasEnfileiradas: number; falhas: number; ultimaMensagemEm: number | null; em: number } | null;
  temQr: boolean;
}

const K = { estado: 'whatsapp.estado', qr: 'whatsapp.qr', historico: 'whatsapp.historico', contagem: 'whatsapp.contagem', aviso: 'whatsapp.aviso' } as const;

function gravar(db: Banco, chave: string, valor: unknown): void {
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(chave, JSON.stringify(valor));
}
function ler<T>(db: Banco, chave: string): T | null {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(chave) as { valor: string } | undefined;
  if (!r) return null;
  try { return JSON.parse(r.valor) as T; } catch { return null; }
}

export function mascararNumero(jid: string): string {
  const user = (jid.split('@')[0] ?? '').split(':')[0] ?? '';
  return user.length >= 4 ? `…${user.slice(-4)}` : '…';
}

export function gravarEstado(db: Banco, e: EstadoGravavel, agora: number = Date.now()): void {
  if (e.estado === 'aviso') { gravar(db, K.aviso, { motivo: e.motivo, em: agora }); return; } // aviso nao troca o estado da conexao
  const base: Record<string, unknown> = { estado: e.estado, em: agora };
  if (e.estado === 'conectado') base.dono = mascararNumero(e.dono.pn);
  if (e.estado === 'erro') base.motivo = e.motivo;
  if (e.estado === 'reconectar') base.codigo = e.codigo ?? null;
  gravar(db, K.estado, base);
  if (e.estado === 'conectado') {
    // O QR so vale ate escanear e reconectar limpa o aviso. Sem DELETE (so apagar.ts apaga dados: arquitetura.test.ts): grava valor nulo.
    gravar(db, K.qr, null);
    gravar(db, K.aviso, null);
  }
}

// "svg" e o desenho do QR, gerado por quem recebe o QR (o listener); a tela mostra so ele, como imagem (nunca como HTML).
export function gravarQr(db: Banco, qr: string, agora: number = Date.now(), svg?: string): void {
  gravar(db, K.qr, svg === undefined ? { qr, em: agora } : { qr, em: agora, svg });
}
export function lerQr(db: Banco): { qr: string; em: number; svg?: string } | null {
  return ler<{ qr: string; em: number; svg?: string }>(db, K.qr);
}

// Saude dos servicos com que cada processo fala (Hindsight, Hermes): quem fala com eles anota, a tela so le. Sem rede aqui.
const SERVICOS = new Set(['hindsight', 'hermes']);
export function gravarServico(db: Banco, nome: string, ok: boolean, agora: number = Date.now()): void {
  if (!SERVICOS.has(nome)) throw new Error('servico desconhecido');
  gravar(db, `servico.${nome}`, { ok, em: agora });
}
export function lerServicos(db: Banco): Record<string, { ok: boolean; em: number }> {
  const saida: Record<string, { ok: boolean; em: number }> = {};
  for (const nome of SERVICOS) { const v = ler<{ ok: boolean; em: number }>(db, `servico.${nome}`); if (v) saida[nome] = v; }
  return saida;
}

export function gravarHistorico(db: Banco, h: { progresso: number | null; ultima: boolean }, agora: number = Date.now()): void {
  gravar(db, K.historico, { progresso: h.progresso, ultima: h.ultima, em: agora });
}

export function gravarContagem(db: Banco, c: Omit<NonNullable<EstadoLido['contagem']>, 'em'>, agora: number = Date.now()): void {
  gravar(db, K.contagem, { ...c, em: agora });
}

export function lerEstado(db: Banco): EstadoLido {
  const e = ler<{ estado: EstadoLido['estado']; em: number; dono?: string; motivo?: string; codigo?: number | null }>(db, K.estado);
  return {
    estado: e?.estado ?? 'desconhecido',
    atualizadoEm: e?.em ?? null,
    dono: e?.dono ?? null,
    motivo: e?.motivo ?? null,
    codigo: e?.codigo ?? null,
    aviso: ler(db, K.aviso),
    historico: ler(db, K.historico),
    contagem: ler(db, K.contagem),
    temQr: lerQr(db) !== null
  };
}
