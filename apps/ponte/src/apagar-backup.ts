// Apaga UM arquivo de backup antigo ou invalido (rodizio; core/backup-rodizio.ts decide O QUE). EXCECAO ESTREITA, autorizada pelo dono em
// 2026-10-20: so o nome que o proprio Heimdall grava (acervo-AAAA-MM-DD.sqlite), so dentro da pasta de backup configurada, nunca por curinga.
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';

const NOME_GRAVADO = /^acervo-\d{4}-\d{2}-\d{2}\.sqlite$/;

export function apagarBackup(pasta: string, nome: string): boolean {
  if (typeof nome !== 'string' || !NOME_GRAVADO.test(nome) || typeof pasta !== 'string' || pasta === '') return false;
  try { unlinkSync(join(pasta, nome)); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return false; }
  return true;
}
