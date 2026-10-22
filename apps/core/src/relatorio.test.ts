import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { abrirBanco, migrar, type Banco } from './db.ts';
import { registrarMensagem } from './ingestao.ts';
import { renderizarDiario, caberEmUmaTela, contarPalavras, montarPacoteDiario, aplicarAjustes, secoesDoTexto, ORDEM_SECOES, tituloDiario, MAX_PALAVRAS_DIARIO, type PacoteDiario, type Item } from './relatorio.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net' };
// Quarta-feira 21/10/2026, 08:00 em Sao Paulo
const AGORA = Date.parse('2026-10-21T11:00:00Z');
const ISO = (s: string) => Date.parse(s);

function item(codigo: string, cliente = 'Cliente'): Item {
  return { codigo, cliente, texto: 'espera ha 2 dias', motivo: 'ultima mensagem sem resposta' };
}
function pacoteBase(extra: Partial<PacoteDiario> = {}): PacoteDiario {
  return { tipo: 'diario', titulo: 'Diário — quarta-feira, 21/10', resumo: 'Resumo curto.', aguardando: [], hoje: [], followups: [], potencial: [], reunioes: [], pedro: [], novos: [], aprendizado: [], numeros: { mensagens: 42, audios: 3, pdfs: 1, falhas: 0 }, semNovidade: 0, ...extra };
}

test('titulo do diario usa o dia da semana e a data no fuso de Sao Paulo', () => {
  assert.equal(tituloDiario(AGORA), 'Diário — quarta-feira, 21/10');
  assert.equal(tituloDiario(ISO('2026-10-23T11:00:00Z')), 'Diário — sexta-feira, 23/10');
});

test('retrato (snapshot): pacote sintetico gera exatamente o texto esperado', () => {
  const p = pacoteBase({
    resumo: 'Metalúrgica Alfa espera resposta sua há 2 dias e pediu prazo. Comece pela Alfa.',
    aguardando: [{ codigo: 'A1', cliente: 'Metalúrgica Alfa', texto: 'espera há 2 dias', motivo: 'perguntou o prazo na segunda', rascunho: 'Carlos, te mando o cronograma hoje.' }],
    hoje: [{ codigo: 'F1', cliente: 'Gráfica Beta', texto: 'retorno combinado para hoje', motivo: 'pediu "me liga quarta"' }],
    potencial: [{ codigo: 'P1', cliente: 'Transportes Gama', texto: 'perguntou preço', motivo: 'sinal registrado no dia anterior' }],
    reunioes: ['Reunião com a Beta ocorreu ontem, ainda sem transcrição.'],
    pedro: ['Pediu o resumo da reunião com a Beta até sexta.'],
    aprendizado: ['Dúvida: o áudio da Alfa tinha ruído; entendi "30 dias". Confirma?']
  });
  const esperado = readFileSync(new URL('../fixtures/diario-esperado.md', import.meta.url), 'utf8');
  assert.equal(renderizarDiario(p), esperado);
});

test('secoes vazias nao aparecem e a ordem fixa e respeitada', () => {
  const md = renderizarDiario(pacoteBase({ potencial: [item('P1')], aguardando: [item('A1')], pedro: ['x'] }));
  assert.deepEqual(secoesDoTexto(md), ['Aguardando você', 'Potencial', 'Pedro']);
  const todas = renderizarDiario(pacoteBase({ aguardando: [item('A1')], hoje: [item('F1')], followups: [item('F2')], potencial: [item('P1')], reunioes: ['r'], pedro: ['p'], novos: ['n'], crm: [item('C1')], aprendizado: ['a'] }));
  assert.deepEqual(secoesDoTexto(todas), ORDEM_SECOES);
});

test('secao do CRM mostra a proposta, o motivo e a frase de aprovacao no self-chat', () => {
  const md = renderizarDiario(pacoteBase({ crm: [{ codigo: 'C1', cliente: 'Alfa', texto: 'criar lead em "Contato iniciado"', motivo: 'cliente respondeu e ainda nao tem lead' }], aprendizado: ['Dúvida curta'] }));
  assert.match(md, /## CRM/);
  assert.match(md, /\*\*C1\*\* Alfa/);
  assert.match(md, /ok 1 e 3/);
  assert.ok(secoesDoTexto(md).indexOf('CRM') < secoesDoTexto(md).indexOf('Aprendizado e dúvidas'));
});

test('"Aguardando você" e sempre a primeira secao', () => {
  const md = renderizarDiario(pacoteBase({ followups: [item('F1')], potencial: [item('P1')], aguardando: [item('A1')] }));
  assert.equal(secoesDoTexto(md)[0], 'Aguardando você');
});

test('toda recomendacao traz o motivo', () => {
  const md = renderizarDiario(pacoteBase({ aguardando: [item('A1')], followups: [item('F1')] }));
  assert.equal([...md.matchAll(/Motivo:/g)].length, 2);
});

test('relatorio gigante e cortado para caber em uma tela, com "+N sem novidade"', () => {
  const muitos = Array.from({ length: 40 }, (_, i) => item(`A${i + 1}`, `Empresa numero ${i + 1}`));
  const p = pacoteBase({ aguardando: muitos, followups: muitos.map((x) => ({ ...x, codigo: x.codigo.replace('A', 'F') })), potencial: muitos.slice(0, 10).map((x) => ({ ...x, codigo: x.codigo.replace('A', 'P') })) });
  assert.ok(contarPalavras(renderizarDiario(p)) > MAX_PALAVRAS_DIARIO);
  const curto = caberEmUmaTela(p);
  const md = renderizarDiario(curto);
  assert.ok(contarPalavras(md) <= MAX_PALAVRAS_DIARIO, `${contarPalavras(md)} palavras`);
  assert.ok(curto.semNovidade > 0);
  assert.match(md, /\+\d+ sem novidade/);
});

test('o corte tira primeiro o que e menos urgente e preserva pelo menos 3 itens de "Aguardando você"', () => {
  const muitos = Array.from({ length: 60 }, (_, i) => item(`A${i + 1}`, `Empresa ${i + 1}`));
  const curto = caberEmUmaTela(pacoteBase({ aguardando: muitos, potencial: [item('P1')], novos: ['n1', 'n2'] }));
  assert.equal(curto.novos.length, 0);
  assert.equal(curto.potencial.length, 0);
  assert.ok(curto.aguardando.length >= 3);
  assert.deepEqual(curto.aguardando.slice(0, 3).map((x) => x.codigo), ['A1', 'A2', 'A3']); // os mais antigos ficam
});

test('pacote que ja cabe nao e alterado', () => {
  const p = pacoteBase({ aguardando: [item('A1')] });
  assert.deepEqual(caberEmUmaTela(p), p);
});

test('caberEmUmaTela nao altera o pacote original', () => {
  const muitos = Array.from({ length: 60 }, (_, i) => item(`A${i + 1}`, `Empresa ${i + 1}`));
  const p = pacoteBase({ aguardando: muitos });
  caberEmUmaTela(p);
  assert.equal(p.aguardando.length, 60);
});

// ---- pacote montado a partir do banco ----
function bancoComClientes(): Banco {
  const db = abrirBanco(); migrar(db);
  const cria = (id: number, nome: string, jid: string) => {
    db.prepare('INSERT INTO clientes (id, nome) VALUES (?, ?)').run(id, nome);
    registrarMensagem(db, { waMsgId: `x${id}`, remoteJid: jid, fromMe: false, quandoMs: 1, tipo: 'texto', texto: 'oi', origem: 'historico' }, DONO);
    db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(id, jid);
    db.prepare("DELETE FROM mensagens WHERE wa_msg_id = ?").run(`x${id}`);
  };
  cria(1, 'Alfa', '5511911110001@s.whatsapp.net');
  cria(2, 'Beta', '5511911110002@s.whatsapp.net');
  cria(3, 'Gama', '5511911110003@s.whatsapp.net');
  cria(4, 'Delta', '5511911110004@s.whatsapp.net');
  return db;
}
const msg = (db: Banco, jid: string, id: string, quando: string, deMim: boolean) =>
  registrarMensagem(db, { waMsgId: id, remoteJid: jid, fromMe: deMim, quandoMs: ISO(quando), tipo: 'texto', texto: 't', origem: 'notify' }, DONO);

test('pacote do banco: aguardando ordenado por espera, follow-up devido e cliente em dia', () => {
  const db = bancoComClientes();
  msg(db, '5511911110001@s.whatsapp.net', 'a1', '2026-10-19T14:00:00Z', false); // Alfa: espera desde segunda (2 dias)
  msg(db, '5511911110002@s.whatsapp.net', 'b1', '2026-10-20T14:00:00Z', false); // Beta: espera desde terca (1 dia)
  msg(db, '5511911110003@s.whatsapp.net', 'g1', '2026-10-15T14:00:00Z', false);
  msg(db, '5511911110003@s.whatsapp.net', 'g2', '2026-10-16T14:00:00Z', true); // Gama: respondeu, voce seguiu a quinta; ja venceu
  msg(db, '5511911110004@s.whatsapp.net', 'd1', '2026-10-20T14:00:00Z', true); // Delta: so voce escreveu
  const p = montarPacoteDiario(db, AGORA);
  assert.deepEqual(p.aguardando.map((x) => [x.codigo, x.cliente]), [['A1', 'Alfa'], ['A2', 'Beta']]);
  assert.match(p.aguardando[0]!.texto, /2 dias/);
  assert.match(p.aguardando[1]!.texto, /1 dia$/);
  assert.deepEqual(p.followups.map((x) => [x.codigo, x.cliente]), [['F1', 'Gama']]);
  assert.deepEqual(p.aguardando.map((x) => x.clienteId), [1, 2], 'cada item carrega o id do cliente (as correcoes A1/F1/P1 dependem disso)');
  assert.equal(p.followups[0]!.clienteId, 3);
  assert.match(p.resumo, /2 cliente\(s\) aguardam/);
  assert.match(p.resumo, /Alfa/);
  assert.equal(p.semNovidade, 1); // Delta (nunca respondeu)
});

test('numeros do rodape vem do banco, na janela do dia anterior (terca 20/10)', () => {
  const db = bancoComClientes();
  msg(db, '5511911110001@s.whatsapp.net', 'dentro', '2026-10-20T14:00:00Z', false);
  msg(db, '5511911110001@s.whatsapp.net', 'fora', '2026-10-19T14:00:00Z', false);
  registrarMensagem(db, { waMsgId: 'aud', remoteJid: '5511911110001@s.whatsapp.net', fromMe: false, quandoMs: ISO('2026-10-20T15:00:00Z'), tipo: 'audio', origem: 'notify' }, DONO);
  const p = montarPacoteDiario(db, AGORA);
  assert.deepEqual(p.numeros, { mensagens: 2, audios: 1, pdfs: 0, falhas: 0 });
});

test('sinais de potencial do dia anterior viram itens P1..; os de outros dias nao', () => {
  const db = bancoComClientes();
  db.prepare("INSERT INTO sinais_potencial (cliente_id, tipo, em) VALUES (1, 'perguntou_preco', ?), (2, 'pediu_proposta', ?)").run(ISO('2026-10-20T15:00:00Z'), ISO('2026-10-10T15:00:00Z'));
  const p = montarPacoteDiario(db, AGORA);
  assert.deepEqual(p.potencial.map((x) => [x.codigo, x.cliente, x.texto]), [['P1', 'Alfa', 'perguntou preco']]);
});

test('ajuste "silenciar" esconde o cliente ate a data e depois volta', () => {
  const db = bancoComClientes();
  msg(db, '5511911110001@s.whatsapp.net', 'a1', '2026-10-19T14:00:00Z', false);
  db.prepare("INSERT INTO ajustes_cliente (cliente_id, tipo, ate_dia, criado_em) VALUES (1, 'silenciar', '2026-10-21', 1)").run();
  assert.equal(montarPacoteDiario(db, AGORA).aguardando.length, 0); // ate o proprio dia 21
  assert.equal(montarPacoteDiario(db, ISO('2026-10-22T11:00:00Z')).aguardando.length, 1); // dia 22 volta
});

test('ajuste "resolvido" esconde a pendencia, mas uma NOVA mensagem do cliente reabre', () => {
  const db = bancoComClientes();
  msg(db, '5511911110001@s.whatsapp.net', 'a1', '2026-10-19T14:00:00Z', false);
  db.prepare("INSERT INTO ajustes_cliente (cliente_id, tipo, criado_em) VALUES (1, 'resolvido', ?)").run(ISO('2026-10-20T12:00:00Z'));
  assert.equal(montarPacoteDiario(db, AGORA).aguardando.length, 0);
  msg(db, '5511911110001@s.whatsapp.net', 'a2', '2026-10-20T18:00:00Z', false);
  assert.equal(montarPacoteDiario(db, AGORA).aguardando.length, 1);
});

test('aplicarAjustes: funcao pura', () => {
  assert.equal(aplicarAjustes('follow_up_devido', null, [{ tipo: 'silenciar', ateDia: '2026-10-30', criadoEm: 0 }], '2026-10-21'), 'oculto');
  assert.equal(aplicarAjustes('follow_up_devido', null, [{ tipo: 'silenciar', ateDia: '2026-10-20', criadoEm: 0 }], '2026-10-21'), 'follow_up_devido');
  assert.equal(aplicarAjustes('ativo', null, [{ tipo: 'resolvido', ateDia: null, criadoEm: 5 }], '2026-10-21'), 'ativo'); // "resolvido" so age sobre aguardando
  assert.equal(aplicarAjustes('aguardando_usuario', 3, [], '2026-10-21'), 'aguardando_usuario');
});

test('contarPalavras', () => {
  assert.equal(contarPalavras(''), 0);
  assert.equal(contarPalavras('  um   dois\ntres '), 3);
});

test('plural do rodape: 1 PDF, 1 falha, 0 mensagens', () => {
  const md = renderizarDiario(pacoteBase({ numeros: { mensagens: 1, audios: 0, pdfs: 1, falhas: 1 } }));
  assert.match(md, /_Ontem: 1 mensagem, 0 áudios, 1 PDF, 1 falha\._/);
});

test('aguardando e ordenado pelo que espera ha MAIS tempo, mesmo quando esse cliente tem numero maior', () => {
  const db = bancoComClientes();
  msg(db, '5511911110001@s.whatsapp.net', 'a1', '2026-10-20T14:00:00Z', false); // Alfa (id 1): espera desde terca
  msg(db, '5511911110004@s.whatsapp.net', 'd1', '2026-10-17T14:00:00Z', false); // Delta (id 4): espera desde sabado (mais antigo)
  const p = montarPacoteDiario(db, AGORA);
  assert.deepEqual(p.aguardando.map((x) => [x.codigo, x.cliente]), [['A1', 'Delta'], ['A2', 'Alfa']]);
});

test('o corte nunca deixa menos de 3 itens em "Aguardando você", mesmo que a tela estoure', () => {
  const longo = 'palavra '.repeat(200).trim();
  const itens = Array.from({ length: 5 }, (_, i) => ({ ...item(`A${i + 1}`, `Empresa ${i + 1}`), rascunho: longo }));
  const curto = caberEmUmaTela(pacoteBase({ aguardando: itens }));
  assert.equal(curto.aguardando.length, 3);
  assert.deepEqual(curto.aguardando.map((x) => x.codigo), ['A1', 'A2', 'A3']);
  assert.equal(curto.semNovidade, 2);
});

test('pacote: compromissos vencidos ou de hoje viram "Hoje / atrasados" (H1...), os futuros e os cancelados ficam de fora; duvidas abertas viram "Aprendizado"', () => {
  const db = abrirBanco(); migrar(db);
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa'), (2, 'Beta')").run();
  db.prepare("UPDATE contatos SET cliente_id = 0 WHERE 0").run();
  for (const [i, id] of [1, 2].entries()) {
    db.prepare("INSERT INTO contatos (id, cliente_id, papel) VALUES (?, ?, 'cliente')").run(i + 1, id);
  }
  const ins = db.prepare('INSERT INTO compromissos (cliente_id, tipo, titulo, data_hora, estado) VALUES (?, ?, ?, ?, ?)');
  ins.run(1, 'proposta', 'Enviar proposta', '2026-10-20', 'marcado');       // atrasado
  ins.run(1, 'reuniao', 'Reuniao', '2026-10-21T14:00', 'marcado');          // hoje
  ins.run(2, 'retorno', 'Retornar', '2026-10-25', 'marcado');               // futuro
  ins.run(2, 'proposta', 'Cancelada', '2026-10-20', 'cancelado');           // cancelado
  ins.run(2, 'proposta', 'Cumprida', '2026-10-20', 'cumprido');             // cumprido
  for (const t of ['d1', 'd2', 'd3', 'd4']) db.prepare('INSERT INTO duvidas (cliente_id, texto, criada_em) VALUES (1, ?, 1)').run(t);
  db.prepare("INSERT INTO duvidas (cliente_id, texto, estado, criada_em) VALUES (2, 'ja respondida', 'respondida', 1)").run();
  const p = montarPacoteDiario(db, AGORA);
  assert.deepEqual(p.hoje.map((i) => [i.codigo, i.cliente, i.clienteId]), [['H1', 'Alfa', 1], ['H2', 'Alfa', 1]]);
  assert.match(p.hoje[0]!.texto, /Enviar proposta/);
  assert.match(p.hoje[0]!.motivo, /20\/10|2026-10-20/);
  assert.equal(p.aprendizado.length, 3, 'no maximo 3 duvidas por relatorio');
  assert.ok(p.aprendizado.every((x) => x.includes('Alfa')));
});
