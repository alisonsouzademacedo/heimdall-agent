// O laco da ponte: de tempos em tempos olha o self-chat do dono e responde pela caixa de saida.
import type { Banco } from '../../core/src/db.ts';
import { processarSelfChat, type PortasSelfChat } from './selfchat.ts';

export interface OpcoesPonte {
  banco: Banco;
  portas: PortasSelfChat;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
}

export function iniciarPonte(o: OpcoesPonte): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  let acordar: (() => void) | null = null;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => { const t = setTimeout(r, ms); acordar = () => { clearTimeout(t); r(); }; }));
  let parado = false;
  const terminou = (async () => {
    while (!parado) {
      try { await processarSelfChat(o.banco, o.portas, agora()); } catch { /* erro inesperado nao derruba o laco: tenta no proximo giro */ }
      await esperar(o.intervaloMs ?? 5000);
    }
  })();
  return { parar: () => { parado = true; acordar?.(); }, terminou };
}

// Le so API_SERVER_KEY de um arquivo .env (formato CHAVE=valor). Nada mais do arquivo e devolvido.
export function lerChaveDoEnv(conteudo: string): string | null {
  for (const linha of conteudo.split(/\r?\n/)) {
    const m = /^API_SERVER_KEY=(.*)$/.exec(linha.trim());
    if (m) {
      const v = m[1]!.trim().replace(/^(["'])(.*)\1$/, '$2');
      return v === '' ? null : v;
    }
  }
  return null;
}
