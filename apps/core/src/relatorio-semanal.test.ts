// Relatorio semanal (segunda 08:00, cobre a semana anterior inteira; prompts/relatorios/semanal.md). Dados sinteticos; tudo calculado em codigo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { registrarMensagem } from './ingestao.ts';
import { montarPacoteSemanal, renderizarSemanal, caberSemanal, tituloSemanal, type PacoteSemanal } from './relatorio-semanal.ts';
import { contarPalavras, MAX_PALAVRAS_SEMANAL } from './relatorio.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net' };
const ISO = (s: string) => Date.parse(s);
// Segunda-feira 26/10/2026, 08:00 em Sao Paulo: a semana coberta e 19/10 (seg) a 25/10 (dom).
const AGORA = ISO('2026-10-26T11:00:00Z');
const J = (n: number) => `5511911110${String(n).padStart(3, '0')}@s.whatsapp.net`;

function banco(): Banco {
  const db = abrirBanco(); migrar(db);
  const nomes = ['Alfa', 'Beta', 'Gama', 'Delta', 'Epsilon'];
  nomes.forEach((nome, i) => {
    const id = i + 1;
    db.prepare('INSERT INTO clientes (id, nome) VALUES (?, ?)').run(id, nome);
    registrarMensagem(db, { waMsgId: `x${id}`, remoteJid: J(id), fromMe: false, quandoMs: 1, tipo: 'texto', texto: 'oi', origem: 'historico' }, DONO);
    db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(id, J(id));
    db.prepare('DELETE FROM mensagens WHERE wa_msg_id = ?').run(`x${id}`);
  });
  return db;
}
let n = 0;
const msg = (db: Banco, id: number, quando: string, deMim: boolean, tipo: 'texto' | 'audio' | 'pdf' = 'texto') =>
  registrarMensagem(db, { waMsgId: `m${++n}`, remoteJid: J(id), fromMe: deMim, quandoMs: ISO(quando), tipo, texto: tipo === 'texto' ? 't' : undefined, origem: 'notify' }, DONO);

function semana(): Banco {
  const db = banco();
  msg(db, 1, '2026-10-20T14:00:00Z', false); // Alfa: cliente escreveu na terca e ficou sem resposta
  msg(db, 2, '2026-10-20T14:00:00Z', false); msg(db, 2, '2026-10-21T14:00:00Z', true); msg(db, 2, '2026-10-22T14:00:00Z', false); msg(db, 2, '2026-10-22T18:00:00Z', true); // Beta: conversa andou
  msg(db, 3, '2026-10-10T14:00:00Z', false); msg(db, 3, '2026-10-12T14:00:00Z', true); // Gama: parada desde antes da semana, follow-up vencido
  msg(db, 4, '2026-10-21T14:00:00Z', true); // Delta: abordado, nunca respondeu
  msg(db, 5, '2026-08-03T14:00:00Z', false); // Epsilon: respondeu uma vez e depois 7 tentativas sem retorno
  for (let i = 0; i < 7; i++) msg(db, 5, new Date(ISO('2026-08-05T14:00:00Z') + i * 7 * 86_400_000).toISOString(), true); // uma tentativa por semana: 7 tentativas
  return db;
}

test('titulo: semana de segunda a domingo anteriores, no fuso de Sao Paulo', () => {
  assert.equal(tituloSemanal(AGORA), 'Semanal — semana de 19/10 a 25/10');
  assert.equal(tituloSemanal(ISO('2026-11-02T11:00:00Z')), 'Semanal — semana de 26/10 a 01/11');
});

test('pacote: aguardando, evolucao por cliente e contagens vem do codigo, nao do modelo', () => {
  const p = montarPacoteSemanal(semana(), AGORA);
  assert.deepEqual(p.aguardando.map((x) => [x.codigo, x.cliente]), [['A1', 'Alfa']]);
  assert.deepEqual(p.evolucao.avancaram, ['Beta']);
  assert.deepEqual(p.evolucao.estagnados, ['Gama']);
  assert.deepEqual(p.evolucao.desconsiderados, ['Epsilon']);
  assert.equal(p.evolucao.nuncaResponderam, 1);
  assert.match(p.resumo, /1 cliente\(s\) aguardam/);
});

test('numeros: so a semana anterior inteira (seg 19/10 a dom 25/10); tipos contados', () => {
  const db = semana();
  msg(db, 1, '2026-10-19T03:00:01Z', false, 'audio'); // seg 00:00:01 em SP: dentro
  msg(db, 1, '2026-10-19T02:59:00Z', false, 'pdf'); // domingo 23:59 em SP da semana anterior: fora
  msg(db, 1, '2026-10-26T03:00:00Z', false); // segunda 26/10 00:00 SP: fora (semana atual)
  const p = montarPacoteSemanal(db, AGORA);
  assert.equal(p.numeros.audios, 1); assert.equal(p.numeros.pdfs, 0);
  assert.equal(p.numeros.mensagens, 7, 'Alfa 1 + audio 1 + Beta 4 + Delta 1');
});

test('potencial da semana, reunioes e compromissos da proxima semana e de hoje', () => {
  const db = semana();
  db.prepare("INSERT INTO sinais_potencial (cliente_id, tipo, em) VALUES (1, 'pediu_proposta', ?), (2, 'perguntou_preco', ?)").run(ISO('2026-10-21T15:00:00Z'), ISO('2026-10-10T15:00:00Z'));
  db.prepare("INSERT INTO compromissos (cliente_id, tipo, titulo, data_hora, estado) VALUES (1, 'reuniao', 'Reuniao com a Alfa', '2026-10-22T14:00:00Z', 'realizado'), (2, 'reuniao', 'Reuniao com a Beta', '2026-10-28T14:00:00Z', 'marcado'), (3, 'retorno', 'Ligar para a Gama', '2026-10-26T14:00:00Z', 'marcado'), (4, 'retorno', 'Antigo da Delta', '2026-10-15T14:00:00Z', 'marcado')").run();
  const p = montarPacoteSemanal(db, AGORA);
  assert.deepEqual(p.potencial.map((x) => [x.codigo, x.cliente]), [['P1', 'Alfa']]);
  assert.deepEqual(p.reunioes.semTranscricao, ['Reuniao com a Alfa']);
  assert.equal(p.reunioes.realizadas, 1);
  assert.deepEqual(p.reunioes.proximas, ['Reuniao com a Beta']);
  assert.deepEqual(p.hoje, ['Antigo da Delta (atrasado desde 15/10)', 'Ligar para a Gama (hoje)']); // atrasados primeiro
  assert.ok(p.compromissos.some((c) => c.includes('Reuniao com a Beta')));
});

test('renderizar: ordem fixa do esqueleto, secoes vazias omitidas, rodape da semana', () => {
  const md = renderizarSemanal(montarPacoteSemanal(semana(), AGORA));
  assert.match(md, /^# Semanal — semana de 19\/10 a 25\/10\n/);
  const titulos = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(titulos, ['Aguardando você', 'Evolução por cliente']);
  assert.match(md, /- Avançaram: Beta/); assert.match(md, /- Estagnados: Gama/); assert.match(md, /- Desconsiderados \(7 tentativas\): Epsilon/); assert.match(md, /- Abordados que nunca responderam: 1/);
  assert.match(md, /_Semana: 6 mensagens, 0 áudios, 0 PDFs, 0 falhas\._\n$/);
});

test('cabe em uma tela: corta o de menor prioridade ate ficar em 450 palavras, sem deixar menos de 3 em "Aguardando"', () => {
  const muitos = Array.from({ length: 60 }, (_, i) => ({ codigo: `A${i + 1}`, cliente: `Cliente numero ${i + 1}`, texto: 'espera há 3 dias', motivo: 'ultima mensagem do cliente sem resposta sua' }));
  const grande: PacoteSemanal = { ...montarPacoteSemanal(semana(), AGORA), aguardando: muitos, potencial: muitos.map((m) => ({ ...m, codigo: m.codigo.replace('A', 'P') })) };
  assert.ok(contarPalavras(renderizarSemanal(grande)) > MAX_PALAVRAS_SEMANAL);
  const curto = caberSemanal(grande);
  assert.ok(contarPalavras(renderizarSemanal(curto)) <= MAX_PALAVRAS_SEMANAL);
  assert.ok(curto.aguardando.length >= 3);
  assert.ok(curto.semNovidade > 0);
});

test('o pacote traz o id do cliente de cada item (para as correcoes por codigo A1/F1/P1 funcionarem)', () => {
  const p = montarPacoteSemanal(semana(), AGORA);
  assert.equal(p.aguardando[0]!.clienteId, 1);
});

test('quem so recebeu mensagem SUA na semana nao "avancou": avancar e o cliente ter respondido', () => {
  const db = banco();
  msg(db, 3, '2026-10-10T14:00:00Z', false); // Gama respondeu antes da semana
  msg(db, 3, '2026-10-20T14:00:00Z', true); // e so voce escreveu na semana
  const p = montarPacoteSemanal(db, AGORA);
  assert.deepEqual(p.evolucao.avancaram, []);
  assert.deepEqual(p.evolucao.estagnados, []);
  assert.equal(p.semNovidade, 1);
});

test('"Aguardando voce" nunca fica com menos de 3 itens, mesmo que o relatorio estoure o limite (o chamador ve e decide)', () => {
  const longo = 'palavra '.repeat(200).trim();
  const tres = [1, 2, 3].map((i) => ({ codigo: `A${i}`, cliente: `C${i}`, texto: 'espera', motivo: longo }));
  const curto = caberSemanal({ ...montarPacoteSemanal(banco(), AGORA), aguardando: tres });
  assert.equal(curto.aguardando.length, 3);
  assert.ok(contarPalavras(renderizarSemanal(curto)) > MAX_PALAVRAS_SEMANAL);
});
