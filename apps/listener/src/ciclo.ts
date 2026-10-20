// O laco que baixa as midias da fila ("baixar_midia"): um por vez, SO enquanto ha conexao com o WhatsApp (a leitura do arquivo precisa do socket).
import type { Banco } from '../../core/src/db.ts';
import { pegarProximo, recuperarTravados } from '../../core/src/fila.ts';
import { processarBaixarMidia, type PortasBaixar } from '../../core/src/midia.ts';

export interface OpcoesBaixador {
  banco: Banco;
  /** Devolve as portas quando ha conexao aberta, ou null enquanto nao ha. */
  portas: () => PortasBaixar | null;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
  prazoTravadoMs?: number;
}

export function iniciarBaixador(o: OpcoesBaixador): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let parado = false;
  const terminou = (async () => {
    recuperarTravados(o.banco, agora(), o.prazoTravadoMs ?? 15 * 60_000);
    while (!parado) {
      const portas = o.portas();
      const job = portas ? pegarProximo(o.banco, ['baixar_midia'], agora()) : null;
      if (portas && job) await processarBaixarMidia(o.banco, job, portas, agora());
      else await esperar(o.intervaloMs ?? 3000);
    }
  })();
  return { parar: () => { parado = true; }, terminou };
}
