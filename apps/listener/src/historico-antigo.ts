// UNICO arquivo que chama fetchMessageHistory (travado por arquitetura.test.ts). O pedido e uma mensagem "peer" para a PROPRIA conta do dono
// (messages-send.js, sendPeerDataOperationMessage -> meJid): nao vai a nenhum contato, nao e envio de conversa. Regra 1 intacta.
// Roda so com a trava aberta pelo dono (config historico.antigo.liberado), so enquanto o WhatsApp esta "conectado", poucos pedidos por vez, com espera.
import type { Banco } from '../../core/src/db.ts';
import { lerEstado } from '../../core/src/whatsapp/estado.ts';
import { concluirPedido, falharPedido, iniciarPedido, lerConfigHistorico, proximoPedido } from '../../core/src/historico-antigo.ts';

export interface SockHistorico {
  fetchMessageHistory(count: number, oldestMsgKey: { remoteJid: string; fromMe: boolean; id: string }, oldestMsgTimestampMs: number): Promise<unknown>;
}
export interface OpcoesHistoricoAntigo {
  banco: Banco;
  /** O socket aberto agora (null = sem conexao). */
  sock: () => SockHistorico | null;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
}

const OCIOSO_MS = 5_000;
const SEM_TRABALHO_MS = 60_000;

export function iniciarHistoricoAntigo(o: OpcoesHistoricoAntigo): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let parado = false;
  const terminou = (async () => {
    while (!parado) {
      try {
        const cfg = lerConfigHistorico(o.banco);
        const sock = o.sock();
        if (!cfg.liberado || !sock || lerEstado(o.banco).estado !== 'conectado') { await esperar(OCIOSO_MS); continue; }
        const p = proximoPedido(o.banco, agora());
        if (!p) { await esperar(SEM_TRABALHO_MS); continue; }
        iniciarPedido(o.banco, p.conversaId, agora());
        try { await sock.fetchMessageHistory(p.count, p.chave, p.tsMs); }
        catch { falharPedido(o.banco, p.conversaId, agora()); await esperar(cfg.ritmoMs); continue; }
        await esperar(cfg.esperaRespostaMs); // a resposta chega como messaging-history.set e e gravada pela escuta
        concluirPedido(o.banco, p.conversaId, agora());
        await esperar(cfg.ritmoMs);
      } catch { await esperar(OCIOSO_MS); }
    }
  })();
  return { parar: () => { parado = true; }, terminou };
}
