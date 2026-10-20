// Dados do painel e dos passos 1 a 10 da tela: tudo lido do banco (os outros processos gravam). Nada aqui envia, apaga ou usa a rede.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../db.ts';
import { gravarEstado, gravarQr, gravarHistorico, gravarContagem, gravarServico } from '../whatsapp/estado.ts';
import { criarEscuta } from '../whatsapp/escuta.ts';
import { enfileirar } from '../fila.ts';
import { enfileirarSaida, marcarEnviada } from '../saida.ts';
import { montarPainel, pedirTesteSelfChat, gerarRelatorioDeTeste, atualizarEtapas } from './painel.ts';

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

test('etapas: whatsapp/sincronizar/extrair/selfchat ficam verdes sozinhas quando o banco mostra que deram certo; deslogado deixa vermelho', () => {
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
  assert.equal(estados().sincronizar, 'verde');
  criarEscuta(db, DONO, { agora: () => T }).mensagens([{ key: { id: 'M1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true, seconds: 3 } }, messageTimestamp: Math.floor(T / 1000) }], 'notify', () => '{}');
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().extrair, 'pendente', 'ainda ha download na fila');
  db.prepare("UPDATE fila SET estado = 'ok'").run();
  atualizarEtapas(db, montarPainel(db, T), T);
  assert.equal(estados().extrair, 'verde');
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
