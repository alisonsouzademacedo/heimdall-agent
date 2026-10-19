// Motor de regras de acompanhamento (decididas pelo dono em 2026-10-18; ver docs/plano/fase-1-relatorios.md e D15).
// Funcao pura: recebe as mensagens de UM cliente e devolve o estado. Nenhum modelo de linguagem participa.
import { diaLocal, somarDiasUteis, FUSO_PADRAO, type Dia } from './calendario.ts';

export interface MensagemCliente {
  em: number; // instante UTC em ms
  deMim: boolean; // true = escrita pelo dono
  precisaResposta?: boolean; // so para mensagens do cliente; padrao true ("na duvida, inclui")
}

export type PapelContato = 'cliente' | 'interno' | 'dono_pessoal' | 'fornecedor' | 'pessoal' | 'desconhecido';

export type EstadoCliente =
  | 'sem_resposta_nunca'
  | 'aguardando_usuario'
  | 'follow_up_devido'
  | 'ativo'
  | 'desconsiderado'
  | 'fora_das_regras';

export interface ConfigAcompanhamento {
  intervaloDiasUteis: number; // padrao 2
  maxTentativas: number; // padrao 7
  fuso: string;
  feriados: ReadonlySet<Dia>;
}

export const CONFIG_PADRAO: ConfigAcompanhamento = {
  intervaloDiasUteis: 2,
  maxTentativas: 7,
  fuso: FUSO_PADRAO,
  feriados: new Set()
};

export interface ResultadoAcompanhamento {
  estado: EstadoCliente;
  tentativas: number; // tentativas desde a ultima resposta do cliente
  ultimaRespostaClienteEm: number | null;
  ultimaMensagemMinhaEm: number | null;
  aguardandoUsuarioDesde: number | null;
  proximoFollowUpDia: Dia | null;
}

const PAPEIS_COM_REGRAS: ReadonlySet<PapelContato> = new Set(['cliente', 'desconhecido']);

export function calcularAcompanhamento(
  papel: PapelContato,
  mensagens: readonly MensagemCliente[],
  agora: number,
  cfg: ConfigAcompanhamento = CONFIG_PADRAO
): ResultadoAcompanhamento {
  const vazio: ResultadoAcompanhamento = {
    estado: 'fora_das_regras', tentativas: 0, ultimaRespostaClienteEm: null,
    ultimaMensagemMinhaEm: null, aguardandoUsuarioDesde: null, proximoFollowUpDia: null
  };
  if (!PAPEIS_COM_REGRAS.has(papel)) return vazio;

  const ordenadas = mensagens.filter((m) => m.em <= agora).sort((a, b) => a.em - b.em);
  const doCliente = ordenadas.filter((m) => !m.deMim);
  if (doCliente.length === 0) {
    // Quem nunca respondeu nao gera follow-up.
    const minhas = ordenadas.filter((m) => m.deMim);
    return { ...vazio, estado: 'sem_resposta_nunca', ultimaMensagemMinhaEm: minhas.at(-1)?.em ?? null };
  }

  const ultimaCliente = doCliente.at(-1)!;
  const ultima = ordenadas.at(-1)!;
  const minhasDepois = ordenadas.filter((m) => m.deMim && m.em > ultimaCliente.em);
  const base = {
    ultimaRespostaClienteEm: ultimaCliente.em,
    ultimaMensagemMinhaEm: ordenadas.filter((m) => m.deMim).at(-1)?.em ?? null
  };

  // Cliente escreveu por ultimo e a mensagem pede resposta: o dono esta devendo.
  if (!ultima.deMim && ultima.precisaResposta !== false) {
    return { ...vazio, ...base, estado: 'aguardando_usuario', aguardandoUsuarioDesde: ultima.em };
  }

  // Tentativas: mensagens do dono depois da ultima resposta do cliente; as que caem dentro do mesmo
  // intervalo da tentativa anterior contam como uma so.
  let tentativas = 0;
  let inicioTentativa: Dia | null = null;
  for (const m of minhasDepois) {
    const dia = diaLocal(m.em, cfg.fuso);
    if (inicioTentativa === null || dia >= somarDiasUteis(inicioTentativa, cfg.intervaloDiasUteis, cfg.feriados)) {
      tentativas++;
      inicioTentativa = dia;
    }
  }

  if (tentativas >= cfg.maxTentativas) {
    return { ...vazio, ...base, estado: 'desconsiderado', tentativas };
  }
  if (tentativas === 0) {
    // O cliente respondeu e nao pede nada; nada devido.
    return { ...vazio, ...base, estado: 'ativo', tentativas };
  }

  const ultimoDiaMeu = diaLocal(minhasDepois.at(-1)!.em, cfg.fuso);
  const proximo = somarDiasUteis(ultimoDiaMeu, cfg.intervaloDiasUteis, cfg.feriados);
  const hoje = diaLocal(agora, cfg.fuso);
  return { ...vazio, ...base, estado: hoje >= proximo ? 'follow_up_devido' : 'ativo', tentativas, proximoFollowUpDia: proximo };
}

// Ordem de urgencia usada nos relatorios (menor numero = mais urgente).
export const PRIORIDADE_ESTADO: Record<EstadoCliente, number> = {
  aguardando_usuario: 0,
  follow_up_devido: 1,
  ativo: 2,
  sem_resposta_nunca: 3,
  desconsiderado: 4,
  fora_das_regras: 5
};
