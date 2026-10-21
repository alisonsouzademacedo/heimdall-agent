// Verificacao do ambiente para o passo 0 da tela, e abertura do navegador.
// Este e um dos dois arquivos autorizados a usar node:child_process (o outro: nenhum). Comandos FIXOS, sem entrada de usuario.
import { spawn, spawnSync } from 'node:child_process';
import { arch, cpus, freemem, totalmem, platform, release } from 'node:os';
import { statfsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  // So no Windows (o Docker Desktop precisa dos dois; windows-install.md). undefined = nao se aplica ou nao foi medido.
  virtualizacao?: boolean;
  wsl?: boolean;
  // Versoes (windows-install.md). wslVersao: null = WSL presente mas a versao nao foi lida. windowsBuild: terceiro numero de os.release().
  wslVersao?: string | null;
  windowsBuild?: number;
  // Imagens do Compose que NAO estao no Docker (so medido com o Docker rodando). undefined = nao medido.
  imagensFaltando?: string[];
  // Para o perfil por tipo de computador (perfil.ts). Ausentes = nao medidos.
  arch?: string; // ex.: "x64", "arm64"
  cpus?: number; // processadores logicos
  gpuNvidia?: { nome: string; vramMb: number } | null; // null = nenhuma placa NVIDIA (ou nvidia-smi ausente)
}

const GIB = 1024 ** 3;

function nodeSuficiente(v: string): boolean {
  const m = /^v?(\d+)\.(\d+)/.exec(v);
  if (!m) return false;
  const maior = Number(m[1]), menor = Number(m[2]);
  return maior > 22 || (maior === 22 && menor >= 18);
}

// Minimos de docs/docker/desktop/setup/install/windows-install.md: WSL 2.1.5; Windows 10 22H2 (build 19045); Windows 11 23H2 (build 22631).
const WSL_MINIMO = [2, 1, 5] as const;
const CMD_COMPOSE = 'docker compose --env-file infra/compose/.env -f infra/compose/docker-compose.yml';

// A saida do "wsl --version" e UTF-16 (caracteres nulos entre as letras) e pode vir em outro idioma: tira os nulos e pega o primeiro x.y.z.
export function lerVersaoWsl(saida: string): string | null {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(saida.replace(/\u0000/g, ''));
  return m ? `${m[1]}.${m[2]}.${m[3]}` : null;
}

function wslSuficiente(v: string): boolean {
  const p = v.split('.').map(Number);
  for (let i = 0; i < 3; i++) { const min = WSL_MINIMO[i]!; if ((p[i] ?? 0) !== min) return (p[i] ?? 0) > min; }
  return true;
}

// Windows 10 precisa de 22H2 (19045); Windows 11, de 23H2 (22631). Builds 22000 a 22630 sao Windows 11 mais antigo que o minimo.
export function windowsBuildSuficiente(b: number): boolean {
  return b < 22000 ? b >= 19045 : b >= 22631;
}

// Imagens citadas no Compose ("image: nome:tag"), sem repetir e ignorando comentarios.
export function imagensDoCompose(texto: string): string[] {
  const achadas: string[] = [];
  for (const linha of texto.split(/\r?\n/)) {
    const m = /^\s+image:\s*([A-Za-z0-9][A-Za-z0-9._\/-]*:[A-Za-z0-9._-]+)\s*(#.*)?$/.exec(linha);
    if (m && !achadas.includes(m[1]!)) achadas.push(m[1]!);
  }
  return achadas;
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
  if (m.virtualizacao !== undefined) {
    v.push({ id: 'virtualizacao', rotulo: `Virtualização: ${m.virtualizacao ? 'ligada' : 'desligada'}`, detalhe: m.virtualizacao ? 'O Docker Desktop consegue rodar' : 'Desligada. Ligue na BIOS/UEFI (reinicie o computador e entre na configuracao da placa; o nome da opcao varia: Intel VT-x, Virtualization Technology ou SVM). Sem isso o Docker nao abre.', estado: m.virtualizacao ? 'ok' : 'falha' });
  }
  if (m.wsl !== undefined) {
    v.push({ id: 'wsl', rotulo: `WSL 2: ${m.wsl ? 'instalado' : 'nao instalado'}`, detalhe: m.wsl ? 'Pronto para o Docker Desktop' : 'Instale com "wsl --install" num PowerShell aberto como administrador e reinicie o computador. Se "wsl --install" responder em circulo ("instale executando wsl.exe --install"), use o caminho manual (docs/wsl/install-manual.md): como administrador rode "dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart" e "dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart", reinicie e rode "wsl --update".', estado: m.wsl ? 'ok' : 'falha' });
  }
  if (m.wsl && m.wslVersao !== undefined) {
    const ok = m.wslVersao !== null && wslSuficiente(m.wslVersao);
    v.push({
      id: 'wsl-versao', rotulo: `Versão do WSL: ${m.wslVersao ?? 'não consegui ler'}`,
      detalhe: m.wslVersao === null ? 'Rode "wsl --version" num PowerShell e confira se e 2.1.5 ou mais novo.' : ok ? 'Versao suficiente para o Docker Desktop' : 'Antiga demais (o Docker Desktop pede 2.1.5 ou mais novo). Abra o PowerShell como administrador, rode "wsl --update" e reinicie o computador.',
      estado: m.wslVersao === null ? 'atencao' : ok ? 'ok' : 'falha'
    });
  }
  if (m.windowsBuild !== undefined) {
    const ok = windowsBuildSuficiente(m.windowsBuild);
    v.push({ id: 'windows-versao', rotulo: `Windows (compilação ${m.windowsBuild})`, detalhe: ok ? 'Versao aceita pelo Docker Desktop' : 'A documentacao do Docker pede Windows 10 22H2 (compilacao 19045) ou Windows 11 23H2 (compilacao 22631) ou mais novo. Atualize pelo Windows Update.', estado: ok ? 'ok' : 'atencao' });
  }
  if (m.imagensFaltando !== undefined && m.dockerRodando) {
    const f = m.imagensFaltando;
    v.push({
      id: 'imagens', rotulo: f.length === 0 ? 'Imagens do Heimdall no Docker: todas na versao certa' : `Imagens do Heimdall que faltam no Docker: ${f.length}`,
      detalhe: f.length === 0 ? 'Nada para baixar' : `Faltam: ${f.join(', ')}. Para baixar as que vem prontas: ${CMD_COMPOSE} pull --ignore-buildable   Para construir as do projeto: ${CMD_COMPOSE} build   (o Heimdall so mostra os comandos; quem roda e voce).`,
      estado: f.length === 0 ? 'ok' : 'atencao'
    });
  }
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

// Windows: ha hipervisor ativo OU a virtualizacao esta ligada no firmware (mesma leitura que o "systeminfo"). Comando FIXO.
function virtualizacaoLigada(): boolean {
  try {
    const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', '(Get-CimInstance Win32_ComputerSystem).HypervisorPresent -or (Get-CimInstance Win32_Processor | Select-Object -First 1).VirtualizationFirmwareEnabled'], { timeout: 20_000, encoding: 'utf8', windowsHide: true });
    return r.status === 0 && /^true\s*$/i.test(r.stdout ?? '');
  } catch { return false; }
}

// "wsl --version" sai com codigo 0 so quando o WSL moderno esta instalado (a saida do wsl e UTF-16: ignorada).
function wslInstalado(): boolean {
  try { return spawnSync('wsl', ['--version'], { timeout: 15_000, stdio: 'ignore', windowsHide: true }).status === 0; } catch { return false; }
}

// Funcao pura: le a saida de "nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits" ("NOME, MB" por linha).
// Varias placas: fica com a de mais memoria. Qualquer outra coisa (erro do driver, vazio): nenhuma placa.
export function lerNvidiaSmi(texto: string): { nome: string; vramMb: number } | null {
  let melhor: { nome: string; vramMb: number } | null = null;
  for (const linha of texto.split(/\r?\n/)) {
    const m = /^(.+),\s*(\d+)\s*$/.exec(linha.trim());
    if (!m) continue;
    const vramMb = Number(m[2]);
    if (vramMb > 0 && (melhor === null || vramMb > melhor.vramMb)) melhor = { nome: m[1]!.trim(), vramMb };
  }
  return melhor;
}

// Windows: terceiro numero de "10.0.22631" (os.release) e a compilacao. Fora do padrao: undefined.
function compilacaoWindows(): number | undefined {
  const m = /^\d+\.\d+\.(\d+)/.exec(release());
  return m ? Number(m[1]) : undefined;
}

function versaoWsl(): string | null {
  try {
    const r = spawnSync('wsl', ['--version'], { timeout: 15_000, windowsHide: true });
    if (r.status !== 0 || !r.stdout) return null;
    const b = r.stdout as Buffer;
    return lerVersaoWsl(b.includes(0) ? b.toString('utf16le') : b.toString('utf8'));
  } catch { return null; }
}

// Imagens do Compose ausentes no Docker. Comandos FIXOS; os nomes vem do arquivo do projeto e sao validados por imagensDoCompose.
function imagensAusentes(pasta: string): string[] | undefined {
  try {
    const lista = imagensDoCompose(readFileSync(join(pasta, 'infra', 'compose', 'docker-compose.yml'), 'utf8'));
    if (lista.length === 0) return undefined;
    return lista.filter((img) => spawnSync('docker', ['image', 'inspect', img], { timeout: 15_000, stdio: 'ignore', windowsHide: true }).status !== 0);
  } catch { return undefined; }
}

function placaNvidia(): { nome: string; vramMb: number } | null {
  try {
    const r = spawnSync('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'], { timeout: 10_000, encoding: 'utf8', windowsHide: true });
    return r.status === 0 ? lerNvidiaSmi(r.stdout ?? '') : null;
  } catch { return null; }
}

export function medirSistema(pasta: string = process.cwd()): Medidas {
  let livre = 0;
  try { const s = statfsSync(pasta); livre = s.bavail * s.bsize; } catch { livre = 0; }
  const m: Medidas = { plataforma: platform(), memTotalBytes: totalmem(), memLivreBytes: freemem(), discoLivreBytes: livre, nodeVersao: process.version, dockerRodando: dockerRodando(), arch: arch(), cpus: cpus().length, gpuNvidia: placaNvidia() };
  if (m.plataforma === 'win32') { m.virtualizacao = virtualizacaoLigada(); m.wsl = wslInstalado(); if (m.wsl) m.wslVersao = versaoWsl(); m.windowsBuild = compilacaoWindows(); }
  if (m.dockerRodando) m.imagensFaltando = imagensAusentes(pasta);
  return m;
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
