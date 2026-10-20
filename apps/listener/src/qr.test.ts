// QR do WhatsApp -> desenho SVG para a tela. A biblioteca (qrcode, MIT) so recebe texto e devolve texto; nada de rede.
import test from 'node:test';
import assert from 'node:assert/strict';
import { qrParaSvg } from './qr.ts';

test('devolve um SVG de verdade (so tracado, sem script nem link) para o texto do QR', async () => {
  const svg = await qrParaSvg('2@ABCDEFGHIJKLMNOPQRSTUVWXYZ,abc123,def456,ghi789==');
  assert.match(svg, /^<svg[ >]/);
  assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /<path /);
  assert.doesNotMatch(svg, /<script|onload|onclick|href=|<image|<foreignObject/i);
  assert.ok(svg.length > 500 && svg.length < 200_000);
});

test('o mesmo texto da o mesmo desenho; texto diferente, desenho diferente', async () => {
  assert.equal(await qrParaSvg('abc'), await qrParaSvg('abc'));
  assert.notEqual(await qrParaSvg('abc'), await qrParaSvg('abd'));
});

test('texto vazio ou grande demais e recusado (o WhatsApp nunca manda isso)', async () => {
  await assert.rejects(qrParaSvg(''), /QR/);
  await assert.rejects(qrParaSvg('x'.repeat(5000)), /QR/);
});
