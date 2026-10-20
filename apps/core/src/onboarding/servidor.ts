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

export interface OpcoesServidor {
  banco: Banco;
  codigo: string; // uso unico
  pastaBugs: string;
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
    return {
      passos: PASSOS.map((p) => ({ id: p.id, titulo: p.titulo, mito: p.mito, explicacao: p.explicacao, pronto: p.pronto, estado: mapa.get(p.id) === 'verde' ? 'verde' : mapa.get(p.id) === 'vermelho' ? 'vermelho' : 'pendente' })),
      bugsAbertos: listarAbertos(op.pastaBugs).length
    };
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
          return responder(res, 403, 'text/plain; charset=utf-8', 'Codigo invalido ou ja usado. Feche esta janela e rode iniciar.cmd de novo.');
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
        if (url.pathname === '/api/estado') return json(res, 200, estado());
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
