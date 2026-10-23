// Executa o JS REAL da tela (recursos.ts) num DOM falso e confere o passo "Processar" funcionando de verdade: barra, tokens, avisos, botoes e ajustes.
// Sem navegador (o Playwright nao roda nesta VPS), isto pega erro de execucao (variavel faltando, chamada errada) que o teste de sintaxe nao ve.
import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { JS } from './recursos.ts';

class No {
  tag: string; className = ''; _t = ''; children: No[] = []; style: Record<string, string> = {}; attrs: Record<string, string> = {}; ouvintes: Record<string, (() => void)[]> = {};
  disabled = false; value = ''; type = ''; min = ''; step = ''; placeholder = ''; selected = false; options: No[] = [];
  constructor(tag: string) { this.tag = tag; }
  set textContent(v: string) { this._t = String(v); this.children = []; }
  get textContent(): string { return this._t + this.children.map((c) => c.textContent).join(' '); }
  appendChild(c: No): No { this.children.push(c); if (this.tag === 'select') this.options.push(c); return c; }
  setAttribute(k: string, v: string): void { this.attrs[k] = v; }
  addEventListener(ev: string, fn: () => void): void { (this.ouvintes[ev] ??= []).push(fn); }
  clicar(): void { for (const f of this.ouvintes.click ?? []) f(); }
  achar(pred: (n: No) => boolean, acc: No[] = []): No[] { if (pred(this)) acc.push(this); for (const c of this.children) c.achar(pred, acc); return acc; }
}

const processamento = (sobre: Record<string, unknown> = {}) => ({
  liberada: false, clientes: 0, candidatos: 0, diasNovos: 0, diasRefeitos: 0, naFila: 0, consultasPrevistas: 0, rodada: null,
  consumo: { hoje: soma(), semana: soma(), total: soma() }, media: { amostras: 0, entrada: 0, saida: 0, ms: 0 }, estimativa: null,
  teto: { diario: 300000, usadoHoje: 0, atingido: false },
  modelos: { conversa: { model: 'gpt-6-luna', esforco: 'low' }, extracao: { model: 'gpt-6-luna', esforco: 'low' }, relatorio: { model: null, esforco: null }, teste: { model: 'gpt-6-luna', esforco: 'low' } },
  ...sobre
});
function soma(c = 0, e = 0, s = 0) { const z = { chamadas: c, entrada: e, saida: s }; return { conversa: { ...z }, extracao: { ...z }, relatorio: { chamadas: 0, entrada: 0, saida: 0 }, teste: { chamadas: 0, entrada: 0, saida: 0 }, todas: { ...z } }; }

async function tela(inicial: Record<string, unknown>) {
  const dados: Record<string, unknown> = {
    '/api/estado': { passos: [{ id: 'processar', titulo: 'Processar', mito: 'm', explicacao: 'e', estado: 'pendente', pronto: true }], fontes: null, verificacoes: [], bugsAbertos: 0 },
    '/api/painel': { whatsapp: {}, fila: { total: {}, porTipo: {} }, acervo: {}, backup: {}, selfchat: {}, servicos: {} },
    '/api/ambiente/testar': { verificacoes: [], perfil: null },
    '/api/processamento': inicial
  };
  const posts: { url: string; corpo: unknown }[] = [];
  const ids: Record<string, No> = {};
  let relogio: (() => void) | null = null;
  const alertas: string[] = [];
  const sandbox = {
    document: { hidden: false, createElement: (t: string) => new No(t), createTextNode: (t: string) => { const n = new No('#texto'); n._t = t; return n; }, getElementById: (id: string) => (ids[id] ??= new No('div')) },
    window: { confirm: () => true },
    alert: (m: string) => alertas.push(m),
    setInterval: (f: () => void) => { relogio = f; return 1; }, clearInterval: () => {},
    fetch: async (url: string, o: { method: string; body?: string }) => {
      if (o.method === 'POST') { posts.push({ url, corpo: o.body ? JSON.parse(o.body) : null }); return { ok: true, json: async () => ({ ok: true }) }; }
      return { ok: true, json: async () => dados[url] };
    },
    Number, JSON, Math, Promise, Object, String, Array, Date, Error, parseInt, parseFloat, isNaN
  };
  runInNewContext(JS, sandbox);
  const esperar = async () => { for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r)); };
  await esperar();
  return { painel: ids['painel']!, dados, posts, alertas, esperar, tique: async () => { relogio!(); await esperar(); } };
}

test('passo Processar sem clientes: avisa 0 de 0, mostra tokens zerados, o teto e os ajustes de modelo', async () => {
  const t = await tela(processamento());
  const txt = t.painel.textContent;
  assert.match(txt, /Ainda nao ha clientes cadastrados/);
  assert.match(txt, /Progresso desta rodada/); assert.match(txt, /Nenhuma rodada ainda/);
  assert.match(txt, /Gasto de tokens/); assert.match(txt, /A estimativa aparece depois de 3 consultas medidas/);
  assert.match(txt, /Teto de hoje para a extracao/); assert.match(txt, /0 de 300\.000 tokens/);
  assert.match(txt, /Gasto por tarefa/); assert.match(txt, /Extracao de compromissos e sinais/);
  assert.match(txt, /Modelo e esforco de raciocinio por tarefa/);
  const barras = t.painel.achar((n) => n.attrs.role === 'progressbar');
  assert.ok(barras.length >= 2, 'barra da rodada e barra do teto');
  assert.equal(t.alertas.length, 0);
});

test('com trabalho em andamento: a barra anda a cada tique do relogio, os tokens somam e a estimativa aparece', async () => {
  const t = await tela(processamento({ liberada: true, clientes: 5, diasNovos: 8, naFila: 2, consultasPrevistas: 10,
    rodada: { inicio: 1, total: 20, concluidas: 4, falhas: 1, percentual: 25 },
    consumo: { hoje: soma(5, 12000, 600), semana: soma(5, 12000, 600), total: soma(5, 12000, 600) },
    media: { amostras: 5, entrada: 2400, saida: 120, ms: 5000 },
    estimativa: { consultasRestantes: 10, tokens: 25200, minutos: 1, diasDeTeto: 1 },
    teto: { diario: 300000, usadoHoje: 12600, atingido: false } }));
  let txt = t.painel.textContent;
  assert.match(txt, /4 de 20 dias concluidos \(1 sem conseguir\)/);
  assert.match(txt, /Estado: processamento LIBERADO/);
  assert.match(txt, /12\.600/); assert.match(txt, /Estimativa do que falta: cerca de 10 consultas, 25\.200 tokens/);
  const barra = () => t.painel.achar((n) => n.attrs.role === 'progressbar')[0]!.attrs['aria-valuenow'];
  assert.equal(barra(), '25');
  t.dados['/api/processamento'] = processamento({ liberada: true, clientes: 5, rodada: { inicio: 1, total: 20, concluidas: 12, falhas: 1, percentual: 65 }, teto: { diario: 300000, usadoHoje: 12600, atingido: false } });
  await t.tique();
  assert.equal(barra(), '65', 'o relogio da tela redesenha a barra com o numero novo');
  assert.match(t.painel.textContent, /12 de 20 dias concluidos/);
});

test('teto atingido aparece como pausa ate amanha; os botoes seguem o estado (liberado desliga Comecar, pausado desliga Pausar)', async () => {
  const t = await tela(processamento({ liberada: true, clientes: 2, teto: { diario: 10000, usadoHoje: 10100, atingido: true } }));
  assert.match(t.painel.textContent, /em pausa ate amanha/);
  const botao = (rotulo: string) => t.painel.achar((n) => n.tag === 'button' && n._t === rotulo)[0]!;
  assert.equal(botao('Comecar o processamento').disabled, true);
  assert.equal(botao('Pausar processamento').disabled, false);
  t.dados['/api/processamento'] = processamento({ liberada: false, clientes: 2 });
  await t.tique();
  assert.equal(botao('Comecar o processamento').disabled, false);
  assert.equal(botao('Pausar processamento').disabled, true);
});

test('Comecar pede confirmacao e manda liberar+confirmar; Pausar manda liberar:false', async () => {
  const t = await tela(processamento({ liberada: false, clientes: 3 }));
  const botao = (rotulo: string) => t.painel.achar((n) => n.tag === 'button' && n._t === rotulo)[0]!;
  botao('Comecar o processamento').clicar(); await t.esperar();
  assert.deepEqual(t.posts.find((p) => p.url === '/api/processamento/liberar')?.corpo, { liberar: true, confirmar: true });
  t.dados['/api/processamento'] = processamento({ liberada: true, clientes: 3 });
  await t.tique();
  botao('Pausar processamento').clicar(); await t.esperar();
  assert.deepEqual(t.posts.filter((p) => p.url === '/api/processamento/liberar').at(-1)?.corpo, { liberar: false });
});

test('ajustes: salvar teto e salvar modelo mandam os valores certos; o que o dono digita NAO e apagado pelo relogio', async () => {
  const t = await tela(processamento({ clientes: 1 }));
  const campos = t.painel.achar((n) => n.tag === 'input');
  const teto = campos.find((n) => n.type === 'number')!;
  teto.value = '123000';
  await t.tique(); await t.tique();
  assert.equal(teto.value, '123000', 'o relogio nao redesenha os campos de ajuste');
  t.painel.achar((n) => n.tag === 'button' && n._t === 'Salvar teto')[0]!.clicar(); await t.esperar();
  assert.deepEqual(t.posts.find((p) => p.url === '/api/processamento/teto')?.corpo, { tokens: 123000 });
  const salvar = t.painel.achar((n) => n.tag === 'button' && n._t === 'Salvar');
  assert.equal(salvar.length, 4, 'um por tarefa');
  const textos = campos.filter((n) => n.type === 'text');
  textos[2]!.value = 'gpt-6.1-sol'; // relatorio
  salvar[2]!.clicar(); await t.esperar();
  const post = t.posts.find((p) => p.url === '/api/modelos' && (p.corpo as { tarefa: string }).tarefa === 'relatorio');
  assert.deepEqual(post?.corpo, { tarefa: 'relatorio', model: 'gpt-6.1-sol', esforco: null });
});

test('contatos que responderam e ainda nao sao clientes: a tela mostra quantos e o botao cadastra com confirmacao; sem candidatos o botao nao aparece', async () => {
  const t = await tela(processamento({ clientes: 0, candidatos: 254 }));
  assert.match(t.painel.textContent, /254 contatos responderam/);
  const botao = () => t.painel.achar((n) => n.tag === 'button' && /^Cadastrar como clientes/.test(n._t))[0];
  assert.ok(botao());
  botao()!.clicar(); await t.esperar();
  assert.deepEqual(t.posts.find((p) => p.url === '/api/clientes/cadastrar-respondidos')?.corpo, { confirmar: true });
  t.dados['/api/processamento'] = processamento({ clientes: 254, candidatos: 0 });
  await t.tique();
  assert.equal(botao(), undefined, 'sem candidatos o botao some');
  assert.equal(t.painel.achar((n) => n.style.display === 'none').length >= 1, true, 'e o aviso fica escondido');
  assert.doesNotMatch(t.painel.textContent, /Ainda nao ha clientes cadastrados/);
});
