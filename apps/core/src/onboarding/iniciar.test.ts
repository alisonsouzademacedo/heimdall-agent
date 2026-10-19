// A tela abre de verdade quando o arquivo e chamado por CAMINHO RELATIVO (como o instalador faz). Se a guarda
// "import.meta.url === pathToFileURL(argv[1])" falhasse, o programa sairia com codigo 0 sem subir nada e sem relatorio.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const LINK = /http:\/\/127\.0\.0\.1:\d+\/\?codigo=\S+/; // a linha do endereco vem DEPOIS de "esta no ar": espera por ela
const SCRIPT = fileURLToPath(new URL('./iniciar.ts', import.meta.url));

test('iniciar.ts chamado por caminho relativo sobe a tela (so em 127.0.0.1) e escreve em data/ da pasta atual', async () => {
  const pasta = mkdtempSync(join(tmpdir(), 'heimdall-iniciar-'));
  const filho = spawn(process.execPath, [relative(pasta, SCRIPT)], { cwd: pasta, env: { ...process.env, HEIMDALL_PORTA: '0', HEIMDALL_SEM_NAVEGADOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let saida = '';
  filho.stdout.on('data', (d) => (saida += d));
  filho.stderr.on('data', (d) => (saida += d));
  try {
    const subiu = await new Promise<boolean>((resolve) => {
      const t = setTimeout(() => resolve(false), 20_000);
      filho.stdout.on('data', () => { if (LINK.test(saida)) { clearTimeout(t); resolve(true); } });
      filho.on('exit', () => { clearTimeout(t); resolve(LINK.test(saida)); });
    });
    assert.equal(subiu, true, `a tela nao subiu. Saida: ${saida.slice(0, 300)}`);
    assert.match(saida, /esta no ar/);
  } finally {
    filho.kill();
    await new Promise((r) => setTimeout(r, 200));
    rmSync(pasta, { recursive: true, force: true });
  }
});
