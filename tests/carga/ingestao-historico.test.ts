// Carga e RESSINCRONIZACAO da entrada do historico do WhatsApp (messaging-history.set -> acervo). Dados sinteticos.
// Tamanho: HEIMDALL_CARGA_MENSAGENS (padrao 40000). Os tempos sao medidos e impressos; os limites sao folgados (maquina lenta nao pode quebrar o teste).
import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { abrirBanco, migrar, contar, type Banco } from '../../apps/core/src/db.ts';
import { ligarEventos, type SocketMinimo, type EventosMinimos } from '../../apps/listener/src/ligar.ts';
import { gerarHistorico, emLotes, embaralhar, DONO } from './gerador.ts';

const N = Number(process.env.HEIMDALL_CARGA_MENSAGENS ?? 40000);
const LOTE = 500;
type Handler = (e: Partial<EventosMinimos>) => void | Promise<void>;

function ligar(db: Banco) {
  let h: Handler | null = null;
  const sock: SocketMinimo = { user: { id: DONO.pn, lid: DONO.lid }, ev: { process(f) { h = f as Handler; } } };
  const avisos: string[] = [];
  ligarEventos({ sock, banco: db, salvarCreds: async () => {}, aoEstado: (e) => { if (e.estado === 'aviso') avisos.push(e.motivo); }, aoQr: () => {}, aoHistorico: () => {} });
  return { avisos, historico: async (messages: ReturnType<typeof gerarHistorico>, extra: object = {}) => { await h!({ 'messaging-history.set': { messages, ...extra } }); } };
}
const novoBanco = () => { const db = abrirBanco(); migrar(db); return db; };
// "Impressao digital" do acervo: dois estados com a mesma impressao tem as mesmas conversas e mensagens (id, texto, quem, quando).
function impressao(db: Banco): string {
  const linhas = db.prepare(`SELECT c.jid AS j, m.wa_msg_id AS w, m.de_mim AS d, m.enviada_em AS t, m.tipo AS p, IFNULL(m.texto,'') AS x FROM mensagens m JOIN conversas c ON c.id = m.conversa_id ORDER BY c.jid, m.wa_msg_id`).all() as { j: string; w: string; d: number; t: number; p: string; x: string }[];
  let h = 0n; for (const l of linhas) { for (const ch of `${l.j}|${l.w}|${l.d}|${l.t}|${l.p}|${l.x}`) h = (h * 131n + BigInt(ch.charCodeAt(0))) & 0xffffffffffffn; }
  return `${linhas.length}:${h}`;
}
const historico = gerarHistorico({ mensagens: N, clientes: Math.max(10, Math.floor(N / 30)) });
const lotes = emLotes(historico, LOTE);

test(`carga: ${N} mensagens em lotes de ${LOTE} entram sem perder nenhuma (e quanto tempo levou)`, async () => {
  const db = novoBanco(); const l = ligar(db);
  const memAntes = process.memoryUsage().heapUsed;
  const t0 = performance.now();
  for (const lote of lotes) await l.historico(lote, { isLatest: false, progress: 50 });
  const ms = performance.now() - t0;
  const msgs = contar(db, 'mensagens');
  const reacoes = historico.filter((m) => 'reactionMessage' in (m.message as object)).length;
  console.log(`    [medida] ${N} mensagens em ${(ms / 1000).toFixed(1)} s (${Math.round(N / (ms / 1000))} msg/s); mensagens gravadas ${msgs}; conversas ${contar(db, 'conversas')}; fila ${contar(db, 'fila')}; heap +${Math.round((process.memoryUsage().heapUsed - memAntes) / 1048576)} MB`);
  assert.equal(msgs, N - reacoes, 'toda mensagem que nao e reacao precisa estar no acervo');
  assert.equal(l.avisos.length, 0, `avisos: ${l.avisos.slice(0, 2).join(' | ')}`);
  assert.ok(N / (ms / 1000) > 300, `vazao baixa demais: ${Math.round(N / (ms / 1000))} msg/s`);
  const midias = historico.filter((m) => 'audioMessage' in (m.message as object) || 'documentMessage' in (m.message as object)).length;
  assert.equal(contar(db, 'fila'), midias, 'cada audio/PDF vira exatamente um trabalho na fila');
});

test('ressincronizacao 1: o WhatsApp reenvia TODO o historico -> nada duplica, nada muda', async () => {
  const db = novoBanco(); const l = ligar(db);
  for (const lote of lotes) await l.historico(lote);
  const antes = impressao(db); const fila = contar(db, 'fila');
  const t0 = performance.now();
  for (const lote of lotes) await l.historico(lote);
  console.log(`    [medida] reenvio total em ${((performance.now() - t0) / 1000).toFixed(1)} s`);
  assert.equal(impressao(db), antes);
  assert.equal(contar(db, 'fila'), fila, 'reenvio nao enfileira midia de novo');
});

test('ressincronizacao 2: queda no meio da carga (processo reinicia, so metade gravada) e o historico chega de novo -> estado final igual ao de uma carga limpa', async () => {
  const limpo = novoBanco(); const a = ligar(limpo);
  for (const lote of lotes) await a.historico(lote);
  const db = novoBanco(); const b = ligar(db);
  for (const lote of lotes.slice(0, Math.floor(lotes.length / 2))) await b.historico(lote);
  // "reinicio": nova ligacao (nova escuta, sem memoria nenhuma) sobre o MESMO acervo
  const c = ligar(db);
  for (const lote of lotes) await c.historico(lote);
  assert.equal(impressao(db), impressao(limpo));
  assert.equal(contar(db, 'fila'), contar(limpo, 'fila'));
});

test('ressincronizacao 3: lotes fora de ordem e repetidos chegam ao mesmo estado final', async () => {
  const limpo = novoBanco(); const a = ligar(limpo);
  for (const lote of lotes) await a.historico(lote);
  const db = novoBanco(); const b = ligar(db);
  const baguncado = embaralhar(lotes);
  for (const lote of [...baguncado, ...baguncado.slice(0, 5), ...baguncado.slice(-5)]) await b.historico(lote);
  assert.equal(impressao(db), impressao(limpo));
});

test('ressincronizacao 4: falha ao gravar uma mensagem nao derruba o lote; no reenvio ela entra', async () => {
  const db = novoBanco(); const l = ligar(db);
  const alvo = historico.find((m) => 'conversation' in (m.message as object))!;
  db.exec(`CREATE TRIGGER falha_de_proposito BEFORE INSERT ON mensagens WHEN NEW.wa_msg_id = '${alvo.key.id}' BEGIN SELECT RAISE(ABORT, 'falha de teste'); END`);
  const lote = lotes.find((x) => x.includes(alvo))!;
  await l.historico(lote);
  const gravadas = contar(db, 'mensagens');
  assert.ok(gravadas >= lote.length - 20, 'o resto do lote foi gravado');
  assert.ok(l.avisos.some((a) => /nao puderam ser gravadas/.test(a)), 'a falha foi avisada');
  db.exec('DROP TRIGGER falha_de_proposito');
  await l.historico(lote);
  assert.equal(contar(db, 'mensagens'), gravadas + 1, 'no reenvio, a mensagem que falhou entra');
});

test('ressincronizacao 5: edicao e "apagada" que chegam ANTES da mensagem original nao se perdem para sempre', async () => {
  const db = novoBanco(); const l = ligar(db); const cliente = '5511999990001@s.whatsapp.net';
  let h: Handler | null = null;
  const sock: SocketMinimo = { user: { id: DONO.pn, lid: DONO.lid }, ev: { process(f) { h = f as Handler; } } };
  ligarEventos({ sock, banco: db, salvarCreds: async () => {}, aoEstado: () => {}, aoQr: () => {}, aoHistorico: () => {} });
  void l;
  const chave = { id: 'EDIT1', remoteJid: cliente, fromMe: false };
  await h!({ 'messages.update': [{ key: chave, update: { message: { editedMessage: { message: { conversation: 'texto corrigido' } } } } }] });
  await h!({ 'messaging-history.set': { messages: [{ key: chave, message: { conversation: 'texto original' }, messageTimestamp: 1_760_000_000 }] } });
  const m = db.prepare("SELECT texto, estado FROM mensagens WHERE wa_msg_id = 'EDIT1'").get() as { texto: string; estado: string } | undefined;
  assert.ok(m, 'a mensagem entrou');
  assert.equal(m!.texto, 'texto corrigido', 'a edicao que chegou antes precisa valer (senao o acervo guarda texto desatualizado)');
});

// ---- puxada dos contatos: a lista chega junto do historico (messaging-history.set.contacts), muitas vezes ANTES das mensagens ----
function lista(): { id: string; name: string }[] {
  const ids = new Set<string>();
  for (const m of historico) for (const j of [m.key.remoteJid!, m.key.participant ?? '']) if (j.endsWith('@s.whatsapp.net') && !j.startsWith('5511900000000')) ids.add(j);
  return [...ids].map((id) => ({ id, name: `Contato ${id.slice(2, 13)}` }));
}
const semNome = (db: Banco) => (db.prepare("SELECT COUNT(*) AS n FROM contatos WHERE nome IS NULL AND id IN (SELECT contato_id FROM contato_jids)").get() as { n: number }).n;

test('contatos: a lista inteira chega ANTES das mensagens -> todos os contatos ficam com nome, e a lista sozinha nao cria contato', async () => {
  const db = novoBanco(); const l = ligar(db); const contatos = lista();
  const t0 = performance.now();
  for (const parte of emLotes(contatos, 500)) await l.historico([], { contacts: parte });
  assert.equal(contar(db, 'contatos'), 0, 'lista de contatos sem mensagem nao cria contato (so quem conversou entra no acervo)');
  for (const lote of lotes) await l.historico(lote);
  console.log(`    [medida] ${contatos.length} contatos (lista antes) + ${N} mensagens em ${((performance.now() - t0) / 1000).toFixed(1)} s; contatos sem nome: ${semNome(db)}`);
  assert.equal(semNome(db), 0);
});

test('contatos: a lista chega DEPOIS das mensagens e e reenviada duas vezes -> mesmos nomes, nenhum contato novo', async () => {
  const db = novoBanco(); const l = ligar(db); const contatos = lista();
  for (const lote of lotes) await l.historico(lote);
  const antes = contar(db, 'contatos');
  for (let vez = 0; vez < 2; vez++) for (const parte of emLotes(contatos, 500)) await l.historico([], { contacts: parte });
  assert.equal(contar(db, 'contatos'), antes);
  assert.equal(semNome(db), 0);
});
