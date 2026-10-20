// Processo da ponte: responde ao dono no self-chat usando o Hermes local. Uso: node apps/ponte/src/iniciar.ts
// Variaveis: HERMES_URL (padrao http://127.0.0.1:8642), HERMES_API_KEY (ou API_SERVER_KEY em infra/compose/.env), HEIMDALL_DATA.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { iniciarPonte, lerChaveDoEnv } from './ciclo.ts';
import { criarClienteHermes } from './hermes.ts';
import type { PortasAgenda } from './agenda.ts';
import { criarApagadorDeMidia } from './apagar-arquivo.ts';
import { apagarBackup } from './apagar-backup.ts';

export function iniciar(raiz: string = process.cwd()) {
  const pastaDados = resolve(raiz, process.env.HEIMDALL_DATA ?? 'data');
  const banco = abrirBanco(join(pastaDados, 'acervo.sqlite'));
  banco.prepare('PRAGMA journal_mode = WAL').get();
  banco.prepare('PRAGMA busy_timeout = 5000').get();
  migrar(banco);
  const envArquivo = join(raiz, 'infra', 'compose', '.env');
  const chave = process.env.HERMES_API_KEY ?? (existsSync(envArquivo) ? lerChaveDoEnv(readFileSync(envArquivo, 'utf8')) : null);
  if (!chave) throw new Error('Falta a chave da API do Hermes (HERMES_API_KEY ou API_SERVER_KEY em infra/compose/.env)');
  const hermes = criarClienteHermes({ url: process.env.HERMES_URL ?? 'http://127.0.0.1:8642', chave });
  const ler = (nome: string): string => readFileSync(join(raiz, 'prompts', 'relatorios', nome), 'utf8');
  const agenda: PortasAgenda = {
    redator: (pedido) => hermes.perguntar(pedido, { sessao: 'heimdall:relatorios' }),
    instrucoes: { comum: ler('comum.md'), diario: ler('diario.md'), semanal: ler('semanal.md') }
  };
  const instrucoesExtracao = readFileSync(join(raiz, 'prompts', 'extracao', 'compromissos-e-sinais.md'), 'utf8');
  const extracao = { porta: { extrair: (pedido: string, sessao: string) => hermes.perguntar(pedido, { sessao }) }, instrucoes: instrucoesExtracao };
  const p = iniciarPonte({ agenda, extracao, apagarBackup: (pasta, nome) => { apagarBackup(pasta, nome); }, saudeHermes: () => hermes.saude(), banco, portas: { hermes, apagarArquivo: (c) => { criarApagadorDeMidia(pastaDados)(c); } } });
  return { hermes, parar: async () => { p.parar(); await p.terminou; banco.close(); }, terminou: p.terminou };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const p = iniciar();
  console.log('Heimdall: ponte do self-chat ligada (so responde ao dono; fala so com o Hermes local).');
  const sair = () => { void p.parar().then(() => process.exit(0)); };
  process.on('SIGINT', sair);
  process.on('SIGTERM', sair);
}
