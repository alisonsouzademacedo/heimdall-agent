// TESTE REAL da extracao (roda por tests/infra/smoke_extracao_real.sh): usa o Hermes de verdade (gasta cota do ChatGPT), numa COPIA do acervo, nos N dias de
// conversa MAIS RICOS, e confere o que sobrevive ao validador. Existe porque o teste com modelo falso respondia o formato que EU imaginava e deixou passar um
// defeito real (o modelo manda mensagem_origem como texto e o validador descartava tudo; 2026-10-23, 56 dias gastos sem efeito). NUNCA imprime conteudo de conversa:
// so contagens.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { abrirBanco, migrar } from '../../apps/core/src/db.ts';
import { agendarExtracao, contarDescartes, diasDeExtracaoPendentes, montarPedidoDeExtracao, processarExtrair, extracaoLiberada, definirExtracaoLiberada } from '../../apps/core/src/extracao.ts';
import { pegarProximo } from '../../apps/core/src/fila.ts';
import { resumoDeConsumo } from '../../apps/core/src/consumo.ts';
import { criarClienteHermes } from '../../apps/ponte/src/hermes.ts';
import { escolhaDeModelo, consumoParaBanco } from '../../apps/ponte/src/modelo-por-tarefa.ts';
import { lerChaveDoEnv } from '../../apps/ponte/src/ciclo.ts';

const [, , copia, quantos = '8'] = process.argv;
if (!copia) { console.error('uso: node tests/infra/extracao-real.ts <copia-do-acervo.sqlite> [N]'); process.exit(2); }
const N = Math.max(1, Math.min(40, Number(quantos)));
const db = abrirBanco(copia); migrar(db);
db.exec('PRAGMA busy_timeout = 10000');
const chave = lerChaveDoEnv(readFileSync('infra/compose/.env', 'utf8'));
if (!chave) { console.error('sem API_SERVER_KEY em infra/compose/.env'); process.exit(2); }
const hermes = criarClienteHermes({ url: process.env.HERMES_URL ?? 'http://127.0.0.1:8642', chave, escolherModelo: escolhaDeModelo(db), aoConsumir: consumoParaBanco(db) });
const instrucoes = readFileSync('prompts/extracao/compromissos-e-sinais.md', 'utf8');

// Os N dias mais ricos (mais mensagens). Marca todos os dias como "mudaram" na COPIA para que entrem na fila.
db.prepare("UPDATE sync_hindsight SET hash_conteudo = 'reprocessar' WHERE tipo = 'ext'").run();
const pend = diasDeExtracaoPendentes(db, Date.now()).refs;
const ricos = pend.map((r) => ({ r, n: montarPedidoDeExtracao(db, r, instrucoes)?.ids.size ?? 0 })).sort((a, b) => b.n - a.n).slice(0, N).map((x) => x.r);
if (ricos.length === 0) { console.log('  [NAO EXECUTADO] nao ha dias de conversa de clientes para extrair (cadastre os clientes antes)'); process.exit(0); }
const escolhidos = new Set(ricos);
const base = resumoDeConsumo(db).hoje.extracao; // a copia ja traz o consumo anterior: so conta o que ESTE teste gastou
definirExtracaoLiberada(db, true);
agendarExtracao(db, Date.now());
db.prepare("UPDATE fila SET estado = 'ok' WHERE tipo = 'extrair' AND estado = 'pendente' AND referencia NOT IN (" + ricos.map(() => '?').join(',') + ')').run(...ricos);

const porta = { extrair: (pedido: string, sessao: string) => hermes.perguntar(pedido, { sessao }) };
const resultados: string[] = [];
for (let j = pegarProximo(db, ['extrair'], Date.now()); j; j = pegarProximo(db, ['extrair'], Date.now())) {
  if (!escolhidos.has(j.referencia)) continue;
  resultados.push(await processarExtrair(db, j, porta, instrucoes, Date.now()));
}
const n = (sql: string): number => (db.prepare(sql).get() as { n: number }).n;
const compromissos = n('SELECT COUNT(*) AS n FROM compromissos'), sinais = n('SELECT COUNT(*) AS n FROM sinais_potencial');
const extraidos = n("SELECT COUNT(*) AS n FROM clientes WHERE nome_origem = 'extraido'"), comEmpresa = n('SELECT COUNT(*) AS n FROM clientes WHERE empresa IS NOT NULL');
const descartes = contarDescartes(db);
const total = resumoDeConsumo(db).hoje.extracao;
const uso = { entrada: total.entrada - base.entrada, saida: total.saida - base.saida, chamadas: total.chamadas - base.chamadas };
console.log(`dias extraidos: ${resultados.length} (ok: ${resultados.filter((r) => r === 'ok').length}) | compromissos: ${compromissos} | sinais: ${sinais} | clientes com nome extraido: ${extraidos} | com empresa: ${comEmpresa} | descartes: ${descartes}`);
console.log(`tokens GASTOS NESTE TESTE: ${uso.entrada} entrada + ${uso.saida} saida em ${uso.chamadas} consultas (media ${uso.chamadas ? Math.round((uso.entrada + uso.saida) / uso.chamadas) : 0} por consulta)`);
let falhas = 0;
const confere = (ok: boolean, msg: string): void => { console.log(`  [${ok ? 'PASSOU' : 'FALHOU'}] ${msg}`); if (!ok) falhas++; };
confere(resultados.length === ricos.length && resultados.every((r) => r === 'ok'), `todos os ${ricos.length} dias foram processados sem erro`);
confere(descartes === 0, 'nenhum dia teve a resposta INTEIRA descartada pelo validador (formato do modelo aceito)');
confere(extraidos >= 1, 'o modelo identificou nome (e/ou empresa) de ao menos um cliente nas conversas');
confere(compromissos + sinais >= 1, 'o modelo achou ao menos um compromisso ou sinal de potencial');
confere(resolve(copia) !== resolve('data/acervo.sqlite') && extracaoLiberada(db), 'o teste rodou numa COPIA (o acervo original nao e aberto para escrita por este teste)');
process.exit(falhas === 0 ? 0 : 1);
