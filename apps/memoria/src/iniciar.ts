// Processo da memoria: envia as conversas dos dias fechados ao Hindsight local. Uso: node apps/memoria/src/iniciar.ts
// Variaveis: HINDSIGHT_URL (padrao http://127.0.0.1:8888), HINDSIGHT_BANK (padrao heimdall), HINDSIGHT_API_KEY (opcional), HEIMDALL_DATA.
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { iniciarMemoria } from './ciclo.ts';
import { criarClienteHindsight } from './hindsight.ts';

export function iniciar(raiz: string = process.cwd()) {
  const pastaDados = resolve(raiz, process.env.HEIMDALL_DATA ?? 'data');
  const banco = abrirBanco(join(pastaDados, 'acervo.sqlite'));
  banco.prepare('PRAGMA journal_mode = WAL').get();
  banco.prepare('PRAGMA busy_timeout = 5000').get();
  migrar(banco);
  const hindsight = criarClienteHindsight({ url: process.env.HINDSIGHT_URL ?? 'http://127.0.0.1:8888', banco: process.env.HINDSIGHT_BANK ?? 'heimdall', chave: process.env.HINDSIGHT_API_KEY });
  const m = iniciarMemoria({ banco, porta: hindsight, saudeHindsight: () => hindsight.saude() });
  return { hindsight, parar: () => { m.parar(); void m.terminou.then(() => banco.close()); }, terminou: m.terminou };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const p = iniciar();
  console.log('Heimdall: envio da memoria ao Hindsight ligado (so conversas de dias fechados; so fala com o Hindsight local).');
  const sair = () => { p.parar(); setTimeout(() => process.exit(0), 1000); };
  process.on('SIGINT', sair);
  process.on('SIGTERM', sair);
}
