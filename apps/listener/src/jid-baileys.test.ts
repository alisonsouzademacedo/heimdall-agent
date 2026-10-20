// Pendencia E1 do spike (fase-1-spike.md): o jid.ts do nucleo (sem dependencias) tem de concordar com o Baileys REAL instalado.
import test from 'node:test';
import assert from 'node:assert/strict';
import { jidDecode, jidNormalizedUser, isPnUser, isLidUser, isJidGroup, isJidBroadcast, isJidStatusBroadcast, isJidNewsletter, areJidsSameUser } from '@whiskeysockets/baileys';
import { decodificarJid, normalizarJid, tipoDoJid, mesmoUsuario } from '../../core/src/jid.ts';

const VALIDOS = [
  '5511999990000@s.whatsapp.net', '5511999990000:12@s.whatsapp.net', '123456789012345@lid', '123456789012345:3@lid',
  '120363000000000001@g.us', '123456789-123345@g.us', 'status@broadcast', '1234567890@broadcast', '12345@newsletter'
];

test('decodificar/normalizar: mesmo usuario, servidor e dispositivo que o Baileys', () => {
  for (const j of VALIDOS) {
    const real = jidDecode(j)!;
    const nosso = decodificarJid(j)!;
    assert.equal(nosso.usuario, real.user, j);
    assert.equal(nosso.servidor, real.server, j);
    assert.equal(nosso.dispositivo ?? undefined, real.device, j);
    assert.equal(normalizarJid(j), jidNormalizedUser(j), j);
  }
});

test('o tipo que o nucleo atribui bate com os verificadores do Baileys', () => {
  for (const j of VALIDOS) {
    const t = tipoDoJid(j);
    assert.equal(t === 'pn', Boolean(isPnUser(j)), `pn ${j}`);
    assert.equal(t === 'lid', Boolean(isLidUser(j)), `lid ${j}`);
    assert.equal(t === 'grupo', Boolean(isJidGroup(j)), `grupo ${j}`);
    assert.equal(t === 'status', Boolean(isJidStatusBroadcast(j)), `status ${j}`);
    assert.equal(t === 'transmissao', Boolean(isJidBroadcast(j)) && !isJidStatusBroadcast(j), `transmissao ${j}`);
    assert.equal(t === 'canal', Boolean(isJidNewsletter(j)), `canal ${j}`);
  }
});

test('mesmo usuario (ignorando dispositivo) concorda com areJidsSameUser, sem cruzar PN e LID', () => {
  const pares: [string, string][] = [
    ['5511999990000:0@s.whatsapp.net', '5511999990000:3@s.whatsapp.net'],
    ['5511999990000@s.whatsapp.net', '5511999990001@s.whatsapp.net'],
    ['123456789012345:2@lid', '123456789012345@lid'],
    ['5511999990000@s.whatsapp.net', '123456789012345@lid']
  ];
  for (const [a, b] of pares) assert.equal(mesmoUsuario(a, b), Boolean(areJidsSameUser(a, b)), `${a} ~ ${b}`);
});

// Verificado na biblioteca instalada: jidDecode devolve undefined (sem '@') ou um registro com usuario OU servidor vazio ('@lid', 'x@'). O nucleo e mais estrito: recusa todos.
test('JIDs quebrados: o nucleo recusa (null); o Baileys devolve undefined ou um registro incompleto', () => {
  for (const j of ['semservidor', '', '@lid', 'x@']) {
    assert.equal(normalizarJid(j), null, j);
    const real = jidDecode(j);
    assert.ok(!real || !real.user || !real.server, `Baileys ${j}`);
  }
});
