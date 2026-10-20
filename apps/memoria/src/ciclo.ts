// O laco da memoria: de tempos em tempos agenda os dias fechados que mudaram e envia um trabalho "retain" por vez ao Hindsight.
import type { Banco } from '../../core/src/db.ts';
import { pegarProximo, recuperarTravados } from '../../core/src/fila.ts';
import { agendarRetain, processarRetain, type PortaMemoria } from '../../core/src/memoria.ts';
import type { Resultado } from '../../core/src/midia.ts';

export async function rodarCiclo(db: Banco, porta: PortaMemoria, agora: number = Date.now()): Promise<'vazio' | Resultado> {
  agendarRetain(db, agora);
  const job = pegarProximo(db, ['retain'], agora);
  if (!job) return 'vazio';
  return processarRetain(db, job, porta, agora);
}

export interface OpcoesMemoria {
  banco: Banco;
  porta: PortaMemoria;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
  prazoTravadoMs?: number;
}

export function iniciarMemoria(o: OpcoesMemoria): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let parado = false;
  const terminou = (async () => {
    recuperarTravados(o.banco, agora(), o.prazoTravadoMs ?? 30 * 60_000);
    while (!parado) {
      let r: 'vazio' | Resultado = 'vazio';
      try { r = await rodarCiclo(o.banco, o.porta, agora()); } catch { /* erro inesperado nao derruba o laco: tenta de novo no proximo giro */ }
      if (r === 'vazio') await esperar(o.intervaloMs ?? 60_000);
    }
  })();
  return { parar: () => { parado = true; }, terminou };
}
