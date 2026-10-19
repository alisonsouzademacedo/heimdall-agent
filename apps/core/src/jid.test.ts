import test from 'node:test';
import assert from 'node:assert/strict';
import { decodificarJid, tipoDoJid, normalizarJid, mesmoUsuario, ehUsuario } from './jid.ts';

test('decodifica usuario, servidor e dispositivo', () => {
  assert.deepEqual(decodificarJid('19999999999:2@s.whatsapp.net'), { usuario: '19999999999', servidor: 's.whatsapp.net', dispositivo: 2 });
  assert.deepEqual(decodificarJid('123456789012345:3@lid'), { usuario: '123456789012345', servidor: 'lid', dispositivo: 3 });
  assert.deepEqual(decodificarJid('19999999999@s.whatsapp.net'), { usuario: '19999999999', servidor: 's.whatsapp.net', dispositivo: null });
});

test('recusa JIDs malformados', () => {
  for (const ruim of ['', '@lid', 'abc', 'abc@', ':2@lid', 'abc:x@lid']) assert.equal(decodificarJid(ruim), null, ruim);
  assert.equal(decodificarJid(undefined as unknown as string), null);
});

test('classifica os tipos de JID da documentacao', () => {
  assert.equal(tipoDoJid('19999999999@s.whatsapp.net'), 'pn');
  assert.equal(tipoDoJid('123456789012345@lid'), 'lid');
  assert.equal(tipoDoJid('123456789-123345@g.us'), 'grupo');
  assert.equal(tipoDoJid('1234567890@broadcast'), 'transmissao');
  assert.equal(tipoDoJid('status@broadcast'), 'status');
  assert.equal(tipoDoJid('12345@newsletter'), 'canal');
  assert.equal(tipoDoJid('13135550002@bot'), 'outro');
  assert.equal(tipoDoJid('lixo'), 'outro');
});

test('normaliza removendo dispositivo e usando minusculas no servidor', () => {
  assert.equal(normalizarJid('19999999999:2@s.whatsapp.net'), '19999999999@s.whatsapp.net');
  assert.equal(normalizarJid('123:0@LID'), '123@lid');
  assert.equal(normalizarJid('lixo'), null);
});

test('mesmo usuario ignora dispositivo mas NAO cruza PN com LID', () => {
  assert.equal(mesmoUsuario('19999999999:0@s.whatsapp.net', '19999999999:3@s.whatsapp.net'), true);
  assert.equal(mesmoUsuario('19999999999@s.whatsapp.net', '19999999999@lid'), false);
  assert.equal(mesmoUsuario('lixo', 'lixo'), false);
});

test('ehUsuario so aceita PN e LID', () => {
  assert.equal(ehUsuario('1@s.whatsapp.net'), true);
  assert.equal(ehUsuario('1@lid'), true);
  assert.equal(ehUsuario('1-2@g.us'), false);
  assert.equal(ehUsuario('status@broadcast'), false);
});
