// Historico antigo (fetchMessageHistory) em escala: chega DEPOIS da extracao dos dias recentes, chega duas vezes, cai no meio. Dados sinteticos.
// O "aparelho" falso responde por paginas (mais antigas que o ponto pedido). Tamanho: HEIMDALL_CARGA_MENSAGENS_LLM (padrao 6000).
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from '../../apps/core/src/db.ts';
import { criarEscuta, type Escuta } from '../../apps/core/src/whatsapp/escuta.ts';
import type { MensagemBaileys } from '../../apps/core/src/whatsapp/traduzir.ts';
import { gravarEstado } from '../../apps/core/src/whatsapp/estado.ts';
import { pegarProximo } from '../../apps/core/src/fila.ts';
import { agendarExtracao, diasDeExtracaoPendentes, processarExtrair } from '../../apps/core/src/extracao.ts';
import { gravarConfigHistorico, resumoHistoricoAntigo } from '../../apps/core/src/historico-antigo.ts';
import { diaLocal } from '../../apps/core/src/calendario.ts';
import { iniciarHistoricoAntigo, type SockHistorico } from '../../apps/listener/src/historico-antigo.ts';
import { gerarHistorico, emLotes, DONO, AGORA } from './gerador.ts';

const N = Number(process.env.HEIMDALL_CARGA_MENSAGENS_LLM ?? 6000);
const DIA = 86_400;
const clientes = Math.max(10, Math.floor(N / 40));

function recentes(): Banco {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => AGORA });
  for (const l of emLotes(gerarHistorico({ mensagens: N, clientes, dias: 60, semente: 1 }), 500)) escuta.mensagens(l, 'historico');
  for (const c of db.prepare('SELECT DISTINCT contato_id AS id FROM contato_jids').all() as { id: number }[]) {
    const k = Number(db.prepare('INSERT INTO clientes (nome) VALUES (?)').run(`Cliente ${c.id}`).lastInsertRowid);
    db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = ?").run(k, c.id);
  }
  gravarEstado(db, { estado: 'conectado', dono: DONO }, AGORA);
  return db;
}
// mensagens antigas (de outras datas): deslocadas `dias` para tras, ids novos ('V...') para nao colidir com as recentes
function antigas(dias: number, quantas = Math.floor(N / 2), semente = 5): MensagemBaileys[] {
  return gerarHistorico({ mensagens: quantas, clientes, dias: 60, semente }).filter((m) => !(m.key.remoteJid ?? '').endsWith('@g.us') && !(m.key.remoteJid ?? '').startsWith('5511900000000'))
    .map((m) => ({ ...m, key: { ...m.key, id: `V${m.key.id}` }, messageTimestamp: Number(m.messageTimestamp) - dias * DIA }));
}
function aparelho(escuta: Escuta, historia: MensagemBaileys[]) {
  const porConversa = new Map<string, MensagemBaileys[]>();
  for (const m of historia) { const j = m.key.remoteJid!; (porConversa.get(j) ?? porConversa.set(j, []).get(j)!).push(m); }
  for (const l of porConversa.values()) l.sort((a, b) => Number(b.messageTimestamp) - Number(a.messageTimestamp)); // mais novas primeiro
  const chamadas: string[] = [];
  const sock: SockHistorico = { fetchMessageHistory: async (count, key, tsMs) => {
    chamadas.push(`${key.remoteJid}|${tsMs}`);
    const pagina = (porConversa.get(key.remoteJid) ?? []).filter((m) => Number(m.messageTimestamp) * 1000 < tsMs).slice(0, count);
    if (pagina.length > 0) escuta.mensagens(pagina, 'historico'); // chega como messaging-history.set (ON_DEMAND)
    return 'id';
  } };
  return { sock, chamadas };
}
async function puxarTudo(db: Banco, sock: SockHistorico, paradaApos = Infinity): Promise<number> {
  let passos = 0; let h: ReturnType<typeof iniciarHistoricoAntigo>;
  const pronto = () => { const r = resumoHistoricoAntigo(db); return r.conversas > 0 && r.pendentes + r.emAndamento === 0; };
  h = iniciarHistoricoAntigo({ banco: db, sock: () => sock, agora: () => AGORA, esperar: async () => { passos++; if (passos >= paradaApos || pronto()) h.parar(); } });
  await h.terminou; return passos;
}
const extrairTudo = async (db: Banco) => {
  for (let j = pegarProximo(db, ['extrair'], AGORA); j; j = pegarProximo(db, ['extrair'], AGORA)) await processarExtrair(db, j, { extrair: async () => '{}' }, 'REGRAS', AGORA);
};

test(`historico antigo: chega DEPOIS da extracao dos dias recentes -> so dias novos geram trabalho; o dia ja extraido que mudou e CONTADO antes e refeito`, async () => {
  const db = recentes();
  agendarExtracao(db, AGORA); await extrairTudo(db);
  assert.equal(diasDeExtracaoPendentes(db, AGORA).refs.length, 0, 'ponto de partida: tudo extraido');
  const extraidosAntes = contar(db, 'sync_hindsight');
  const escuta = criarEscuta(db, DONO, { agora: () => AGORA });
  const velhas = antigas(70); // 70 dias para tras: nenhuma cai nos dias ja extraidos (60 dias)
  const atrasadas = antigas(0, 200, 9).map((m) => ({ ...m, key: { ...m.key, id: `L${m.key.id}` } })); // chegam tarde, mas sao de dias recentes ja extraidos
  const ap = aparelho(escuta, [...velhas, ...atrasadas]);
  gravarConfigHistorico(db, { liberado: true, ritmoMs: 5_000, esperaRespostaMs: 1_000, tamanhoPagina: 50 });
  await puxarTudo(db, ap.sock);
  const r = resumoHistoricoAntigo(db);
  console.log(`    [medida] pedidos ${r.pedidos}, conversas ${r.conversas} (concluidas ${r.concluidas}, esgotadas ${r.esgotadas}), mensagens novas ${r.novas}`);
  assert.ok(r.novas > 0 && r.concluidas > 0);
  const conta = diasDeExtracaoPendentes(db, AGORA);
  // contas independentes: dias (conversa, dia) tocados pelas atrasadas que ja existiam extraidos
  // O aparelho so devolve mensagens MAIS ANTIGAS que a mais antiga guardada: so as atrasadas que de fato entraram contam (ids "LV...").
  const jaExtraidos = new Set((db.prepare("SELECT referencia AS r FROM sync_hindsight WHERE tipo = 'ext'").all() as { r: string }[]).map((x) => x.r));
  const entradas = db.prepare("SELECT conversa_id AS c, enviada_em AS t FROM mensagens WHERE wa_msg_id LIKE 'LV%'").all() as { c: number; t: number }[];
  const esperadoRefeitos = new Set(entradas.map((m) => `ext:${m.c}:${diaLocal(m.t)}`).filter((r) => jaExtraidos.has(r)));
  assert.ok(esperadoRefeitos.size > 0, 'o cenario precisa ter pelo menos um dia ja extraido que mudou');
  assert.equal(conta.refeitos, esperadoRefeitos.size, 'refeitos contados = dias ja extraidos tocados pelas mensagens tardias');
  assert.ok(conta.novos > 0, 'os dias antigos sao novos');
  const antesDaFila = contar(db, 'fila');
  const enfileirados = agendarExtracao(db, AGORA);
  assert.equal(enfileirados.length, conta.novos + conta.refeitos, 'o que foi contado e o que e enfileirado');
  assert.ok(contar(db, 'fila') >= antesDaFila);
  await extrairTudo(db);
  assert.equal(contar(db, 'sync_hindsight') - extraidosAntes, conta.novos, 'dias antigos extraidos uma vez; os refeitos so atualizam o que existia');
});

test('historico antigo: a mesma resposta chega duas vezes -> 0 mensagens duplicadas e nenhum dia volta a ser extraido', async () => {
  const db = recentes();
  const escuta = criarEscuta(db, DONO, { agora: () => AGORA });
  const velhas = antigas(70);
  gravarConfigHistorico(db, { liberado: true, ritmoMs: 5_000, esperaRespostaMs: 1_000 });
  await puxarTudo(db, aparelho(escuta, velhas).sock);
  const msgs = contar(db, 'mensagens');
  agendarExtracao(db, AGORA); await extrairTudo(db);
  const sync = contar(db, 'sync_hindsight');
  escuta.mensagens(velhas, 'historico'); // o aparelho reenvia tudo (resposta repetida/sobreposta)
  escuta.mensagens(velhas.slice(0, 100), 'historico');
  assert.equal(contar(db, 'mensagens'), msgs, '0 duplicadas');
  assert.deepEqual(diasDeExtracaoPendentes(db, AGORA).refs, [], 'nenhum dia volta a ser extraido');
  assert.equal(agendarExtracao(db, AGORA).length, 0);
  assert.equal(contar(db, 'sync_hindsight'), sync);
});

test('historico antigo: queda no meio -> continua de onde parou e faz exatamente os mesmos pedidos de uma execucao sem queda (nenhum repetido)', async () => {
  const velhas = antigas(70, Math.min(N, 2000));
  const executar = async (parada: number | null): Promise<string[]> => {
    const db = recentes(); const escuta = criarEscuta(db, DONO, { agora: () => AGORA }); const ap = aparelho(escuta, velhas);
    gravarConfigHistorico(db, { liberado: true, ritmoMs: 5_000, esperaRespostaMs: 1_000 });
    if (parada === null) { await puxarTudo(db, ap.sock); return ap.chamadas; }
    await puxarTudo(db, ap.sock, parada);                 // o processo "cai" aqui
    const meio = resumoHistoricoAntigo(db);
    assert.ok(meio.pedidos > 0 && meio.pendentes + meio.emAndamento > 0, 'caiu no meio de verdade');
    await puxarTudo(db, ap.sock);                           // sobe de novo, mesmo acervo
    assert.equal(resumoHistoricoAntigo(db).pendentes + resumoHistoricoAntigo(db).emAndamento, 0);
    return ap.chamadas;
  };
  const limpa = await executar(null); const comQueda = await executar(60);
  assert.equal(comQueda.length, limpa.length, 'mesmo numero de pedidos: nada repetido, nada pulado');
  assert.deepEqual([...comQueda].sort(), [...limpa].sort());
});
