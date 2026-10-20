// Backup do acervo: copia consistente do SQLite (VACUUM INTO) e regra "primeiro uso do dia" (decisao do dono, 2026-10-19).
// Restaurar reaplica a lista de esquecimento (apagar.ts). Hindsight e Hermes tem comandos proprios (docs/plano/fase-1-seguranca-operacional.md).
import { existsSync } from 'node:fs';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { reaplicarEsquecimento } from './apagar.ts';

export { fazerBackup, devoFazerBackup } from './backup-copia.ts';

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
