// Historico SINTETICO e deterministico (mesma semente = mesmas mensagens) para os testes de carga. Nenhuma conversa real (regra 2).
import type { MensagemBaileys } from '../../apps/core/src/whatsapp/traduzir.ts';

export const DONO = { pn: '5511900000000:7@s.whatsapp.net', lid: '999888777666555@lid' };
export const AGORA = Date.parse('2026-10-21T15:00:00Z');
const DIA = 86_400_000;

export function prng(semente: number): () => number {
  let s = semente >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export interface Opcoes { mensagens: number; clientes: number; grupos?: number; dias?: number; semente?: number }

// Mensagens de DM com clientes (a maioria), de grupos, do self-chat, reacoes (ignoradas), audios e PDFs. Ids unicos por conversa.
export function gerarHistorico(o: Opcoes): MensagemBaileys[] {
  const r = prng(o.semente ?? 1);
  const dias = o.dias ?? 60;
  const grupos = o.grupos ?? Math.max(1, Math.floor(o.clientes / 20));
  const saida: MensagemBaileys[] = [];
  for (let i = 0; i < o.mensagens; i++) {
    const x = r();
    const ts = Math.floor((AGORA - 1 * DIA - Math.floor(r() * dias * DIA)) / 1000); // sempre ANTES de hoje (dias fechados)
    let remoteJid: string; let fromMe = r() < 0.5; let participant: string | undefined;
    if (x < 0.02) { remoteJid = DONO.pn.replace(':7', ''); fromMe = true; }
    else if (x < 0.1) { remoteJid = `1203630${String(Math.floor(r() * grupos)).padStart(6, '0')}@g.us`; participant = `55119${String(Math.floor(r() * o.clientes) + 1).padStart(8, '0')}@s.whatsapp.net`; }
    else remoteJid = `55119${String(Math.floor(r() * o.clientes) + 1).padStart(8, '0')}@s.whatsapp.net`;
    const y = r();
    const message = y < 0.01 ? { reactionMessage: { text: 'ok' } }
      : y < 0.04 ? { audioMessage: { ptt: true, seconds: 5 + Math.floor(r() * 90), mimetype: 'audio/ogg; codecs=opus' } }
      : y < 0.05 ? { documentMessage: { mimetype: 'application/pdf', fileName: `proposta-${i}.pdf` } }
      : { conversation: `Mensagem sintetica ${i} sobre orcamento ${Math.floor(r() * 1000)}` };
    saida.push({ key: { id: `H${i.toString(36).toUpperCase()}`, remoteJid, fromMe, ...(participant ? { participant } : {}) }, message, messageTimestamp: ts });
  }
  return saida;
}

export function emLotes<T>(lista: readonly T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < lista.length; i += tamanho) lotes.push(lista.slice(i, i + tamanho));
  return lotes;
}

export function embaralhar<T>(lista: readonly T[], semente = 7): T[] {
  const r = prng(semente); const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}
