// UNICO caminho de envio do Heimdall (AGENTS.md, regra 1): so existe o self-chat do dono.
// Projeto da trava: as funcoes devolvidas NAO recebem destino. O destino e fixado aqui, na criacao,
// a partir da identidade do dono, e o transporte (o Baileys, no futuro) nao e exposto a mais ninguem.
import { normalizarJid, tipoDoJid, mesmoUsuario } from './jid.ts';

export class EnvioNaoPermitido extends Error {
  constructor(motivo: string) {
    super(`Envio nao permitido: ${motivo}`);
    this.name = 'EnvioNaoPermitido';
  }
}

export interface IdentidadeDono {
  pn: string; // ex.: creds.me.id do Baileys ("5555...:12@s.whatsapp.net")
  lid?: string; // ex.: creds.me.lid ("1234...@lid")
}

export type Conteudo =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'documento'; nomeArquivo: string; mimetype: string; bytes: Uint8Array };

export interface Transporte {
  enviar(destino: string, conteudo: Conteudo): Promise<void>;
}

export interface LimitesEnvio {
  maxTexto: number; // salvaguarda nossa, nao limite do WhatsApp
  maxDocumentoBytes: number; // idem
}

export const LIMITES_PADRAO: LimitesEnvio = { maxTexto: 60_000, maxDocumentoBytes: 5_000_000 };

export interface Envio {
  texto(texto: string): Promise<void>;
  documento(nomeArquivo: string, bytes: Uint8Array): Promise<void>;
}

function validarIdentidade(id: IdentidadeDono): { pn: string; lid: string | null } {
  const pn = normalizarJid(id?.pn ?? '');
  if (!pn || tipoDoJid(pn) !== 'pn') throw new EnvioNaoPermitido('identidade do dono sem numero de telefone valido');
  let lid: string | null = null;
  if (id.lid !== undefined) {
    lid = normalizarJid(id.lid);
    if (!lid || tipoDoJid(lid) !== 'lid') throw new EnvioNaoPermitido('LID do dono invalido');
  }
  return { pn, lid };
}

export function criarEnvio(
  identidade: IdentidadeDono,
  transporte: Transporte,
  opcoes: { preferir?: 'pn' | 'lid'; limites?: LimitesEnvio } = {}
): Envio {
  const { pn, lid } = validarIdentidade(identidade);
  const limites = opcoes.limites ?? LIMITES_PADRAO;
  const destino = opcoes.preferir === 'lid' ? (lid ?? (() => { throw new EnvioNaoPermitido('LID pedido mas nao informado'); })()) : pn;
  const enviar = Object.freeze({
    async texto(texto: string): Promise<void> {
      if (typeof texto !== 'string' || texto.trim() === '') throw new EnvioNaoPermitido('texto vazio');
      if (texto.length > limites.maxTexto) throw new EnvioNaoPermitido('texto grande demais');
      await transporte.enviar(destino, { tipo: 'texto', texto });
    },
    async documento(nomeArquivo: string, bytes: Uint8Array): Promise<void> {
      if (!/^[A-Za-z0-9._-]+\.md$/.test(nomeArquivo)) throw new EnvioNaoPermitido('so se enviam relatorios .md com nome simples');
      if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) throw new EnvioNaoPermitido('documento vazio');
      if (bytes.byteLength > limites.maxDocumentoBytes) throw new EnvioNaoPermitido('documento grande demais');
      await transporte.enviar(destino, { tipo: 'documento', nomeArquivo, mimetype: 'text/markdown', bytes });
    }
  });
  return enviar;
}

// Uma mensagem recebida e do self-chat quando a conversa e a do proprio dono E foi o proprio dono quem escreveu.
// So o self-chat pode dar comandos (inclusive "confirmo apagar ..."): nada vindo de cliente chega aqui como comando.
export function ehMensagemDoSelfChat(msg: { remoteJid: string; fromMe: boolean }, identidade: IdentidadeDono): boolean {
  if (!msg.fromMe) return false;
  const tipo = tipoDoJid(msg.remoteJid);
  if (tipo !== 'pn' && tipo !== 'lid') return false;
  return mesmoUsuario(msg.remoteJid, identidade.pn) || (identidade.lid !== undefined && mesmoUsuario(msg.remoteJid, identidade.lid));
}
