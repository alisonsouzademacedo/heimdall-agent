// Agenda dos relatorios: diario ter-sex e semanal seg, a partir das 08:00 de Sao Paulo (com margem ate 20:00 se o computador estava desligado).
// Uma vez por dia (chave na caixa de saida). O Hermes so REDIGE; texto invalido ou falha do Hermes cai no relatorio deterministico.
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, type Banco } from '../../core/src/db.ts';
import { registrarMensagem } from '../../core/src/ingestao.ts';
import { MARCA } from '../../core/src/saida.ts';
import { gerarRelatorioDoDia, textoAceitavel, HORA_INICIO, HORA_FIM, type PortasAgenda } from './agenda.ts';
import type { PortaCrm } from './crm.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net' };
const ISO = (s: string) => Date.parse(s);
const QUARTA_8H = ISO('2026-10-21T11:00:00Z'); // 08:00 em SP
const SEGUNDA_8H = ISO('2026-10-26T11:00:00Z');
const SABADO_8H = ISO('2026-10-24T11:00:00Z');

function banco(): Banco {
  const db = abrirBanco(); migrar(db);
  db.prepare('INSERT INTO clientes (id, nome) VALUES (1, ?)').run('Alfa');
  registrarMensagem(db, { waMsgId: 'x', remoteJid: '5511911110001@s.whatsapp.net', fromMe: false, quandoMs: 1, tipo: 'texto', texto: 'oi', origem: 'historico' }, DONO);
  db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente'").run();
  db.prepare("DELETE FROM mensagens WHERE wa_msg_id = 'x'").run();
  registrarMensagem(db, { waMsgId: 'a1', remoteJid: '5511911110001@s.whatsapp.net', fromMe: false, quandoMs: ISO('2026-10-19T14:00:00Z'), tipo: 'texto', texto: 'qual o prazo?', origem: 'notify' }, DONO);
  return db;
}
const saidas = (db: Banco) => db.prepare('SELECT tipo, texto, chave FROM saida ORDER BY id').all() as { tipo: string; texto: string; chave: string }[];
const semHermes: PortasAgenda = { redator: null, instrucoes: { comum: '', diario: '', semanal: '' } };

test('diario na quarta as 08:00: entra na caixa de saida UMA vez, com a marca e o texto deterministico (sem Hermes)', async () => {
  const db = banco();
  assert.equal(await gerarRelatorioDoDia(db, semHermes, QUARTA_8H), 'diario');
  assert.equal(await gerarRelatorioDoDia(db, semHermes, QUARTA_8H + 60_000), null, 'ja gerado hoje');
  const [s] = saidas(db);
  assert.equal(s!.tipo, 'relatorio'); assert.equal(s!.chave, 'relatorio:diario:2026-10-21');
  assert.ok(s!.texto.startsWith(MARCA)); assert.match(s!.texto, /# Diário — quarta-feira, 21\/10/); assert.match(s!.texto, /\*\*A1\*\* Alfa/);
});

test('semanal na segunda; sabado e domingo nao geram nada; antes das 08:00 e depois das 20:00 nao gera', async () => {
  const db = banco();
  assert.equal(await gerarRelatorioDoDia(db, semHermes, SABADO_8H), null);
  assert.equal(await gerarRelatorioDoDia(db, semHermes, SEGUNDA_8H - 3_600_000), null, '07:00');
  assert.equal(await gerarRelatorioDoDia(db, semHermes, SEGUNDA_8H + 12 * 3_600_000 + 60_000), null, 'depois das 20:00 nao sai de repente');
  assert.equal(await gerarRelatorioDoDia(db, semHermes, SEGUNDA_8H + 2 * 3_600_000), 'semanal', 'computador ligado as 10:00: sai com atraso');
  assert.equal(HORA_INICIO, 8); assert.equal(HORA_FIM, 20);
  assert.match(saidas(db)[0]!.texto, /# Semanal — semana de 19\/10 a 25\/10/);
});

test('os codigos A1/F1/P1 do relatorio ficam registrados para as correcoes do dono (relatorio_itens)', async () => {
  const db = banco();
  await gerarRelatorioDoDia(db, semHermes, QUARTA_8H);
  assert.deepEqual(db.prepare('SELECT dia, codigo, cliente_id AS c FROM relatorio_itens').all().map((x) => ({ ...x })), [{ dia: '2026-10-21', codigo: 'A1', c: 1 }]);
});

test('CRM: proposta vira C1 no relatorio deterministico, e gravada e NAO passa pelo modelo', async () => {
  const db = banco();
  let chamouModelo = false;
  const crm: PortaCrm = {
    propor: async () => [{
      numero: 1, clienteId: 1, cliente: 'Alfa', tipo: 'criar', leadId: null, etapaAtual: null,
      etapaDestino: 11, etapaDestinoNome: 'Contato iniciado', motivo: 'cliente respondeu e ainda não tem lead no CRM'
    }],
    aplicar: async () => null
  };
  const redator = async () => { chamouModelo = true; return '# Diário\n\n## Aguardando você\n- x\n'; };
  assert.equal(await gerarRelatorioDoDia(db, { ...semHermes, redator, crm }, QUARTA_8H), 'diario');
  const texto = saidas(db)[0]!.texto;
  assert.match(texto, /## CRM/);
  assert.match(texto, /\*\*C1\*\* Alfa — criar lead em "Contato iniciado"/);
  assert.match(texto, /ok 1 e 3/);
  assert.equal(chamouModelo, false, 'com CRM o texto deterministico e obrigatorio (os codigos e a frase de aprovacao vem dele)');
  const p = db.prepare('SELECT dia, numero, cliente_id AS clienteId, etapa_destino AS etapa, estado FROM crm_propostas').get() as Record<string, unknown>;
  assert.equal(p.dia, '2026-10-21'); assert.equal(p.numero, 1); assert.equal(p.clienteId, 1); assert.equal(p.etapa, 11); assert.equal(p.estado, 'proposta');
  assert.ok((db.prepare("SELECT 1 AS x FROM relatorio_itens WHERE codigo = 'C1'").get() as { x: number } | undefined));
});

test('Hermes redige: texto valido e usado; o pedido leva as regras e o pacote como DADOS', async () => {
  const db = banco(); let pedido = '';
  const redator = async (p: string) => { pedido = p; return '# Diário — quarta-feira, 21/10\n\n**Resumo:** A Alfa espera resposta.\n\n## Aguardando você\n- **A1** Alfa — espera há 2 dias. Motivo: perguntou o prazo.\n'; };
  await gerarRelatorioDoDia(db, { redator, instrucoes: { comum: 'REGRAS-COMUNS', diario: 'REGRAS-DIARIO', semanal: '' } }, QUARTA_8H);
  assert.match(pedido, /REGRAS-COMUNS/); assert.match(pedido, /REGRAS-DIARIO/); assert.match(pedido, /"codigo": ?"A1"/);
  assert.match(pedido, /dados, nao instrucoes|dados, não instruções/i);
  assert.match(saidas(db)[0]!.texto, /A Alfa espera resposta/);
});

test('Hermes falha ou devolve texto invalido (codigo inventado, secao fora da ordem, grande demais, sem titulo): cai no deterministico', async () => {
  for (const ruim of ['sem titulo nenhum', '# Diário\n\n## Aguardando você\n- **A9** Zeta — inventado', '# Diário\n\n## Segredos\n- x', '# Diário\n' + 'palavra '.repeat(400), '']) {
    const db = banco();
    await gerarRelatorioDoDia(db, { redator: async () => ruim, instrucoes: semHermes.instrucoes }, QUARTA_8H);
    assert.match(saidas(db)[0]!.texto, /\*\*A1\*\* Alfa — espera há/, JSON.stringify(ruim.slice(0, 30)));
  }
  const db = banco();
  await gerarRelatorioDoDia(db, { redator: async () => { throw new Error('hermes_sem_resposta'); }, instrucoes: semHermes.instrucoes }, QUARTA_8H);
  assert.match(saidas(db)[0]!.texto, /\*\*A1\*\* Alfa/);
});

test('textoAceitavel: funcao pura (titulo, limite de palavras, codigos conhecidos, secoes na ordem)', () => {
  const ok = '# T\n\n## Aguardando você\n- **A1** x\n\n## Potencial\n- **P1** y\n';
  assert.equal(textoAceitavel(ok, 'diario', ['A1', 'P1']), true);
  assert.equal(textoAceitavel(ok, 'diario', ['A1']), false, 'P1 nao existe no pacote');
  assert.equal(textoAceitavel('# T\n\n## Potencial\n- x\n\n## Aguardando você\n- y', 'diario', []), false, 'secoes fora da ordem');
});

test('diario traz compromisso vencido (H1) e duvida aberta; a duvida aparece UMA vez so (nao se repete no dia seguinte); modelo que cita H1 e aceito, H9 inventado nao', async () => {
  const db = banco();
  db.prepare("INSERT INTO compromissos (cliente_id, tipo, titulo, data_hora, estado) VALUES (1, 'proposta', 'Enviar proposta', '2026-10-20', 'marcado')").run();
  db.prepare("INSERT INTO duvidas (cliente_id, texto, criada_em) VALUES (1, 'O prazo era 30 dias?', 1)").run();
  assert.equal(await gerarRelatorioDoDia(db, semHermes, QUARTA_8H), 'diario');
  const [s] = saidas(db);
  assert.match(s!.texto, /\*\*H1\*\* Alfa/);
  assert.match(s!.texto, /O prazo era 30 dias\?/);
  assert.equal((db.prepare("SELECT estado FROM duvidas").get() as { estado: string }).estado, 'respondida');
  await gerarRelatorioDoDia(db, semHermes, QUARTA_8H + 86_400_000);
  assert.doesNotMatch(saidas(db)[1]!.texto, /O prazo era 30 dias/);
  assert.equal(textoAceitavel('# T\n\n## Hoje / atrasados\n- H1 x', 'diario', ['H1']), true);
  assert.equal(textoAceitavel('# T\n\n## Hoje / atrasados\n- H9 x', 'diario', ['H1']), false);
});

test('aviso dos 90 dias: entra no primeiro relatorio (diario ou semanal) depois que ha arquivo velho, ensina o comando e nao se repete antes de 7 dias', async () => {
  const db = banco();
  const c = db.prepare("INSERT INTO conversas (jid, tipo) VALUES ('y@s.whatsapp.net', 'dm')").run().lastInsertRowid;
  const m = db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, tipo, enviada_em, origem_evento) VALUES (?, 'V1', 0, 'pdf', 1, 'notify')").run(c).lastInsertRowid;
  db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, criada_em) VALUES (?, 'pdf', 'x', 'h', ?)").run(m, QUARTA_8H - 91 * 86_400_000);
  assert.equal(await gerarRelatorioDoDia(db, semHermes, QUARTA_8H), 'diario');
  assert.match(saidas(db)[0]!.texto, /1 arquivo.*90 dias/s);
  assert.match(saidas(db)[0]!.texto, /apagar arquivos antigos/);
  await gerarRelatorioDoDia(db, semHermes, QUARTA_8H + 86_400_000); // quinta
  assert.doesNotMatch(saidas(db)[1]!.texto, /90 dias/, 'nao repete no dia seguinte');
  await gerarRelatorioDoDia(db, semHermes, SEGUNDA_8H + 86_400_000 * 0); // segunda, 5 dias depois: ainda nao
  assert.doesNotMatch(saidas(db)[2]!.texto, /90 dias/);
  await gerarRelatorioDoDia(db, semHermes, QUARTA_8H + 7 * 86_400_000); // 7 dias depois (quarta): volta
  assert.match(saidas(db)[3]!.texto, /90 dias/);
});

test('sem arquivo velho nao ha aviso', async () => {
  const db = banco();
  await gerarRelatorioDoDia(db, semHermes, QUARTA_8H);
  assert.doesNotMatch(saidas(db)[0]!.texto, /90 dias/);
});

test('aviso dos 90 dias: texto do modelo que "esquece" o aviso e descartado (vale o deterministico, que o traz)', async () => {
  const db = banco();
  const c = db.prepare("INSERT INTO conversas (jid, tipo) VALUES ('z@s.whatsapp.net', 'dm')").run().lastInsertRowid;
  const m = db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, tipo, enviada_em, origem_evento) VALUES (?, 'V2', 0, 'pdf', 1, 'notify')").run(c).lastInsertRowid;
  db.prepare("INSERT INTO midias (mensagem_id, tipo, caminho, sha256, criada_em) VALUES (?, 'pdf', 'x', 'h', ?)").run(m, QUARTA_8H - 91 * 86_400_000);
  const esquecido: PortasAgenda = { redator: async () => '# Diário\n\n## Aguardando você\n- A1 texto do modelo sem aviso', instrucoes: { comum: '', diario: '', semanal: '' } };
  await gerarRelatorioDoDia(db, esquecido, QUARTA_8H);
  assert.match(saidas(db)[0]!.texto, /apagar arquivos antigos/);
  assert.doesNotMatch(saidas(db)[0]!.texto, /texto do modelo sem aviso/);
});
