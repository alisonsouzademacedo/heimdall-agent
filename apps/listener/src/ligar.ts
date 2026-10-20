// Liga os eventos do Baileys ao acervo. NAO importa o Baileys: recebe qualquer objeto com "ev.process" (o socket real ou um falso nos testes).
// So le e grava; nenhum envio. Formatos dos eventos: docs/baileys/concepts/events.md e Types/Events.d.ts da biblioteca instalada.
import type { Banco } from '../../core/src/db.ts';
import type { IdentidadeDono } from '../../core/src/envio.ts';
import { criarEscuta, type Escuta, type Resumo } from '../../core/src/whatsapp/escuta.ts';
import { identidadeDoDono, type ContatoBaileys } from '../../core/src/whatsapp/identidade.ts';
import type { MensagemBaileys, AtualizacaoBaileys } from '../../core/src/whatsapp/traduzir.ts';

type Nome = { id?: string | null; name?: string | null; notify?: string | null };

export interface EventosMinimos {
  'connection.update': { connection?: 'open' | 'connecting' | 'close'; lastDisconnect?: { error?: unknown }; qr?: string };
  'creds.update': unknown;
  'messages.upsert': { messages: MensagemBaileys[]; type: string };
  'messages.update': AtualizacaoBaileys[];
  'messages.delete': unknown;
  'messaging-history.set': { messages: MensagemBaileys[]; chats?: Nome[]; contacts?: Nome[]; lidPnMappings?: { pn?: string; lid?: string }[]; progress?: number | null; isLatest?: boolean };
  'lid-mapping.update': { pn?: string; lid?: string };
  'contacts.upsert': Nome[];
  'contacts.update': Nome[];
  'chats.upsert': Nome[];
}

export interface SocketMinimo {
  user?: ContatoBaileys;
  ev: { process(handler: (eventos: Partial<EventosMinimos>) => void | Promise<void>): void };
}

export type Estado =
  | { estado: 'conectado'; dono: IdentidadeDono }
  | { estado: 'deslogado' }
  | { estado: 'reconectar'; codigo: number | undefined }
  | { estado: 'erro'; motivo: string }
  | { estado: 'aviso'; motivo: string };

export interface OpcoesLigar {
  sock: SocketMinimo;
  banco: Banco;
  salvarCreds: () => Promise<void>;
  aoEstado: (e: Estado) => void;
  aoQr: (qr: string) => void;
  aoHistorico: (h: { progresso: number | null; ultima: boolean }) => void;
  /** Como guardar o descritor da midia (no Baileys: JSON.stringify com BufferJSON.replacer, senao as chaves viram lixo). */
  serializar?: (m: MensagemBaileys) => string;
  /** Avisado depois de cada lote gravado (para a tela mostrar o andamento). */
  aoGravar?: (r: Resumo) => void;
}

const CODIGO_DESLOGADO = 401; // DisconnectReason.loggedOut (conferido na biblioteca instalada)

function codigoDe(erro: unknown): number | undefined {
  const c = (erro as { output?: { statusCode?: unknown } } | undefined)?.output?.statusCode;
  return typeof c === 'number' ? c : undefined;
}

export function ligarEventos(o: OpcoesLigar): { escuta(): Escuta | null } {
  let escuta: Escuta | null = null;
  let identidade: IdentidadeDono | null = null;
  const espera: ((e: Escuta) => void)[] = [];

  function obterEscuta(): Escuta | null {
    if (escuta) return escuta;
    identidade = identidadeDoDono(o.sock.user);
    if (!identidade) return null;
    escuta = criarEscuta(o.banco, identidade);
    for (const f of espera.splice(0)) executar(f, escuta);
    return escuta;
  }

  function executar(f: (e: Escuta) => void, e: Escuta): void {
    try { f(e); } catch (erro) { o.aoEstado({ estado: 'aviso', motivo: `falha ao gravar: ${erro instanceof Error ? erro.message : String(erro)}`.slice(0, 200) }); }
  }
  // Se a identidade ainda nao existe, o trabalho espera (limite de 200 lotes na memoria; alem disso o Baileys reenviara o historico).
  function quandoPronta(f: (e: Escuta) => void): void {
    const e = obterEscuta();
    if (e) executar(f, e);
    else if (espera.length < 200) espera.push(f);
  }
  function avisarFalhas(r: Resumo): void {
    if (r.falhas > 0) o.aoEstado({ estado: 'aviso', motivo: `${r.falhas} mensagem(ns) nao puderam ser gravadas` });
    o.aoGravar?.(r);
  }

  o.sock.ev.process(async (ev) => {
    const cx = ev['connection.update'];
    if (cx) {
      if (cx.qr) o.aoQr(cx.qr);
      if (cx.connection === 'open') {
        const e = obterEscuta();
        if (e) o.aoEstado({ estado: 'conectado', dono: identidade! });
        else o.aoEstado({ estado: 'erro', motivo: 'o WhatsApp nao informou o numero de telefone do dono (sem ele o envio ao self-chat nao pode existir)' });
      } else if (cx.connection === 'close') {
        const codigo = codigoDe(cx.lastDisconnect?.error);
        o.aoEstado(codigo === CODIGO_DESLOGADO ? { estado: 'deslogado' } : { estado: 'reconectar', codigo });
      }
    }
    if (ev['creds.update'] !== undefined) await o.salvarCreds();

    const mapa = ev['lid-mapping.update'];
    if (mapa) quandoPronta((e) => e.mapeamentos([mapa]));
    const hist = ev['messaging-history.set'];
    if (hist) {
      quandoPronta((e) => {
        if (hist.lidPnMappings) e.mapeamentos(hist.lidPnMappings);
        avisarFalhas(e.mensagens(hist.messages ?? [], 'historico', o.serializar));
        if (hist.contacts) e.contatos(hist.contacts);
        if (hist.chats) e.conversas(hist.chats);
      });
      o.aoHistorico({ progresso: hist.progress ?? null, ultima: hist.isLatest === true });
    }
    const up = ev['messages.upsert'];
    if (up) quandoPronta((e) => avisarFalhas(e.mensagens(up.messages, up.type === 'notify' ? 'notify' : 'append', o.serializar)));
    const upd = ev['messages.update'];
    if (upd) quandoPronta((e) => avisarFalhas(e.atualizacoes(upd)));
    // "messages.delete" (apagar so para mim, limpar conversa) e IGNORADO de proposito: o acervo nunca remove (D16).
    for (const c of [ev['contacts.upsert'], ev['contacts.update']]) if (c) quandoPronta((e) => e.contatos(c));
    const ch = ev['chats.upsert'];
    if (ch) quandoPronta((e) => e.conversas(ch));
  });
  return { escuta: () => escuta };
}
