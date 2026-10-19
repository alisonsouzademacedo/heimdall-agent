// Identificadores do WhatsApp (JIDs). Comportamento descrito em docs/baileys/concepts/jids.md.
// Em producao o Baileys oferece jidDecode/jidNormalizedUser; este modulo reproduz so o que a documentacao
// descreve, para o nucleo e os testes nao dependerem da biblioteca. NAO VERIFICADO contra a biblioteca real:
// no spike (E1) um teste confere este modulo com as funcoes do Baileys instalado.

export type TipoJid = 'pn' | 'lid' | 'grupo' | 'transmissao' | 'status' | 'canal' | 'outro';

export interface JidDecodificado {
  usuario: string;
  servidor: string;
  dispositivo: number | null;
}

const SERVIDORES_PN = new Set(['s.whatsapp.net']);

export function decodificarJid(jid: string): JidDecodificado | null {
  if (typeof jid !== 'string') return null;
  const arroba = jid.lastIndexOf('@');
  if (arroba <= 0 || arroba === jid.length - 1) return null;
  const servidor = jid.slice(arroba + 1).toLowerCase();
  const local = jid.slice(0, arroba);
  const doisPontos = local.indexOf(':');
  const usuario = doisPontos === -1 ? local : local.slice(0, doisPontos);
  const dispositivo = doisPontos === -1 ? null : Number(local.slice(doisPontos + 1));
  if (!usuario || (dispositivo !== null && !Number.isInteger(dispositivo))) return null;
  return { usuario, servidor, dispositivo };
}

export function tipoDoJid(jid: string): TipoJid {
  const d = decodificarJid(jid);
  if (!d) return 'outro';
  if (SERVIDORES_PN.has(d.servidor)) return 'pn';
  if (d.servidor === 'lid') return 'lid';
  if (d.servidor === 'g.us') return 'grupo';
  if (d.servidor === 'broadcast') return d.usuario === 'status' ? 'status' : 'transmissao';
  if (d.servidor === 'newsletter') return 'canal';
  return 'outro';
}

// Remove o sufixo de dispositivo e coloca em minusculas ("usuario:2@servidor" vira "usuario@servidor").
export function normalizarJid(jid: string): string | null {
  const d = decodificarJid(jid);
  return d ? `${d.usuario}@${d.servidor}` : null;
}

// Mesmo usuario, ignorando dispositivo. Nao cruza PN e LID (a documentacao avisa: resolver os dois para a mesma forma antes).
export function mesmoUsuario(a: string, b: string): boolean {
  const na = normalizarJid(a);
  const nb = normalizarJid(b);
  return na !== null && nb !== null && na === nb;
}

export function ehUsuario(jid: string): boolean {
  const t = tipoDoJid(jid);
  return t === 'pn' || t === 'lid';
}
