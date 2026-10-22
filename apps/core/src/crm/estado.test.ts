import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirBanco, migrar } from '../db.ts';
import { gravarStatusCrm, lerStatusCrm } from './estado.ts';

test('status do CRM: comeca nao testado e guarda o resultado sem segredo', () => {
  const db = abrirBanco(); migrar(db);
  assert.deepEqual(lerStatusCrm(db), { estado: 'nao_testado', em: null, motivo: null, funis: 0, completo: false, faltando: [] });
  gravarStatusCrm(db, { estado: 'ok', motivo: null, funis: 1, completo: false, faltando: ['2ª Reunião Agendada'] }, 1234);
  assert.deepEqual(lerStatusCrm(db), { estado: 'ok', em: 1234, motivo: null, funis: 1, completo: false, faltando: ['2ª Reunião Agendada'] });
  gravarStatusCrm(db, { estado: 'falhou', motivo: 'HTTP 401: Unauthenticated.', funis: 0, completo: false, faltando: [] }, 2000);
  assert.deepEqual(lerStatusCrm(db), { estado: 'falhou', em: 2000, motivo: 'HTTP 401: Unauthenticated.', funis: 0, completo: false, faltando: [] });
});

test('status do CRM: valor corrompido volta ao comeco, sem derrubar a tela', () => {
  const db = abrirBanco(); migrar(db);
  db.prepare("INSERT INTO configuracao (chave, valor) VALUES ('crm.status', '{quebrado')").run();
  assert.deepEqual(lerStatusCrm(db), { estado: 'nao_testado', em: null, motivo: null, funis: 0, completo: false, faltando: [] });
});
