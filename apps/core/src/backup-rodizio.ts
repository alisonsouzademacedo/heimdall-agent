// Rodizio dos backups (autorizado pelo dono em 2026-10-20): apagar backups INVALIDOS e os que passaram de 30 dias. So DECIDE e inspeciona;
// quem apaga o arquivo e a funcao injetada (ponte/apagar-backup.ts), restrita ao nome que o proprio Heimdall grava.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { diasEntre } from './calendario.ts';

export const RETENCAO_BACKUP_DIAS = 30;
export const NOME_BACKUP = /^acervo-(\d{4}-\d{2}-\d{2})\.sqlite$/;

export interface ArquivoBackup { nome: string; valido: boolean }

// Regras: so nomes acervo-AAAA-MM-DD.sqlite; o de hoje nunca; o valido mais recente nunca; invalido sai; valido sai se passou da retencao.
export function escolherParaApagar(arquivos: readonly ArquivoBackup[], hoje: string): string[] {
  const nossos = arquivos.filter((a) => NOME_BACKUP.test(a.nome));
  const dia = (a: ArquivoBackup): string => NOME_BACKUP.exec(a.nome)![1]!;
  const maisRecenteValido = nossos.filter((a) => a.valido).map(dia).sort().pop() ?? null;
  return nossos.filter((a) => {
    const d = dia(a);
    if (d >= hoje) return false;
    if (!a.valido) return true;
    if (d === maisRecenteValido) return false;
    return diasEntre(d, hoje) > RETENCAO_BACKUP_DIAS;
  }).map((a) => a.nome);
}

// Valido = abre como SQLite, passa na checagem de integridade e tem a tabela principal do Heimdall.
export function backupValido(caminho: string): boolean {
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(caminho, { readOnly: true });
    const ic = db.prepare('PRAGMA integrity_check').get() as { integrity_check: string } | undefined;
    if (ic?.integrity_check !== 'ok') return false;
    return db.prepare("SELECT 1 AS x FROM sqlite_master WHERE type = 'table' AND name = 'mensagens'").get() !== undefined;
  } catch { return false; } finally { try { db?.close(); } catch { /* ja fechado */ } }
}

export function rodizioDeBackups(pasta: string, hoje: string, apagar: (nome: string) => void): { apagados: string[] } {
  let nomes: string[];
  try { nomes = readdirSync(pasta); } catch { return { apagados: [] }; }
  const arquivos = nomes.filter((n) => NOME_BACKUP.test(n)).map((n) => ({ nome: n, valido: backupValido(join(pasta, n)) }));
  const apagados: string[] = [];
  for (const n of escolherParaApagar(arquivos, hoje)) {
    try { apagar(n); apagados.push(n); } catch { /* um que nao deu para apagar nao impede os outros */ }
  }
  return { apagados };
}
