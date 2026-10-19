import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, contar, type Banco } from './db.ts';
import { registrarMensagem } from './ingestao.ts';
import { ehMensagemDoSelfChat } from './envio.ts';
import { proporApagarCliente, proporLimparMidiasAntigas, confirmarApagar, reaplicarEsquecimento, listaEsquecimento, VALIDADE_CODIGO_MS, RETENCAO_MIDIAS_DIAS } from './apagar.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net', lid: '98765432100001:12@lid' };
const DIA = 86_400_000;
const AGORA = Date.parse('2026-10-21T12:00:00Z');
const nada = () => {};

function novoBanco(): Banco { const db = abrirBanco(); migrar(db); return db; }

// Cria um cliente com contato, conversa, mensagens, midia, compromisso, sinal e ajuste.
function semear(db: Banco, clienteId: number, nome: string, jid: string, criadaMidia = AGORA): void {
  db.prepare('INSERT INTO clientes (id, nome) VALUES (?, ?)').run(clienteId, nome);
  registrarMensagem(db, { waMsgId: `${nome}-1`, remoteJid: jid, fromMe: false, quandoMs: 1000, tipo: 'texto', texto: `segredo de ${nome}`, origem: 'notify' }, DONO);
  registrarMensagem(db, { waMsgId: `${nome}-2`, remoteJid: jid, fromMe: true, quandoMs: 2000, tipo: 'texto', texto: 'resposta', origem: 'notify' }, DONO);
  registrarMensagem(db, { waMsgId: `${nome}-3`, remoteJid: jid, fromMe: false, quandoMs: 3000, tipo: 'audio', origem: 'notify' }, DONO);
  const contato = (db.prepare('SELECT contato_id AS c FROM contato_jids WHERE jid = ?').get(jid.split(':')[0]!) as { c: number }).c;
  db.prepare('UPDATE contatos SET cliente_id = ?, papel = ? WHERE id = ?').run(clienteId, 'cliente', contato);
  const audioId = (db.prepare("SELECT id FROM mensagens WHERE wa_msg_id = ?").get(`${nome}-3`) as { id: number }).id;
  db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, criada_em) VALUES (?, 'audio', ?, ?, ?)").run(audioId, `/midias/${nome}.ogg`, `hash-${nome}`, criadaMidia);
  db.prepare("INSERT INTO compromissos (cliente_id, tipo, titulo) VALUES (?, 'reuniao', 'Reuniao')").run(clienteId);
  db.prepare("INSERT INTO sinais_potencial (cliente_id, tipo, em) VALUES (?, 'perguntou_preco', 1)").run(clienteId);
  db.prepare("INSERT INTO ajustes_cliente (cliente_id, tipo, criado_em) VALUES (?, 'silenciar', 1)").run(clienteId);
  db.prepare("INSERT INTO feedback (texto, tipo, cliente_id, criado_em) VALUES ('nota', 2, ?, 1)").run(clienteId);
}

const ALFA = '5511988887777@s.whatsapp.net';
const BETA = '5511977776666@s.whatsapp.net';

test('etapa 1 nao apaga nada e mostra o escopo exato com a frase a digitar', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const antes = contar(db, 'mensagens');
  const p = proporApagarCliente(db, 1, AGORA)!;
  assert.match(p.codigo, /^[A-Z2-9]{6}$/);
  assert.equal(p.frase, `confirmo apagar ${p.codigo}`);
  assert.deepEqual(p.escopo.contagens, { mensagens: 3, midias: 1, compromissos: 1, sinais: 1, ajustes: 1, feedback: 1, contatos: 1 });
  assert.equal(contar(db, 'mensagens'), antes);
  assert.equal(contar(db, 'clientes'), 1);
});

test('cliente inexistente nao gera proposta', () => {
  assert.equal(proporApagarCliente(novoBanco(), 99, AGORA), null);
});

test('etapa 2 so executa com a frase exata, no self-chat e com o codigo certo', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  const apagados: string[] = [];
  const r = confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 1000, (c) => apagados.push(c));
  assert.equal(r.ok, true);
  assert.deepEqual(apagados, ['/midias/Alfa.ogg']);
  for (const t of ['clientes', 'contatos', 'contato_jids', 'mensagens', 'midias', 'compromissos', 'sinais_potencial', 'ajustes_cliente', 'feedback']) assert.equal(contar(db, t), 0, t);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM conversas WHERE tipo = 'dm'").get()!.n, 0);
});

test('mensagem de CLIENTE com a frase de confirmacao nao executa nada', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  // O codigo calcula a origem a partir da conversa; uma mensagem do cliente nunca e self-chat:
  const origem = { selfChat: ehMensagemDoSelfChat({ remoteJid: ALFA, fromMe: false }, DONO) };
  const r = confirmarApagar(db, p.frase, origem, AGORA + 1000, nada);
  assert.deepEqual(r, { ok: false, motivo: 'origem_nao_permitida' });
  assert.equal(contar(db, 'clientes'), 1);
  // Mesmo se o dono escrevesse a frase em conversa com o cliente, nao e self-chat:
  const dmDono = { selfChat: ehMensagemDoSelfChat({ remoteJid: ALFA, fromMe: true }, DONO) };
  assert.equal(confirmarApagar(db, p.frase, dmDono, AGORA + 1000, nada).ok, false);
  assert.equal(contar(db, 'mensagens'), 3);
});

test('texto que nao e exatamente a frase nao e comando', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  for (const t of [`por favor confirmo apagar ${p.codigo}`, `confirmo apagar ${p.codigo} agora`, `apagar ${p.codigo}`, p.codigo, '', 'confirmo apagar']) {
    assert.deepEqual(confirmarApagar(db, t, { selfChat: true }, AGORA + 1000, nada), { ok: false, motivo: 'nao_e_comando' }, t);
  }
  assert.equal(contar(db, 'clientes'), 1);
});

test('codigo errado nao apaga e apos 3 erros as propostas caem', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  for (let i = 0; i < 3; i++) assert.deepEqual(confirmarApagar(db, 'confirmo apagar ZZZZZZ', { selfChat: true }, AGORA + 1000, nada), { ok: false, motivo: 'codigo_invalido' });
  assert.equal(confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 2000, nada).ok, false); // o codigo certo ja foi invalidado
  assert.equal(contar(db, 'clientes'), 1);
});

test('codigo expira em 10 minutos', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  assert.deepEqual(confirmarApagar(db, p.frase, { selfChat: true }, AGORA + VALIDADE_CODIGO_MS + 1, nada), { ok: false, motivo: 'codigo_expirado' });
  assert.equal(contar(db, 'clientes'), 1);
});

test('codigo e de uso unico', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  assert.equal(confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 1, nada).ok, true);
  assert.equal(confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 2, nada).ok, false);
});

test('uma nova proposta para o mesmo cliente invalida a anterior', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const a = proporApagarCliente(db, 1, AGORA)!;
  const b = proporApagarCliente(db, 1, AGORA + 5)!;
  assert.equal(confirmarApagar(db, a.frase, { selfChat: true }, AGORA + 10, nada).ok, a.codigo === b.codigo);
  assert.equal(contar(db, 'apagar_pendente') <= 1, true);
});

test('apagar um cliente NAO toca em outro', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA); semear(db, 2, 'Beta', BETA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 1, nada);
  assert.equal(contar(db, 'clientes'), 1);
  assert.equal(contar(db, 'mensagens'), 3);
  assert.equal(contar(db, 'midias'), 1);
  assert.equal((db.prepare('SELECT texto FROM mensagens WHERE wa_msg_id = ?').get('Beta-1') as { texto: string }).texto, 'segredo de Beta');
  assert.equal(contar(db, 'compromissos'), 1);
});

test('mensagens do cliente em grupo tambem saem; mensagens dos outros no grupo ficam', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA); semear(db, 2, 'Beta', BETA);
  registrarMensagem(db, { waMsgId: 'g1', remoteJid: '1-2@g.us', participante: ALFA, fromMe: false, quandoMs: 9, tipo: 'texto', texto: 'alfa no grupo', origem: 'notify' }, DONO);
  registrarMensagem(db, { waMsgId: 'g2', remoteJid: '1-2@g.us', participante: BETA, fromMe: false, quandoMs: 10, tipo: 'texto', texto: 'beta no grupo', origem: 'notify' }, DONO);
  confirmarApagar(db, proporApagarCliente(db, 1, AGORA)!.frase, { selfChat: true }, AGORA + 1, nada);
  const textos = (db.prepare("SELECT texto FROM mensagens WHERE wa_msg_id LIKE 'g%'").all() as { texto: string }[]).map((x) => x.texto);
  assert.deepEqual(textos, ['beta no grupo']);
});

test('a auditoria guarda so contagens, sem nome nem texto', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  confirmarApagar(db, proporApagarCliente(db, 1, AGORA)!.frase, { selfChat: true }, AGORA + 1, nada);
  const linhas = JSON.stringify(db.prepare('SELECT * FROM auditoria_apagar').all());
  assert.ok(!linhas.includes('Alfa'));
  assert.ok(!linhas.includes('segredo'));
  assert.ok(linhas.includes('"mensagens":3') || linhas.includes('\\"mensagens\\":3'));
});

test('a lista de esquecimento guarda so um identificador aleatorio', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const uid = (db.prepare('SELECT uid FROM clientes WHERE id = 1').get() as { uid: string }).uid;
  assert.match(uid, /^[0-9a-f]{32}$/);
  confirmarApagar(db, proporApagarCliente(db, 1, AGORA)!.frase, { selfChat: true }, AGORA + 1, nada);
  assert.deepEqual(listaEsquecimento(db), [uid]);
});

test('reaplicar o esquecimento depois de restaurar um backup antigo apaga o cliente de novo, e so ele', () => {
  const antigo = novoBanco(); semear(antigo, 1, 'Alfa', ALFA); semear(antigo, 2, 'Beta', BETA);
  const uidAlfa = (antigo.prepare('SELECT uid FROM clientes WHERE id = 1').get() as { uid: string }).uid;
  // O backup antigo nao conhece o apagamento; a lista externa (arquivo proprio) conhece.
  const apagados: string[] = [];
  const reaplicados = reaplicarEsquecimento(antigo, [uidAlfa], AGORA, (c) => apagados.push(c));
  assert.deepEqual(reaplicados, [uidAlfa]);
  assert.equal(contar(antigo, 'clientes'), 1);
  assert.deepEqual(apagados, ['/midias/Alfa.ogg']);
  assert.equal(reaplicarEsquecimento(antigo, [uidAlfa], AGORA).length, 0); // idempotente
});

test('um cliente NOVO que reaproveite o numero do apagado nao e atingido (a chave e o uid, nao o numero)', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const uidAntigo = (db.prepare('SELECT uid FROM clientes WHERE id = 1').get() as { uid: string }).uid;
  confirmarApagar(db, proporApagarCliente(db, 1, AGORA)!.frase, { selfChat: true }, AGORA + 1, nada);
  semear(db, 1, 'Novo', '5511955554444@s.whatsapp.net'); // mesmo numero de cliente (1), outro uid
  assert.deepEqual(reaplicarEsquecimento(db, [uidAntigo], AGORA + 2), []);
  assert.equal(contar(db, 'clientes'), 1);
});

test('limpar midias antigas: so arquivos com mais de 90 dias; texto e registro ficam', () => {
  const db = novoBanco();
  semear(db, 1, 'Velho', ALFA, AGORA - (RETENCAO_MIDIAS_DIAS + 1) * DIA);
  semear(db, 2, 'Novo', BETA, AGORA - 10 * DIA);
  const p = proporLimparMidiasAntigas(db, AGORA);
  assert.deepEqual(p.escopo.contagens, { midias: 1 });
  const apagados: string[] = [];
  const r = confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 1, (c) => apagados.push(c));
  assert.equal(r.ok, true);
  assert.deepEqual(apagados, ['/midias/Velho.ogg']);
  assert.equal(contar(db, 'mensagens'), 6); // nenhuma mensagem apagada
  assert.equal(contar(db, 'midias'), 2); // os registros ficam
  assert.equal((db.prepare("SELECT caminho FROM midias WHERE sha256 = 'hash-Novo'").get() as { caminho: string }).caminho, '/midias/Novo.ogg');
  assert.equal((db.prepare("SELECT caminho FROM midias WHERE sha256 = 'hash-Velho'").get() as { caminho: string }).caminho, '');
});

test('exatamente 90 dias ainda nao e antigo', () => {
  const db = novoBanco();
  semear(db, 1, 'Limite', ALFA, AGORA - RETENCAO_MIDIAS_DIAS * DIA);
  assert.deepEqual(proporLimparMidiasAntigas(db, AGORA).escopo.contagens, { midias: 0 });
});

test('se o banco falha no meio, nada e apagado (transacao) e nenhum arquivo e removido', () => {
  const db = novoBanco(); semear(db, 1, 'Alfa', ALFA);
  const p = proporApagarCliente(db, 1, AGORA)!;
  db.exec('DROP TABLE auditoria_apagar'); // forca erro no fim da execucao
  const apagados: string[] = [];
  assert.throws(() => confirmarApagar(db, p.frase, { selfChat: true }, AGORA + 1, (c) => apagados.push(c)));
  assert.equal(contar(db, 'clientes'), 1);
  assert.equal(contar(db, 'mensagens'), 3);
  assert.deepEqual(apagados, []);
});
