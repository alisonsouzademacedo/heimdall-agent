// O supervisor decide QUANDO recriar o socket: deslogado nunca reconecta; reinicio pedido (515) reconecta ja; o resto espera cada vez mais (e zera ao conectar).
import test from 'node:test';
import assert from 'node:assert/strict';
import { supervisionar, ESPERAS_MS, type Sessao } from './supervisor.ts';
import type { Estado } from './ligar.ts';

function cenario() {
  const esperas: number[] = []; const estados: Estado[] = []; let criadas = 0; let encerradas = 0;
  const emitir: { f: ((e: Estado) => void) | null } = { f: null };
  const sup = supervisionar({
    criar: async (aoEstado): Promise<Sessao> => { criadas++; emitir.f = aoEstado; return { encerrar: () => { encerradas++; } }; },
    aoEstado: (e) => estados.push(e),
    esperar: async (ms) => { esperas.push(ms); }
  });
  return { sup, esperas, estados, emitir, criadas: () => criadas, encerradas: () => encerradas };
}
const tick = () => new Promise((r) => setImmediate(r));

test('cria o primeiro socket ao iniciar', async () => {
  const c = cenario(); await c.sup.iniciar();
  assert.equal(c.criadas(), 1);
});

test('deslogado (401): NAO reconecta nunca (reconectar deslogado so gera novo QR por engano) e avisa', async () => {
  const c = cenario(); await c.sup.iniciar();
  c.emitir.f!({ estado: 'deslogado' }); await tick();
  assert.equal(c.criadas(), 1);
  assert.deepEqual(c.estados.at(-1), { estado: 'deslogado' });
  assert.equal(c.encerradas(), 1);
});

test('reinicio pedido pelo WhatsApp (515, logo depois de escanear o QR): reconecta SEM espera', async () => {
  const c = cenario(); await c.sup.iniciar();
  c.emitir.f!({ estado: 'reconectar', codigo: 515 }); await tick(); await tick();
  assert.equal(c.criadas(), 2);
  assert.deepEqual(c.esperas, [0]);
});

test('outras quedas: espera crescente (1 s, 2 s, 5 s, 10 s, 30 s e fica em 30 s)', async () => {
  const c = cenario(); await c.sup.iniciar();
  for (let i = 0; i < 7; i++) { c.emitir.f!({ estado: 'reconectar', codigo: 408 }); await tick(); await tick(); }
  assert.deepEqual(c.esperas, [1000, 2000, 5000, 10000, 30000, 30000, 30000]);
  assert.deepEqual(ESPERAS_MS, [1000, 2000, 5000, 10000, 30000]);
});

test('ao conectar a espera zera', async () => {
  const c = cenario(); await c.sup.iniciar();
  c.emitir.f!({ estado: 'reconectar', codigo: 408 }); await tick(); await tick();
  c.emitir.f!({ estado: 'reconectar', codigo: 408 }); await tick(); await tick();
  c.emitir.f!({ estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }); await tick();
  c.emitir.f!({ estado: 'reconectar', codigo: 408 }); await tick(); await tick();
  assert.deepEqual(c.esperas, [1000, 2000, 1000]);
});

test('parar() encerra o socket e impede novas tentativas', async () => {
  const c = cenario(); await c.sup.iniciar();
  c.sup.parar();
  c.emitir.f!({ estado: 'reconectar', codigo: 408 }); await tick(); await tick();
  assert.equal(c.criadas(), 1);
  assert.equal(c.encerradas(), 1);
});

test('se criar o socket falhar, tenta de novo com espera e avisa (nao morre)', async () => {
  const esperas: number[] = []; const estados: Estado[] = []; let n = 0;
  const sup = supervisionar({
    criar: async () => { n++; if (n < 3) throw new Error('sem rede'); return { encerrar() {} }; },
    aoEstado: (e) => estados.push(e), esperar: async (ms) => { esperas.push(ms); }
  });
  await sup.iniciar();
  assert.equal(n, 3);
  assert.deepEqual(esperas, [1000, 2000]);
  assert.equal(estados.filter((e) => e.estado === 'aviso').length, 2);
});
