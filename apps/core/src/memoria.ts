// Envio da conversa ao Hindsight, SEM rede aqui: o nucleo monta o documento, decide o que mudou e chama uma PORTA (a rede fica no processo
// apps/memoria). Politica (docs/plano/fase-1-modelo-de-dados.md): um documento por conversa por DIA FECHADO, "Nome (hora): fala", com o mesmo
// document_id a cada reenvio (o Hindsight troca a versao antiga). O dia de hoje nao e enviado; o MCP consulta o acervo direto.
import { createHash } from 'node:crypto';
import type { Banco } from './db.ts';
import { diaLocal, FUSO_PADRAO, type Dia } from './calendario.ts';
import { concluir, falhar, reenfileirar, type Trabalho } from './fila.ts';
import { FalhaDefinitiva, type Resultado } from './midia.ts';

export interface ItemRetain {
  documentId: string;
  content: string;
  context: string;
  /** Fim do dia da conversa, com o deslocamento do fuso (ancora para "segunda passada"). */
  timestamp: string;
  tags: string[];
}
export interface PortaMemoria {
  reter(item: ItemRetain): Promise<void>;
}

export interface PortaApagarMemoria {
  /** Apaga o documento (e as memorias dele) no Hindsight. 'nao_existia' tambem conta como feito. */
  apagarDocumento(documentId: string): Promise<'apagado' | 'nao_existia'>;
}
export const MAX_TENTATIVAS_APAGAR = 5;

const ID = /^conv:(\d+):(\d{4}-\d{2}-\d{2})$/;
const CONTEXTO = 'conversa de WhatsApp comercial de um SDR';

// "2025-10-10T12:01:00-03:00": hora local do fuso e deslocamento, sem depender do fuso do computador.
function isoLocal(ms: number, fuso: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: fuso, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).map((x) => [x.type, x.value])
  ) as Record<string, string>;
  const comoUtc = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!, +p.second!);
  const desvio = Math.round((comoUtc - Math.floor(ms / 1000) * 1000) / 60000);
  const sinal = desvio < 0 ? '-' : '+';
  const a = Math.abs(desvio);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${sinal}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
}

interface Linha { enviada_em: number; de_mim: number; tipo: string; texto: string | null; estado: string; remetente: string | null; contato: string | null }

function linhasDoDia(db: Banco, conversaId: number, dia: Dia, fuso: string): Linha[] {
  // Margem de 36 h em volta do dia: o filtro exato (dia no fuso) e feito em JavaScript.
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  const centro = Date.UTC(a, m - 1, d, 12);
  const todas = db
    .prepare(
      `SELECT m.enviada_em, m.de_mim, m.tipo, m.texto, m.estado, r.nome AS remetente,
              (SELECT ct.nome FROM contato_jids j JOIN contatos ct ON ct.id = j.contato_id WHERE j.jid = c.jid LIMIT 1) AS contato
       FROM mensagens m JOIN conversas c ON c.id = m.conversa_id LEFT JOIN contatos r ON r.id = m.remetente_contato_id
       WHERE m.conversa_id = ? AND m.tipo <> 'ignorada' AND m.enviada_em BETWEEN ? AND ?
       ORDER BY m.enviada_em, m.id`
    )
    .all(conversaId, centro - 36 * 3_600_000, centro + 36 * 3_600_000) as unknown as Linha[];
  return todas.filter((l) => diaLocal(l.enviada_em, fuso) === dia);
}

export function montarItem(db: Banco, documentId: string, fuso: string = FUSO_PADRAO): ItemRetain | null {
  const id = ID.exec(documentId);
  if (!id) return null;
  const conversaId = Number(id[1]);
  const dia = id[2]!;
  const conv = db.prepare('SELECT tipo FROM conversas WHERE id = ?').get(conversaId) as { tipo: string } | undefined;
  if (!conv || conv.tipo === 'self') return null; // o self-chat e o canal com o dono, nao conversa de negocio
  const linhas: string[] = [];
  let ultima = 0;
  for (const l of linhasDoDia(db, conversaId, dia, fuso)) {
    if (l.texto === null || l.texto.trim() === '') continue; // audio/PDF ainda sem texto: entra quando o texto chegar (o hash muda e reenvia)
    const quem = l.de_mim === 1 ? 'Eu' : (conv.tipo === 'grupo' ? l.remetente : (l.contato ?? l.remetente)) ?? (conv.tipo === 'grupo' ? 'Participante' : 'Contato');
    const marca = l.estado === 'editada' ? '[editada] ' : l.estado === 'apagada' ? '[apagada pelo autor] ' : '';
    const corpo = l.tipo === 'audio' ? `[áudio transcrito] ${l.texto}` : l.tipo === 'pdf' ? `[PDF] ${l.texto}` : l.texto;
    linhas.push(`${quem} (${isoLocal(l.enviada_em, fuso)}): ${marca}${corpo}`);
    ultima = l.enviada_em;
  }
  if (linhas.length === 0 || ultima === 0) return null;
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  return {
    documentId,
    content: linhas.join('\n'),
    context: CONTEXTO,
    timestamp: `${dia}T23:59:59${isoLocal(Date.UTC(a, m - 1, d, 15), fuso).slice(19)}`,
    tags: [`conversa:${conversaId}`, `chat:${conv.tipo === 'grupo' ? 'grupo' : 'dm'}`, 'tipo:conversa']
  };
}

const hashDe = (item: ItemRetain): string => createHash('sha256').update(JSON.stringify([item.content, item.context, item.timestamp, item.tags])).digest('hex');

// Varre os dias fechados (antes de hoje) de todas as conversas e enfileira o que ainda nao foi enviado ou mudou desde o ultimo envio.
export function agendarRetain(db: Banco, agora: number, fuso: string = FUSO_PADRAO): string[] {
  const hoje = diaLocal(agora, fuso);
  const mensagens = db
    .prepare("SELECT m.conversa_id AS c, m.enviada_em AS t FROM mensagens m JOIN conversas c ON c.id = m.conversa_id WHERE c.tipo <> 'self' AND m.tipo <> 'ignorada'")
    .all() as { c: number; t: number }[];
  const ids = new Set<string>();
  for (const m of mensagens) {
    const dia = diaLocal(m.t, fuso);
    if (dia < hoje) ids.add(`conv:${m.c}:${dia}`);
  }
  const novos: string[] = [];
  for (const documentId of [...ids].sort()) {
    const item = montarItem(db, documentId, fuso);
    if (!item) continue;
    const s = db.prepare("SELECT hash_conteudo FROM sync_hindsight WHERE tipo = 'conv' AND referencia = ?").get(documentId) as { hash_conteudo: string } | undefined;
    if (s?.hash_conteudo === hashDe(item)) continue;
    if (reenfileirar(db, 'retain', documentId, agora)) novos.push(documentId);
  }
  return novos;
}

export async function processarRetain(db: Banco, job: Trabalho, porta: PortaMemoria, agora: number = Date.now(), fuso: string = FUSO_PADRAO): Promise<Resultado> {
  const item = montarItem(db, job.referencia, fuso);
  if (!item) { concluir(db, job.id, agora); return 'ok'; } // nada a enviar (sem texto, self-chat ou referencia que nao existe)
  const hash = hashDe(item);
  const s = db.prepare("SELECT hash_conteudo FROM sync_hindsight WHERE tipo = 'conv' AND referencia = ?").get(job.referencia) as { hash_conteudo: string } | undefined;
  if (s?.hash_conteudo === hash) { concluir(db, job.id, agora); return 'ok'; }
  try {
    await porta.reter(item);
  } catch (e) {
    // So o MOTIVO vai para a fila: a mensagem de um erro de rede pode repetir o conteudo enviado (regra 2).
    if (e instanceof FalhaDefinitiva) return falhar(db, job.id, e.message, agora, { definitiva: true });
    return falhar(db, job.id, 'falha_ao_enviar_ao_hindsight', agora);
  }
  db.prepare(
    `INSERT INTO sync_hindsight (tipo, referencia, document_id, hash_conteudo, sincronizado_em) VALUES ('conv', ?, ?, ?, ?)
     ON CONFLICT (tipo, referencia) DO UPDATE SET hash_conteudo = excluded.hash_conteudo, sincronizado_em = excluded.sincronizado_em`
  ).run(job.referencia, item.documentId, hash, agora);
  concluir(db, job.id, agora);
  return 'ok';
}

// Esquecer no Hindsight o que foi enviado sobre um cliente apagado (apagar.ts anota em "memoria_apagar"). So ids no formato que NOS criamos.
export async function processarApagarMemoria(db: Banco, porta: PortaApagarMemoria, agora: number = Date.now()): Promise<number> {
  const pedidos = db.prepare("SELECT document_id AS d FROM memoria_apagar WHERE estado = 'pendente' AND tentativas < ? ORDER BY pedido_em, document_id LIMIT 20").all(MAX_TENTATIVAS_APAGAR) as { d: string }[];
  let feitos = 0;
  for (const { d } of pedidos) {
    if (!ID.test(d)) continue; // nunca manda ao Hindsight um id que nao seja um documento de conversa nosso
    try {
      await porta.apagarDocumento(d);
      db.prepare("UPDATE memoria_apagar SET estado = 'feito', feito_em = ?, tentativas = tentativas + 1, erro = NULL WHERE document_id = ?").run(agora, d);
      feitos++;
    } catch {
      db.prepare("UPDATE memoria_apagar SET tentativas = tentativas + 1, erro = 'falha_ao_apagar_no_hindsight' WHERE document_id = ?").run(d);
    }
  }
  return feitos;
}
