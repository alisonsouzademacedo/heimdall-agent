// O estado da conexao com o WhatsApp fica em "configuracao" (SQLite), para a tela (outro processo) ler sem canal novo.
// O numero do dono NUNCA vai inteiro para o que a tela mostra: so os quatro ultimos digitos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../db.ts';
import { gravarEstado, lerEstado, gravarQr, lerQr, gravarHistorico, gravarContagem, mascararNumero, gravarServico, lerServicos } from './estado.ts';

const novo = () => { const db = abrirBanco(); migrar(db); return db; };

test('sem nada gravado: "desconhecido"', () => {
  const e = lerEstado(novo());
  assert.deepEqual(e, { estado: 'desconhecido', atualizadoEm: null, dono: null, motivo: null, codigo: null, aviso: null, historico: null, contagem: null, temQr: false });
});

test('conectado grava so o final do numero; deslogado, reconectar e erro guardam o motivo', () => {
  const db = novo();
  gravarEstado(db, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net', lid: '999888777666555@lid' } }, 1000);
  let e = lerEstado(db);
  assert.equal(e.estado, 'conectado');
  assert.equal(e.dono, '…0000');
  assert.equal(JSON.stringify(e).includes('5511900000000'), false, 'o numero completo nao aparece');
  assert.equal(JSON.stringify(e).includes('999888777666555'), false, 'o LID tambem nao');
  gravarEstado(db, { estado: 'reconectar', codigo: 408 }, 2000);
  e = lerEstado(db);
  assert.deepEqual({ s: e.estado, c: e.codigo, t: e.atualizadoEm }, { s: 'reconectar', c: 408, t: 2000 });
  gravarEstado(db, { estado: 'erro', motivo: 'sem numero' }, 3000);
  assert.equal(lerEstado(db).motivo, 'sem numero');
  gravarEstado(db, { estado: 'deslogado' }, 4000);
  assert.equal(lerEstado(db).estado, 'deslogado');
});

test('conectar apaga o QR antigo (o QR so vale ate escanear)', () => {
  const db = novo();
  gravarQr(db, 'QR-STRING', 500);
  assert.deepEqual(lerQr(db), { qr: 'QR-STRING', em: 500 });
  assert.equal(lerEstado(db).temQr, true);
  gravarEstado(db, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, 600);
  assert.equal(lerQr(db), null);
  assert.equal(lerEstado(db).temQr, false);
});

test('andamento do historico e contagem de mensagens gravadas aparecem no estado', () => {
  const db = novo();
  gravarHistorico(db, { progresso: 40, ultima: false }, 700);
  gravarContagem(db, { inseridas: 120, duplicadas: 3, editadas: 1, apagadas: 2, midiasEnfileiradas: 9, falhas: 0, ultimaMensagemEm: 1_760_000_000_000 }, 800);
  const e = lerEstado(db);
  assert.deepEqual(e.historico, { progresso: 40, ultima: false, em: 700 });
  assert.equal(e.contagem?.inseridas, 120);
  assert.equal(e.contagem?.midiasEnfileiradas, 9);
});

test('mascararNumero', () => {
  assert.equal(mascararNumero('5511900000000@s.whatsapp.net'), '…0000');
  assert.equal(mascararNumero('5511900000000:7@s.whatsapp.net'), '…0000');
  assert.equal(mascararNumero('12'), '…');
  assert.equal(mascararNumero(''), '…');
});

test('um aviso (ex.: mensagens que nao puderam ser gravadas) NAO troca o estado da conexao: fica ao lado', () => {
  const db = novo();
  gravarEstado(db, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, 100);
  gravarEstado(db, { estado: 'aviso', motivo: '2 mensagem(ns) nao puderam ser gravadas' }, 200);
  const e = lerEstado(db);
  assert.equal(e.estado, 'conectado');
  assert.deepEqual(e.aviso, { motivo: '2 mensagem(ns) nao puderam ser gravadas', em: 200 });
  gravarEstado(db, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, 300);
  assert.equal(lerEstado(db).aviso, null, 'reconectar limpa o aviso');
});

test('QR com imagem: o desenho (SVG) pronto para a tela fica ao lado do texto do QR, e some junto ao conectar', () => {
  const db = novo();
  gravarQr(db, 'QR-STRING', 500, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.deepEqual(lerQr(db), { qr: 'QR-STRING', em: 500, svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' });
  gravarQr(db, 'QR-SEM-IMAGEM', 600);
  assert.equal(lerQr(db)!.svg, undefined, 'um QR novo sem imagem nao herda o desenho do anterior');
  gravarQr(db, 'QR-STRING', 700, '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  gravarEstado(db, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, 800);
  assert.equal(lerQr(db), null);
});

test('servicos: cada processo anota se o servico com que fala responde; a tela so le', () => {
  const db = novo();
  assert.deepEqual(lerServicos(db), {});
  gravarServico(db, 'hindsight', true, 1000);
  gravarServico(db, 'hermes', false, 2000);
  gravarServico(db, 'hindsight', false, 3000);
  assert.deepEqual(lerServicos(db), { hindsight: { ok: false, em: 3000 }, hermes: { ok: false, em: 2000 } });
  assert.throws(() => gravarServico(db, 'qualquer coisa', true, 1), /servico/i);
});
