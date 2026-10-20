// Ponto de entrada: sobe a tela de onboarding e abre o navegador. Uso: node apps/core/src/onboarding/iniciar.ts
import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirBanco, migrar } from '../db.ts';
import { iniciarServidor } from './servidor.ts';
import { medirSistema, avaliar, abrirNavegador, type Medidas } from './ambiente.ts';
import { escolherPerfil, descreverPerfil } from './perfil.ts';

export async function principal(raiz: string = process.cwd()): Promise<void> {
  const dados = join(raiz, 'data');
  mkdirSync(dados, { recursive: true });
  const banco = abrirBanco(join(dados, 'acervo.sqlite'));
  migrar(banco);
  const codigo = randomBytes(12).toString('base64url');
  const preferida = Number(process.env.HEIMDALL_PORTA ?? 8765);
  // Uma medicao serve a verificacao e ao perfil (a tela chama "sondar" e depois "perfil" na mesma requisicao).
  let ultima: Medidas | null = null;
  const medir = (): Medidas => { ultima = medirSistema(raiz); return ultima; };
  const op = { banco, codigo, pastaBugs: join(dados, 'bugs'), sondar: () => avaliar(medir()), perfil: () => escolherPerfil(ultima ?? medir()) };
  let servidor;
  try { servidor = await iniciarServidor(op, preferida); } catch { servidor = await iniciarServidor(op, 0); }
  const link = `${servidor.url}/?codigo=${codigo}`;
  console.log('');
  for (const linha of descreverPerfil(escolherPerfil(medir()))) console.log(linha); // o "teste inicial": qual setup serve a ESTE computador
  console.log('');
  console.log('Heimdall: a tela de configuracao esta no ar (so nesta maquina).');
  console.log(`Se o navegador nao abrir sozinho, copie este endereco: ${link}`);
  console.log('Deixe esta janela aberta enquanto usa a tela. Para encerrar: feche a janela ou CTRL+C.');
  if (process.env.HEIMDALL_SEM_NAVEGADOR !== '1' && !abrirNavegador(link)) console.log('(Nao consegui abrir o navegador sozinho.)');
  const encerrar = () => { servidor.fechar().then(() => { banco.close(); process.exit(0); }); };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal().catch((e) => { console.error('Falha ao iniciar a tela:', e instanceof Error ? e.message : e); process.exit(1); });
}
