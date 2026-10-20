// Entrega da caixa de saida ao dono. Usa SOMENTE o Envio recebido (criarEnvio: so o self-chat). Sem conexao, nao faz nada e nao gasta tentativa.
import type { Banco } from '../../core/src/db.ts';
import type { Envio } from '../../core/src/envio.ts';
import { marcarEnviada, marcarFalhaSaida, proximaSaida } from '../../core/src/saida.ts';

export async function entregarProxima(db: Banco, envio: Envio, ultimoId: () => string | null, agora: number = Date.now()): Promise<'vazia' | 'enviada' | 'falhou'> {
  const s = proximaSaida(db, agora);
  if (!s) return 'vazia';
  try {
    await envio.texto(s.texto);
  } catch {
    // So o motivo curto: a mensagem de erro do socket nao deve carregar texto de conversa para o banco.
    marcarFalhaSaida(db, s.id, 'falha_ao_enviar_pelo_whatsapp', agora);
    return 'falhou';
  }
  marcarEnviada(db, s.id, ultimoId(), agora);
  return 'enviada';
}

export interface OpcoesEntregador {
  banco: Banco;
  /** O Envio atual (nulo enquanto nao ha conexao aberta). */
  envio: () => Envio | null;
  /** Id da ultima mensagem enviada, informado pelo transporte. */
  ultimoId: () => string | null;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
}

export function iniciarEntregador(o: OpcoesEntregador): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  let acordar: (() => void) | null = null;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => { const t = setTimeout(r, ms); acordar = () => { clearTimeout(t); r(); }; }));
  let parado = false;
  const terminou = (async () => {
    while (!parado) {
      const envio = o.envio();
      let r: 'vazia' | 'enviada' | 'falhou' = 'vazia';
      if (envio) { try { r = await entregarProxima(o.banco, envio, o.ultimoId, agora()); } catch { r = 'falhou'; } }
      if (r !== 'enviada') await esperar(o.intervaloMs ?? 2000);
    }
  })();
  return { parar: () => { parado = true; acordar?.(); }, terminou };
}
