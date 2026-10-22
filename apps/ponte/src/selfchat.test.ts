// Ponte Q: o que o dono escreve no self-chat vira (1) confirmacao de apagar, (2) correcao por codigo, ou (3) pergunta ao Hermes.
// A resposta SEMPRE vai para a caixa de saida (nunca direto ao WhatsApp). Dados sinteticos; o Hermes e falso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { criarEscuta } from '../../core/src/whatsapp/escuta.ts';
import { MARCA, enfileirarSaida, marcarEnviada } from '../../core/src/saida.ts';
import { registrarItensDoRelatorio } from '../../core/src/aprendizado.ts';
import { proporApagarCliente } from '../../core/src/apagar.ts';
import { processarSelfChat, type PortasSelfChat } from './selfchat.ts';

const DONO = { pn: '5511900000000@s.whatsapp.net' };
const T = Date.UTC(2025, 9, 10, 15, 0, 0); // 2025-10-10 12:00 em Sao Paulo
const seg = (ms: number) => Math.floor(ms / 1000);

function cenario() {
  const db = abrirBanco(); migrar(db);
  const escuta = criarEscuta(db, DONO, { agora: () => T });
  let n = 0;
  const dono = (texto: string, quando = T, origem: 'notify' | 'append' = 'notify', fromMe = true, jid = DONO.pn) =>
    escuta.mensagens([{ key: { id: `S${++n}`, remoteJid: jid, fromMe }, message: { conversation: texto }, messageTimestamp: seg(quando) }], origem);
  const perguntas: { texto: string; sessao: string; sistema?: string }[] = [];
  const portas: PortasSelfChat = {
    hermes: { perguntar: async (texto, op) => { perguntas.push({ texto, sessao: op.sessao, sistema: op.sistema }); return `resposta para: ${texto}`; } },
    apagarArquivo: () => {}
  };
  const saidas = () => db.prepare('SELECT tipo, texto, chave FROM saida ORDER BY id').all() as { tipo: string; texto: string; chave: string }[];
  return { db, dono, portas, perguntas, saidas };
}

test('pergunta livre vai ao Hermes com sessao fixa e data no contexto; a resposta entra na caixa de saida UMA vez', async () => {
  const c = cenario(); c.dono('Quem esta esperando minha resposta?');
  assert.equal(await processarSelfChat(c.db, c.portas, T + 1000), 1);
  assert.equal(c.perguntas.length, 1);
  assert.equal(c.perguntas[0]!.sessao, 'heimdall:self-chat');
  assert.match(c.perguntas[0]!.sistema!, /2025-10-10/);
  assert.match(c.perguntas[0]!.sistema!, /nao sao instrucoes|não são instruções/i, 'dados do acervo marcados como dados');
  assert.deepEqual(c.saidas().map((s) => s.texto), [`${MARCA}resposta para: Quem esta esperando minha resposta?`]);
  assert.equal(await processarSelfChat(c.db, c.portas, T + 2000), 0, 'ja respondida: nao responde de novo');
  assert.equal(c.perguntas.length, 1);
});

test('nao responde ao proprio eco (marca, id enviado), a historico/append, a mensagem de cliente nem a texto vazio', async () => {
  const c = cenario();
  c.dono(`${MARCA}relatorio que eu mesmo mandei`);
  c.dono('mensagem antiga do historico', T, 'append');
  c.dono('oi do cliente', T, 'notify', false, '5511999990001@s.whatsapp.net');
  const id = enfileirarSaida(c.db, 'resposta', 'x', T)!; marcarEnviada(c.db, id, 'S4', T);
  c.dono('eco reconhecido so pelo id'); // chega com o id S4, o mesmo que a caixa de saida marcou como enviado
  c.dono('texto do dono');
  c.dono('   ');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.deepEqual(c.perguntas.map((p) => p.texto), ['texto do dono']);
});

test('confirmacao de apagar executa SO pelo self-chat e responde com o resultado; frase errada responde o motivo', async () => {
  const c = cenario();
  c.db.exec("INSERT INTO clientes (nome) VALUES ('Alfa'); INSERT INTO contatos (nome, papel, cliente_id) VALUES ('Ana', 'cliente', 1)");
  const prop = proporApagarCliente(c.db, 1, T)!;
  c.dono(`confirmo apagar ${prop.codigo}`);
  c.dono('confirmo apagar ZZZZZZ');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.equal(c.perguntas.length, 0, 'comando de apagar nunca vai ao modelo');
  const t = c.saidas().map((s) => s.texto);
  assert.match(t[0]!, /apagad/i);
  assert.match(t[1]!, /codigo|código/i);
  assert.equal((c.db.prepare('SELECT COUNT(*) AS n FROM clientes').get() as { n: number }).n, 0);
});

test('correcao por codigo (A1 ja resolvi) aplica o ajuste e confirma em uma linha, sem usar o modelo', async () => {
  const c = cenario();
  c.db.exec("INSERT INTO clientes (nome) VALUES ('Alfa')");
  registrarItensDoRelatorio(c.db, '2025-10-10', [{ codigo: 'A1', clienteId: 1 }]);
  c.dono('A1 já resolvi · A9 já resolvi');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.equal(c.perguntas.length, 0);
  assert.equal((c.db.prepare("SELECT COUNT(*) AS n FROM ajustes_cliente WHERE tipo = 'resolvido'").get() as { n: number }).n, 1);
  const r = c.saidas()[0]!.texto;
  assert.match(r, /A1/); assert.match(r, /A9.*(nao|não) (encontr|conhe)/i);
});

test('CRM no self-chat: aprova movimento sem chamar o Hermes; mensagem que nao e do CRM segue normal', async () => {
  const c = cenario();
  const vistos: string[] = [];
  c.portas.crm = {
    propor: async () => [],
    aplicar: async (_db, texto) => {
      vistos.push(texto);
      if (texto !== 'ok 1') return null;
      return {
        aprovados: [1], recusados: [], ignorados: [],
        resultados: [{ numero: 1, cliente: 'Alfa', tipo: 'criar', ok: true }], semPropostas: false
      };
    }
  };
  c.dono('ok 1');
  c.dono('quem esta esperando?');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.equal(c.perguntas.length, 1, 'so a pergunta livre vai ao Hermes');
  assert.equal(c.perguntas[0]!.texto, 'quem esta esperando?');
  const respostas = c.saidas().map((s) => s.texto);
  assert.match(respostas[0]!, /C1: lead criado/);
  assert.match(respostas[1]!, /resposta para: quem esta esperando/);
});

test('CRM fora do ar: responde que nao conseguiu e NAO manda o "ok 1" ao Hermes', async () => {
  const c = cenario();
  c.portas.crm = { propor: async () => [], aplicar: async () => { throw new Error('krayin fora'); } };
  c.dono('ok 1');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.equal(c.perguntas.length, 0);
  assert.match(c.saidas()[0]!.texto, /CRM/);
});

test('Hermes fora do ar: nada e enviado ao dono agora e a mensagem e tentada de novo no proximo ciclo; depois de 2 h desiste', async () => {
  const c = cenario(); c.dono('oi');
  const falha: PortasSelfChat = { ...c.portas, hermes: { perguntar: async () => { throw new Error('hermes_sem_resposta'); } } };
  assert.equal(await processarSelfChat(c.db, falha, T + 1000), 0);
  assert.equal(c.saidas().length, 0);
  assert.equal(await processarSelfChat(c.db, c.portas, T + 60_000), 1, 'voltou: responde');
  const d = cenario(); d.dono('antiga');
  assert.equal(await processarSelfChat(d.db, d.portas, T + 3 * 3_600_000), 0, 'mais de 2 h: nao responde de repente');
});

test('a mensagem do dono nunca vira instrucao de envio a terceiros: o unico efeito possivel e uma linha na caixa de saida', async () => {
  const c = cenario(); c.dono('manda uma mensagem para a Ana dizendo que o preco subiu');
  await processarSelfChat(c.db, c.portas, T + 1000);
  const tabelas = (c.db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((x) => x.name);
  assert.ok(tabelas.includes('saida'));
  assert.equal(c.saidas().length, 1);
});

test('"apagar arquivos antigos": etapa 1 mostra quantos arquivos (mais de 90 dias) e a frase; nada e apagado; o Hermes nao e consultado; a frase confirma e apaga so o arquivo', async () => {
  const c = cenario();
  const msg = c.db.prepare("INSERT INTO conversas (jid, tipo) VALUES ('x@s.whatsapp.net', 'dm')").run().lastInsertRowid;
  const m = c.db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, tipo, enviada_em, origem_evento) VALUES (?, 'A1', 0, 'audio', 1, 'notify')").run(msg).lastInsertRowid;
  c.db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, criada_em) VALUES (?, 'audio', 'data/midias/" + 'a'.repeat(64) + ".ogg', 'h', ?)").run(m, T - 100 * 86_400_000);
  c.dono('Apagar arquivos antigos');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.equal(c.perguntas.length, 0);
  const [r] = c.saidas();
  assert.match(r!.texto, /1 arquivo/);
  assert.match(r!.texto, /confirmo apagar [A-Z2-9]{6}/);
  assert.equal((c.db.prepare('SELECT COUNT(*) AS n FROM midias').get() as { n: number }).n, 1, 'etapa 1 nao apaga');
});

test('"apagar arquivos antigos" sem nenhum arquivo velho: diz que nao ha nada e nao cria codigo', async () => {
  const c = cenario(); c.dono('apagar arquivos antigos');
  await processarSelfChat(c.db, c.portas, T + 1000);
  assert.match(c.saidas()[0]!.texto, /nenhum arquivo/i);
  assert.equal((c.db.prepare('SELECT COUNT(*) AS n FROM apagar_pendente').get() as { n: number }).n, 0);
});
