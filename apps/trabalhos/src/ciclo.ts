// O laco do executor: um trabalho de texto (transcrever / converter PDF) por vez, em ordem. "baixar_midia", "extrair" e "retain" sao de outros processos.
import type { Banco } from '../../core/src/db.ts';
import { pegarProximo, recuperarTravados } from '../../core/src/fila.ts';
import { processarTexto, type PortasTexto, type Resultado } from '../../core/src/midia.ts';

export async function rodarCiclo(db: Banco, portas: PortasTexto, agora: number = Date.now()): Promise<'vazio' | Resultado> {
  const job = pegarProximo(db, ['transcrever', 'converter_pdf'], agora);
  if (!job) return 'vazio';
  return processarTexto(db, job, portas, agora);
}

export interface OpcoesExecutor {
  banco: Banco;
  portas: PortasTexto;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
  prazoTravadoMs?: number;
}

export function iniciarExecutor(o: OpcoesExecutor): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let parado = false;
  const terminou = (async () => {
    // Depois de uma queda, o que ficou "em andamento" alem do prazo volta para a fila.
    recuperarTravados(o.banco, agora(), o.prazoTravadoMs ?? 15 * 60_000);
    while (!parado) {
      const r = await rodarCiclo(o.banco, o.portas, agora());
      if (r === 'vazio') await esperar(o.intervaloMs ?? 5000);
    }
  })();
  return { parar: () => { parado = true; }, terminou };
}
