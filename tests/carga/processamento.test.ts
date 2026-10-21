// Carga e RESSINCRONIZACAO do processamento pelo modelo: extracao de compromissos (LLM) e envio da memoria (Hindsight). Dados sinteticos;
// o modelo e o Hindsight sao PORTAS FALSAS que falham de proposito (fora do ar, resposta invalida, falha definitiva). Relogio simulado: as esperas
// de 1 min a 2 h entre tentativas nao demoram de verdade. Tamanho: HEIMDALL_CARGA_MENSAGENS_LLM (padrao 6000).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { abrirBanco, migrar, contar, type Banco } from '../../apps/core/src/db.ts';
import { criarEscuta } from '../../apps/core/src/whatsapp/escuta.ts';
import { haProntos, pegarProximo, recuperarTravados, MAX_TENTATIVAS, type TipoTrabalho, type Trabalho } from '../../apps/core/src/fila.ts';
import { agendarExtracao, processarExtrair, type PortaExtracao } from '../../apps/core/src/extracao.ts';
import { agendarRetain, processarRetain, type PortaMemoria, type ItemRetain } from '../../apps/core/src/memoria.ts';
import { FalhaDefinitiva } from '../../apps/core/src/midia.ts';
import { gerarHistorico, emLotes, DONO, AGORA } from './gerador.ts';

const N = Number(process.env.HEIMDALL_CARGA_MENSAGENS_LLM ?? 6000);
const pct = (ref: string): number => parseInt(createHash('md5').update(ref).digest('hex').slice(0, 6), 16) % 100;

function acervo(): Banco {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => AGORA });
  for (const l of emLotes(gerarHistorico({ mensagens: N, clientes: Math.max(10, Math.floor(N / 30)) }), 500)) escuta.mensagens(l, 'historico');
  for (const c of db.prepare('SELECT DISTINCT contato_id AS id FROM contato_jids').all() as { id: number }[]) {
    const k = Number(db.prepare('INSERT INTO clientes (nome) VALUES (?)').run(`Cliente ${c.id}`).lastInsertRowid);
    db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = ?").run(k, c.id);
  }
  return db;
}

// A fila tambem guarda os downloads de audio/PDF do historico: o resumo e SEMPRE de um tipo so.
function resumoTipo(db: Banco, tipo: TipoTrabalho): Record<string, number> {
  const r: Record<string, number> = { pendente: 0, em_andamento: 0, ok: 0, erro: 0, abandonada: 0 };
  for (const l of db.prepare('SELECT estado, COUNT(*) AS n FROM fila WHERE tipo = ? GROUP BY estado').all(tipo) as { estado: string; n: number }[]) r[l.estado] = l.n;
  return r;
}

// Roda a fila ate acabar, com relogio simulado: quando so sobra trabalho com espera, o relogio pula para a hora dele.
async function drenar(db: Banco, tipo: TipoTrabalho, processar: (j: Trabalho, agora: number) => Promise<unknown>, inicio = AGORA): Promise<{ agora: number; rodados: number }> {
  let agora = inicio; let rodados = 0;
  for (let guarda = 0; guarda < 200_000; guarda++) {
    const job = pegarProximo(db, [tipo], agora);
    if (!job) {
      const prox = db.prepare("SELECT MIN(proximo_em) AS t FROM fila WHERE estado = 'pendente' AND tipo = ?").get(tipo) as { t: number | null };
      if (prox.t === null) return { agora, rodados };
      agora = Math.max(agora, prox.t); continue;
    }
    await processar(job, agora); rodados++;
  }
  throw new Error('a fila nao acabou: laco infinito de tentativas');
}

// ---------------- extracao de compromissos (modelo) ----------------
function modeloInstavel(chamadas: Map<string, number>): PortaExtracao {
  return {
    async extrair(pedido, sessao) {
      const ref = sessao.replace('heimdall:extracao:', '');
      const n = (chamadas.get(ref) ?? 0) + 1; chamadas.set(ref, n);
      const p = pct(ref);
      if (p < 3) return 'isto nao e JSON'; // sempre invalido: tem de ser abandonado depois de MAX_TENTATIVAS
      if (p < 18 && n <= 2) throw new Error('modelo fora do ar'); // cai duas vezes e volta
      if (p < 28 && n === 1) return 'lixo antes do JSON'; // resposta invalida uma vez
      const id = Number(/\[#(\d+)\]/.exec(pedido)![1]);
      return JSON.stringify({ compromissos: [{ acao: 'novo', tipo: 'retorno', titulo: `Retorno ${ref}`, data_hora: '2026-10-25', mensagem_origem: id, confianca: 0.9, motivo: 'combinado' }], sinais_potencial: [], aguardando_resposta_do_dono: null, duvidas: [] });
    }
  };
}

test(`extracao: ${N} mensagens -> um trabalho por conversa/dia; modelo que cai, responde lixo ou nunca acerta: tudo termina e nada duplica`, async () => {
  const db = acervo();
  const t0 = performance.now();
  const refs = agendarExtracao(db, AGORA);
  const msAgendar = performance.now() - t0;
  assert.ok(refs.length > 100, `poucos trabalhos: ${refs.length}`);
  const chamadas = new Map<string, number>(); const porta = modeloInstavel(chamadas);
  const t1 = performance.now();
  const { rodados } = await drenar(db, 'extrair', (j, agora) => processarExtrair(db, j, porta, 'REGRAS', agora));
  const ms = performance.now() - t1;
  const f = resumoTipo(db, 'extrair');
  const permanentes = refs.filter((r) => pct(r) < 3);
  console.log(`    [medida] ${refs.length} trabalhos (agendar ${Math.round(msAgendar)} ms); ${rodados} execucoes em ${(ms / 1000).toFixed(1)} s; fila ${JSON.stringify(f)}; compromissos ${contar(db, 'compromissos')}`);
  assert.equal(f.pendente + f.em_andamento, 0, 'nada ficou pendente');
  assert.equal(f.abandonada, permanentes.length, 'so abandona o que o modelo nunca acertou');
  assert.equal(f.ok, refs.length - permanentes.length);
  for (const r of permanentes) assert.equal(chamadas.get(r), MAX_TENTATIVAS, 'tenta exatamente o maximo, nao mais');
  assert.equal(contar(db, 'compromissos'), f.ok, 'um compromisso por dia concluido: nenhuma repeticao por causa de tentativas');
  assert.equal(contar(db, 'sync_hindsight'), f.ok);
  // Um dia que o modelo atendeu so na 3a tentativa foi chamado 3 vezes, nao mais
  const terceira = refs.find((r) => pct(r) >= 3 && pct(r) < 18)!;
  assert.equal(chamadas.get(terceira), 3);
});

test('extracao: depois de tudo pronto, rodar o agendamento de novo nao refaz nada (nem o que o modelo ja desistiu de acertar)', async () => {
  const db = acervo();
  const refs = agendarExtracao(db, AGORA);
  const porta = modeloInstavel(new Map());
  const { agora } = await drenar(db, 'extrair', (j, a) => processarExtrair(db, j, porta, 'REGRAS', a));
  const de_novo = agendarExtracao(db, agora);
  const abandonadas = refs.filter((r) => pct(r) < 3).length;
  assert.equal(de_novo.length, 0, `${de_novo.length} trabalhos voltaram para a fila sem o conteudo mudar (${abandonadas} abandonados): cada um gasta uma consulta ao modelo, para sempre`);
});

test('extracao: ressincronizacao apos queda: trabalhos "em andamento" sem dono voltam, terminam e nao duplicam compromissos', async () => {
  const db = acervo();
  agendarExtracao(db, AGORA);
  const porta = modeloInstavel(new Map());
  const presos: Trabalho[] = [];
  for (let i = 0; i < 25; i++) { const j = pegarProximo(db, ['extrair'], AGORA); if (j) presos.push(j); } // "o processo caiu com 25 em andamento"
  assert.equal(resumoTipo(db, 'extrair').em_andamento, 25);
  assert.equal(recuperarTravados(db, AGORA + 60_000, 30 * 60_000), 0, 'ainda dentro do prazo: nao mexe');
  assert.equal(recuperarTravados(db, AGORA + 31 * 60_000, 30 * 60_000), 25, 'passou do prazo: voltam para a fila');
  const { rodados } = await drenar(db, 'extrair', (j, a) => processarExtrair(db, j, porta, 'REGRAS', a), AGORA + 31 * 60_000);
  const f = resumoTipo(db, 'extrair');
  assert.ok(rodados > 0);
  assert.equal(f.em_andamento + f.pendente, 0);
  assert.equal(contar(db, 'compromissos'), f.ok);
});

test('extracao: rodar duas vezes o MESMO trabalho (retomada depois de queda no meio da gravacao) nao duplica nada', async () => {
  const db = acervo();
  agendarExtracao(db, AGORA);
  const porta = modeloInstavel(new Map());
  let j1 = pegarProximo(db, ['extrair'], AGORA)!;
  while (pct(j1.referencia) < 28) j1 = pegarProximo(db, ['extrair'], AGORA)!; // um dia que o modelo atende de primeira
  await processarExtrair(db, j1, porta, 'REGRAS', AGORA);
  const antes = contar(db, 'compromissos');
  await processarExtrair(db, { ...j1 }, porta, 'REGRAS', AGORA + 1000);
  assert.equal(contar(db, 'compromissos'), antes);
});

test('extracao: mensagem editada depois da extracao -> so aquele dia volta a ser extraido', async () => {
  const db = acervo();
  agendarExtracao(db, AGORA);
  const porta = modeloInstavel(new Map());
  const { agora } = await drenar(db, 'extrair', (j, a) => processarExtrair(db, j, porta, 'REGRAS', a));
  const m = db.prepare("SELECT m.id AS id, m.conversa_id AS c, m.enviada_em AS t FROM mensagens m JOIN sync_hindsight s ON s.tipo = 'ext' AND s.referencia LIKE 'ext:' || m.conversa_id || ':%' WHERE m.tipo = 'texto' AND m.texto IS NOT NULL LIMIT 1").get() as { id: number; c: number; t: number };
  db.prepare("UPDATE mensagens SET texto = 'texto corrigido pelo cliente', estado = 'editada' WHERE id = ?").run(m.id);
  const de_novo = agendarExtracao(db, agora);
  assert.equal(de_novo.length, 1, `esperava so o dia editado, voltaram ${de_novo.length}`);
  assert.match(de_novo[0]!, new RegExp(`^ext:${m.c}:`));
});

// ---------------- memoria (Hindsight) ----------------
function hindsightInstavel(recebidos: ItemRetain[], chamadas: Map<string, number>): PortaMemoria {
  return {
    async reter(item) {
      const n = (chamadas.get(item.documentId) ?? 0) + 1; chamadas.set(item.documentId, n);
      const p = pct(item.documentId);
      if (p < 2) throw new FalhaDefinitiva('conteudo_recusado'); // definitivo: abandona na hora
      if (p < 20 && n <= 2) throw new Error('hindsight fora do ar'); // volta depois
      recebidos.push(item);
    }
  };
}

test(`memoria: ${N} mensagens -> um documento por conversa/dia; Hindsight que cai ou recusa: tudo termina, sem reenviar o que ja foi`, async () => {
  const db = acervo();
  const t0 = performance.now(); const ids = agendarRetain(db, AGORA); const msAgendar = performance.now() - t0;
  assert.ok(ids.length > 100);
  const recebidos: ItemRetain[] = []; const chamadas = new Map<string, number>(); const porta = hindsightInstavel(recebidos, chamadas);
  const t1 = performance.now();
  await drenar(db, 'retain', (j, a) => processarRetain(db, j, porta, a));
  const f = resumoTipo(db, 'retain'); const definitivos = ids.filter((i) => pct(i) < 2);
  console.log(`    [medida] ${ids.length} documentos (agendar ${Math.round(msAgendar)} ms); envio em ${((performance.now() - t1) / 1000).toFixed(1)} s; fila ${JSON.stringify(f)}`);
  assert.equal(f.pendente + f.em_andamento, 0);
  assert.equal(f.abandonada, definitivos.length);
  assert.equal(f.ok, ids.length - definitivos.length);
  for (const i of definitivos) assert.equal(chamadas.get(i), 1, 'falha definitiva nao e repetida');
  assert.equal(new Set(recebidos.map((r) => r.documentId)).size, recebidos.length, 'cada documento chegou ao Hindsight uma vez so');
});

test('memoria: ressincronizacao com o Hindsight: se o Hindsight perdeu tudo (ou metade), so o que falta e reenviado, com os MESMOS ids', async () => {
  const db = acervo();
  const ids = agendarRetain(db, AGORA);
  const ok: ItemRetain[] = []; const porta: PortaMemoria = { reter: async (i) => { ok.push(i); } };
  const { agora } = await drenar(db, 'retain', (j, a) => processarRetain(db, j, porta, a));
  assert.equal(ok.length, ids.length);
  assert.deepEqual(agendarRetain(db, agora), [], 'nada mudou: nada a reenviar');
  const metade = ids.filter((_, i) => i % 2 === 0);
  for (const id of metade) db.prepare("DELETE FROM sync_hindsight WHERE tipo = 'conv' AND referencia = ?").run(id); // "o Hindsight perdeu estes"
  const de_novo = agendarRetain(db, agora);
  assert.deepEqual([...de_novo].sort(), [...metade].sort());
  const reenviados: string[] = [];
  await drenar(db, 'retain', (j, a) => processarRetain(db, j, { reter: async (i) => { reenviados.push(i.documentId); } }, a), agora);
  assert.deepEqual([...reenviados].sort(), [...metade].sort());
});

test('memoria: retomada depois de queda: trabalhos em andamento sem dono voltam e terminam; o agendador so varre quando a fila esvazia', async () => {
  const db = acervo();
  agendarRetain(db, AGORA);
  for (let i = 0; i < 40; i++) pegarProximo(db, ['retain'], AGORA);
  assert.equal(haProntos(db, ['retain'], AGORA), true, 'ainda ha trabalho pronto: nao precisa varrer o acervo');
  assert.equal(recuperarTravados(db, AGORA + 31 * 60_000, 30 * 60_000), 40);
  const enviados: string[] = [];
  await drenar(db, 'retain', (j, a) => processarRetain(db, j, { reter: async (i) => { enviados.push(i.documentId); } }, a), AGORA + 31 * 60_000);
  assert.equal(new Set(enviados).size, enviados.length, 'nenhum documento enviado duas vezes');
  assert.equal(resumoTipo(db, 'retain').pendente + resumoTipo(db, 'retain').em_andamento, 0);
});

test('memoria: o que o Hindsight recusou de vez nao volta para a fila a cada varredura (so volta se a conversa mudar)', async () => {
  const db = acervo();
  const ids = agendarRetain(db, AGORA);
  const porta = hindsightInstavel([], new Map());
  const { agora } = await drenar(db, 'retain', (j, a) => processarRetain(db, j, porta, a));
  const recusados = ids.filter((i) => pct(i) < 2);
  assert.ok(recusados.length > 0);
  assert.equal(agendarRetain(db, agora).length, 0, 'documentos recusados voltaram a ser enviados sem a conversa ter mudado');
  const alvo = recusados[0]!;
  const conversa = Number(alvo.split(':')[1]);
  db.prepare("UPDATE mensagens SET texto = 'texto novo' WHERE id = (SELECT MIN(id) FROM mensagens WHERE conversa_id = ? AND texto IS NOT NULL)").run(conversa);
  const voltaram = agendarRetain(db, agora);
  assert.ok(voltaram.some((r) => r.startsWith(`conv:${conversa}:`)), 'a conversa que mudou volta a ser enviada');
  assert.ok(voltaram.length <= 2, `so as conversas alteradas voltam, voltaram ${voltaram.length}`);
});
