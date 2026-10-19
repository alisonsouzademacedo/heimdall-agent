// Verificacao do ambiente para o passo 0 da tela, e abertura do navegador.
// Este e um dos dois arquivos autorizados a usar node:child_process (o outro: nenhum). Comandos FIXOS, sem entrada de usuario.
import { spawn, spawnSync } from 'node:child_process';
import { freemem, totalmem, platform } from 'node:os';
import { statfsSync } from 'node:fs';

export type EstadoVerificacao = 'ok' | 'atencao' | 'falha';

export interface Verificacao {
  id: string;
  rotulo: string;
  detalhe: string;
  estado: EstadoVerificacao;
}

export interface Medidas {
  plataforma: string;
  memTotalBytes: number;
  memLivreBytes: number;
  discoLivreBytes: number;
  nodeVersao: string; // ex.: "v22.22.0"
  dockerRodando: boolean;
}

const GIB = 1024 ** 3;

function nodeSuficiente(v: string): boolean {
  const m = /^v?(\d+)\.(\d+)/.exec(v);
  if (!m) return false;
  const maior = Number(m[1]), menor = Number(m[2]);
  return maior > 22 || (maior === 22 && menor >= 18);
}

// Funcao pura: transforma medidas em verificacoes (limites do verificador: docs/plano/fase-1-requisitos-e-preflight.md).
export function avaliar(m: Medidas): Verificacao[] {
  const v: Verificacao[] = [];
  v.push({ id: 'sistema', rotulo: 'Sistema', detalhe: m.plataforma === 'win32' ? 'Windows' : m.plataforma, estado: m.plataforma === 'win32' || m.plataforma === 'linux' || m.plataforma === 'darwin' ? 'ok' : 'falha' });
  const gb = Math.round(m.memTotalBytes / GIB); // 7,8 GiB contam como "8 GB" (como no verificador)
  v.push({ id: 'memoria', rotulo: `Memória: ${gb} GB`, detalhe: gb >= 16 ? 'Folgada' : gb >= 8 ? 'No limite. Deixe aberto so o que for preciso.' : 'Abaixo do minimo de 8 GB.', estado: gb >= 16 ? 'ok' : gb >= 8 ? 'atencao' : 'falha' });
  const livreGb = m.memLivreBytes / GIB;
  v.push({ id: 'memoria-livre', rotulo: `Memória livre agora: ${livreGb.toFixed(1)} GB`, detalhe: livreGb >= 2 ? 'Suficiente para comecar' : 'Feche navegadores e outros programas.', estado: livreGb >= 2 ? 'ok' : 'atencao' });
  const disco = Math.floor(m.discoLivreBytes / GIB);
  v.push({ id: 'disco', rotulo: `Disco: ${disco} GB livres`, detalhe: disco >= 50 ? 'Folgado' : disco >= 30 ? 'Acima do minimo de 30 GB' : 'Abaixo do minimo de 30 GB (so a imagem do Hindsight pesa cerca de 9 GB).', estado: disco >= 50 ? 'ok' : disco >= 30 ? 'atencao' : 'falha' });
  v.push({ id: 'node', rotulo: `Node.js ${m.nodeVersao}`, detalhe: nodeSuficiente(m.nodeVersao) ? 'Versao suficiente' : 'Precisa de 22.18 ou mais', estado: nodeSuficiente(m.nodeVersao) ? 'ok' : 'falha' });
  v.push({ id: 'docker', rotulo: 'Docker', detalhe: m.dockerRodando ? 'Rodando' : 'Instalado? Abra o Docker Desktop, aceite os termos e espere ficar verde.', estado: m.dockerRodando ? 'ok' : 'falha' });
  return v;
}

export function resumoDeFalhas(v: readonly Verificacao[]): string {
  return v.filter((x) => x.estado === 'falha').map((x) => x.rotulo).join('; ');
}

function dockerRodando(): boolean {
  try {
    const r = spawnSync('docker', ['info'], { timeout: 15_000, stdio: 'ignore', windowsHide: true });
    return r.status === 0;
  } catch { return false; }
}

export function medirSistema(pasta: string = process.cwd()): Medidas {
  let livre = 0;
  try { const s = statfsSync(pasta); livre = s.bavail * s.bsize; } catch { livre = 0; }
  return { plataforma: platform(), memTotalBytes: totalmem(), memLivreBytes: freemem(), discoLivreBytes: livre, nodeVersao: process.version, dockerRodando: dockerRodando() };
}

// Abre a tela no navegador padrao. So aceita enderecos http://127.0.0.1:porta/ (nada de abrir qualquer coisa).
export function abrirNavegador(url: string): boolean {
  if (!/^http:\/\/127\.0\.0\.1:\d{2,5}\/[A-Za-z0-9?=_.~-]*$/.test(url)) return false;
  try {
    const [cmd, args] = platform() === 'win32' ? ['cmd', ['/c', 'start', '', url]] : platform() === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    const p = spawn(cmd as string, args as string[], { detached: true, stdio: 'ignore', windowsHide: true });
    p.on('error', () => {});
    p.unref();
    return true;
  } catch { return false; }
}
