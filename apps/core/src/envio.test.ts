import test from 'node:test';
import assert from 'node:assert/strict';
import { criarEnvio, ehMensagemDoSelfChat, EnvioNaoPermitido, type Conteudo, type Transporte } from './envio.ts';

const DONO = { pn: '5555999990000:12@s.whatsapp.net', lid: '98765432100001:12@lid' };

function transporteFalso() {
  const chamadas: { destino: string; conteudo: Conteudo }[] = [];
  const t: Transporte = { async enviar(destino, conteudo) { chamadas.push({ destino, conteudo }); } };
  return { t, chamadas };
}

test('texto vai somente para o self-chat (numero normalizado, sem sufixo de dispositivo)', async () => {
  const { t, chamadas } = transporteFalso();
  await criarEnvio(DONO, t).texto('bom dia');
  assert.deepEqual(chamadas, [{ destino: '5555999990000@s.whatsapp.net', conteudo: { tipo: 'texto', texto: 'bom dia' } }]);
});

test('pode preferir o LID do dono como destino; nunca outro', async () => {
  const { t, chamadas } = transporteFalso();
  await criarEnvio(DONO, t, { preferir: 'lid' }).texto('oi');
  assert.equal(chamadas[0]!.destino, '98765432100001@lid');
});

test('documento .md vai ao self-chat com o tipo certo', async () => {
  const { t, chamadas } = transporteFalso();
  await criarEnvio(DONO, t).documento('2026-10-21-diario.md', new TextEncoder().encode('# Diario'));
  assert.equal(chamadas[0]!.destino, '5555999990000@s.whatsapp.net');
  const c = chamadas[0]!.conteudo;
  assert.equal(c.tipo, 'documento');
  if (c.tipo === 'documento') { assert.equal(c.mimetype, 'text/markdown'); assert.equal(c.nomeArquivo, '2026-10-21-diario.md'); }
});

test('as funcoes de envio NAO aceitam destino: a assinatura tem um unico argumento de conteudo', () => {
  const { t } = transporteFalso();
  const envio = criarEnvio(DONO, t);
  assert.equal(envio.texto.length, 1);
  assert.equal(envio.documento.length, 2); // nome e bytes; nenhum parametro de destino
  assert.deepEqual(Object.keys(envio).sort(), ['documento', 'texto']);
});

test('tentativa de "enviar a outro numero" apenas muda o texto: o destino segue sendo o self-chat', async () => {
  const { t, chamadas } = transporteFalso();
  // @ts-expect-error uma terceira pessoa nao e argumento valido; o argumento extra e ignorado em tempo de execucao
  await criarEnvio(DONO, t).texto('para 5511988887777@s.whatsapp.net', '5511988887777@s.whatsapp.net');
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0]!.destino, '5555999990000@s.whatsapp.net');
});

test('o objeto de envio nao expoe o transporte e nao pode ser alterado', () => {
  const { t } = transporteFalso();
  const envio = criarEnvio(DONO, t) as unknown as Record<string, unknown>;
  assert.equal(Object.isFrozen(envio), true);
  assert.throws(() => { 'use strict'; envio.transporte = t; }, TypeError);
  assert.equal(envio.transporte, undefined);
});

test('identidade invalida e recusada na criacao', () => {
  const { t } = transporteFalso();
  for (const ruim of [
    { pn: '' },
    { pn: '123456789-123345@g.us' },
    { pn: 'status@broadcast' },
    { pn: '12345@newsletter' },
    { pn: '98765@lid' }, // LID no campo de telefone
    { pn: DONO.pn, lid: '5555999990000@s.whatsapp.net' }, // PN no campo de LID
    { pn: 'lixo' }
  ]) assert.throws(() => criarEnvio(ruim, t), EnvioNaoPermitido, JSON.stringify(ruim));
});

test('pedir destino LID sem informar o LID falha', () => {
  const { t } = transporteFalso();
  assert.throws(() => criarEnvio({ pn: DONO.pn }, t, { preferir: 'lid' }), EnvioNaoPermitido);
});

test('conteudo invalido nunca chega ao transporte', async () => {
  const { t, chamadas } = transporteFalso();
  const envio = criarEnvio(DONO, t, { limites: { maxTexto: 10, maxDocumentoBytes: 5 } });
  await assert.rejects(envio.texto(''), EnvioNaoPermitido);
  await assert.rejects(envio.texto('   '), EnvioNaoPermitido);
  await assert.rejects(envio.texto('x'.repeat(11)), EnvioNaoPermitido);
  await assert.rejects(envio.documento('relatorio.pdf', new Uint8Array([1])), EnvioNaoPermitido);
  await assert.rejects(envio.documento('../../etc/passwd.md', new Uint8Array([1])), EnvioNaoPermitido);
  await assert.rejects(envio.documento('a b.md', new Uint8Array([1])), EnvioNaoPermitido);
  await assert.rejects(envio.documento('ok.md', new Uint8Array(0)), EnvioNaoPermitido);
  await assert.rejects(envio.documento('ok.md', new Uint8Array(6)), EnvioNaoPermitido);
  assert.equal(chamadas.length, 0);
});

test('falha do transporte e propagada e nao tenta outro destino', async () => {
  const chamadas: string[] = [];
  const t: Transporte = { async enviar(destino) { chamadas.push(destino); throw new Error('rede caiu'); } };
  await assert.rejects(criarEnvio(DONO, t).texto('oi'), /rede caiu/);
  assert.deepEqual(chamadas, ['5555999990000@s.whatsapp.net']);
});

test('so a mensagem do proprio dono, na conversa dele, e self-chat (via telefone ou LID)', () => {
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '5555999990000@s.whatsapp.net', fromMe: true }, DONO), true);
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '98765432100001@lid', fromMe: true }, DONO), true);
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '5555999990000:3@s.whatsapp.net', fromMe: true }, DONO), true);
});

test('cliente, grupo, outra pessoa ou mensagem nao enviada pelo dono NAO sao self-chat', () => {
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '5511988887777@s.whatsapp.net', fromMe: true }, DONO), false); // dono escrevendo ao cliente
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '5511988887777@s.whatsapp.net', fromMe: false }, DONO), false); // cliente escrevendo
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '5555999990000@s.whatsapp.net', fromMe: false }, DONO), false); // fromMe falso, mesmo na conversa do dono
  assert.equal(ehMensagemDoSelfChat({ remoteJid: '123-456@g.us', fromMe: true }, DONO), false);
  assert.equal(ehMensagemDoSelfChat({ remoteJid: 'status@broadcast', fromMe: true }, DONO), false);
});
