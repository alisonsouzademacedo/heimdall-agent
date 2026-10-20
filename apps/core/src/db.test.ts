import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, versaoAtual, MIGRACOES, contar } from './db.ts';

const TABELAS_V1 = ['clientes', 'contatos', 'contato_jids', 'conversas', 'mensagens', 'midias', 'compromissos', 'sinais_potencial', 'feedback', 'ajustes_cliente', 'apagar_pendente', 'esquecimento', 'auditoria_apagar'];

function tabelas(db: ReturnType<typeof abrirBanco>): string[] {
  return (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[]).map((x) => x.name);
}

test('banco novo sobe ate a ultima versao com todas as tabelas', () => {
  const db = abrirBanco();
  assert.equal(versaoAtual(db), 0);
  assert.equal(migrar(db), MIGRACOES.at(-1)!.versao);
  const t = tabelas(db);
  for (const n of [...TABELAS_V1, 'onboarding_etapas', 'configuracao', 'relatorio_itens', 'casos_criterio', 'propostas_criterio', 'criterios_versoes', 'schema_versao']) assert.ok(t.includes(n), n);
});

test('migrar duas vezes nao muda nada (idempotente)', () => {
  const db = abrirBanco();
  migrar(db);
  const antes = tabelas(db);
  migrar(db);
  assert.deepEqual(tabelas(db), antes);
  assert.equal(contar(db, 'schema_versao'), MIGRACOES.length);
});

test('atualiza de uma versao antiga sem perder dados', () => {
  const db = abrirBanco();
  migrar(db, 1);
  assert.equal(versaoAtual(db), 1);
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  assert.equal(migrar(db), MIGRACOES.at(-1)!.versao);
  assert.equal(contar(db, 'clientes'), 1);
  assert.ok(tabelas(db).includes('onboarding_etapas'));
});

test('migracao que falha desfaz tudo (transacao) e nao marca a versao', () => {
  const db = abrirBanco();
  migrar(db, 1);
  db.exec('CREATE TABLE onboarding_etapas (x INTEGER)'); // conflito proposital com a v2
  assert.throws(() => migrar(db));
  assert.equal(versaoAtual(db), 1);
  assert.equal(tabelas(db).includes('configuracao'), false); // a v2 nao ficou pela metade
});

test('restricoes do esquema: papel invalido, mensagem duplicada e chave estrangeira', () => {
  const db = abrirBanco();
  migrar(db);
  assert.throws(() => db.prepare("INSERT INTO contatos (nome, papel) VALUES ('x','hacker')").run());
  db.prepare("INSERT INTO conversas (jid, tipo) VALUES ('1@s.whatsapp.net','dm')").run();
  const ins = () => db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (1,'A',0,1,'texto','notify')").run();
  ins();
  assert.throws(ins); // unico (conversa, id do WhatsApp)
  assert.throws(() => db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (99,'B',0,1,'texto','notify')").run()); // conversa inexistente
  assert.throws(() => db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (1,'C',0,1,'video','notify')").run()); // tipo fora da lista
});

test('contar recusa nome de tabela perigoso', () => {
  const db = abrirBanco();
  migrar(db);
  assert.throws(() => contar(db, 'clientes; DROP TABLE clientes'));
});

test('v4: fila durável, origem das mídias e sincronização com o Hindsight existem e são idempotentes', () => {
  const db = abrirBanco(); migrar(db);
  const t = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name);
  for (const n of ['fila', 'midias_origem', 'sync_hindsight']) assert.ok(t.includes(n), n);
  db.prepare("INSERT INTO fila (tipo, referencia, criado_em, atualizado_em, proximo_em) VALUES ('baixar_midia', '1', 1, 1, 1)").run();
  assert.throws(() => db.prepare("INSERT INTO fila (tipo, referencia, criado_em, atualizado_em, proximo_em) VALUES ('baixar_midia', '1', 2, 2, 2)").run(), /UNIQUE/);
  assert.throws(() => db.prepare("INSERT INTO fila (tipo, referencia, criado_em, atualizado_em, proximo_em) VALUES ('enviar_mensagem', '1', 1, 1, 1)").run(), /CHECK/, 'tipo desconhecido (inclusive "enviar") e recusado');
  assert.throws(() => db.prepare("INSERT INTO fila (tipo, referencia, estado, criado_em, atualizado_em, proximo_em) VALUES ('extrair', '2', 'talvez', 1, 1, 1)").run(), /CHECK/);
  db.prepare("INSERT INTO sync_hindsight (tipo, referencia, document_id, hash_conteudo, sincronizado_em) VALUES ('conversa', 'a', 'doc-a', 'h1', 1)").run();
  assert.throws(() => db.prepare("INSERT INTO sync_hindsight (tipo, referencia, document_id, hash_conteudo, sincronizado_em) VALUES ('conversa', 'a', 'doc-a2', 'h2', 2)").run(), /UNIQUE/);
  assert.equal(migrar(db), MIGRACOES.at(-1)!.versao, 'rodar de novo nao muda nada');
});
