// Abre a tela de configuracao (servidor real, dados SINTETICOS, banco em memoria) nos navegadores instalados e confere o que aparece.
// Quem chama: check_navegadores.sh (informa onde esta o modulo "playwright" em PLAYWRIGHT_MODULE). Navegador ausente = NAO EXECUTADO, nunca "passou".
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { abrirBanco, migrar } from '../../apps/core/src/db.ts';
import { iniciarServidor } from '../../apps/core/src/onboarding/servidor.ts';
import { avaliar } from '../../apps/core/src/onboarding/ambiente.ts';
import { gravarEstado, gravarHistorico } from '../../apps/core/src/whatsapp/estado.ts';
import { enfileirar } from '../../apps/core/src/fila.ts';

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
const T = Date.parse('2026-10-19T20:00:00Z');
// Dados SINTETICOS: WhatsApp conectado, historico recebido e UMA midia na fila (o menu tem de mostrar "processando").
gravarEstado(banco, { estado: 'conectado', dono: { pn: '5511900000000@s.whatsapp.net' } }, T);
gravarHistorico(banco, { progresso: 100, ultima: true }, T);
enfileirar(banco, 'baixar_midia', 'sintetico-midia-1', T);
const s = await iniciarServidor({ banco, codigo: CODIGO, pastaBugs: join(dir, 'bugs'), sondar: () => verificacoes, agora: () => T });
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

    // Passos novos ligados: Cadastro, Sincronizar, Modelo, Processar
    const irPara = async (rotulo) => {
      // Locator (nao ElementHandle): se o menu for redesenhado, o clique espera o novo botao.
      try { await pagina.locator('#passos button.passo').filter({ hasText: rotulo }).first().click({ timeout: 5000 }); return true; } catch { return false; }
    };
    const exigirPasso = async (rotulo) => {
      if (await irPara(rotulo)) return true;
      falhou(`${nome}: nao achei o passo "${rotulo}" no menu`);
      return false;
    };

    // Cadastro: campos acessiveis, "Entender o numero" e "Salvar membro" de verdade (dados sinteticos).
    if (await exigirPasso('Cadastro')) {
      try {
        await pagina.waitForSelector('input[aria-label="Nome do membro"]', { timeout: 5000 });
        await pagina.fill('input[aria-label="Nome do membro"]', 'Membro Sintetico');
        await pagina.fill('input[aria-label="Funcao do membro"]', 'SDR');
        await pagina.fill('input[aria-label="Telefone com DDD"]', '(11) 99999-0007');
        await pagina.getByRole('button', { name: 'Entender o numero', exact: true }).click();
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Entendido como: +55 11'));
        passou(`${nome}: Cadastro entende o numero digitado`);
        await pagina.locator('#painel').getByRole('button', { name: 'Salvar membro', exact: true }).click();
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Membro Sintetico'));
        const txtCad = await pagina.innerText('#painel');
        (txtCad.includes('*****-0007') && !txtCad.includes('99999-0007'))
          ? passou(`${nome}: Cadastro salva e mostra o telefone mascarado`)
          : falhou(`${nome}: Cadastro mostrou o telefone inteiro ou nao listou o membro`);
      } catch (e) { falhou(`${nome}: Cadastro incompleto: ${String(e).slice(0, 140)}`); }
    }

    // Sincronizar: cartao da busca antiga; o campo de intervalo NAO pode ser apagado pelo timer.
    if (await exigirPasso('Sincronizar')) {
      try {
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Buscar mensagens antigas'), { timeout: 10000 });
        const txtSinc = await pagina.innerText('#painel');
        (txtSinc.includes('proprio celular') && txtSinc.includes('NAO foi medido'))
          ? passou(`${nome}: Sincronizar explica o pedido ao proprio celular e o risco nao medido`)
          : falhou(`${nome}: Sincronizar sem o aviso de risco/peer`);
        await pagina.fill('input[aria-label="Intervalo entre pedidos em segundos"]', '75');
        await pagina.waitForTimeout(3500);
        const valor = await pagina.inputValue('input[aria-label="Intervalo entre pedidos em segundos"]');
        valor === '75' ? passou(`${nome}: o intervalo digitado nao e apagado pelo timer`) : falhou(`${nome}: o timer apagou o intervalo (ficou ${valor})`);
      } catch (e) { falhou(`${nome}: Sincronizar incompleto: ${String(e).slice(0, 140)}`); }
    }

    // Modelo: instrucoes do terminal (sem caminho interno) e botao de teste.
    if (await exigirPasso('Conectar o modelo')) {
      try {
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('hermes model'), { timeout: 10000 });
        const txtMod = await pagina.innerText('#painel');
        (txtMod.includes('Fazer chamada de teste') && !txtMod.includes('runbooks/') && !txtMod.includes('docs/'))
          ? passou(`${nome}: Modelo guia o terminal sem caminho interno e mostra o teste`)
          : falhou(`${nome}: Modelo sem instrucoes, sem botao ou com caminho interno`);
      } catch (e) { falhou(`${nome}: Modelo incompleto: ${String(e).slice(0, 140)}`); }
    }

    // Processar: liberar com confirmacao e pausar de novo.
    if (await exigirPasso('Processar')) {
      try {
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Liberar o processamento'), { timeout: 10000 });
        pagina.once('dialog', (d) => d.accept());
        await pagina.locator('#painel').getByRole('button', { name: 'Liberar o processamento', exact: true }).click();
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Processamento LIBERADO'), { timeout: 10000 });
        passou(`${nome}: Processar libera depois da confirmacao`);
        await pagina.locator('#painel').getByRole('button', { name: 'Pausar processamento', exact: true }).click();
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Processamento PAUSADO'), { timeout: 10000 });
        passou(`${nome}: Processar pausa de novo`);
      } catch (e) { falhou(`${nome}: Processar incompleto: ${String(e).slice(0, 140)}`); }
    }

    // Menu lateral: "processando" com barra e TEXTO (nao so cor).
    const amarelos = await pagina.evaluate(() => document.querySelectorAll('#passos .no.processando').length);
    const navTxt = await pagina.innerText('#passos');
    (amarelos > 0 && /de 1 arquivos/.test(navTxt)) ? passou(`${nome}: menu mostra "processando" com texto e barra`) : falhou(`${nome}: menu sem "processando" com texto (amarelos=${amarelos})`);
    (!navTxt.includes('docs/plano')) ? passou(`${nome}: menu lateral sem caminhos de documentacao`) : falhou(`${nome}: menu lateral contem caminho interno`);

    // Sem conexao, o cartao da busca antiga continua visivel: o dono ve o tamanho do trabalho e o aviso.
    gravarEstado(banco, { estado: 'desconhecido' }, T);
    await pagina.reload();
    if (await exigirPasso('Sincronizar')) {
      try {
        await pagina.waitForFunction(() => document.getElementById('painel').innerText.includes('Buscar mensagens antigas'), { timeout: 5000 });
        const txtOff = await pagina.innerText('#painel');
        (txtOff.includes('Conecte o WhatsApp primeiro') && txtOff.includes('Buscar mensagens antigas'))
          ? passou(`${nome}: sem conexao, o cartao da busca antiga continua visivel com aviso`)
          : falhou(`${nome}: sem conexao, o cartao da busca antiga sumiu`);
      } catch (e) { falhou(`${nome}: Sincronizar sem conexao: ${String(e).slice(0, 140)}`); }
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
