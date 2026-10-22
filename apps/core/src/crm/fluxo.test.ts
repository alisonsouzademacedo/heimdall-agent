import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar, type Banco } from '../db.ts';
import { registrarMensagem } from '../ingestao.ts';
import {
  proporMovimentos, salvarPropostas, lerPropostasAbertas, interpretarRespostaCrm, aplicarRespostaCrm,
  type ApiCrm, type EtapasCrm
} from './fluxo.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net' };
const AGORA = Date.parse('2026-10-22T11:00:00Z');
const DIA = '2026-10-22';
const ETAPAS: EtapasCrm = {
  contato: { id: 11, nome: 'Contato iniciado', codigo: null },
  primeira: { id: 12, nome: '1ª Reunião Agendada', codigo: null },
  segunda: { id: 13, nome: '2ª Reunião Agendada', codigo: null },
  ganho: { id: 14, nome: 'Fechamento / Ganho', codigo: 'won' },
  perdido: { id: 15, nome: 'Perdido / Arquivado', codigo: 'lost' }
};

function banco(): Banco {
  const db = abrirBanco();
  migrar(db);
  return db;
}

function cliente(db: Banco, id: number, nome: string, jid: string, entrada = '2026-10-20T12:00:00Z'): void {
  db.prepare('INSERT INTO clientes (id, nome) VALUES (?, ?)').run(id, nome);
  registrarMensagem(db, {
    waMsgId: `entrada-${id}`, remoteJid: jid, fromMe: false, quandoMs: Date.parse(entrada),
    tipo: 'texto', texto: 'oi', origem: 'historico'
  }, DONO);
  db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = ?)").run(id, jid);
}

function msg(db: Banco, jid: string, id: string, quando: string, deMim: boolean): void {
  registrarMensagem(db, { waMsgId: id, remoteJid: jid, fromMe: deMim, quandoMs: Date.parse(quando), tipo: 'texto', texto: 't', origem: 'notify' }, DONO);
}

function compromisso(db: Banco, clienteId: number, dh: string, estado = 'marcado'): void {
  db.prepare("INSERT INTO compromissos (cliente_id, tipo, titulo, data_hora, estado) VALUES (?, 'reuniao', 'Reunião', ?, ?)").run(clienteId, dh, estado);
}

function vinculo(db: Banco, clienteId: number, leadId: number, etapaId: number): void {
  db.prepare('INSERT INTO crm_leads (cliente_id, lead_id, etapa_id, atualizado_em) VALUES (?, ?, ?, ?)').run(clienteId, leadId, etapaId, AGORA);
}

function apiFalsa(): { api: ApiCrm; chamadas: unknown[]; falhar: { criar?: boolean; mover?: boolean } } {
  const chamadas: unknown[] = [];
  const falhar: { criar?: boolean; mover?: boolean } = {};
  const api: ApiCrm = {
    async criarLead(entrada) {
      chamadas.push(['criar', entrada]);
      return falhar.criar ? { ok: false, motivo: 'HTTP 500' } : { ok: true, id: 99 };
    },
    async moverEtapa(leadId, etapaId) {
      chamadas.push(['mover', leadId, etapaId]);
      return falhar.mover ? { ok: false, motivo: 'HTTP 503' } : { ok: true };
    }
  };
  return { api, chamadas, falhar };
}

test('cria proposta de criar lead para cliente que respondeu e ainda nao tem vinculo', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(p.length, 1);
  assert.equal(p[0]!.tipo, 'criar');
  assert.equal(p[0]!.clienteId, 1);
  assert.equal(p[0]!.cliente, 'Alfa');
  assert.equal(p[0]!.leadId, null);
  assert.equal(p[0]!.etapaDestino, 11);
  assert.match(p[0]!.motivo, /respondeu/);
  assert.equal(p[0]!.numero, 1);
});

test('nao propoe nada para quem nunca respondeu', () => {
  const db = banco();
  db.prepare("INSERT INTO clientes (id, nome) VALUES (1, 'Alfa')").run();
  msg(db, '5511911110001@s.whatsapp.net', 's1', '2026-10-20T12:00:00Z', true);
  db.prepare("UPDATE contatos SET cliente_id = 1, papel = 'cliente' WHERE id = (SELECT contato_id FROM contato_jids WHERE jid = '5511911110001@s.whatsapp.net')").run();
  assert.deepEqual(proporMovimentos(db, ETAPAS, AGORA, DIA), []);
});

test('move para a primeira reuniao quando existe compromisso de reuniao marcado', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  vinculo(db, 1, 77, 11);
  compromisso(db, 1, '2026-10-25T14:00:00-03:00');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(p.length, 1);
  assert.equal(p[0]!.tipo, 'mover');
  assert.equal(p[0]!.leadId, 77);
  assert.equal(p[0]!.etapaAtual, 11);
  assert.equal(p[0]!.etapaDestino, 12);
  assert.equal(p[0]!.etapaDestinoNome, '1ª Reunião Agendada');
  assert.match(p[0]!.motivo, /25\/10/);
});

test('so move para a segunda quando a primeira ja ocorreu e a segunda esta marcada', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  vinculo(db, 1, 77, 12);
  compromisso(db, 1, '2026-10-20T14:00:00-03:00');
  compromisso(db, 1, '2026-10-25T14:00:00-03:00');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(p.length, 1);
  assert.equal(p[0]!.tipo, 'mover');
  assert.equal(p[0]!.etapaDestino, 13);
  assert.match(p[0]!.motivo, /20\/10/);
  assert.match(p[0]!.motivo, /25\/10/);
});

test('nao pula para a segunda com uma reuniao futura so', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  vinculo(db, 1, 77, 12);
  compromisso(db, 1, '2026-10-25T14:00:00-03:00');
  assert.deepEqual(proporMovimentos(db, ETAPAS, AGORA, DIA), []);
});

test('propoe perdido depois de 7 tentativas sem resposta', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net', '2026-07-01T12:00:00Z');
  vinculo(db, 1, 77, 11);
  const jid = '5511911110001@s.whatsapp.net';
  for (const [i, quando] of ['2026-08-03', '2026-08-07', '2026-08-11', '2026-08-15', '2026-08-19', '2026-08-23', '2026-08-27'].entries()) {
    msg(db, jid, `t${i}`, `${quando}T12:00:00Z`, true);
  }
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(p.length, 1);
  assert.equal(p[0]!.tipo, 'perdido');
  assert.equal(p[0]!.etapaDestino, 15);
  assert.match(p[0]!.motivo, /7 tentativas/);
});

test('uma proposta do mesmo dia impede duplicata; a de ontem nao bloqueia hoje', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  const ontem = proporMovimentos(db, ETAPAS, AGORA, '2026-10-21');
  assert.equal(ontem.length, 1);
  assert.equal(salvarPropostas(db, '2026-10-21', ontem, AGORA).length, 1);
  const hoje = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(hoje.length, 1);
  assert.equal(salvarPropostas(db, DIA, hoje, AGORA).length, 1);
  assert.deepEqual(proporMovimentos(db, ETAPAS, AGORA, DIA), []);
});

test('salvar expira propostas antigas e a lista aberta mostra so o dia mais novo', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA)!;
  salvarPropostas(db, '2026-10-21', p, AGORA);
  salvarPropostas(db, DIA, p, AGORA);
  const abertas = lerPropostasAbertas(db);
  assert.equal(abertas.length, 1);
  assert.equal(abertas[0]!.dia, DIA);
});

test('relatorio sem propostas novas tambem expira as propostas antigas', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA)!;
  assert.equal(salvarPropostas(db, '2026-10-21', p, AGORA).length, 1);
  assert.equal(lerPropostasAbertas(db).length, 1);
  assert.deepEqual(salvarPropostas(db, DIA, [], AGORA), []);
  assert.equal(lerPropostasAbertas(db).length, 0);
  const antiga = db.prepare('SELECT estado FROM crm_propostas WHERE dia = ?').get('2026-10-21') as { estado: string };
  assert.equal(antiga.estado, 'expirada');
});

test('gerar o relatorio de novo no mesmo dia nao duplica proposta nem reabre a que ja foi aplicada', () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA)!;
  assert.equal(salvarPropostas(db, DIA, p, AGORA).length, 1);
  db.prepare("UPDATE crm_propostas SET estado = 'aplicada' WHERE dia = ?").run(DIA);
  assert.deepEqual(salvarPropostas(db, DIA, p, AGORA), []);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM crm_propostas').get() as { n: number }).n, 1);
});

test('limita a cinco propostas por relatorio', () => {
  const db = banco();
  for (let i = 1; i <= 7; i++) cliente(db, i, `Cliente ${i}`, `55119111100${String(i).padStart(2, '0')}@s.whatsapp.net`);
  const p = proporMovimentos(db, ETAPAS, AGORA, DIA);
  assert.equal(p.length, 5);
  assert.deepEqual(p.map((x) => x.numero), [1, 2, 3, 4, 5]);
});

test('interpreta as respostas curtas do dono', () => {
  assert.deepEqual(interpretarRespostaCrm('ok 1 e 3'), { aprovados: [1, 3], recusados: [] });
  assert.deepEqual(interpretarRespostaCrm('não, o 2 fica'), { aprovados: [], recusados: [2] });
  assert.deepEqual(interpretarRespostaCrm('C1 ok, C2 não'), { aprovados: [1], recusados: [2] });
  assert.deepEqual(interpretarRespostaCrm('aprovar 2, 4'), { aprovados: [2, 4], recusados: [] });
  assert.equal(interpretarRespostaCrm('ok'), null);
  assert.equal(interpretarRespostaCrm('bom dia'), null);
});

test('aprovacao cria o lead, grava o vinculo e marca a proposta como aplicada', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas } = apiFalsa();
  const r = await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.equal(r!.resultados.length, 1);
  assert.equal(r!.resultados[0]!.ok, true);
  assert.deepEqual(chamadas[0], ['criar', { titulo: 'Alfa', descricao: 'Criado pelo Heimdall com aprovação do dono. Cliente respondeu no WhatsApp.', etapaId: 11 }]);
  const vinculo = db.prepare('SELECT lead_id AS leadId, etapa_id AS etapaId FROM crm_leads WHERE cliente_id = 1').get() as { leadId: number; etapaId: number };
  assert.equal(vinculo.leadId, 99);
  assert.equal(vinculo.etapaId, 11);
  assert.equal(lerPropostasAbertas(db).length, 0);
});

test('aprovacao de movimento exige vinculo e move o lead', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  vinculo(db, 1, 77, 11);
  compromisso(db, 1, '2026-10-25T14:00:00-03:00');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas } = apiFalsa();
  const r = await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.equal(r!.resultados[0]!.ok, true);
  assert.deepEqual(chamadas[0], ['mover', 77, 12]);
  const v = db.prepare('SELECT etapa_id AS etapaId FROM crm_leads WHERE cliente_id = 1').get() as { etapaId: number };
  assert.equal(v.etapaId, 12);
});

test('recusar nao chama a API e marca a proposta como recusada', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas } = apiFalsa();
  const r = await aplicarRespostaCrm(db, 'não 1', api, { selfChat: true }, AGORA);
  assert.equal(r!.recusados[0], 1);
  assert.equal(r!.resultados[0]!.ok, true);
  assert.equal(chamadas.length, 0);
  assert.equal(lerPropostasAbertas(db).length, 0);
});

test('falha da API mantem a proposta aberta para tentar de novo', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas, falhar } = apiFalsa();
  falhar.criar = true;
  const r1 = await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.equal(r1!.resultados[0]!.ok, false);
  assert.equal(r1!.resultados[0]!.erro, 'HTTP 500');
  assert.equal(lerPropostasAbertas(db).length, 1);
  falhar.criar = false;
  const r2 = await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.equal(r2!.resultados[0]!.ok, true);
  assert.equal(chamadas.length, 2);
  assert.equal(lerPropostasAbertas(db).length, 0);
});

test('sem propostas abertas a resposta e especifica e nao chama a API', async () => {
  const db = banco();
  const { api, chamadas } = apiFalsa();
  const r = await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.equal(r!.semPropostas, true);
  assert.equal(chamadas.length, 0);
});

test('numero desconhecido nao chama a API nem fecha a proposta', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas } = apiFalsa();
  const r = await aplicarRespostaCrm(db, 'ok 9', api, { selfChat: true }, AGORA);
  assert.deepEqual(r!.ignorados, [9]);
  assert.equal(chamadas.length, 0);
  assert.equal(lerPropostasAbertas(db).length, 1);
});

test('so o self-chat pode aprovar movimento do CRM', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  salvarPropostas(db, DIA, proporMovimentos(db, ETAPAS, AGORA, DIA), AGORA);
  const { api, chamadas } = apiFalsa();
  await assert.rejects(() => aplicarRespostaCrm(db, 'ok 1', api, { selfChat: false }, AGORA), /self-chat/);
  assert.equal(chamadas.length, 0);
  assert.equal(lerPropostasAbertas(db).length, 1);
});

test('se o vinculo ja existe, uma proposta de criar vira movimento (sem lead duplicado)', async () => {
  const db = banco();
  cliente(db, 1, 'Alfa', '5511911110001@s.whatsapp.net');
  vinculo(db, 1, 77, 11);
  db.prepare("INSERT INTO crm_propostas (dia, numero, cliente_id, lead_id, etapa_atual, etapa_destino, etapa_destino_nome, tipo, motivo, estado, criada_em) VALUES (?, 1, 1, NULL, NULL, 11, 'Contato iniciado', 'criar', 'teste', 'proposta', ?)").run(DIA, AGORA);
  const { api, chamadas } = apiFalsa();
  await aplicarRespostaCrm(db, 'ok 1', api, { selfChat: true }, AGORA);
  assert.deepEqual(chamadas[0], ['mover', 77, 11]);
});
