// Monta o comando do contêiner media-worker. Funcao pura, sem executar nada (quem executa e executar.ts).
// SEMPRE o mesmo formato, sem shell: docker compose ... run --rm -T --name heimdall-trabalho media-worker python /app/<script>.py /entrada/<sha256>.<ext>
// O nome do arquivo e VALIDADO (64 hex minusculos + .ogg/.pdf, o que nos mesmos gravamos): nada vindo de mensagem vira argumento.
export type TipoTexto = 'transcrever' | 'converter_pdf';

export const NOME_CONTAINER = 'heimdall-trabalho';
const EXTENSAO: Record<TipoTexto, 'ogg' | 'pdf'> = { transcrever: 'ogg', converter_pdf: 'pdf' };
const SCRIPT: Record<TipoTexto, string> = { transcrever: '/app/transcrever.py', converter_pdf: '/app/converter_pdf.py' };

export interface OpcoesDocker {
  composeFile: string;
  envFile: string;
  /** Pasta de dados reais (a do Compose monta <pasta>/midias como /entrada somente leitura). */
  pastaDados: string;
}

export interface Comando { cmd: 'docker'; args: string[]; env: Record<string, string> }

export function nomeSeguro(caminho: string, extensao: 'ogg' | 'pdf'): string {
  const nome = caminho.split(/[\\/]/).pop() ?? '';
  if (!new RegExp(`^[a-f0-9]{64}\\.${extensao}$`).test(nome)) throw new Error('nome de arquivo invalido');
  return nome;
}

export function montarComando(tipo: TipoTexto, caminho: string, o: OpcoesDocker): Comando {
  if (!(tipo in EXTENSAO)) throw new Error('tipo de trabalho desconhecido');
  const nome = nomeSeguro(caminho, EXTENSAO[tipo]);
  return {
    cmd: 'docker',
    args: ['compose', '--env-file', o.envFile, '-f', o.composeFile, '--profile', 'trabalho', 'run', '--rm', '-T', '--name', NOME_CONTAINER, 'media-worker', 'python', SCRIPT[tipo], `/entrada/${nome}`],
    env: { HEIMDALL_DATA: o.pastaDados }
  };
}

export function comandoLimpeza(): { cmd: 'docker'; args: string[] } {
  return { cmd: 'docker', args: ['rm', '-f', NOME_CONTAINER] };
}
