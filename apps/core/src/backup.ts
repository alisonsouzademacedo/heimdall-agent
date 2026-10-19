// Backup do acervo: copia consistente do SQLite (VACUUM INTO) e regra "primeiro uso do dia" (decisao do dono, 2026-10-19).
// Restaurar reaplica a lista de esquecimento (apagar.ts). Hindsight e Hermes tem comandos proprios (docs/plano/fase-1-seguranca-operacional.md).
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { reaplicarEsquecimento } from './apagar.ts';
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

// Abre um backup como banco novo, atualiza o esquema e reaplica a lista de esquecimento.
export function restaurarBackup(arquivo: string, destino: string, externos: readonly string[], agora: number, apagarArquivo: (c: string) => void = () => {}): Banco {
  if (!existsSync(arquivo)) throw new Error('backup nao encontrado');
  if (existsSync(destino)) throw new Error('o destino da restauracao ja existe');
  const origem = abrirBanco(arquivo);
  if (destino.includes("'")) throw new Error('nome de arquivo invalido');
  origem.exec(`VACUUM INTO '${destino}'`);
  origem.close();
  const db = abrirBanco(destino);
  migrar(db, undefined, agora);
  reaplicarEsquecimento(db, externos, agora, apagarArquivo);
  return db;
}
