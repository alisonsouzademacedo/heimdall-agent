// Quem e o dono, a partir do que o Baileys informa (sock.user / creds.me: Contact { id, lid?, phoneNumber? }, docs/baileys/migration/v7.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { identidadeDoDono } from './identidade.ts';

test('id em formato PN com dispositivo e LID separado', () => {
  assert.deepEqual(identidadeDoDono({ id: '5511900000000:7@s.whatsapp.net', lid: '999888777666555:7@lid' }), { pn: '5511900000000@s.whatsapp.net', lid: '999888777666555@lid' });
});
test('id em formato LID: o numero vem de phoneNumber', () => {
  assert.deepEqual(identidadeDoDono({ id: '999888777666555@lid', phoneNumber: '5511900000000@s.whatsapp.net' }), { pn: '5511900000000@s.whatsapp.net', lid: '999888777666555@lid' });
});
test('sem numero de telefone nao ha identidade (o envio ao self-chat nao pode nascer)', () => {
  assert.equal(identidadeDoDono({ id: '999888777666555@lid' }), null);
  assert.equal(identidadeDoDono(undefined), null);
  assert.equal(identidadeDoDono({ id: 'lixo' }), null);
});
test('sem LID tambem serve: so o PN', () => {
  assert.deepEqual(identidadeDoDono({ id: '5511900000000@s.whatsapp.net' }), { pn: '5511900000000@s.whatsapp.net' });
});
