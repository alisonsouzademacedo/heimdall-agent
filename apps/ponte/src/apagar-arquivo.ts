// Apaga o arquivo de uma midia quando o dono confirma "apagar" (core/apagar.ts decide O QUE; aqui so se executa). EXCECAO ESTREITA a regra
// "a ponte nao apaga arquivos": so este arquivo apaga, so o formato que o proprio Heimdall grava (data/midias/<sha256 minusculo>.(ogg|pdf)),
// e a pasta vem da configuracao, nunca do texto recebido (arquitetura.test.ts confere).
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';

const CAMINHO_GRAVADO = /^data\/midias\/([a-f0-9]{64}\.(?:ogg|pdf))$/;

export function criarApagadorDeMidia(pastaDados: string): (caminho: string) => boolean {
  return (caminho) => {
    const m = typeof caminho === 'string' ? CAMINHO_GRAVADO.exec(caminho) : null;
    if (!m) return false;
    try { unlinkSync(join(pastaDados, 'midias', m[1]!)); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return false; }
    return true;
  };
}
