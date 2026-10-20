// O laco que baixa as midias da fila: so "baixar_midia", so enquanto ha conexao, um por vez.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { enfileirar, resumoDaFila } from '../../core/src/fila.ts';
import { iniciarBaixador } from './ciclo.ts';
import type { PortasBaixar } from '../../core/src/midia.ts';

const T0 = 1_760_000_000_000;
function cenario() {
  const db = abrirBanco(); migrar(db);
  criarEscuta(db, { pn: '5511900000000@s.whatsapp.net' }, { agora: () => T0 }).mensagens([
    { key: { id: 'A1', remoteJid: '5511999990001@s.whatsapp.net', fromMe: false }, message: { audioMessage: { ptt: true } }, messageTimestamp: 1_760_000_000 }
  ], 'notify', (m) => JSON.stringify({ id: m.key.id }));
  return db;
}
const portasOk: PortasBaixar = { baixar: async () => new TextEncoder().encode('bytes'), gravarMidia: async (h, e) => `data/midias/${h}.${e}` };

test('sem conexao (portas nulas) espera e nao consome tentativas; quando a conexao volta, baixa', async () => {
  const db = cenario();
  let portas: PortasBaixar | null = null; let agora = T0; let voltas = 0;
  const b = iniciarBaixador({ banco: db, portas: () => portas, agora: () => agora, intervaloMs: 1000, esperar: async (ms) => { agora += ms; voltas++; if (voltas === 3) portas = portasOk; if (voltas === 6) b.parar(); } });
  await b.terminou;
  assert.equal(resumoDaFila(db).ok >= 1, true);
  assert.equal((db.prepare("SELECT tentativas FROM fila WHERE tipo = 'baixar_midia'").get() as { tentativas: number }).tentativas, 1, 'a unica tentativa foi a que baixou de verdade');
});

test('nao toca em transcrever nem converter_pdf (isso e do executor)', async () => {
  const db = cenario();
  enfileirar(db, 'transcrever', '1', T0); enfileirar(db, 'converter_pdf', '2', T0);
  let agora = T0; let voltas = 0;
  const b = iniciarBaixador({ banco: db, portas: () => portasOk, agora: () => agora, intervaloMs: 1000, esperar: async (ms) => { agora += ms; if (++voltas === 2) b.parar(); } });
  await b.terminou;
  const pend = db.prepare("SELECT tipo FROM fila WHERE estado = 'pendente' ORDER BY tipo").all() as { tipo: string }[];
  assert.ok(pend.some((p) => p.tipo === 'transcrever') && pend.some((p) => p.tipo === 'converter_pdf'));
});

test('depois de uma queda, o que ficou em andamento volta para a fila ao iniciar', async () => {
  const db = cenario();
  db.prepare("UPDATE fila SET estado = 'em_andamento', tentativas = 1, atualizado_em = ? WHERE tipo = 'baixar_midia'").run(T0 - 3_600_000);
  let agora = T0; let voltas = 0;
  const b = iniciarBaixador({ banco: db, portas: () => portasOk, agora: () => agora, intervaloMs: 1000, esperar: async (ms) => { agora += ms; if (++voltas === 2) b.parar(); } });
  await b.terminou;
  assert.equal(resumoDaFila(db).ok >= 1, true);
});
