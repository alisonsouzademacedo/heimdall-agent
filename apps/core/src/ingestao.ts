// Entrada de mensagens no acervo. Regras: docs/plano/fase-1-modelo-de-dados.md (D16).
// Bruto primeiro: nada e reescrito; edicao guarda o original; apagada fica marcada (nunca removida).
import type { Banco } from './db.ts';
import { normalizarJid, tipoDoJid } from './jid.ts';
import { mesmoUsuario } from './jid.ts';
import type { IdentidadeDono } from './envio.ts';
import type { MensagemCliente } from './acompanhamento.ts';

export type TipoEntrada = 'texto' | 'audio' | 'pdf' | 'outro';
export type OrigemEvento = 'notify' | 'append' | 'historico';

export interface EventoMensagem {
  waMsgId: string;
  remoteJid: string;
  remoteJidAlt?: string; // forma alternativa (PN <-> LID) quando o Baileys informa
  participante?: string; // em grupos
  fromMe: boolean;
  quandoMs: number;
  tipo: TipoEntrada;
  texto?: string;
  origem: OrigemEvento;
  nomeContato?: string;
}

export type ResultadoRegistro = 'inserida' | 'duplicada' | 'jid_invalido';

function tipoJidParaTabela(jid: string): 'lid' | 'pn' | null {
  const t = tipoDoJid(jid);
  return t === 'lid' || t === 'pn' ? t : null;
}

// Acha (ou cria) o contato de um JID; se ha forma alternativa, liga os dois ao MESMO contato.
// Nome que chegou antes de o contato/grupo existir (lista de contatos antes das mensagens): guardado, e aplicado quando ele aparecer.
export function guardarNomePendente(db: Banco, jid: string, nome: string, agora: number = Date.now()): void {
  const j = normalizarJid(jid);
  if (!j || nome.trim() === '') return;
  db.prepare('INSERT INTO nomes_pendentes (jid, nome, recebida_em) VALUES (?, ?, ?) ON CONFLICT (jid) DO UPDATE SET nome = excluded.nome, recebida_em = excluded.recebida_em, aplicada_em = NULL').run(j, nome.trim(), agora);
}
function nomePendenteDe(db: Banco, jid: string): string | null {
  const r = db.prepare('SELECT nome FROM nomes_pendentes WHERE jid = ? AND aplicada_em IS NULL').get(jid) as { nome: string } | undefined;
  return r?.nome ?? null;
}
const marcarAplicado = (db: Banco, jid: string): void => { db.prepare('UPDATE nomes_pendentes SET aplicada_em = ? WHERE jid = ?').run(Date.now(), jid); };

export function resolverContato(db: Banco, jid: string, alt?: string, nome?: string): number | null {
  const principal = normalizarJid(jid);
  if (!principal || !tipoJidParaTabela(principal)) return null;
  const altNorm = alt ? normalizarJid(alt) : null;
  const formas = [principal, ...(altNorm && tipoJidParaTabela(altNorm) ? [altNorm] : [])];
  let contatoId: number | null = null;
  for (const f of formas) {
    const r = db.prepare('SELECT contato_id FROM contato_jids WHERE jid = ?').get(f) as { contato_id: number } | undefined;
    if (r) { contatoId = r.contato_id; break; }
  }
  if (contatoId === null) {
    contatoId = Number(db.prepare('INSERT INTO contatos (nome) VALUES (?)').run(nome ?? null).lastInsertRowid);
  }
  for (const f of formas) {
    db.prepare('INSERT OR IGNORE INTO contato_jids (jid, contato_id, tipo) VALUES (?, ?, ?)').run(f, contatoId, tipoJidParaTabela(f));
  }
  // Sem nome ainda: usa o que a lista de contatos mandou antes (nunca sobrescreve um nome existente).
  if ((db.prepare('SELECT nome FROM contatos WHERE id = ?').get(contatoId) as { nome: string | null }).nome === null) {
    for (const f of formas) {
      const pend = nomePendenteDe(db, f);
      if (pend === null) continue;
      db.prepare('UPDATE contatos SET nome = ? WHERE id = ? AND nome IS NULL').run(pend, contatoId);
      marcarAplicado(db, f);
      break;
    }
  }
  return contatoId;
}

function conversaDe(db: Banco, remoteJid: string, alt: string | undefined, dono: IdentidadeDono, nome?: string): number | null {
  const jid = normalizarJid(remoteJid);
  if (!jid) return null;
  const t = tipoDoJid(jid);
  if (t === 'grupo') {
    db.prepare('INSERT OR IGNORE INTO conversas (jid, tipo) VALUES (?, ?)').run(jid, 'grupo');
    const pend = nomePendenteDe(db, jid);
    if (pend !== null && db.prepare("UPDATE conversas SET nome = ? WHERE jid = ? AND nome IS NULL").run(pend, jid).changes > 0) marcarAplicado(db, jid);
    return (db.prepare('SELECT id FROM conversas WHERE jid = ?').get(jid) as { id: number }).id;
  }
  if (t !== 'pn' && t !== 'lid') return null; // transmissao, status, canal: ignorados
  // O chat do dono tambem vale quando o Baileys o entrega como LID desconhecido mas informa o NUMERO dele em remoteJidAlt (reenvio em aparelho novo).
  const ehSelf = mesmoUsuario(jid, dono.pn) || (dono.lid !== undefined && mesmoUsuario(jid, dono.lid)) || (alt !== undefined && mesmoUsuario(alt, dono.pn));
  if (ehSelf) {
    // PN e LID do dono sao a MESMA conversa: reaproveita a que ja existir para qualquer das duas formas.
    const existente = db.prepare("SELECT id FROM conversas WHERE tipo = 'self'").get() as { id: number } | undefined;
    if (existente) return existente.id;
    db.prepare("INSERT INTO conversas (jid, tipo) VALUES (?, 'self')").run(jid);
    return (db.prepare('SELECT id FROM conversas WHERE jid = ?').get(jid) as { id: number }).id;
  }
  // DM: a conversa e do CONTATO; PN e LID dele apontam para a mesma conversa.
  const contatoId = resolverContato(db, jid, alt, nome);
  const existente = db
    .prepare("SELECT c.id AS id FROM conversas c JOIN contato_jids j ON j.jid = c.jid WHERE j.contato_id = ? AND c.tipo = 'dm' LIMIT 1")
    .get(contatoId) as { id: number } | undefined;
  if (existente) return existente.id;
  db.prepare("INSERT INTO conversas (jid, tipo) VALUES (?, 'dm')").run(jid);
  return (db.prepare('SELECT id FROM conversas WHERE jid = ?').get(jid) as { id: number }).id;
}

export function registrarMensagem(db: Banco, ev: EventoMensagem, dono: IdentidadeDono): ResultadoRegistro {
  const conversaId = conversaDe(db, ev.remoteJid, ev.remoteJidAlt, dono, ev.nomeContato);
  if (conversaId === null) return 'jid_invalido';
  const ehGrupo = tipoDoJid(ev.remoteJid) === 'grupo';
  const jidRemetente = ehGrupo ? ev.participante : ev.remoteJid;
  const remetente = ev.fromMe || !jidRemetente ? null : resolverContato(db, jidRemetente, ev.remoteJidAlt, ev.nomeContato);
  const tipo = ev.tipo === 'outro' ? 'ignorada' : ev.tipo;
  const texto = ev.tipo === 'outro' ? null : (ev.texto ?? null);
  const r = db
    .prepare(
      `INSERT OR IGNORE INTO mensagens (conversa_id, wa_msg_id, remetente_contato_id, de_mim, enviada_em, tipo, texto, origem_evento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(conversaId, ev.waMsgId, remetente, ev.fromMe ? 1 : 0, ev.quandoMs, tipo, texto, ev.origem);
  return Number(r.changes) === 1 ? 'inserida' : 'duplicada';
}

export type ResultadoAlteracao = 'alterada' | 'nao_encontrada';

function acharMensagem(db: Banco, remoteJid: string, waMsgId: string): { id: number; estado: string; texto: string | null } | undefined {
  const jid = normalizarJid(remoteJid);
  if (!jid) return undefined;
  // Procura na conversa do JID e, para DM, em qualquer conversa do mesmo contato (PN ou LID).
  return db
    .prepare(
      `SELECT m.id, m.estado, m.texto FROM mensagens m JOIN conversas c ON c.id = m.conversa_id
       WHERE m.wa_msg_id = ? AND (c.jid = ? OR c.jid IN (
         SELECT j2.jid FROM contato_jids j1 JOIN contato_jids j2 ON j2.contato_id = j1.contato_id WHERE j1.jid = ?))`
    )
    .get(waMsgId, jid, jid) as { id: number; estado: string; texto: string | null } | undefined;
}

// Id interno de uma mensagem ja gravada (usado para enfileirar midia e ligar descritores).
export function idDaMensagem(db: Banco, remoteJid: string, waMsgId: string): number | undefined {
  return acharMensagem(db, remoteJid, waMsgId)?.id;
}

// Edicao: guarda o texto original uma unica vez (a primeira versao) e passa a mostrar o novo.
export function registrarEdicao(db: Banco, remoteJid: string, waMsgId: string, novoTexto: string): ResultadoAlteracao {
  const m = acharMensagem(db, remoteJid, waMsgId);
  if (!m || m.estado === 'apagada') return 'nao_encontrada';
  if (m.estado === 'ativa') {
    db.prepare("UPDATE mensagens SET texto_original = texto, texto = ?, estado = 'editada' WHERE id = ?").run(novoTexto, m.id);
  } else {
    db.prepare('UPDATE mensagens SET texto = ? WHERE id = ?').run(novoTexto, m.id);
  }
  return 'alterada';
}

// Apagada: o texto continua guardado, so marcado (decisao D16).
export function registrarApagada(db: Banco, remoteJid: string, waMsgId: string): ResultadoAlteracao {
  const m = acharMensagem(db, remoteJid, waMsgId);
  if (!m) return 'nao_encontrada';
  db.prepare("UPDATE mensagens SET estado = 'apagada' WHERE id = ?").run(m.id);
  return 'alterada';
}

// Edicao/apagada que chegou ANTES da mensagem original (acontece na carga do historico): fica guardada e e aplicada quando a original entrar.
// A ultima edicao recebida vale. Nada e removido: a linha ganha "aplicada_em".
export function guardarAlteracaoPendente(db: Banco, tipo: 'editar' | 'apagar', remoteJid: string, waMsgId: string, novoTexto: string | null, agora: number): void {
  const jid = normalizarJid(remoteJid);
  if (!jid) return;
  db.prepare(
    `INSERT INTO alteracoes_pendentes (remote_jid, wa_msg_id, tipo, novo_texto, recebida_em) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (remote_jid, wa_msg_id, tipo) DO UPDATE SET novo_texto = excluded.novo_texto, recebida_em = excluded.recebida_em, aplicada_em = NULL`
  ).run(jid, waMsgId, tipo, novoTexto, agora);
}

// Chamada logo depois de gravar uma mensagem nova: aplica as alteracoes que estavam esperando por ela (edicao primeiro, depois apagada).
// Uma pendencia de OUTRA conversa com o mesmo id continua esperando (acharMensagem confere a conversa).
export function aplicarAlteracoesPendentes(db: Banco, waMsgId: string, agora: number): number {
  const linhas = db.prepare("SELECT id, remote_jid AS jid, tipo, novo_texto AS texto FROM alteracoes_pendentes WHERE wa_msg_id = ? AND aplicada_em IS NULL ORDER BY CASE tipo WHEN 'editar' THEN 0 ELSE 1 END, recebida_em").all(waMsgId) as { id: number; jid: string; tipo: string; texto: string | null }[];
  let aplicadas = 0;
  for (const l of linhas) {
    const r = l.tipo === 'editar' ? registrarEdicao(db, l.jid, waMsgId, l.texto ?? '') : registrarApagada(db, l.jid, waMsgId);
    if (r === 'alterada') { db.prepare('UPDATE alteracoes_pendentes SET aplicada_em = ? WHERE id = ?').run(agora, l.id); aplicadas++; }
  }
  return aplicadas;
}

// Mensagens de DM de um cliente (todos os contatos dele) no formato do motor de regras.
// Decisao desta implementacao (a confirmar com o dono): mensagem APAGADA do cliente ainda conta como resposta dele,
// mas deixa de cobrar resposta do dono. Self-chat e grupos nunca entram.
export function mensagensParaAcompanhamento(db: Banco, clienteId: number): MensagemCliente[] {
  const linhas = db
    .prepare(
      `SELECT m.enviada_em AS em, m.de_mim AS de_mim, m.pede_resposta AS pede, m.estado AS estado
       FROM mensagens m
       JOIN conversas c ON c.id = m.conversa_id AND c.tipo = 'dm'
       JOIN contato_jids j ON j.jid = c.jid
       JOIN contatos k ON k.id = j.contato_id
       WHERE k.cliente_id = ? AND m.tipo != 'ignorada'
       ORDER BY m.enviada_em`
    )
    .all(clienteId) as { em: number; de_mim: number; pede: number | null; estado: string }[];
  const vistos = new Set<string>();
  const saida: MensagemCliente[] = [];
  for (const l of linhas) {
    const chave = `${l.em}:${l.de_mim}`; // evita contar duas vezes a mesma mensagem quando PN e LID apontam ao mesmo contato
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push({ em: l.em, deMim: l.de_mim === 1, precisaResposta: l.estado === 'apagada' ? false : l.pede === null ? undefined : l.pede === 1 });
  }
  return saida;
}
