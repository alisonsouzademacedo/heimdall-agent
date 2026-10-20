// Processo do executor: transcreve audios e converte PDFs, um por vez, pelo contêiner media-worker. Uso: node apps/trabalhos/src/iniciar.ts
// Precisa do Docker rodando e de infra/compose/.env. Nao tem internet propria nem fala com o WhatsApp.
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { iniciarExecutor } from './ciclo.ts';
import { criarPortasDocker } from './portas.ts';

export function iniciar(raiz: string = process.cwd()) {
  const pastaDados = resolve(raiz, process.env.HEIMDALL_DATA ?? 'data');
  const banco = abrirBanco(join(pastaDados, 'acervo.sqlite'));
  banco.prepare('PRAGMA journal_mode = WAL').get();
  banco.prepare('PRAGMA busy_timeout = 5000').get();
  migrar(banco);
  const portas = criarPortasDocker({
    composeFile: join(raiz, 'infra', 'compose', 'docker-compose.yml'),
    envFile: join(raiz, 'infra', 'compose', '.env'),
    pastaDados
  });
  const ex = iniciarExecutor({ banco, portas });
  return { parar: () => { ex.parar(); void ex.terminou.then(() => banco.close()); }, terminou: ex.terminou };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const e = iniciar();
  console.log('Heimdall: executor de audio e PDF ligado (um por vez, pelo contêiner, sem internet).');
  const sair = () => { e.parar(); setTimeout(() => process.exit(0), 1000); };
  process.on('SIGINT', sair);
  process.on('SIGTERM', sair);
}
