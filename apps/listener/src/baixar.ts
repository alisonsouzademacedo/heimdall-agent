// Baixa e decifra uma midia a partir do descritor guardado no acervo (JSON do Baileys com BufferJSON).
// Dois achados ao ler/rodar a biblioteca instalada (7.0.0-rc14), por isso este arquivo faz mais que chamar downloadMediaMessage:
//  1) o reenvio automatico da biblioteca (404/410 -> pedir ao aparelho) confere error.status, mas o erro de download vem com statusCode (Boom): nunca dispara;
//     aqui pedimos o reenvio UMA vez e tentamos de novo (docs/baileys/messaging/media-messages.md descreve o reenvio como automatico).
//  2) o download decifra com AES-CBC e nao confere o MAC: conferimos o fileSha256 do descritor (hash do arquivo original).
import { createHash } from 'node:crypto';
import { downloadMediaMessage, extractMessageContent, getContentType, BufferJSON, type WAMessage } from '@whiskeysockets/baileys';
import pino from 'pino';

const logger = pino({ level: 'silent' });
const EXPIRADA = [404, 410];

export interface OpcoesBaixador {
  /** No Baileys: sock.updateMediaMessage */
  reuploadRequest: (msg: WAMessage) => Promise<WAMessage>;
}

function statusDe(e: unknown): number | undefined {
  const x = e as { output?: { statusCode?: unknown }; status?: unknown; statusCode?: unknown } | undefined;
  for (const v of [x?.output?.statusCode, x?.statusCode, x?.status]) if (typeof v === 'number') return v;
  return undefined;
}

function hashEsperado(msg: WAMessage): Uint8Array | undefined {
  const conteudo = extractMessageContent(msg.message);
  const tipo = conteudo ? getContentType(conteudo) : undefined;
  const midia = (tipo && conteudo ? (conteudo as Record<string, unknown>)[tipo] : undefined) as { fileSha256?: unknown } | undefined;
  const h = midia?.fileSha256;
  return h instanceof Uint8Array ? h : undefined;
}

export function criarBaixador(o: OpcoesBaixador): (descritor: string) => Promise<Uint8Array> {
  return async (descritor) => {
    let msg: WAMessage;
    try { msg = JSON.parse(descritor, BufferJSON.reviver) as WAMessage; } catch { throw new Error('descritor_invalido'); }
    if (!msg || typeof msg !== 'object' || !msg.message) throw new Error('descritor_sem_midia');
    // Sem "ctx": o reenvio e feito aqui, para nao depender do comportamento (e dos bugs) da biblioteca.
    const baixar = async (m: WAMessage) => new Uint8Array(await downloadMediaMessage(m, 'buffer', {}));
    let bytes: Uint8Array;
    try {
      bytes = await baixar(msg);
    } catch (e) {
      const s = statusDe(e);
      if (s === undefined || !EXPIRADA.includes(s)) throw e;
      msg = await o.reuploadRequest(msg);
      bytes = await baixar(msg);
    }
    const esperado = hashEsperado(msg);
    if (esperado && !Buffer.from(esperado).equals(createHash('sha256').update(bytes).digest())) throw new Error('hash_nao_confere');
    return bytes;
  };
}
