// Dados do painel e dos passos 1 a 10 da tela: tudo lido do banco (os outros processos gravam). Nada aqui envia, apaga ou usa a rede.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../db.ts';
import { gravarEstado, gravarQr, gravarHistorico, gravarContagem, gravarServico } from '../whatsapp/estado.ts';
import { criarEscuta } from '../whatsapp/escuta.ts';
import { enfileirar } from '../fila.ts';
import { enfileirarSaida, marcarEnviada } from '../saida.ts';
import { montarPainel, pedirTesteSelfChat, gerarRelatorioDeTeste, atualizarEtapas, estadosAoVivo } from './painel.ts';
import { definirDestinoDeBackup, backupDoDia } from '../backup-copia.ts';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const novo = () => { const d = abrirBanco(); migrar(d); return d; };
const T = Date.parse('2026-10-21T11:00:00Z'); // quarta 08:00 em SP

test('painel vazio: tudo zerado, WhatsApp desconhecido, sem QR', () => {
  const p = montarPainel(novo(), T);
  assert.equal(p.whatsapp.estado, 'desconhecido'); assert.equal(p.whatsapp.qrSvg, null);
  assert.deepEqual(p.fila.total, { pendente: 0, em_andamento: 0, ok: 0, erro: 0, abandonada: 0 });
  assert.deepEqual(p.saida, { pendente: 0, enviada: 0, abandonada: 0 });
  assert.deepEqual(p.acervo, { mensagens: 0, conversas: 0, audios: 0, pdfs: 0 });
  assert.equal(p.selfchat.teste, 'nao_feito'); assert.equal(p.relatorios.ultimo, null); assert.deepEqual(p.servicos, {});
  assert.deepEqual(p.backup, { destino: null, ultimoEm: null, erro: null });
});

test('QR aparece so enquanto NAO ha conexao; conectado, nunca (nem se sobrou um desenho no banco)', () => {
  const db = novo();
  gravarQr(db, 'QR', 1, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.match(montarPainel(db, T).whatsapp.qrSvg!, /^<svg/);
  gravarEstado(db, { estado: 'conectado', dono: DONO }, 2);
  gravarQr(db, 'QR-VELHO', 3, '<svg xmlns="http://www.w3.org/2000/svg"></svg>'); // sobra de uma corrida
  const p = montarPainel(db, T);
  assert.equal(p.whatsapp.qrSvg, null); assert.equal(p.whatsapp.dono, '…0000');
  assert.equal(JSON.stringify(p).includes('5511900000000'), false, 'o numero inteiro nunca sai');
});

test('SVG que nao e SVG simples nao vai para a tela (defesa: so desenho, sem script)', () => {
  const db = novo();
  for (const ruim of ['<script>alert(1)</script>', '<svg><script>x</script></svg>', '<svg onload="x()"></svg>', '<svg><a href="http://x"></a></svg>', 'x'.repeat(300_000)]) {
    gravarQr(db, 'QR', 1, ruim);
    assert.equal(montarPainel(db, T).whatsapp.qrSvg, null, ruim.slice(0, 30));
  }
});

test('progresso do historico, contagens, fila por tipo, saida e acervo', () => {
  const db = novo();
  gravarHistorico(db, { progresso: 55, ultima: false }, 10);
  gravarContagem(db, { inseridas: 9, duplicadas: 1, editadas: 0, apagadas: 0, midiasEnfileiradas: 2, falhas: 0, ultimaMensagemEm: 5 }, 11);
  enfileirar(db, 'baixar_midia', '1', 1); enfileirar(db, 'transcrever', '1', 1);
  db.prepare("UPDATE fila SET estado = 'ok' WHERE tipo = 'transcrever'").run();
  criarEscuta(db, DONO, { agora: () => T }).mensagens([{ key: { id: 'M1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: Math.floor(T / 1000) }], 'notify', () => '{}');
  const p = montarPainel(db, T);
  assert.equal(p.whatsapp.historico?.progresso, 55); assert.equal(p.whatsapp.contagem?.inseridas, 9);
  assert.equal(p.fila.porTipo.transcrever!.ok, 1);
  assert.deepEqual({ pendente: p.fila.total.pendente, ok: p.fila.total.ok }, { pendente: 1, ok: 1 }, 'o download do audio (da escuta) espera; a transcricao (marcada ok) terminou');
  assert.equal(p.fila.porTipo.baixar_midia!.pendente, 1);
  assert.deepEqual(p.acervo, { mensagens: 1, conversas: 1, audios: 1, pdfs: 0 });
});

test('servicos aparecem como gravados; saude antiga (mais de 2 minutos) conta como "sem resposta"', () => {
  const db = novo();
  gravarServico(db, 'hindsight', true, T - 30_000); gravarServico(db, 'hermes', true, T - 10 * 60_000);
  const s = montarPainel(db, T).servicos;
  assert.deepEqual(s, { hindsight: { ok: true, ha: 30 }, hermes: { ok: false, ha: 600 } });
});

test('teste do self-chat: pede, envia, espera a resposta do dono e fecha; a mensagem de teste so vai para a caixa de saida', () => {
  const db = novo();
  assert.equal(pedirTesteSelfChat(db, T), true);
  assert.equal(pedirTesteSelfChat(db, T + 1000), false, 'um teste em andamento nao e repetido');
  assert.equal(montarPainel(db, T).selfchat.teste, 'aguardando_envio');
  const id = (db.prepare("SELECT id FROM saida WHERE chave LIKE 'teste:selfchat:%'").get() as { id: number }).id;
  assert.equal((db.prepare('SELECT tipo FROM saida WHERE id = ?').get(id) as { tipo: string }).tipo, 'aviso');
  marcarEnviada(db, id, 'WA-T', T + 5000);
  assert.equal(montarPainel(db, T + 6000).selfchat.teste, 'aguardando_resposta');
  const escuta = criarEscuta(db, DONO, { agora: () => T });
  escuta.mensagens([{ key: { id: 'NOSSO', remoteJid: DONO.pn, fromMe: true }, message: { conversation: 'eco da nossa mensagem' }, messageTimestamp: Math.floor((T + 7000) / 1000) }], 'notify');
  db.prepare("UPDATE saida SET wa_msg_id = 'NOSSO' WHERE id = ?").run(id);
  assert.equal(montarPainel(db, T + 8000).selfchat.teste, 'aguardando_resposta', 'o eco do que NOS enviamos nao conta como resposta');
  escuta.mensagens([{ key: { id: 'RESP', remoteJid: DONO.pn, fromMe: true }, message: { conversation: 'oi, recebi' }, messageTimestamp: Math.floor((T + 20_000) / 1000) }], 'notify');
  assert.equal(montarPainel(db, T + 30_000).selfchat.teste, 'ok');
  assert.equal(pedirTesteSelfChat(db, T + 60_000), true, 'depois de concluido, pode testar de novo');
});

test('relatorio de teste: diario e semanal agora, ignorando o dia da semana; cabem em uma tela; vao so para a caixa de saida', () => {
  const db = novo();
  const r = gerarRelatorioDeTeste(db, T);
  assert.deepEqual(r.map((x) => [x.tipo, x.cabe]), [['diario', true], ['semanal', true]]);
  const linhas = db.prepare("SELECT tipo, texto, chave FROM saida ORDER BY id").all() as { tipo: string; texto: string; chave: string }[];
  assert.equal(linhas.length, 2);
  assert.ok(linhas.every((l) => l.tipo === 'relatorio' && l.chave.startsWith('teste:')));
  assert.match(linhas[0]!.texto, /Diário/); assert.match(linhas[1]!.texto, /Semanal/);
  assert.equal(montarPainel(db, T).relatorios.ultimo?.chave, linhas[1]!.chave);
  assert.equal(gerarRelatorioDeTeste(db, T).length, 2, 'cada teste gera um par novo (chave com o instante)');
});

test('etapas: whatsapp e selfchat ficam verdes sozinhas quando o banco mostra que deram certo; deslogado deixa vermelho (sincronizar/extrair NAO sao mais gravados: ver estadosAoVivo)', () => {
  const db = novo();
  for (const passo of ['whatsapp', 'sincronizar', 'extrair', 'selfchat']) db.prepare('INSERT OR IGNORE INTO onboarding_etapas (passo) VALUES (?)').run(passo);
  const estados = () => Object.fromEntries((db.prepare("SELECT passo, estado FROM onboarding_etapas WHERE passo IN ('whatsapp','sincronizar','extrair','selfchat')").all() as { passo: string; estado: string }[]).map((r) => [r.passo, r.estado]));
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.deepEqual(estados(), { whatsapp: 'pendente', sincronizar: 'pendente', extrair: 'pendente', selfchat: 'pendente' });
  gravarEstado(db, { estado: 'conectado', dono: DONO }, 1);
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().whatsapp, 'verde');
  gravarHistorico(db, { progresso: 100, ultima: true }, 2);
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().sincronizar, 'pendente', 'verde de sincronizar/extrair nao e mais gravado (era "pegajoso"): vem de estadosAoVivo');
  criarEscuta(db, DONO, { agora: () => T }).mensagens([{ key: { id: 'M1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: Math.floor(T / 1000) }], 'notify', () => '{}');
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().extrair, 'pendente');
  gravarEstado(db, { estado: 'deslogado' }, 3);
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().whatsapp, 'vermelho');
});

test('etapa do WhatsApp: "reconectando" nao deixa o passo verde (so conectado deixa)', () => {
  const db = novo();
  db.prepare("INSERT OR IGNORE INTO onboarding_etapas (passo) VALUES ('whatsapp')").run();
  gravarEstado(db, { estado: 'reconectar', codigo: 515 }, 1);
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal((db.prepare("SELECT estado FROM onboarding_etapas WHERE passo = 'whatsapp'").get() as { estado: string }).estado, 'pendente');
});

test('backup: o painel mostra destino, ultimo backup e erro; a etapa fica verde so com backup feito e sem erro', () => {
  const db = novo(); db.prepare("INSERT OR IGNORE INTO onboarding_etapas (passo) VALUES ('backup')").run();
  const pasta = mkdtempSync(join(tmpdir(), 'heimdall-painel-bk-'));
  const etapa = () => (db.prepare("SELECT estado FROM onboarding_etapas WHERE passo = 'backup'").get() as { estado: string }).estado;
  try {
    atualizarEtapas(db, montarPainel(db, T), T); assert.equal(etapa(), 'pendente');
    assert.equal(definirDestinoDeBackup(db, pasta).ok, true);
    atualizarEtapas(db, montarPainel(db, T), T); assert.equal(etapa(), 'pendente', 'destino escolhido, mas ainda sem backup feito');
    assert.equal(backupDoDia(db, T), 'feito');
    const p = montarPainel(db, T);
    assert.deepEqual(p.backup, { destino: pasta, ultimoEm: T, erro: null });
    atualizarEtapas(db, p, T); assert.equal(etapa(), 'verde');
  } finally { rmSync(pasta, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

// ---- estados ao vivo (B, 2026-10-21): "processando" (amarelo) com porcentagem SO onde existe total conhecido; verde so com tudo puxado e filas zeradas ----
const vivo = (db: ReturnType<typeof novo>) => estadosAoVivo(montarPainel(db, T));
function comMidias(db: ReturnType<typeof novo>, total: number, baixadas: number): void {
  const escuta = criarEscuta(db, DONO, { agora: () => T });
  for (let i = 0; i < total; i++) escuta.mensagens([{ key: { id: `A${i}`, remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: Math.floor(T / 1000) - i }], 'historico', () => '{}');
  db.prepare("UPDATE fila SET estado = 'ok' WHERE id IN (SELECT id FROM fila WHERE tipo = 'baixar_midia' ORDER BY id LIMIT ?)").run(baixadas);
}

test('estados ao vivo: sem WhatsApp conectado os passos de dados ficam pendentes', () => {
  const v = vivo(novo());
  assert.equal(v.sincronizar!.estado, 'pendente'); assert.equal(v.extrair!.estado, 'pendente'); assert.equal(v.sincronizar!.percentual, null);
});

test('sincronizar: historico em andamento = processando com a porcentagem que o WhatsApp informa; sem total conhecido, nenhuma porcentagem inventada', () => {
  const db = novo(); gravarEstado(db, { estado: 'conectado', dono: DONO }, 1);
  assert.deepEqual({ e: vivo(db).sincronizar!.estado, p: vivo(db).sincronizar!.percentual }, { e: 'processando', p: null }, 'ainda nao chegou nada: processando, sem porcentagem');
  gravarHistorico(db, { progresso: 42, ultima: false }, 2);
  assert.deepEqual({ e: vivo(db).sincronizar!.estado, p: vivo(db).sincronizar!.percentual }, { e: 'processando', p: 42 });
  gravarHistorico(db, { progresso: 100, ultima: false }, 3);
  assert.equal(vivo(db).sincronizar!.estado, 'verde', 'progresso 100 conta como recebido (o dono viu ultima=false com progresso 100)');
});

test('extrair: a porcentagem e arquivos baixados / total (133 de 655); verde so com a fila zerada; volta a processando se entra trabalho novo', () => {
  const db = novo(); gravarEstado(db, { estado: 'conectado', dono: DONO }, 1); gravarHistorico(db, { progresso: 100, ultima: true }, 2);
  comMidias(db, 20, 5);
  let x = vivo(db).extrair!;
  assert.deepEqual({ e: x.estado, p: x.percentual }, { e: 'processando', p: 25 });
  assert.match(x.detalhe, /5 de 20/);
  db.prepare("UPDATE fila SET estado = 'ok'").run();
  assert.equal(vivo(db).extrair!.estado, 'verde');
  enfileirar(db, 'baixar_midia', '999', T); // entra trabalho novo depois de ja ter sido verde
  x = vivo(db).extrair!;
  assert.equal(x.estado, 'processando', 'verde nao e pegajoso');
});

test('extrair: download abandonado nao trava o verde, mas aparece no texto (arquivos sem copia)', () => {
  const db = novo(); gravarEstado(db, { estado: 'conectado', dono: DONO }, 1); gravarHistorico(db, { progresso: 100, ultima: true }, 2);
  comMidias(db, 4, 2);
  db.prepare("UPDATE fila SET estado = 'abandonada' WHERE estado = 'pendente'").run();
  const x = vivo(db).extrair!;
  assert.equal(x.estado, 'verde');
  assert.match(x.detalhe, /2 sem arquivo/);
});

test('sincronizar com historico antigo ligado: enquanto ha conversa a pedir, e processando com conversas concluidas / total', () => {
  const db = novo(); gravarEstado(db, { estado: 'conectado', dono: DONO }, 1); gravarHistorico(db, { progresso: 100, ultima: true }, 2);
  const e = criarEscuta(db, DONO, { agora: () => T });
  for (const n of [1, 2, 3, 4]) e.mensagens([{ key: { id: `H${n}`, remoteJid: `551199999000${n}@s.whatsapp.net`, fromMe: false }, message: { conversation: 'oi' }, messageTimestamp: Math.floor(T / 1000) }], 'historico');
  db.prepare("INSERT OR REPLACE INTO configuracao (chave, valor) VALUES ('historico.antigo', '{\"liberado\":true}')").run();
  db.prepare("INSERT INTO historico_pedidos (conversa_id, estado) SELECT id, 'pendente' FROM conversas").run();
  db.prepare("UPDATE historico_pedidos SET estado = 'concluida' WHERE conversa_id IN (SELECT conversa_id FROM historico_pedidos LIMIT 1)").run();
  const s = estadosAoVivo(montarPainel(db, T)).sincronizar!;
  assert.deepEqual({ e: s.estado, p: s.percentual }, { e: 'processando', p: 25 });
  assert.match(s.detalhe, /1 de 4 conversas/);
});

test('processar: pendente enquanto a trava esta fechada; processando com dias na fila quando aberta; verde quando acaba', () => {
  const db = novo();
  assert.equal(vivo(db).processar!.estado, 'pendente');
  assert.match(vivo(db).processar!.detalhe, /aguardando o seu OK/i);
  db.prepare("INSERT INTO configuracao (chave, valor) VALUES ('extracao.liberada', 'true')").run();
  assert.equal(vivo(db).processar!.estado, 'pendente', 'liberada mas sem nada para processar ainda');
  enfileirar(db, 'extrair', 'ext:1:2026-01-01', T); enfileirar(db, 'extrair', 'ext:1:2026-01-02', T);
  db.prepare("UPDATE fila SET estado = 'ok' WHERE referencia = 'ext:1:2026-01-01'").run();
  const x = vivo(db).processar!;
  assert.deepEqual({ e: x.estado, p: x.percentual }, { e: 'processando', p: 50 });
  db.prepare("UPDATE fila SET estado = 'ok'").run();
  assert.equal(vivo(db).processar!.estado, 'verde');
});
