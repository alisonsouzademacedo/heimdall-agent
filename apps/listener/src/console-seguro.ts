// A libsignal (por dentro do Baileys) escreve a sessao de criptografia INTEIRA em console.info/warn (ex.: "Closing session: SessionEntry {...}"),
// com chaves de cadeia e de raiz. O logger silencioso do Baileys (conectar.ts) nao alcanca o console. Regra 2 do AGENTS.md: chave nunca vai para log.
// LICOES.md, 2026-10-21. Este arquivo so filtra o console do proprio processo do listener; nao envia nada a ninguem.
import { inspect } from 'node:util';

const CAMPOS_DE_CHAVE = /privKey|pubKey|rootKey|chainKey|ephemeralKeyPair|remoteIdentityKey|lastRemoteEphemeralKey|_chains|currentRatchet|indexInfo|baseKeyType/;
const OMITIDO = '[dados de sessao de criptografia omitidos]';
const METODOS = ['log', 'info', 'warn', 'error', 'debug'] as const;
const MARCA = Symbol.for('heimdall.console.seguro');

function seguro(arg: unknown): unknown {
  if (typeof arg === 'string') return CAMPOS_DE_CHAVE.test(arg) ? OMITIDO : arg;
  if (arg !== null && typeof arg === 'object') {
    let texto = '';
    try { texto = inspect(arg, { depth: 8, breakLength: Infinity }); } catch { return OMITIDO; }
    return CAMPOS_DE_CHAVE.test(texto) ? OMITIDO : arg;
  }
  return arg;
}

/** Embrulha os metodos do console: o que parecer sessao de criptografia vira uma frase curta. Vale uma vez so por console. */
export function protegerConsole(c: Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'> = console): void {
  const alvo = c as unknown as Record<symbol, boolean>;
  if (alvo[MARCA]) return;
  alvo[MARCA] = true;
  for (const m of METODOS) {
    const original = c[m].bind(c) as (...a: unknown[]) => void;
    (c as unknown as Record<string, unknown>)[m] = (...args: unknown[]) => original(...args.map(seguro));
  }
}
