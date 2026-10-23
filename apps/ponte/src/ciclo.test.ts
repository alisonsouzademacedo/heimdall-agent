// Laco da ponte: processa o self-chat de tempos em tempos e para quando pedido; erro inesperado nao derruba o laco.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { iniciarPonte, lerChaveDoEnv, EXTRACOES_POR_GIRO } from './ciclo.ts';
import { definirExtracaoLiberada } from '../../core/src/extracao.ts';
import type { PortasAgenda } from './agenda.ts';
import { lerServicos } from '../../core/src/whatsapp/estado.ts';
import type { PortasSelfChat } from './selfchat.ts';

const T = Date.UTC(2025, 9, 10, 15, 0, 0);

test('laco: responde a mensagem nova, espera entre giros e para quando pedido', async () => {
  const db = abrirBanco(); migrar(db);
  criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => T }).mensagens([{ key: { id: 'S1', remoteJid: '5511900000000@s.whatsapp.net', fromMe: true }, message: { conversation: '/heimdall oi' }, messageTimestamp: Math.floor(T / 1000) }], 'notify');
  const portas: PortasSelfChat = { hermes: { perguntar: async () => 'ola' }, apagarArquivo: () => {} };
  const esperas: number[] = [];
  const p = iniciarPonte({ banco: db, portas, agora: () => T + 1000, intervaloMs: 7000, esperar: async (ms) => { esperas.push(ms); if (esperas.length >= 2) p.parar(); } });
  await p.terminou;
  assert.deepEqual(esperas, [7000, 7000]);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM saida').get() as { n: number }).n, 1, 'respondeu uma vez so');
});

test('uma excecao inesperada nao derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  db.exec('DROP TABLE saida'); // quebra de proposito: o processamento lanca
  let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
  await p.terminou;
  assert.equal(giros, 3);
});

test('lerChaveDoEnv: pega API_SERVER_KEY do arquivo .env, ignora comentarios e nunca devolve o resto', () => {
  assert.equal(lerChaveDoEnv('# c\nPOSTGRES_PASSWORD=abc\nAPI_SERVER_KEY=chave-123456789\nOUTRA=1\n'), 'chave-123456789');
  assert.equal(lerChaveDoEnv('API_SERVER_KEY="entre-aspas-123"\r\n'), 'entre-aspas-123');
  assert.equal(lerChaveDoEnv('# API_SERVER_KEY=comentada\nX=1'), null);
  assert.equal(lerChaveDoEnv(''), null);
});

test('laco: gera o relatorio do dia (uma vez) alem de responder o self-chat', async () => {
  const db = abrirBanco(); migrar(db);
  const agenda: PortasAgenda = { redator: null, instrucoes: { comum: '', diario: '', semanal: '' } };
  const QUARTA_8H = Date.parse('2026-10-21T11:00:00Z');
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, agenda, agora: () => QUARTA_8H, intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
  let giros = 0;
  await p.terminou;
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM saida WHERE tipo = 'relatorio'").get() as { n: number }).n, 1, 'tres giros, um relatorio so');
});

test('laco: anota na tabela de configuracao se o Hermes responde (a tela mostra); falha ao checar vira "sem resposta", nunca derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  const respostas = [true, false];
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, saudeHermes: async () => { const r = respostas.shift(); if (r === undefined) throw new Error('caiu'); return r; }, agora: () => 5000, intervaloMs: 1, esperar: async () => { if (!respostas.length) p.parar(); } });
  await p.terminou;
  assert.deepEqual(lerServicos(db), { hermes: { ok: false, em: 5000 } });
});

test('laco: faz o backup do dia no destino escolhido (uma vez por dia) sem atrapalhar o resto', async () => {
  const { mkdtempSync, readdirSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { definirDestinoDeBackup } = await import('../../core/src/backup-copia.ts');
  const db = abrirBanco(); migrar(db);
  const pasta = mkdtempSync(join(tmpdir(), 'heimdall-ponte-bk-'));
  try {
    assert.equal(definirDestinoDeBackup(db, pasta).ok, true);
    let giros = 0;
    const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, agora: () => Date.parse('2026-10-21T11:00:00Z'), intervaloMs: 1, esperar: async () => { if (++giros >= 3) p.parar(); } });
    await p.terminou;
    assert.deepEqual(readdirSync(pasta), ['acervo-2026-10-21.sqlite'], 'tres giros, um backup so');
  } finally { rmSync(pasta, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('laco: roda a extracao de compromissos (no maximo EXTRACOES_POR_GIRO por giro) e uma falha do modelo nao derruba o laco', async () => {
  const db = abrirBanco(); migrar(db);
  const DONO = '5511900000000@s.whatsapp.net';
  const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
  const HOJE = D10 + 30 * 3_600_000;
  const escuta = criarEscuta(db, { pn: DONO }, { agora: () => HOJE });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  for (const [i, jid] of ['5511999990001', '5511999990002', '5511999990003'].entries()) {
    escuta.mensagens([{ key: { id: `M${i}`, remoteJid: `${jid}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
    db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(`${jid}@s.whatsapp.net`);
  }
  definirExtracaoLiberada(db, true); // a trava de processamento (D, 2026-10-21) vem fechada: este teste e do comportamento com ela ABERTA
  const pedidos: string[] = [];
  const extracao = { instrucoes: 'REGRAS', porta: { extrair: async (_p: string, sessao: string) => { pedidos.push(sessao); throw new Error('modelo fora do ar'); } } };
  let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, extracao, agora: () => HOJE, intervaloMs: 1, esperar: async () => { if (++giros >= 1) p.parar(); } });
  await p.terminou;
  assert.equal(pedidos.length, EXTRACOES_POR_GIRO, 'dois por giro, nao a fila inteira');
  assert.ok(pedidos.every((s) => s.startsWith('heimdall:extracao:ext:')));
  assert.equal((db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair'").get() as { n: number }).n, 3, 'falha nao perde o trabalho: ele volta para tentar depois');
});

test('laco: depois de fazer o backup do dia, apaga os backups invalidos e velhos da pasta de destino (e so eles)', async () => {
  const { mkdtempSync, writeFileSync, readdirSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { definirDestinoDeBackup } = await import('../../core/src/backup-copia.ts');
  const { apagarBackup } = await import('./apagar-backup.ts');
  const pasta = mkdtempSync(join(tmpdir(), 'hd-ciclo-bk-'));
  try {
    const db = abrirBanco(); migrar(db);
    assert.equal(definirDestinoDeBackup(db, pasta).ok, true);
    writeFileSync(join(pasta, 'acervo-2026-10-01.sqlite'), 'lixo, nao e banco');
    writeFileSync(join(pasta, 'meus-documentos.txt'), 'nao e nosso');
    const QUARTA = Date.parse('2026-10-21T15:00:00Z');
    const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, apagarBackup: (d, n) => { apagarBackup(d, n); }, agora: () => QUARTA, intervaloMs: 1, esperar: async () => p.parar() });
    await p.terminou;
    assert.deepEqual(readdirSync(pasta).sort(), ['acervo-2026-10-21.sqlite', 'meus-documentos.txt']);
    db.close();
  } finally { rmSync(pasta, { recursive: true, force: true }); }
});

test('laco: com extracao pendente nao reanalisa o acervo a cada giro; o dia novo so e agendado quando a fila esvazia', async () => {
  const db = abrirBanco(); migrar(db);
  const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
  const HOJE = D10 + 30 * 3_600_000;
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => HOJE });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  const por = (id: string, jid: string, ts: number) => {
    escuta.mensagens([{ key: { id, remoteJid: `${jid}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(ts / 1000) }], 'notify');
    db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(`${jid}@s.whatsapp.net`);
  };
  for (const [i, jid] of ['5511999990001', '5511999990002', '5511999990003'].entries()) por(`M${i}`, jid, D10);
  definirExtracaoLiberada(db, true);
  const extracao = { instrucoes: 'REGRAS', porta: { extrair: async () => '{}' } };
  const novas = () => (db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair' AND referencia LIKE ?").get(`ext:${(db.prepare("SELECT c.id AS id FROM conversas c WHERE c.jid = '5511999990004@s.whatsapp.net'").get() as { id: number } | undefined)?.id ?? -1}:%`) as { n: number }).n;
  const vistas: number[] = [];
  let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, extracao, agora: () => HOJE, intervaloMs: 1, esperar: async () => {
    giros++;
    if (giros === 1) por('N', '5511999990004', D10 - 86_400_000); // chega enquanto ainda sobra 1 trabalho (3 agendados, 2 por giro)
    vistas.push(novas());
    if (giros >= 3) p.parar();
  } });
  await p.terminou;
  assert.deepEqual(vistas, [0, 0, 1], 'giro 2: a fila ainda tinha trabalho, nao varreu; giro 3: fila vazia, agendou o dia novo');
});

// D (2026-10-21): a ponte NAO chama o modelo para extracao enquanto o dono nao liberar. Com a trava fechada nada e nem enfileirado.
test('trava de processamento: fechada (padrao) a ponte nao pergunta nada ao modelo nem enfileira extracao; aberta processa; fechada de novo para', async () => {
  const db = abrirBanco(); migrar(db);
  const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
  const HOJE = D10 + 30 * 3_600_000;
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => HOJE });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  for (const [i, jid] of ['5511999990001', '5511999990002', '5511999990003', '5511999990004', '5511999990005'].entries()) {
    escuta.mensagens([{ key: { id: `M${i}`, remoteJid: `${jid}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
    db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(`${jid}@s.whatsapp.net`);
  }
  let consultas = 0;
  const extracao = { instrucoes: 'REGRAS', porta: { extrair: async () => { consultas++; return '{}'; } } };
  const fila = () => (db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair'").get() as { n: number }).n;
  const vistas: number[] = []; let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, extracao, agora: () => HOJE, intervaloMs: 1, esperar: async () => {
    giros++; vistas.push(consultas);
    if (giros === 2) assert.equal(fila(), 0, 'trava fechada: nem enfileira');
    if (giros === 2) definirExtracaoLiberada(db, true);     // o dono libera
    if (giros === 3) definirExtracaoLiberada(db, false);    // o dono pausa de novo
    if (giros >= 5) p.parar();
  } });
  await p.terminou;
  assert.deepEqual(vistas, [0, 0, EXTRACOES_POR_GIRO, EXTRACOES_POR_GIRO, EXTRACOES_POR_GIRO], 'giros 1-2 fechada: zero; giro 3 aberta: dois; depois de pausar: nenhuma consulta nova');
});

// Teto diario de tokens da extracao (tela, passo Processar): atingido = nenhuma consulta nova ate o dia seguinte, sem o dono precisar pausar.
test('teto diario de tokens: atingido pausa a extracao sozinho; no dia seguinte volta a rodar', async () => {
  const { definirTetoDiario, registrarConsumo } = await import('../../core/src/consumo.ts');
  const db = abrirBanco(); migrar(db);
  const D10 = Date.UTC(2025, 9, 10, 15, 0, 0);
  let agora = D10 + 30 * 3_600_000; // 2025-10-11 21:00 em Sao Paulo, dia seguinte ao das mensagens
  const escuta = criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => agora });
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  for (const [i, jid] of ['5511999990001', '5511999990002', '5511999990003'].entries()) {
    escuta.mensagens([{ key: { id: `M${i}`, remoteJid: `${jid}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(D10 / 1000) }], 'notify');
    db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(`${jid}@s.whatsapp.net`);
  }
  definirExtracaoLiberada(db, true);
  definirTetoDiario(db, 10_000);
  registrarConsumo(db, { tarefa: 'extracao', modelo: 'gpt-6-luna', entrada: 9_500, saida: 600, ms: 1 }, agora); // 10.100 >= 10.000 hoje
  let consultas = 0;
  const extracao = { instrucoes: 'REGRAS', porta: { extrair: async () => { consultas++; return '{}'; } } };
  const vistas: number[] = []; let giros = 0;
  const p = iniciarPonte({ banco: db, portas: { hermes: { perguntar: async () => 'x' }, apagarArquivo: () => {} }, extracao, agora: () => agora, intervaloMs: 1, esperar: async () => {
    giros++; vistas.push(consultas);
    if (giros === 2) agora += 24 * 3_600_000; // virou o dia: o consumo de ontem nao conta
    if (giros >= 3) p.parar();
  } });
  await p.terminou;
  assert.equal(vistas[0], 0, 'teto atingido: nenhuma consulta');
  assert.equal(vistas[1], 0, 'ainda no mesmo dia');
  assert.ok(vistas[2]! > 0, 'dia seguinte: volta a consultar');
});

// C (2026-10-21): a tela pede o teste do modelo; a ponte (que ja fala com o Hermes) executa. Sem pedido, nenhuma chamada.
test('laco: executa o teste do modelo pedido pela tela uma vez so, e sem pedido nao chama o modelo', async () => {
  const { pedirTesteDoModelo, lerTesteDoModelo } = await import('../../core/src/modelo-teste.ts');
  const db = abrirBanco(); migrar(db);
  let chamadas = 0; let giros = 0;
  const hermes = { perguntar: async (_t: string, op: { sessao: string }) => { chamadas++; assert.equal(op.sessao, 'heimdall:teste-modelo'); return 'ok'; } };
  const p = iniciarPonte({ banco: db, portas: { hermes, apagarArquivo: () => {} }, agora: () => Date.parse('2026-10-21T11:00:00Z'), intervaloMs: 1, esperar: async () => {
    giros++;
    if (giros === 1) { assert.equal(chamadas, 0, 'sem pedido: nenhuma chamada'); pedirTesteDoModelo(db, Date.parse('2026-10-21T11:00:00Z')); }
    if (giros >= 3) p.parar();
  } });
  await p.terminou;
  assert.equal(chamadas, 1);
  assert.equal(lerTesteDoModelo(db).estado, 'ok');
});
