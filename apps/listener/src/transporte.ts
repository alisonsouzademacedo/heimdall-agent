// O UNICO lugar do listener que envia algo ao WhatsApp. So alcanca o proprio dono (regra 1): alem da trava do nucleo (envio.ts, que fixa o
// destino), este transporte RECUSA qualquer destino que nao seja o PN ou o LID do dono (defesa em profundidade).
import { EnvioNaoPermitido, type IdentidadeDono, type Transporte, type Conteudo } from '../../core/src/envio.ts';
import { normalizarJid } from '../../core/src/jid.ts';

export interface SocketEnvio {
  sendMessage(jid: string, conteudo: unknown): Promise<unknown>;
}

export function criarTransporte(sock: SocketEnvio, dono: IdentidadeDono, opcoes: { aoEnviar?: (resultado: unknown) => void } = {}): Transporte {
  const permitidos = new Set([normalizarJid(dono.pn), dono.lid ? normalizarJid(dono.lid) : null].filter((j): j is string => j !== null));
  if (permitidos.size === 0) throw new EnvioNaoPermitido('identidade do dono invalida para o transporte');
  return Object.freeze({
    async enviar(destino: string, conteudo: Conteudo): Promise<void> {
      const alvo = normalizarJid(destino);
      if (!alvo || !permitidos.has(alvo)) throw new EnvioNaoPermitido('o transporte so envia ao proprio dono');
      const resultado = conteudo.tipo === 'texto'
        ? await sock.sendMessage(alvo, { text: conteudo.texto })
        : await sock.sendMessage(alvo, { document: Buffer.from(conteudo.bytes), fileName: conteudo.nomeArquivo, mimetype: conteudo.mimetype });
      opcoes.aoEnviar?.(resultado);
    }
  });
}
