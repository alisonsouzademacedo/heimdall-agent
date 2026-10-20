// Portas reais do executor: transcrever e converter PDF pelo contêiner media-worker (docker.ts monta o comando, executar.ts roda).
import { montarComando, comandoLimpeza, type OpcoesDocker } from './docker.ts';
import { executar, interpretar, type OpcoesExecucao, type Saida } from './executar.ts';
import type { PortasTexto } from '../../core/src/midia.ts';

export type Executar = (cmd: string, args: string[], o: OpcoesExecucao) => Promise<Saida>;
export interface OpcoesPortas extends OpcoesDocker { timeoutAudioMs?: number; timeoutPdfMs?: number }

export function criarPortasDocker(o: OpcoesPortas, rodarPrograma: Executar = executar): PortasTexto {
  async function rodar(tipo: 'transcrever' | 'converter_pdf', caminho: string, timeoutMs: number) {
    const c = montarComando(tipo, caminho, o); // valida o nome do arquivo ANTES de qualquer coisa rodar
    const saida = await rodarPrograma(c.cmd, c.args, { timeoutMs, env: c.env });
    if (saida.expirou) {
      // Matar o programa "docker" nao para o contêiner: remove pelo nome fixo para nao deixar processo pesado para tras.
      const l = comandoLimpeza();
      await rodarPrograma(l.cmd, l.args, { timeoutMs: 30_000 });
    }
    return interpretar(tipo, saida);
  }
  return {
    async transcrever(caminho) { return rodar('transcrever', caminho, o.timeoutAudioMs ?? 30 * 60_000) as Promise<{ texto: string }>; },
    async converterPdf(caminho) { return rodar('converter_pdf', caminho, o.timeoutPdfMs ?? 5 * 60_000) as Promise<{ markdown: string }>; }
  };
}
