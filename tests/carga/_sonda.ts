import { performance } from 'node:perf_hooks';
import { abrirBanco, migrar, contar } from '../../apps/core/src/db.ts';
import { criarEscuta } from '../../apps/core/src/whatsapp/escuta.ts';
import { agendarExtracao } from '../../apps/core/src/extracao.ts';
import { agendarRetain } from '../../apps/core/src/memoria.ts';
import { rodarCiclo } from '../../apps/memoria/src/ciclo.ts';
import { gerarHistorico, emLotes, DONO, AGORA } from './gerador.ts';
const N = Number(process.argv[2] ?? 20000);
const db = abrirBanco(); migrar(db);
const e = criarEscuta(db, DONO);
for (const l of emLotes(gerarHistorico({ mensagens: N, clientes: Math.floor(N / 30) }), 500)) e.mensagens(l, 'historico');
for (const c of db.prepare("SELECT DISTINCT contato_id AS id FROM contato_jids").all() as { id: number }[]) {
  const k = Number(db.prepare('INSERT INTO clientes (nome) VALUES (?)').run(`Cliente ${c.id}`).lastInsertRowid);
  db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = ?").run(k, c.id);
}
console.log('mensagens', contar(db, 'mensagens'), 'clientes', contar(db, 'clientes'));
let t = performance.now(); const ext = agendarExtracao(db, AGORA); console.log('agendarExtracao', ext.length, 'jobs em', Math.round(performance.now() - t), 'ms');
t = performance.now(); const ret = agendarRetain(db, AGORA); console.log('agendarRetain', ret.length, 'jobs em', Math.round(performance.now() - t), 'ms');
t = performance.now(); agendarRetain(db, AGORA); console.log('agendarRetain (2a vez, nada novo)', Math.round(performance.now() - t), 'ms');
const porta = { reter: async () => {} };
t = performance.now(); for (let i = 0; i < 10; i++) await rodarCiclo(db, porta, AGORA); console.log('10 ciclos da memoria', Math.round(performance.now() - t), 'ms');
