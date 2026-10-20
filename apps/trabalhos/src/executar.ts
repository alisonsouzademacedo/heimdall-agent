// UNICO arquivo do executor que roda programas (child_process): sem shell, com tempo limite e saida limitada.
import { spawn } from 'node:child_process';
import { FalhaDefinitiva } from '../../core/src/midia.ts';
import type { TipoTexto } from './docker.ts';

export interface Saida { codigo: number | null; stdout: string; stderr: string; expirou: boolean; erroDeInicio?: string }
export interface OpcoesExecucao { timeoutMs: number; env?: Record<string, string>; maxStdout?: number }

const MAX_STDERR = 2000;

export function executar(cmd: string, args: string[], o: OpcoesExecucao): Promise<Saida> {
  const maxStdout = o.maxStdout ?? 20 * 1024 * 1024;
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let expirou = false;
    let terminou = false;
    const fim = (s: Omit<Saida, 'stdout' | 'stderr' | 'expirou'> & Partial<Saida>) => {
      if (terminou) return;
      terminou = true;
      clearTimeout(relogio);
      resolve({ stdout, stderr, expirou, ...s } as Saida);
    };
    let filho;
    try {
      filho = spawn(cmd, args, { shell: false, windowsHide: true, env: { ...process.env, ...o.env }, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      resolve({ codigo: null, stdout: '', stderr: '', expirou: false, erroDeInicio: `nao foi possivel iniciar: ${(e as Error).message}` });
      return;
    }
    const relogio = setTimeout(() => { expirou = true; filho.kill('SIGKILL'); }, o.timeoutMs);
    filho.stdout.on('data', (d: Buffer) => { if (stdout.length < maxStdout) stdout += d.toString('utf8').slice(0, maxStdout - stdout.length); });
    filho.stderr.on('data', (d: Buffer) => { if (stderr.length < MAX_STDERR) stderr += d.toString('utf8').slice(0, MAX_STDERR - stderr.length); });
    filho.on('error', (e) => fim({ codigo: null, erroDeInicio: `nao foi possivel iniciar: ${e.message}` }));
    filho.on('close', (codigo) => fim({ codigo }));
  });
}

// Le o resultado combinado: uma linha JSON no stdout (a ultima). Codigo 3 = falha definitiva; qualquer outra falha pode ser repetida.
// Do stderr so entra o MOTIVO ("erro:<motivo>"), nunca texto livre: conteudo de conversa nao vai para a fila nem para o log (regra 2).
export function interpretar(tipo: TipoTexto, s: Saida): { texto: string } | { markdown: string } {
  if (s.erroDeInicio) throw new Error(s.erroDeInicio.slice(0, 200));
  if (s.expirou) throw new Error('tempo_esgotado');
  if (s.codigo !== 0) {
    const motivo = s.stderr.match(/^erro:([A-Za-z0-9_:.-]{1,80})/m)?.[1] ?? `falha_codigo_${s.codigo}`;
    if (s.codigo === 3) throw new FalhaDefinitiva(motivo);
    throw new Error(motivo);
  }
  const linha = s.stdout.trim().split('\n').pop() ?? '';
  let json: unknown;
  try { json = JSON.parse(linha); } catch { throw new Error('saida_invalida'); }
  const campo = tipo === 'converter_pdf' ? 'markdown' : 'texto';
  const valor = (json as Record<string, unknown> | null)?.[campo];
  if (typeof valor !== 'string') throw new Error('saida_invalida');
  return tipo === 'converter_pdf' ? { markdown: valor } : { texto: valor };
}
