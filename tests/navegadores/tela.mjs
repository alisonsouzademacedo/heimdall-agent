// Abre a tela de configuracao (servidor real, dados SINTETICOS, banco em memoria) nos navegadores instalados e confere o que aparece.
// Quem chama: check_navegadores.sh (informa onde esta o modulo "playwright" em PLAYWRIGHT_MODULE). Navegador ausente = NAO EXECUTADO, nunca "passou".
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from '../../apps/core/src/db.ts';
import { iniciarServidor } from '../../apps/core/src/onboarding/servidor.ts';
import { avaliar } from '../../apps/core/src/onboarding/ambiente.ts';

const GIB = 1024 ** 3;
const CODIGO = 'codigo-sintetico-navegadores';
// WSL antigo + Windows antigo + imagens faltando: as linhas novas (e as de texto mais comprido) precisam aparecer.
const verificacoes = avaliar({
  plataforma: 'win32', memTotalBytes: 16 * GIB, memLivreBytes: 8 * GIB, discoLivreBytes: 100 * GIB, nodeVersao: 'v22.22.0', dockerRodando: true,
  virtualizacao: true, wsl: true, wslVersao: '2.1.4', windowsBuild: 19044,
  imagensFaltando: ['nousresearch/hermes-agent:v0.22.2', 'heimdall-hindsight:1.0.0-onnx']
});

const { chromium, firefox, webkit } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
const MOTORES = [
  ['chromium', () => chromium.launch()], ['firefox', () => firefox.launch()], ['webkit', () => webkit.launch()],
  ['edge (instalado)', () => chromium.launch({ channel: 'msedge' })], ['chrome (instalado)', () => chromium.launch({ channel: 'chrome' })]
];

const dir = mkdtempSync(join(tmpdir(), 'heimdall-nav-'));
const banco = abrirBanco(); migrar(banco);
const s = await iniciarServidor({ banco, codigo: CODIGO, pastaBugs: join(dir, 'bugs'), sondar: () => verificacoes, agora: () => Date.parse('2026-10-19T20:00:00Z') });
let falhas = 0, rodou = 0;
const passou = (m) => console.log(`  [PASSOU] ${m}`);
const falhou = (m) => { console.log(`  [FALHOU] ${m}`); falhas++; };

for (const [nome, abrir] of MOTORES) {
  let nav;
  try { nav = await abrir(); } catch (e) { console.log(`  [NAO EXECUTADO] ${nome}: nao instalado nesta maquina`); continue; }
  rodou++;
  try {
    const pagina = await nav.newPage({ viewport: { width: 1280, height: 800 } });
    const erros = [];
    pagina.on('pageerror', (e) => erros.push(String(e)));
    pagina.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
    const resp = await pagina.goto(`${s.url}/?codigo=${CODIGO}`);
    (resp && resp.status() === 200 && new URL(pagina.url()).pathname === '/') ? passou(`${nome}: o link com o codigo entra (cookie de sessao aceito) e abre a tela`) : falhou(`${nome}: nao entrou (status ${resp && resp.status()}, ${pagina.url()})`);
    try { await pagina.waitForFunction((n) => document.querySelectorAll('.verif').length === n, verificacoes.length, { timeout: 15000 }); passou(`${nome}: ${verificacoes.length} verificacoes na tela`); }
    catch { falhou(`${nome}: as ${verificacoes.length} verificacoes nao apareceram`); }
    const texto = await pagina.innerText('body');
    for (const trecho of ['Versão do WSL: 2.1.4', 'Windows (compilação 19044)', 'Imagens do Heimdall que faltam', 'pull --ignore-buildable']) {
      texto.includes(trecho) ? passou(`${nome}: mostra "${trecho}"`) : falhou(`${nome}: falta o texto "${trecho}"`);
    }
    for (const largura of [1280, 800, 390]) {
      await pagina.setViewportSize({ width: largura, height: 800 });
      const estouro = await pagina.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      estouro <= 1 ? passou(`${nome}: sem rolagem horizontal em ${largura}px`) : falhou(`${nome}: rolagem horizontal de ${estouro}px em ${largura}px`);
    }
    erros.length === 0 ? passou(`${nome}: nenhum erro no console`) : falhou(`${nome}: erros no console: ${erros.slice(0, 2).join(' | ').slice(0, 160)}`);
  } catch (e) { falhou(`${nome}: ${String(e).slice(0, 160)}`); }
  finally { await nav.close(); }
}
await s.fechar(); rmSync(dir, { recursive: true, force: true });
if (rodou === 0) { console.log('  [NAO EXECUTADO] nenhum navegador disponivel'); process.exit(process.env.REQUIRE_NAVEGADOR === '1' ? 1 : 0); }
process.exit(falhas === 0 ? 0 : 1);
