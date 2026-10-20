// Tradutor dos eventos do Baileys para o acervo. Funcao pura, sem importar o Baileys (o nucleo nao tem dependencias): recebe objetos no
// formato descrito em docs/baileys/ (proto-reference/Message/interfaces/*) e devolve ACOES. Quem grava e a escuta (escuta.ts).
// Edicao e "apagada para todos" chegam em messages.update (lido em process-message.js da biblioteca instalada, nao so na doc):
//   REVOKE       -> { key: { ...envelope.key, id: <id ORIGINAL> }, update: { message: null, messageStubType: 1 (REVOKE) } }
//   MESSAGE_EDIT -> { key: { ...envelope.key, id: <id ORIGINAL> }, update: { message: { editedMessage: { message: <conteudo novo> } } } }
// O proprio envelope (protocolMessage) tambem passa por messages.upsert e NAO e uma mensagem nova.
import type { EventoMensagem, OrigemEvento, TipoEntrada } from '../ingestao.ts';
import { tipoDoJid } from '../jid.ts';

export interface ChaveBaileys {
  id?: string | null;
  remoteJid?: string | null;
  remoteJidAlt?: string | null;
  participant?: string | null;
  participantAlt?: string | null;
  fromMe?: boolean | null;
}

type Conteudo = Record<string, unknown>;

export interface MensagemBaileys {
  key: ChaveBaileys;
  message?: Conteudo | null;
  messageTimestamp?: unknown;
  pushName?: string | null;
}

export interface AtualizacaoBaileys {
  key: ChaveBaileys;
  update: { message?: Conteudo | null; messageStubType?: number | null; messageTimestamp?: unknown; [campo: string]: unknown };
}

export interface MidiaPendente {
  tipo: 'audio' | 'pdf';
  mimetype?: string;
  nomeArquivo?: string;
  bytes?: number;
  segundos?: number;
}

export type Acao =
  | { tipo: 'registrar'; evento: EventoMensagem; midia?: MidiaPendente }
  | { tipo: 'editar'; remoteJid: string; waMsgId: string; novoTexto: string }
  | { tipo: 'apagar'; remoteJid: string; waMsgId: string }
  | { tipo: 'ignorar'; motivo: string };

const STUB_REVOKE = 1; // WAMessageStubType.REVOKE (conferido na biblioteca instalada)
const EMBRULHOS = ['ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension', 'documentWithCaptionMessage', 'deviceSentMessage'];
const TECNICAS = new Set(['messageContextInfo', 'senderKeyDistributionMessage']);
const SO_IGNORAR: Record<string, string> = { protocolMessage: 'protocolo (apagar/editar chega por messages.update)', reactionMessage: 'reacao', pollUpdateMessage: 'voto de enquete' };

// Data do Baileys (segundos) em milissegundos. Aceita numero, texto, Long {low, high} e objeto com toNumber().
export function paraMilissegundos(valor: unknown): number | null {
  let seg: number;
  if (typeof valor === 'number') seg = valor;
  else if (typeof valor === 'string') seg = valor.trim() === '' ? NaN : Number(valor);
  else if (valor && typeof valor === 'object') {
    const o = valor as { toNumber?: () => number; low?: number; high?: number };
    if (typeof o.toNumber === 'function') seg = o.toNumber();
    else if (typeof o.low === 'number' && typeof o.high === 'number') seg = (o.high >>> 0) * 4_294_967_296 + (o.low >>> 0);
    else return null;
  } else return null;
  return Number.isFinite(seg) && seg > 0 ? Math.round(seg * 1000) : null;
}

function abrir(conteudo: Conteudo | null | undefined): Conteudo | null {
  let atual: Conteudo | null | undefined = conteudo;
  for (let i = 0; i < 6 && atual; i++) {
    const chave = EMBRULHOS.find((k) => atual && typeof atual[k] === 'object' && atual[k] !== null);
    if (!chave) break;
    const dentro = (atual[chave] as { message?: Conteudo | null }).message;
    if (!dentro) return atual;
    atual = dentro;
  }
  return atual ?? null;
}

function textoDe(c: Conteudo): string | undefined {
  if (typeof c.conversation === 'string') return c.conversation;
  const ext = c.extendedTextMessage as { text?: unknown } | undefined;
  return ext && typeof ext.text === 'string' ? ext.text : undefined;
}

function ehPdf(doc: { mimetype?: unknown; fileName?: unknown }): boolean {
  return (typeof doc.mimetype === 'string' && doc.mimetype.toLowerCase() === 'application/pdf') || (typeof doc.fileName === 'string' && /\.pdf$/i.test(doc.fileName));
}

const num = (v: unknown): number | undefined => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v !== '' && Number.isFinite(Number(v))) return Number(v);
  if (v && typeof v === 'object' && typeof (v as { toNumber?: () => number }).toNumber === 'function') return (v as { toNumber: () => number }).toNumber();
  return undefined;
};

export function traduzirMensagem(m: MensagemBaileys, origem: OrigemEvento): Acao[] {
  const id = m.key?.id;
  const jid = m.key?.remoteJid;
  if (!id || !jid) return [{ tipo: 'ignorar', motivo: 'chave incompleta (sem id ou sem conversa)' }];
  const tj = tipoDoJid(jid);
  if (tj !== 'pn' && tj !== 'lid' && tj !== 'grupo') return [{ tipo: 'ignorar', motivo: `conversa fora do escopo (${tj})` }];
  const conteudo = abrir(m.message);
  if (!conteudo) return [{ tipo: 'ignorar', motivo: 'mensagem sem conteudo' }];
  const chaves = Object.keys(conteudo).filter((k) => !TECNICAS.has(k) && conteudo[k] !== undefined && conteudo[k] !== null);
  if (chaves.length === 0) return [{ tipo: 'ignorar', motivo: 'mensagem sem conteudo' }];
  for (const k of chaves) if (SO_IGNORAR[k]) return [{ tipo: 'ignorar', motivo: SO_IGNORAR[k]! }];
  const quandoMs = paraMilissegundos(m.messageTimestamp);
  if (quandoMs === null) return [{ tipo: 'ignorar', motivo: 'mensagem sem data valida' }];

  const fromMe = m.key.fromMe === true;
  const ehGrupo = tj === 'grupo';
  let tipo: TipoEntrada = 'outro';
  let texto: string | undefined;
  let midia: MidiaPendente | undefined;
  const t = textoDe(conteudo);
  if (t !== undefined) {
    tipo = 'texto';
    texto = t;
  } else if (conteudo.audioMessage && typeof conteudo.audioMessage === 'object') {
    const a = conteudo.audioMessage as { mimetype?: unknown; fileLength?: unknown; seconds?: unknown };
    tipo = 'audio';
    midia = { tipo: 'audio', mimetype: typeof a.mimetype === 'string' ? a.mimetype : undefined, nomeArquivo: undefined, bytes: num(a.fileLength), segundos: num(a.seconds) };
  } else if (conteudo.documentMessage && typeof conteudo.documentMessage === 'object') {
    const d = conteudo.documentMessage as { mimetype?: unknown; fileName?: unknown; fileLength?: unknown };
    if (ehPdf(d)) {
      tipo = 'pdf';
      midia = { tipo: 'pdf', mimetype: typeof d.mimetype === 'string' ? d.mimetype : undefined, nomeArquivo: typeof d.fileName === 'string' ? d.fileName : undefined, bytes: num(d.fileLength) };
    }
  }
  const evento: EventoMensagem = {
    waMsgId: id,
    remoteJid: jid,
    remoteJidAlt: (ehGrupo ? m.key.participantAlt : m.key.remoteJidAlt) ?? undefined,
    participante: m.key.participant ?? undefined,
    fromMe,
    quandoMs,
    tipo,
    texto,
    origem,
    nomeContato: !fromMe && m.pushName ? m.pushName : undefined
  };
  return [{ tipo: 'registrar', evento, ...(midia ? { midia } : {}) }];
}

export function traduzirAtualizacao(u: AtualizacaoBaileys): Acao[] {
  const up = u.update ?? {};
  const revogada = up.message === null && up.messageStubType === STUB_REVOKE;
  const editada = up.message && typeof up.message === 'object' && (up.message as { editedMessage?: unknown }).editedMessage;
  if (!revogada && !editada) return []; // recibo de entrega/leitura, reacao, enquete: nada a fazer
  const id = u.key?.id;
  const jid = u.key?.remoteJid;
  if (!id || !jid) return [{ tipo: 'ignorar', motivo: 'atualizacao com chave incompleta' }];
  if (revogada) return [{ tipo: 'apagar', remoteJid: jid, waMsgId: id }];
  const novo = abrir(((up.message as { editedMessage: { message?: Conteudo | null } }).editedMessage).message);
  const texto = novo ? textoDe(novo) : undefined;
  if (texto === undefined) return [{ tipo: 'ignorar', motivo: 'edicao de algo que nao e texto' }];
  return [{ tipo: 'editar', remoteJid: jid, waMsgId: id, novoTexto: texto }];
}
