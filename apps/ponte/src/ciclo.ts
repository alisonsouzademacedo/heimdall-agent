// O laco da ponte: de tempos em tempos olha o self-chat do dono e responde pela caixa de saida.
import type { Banco } from '../../core/src/db.ts';
import { processarSelfChat, type PortasSelfChat } from './selfchat.ts';
import { gerarRelatorioDoDia, type PortasAgenda } from './agenda.ts';
import { gravarServico } from '../../core/src/whatsapp/estado.ts';
import { backupDoDia, lerBackup } from '../../core/src/backup-copia.ts';
import { rodizioDeBackups } from '../../core/src/backup-rodizio.ts';
import { diaLocal } from '../../core/src/calendario.ts';
import { agendarExtracao, processarExtrair, type PortaExtracao } from '../../core/src/extracao.ts';
import { haProntos, pegarProximo } from '../../core/src/fila.ts';

/** Quantos trabalhos de extracao por giro: o modelo e lento; o self-chat nao pode esperar uma fila inteira. */
export const EXTRACOES_POR_GIRO = 2;

export interface OpcoesPonte {
  banco: Banco;
  portas: PortasSelfChat;
  /** Relatorios diario e semanal; sem isto o laco so cuida do self-chat. */
  agenda?: PortasAgenda;
  /** Extracao de compromissos e sinais das conversas de cliente (so le o banco; o resultado volta para o banco). */
  extracao?: { porta: PortaExtracao; instrucoes: string };
  /** Pergunta ao Hermes se esta de pe; o resultado vai para a tabela de configuracao (a tela mostra no painel). */
  saudeHermes?: () => Promise<boolean>;
  /** Apaga UM arquivo de backup (rodizio dos antigos e invalidos); sem isto o rodizio nao acontece. */
  apagarBackup?: (pasta: string, nome: string) => void;
  agora?: () => number;
  esperar?: (ms: number) => Promise<void>;
  intervaloMs?: number;
}

export function iniciarPonte(o: OpcoesPonte): { parar(): void; terminou: Promise<void> } {
  const agora = o.agora ?? Date.now;
  let acordar: (() => void) | null = null;
  const esperar = o.esperar ?? ((ms: number) => new Promise<void>((r) => { const t = setTimeout(r, ms); acordar = () => { clearTimeout(t); r(); }; }));
  let parado = false;
  const terminou = (async () => {
    while (!parado) {
      try { await processarSelfChat(o.banco, o.portas, agora()); } catch { /* erro inesperado nao derruba o laco: tenta no proximo giro */ }
      if (o.agenda) { try { await gerarRelatorioDoDia(o.banco, o.agenda, agora()); } catch { /* idem */ } }
      if (o.extracao) {
        try {
          if (!haProntos(o.banco, ['extrair'], agora())) agendarExtracao(o.banco, agora()); // varre o acervo todo: so quando a fila esvaziou
          for (let i = 0; i < EXTRACOES_POR_GIRO && !parado; i++) {
            const job = pegarProximo(o.banco, ['extrair'], agora());
            if (!job) break;
            await processarExtrair(o.banco, job, o.extracao.porta, o.extracao.instrucoes, agora());
          }
        } catch { /* idem */ }
      }
      try {
        const r = backupDoDia(o.banco, agora());
        const destino = lerBackup(o.banco).destino;
        if (r === 'feito' && destino && o.apagarBackup) { const apagar = o.apagarBackup; rodizioDeBackups(destino, diaLocal(agora()), (n) => apagar(destino, n)); }
      } catch { /* o erro fica anotado pelo proprio backupDoDia; o laco segue */ }
      if (o.saudeHermes) { let ok = false; try { ok = await o.saudeHermes(); } catch { /* sem resposta */ } try { gravarServico(o.banco, 'hermes', ok, agora()); } catch { /* idem */ } }
      await esperar(o.intervaloMs ?? 5000);
    }
  })();
  return { parar: () => { parado = true; acordar?.(); }, terminou };
}

// Le so API_SERVER_KEY de um arquivo .env (formato CHAVE=valor). Nada mais do arquivo e devolvido.
export function lerChaveDoEnv(conteudo: string): string | null {
  for (const linha of conteudo.split(/\r?\n/)) {
    const m = /^API_SERVER_KEY=(.*)$/.exec(linha.trim());
    if (m) {
      const v = m[1]!.trim().replace(/^(["'])(.*)\1$/, '$2');
      return v === '' ? null : v;
    }
  }
  return null;
}
