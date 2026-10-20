// O UNICO caminho de envio do listener: ao self-chat, pela trava do nucleo (envio.ts). Aqui com um socket falso que anota tudo que "enviaria".
import test from 'node:test';
import assert from 'node:assert/strict';
import { criarEnvio, EnvioNaoPermitido } from '../../core/src/envio.ts';
import { criarTransporte, type SocketEnvio } from './transporte.ts';

const DONO = { pn: '5511900000000:7@s.whatsapp.net', lid: '999888777666555@lid' };
function falso() {
  const enviados: { jid: string; conteudo: Record<string, unknown> }[] = [];
  const sock: SocketEnvio = { sendMessage: async (jid, conteudo) => { enviados.push({ jid, conteudo: conteudo as Record<string, unknown> }); return undefined; } };
  return { sock, enviados };
}

test('texto vai ao PN do dono, sem sufixo de dispositivo, e so ele', async () => {
  const { sock, enviados } = falso();
  const envio = criarEnvio(DONO, criarTransporte(sock, DONO));
  await envio.texto('Bom dia. Comece pela Alfa.');
  assert.deepEqual(enviados, [{ jid: '5511900000000@s.whatsapp.net', conteudo: { text: 'Bom dia. Comece pela Alfa.' } }]);
});

test('documento .md vai como documento ao dono, com o tipo certo', async () => {
  const { sock, enviados } = falso();
  const envio = criarEnvio(DONO, criarTransporte(sock, DONO));
  await envio.documento('2026-10-21-diario.md', new TextEncoder().encode('# Diario'));
  assert.equal(enviados.length, 1);
  assert.equal(enviados[0]!.jid, '5511900000000@s.whatsapp.net');
  assert.equal(enviados[0]!.conteudo.fileName, '2026-10-21-diario.md');
  assert.equal(enviados[0]!.conteudo.mimetype, 'text/markdown');
  assert.ok(enviados[0]!.conteudo.document instanceof Uint8Array || Buffer.isBuffer(enviados[0]!.conteudo.document));
});

test('defesa em profundidade: mesmo chamado direto, o transporte RECUSA qualquer destino que nao seja o dono', async () => {
  const { sock, enviados } = falso();
  const t = criarTransporte(sock, DONO);
  for (const alvo of ['5511999990001@s.whatsapp.net', '120363000000000001@g.us', 'status@broadcast', '999888777666556@lid', 'lixo', '']) {
    await assert.rejects(() => t.enviar(alvo, { tipo: 'texto', texto: 'oi' }), EnvioNaoPermitido, alvo);
  }
  assert.equal(enviados.length, 0);
});

test('o LID do dono tambem e aceito (e so o dele); a forma e sempre normalizada', async () => {
  const { sock, enviados } = falso();
  const t = criarTransporte(sock, DONO);
  await t.enviar('999888777666555:7@lid', { tipo: 'texto', texto: 'ok' });
  assert.equal(enviados[0]!.jid, '999888777666555@lid');
});

test('falha do WhatsApp ao enviar propaga o erro (o chamador decide; nada e reenviado para outro lugar)', async () => {
  const sock: SocketEnvio = { sendMessage: async () => { throw new Error('rede caiu'); } };
  const envio = criarEnvio(DONO, criarTransporte(sock, DONO));
  await assert.rejects(() => envio.texto('x'), /rede caiu/);
});

test('o resultado do envio volta por aoEnviar (usado para guardar a mensagem e atender o reenvio do WhatsApp)', async () => {
  const resultados: unknown[] = [];
  const sock: SocketEnvio = { sendMessage: async () => ({ key: { id: 'ENV1' }, message: { conversation: 'oi' } }) };
  const envio = criarEnvio(DONO, criarTransporte(sock, DONO, { aoEnviar: (r) => resultados.push(r) }));
  await envio.texto('oi');
  assert.deepEqual(resultados, [{ key: { id: 'ENV1' }, message: { conversation: 'oi' } }]);
});
