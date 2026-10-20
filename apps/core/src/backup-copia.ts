// Backup do acervo: SO COPIA. (Restaurar, que reaplica "apagar", fica em backup.ts; a tela e a ponte nao importam aquele.)
// Regra do dono (2026-10-19): primeiro uso do dia. Destino escolhido por ele (HD externo, outro disco, pen drive) e conferido antes de valer.
import { accessSync, constants, existsSync, mkdirSync, statSync, statfsSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import type { Banco } from './db.ts';
import { diaLocal, FUSO_PADRAO } from './calendario.ts';

// Copia consistente mesmo com o banco em uso. Recusa sobrescrever um arquivo existente.
export function fazerBackup(db: Banco, destino: string): void {
  if (existsSync(destino)) throw new Error('o arquivo de backup ja existe');
  mkdirSync(dirname(destino), { recursive: true });
  if (destino.includes("'")) throw new Error('nome de arquivo invalido');
  db.exec(`VACUUM INTO '${destino}'`);
}

// Primeiro uso do dia: ha backup ainda nao feito HOJE (no fuso do usuario)?
export function devoFazerBackup(ultimoBackupEm: number | null, agora: number, fuso: string = FUSO_PADRAO): boolean {
  if (ultimoBackupEm === null) return true;
  return diaLocal(ultimoBackupEm, fuso) < diaLocal(agora, fuso);
}

const K = { destino: 'backup.destino', ultimo: 'backup.ultimo_em', erro: 'backup.erro' } as const;
const ler = (db: Banco, chave: string): string | null => (db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(chave) as { valor: string } | undefined)?.valor ?? null;
const gravar = (db: Banco, chave: string, valor: string | number | null): void => { db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(chave, JSON.stringify(valor)); };
const lerJson = <T>(db: Banco, chave: string): T | null => { const v = ler(db, chave); if (v === null) return null; try { return JSON.parse(v) as T; } catch { return null; } };

export interface OpcoesDestino { espacoLivre?: (pasta: string) => number; tamanhoDoAcervo?: number }
export type ResultadoDestino = { ok: true } | { ok: false; motivo: string };

const ESPACO_MARGEM = 50 * 1024 * 1024;
const espacoLivrePadrao = (pasta: string): number => { const s = statfsSync(pasta); return Number(s.bavail) * Number(s.bsize); };

export function validarDestinoDeBackup(pasta: string, o: OpcoesDestino = {}): ResultadoDestino {
  if (typeof pasta !== 'string' || pasta.trim() === '' || !isAbsolute(pasta)) return { ok: false, motivo: 'Informe o caminho completo da pasta (por exemplo E:\\Backup-Heimdall).' };
  if (pasta.includes("'")) return { ok: false, motivo: 'O caminho nao pode ter aspas simples.' };
  try { if (!statSync(pasta).isDirectory()) return { ok: false, motivo: 'Esse caminho nao e uma pasta.' }; } catch { return { ok: false, motivo: 'Essa pasta nao existe (o pen drive ou o disco esta conectado?).' }; }
  try { accessSync(pasta, constants.W_OK); } catch { return { ok: false, motivo: 'Nao consigo gravar nessa pasta.' }; }
  try {
    const livre = (o.espacoLivre ?? espacoLivrePadrao)(pasta);
    const precisa = (o.tamanhoDoAcervo ?? 0) * 2 + ESPACO_MARGEM;
    if (livre < precisa && (o.tamanhoDoAcervo ?? 0) > 0) return { ok: false, motivo: 'Pouco espaco livre nesse destino para o backup.' };
  } catch { /* sem informacao de espaco: nao bloqueia */ }
  return { ok: true };
}

function tamanhoDoBanco(db: Banco): number {
  const p = db.prepare('PRAGMA page_count').get() as { page_count: number }; const s = db.prepare('PRAGMA page_size').get() as { page_size: number };
  return p.page_count * s.page_size;
}

export function definirDestinoDeBackup(db: Banco, pasta: string, o: OpcoesDestino = {}): ResultadoDestino {
  const r = validarDestinoDeBackup(pasta, { tamanhoDoAcervo: tamanhoDoBanco(db), ...o });
  if (r.ok) { gravar(db, K.destino, pasta); gravar(db, K.erro, null); }
  return r;
}

export function lerBackup(db: Banco): { destino: string | null; ultimoEm: number | null; erro: string | null } {
  return { destino: lerJson<string>(db, K.destino), ultimoEm: lerJson<number>(db, K.ultimo), erro: lerJson<string>(db, K.erro) };
}

// Chamado de tempos em tempos pela ponte: faz o backup do dia se ainda nao foi feito. Nunca lanca (o erro fica anotado para o painel).
export function backupDoDia(db: Banco, agora: number = Date.now(), fuso: string = FUSO_PADRAO): 'sem_destino' | 'em_dia' | 'feito' | 'erro' {
  const { destino, ultimoEm } = lerBackup(db);
  if (!destino) return 'sem_destino';
  if (!devoFazerBackup(ultimoEm, agora, fuso)) return 'em_dia';
  try {
    const arquivo = join(destino, `acervo-${diaLocal(agora, fuso)}.sqlite`);
    if (!existsSync(arquivo)) {
      if (!statSync(destino, { throwIfNoEntry: false })?.isDirectory()) throw new Error('A pasta de backup nao esta acessivel.');
      fazerBackup(db, arquivo);
    }
    gravar(db, K.ultimo, agora);
    gravar(db, K.erro, null);
    return 'feito';
  } catch (e) {
    const motivo = (e instanceof Error ? e.message : String(e)).replace(/\s+/g, ' ').slice(0, 200);
    gravar(db, K.erro, motivo);
    return 'erro';
  }
}
