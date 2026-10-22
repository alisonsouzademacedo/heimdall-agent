import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  for (const n of [...TABELAS_V1, 'onboarding_etapas', 'configuracao', 'relatorio_itens', 'casos_criterio', 'propostas_criterio', 'criterios_versoes', 'crm_leads', 'crm_propostas', 'schema_versao']) assert.ok(t.includes(n), n);
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

test('v5: mensagem_midia liga varias mensagens ao MESMO arquivo (o mesmo PDF reenviado a varios clientes e processado uma vez)', () => {
  const db = abrirBanco(); migrar(db);
  const t = (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map((r) => r.name);
  assert.ok(t.includes('mensagem_midia'));
  db.exec("INSERT INTO conversas (jid, tipo) VALUES ('a@s.whatsapp.net','dm')");
  for (const id of ['m1', 'm2']) db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (1, ?, 0, 1, 'pdf', 'notify')").run(id);
  db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, bytes, criada_em) VALUES (1, 'pdf', 'data/midias/aa.pdf', 'aa', 10, 1)").run();
  db.prepare('INSERT INTO mensagem_midia (mensagem_id, midia_id) VALUES (1, 1)').run();
  db.prepare('INSERT INTO mensagem_midia (mensagem_id, midia_id) VALUES (2, 1)').run();
  assert.throws(() => db.prepare('INSERT INTO mensagem_midia (mensagem_id, midia_id) VALUES (2, 1)').run(), /UNIQUE|PRIMARY/);
});

test('v7: memoria_apagar guarda so o id do documento, com estado e tentativas; id repetido nao duplica', () => {
  const db = abrirBanco(); migrar(db);
  db.prepare("INSERT INTO memoria_apagar (document_id, pedido_em) VALUES ('conv:1:2025-10-10', 1)").run();
  assert.throws(() => db.prepare("INSERT INTO memoria_apagar (document_id, pedido_em) VALUES ('conv:1:2025-10-10', 2)").run(), /UNIQUE|PRIMARY/);
  assert.throws(() => db.prepare("INSERT INTO memoria_apagar (document_id, pedido_em, estado) VALUES ('x', 1, 'talvez')").run(), /CHECK/);
  const colunas = (db.prepare('PRAGMA table_info(memoria_apagar)').all() as { name: string }[]).map((c) => c.name);
  assert.deepEqual(colunas.filter((c) => /texto|conteudo|nome|mensagem/i.test(c)), [], 'nenhum conteudo de conversa nesta tabela');
});

// Os 5 processos (tela, listener, executor, memoria, ponte) sobem juntos e cada um chama migrar() no MESMO acervo.sqlite. Se a versao e lida
// fora da transacao, outro processo pode aplicar a mesma migracao entre a leitura e o BEGIN e o segundo morre com "table ... already exists"
// (LICOES.md, 2026-10-20: o processo da memoria nao subiu na 1a execucao com o launcher). A corrida e simulada de forma deterministica:
// a conexao A e embrulhada para que, no instante do primeiro BEGIN, a conexao B ja termine todas as migracoes.
test('migrar: outro processo aplica as migracoes entre a leitura da versao e o BEGIN: nao quebra e termina na ultima versao', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hm-mig-'));
  const arquivo = join(dir, 'acervo.sqlite');
  const a = abrirBanco(arquivo);
  const b = abrirBanco(arquivo);
  try {
    a.exec('PRAGMA busy_timeout = 5000');
    b.exec('PRAGMA busy_timeout = 5000');
    let disparou = false;
    const aComCorrida = new Proxy(a, {
      get(alvo, prop) {
        if (prop === 'exec') {
          return (sql: string) => {
            if (!disparou && /^BEGIN/i.test(sql)) { disparou = true; migrar(b); }
            return alvo.exec(sql);
          };
        }
        const v = Reflect.get(alvo, prop);
        return typeof v === 'function' ? v.bind(alvo) : v;
      }
    });
    assert.equal(migrar(aComCorrida as typeof a), MIGRACOES.at(-1)!.versao);
    assert.ok(disparou, 'a corrida foi simulada');
    assert.equal(versaoAtual(a), MIGRACOES.at(-1)!.versao);
    const aplicadas = (a.prepare('SELECT versao FROM schema_versao ORDER BY versao').all() as { versao: number }[]).map((r) => r.versao);
    assert.deepEqual(aplicadas, MIGRACOES.map((m) => m.versao), 'cada migracao aparece uma vez so');
  } finally {
    a.close(); b.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

// 2026-10-21: no 1o uso real, o executor morreu na subida com "database is locked" (errcode 261, SQLITE_BUSY_RECOVERY). Os 5 processos abrem o mesmo
// acervo.sqlite ao mesmo tempo (o primeiro precisa recuperar o WAL) e o primeiro comando de cada um rodava ANTES de definir a espera por trava.
// A espera tem de valer desde a abertura, para qualquer comando.
test('abrirBanco define a espera por trava (busy_timeout = 5000) logo na abertura, antes de qualquer outro comando', () => {
  const dir = mkdtempSync(join(tmpdir(), 'hm-busy-'));
  const db = abrirBanco(join(dir, 'acervo.sqlite'));
  try {
    const r = db.prepare('PRAGMA busy_timeout').get() as { timeout: number };
    assert.equal(r.timeout, 5000);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

