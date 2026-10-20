// Grava as midias em <dados>/midias/<sha256>.<ext>. O nome vem SO do hash que calculamos (nunca de mensagem). Gravacao atomica: escreve num
// arquivo temporario e renomeia, para uma queda no meio nao deixar arquivo pela metade.
import { existsSync, mkdirSync, renameSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export function criarGravadorMidia(pastaDados: string): (sha256: string, extensao: string, bytes: Uint8Array) => Promise<string> {
  return async (sha256, extensao, bytes) => {
    if (!/^[a-f0-9]{64}$/.test(sha256) || !/^(ogg|pdf)$/.test(extensao)) throw new Error('nome de arquivo invalido');
    const pasta = join(pastaDados, 'midias');
    mkdirSync(pasta, { recursive: true });
    const destino = join(pasta, `${sha256}.${extensao}`);
    if (!existsSync(destino)) {
      const temp = `${destino}.${process.pid}.tmp`;
      try {
        writeFileSync(temp, bytes);
        renameSync(temp, destino);
      } finally { rmSync(temp, { force: true }); }
    }
    return `data/midias/${sha256}.${extensao}`;
  };
}
