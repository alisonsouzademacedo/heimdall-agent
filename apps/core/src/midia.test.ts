// Pipeline de midia: baixar -> (transcrever | converter PDF) -> texto na mensagem. As portas (Baileys, disco, Docker) sao falsas aqui.
// Dados sinteticos. O que depende do WhatsApp real (baixar de verdade) e do modelo real esta em docs/plano/runbooks/08-testes-de-fumaca.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { abrirBanco, migrar, contar } from './db.ts';
import { criarEscuta } from './whatsapp/escuta.ts';
import { pegarProximo, resumoDaFila } from './fila.ts';
import { processarBaixarMidia, processarTexto, type PortasBaixar, type PortasTexto } from './midia.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const T0 = 1_760_000_000_000;
const sha = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
function cenario() {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => T0 });
  const gravados = new Map<string, Uint8Array>();
  const baixados: string[] = [];
  const portas: PortasBaixar = {
    baixar: async (d) => { baixados.push(d); const id = JSON.parse(d).id as string; return new TextEncoder().encode(`conteudo-${id.split('-')[0]}`); },
    gravarMidia: async (hash, ext, bytes) => { const c = `data/midias/${hash}.${ext}`; gravados.set(c, bytes); return c; }
  };
  const entrar = (id: string, message: Record<string, unknown>, jid = '5511999990001@s.whatsapp.net') =>
    escuta.mensagens([{ key: { id, remoteJid: jid, fromMe: false }, message, messageTimestamp: 1_760_000_000 }], 'notify', (m) => JSON.stringify({ id: m.key.id }));
  return { db, portas, gravados, baixados, entrar };
}
const audio = { audioMessage: { ptt: true, seconds: 5, mimetype: 'audio/ogg; codecs=opus' } };
const pdf = { documentMessage: { mimetype: 'application/pdf', fileName: 'ata.pdf' } };

test('baixar: grava o arquivo pelo hash, registra a midia, liga a mensagem e enfileira a transcricao', async () => {
  const c = cenario(); c.entrar('A-1', audio);
  const job = pegarProximo(c.db, ['baixar_midia'], T0)!;
  assert.equal(await processarBaixarMidia(c.db, job, c.portas, T0), 'ok');
  const m = c.db.prepare('SELECT * FROM midias').get() as { tipo: string; caminho: string; sha256: string; bytes: number };
  const bytes = new TextEncoder().encode('conteudo-A');
  assert.deepEqual({ tipo: m.tipo, sha: m.sha256, bytes: m.bytes, caminho: m.caminho }, { tipo: 'audio', sha: sha(bytes), bytes: bytes.length, caminho: `data/midias/${sha(bytes)}.ogg` });
  assert.equal(contar(c.db, 'mensagem_midia'), 1);
  const prox = pegarProximo(c.db, ['transcrever'], T0)!;
  assert.equal(prox.referencia, String(1), 'a fila de transcricao aponta para o id da midia');
  assert.equal(resumoDaFila(c.db).ok, 1);
});

test('PDF vai para converter_pdf, com extensao .pdf', async () => {
  const c = cenario(); c.entrar('P-1', pdf);
  const job = pegarProximo(c.db, ['baixar_midia'], T0)!;
  await processarBaixarMidia(c.db, job, c.portas, T0);
  assert.match((c.db.prepare('SELECT caminho FROM midias').get() as { caminho: string }).caminho, /\.pdf$/);
  assert.ok(pegarProximo(c.db, ['converter_pdf'], T0));
  assert.equal(pegarProximo(c.db, ['transcrever'], T0), null);
});

test('o MESMO arquivo reenviado em outra conversa: guardado e processado uma vez; as duas mensagens ficam ligadas a ele', async () => {
  const c = cenario(); c.entrar('P-1', pdf); c.entrar('P-2', pdf, '5511999990002@s.whatsapp.net');
  for (let i = 0; i < 2; i++) await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  assert.equal(contar(c.db, 'midias'), 1);
  assert.equal(contar(c.db, 'mensagem_midia'), 2);
  assert.equal(c.gravados.size, 1);
  assert.equal(resumoDaFila(c.db).pendente, 1, 'uma conversao so');
});

test('converter: o texto vai para TODAS as mensagens ligadas ao arquivo, e so para as que ainda estao sem texto', async () => {
  const c = cenario(); c.entrar('P-1', pdf); c.entrar('P-2', pdf, '5511999990002@s.whatsapp.net');
  for (let i = 0; i < 2; i++) await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  const tp: PortasTexto = { transcrever: async () => { throw new Error('nao deveria'); }, converterPdf: async (caminho) => ({ markdown: `# Ata\n\nConteudo de ${caminho.slice(-8)}` }) };
  assert.equal(await processarTexto(c.db, pegarProximo(c.db, ['converter_pdf'], T0)!, tp, T0), 'ok');
  const textos = (c.db.prepare('SELECT texto FROM mensagens ORDER BY id').all() as { texto: string }[]).map((r) => r.texto);
  assert.equal(textos.length, 2);
  assert.ok(textos.every((t) => t.startsWith('# Ata')));
});

test('um duplicado que chega DEPOIS de o arquivo ja ter sido processado ja nasce com o texto (sem nova conversao)', async () => {
  const c = cenario(); c.entrar('P-1', pdf);
  await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  await processarTexto(c.db, pegarProximo(c.db, ['converter_pdf'], T0)!, { transcrever: async () => ({ texto: '' }), converterPdf: async () => ({ markdown: 'texto da ata' }) }, T0);
  c.entrar('P-2', pdf, '5511999990002@s.whatsapp.net');
  await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  assert.equal(pegarProximo(c.db, ['converter_pdf'], T0), null);
  assert.equal((c.db.prepare("SELECT texto FROM mensagens WHERE wa_msg_id = 'P-2'").get() as { texto: string }).texto, 'texto da ata');
});

test('transcrever: texto na mensagem; silencio/ruido vira texto vazio (processado, sem fala), nao pendente', async () => {
  const c = cenario(); c.entrar('A-1', audio); c.entrar('B-1', audio, '5511999990002@s.whatsapp.net');
  for (let i = 0; i < 2; i++) await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  const falas = ['Oi Carlos, o prazo e de 30 dias.', '   '];
  const tp: PortasTexto = { transcrever: async () => ({ texto: falas.shift()! }), converterPdf: async () => { throw new Error('nao deveria'); } };
  await processarTexto(c.db, pegarProximo(c.db, ['transcrever'], T0)!, tp, T0);
  await processarTexto(c.db, pegarProximo(c.db, ['transcrever'], T0)!, tp, T0);
  const r = c.db.prepare('SELECT wa_msg_id, texto FROM mensagens ORDER BY wa_msg_id').all() as { wa_msg_id: string; texto: string | null }[];
  assert.deepEqual(r.map((x) => [x.wa_msg_id, x.texto]), [['A-1', 'Oi Carlos, o prazo e de 30 dias.'], ['B-1', '']]);
});

test('PDF escaneado (sem texto): abandono definitivo, sem repetir, e a mensagem continua sem texto', async () => {
  const c = cenario(); c.entrar('P-1', pdf);
  await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0);
  const r = await processarTexto(c.db, pegarProximo(c.db, ['converter_pdf'], T0)!, { transcrever: async () => ({ texto: '' }), converterPdf: async () => ({ markdown: '  \n ' }) }, T0);
  assert.equal(r, 'abandonada');
  assert.equal((c.db.prepare('SELECT erro FROM fila WHERE tipo = ?').get('converter_pdf') as { erro: string }).erro, 'sem_texto');
  assert.equal((c.db.prepare('SELECT texto FROM mensagens').get() as { texto: string | null }).texto, null);
});

test('falha ao baixar: reagenda com espera e guarda so o motivo; o arquivo nao e gravado', async () => {
  const c = cenario(); c.entrar('A-1', audio);
  const portas: PortasBaixar = { ...c.portas, baixar: async () => { throw new Error('410 media expirada'); } };
  const r = await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, portas, T0);
  assert.equal(r, 'reagendada');
  assert.equal(c.gravados.size, 0);
  assert.match((c.db.prepare('SELECT erro FROM fila').get() as { erro: string }).erro, /410/);
});

test('midia que o WhatsApp nao tem mais (403/404/410, reenvio sem resposta valida) vira indisponivel na 3a tentativa; erro de rede continua ate a 5a', async () => {
  const falhas: [string, number][] = [
    ['Failed to fetch stream from https://exemplo.invalido/arquivo', 3],
    ['Unsupported state or unable to authenticate data', 3],
    ['Media re-upload failed by device (NOT_FOUND)', 3],
    ['ECONNRESET socket hang up', 5]
  ];
  for (const [erro, esperado] of falhas) {
    const c = cenario(); c.entrar('A-1', audio);
    const portas: PortasBaixar = { ...c.portas, baixar: async () => { throw new Error(erro); } };
    let agora = T0, tentativas = 0, r = 'reagendada';
    while (r === 'reagendada' && tentativas < 10) {
      const j = pegarProximo(c.db, ['baixar_midia'], agora)!;
      r = await processarBaixarMidia(c.db, j, portas, agora);
      tentativas++; agora += 3 * 60 * 60_000;
    }
    assert.equal(r, 'abandonada', erro);
    assert.equal(tentativas, esperado, erro);
  }
});

test('arquivo vazio ou grande demais: abandono definitivo (sem encher o disco)', async () => {
  const c = cenario(); c.entrar('A-1', audio); c.entrar('P-1', pdf);
  const vazio: PortasBaixar = { ...c.portas, baixar: async () => new Uint8Array(0) };
  assert.equal(await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, vazio, T0), 'abandonada');
  const enorme: PortasBaixar = { ...c.portas, baixar: async () => ({ byteLength: 200 * 1024 * 1024 }) as unknown as Uint8Array };
  assert.equal(await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, enorme, T0), 'abandonada');
  assert.equal(c.gravados.size, 0);
});

test('mensagem sem descritor guardado (ou inexistente): abandono definitivo com motivo', async () => {
  const c = cenario();
  c.db.prepare("INSERT INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES ('baixar_midia', '999', 1, 1, 1)").run();
  assert.equal(await processarBaixarMidia(c.db, pegarProximo(c.db, ['baixar_midia'], T0)!, c.portas, T0), 'abandonada');
  assert.equal((c.db.prepare('SELECT erro FROM fila').get() as { erro: string }).erro, 'sem_descritor');
});
