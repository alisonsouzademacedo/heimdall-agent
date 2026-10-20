// Identidade do dono a partir do que o Baileys informa (sock.user / creds.me, tipo Contact: docs/baileys/migration/v7.md).
// Sem numero de telefone valido nao ha identidade: o envio ao self-chat (envio.ts) exige o PN e recusa o resto.
import { normalizarJid, tipoDoJid } from '../jid.ts';
import type { IdentidadeDono } from '../envio.ts';

export interface ContatoBaileys {
  id?: string;
  lid?: string;
  phoneNumber?: string;
}

export function identidadeDoDono(user: ContatoBaileys | undefined | null): IdentidadeDono | null {
  if (!user) return null;
  const candidatos = [user.phoneNumber, user.id].map((j) => (j ? normalizarJid(j) : null));
  const pn = candidatos.find((j) => j !== null && tipoDoJid(j) === 'pn');
  if (!pn) return null;
  const lidBruto = [user.lid, user.id].map((j) => (j ? normalizarJid(j) : null)).find((j) => j !== null && tipoDoJid(j) === 'lid');
  return lidBruto ? { pn, lid: lidBruto } : { pn };
}
