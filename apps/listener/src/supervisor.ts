// Supervisor de conexao: decide quando recriar o socket (o Baileys NAO reconecta sozinho: docs/baileys/advanced/troubleshooting.md).
// Regras: deslogado (401) nunca reconecta; reinicio pedido (515, logo depois do QR) reconecta ja; o resto espera cada vez mais e zera ao conectar.
import type { Estado } from './ligar.ts';

export const ESPERAS_MS = [1000, 2000, 5000, 10000, 30000] as const;
const CODIGO_REINICIO = 515; // DisconnectReason.restartRequired (conferido na biblioteca instalada)

export interface Sessao { encerrar(): void }

export interface OpcoesSupervisor {
  criar: (aoEstado: (e: Estado) => void) => Promise<Sessao>;
  aoEstado: (e: Estado) => void;
  esperar?: (ms: number) => Promise<void>;
}

export function supervisionar(o: OpcoesSupervisor): { iniciar(): Promise<void>; parar(): void } {
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let sessao: Sessao | null = null;
  let falhas = 0;
  let parado = false;
  let ocupado = false;

  async function subir(): Promise<void> {
    for (;;) {
      if (parado) return;
      try {
        sessao = await o.criar(tratar);
        return;
      } catch (e) {
        o.aoEstado({ estado: 'aviso', motivo: `nao consegui abrir a conexao: ${e instanceof Error ? e.message : String(e)}`.slice(0, 200) });
        await esperar(ESPERAS_MS[Math.min(falhas++, ESPERAS_MS.length - 1)]!);
      }
    }
  }

  function tratar(e: Estado): void {
    o.aoEstado(e);
    if (parado) return;
    if (e.estado === 'conectado') { falhas = 0; return; }
    if (e.estado === 'deslogado') { sessao?.encerrar(); sessao = null; parado = true; return; }
    if (e.estado === 'reconectar') {
      if (ocupado) return;
      ocupado = true;
      sessao?.encerrar();
      sessao = null;
      const espera = e.codigo === CODIGO_REINICIO ? 0 : ESPERAS_MS[Math.min(falhas++, ESPERAS_MS.length - 1)]!;
      void esperar(espera).then(() => subir()).finally(() => { ocupado = false; });
    }
  }

  return {
    async iniciar() { await subir(); },
    parar() { parado = true; sessao?.encerrar(); sessao = null; }
  };
}
