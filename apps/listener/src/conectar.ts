// Unico arquivo que abre o socket do Baileys (makeWASocket). Configuracao baseada em docs/baileys/concepts/socket-config.md e advanced/history-sync.md.
// O socket real nao e testado aqui (precisa de um WhatsApp de verdade): ver docs/plano/runbooks/08-testes-de-fumaca.md.
import makeWASocket, { Browsers, makeCacheableSignalKeyStore, useMultiFileAuthState, isJidBroadcast, isJidNewsletter, BufferJSON, type AuthenticationState, type WAMessageKey, type proto } from '@whiskeysockets/baileys';
import pino from 'pino';
import type { SocketMinimo } from './ligar.ts';
import type { SocketEnvio } from './transporte.ts';

export { BufferJSON };

export interface OpcoesConfig {
  auth: AuthenticationState;
  getMessage: (key: WAMessageKey) => Promise<proto.IMessage | undefined>;
}

// Silencioso de proposito: o registro do Baileys em nivel baixo imprime conteudo de conversa (regra 2).
const logger = pino({ level: 'silent' });

export function montarConfig(o: OpcoesConfig) {
  return {
    logger,
    auth: { creds: o.auth.creds, keys: makeCacheableSignalKeyStore(o.auth.keys, logger) },
    // Documentado: so a identidade de desktop recebe o historico estendido. NAO verificado: se o nome ("Desktop") muda algo alem disso.
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true,
    // Documentado: online ao conectar faz o celular parar de notificar.
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    shouldIgnoreJid: (jid: string) => Boolean(isJidBroadcast(jid) || isJidNewsletter(jid)),
    // Necessario para o reenvio quando o destinatario (o proprio dono) nao consegue decifrar o que enviamos.
    getMessage: o.getMessage
  };
}

export interface Conexao {
  sock: SocketMinimo & SocketEnvio & { end(erro?: Error): void };
  salvarCreds: () => Promise<void>;
}

export async function abrirConexao(pastaAuth: string, getMessage: OpcoesConfig['getMessage']): Promise<Conexao> {
  // useMultiFileAuthState: a documentacao avisa que NAO e para producao pesada; para um unico dono e uma sessao e o suficiente
  // (risco registrado em docs/plano/fase-1-whatsapp-baileys-hermes.md; trocar por banco se aparecer erro de autenticacao).
  const { state, saveCreds } = await useMultiFileAuthState(pastaAuth);
  const sock = makeWASocket(montarConfig({ auth: state, getMessage }));
  // O socket real tem tipos mais largos que SocketMinimo (que so declara o que usamos): a conversao e deliberada.
  return { sock: sock as unknown as Conexao['sock'], salvarCreds: saveCreds };
}

// Descritor da midia guardado no acervo: as chaves de criptografia sao Buffers e so sobrevivem ao JSON com BufferJSON (docs/baileys/migration/v7.md).
export function serializarMensagem(m: { key: unknown; message?: unknown }): string {
  return JSON.stringify({ key: m.key, message: m.message }, BufferJSON.replacer);
}
