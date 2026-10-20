// A tela abre de verdade quando o arquivo e chamado por CAMINHO RELATIVO (como o instalador faz). Se a guarda
// "import.meta.url === pathToFileURL(argv[1])" falhasse, o programa sairia com codigo 0 sem subir nada e sem relatorio.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const LINK = /http:\/\/127\.0\.0\.1:\d+\/\?codigo=\S+/; // a linha do endereco vem DEPOIS de "esta no ar": espera por ela
const SCRIPT = fileURLToPath(new URL('./iniciar.ts', import.meta.url));

// UMA so execucao serve aos dois testes (cada subida mede o computador: no Windows isso chama powershell, wsl, docker e nvidia-smi e leva
// dezenas de segundos num executor lento). Espera generosa pelo endereco; ao final, espera o processo MORRER antes de apagar a pasta
// (no Windows um processo vivo segura a pasta e rmSync da EPERM) e repete a remocao se o sistema ainda estiver soltando o arquivo.
const ESPERA_MS = 120_000;
let execucao: Promise<string> | null = null;
let filho: ChildProcess | null = null;
let pasta = '';
function executar(): Promise<string> {
  execucao ??= new Promise<string>((resolve) => {
    pasta = mkdtempSync(join(tmpdir(), 'heimdall-iniciar-'));
    filho = spawn(process.execPath, [relative(pasta, SCRIPT)], { cwd: pasta, env: { ...process.env, HEIMDALL_PORTA: '0', HEIMDALL_SEM_NAVEGADOR: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let saida = '';
    const t = setTimeout(() => resolve(saida), ESPERA_MS);
    const confere = () => { if (LINK.test(saida)) { clearTimeout(t); resolve(saida); } };
    filho.stdout!.on('data', (d) => { saida += d; confere(); });
    filho.stderr!.on('data', (d) => { saida += d; });
    filho.on('exit', () => { clearTimeout(t); resolve(saida); });
  });
  return execucao;
}
after(async () => {
  if (filho && filho.exitCode === null) {
    const morreu = new Promise<void>((r) => filho!.once('exit', () => r()));
    filho.kill();
    await Promise.race([morreu, new Promise((r) => setTimeout(r, 10_000))]);
  }
  // Limpeza da pasta temporaria e "melhor esforco": no Windows o antivirus ou o proprio sistema podem segurar o arquivo por alguns segundos
  // (EBUSY/EPERM) mesmo com o processo morto, e isso nao tem nada a ver com o que o teste verifica (as afirmacoes ja passaram). O sistema limpa a pasta temporaria depois.
  if (pasta) { try { rmSync(pasta, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 }); } catch { /* pasta temporaria: fica para o sistema */ } }
});

// O inicio do instalador tambem mostra o PERFIL ideal deste computador (a mesma funcao da tela: perfil.ts), antes do endereco da tela.
test('iniciar.ts mostra no console o "Perfil recomendado" deste computador, antes do endereco da tela', { timeout: ESPERA_MS + 30_000 }, async () => {
  const saida = await executar();
  assert.match(saida, /Perfil recomendado/, `sem perfil na saida: ${saida.slice(0, 300)}`);
  assert.ok(saida.indexOf('Perfil recomendado') < saida.search(LINK), 'o perfil vem antes do endereco');
  assert.match(saida, /(insuficiente|enxuto|equilibrado|folgado)/i);
});

test('iniciar.ts chamado por caminho relativo sobe a tela (so em 127.0.0.1) e escreve em data/ da pasta atual', { timeout: ESPERA_MS + 30_000 }, async () => {
  const saida = await executar();
  assert.equal(LINK.test(saida), true, `a tela nao subiu. Saida: ${saida.slice(0, 300)}`);
  assert.match(saida, /esta no ar/);
});
