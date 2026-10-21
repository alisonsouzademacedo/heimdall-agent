// Processo do listener: abre o acervo, liga o Baileys ao acervo e mantem a conexao. Uso: node apps/listener/src/iniciar.ts
// O QR, o estado e o andamento do historico vao para a tabela "configuracao" (a tela, em outro processo, le de la).
// O UNICO envio possivel e o Envio abaixo (criarEnvio: so o self-chat do dono) e so existe enquanto a conexao esta aberta.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, migrar, type Banco } from '../../core/src/db.ts';
import { criarEnvio, type Envio } from '../../core/src/envio.ts';
import { gravarEstado, gravarQr, gravarHistorico, gravarContagem } from '../../core/src/whatsapp/estado.ts';
import { ligarEventos, type SocketMinimo } from './ligar.ts';
import { criarTransporte, type SocketEnvio } from './transporte.ts';
import { supervisionar } from './supervisor.ts';
import { iniciarBaixador } from './ciclo.ts';
import { iniciarEntregador } from './entrega.ts';
import { qrParaSvg } from './qr.ts';
import { protegerConsole } from './console-seguro.ts';
import { criarGravadorMidia } from './arquivos.ts';
import type { PortasBaixar } from '../../core/src/midia.ts';
import type { MensagemBaileys } from '../../core/src/whatsapp/traduzir.ts';

export interface ConexaoAberta {
  sock: SocketMinimo & SocketEnvio & { end(erro?: Error): void; updateMediaMessage(msg: unknown): Promise<unknown> };
  salvarCreds: () => Promise<void>;
}

export interface OpcoesListener {
  pastaDados: string;
  abrir?: (pastaAuth: string, getMessage: (key: { id?: string | null; remoteJid?: string | null }) => Promise<unknown>) => Promise<ConexaoAberta>;
  serializar?: (m: MensagemBaileys) => string;
  esperar?: (ms: number) => Promise<void>;
  /** Como baixar uma midia a partir do descritor (padrao: a funcao do Baileys, baixar.ts). */
  baixador?: (c: ConexaoAberta) => (descritor: string) => Promise<Uint8Array>;
  intervaloBaixarMs?: number;
  intervaloEntregaMs?: number;
  /** Espera propria do laco de download (nao reutiliza a do supervisor). */
  esperarBaixar?: (ms: number) => Promise<void>;
}

export function abrirAcervo(pastaDados: string): Banco {
  mkdirSync(pastaDados, { recursive: true });
  const banco = abrirBanco(join(pastaDados, 'acervo.sqlite'));
  // Dois processos (listener e tela) usam o mesmo arquivo: WAL e espera por trava, em disco NATIVO (nunca pasta compartilhada com a VM do Docker).
  banco.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  migrar(banco);
  return banco;
}

export async function iniciarListener(o: OpcoesListener): Promise<{ envio(): Envio | null; parar(): Promise<void>; banco: Banco }> {
  const banco = abrirAcervo(o.pastaDados);
  const abrir = o.abrir ?? (await import('./conectar.ts')).abrirConexao as NonNullable<OpcoesListener['abrir']>;
  const serializar = o.serializar ?? (o.abrir ? undefined : (await import('./conectar.ts')).serializarMensagem);
  let envio: Envio | null = null;
  let conexaoAberta: ConexaoAberta | null = null; // so existe enquanto o estado e "conectado": e quando o laco de midia pode trabalhar
  // Mensagens que NOS enviamos (so ao dono): guardadas para o reenvio pedido pelo WhatsApp (getMessage).
  const enviadas = new Map<string, unknown>();
  let ultimoIdEnviado: string | null = null;
  let ultimoQr: string | null = null;
  let conexaoPendente: ConexaoAberta | null = null; // a conexao que ainda espera o QR ser lido
  const getMessage = async (key: { id?: string | null }) => (key.id ? (enviadas.get(key.id) as { message?: unknown } | undefined)?.message : undefined);

  const supervisor = supervisionar({
    esperar: o.esperar,
    aoEstado: () => {},
    criar: async (aoEstadoSup) => {
      const c = await abrir(join(o.pastaDados, 'auth_info'), getMessage as never);
      conexaoPendente = c;
      const ligacao = ligarEventos({
        sock: c.sock,
        banco,
        salvarCreds: c.salvarCreds,
        serializar,
        aoQr: (qr) => {
          gravarQr(banco, qr);
          ultimoQr = qr;
          // O desenho chega depois do texto; so vale se este ainda e o QR atual e se ainda nao conectou (conectar apaga o QR).
          void qrParaSvg(qr).then((svg) => { if (ultimoQr === qr && c === conexaoPendente) gravarQr(banco, qr, Date.now(), svg); }).catch(() => {});
        },
        aoHistorico: (h) => gravarHistorico(banco, h),
        aoGravar: () => { const e = ligacao.escuta(); if (e) gravarContagem(banco, e.totais()); },
        aoEstado: (e) => {
          gravarEstado(banco, e);
          if (e.estado === 'conectado') {
            conexaoAberta = c;
            ultimoQr = null;
            conexaoPendente = null;
            envio = criarEnvio(e.dono, criarTransporte(c.sock, e.dono, {
              aoEnviar: (r) => {
                const id = (r as { key?: { id?: string } } | undefined)?.key?.id;
                ultimoIdEnviado = id ?? null;
                if (id) { enviadas.set(id, r); if (enviadas.size > 200) enviadas.delete(enviadas.keys().next().value!); }
              }
            }));
          } else if (e.estado !== 'aviso') { envio = null; conexaoAberta = null; }
          aoEstadoSup(e);
        }
      });
      return { encerrar: () => { try { c.sock.end(undefined); } catch { /* ja fechado */ } } };
    }
  });
  const gravarMidia = criarGravadorMidia(o.pastaDados);
  const criarBaixadorPadrao = async (c: ConexaoAberta) => {
    const { criarBaixador } = await import('./baixar.ts');
    return criarBaixador({ reuploadRequest: (m) => c.sock.updateMediaMessage(m as never) as never });
  };
  const baixadores = new WeakMap<ConexaoAberta, (d: string) => Promise<Uint8Array>>();
  const baixador = iniciarBaixador({
    banco,
    intervaloMs: o.intervaloBaixarMs,
    esperar: o.esperarBaixar,
    portas: (): PortasBaixar | null => {
      const c = conexaoAberta;
      if (!c) return null;
      let b = baixadores.get(c);
      if (!b) {
        b = o.baixador ? o.baixador(c) : (d) => criarBaixadorPadrao(c).then((f) => f(d));
        baixadores.set(c, b);
      }
      return { baixar: b, gravarMidia };
    }
  });
  const entregador = iniciarEntregador({ banco, envio: () => envio, ultimoId: () => ultimoIdEnviado, intervaloMs: o.intervaloEntregaMs });
  await supervisor.iniciar();
  return {
    envio: () => envio,
    parar: async () => { baixador.parar(); entregador.parar(); supervisor.parar(); envio = null; conexaoAberta = null; await Promise.all([baixador.terminou, entregador.terminou]); banco.close(); },
    banco
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  protegerConsole(); // a libsignal despeja a sessao de criptografia no console; nunca em log (LICOES.md, 2026-10-21)
  const l = await iniciarListener({ pastaDados: join(process.cwd(), 'data') });
  console.log('Heimdall: escuta do WhatsApp ligada (so le e grava). O QR aparece na tela de configuracao.');
  const sair = () => { void l.parar().then(() => process.exit(0)); };
  process.on('SIGINT', sair);
  process.on('SIGTERM', sair);
}
