// Servidor LOCAL da tela de onboarding (docs/plano/fase-1-onboarding-visual.md). Unico arquivo do nucleo autorizado a usar node:http.
// Travas (testadas em servidor.test.ts): escuta so em 127.0.0.1; confere o cabecalho Host (contra DNS rebinding);
// codigo de uso unico na primeira abertura, depois cookie HttpOnly/SameSite=Strict; POST exige cabecalho proprio e
// Origin local (contra CSRF); corpo pequeno; politica de seguranca de conteudo restritiva; nenhuma rota envia mensagem.
import { arch, platform } from 'node:os';
import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import type { Banco } from '../db.ts';
import { gravarRelatorio, listarAbertos } from '../bugs.ts';
import { PASSOS } from './passos.ts';
import { resumoDeFalhas, type Verificacao } from './ambiente.ts';
import type { Perfil } from './perfil.ts';
import { CSS, JS, HTML } from './recursos.ts';
import { definirDestinoDeBackup, backupDoDia, lerBackup } from '../backup-copia.ts';
import { montarPainel, pedirTesteSelfChat, gerarRelatorioDeTeste, atualizarEtapas, estadosAoVivo, type EstadoAoVivo } from './painel.ts';
import { montarFontes } from './fontes.ts';
import { lerConfigHistorico, gravarConfigHistorico, resumoHistoricoAntigo } from '../historico-antigo.ts';
import { cadastrarMembro, listarEquipe, normalizarTelefone } from '../cadastro.ts';
import { lerTesteDoModelo, pedirTesteDoModelo } from '../modelo-teste.ts';
import { diasDeExtracaoPendentes, extracaoLiberada, definirExtracaoLiberada } from '../extracao.ts';
import { lerConfigCrm, salvarConfigCrm, type ConfigCrm } from '../crm/config.ts';
import { listarFunis, verificarFunil } from '../crm/krayin.ts';
import { gravarStatusCrm, lerStatusCrm } from '../crm/estado.ts';

export interface OpcoesServidor {
  banco: Banco;
  codigo: string; // uso unico
  pastaBugs: string;
  raiz?: string; // pasta do projeto; data/krayin.json fica aqui (fora do git)
  sondar: () => Verificacao[] | Promise<Verificacao[]>;
  perfil?: () => Perfil | Promise<Perfil>; // perfil ideal deste computador (perfil.ts); viaja na resposta do "Testar ambiente"
  agora?: () => number;
}

export interface Servidor {
  url: string;
  porta: number;
  fechar: () => Promise<void>;
}

export const MAX_CORPO = 16 * 1024;
export const MAX_ERROS_CODIGO = 5;

const CSP = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function cabecalhos(tipo: string, extra: Record<string, string> = {}): Record<string, string> {
  return { 'Content-Type': tipo, 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store', 'Cross-Origin-Resource-Policy': 'same-origin', ...extra };
}

function responder(res: ServerResponse, status: number, tipo: string, corpo: string, extra: Record<string, string> = {}): void {
  res.writeHead(status, cabecalhos(tipo, extra));
  res.end(corpo);
}
const json = (res: ServerResponse, status: number, obj: unknown): void => responder(res, status, 'application/json; charset=utf-8', JSON.stringify(obj));

function lerCorpo(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    let total = 0; const partes: Buffer[] = []; let estourou = false;
    req.on('data', (c: Buffer) => { total += c.length; if (total > MAX_CORPO) { estourou = true; req.destroy(); resolve(null); } else partes.push(c); });
    req.on('end', () => { if (!estourou) resolve(Buffer.concat(partes).toString('utf8')); });
    req.on('error', () => resolve(null));
  });
}

export function iniciarServidor(op: OpcoesServidor, porta: number = 0): Promise<Servidor> {
  const agora = op.agora ?? (() => Date.now());
  const raiz = op.raiz ?? process.cwd();
  let codigoUsado = false;
  let erros = 0;
  const sessoes = new Set<string>();
  for (const p of PASSOS) op.banco.prepare('INSERT OR IGNORE INTO onboarding_etapas (passo) VALUES (?)').run(p.id);

  const temSessao = (req: IncomingMessage): boolean => {
    const m = /(?:^|;\s*)hm=([0-9a-f]{64})(?:;|$)/.exec(req.headers.cookie ?? '');
    if (!m) return false;
    for (const s of sessoes) if (iguais(s, m[1]!)) return true;
    return false;
  };

  const estado = () => {
    const linhas = op.banco.prepare('SELECT passo, estado FROM onboarding_etapas').all() as { passo: string; estado: string }[];
    const mapa = new Map(linhas.map((l) => [l.passo, l.estado]));
    // Os passos que dependem de trabalho em andamento vem AO VIVO (nunca do verde gravado): "processando" com barra e texto.
    const painel = montarPainel(op.banco, agora());
    const vivo = estadosAoVivo(painel) as Record<string, EstadoAoVivo | undefined>;
    // cadastro: verde com ao menos um membro da equipe; modelo: o resultado do ultimo teste (so ok/falhou, nunca o texto)
    const membros = listarEquipe(op.banco).length;
    vivo.cadastro = { estado: membros > 0 ? 'verde' : 'pendente', percentual: null, detalhe: membros > 0 ? `${membros} membro(s) da equipe cadastrado(s)` : 'Nenhum membro da equipe cadastrado ainda.' };
    const tm = lerTesteDoModelo(op.banco);
    vivo.modelo = { estado: tm.estado === 'ok' ? 'verde' : tm.estado === 'pedido' ? 'processando' : tm.estado === 'falhou' ? 'vermelho' : 'pendente', percentual: null, detalhe: tm.estado === 'ok' ? `Chamada de teste ok (${tm.ms} ms)` : tm.estado === 'falhou' ? `A chamada de teste falhou: ${tm.motivo}` : tm.estado === 'pedido' ? 'Teste pedido; aguardando a ponte responder.' : 'Ainda sem chamada de teste.' };
    const modeloParaFontes = tm.estado === 'nenhum'
      ? { estado: 'nao_feito' as const }
      : { estado: tm.estado, ms: tm.ms ?? undefined, motivo: tm.motivo ?? undefined };
    const crmConfig = lerConfigCrm(raiz);
    const crmStatus = lerStatusCrm(op.banco);
    const crmParaFontes = {
      configurado: crmConfig !== null,
      estado: crmStatus.estado === 'ok' ? 'ok' as const : crmStatus.estado === 'falhou' ? 'falhou' as const : undefined,
      motivo: crmStatus.motivo ?? undefined,
      completo: crmStatus.completo,
      faltando: crmStatus.faltando
    };
    const fontes = montarFontes(painel, modeloParaFontes, crmParaFontes);
    vivo.crm = { estado: fontes.crm.estado, percentual: null, detalhe: fontes.crm.detalhe };
    return {
      passos: PASSOS.map((p) => {
        const v = vivo[p.id];
        const gravado = mapa.get(p.id) === 'verde' ? 'verde' : mapa.get(p.id) === 'vermelho' ? 'vermelho' : 'pendente';
        return { id: p.id, titulo: p.titulo, mito: p.mito, explicacao: p.explicacao, pronto: p.pronto, estado: v ? v.estado : gravado, percentual: v ? v.percentual : null, detalhe: v ? v.detalhe : '' };
      }),
      bugsAbertos: listarAbertos(op.pastaBugs).length,
      fontes
    };
  };

  // Testa o Krayin e grava SO o resultado (nunca o token). Usado por /api/crm/conectar e /api/crm/testar.
  const executarTesteCrm = async (config: ConfigCrm) => {
    const lista = await listarFunis(config);
    if (!lista.ok) {
      const motivo = lista.motivo ?? 'sem conexao';
      gravarStatusCrm(op.banco, { estado: 'falhou', motivo, funis: 0, completo: false, faltando: [] }, agora());
      return { ok: false, erro: motivo, funis: 0, completo: false, faltando: [] as string[], funil: null as string | null };
    }
    const v = verificarFunil(lista.funis);
    gravarStatusCrm(op.banco, { estado: 'ok', motivo: null, funis: lista.funis.length, completo: v.completo, faltando: v.faltando }, agora());
    return { ok: true, funis: lista.funis.length, completo: v.completo, faltando: v.faltando, funil: v.funil?.nome ?? null };
  };

  const server: Server = createServer(async (req, res) => {
    try {
      const porta = (server.address() as AddressInfo).port;
      const hostsOk = [`127.0.0.1:${porta}`, `localhost:${porta}`];
      if (!hostsOk.includes(req.headers.host ?? '')) return responder(res, 403, 'text/plain; charset=utf-8', 'Host nao permitido');
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${porta}`);
      const metodo = req.method ?? 'GET';

      // Abertura com o codigo do instalador: uso unico, com bloqueio apos erros.
      if (metodo === 'GET' && url.pathname === '/' && url.searchParams.has('codigo')) {
        const dado = url.searchParams.get('codigo') ?? '';
        if (erros >= MAX_ERROS_CODIGO || codigoUsado || !iguais(dado, op.codigo)) {
          erros++;
          return responder(res, 403, 'text/plain; charset=utf-8', 'Codigo invalido ou ja usado. Feche esta janela e abra o Heimdall de novo.');
        }
        codigoUsado = true;
        const token = randomBytes(32).toString('hex');
        sessoes.add(token);
        return responder(res, 302, 'text/plain; charset=utf-8', '', { Location: '/', 'Set-Cookie': `hm=${token}; HttpOnly; SameSite=Strict; Path=/` });
      }
      if (!temSessao(req)) return responder(res, 401, 'text/plain; charset=utf-8', 'Abra a tela pelo link que o instalador mostrou.');

      if (metodo === 'GET') {
        if (url.pathname === '/') return responder(res, 200, 'text/html; charset=utf-8', HTML);
        if (url.pathname === '/app.css') return responder(res, 200, 'text/css; charset=utf-8', CSS);
        if (url.pathname === '/app.js') return responder(res, 200, 'application/javascript; charset=utf-8', JS);
        if (url.pathname === '/favicon.ico') return responder(res, 204, 'image/x-icon', '');
        if (url.pathname === '/api/estado') return json(res, 200, estado());
        if (url.pathname === '/api/historico-antigo') {
          const c = lerConfigHistorico(op.banco);
          return json(res, 200, { config: { liberado: c.liberado, ritmoSegundos: Math.round(c.ritmoMs / 1000), esperaRespostaSegundos: Math.round(c.esperaRespostaMs / 1000), tamanhoPagina: c.tamanhoPagina, maxPaginas: c.maxPaginas }, resumo: resumoHistoricoAntigo(op.banco) });
        }
        if (url.pathname === '/api/cadastro') return json(res, 200, { equipe: listarEquipe(op.banco) });
        if (url.pathname === '/api/crm') {
          const config = lerConfigCrm(raiz);
          return json(res, 200, { configurado: config !== null, url: config?.url ?? null, status: lerStatusCrm(op.banco) });
        }
        if (url.pathname === '/api/modelo') {
          return json(res, 200, { teste: lerTesteDoModelo(op.banco), passos: [
            'O login e feito por voce, no terminal, nunca nesta tela. Abra um terminal e rode: docker exec -it heimdall-hermes-1 hermes model (esta tela nunca ve nem guarda senha, token ou chave).',
            'Se o Heimdall roda em um servidor (VPS), entre nele por SSH com terminal interativo e rode o mesmo comando la: ssh -t <apelido-do-servidor> "docker exec -it heimdall-hermes-1 hermes model".',
            'Para trocar de conta: rode o mesmo comando e escolha a nova conta; depois volte aqui e clique em "Fazer chamada de teste".',
            'A cota de 5 horas do plano do ChatGPT e compartilhada com os outros aplicativos que usam a mesma conta: se voce usar o ChatGPT ao mesmo tempo, o Heimdall pode esperar.',
            'Alternativa: usar uma chave de API, tambem configurada no terminal; esta tela nunca recebe a chave.',
            'O Hindsight guarda e busca trechos; a extracao de compromissos usa o Hermes.'
          ] });
        }
        if (url.pathname === '/api/processamento') {
          const c = diasDeExtracaoPendentes(op.banco, agora());
          const naFila = (op.banco.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair' AND estado IN ('pendente','em_andamento')").get() as { n: number }).n;
          return json(res, 200, { liberada: extracaoLiberada(op.banco), diasNovos: c.novos, diasRefeitos: c.refeitos, naFila, consultasPrevistas: c.novos + c.refeitos + naFila });
        }
        if (url.pathname === '/api/painel') {
          const painel = montarPainel(op.banco, agora());
          atualizarEtapas(op.banco, painel, agora());
          return json(res, 200, painel);
        }
        return json(res, 404, { erro: 'nao encontrado' });
      }
      if (metodo === 'POST') {
        // Contra CSRF: so o nosso JS manda este cabecalho, e navegadores nao o enviam entre sites sem permissao.
        if (req.headers['x-heimdall'] !== '1') return json(res, 403, { erro: 'pedido recusado' });
        const origem = req.headers.origin;
        if (origem !== undefined && !hostsOk.some((h) => origem === `http://${h}`)) return json(res, 403, { erro: 'origem nao permitida' });
        if (!/^application\/json/.test(req.headers['content-type'] ?? '')) return json(res, 415, { erro: 'envie JSON' });
        const bruto = await lerCorpo(req);
        if (bruto === null) return json(res, 413, { erro: 'corpo grande demais' });
        let dados: Record<string, unknown>;
        try { dados = JSON.parse(bruto || '{}') as Record<string, unknown>; } catch { return json(res, 400, { erro: 'JSON invalido' }); }

        if (url.pathname === '/api/ambiente/testar') {
          const verificacoes = await op.sondar();
          const falhas = resumoDeFalhas(verificacoes);
          op.banco.prepare("UPDATE onboarding_etapas SET estado = ?, fim = ?, erro = ? WHERE passo = 'ambiente'").run(falhas ? 'vermelho' : 'verde', agora(), falhas || null);
          const perfil = op.perfil ? await op.perfil() : undefined;
          return json(res, 200, perfil ? { verificacoes, ok: !falhas, perfil } : { verificacoes, ok: !falhas });
        }
        if (url.pathname === '/api/selfchat/testar') return json(res, 200, { pedido: pedirTesteSelfChat(op.banco, agora()) });
        if (url.pathname === '/api/historico-antigo/liberar') {
          if (typeof dados.liberar !== 'boolean') return json(res, 400, { erro: 'Informe liberar: true ou false.' });
          if (dados.liberar && dados.confirmar !== true) return json(res, 400, { erro: 'Para liberar a busca de mensagens antigas a confirmacao e obrigatoria.' });
          if (dados.ritmoSegundos !== undefined && (typeof dados.ritmoSegundos !== 'number' || !Number.isFinite(dados.ritmoSegundos) || dados.ritmoSegundos < 15 || dados.ritmoSegundos > 3600)) return json(res, 400, { erro: 'O intervalo entre pedidos precisa ficar entre 15 e 3600 segundos (ritmo conservador para nao arriscar a conta).' });
          gravarConfigHistorico(op.banco, { liberado: dados.liberar, ...(typeof dados.ritmoSegundos === 'number' ? { ritmoMs: Math.floor(dados.ritmoSegundos * 1000) } : {}) });
          return json(res, 200, { liberado: lerConfigHistorico(op.banco).liberado });
        }
        if (url.pathname === '/api/cadastro/entender') {
          const r = normalizarTelefone(typeof dados.telefone === 'string' ? dados.telefone : '');
          return r.ok ? json(res, 200, { exibir: r.exibir }) : json(res, 400, { erro: r.motivo });
        }
        if (url.pathname === '/api/cadastro/membro') {
          const r = cadastrarMembro(op.banco, { nome: typeof dados.nome === 'string' ? dados.nome : '', funcao: typeof dados.funcao === 'string' ? dados.funcao : '', telefone: typeof dados.telefone === 'string' ? dados.telefone : '' }, agora());
          return r.ok ? json(res, 200, { achou: r.achou, aviso: r.aviso ?? null, exibir: r.exibir }) : json(res, 400, { erro: r.motivo });
        }
        if (url.pathname === '/api/modelo/testar') return json(res, 200, { pedido: pedirTesteDoModelo(op.banco, agora()) });
        if (url.pathname === '/api/crm/conectar') {
          let config: ConfigCrm;
          try {
            config = salvarConfigCrm(raiz, { url: dados.url, token: dados.token });
          } catch (e) {
            return json(res, 400, { erro: e instanceof Error ? e.message : 'configuracao do CRM invalida.' });
          }
          const resultado = await executarTesteCrm(config);
          return json(res, 200, { configurado: true, url: config.url, ...resultado, status: lerStatusCrm(op.banco) });
        }
        if (url.pathname === '/api/crm/testar') {
          const config = lerConfigCrm(raiz);
          if (!config) return json(res, 400, { erro: 'O CRM ainda nao esta configurado. Preencha o endereco e o token.' });
          const resultado = await executarTesteCrm(config);
          return json(res, 200, { configurado: true, url: config.url, ...resultado, status: lerStatusCrm(op.banco) });
        }
        if (url.pathname === '/api/processamento/liberar') {
          if (typeof dados.liberar !== 'boolean') return json(res, 400, { erro: 'Informe liberar: true ou false.' });
          if (dados.liberar && dados.confirmar !== true) return json(res, 400, { erro: 'Para liberar o processamento a confirmacao e obrigatoria.' });
          definirExtracaoLiberada(op.banco, dados.liberar);
          return json(res, 200, { liberada: extracaoLiberada(op.banco) });
        }
        if (url.pathname === '/api/agenda/testar') {
          const relatorios = gerarRelatorioDeTeste(op.banco, agora());
          const tudoCabe = relatorios.every((r) => r.cabe);
          op.banco.prepare("UPDATE onboarding_etapas SET estado = ?, fim = ?, erro = ? WHERE passo = 'agenda'").run(tudoCabe ? 'verde' : 'vermelho', agora(), tudoCabe ? null : 'um relatorio de teste passou do tamanho de uma tela');
          return json(res, 200, { relatorios });
        }
        if (url.pathname === '/api/backup/destino') {
          const pasta = typeof dados.pasta === 'string' ? dados.pasta.trim() : '';
          const r = pasta ? definirDestinoDeBackup(op.banco, pasta) : { ok: false as const, motivo: 'Informe a pasta do backup.' };
          return r.ok ? json(res, 200, { ok: true }) : json(res, 400, { erro: r.motivo });
        }
        if (url.pathname === '/api/backup/agora') {
          if (!lerBackup(op.banco).destino) return json(res, 400, { erro: 'Escolha primeiro a pasta do backup.' });
          const resultado = backupDoDia(op.banco, agora());
          const b = lerBackup(op.banco);
          return json(res, 200, { resultado, ultimoEm: b.ultimoEm, erro: b.erro });
        }
        if (url.pathname === '/api/bug') {
          const etapa = typeof dados.etapa === 'string' ? dados.etapa : '';
          const descricao = typeof dados.descricao === 'string' ? dados.descricao.trim() : '';
          if (!descricao || descricao.length > 4000) return json(res, 400, { erro: 'descricao vazia ou longa demais' });
          if (!PASSOS.some((p) => p.id === etapa)) return json(res, 400, { erro: 'etapa desconhecida' });
          const caminho = gravarRelatorio(op.pastaBugs, { origem: 'onboarding', etapa: `onboarding-${etapa}`, resumo: descricao.split('\n')[0]!.slice(0, 200), saida: descricao, ambiente: { sistema: platform(), arquitetura: arch(), node: process.version } }, agora());
          return json(res, 200, { arquivo: caminho.split(/[\\/]/).pop() });
        }
        return json(res, 404, { erro: 'nao encontrado' });
      }
      return json(res, 405, { erro: 'metodo nao permitido' });
    } catch {
      if (!res.headersSent) json(res, 500, { erro: 'erro interno' });
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(porta, '127.0.0.1', () => {
      const p = (server.address() as AddressInfo).port;
      resolve({ url: `http://127.0.0.1:${p}`, porta: p, fechar: () => new Promise((r) => { server.closeAllConnections(); server.close(() => r()); }) });
    });
  });
}
