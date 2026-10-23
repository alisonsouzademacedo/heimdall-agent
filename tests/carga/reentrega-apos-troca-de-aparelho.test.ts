// Contrato da TROCA DE APARELHO (2026-10-22): o dono vai parear o WhatsApp de novo (QR novo, aparelho novo) sobre um acervo que JA existe e ja foi
// processado. O WhatsApp pode reenviar o historico inteiro. Este teste prova, com dados SINTETICOS (nenhuma conversa real, regra 2), que o reenvio:
//  - nao duplica mensagem (mesmo reordenado, em lotes diferentes, parte como "append", com ids na forma LID e com outro indice de dispositivo do dono);
//  - nao desfaz o que ja foi feito: audio transcrito continua com o texto, midia abandonada continua abandonada, fila "ok" continua "ok";
//  - nao enfileira de novo midia que ja existe, nem mexe na busca antiga, na memoria enviada ao Hindsight ou nos relatorios;
//  - e uma mensagem realmente NOVA que chegou no meio entra uma unica vez (com uma unica tarefa de midia).
// Se alguem trocar INSERT OR IGNORE por INSERT, ou fizer a escuta reabrir tarefas, este teste falha.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from '../../apps/core/src/db.ts';
import { ligarEventos, type SocketMinimo, type EventosMinimos } from '../../apps/listener/src/ligar.ts';
import type { MensagemBaileys } from '../../apps/core/src/whatsapp/traduzir.ts';
import { gravarConfigHistorico } from '../../apps/core/src/historico-antigo.ts';
import { gerarHistorico, emLotes, embaralhar, DONO } from './gerador.ts';

const N = Number(process.env.HEIMDALL_REENTREGA_MENSAGENS ?? 3000);
type Handler = (e: Partial<EventosMinimos>) => void | Promise<void>;

function ligar(db: Banco, userId: string) {
  let h: Handler | null = null;
  const sock: SocketMinimo = { user: { id: userId, lid: DONO.lid }, ev: { process(f) { h = f as Handler; } } };
  const avisos: string[] = [];
  ligarEventos({ sock, banco: db, salvarCreds: async () => {}, aoEstado: (e) => { if (e.estado === 'aviso') avisos.push(e.motivo); }, aoQr: () => {}, aoHistorico: () => {} });
  return {
    avisos,
    historico: async (messages: MensagemBaileys[], extra: object = {}) => { await h!({ 'messaging-history.set': { messages, ...extra } }); },
    append: async (messages: MensagemBaileys[]) => { await h!({ 'messages.upsert': { messages, type: 'append' } }); }
  };
}

// "Impressao digital" de TUDO que a reentrega nao pode mexer. Sem texto de conversa no resultado de falha: so contagens e um resumo.
function foto(db: Banco): Record<string, string> {
  const linhas = (sql: string) => JSON.stringify(db.prepare(sql).all());
  return {
    mensagens: linhas("SELECT c.jid AS j, m.wa_msg_id AS w, m.de_mim AS d, m.enviada_em AS t, m.tipo AS p, IFNULL(m.texto,'') AS x, m.estado AS e, m.origem_evento AS o FROM mensagens m JOIN conversas c ON c.id = m.conversa_id ORDER BY c.jid, m.wa_msg_id"),
    conversas: linhas('SELECT id, jid, tipo FROM conversas ORDER BY id'),
    contatos: linhas('SELECT id, nome, papel, cliente_id FROM contatos ORDER BY id'),
    contato_jids_pn: linhas("SELECT jid, contato_id FROM contato_jids WHERE jid NOT LIKE '%@lid' ORDER BY jid"), // os apelidos LID novos sao conferidos a parte
    fila: linhas('SELECT tipo, referencia, estado, tentativas, hash_abandono AS h FROM fila ORDER BY tipo, referencia'),
    midias_origem: linhas('SELECT mensagem_id FROM midias_origem ORDER BY mensagem_id'),
    historico_pedidos: linhas('SELECT * FROM historico_pedidos ORDER BY conversa_id'),
    sync_hindsight: linhas('SELECT * FROM sync_hindsight ORDER BY referencia'),
    alteracoes_pendentes: linhas('SELECT remote_jid, wa_msg_id, tipo FROM alteracoes_pendentes ORDER BY 1,2,3'),
    saida: linhas('SELECT COUNT(*) AS n FROM saida'),
    config_busca_antiga: linhas("SELECT valor FROM configuracao WHERE chave = 'historico.antigo'")
  };
}
function diferencas(antes: Record<string, string>, depois: Record<string, string>): string[] {
  return Object.keys(antes).filter((k) => antes[k] !== depois[k]).map((k) => `${k} (${antes[k]!.length} -> ${depois[k]!.length} bytes)`);
}

// Forma LID da mesma conversa: o Baileys 7 informa o outro formato em remoteJidAlt.
const emLid = (m: MensagemBaileys): MensagemBaileys => {
  const pn = m.key.remoteJid!;
  if (!pn.endsWith('@s.whatsapp.net')) return m;
  const numero = pn.split('@')[0]!;
  // O dono usa o LID REAL dele (o Baileys informa o proprio LID em creds.me.lid); os clientes ganham um LID qualquer.
  const lid = numero === DONO.pn.split(':')[0]!.split('@')[0] ? DONO.lid : `${numero}000@lid`;
  return { ...m, key: { ...m.key, remoteJid: lid, remoteJidAlt: pn } } as MensagemBaileys;
};

test('troca de aparelho: o historico inteiro chega de novo sobre um acervo ja processado -> nada duplica e nada volta atras', async () => {
  const db = abrirBanco(); migrar(db);
  const historico = gerarHistorico({ mensagens: N, clientes: Math.max(10, Math.floor(N / 30)) });

  // 1) Primeira vida do acervo: o historico entra, e o resto do Heimdall trabalha em cima dele.
  const antigo = ligar(db, DONO.pn);
  for (const lote of emLotes(historico, 400)) await antigo.historico(lote, { isLatest: false, progress: 50 });
  assert.equal(antigo.avisos.length, 0, antigo.avisos.slice(0, 2).join(' | '));

  const audios = db.prepare("SELECT id FROM mensagens WHERE tipo = 'audio' ORDER BY id").all() as { id: number }[];
  assert.ok(audios.length >= 20, `o gerador precisa dar audios suficientes (deu ${audios.length})`);
  const terco = Math.floor(audios.length / 3);
  // Um terco transcrito (fila "ok" + texto na mensagem), um terco abandonado (midia expirada), o resto ainda pendente.
  audios.slice(0, terco).forEach(({ id }) => {
    db.prepare("UPDATE fila SET estado = 'ok', tentativas = 1 WHERE tipo = 'baixar_midia' AND referencia = ?").run(String(id));
    db.prepare("UPDATE mensagens SET texto = '[transcricao sintetica]' WHERE id = ?").run(id);
  });
  audios.slice(terco, 2 * terco).forEach(({ id }) => {
    db.prepare("UPDATE fila SET estado = 'abandonada', tentativas = 5, hash_abandono = 'h-expirada' WHERE tipo = 'baixar_midia' AND referencia = ?").run(String(id));
  });
  // Busca antiga andando: trava aberta pelo dono e algumas conversas ja concluidas.
  gravarConfigHistorico(db, { liberado: true });
  const conversas = db.prepare("SELECT id FROM conversas WHERE tipo = 'dm' ORDER BY id LIMIT 15").all() as { id: number }[];
  conversas.forEach(({ id }, i) => db.prepare("INSERT INTO historico_pedidos (conversa_id, estado, pedidos, vazias, atualizado_em) VALUES (?, ?, 2, 2, 1000)").run(id, i % 2 === 0 ? 'concluida' : 'pendente'));
  // Memoria ja enviada ao Hindsight e uma tarefa de memoria concluida.
  db.prepare("INSERT INTO sync_hindsight (tipo, referencia, document_id, hash_conteudo, sincronizado_em) VALUES ('conv', 'conv:1:2026-09-01', 'conv:1:2026-09-01', 'hash-x', 1000)").run();
  db.prepare("INSERT INTO fila (tipo, referencia, estado, tentativas, proximo_em, criado_em, atualizado_em) VALUES ('retain', 'conv:1:2026-09-01', 'ok', 1, 0, 0, 0)").run();

  const antes = foto(db);
  const totalAntes = contar(db, 'mensagens');
  const filaAntes = contar(db, 'fila');
  assert.ok(totalAntes > N * 0.9, 'o acervo de partida tem quase tudo (reacoes sao ignoradas)');

  // 2) Aparelho NOVO: outro indice de dispositivo no numero do dono; o WhatsApp reenvia o historico em outra ordem, em outros lotes,
  //    uma parte como "append", e parte das conversas com os ids na forma LID.
  const novo = ligar(db, DONO.pn.replace(':7@', ':9@'));
  const reenvio = embaralhar(historico, 11);
  const [paraAppend, paraHistorico] = [reenvio.filter((_, i) => i % 5 === 0), reenvio.filter((_, i) => i % 5 !== 0)];
  for (const lote of emLotes(paraHistorico.map((m, i) => (i % 3 === 0 ? emLid(m) : m)), 137)) await novo.historico(lote, { isLatest: false, progress: 80 });
  for (const lote of emLotes(paraAppend, 211)) await novo.append(lote);
  await novo.historico([], { isLatest: true, progress: 100 }); // o ultimo bloco chega vazio

  assert.equal(novo.avisos.length, 0, novo.avisos.slice(0, 2).join(' | '));
  assert.equal(contar(db, 'mensagens'), totalAntes, 'o reenvio NAO pode criar nem apagar mensagem');
  assert.equal(contar(db, 'fila'), filaAntes, 'o reenvio NAO pode criar nem reabrir tarefa');
  const mudou = diferencas(antes, foto(db));
  assert.deepEqual(mudou, [], `o reenvio mexeu em: ${mudou.join(', ')}`);
  // O reenvio em LID so pode ENSINAR apelidos: toda linha nova de contato_jids e um @lid apontando para um contato que ja existia.
  const novosApelidos = db.prepare("SELECT j.jid FROM contato_jids j WHERE j.jid LIKE '%@lid' AND j.contato_id NOT IN (SELECT id FROM contatos)").all();
  assert.deepEqual(novosApelidos, [], 'apelido LID apontando para contato que nao existe');
  assert.ok((db.prepare("SELECT COUNT(*) AS n FROM contato_jids WHERE jid LIKE '%@lid'").get() as { n: number }).n > 0, 'o reenvio em LID ensinou os apelidos LID dos contatos (efeito desejado)');
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'self'").get() as { n: number }).n, 1, 'o self-chat continua sendo UMA conversa (outro indice de dispositivo do dono)');
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM mensagens WHERE texto = '[transcricao sintetica]'").get() as { n: number }).n, terco, 'audio ja transcrito continua com o texto');
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM fila WHERE estado = 'abandonada' AND hash_abandono = 'h-expirada'").get() as { n: number }).n, terco, 'midia abandonada continua abandonada');
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM (SELECT conversa_id, wa_msg_id FROM mensagens GROUP BY 1, 2 HAVING COUNT(*) > 1)').get() as { n: number }).n, 0, 'nenhum id repetido na mesma conversa');

  // 3) Uma mensagem NOVA (de audio) que chegou enquanto o aparelho estava trocado entra uma vez so, com uma tarefa de midia.
  const nova = { key: { id: 'NOVA-1', remoteJid: '5511900000001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 7, mimetype: 'audio/ogg; codecs=opus' } }, messageTimestamp: Math.floor(Date.parse('2026-10-22T10:00:00Z') / 1000) } as MensagemBaileys;
  await novo.historico([nova]);
  await novo.historico([nova]);
  await novo.append([nova]);
  assert.equal(contar(db, 'mensagens'), totalAntes + 1, 'a mensagem nova entra exatamente uma vez');
  assert.equal(contar(db, 'fila'), filaAntes + 1, 'e gera exatamente uma tarefa de download');
});
