// O que a tela do passo "Processar" mostra: quanto falta, quanto ja foi, quanto custou (tokens) e quanto ainda deve custar. Tudo calculado aqui,
// por codigo, a partir do banco (fila, consumo, configuracao); a tela so desenha. Nenhuma consulta ao modelo acontece neste arquivo.
import type { Banco } from './db.ts';
import { contarDescartes, diasDeExtracaoPendentes, extracaoLiberada } from './extracao.ts';
import { mediaDaTarefa, resumoDeConsumo, tetoDiario, type SomaPorTarefa } from './consumo.ts';
import { contarCandidatosACliente } from './candidatos-cliente.ts';
import { lerModelo, TAREFAS, type ModeloDaTarefa, type Tarefa } from './modelos.ts';

const CHAVE_RODADA = 'processamento.rodada';
/** Menos que isto seria chute: a estimativa so aparece depois de 3 consultas medidas. */
export const AMOSTRAS_MINIMAS = 3;

export interface Rodada { inicio: number; total: number; concluidas: number; falhas: number; percentual: number }
export interface EstadoProcessamento {
  liberada: boolean;
  clientes: number;
  /** Contatos que responderam e ainda nao sao clientes (o botao da tela cadastra todos). */
  candidatos: number;
  /** Dias de conversa em que o modelo respondeu com itens e o codigo recusou TODOS (formato inesperado). */
  descartes: number;
  diasNovos: number;
  diasRefeitos: number;
  naFila: number;
  consultasPrevistas: number;
  rodada: Rodada | null;
  consumo: { hoje: SomaPorTarefa; semana: SomaPorTarefa; total: SomaPorTarefa };
  media: { amostras: number; entrada: number; saida: number; ms: number };
  estimativa: { consultasRestantes: number; tokens: number; minutos: number; diasDeTeto: number } | null;
  teto: { diario: number; usadoHoje: number; atingido: boolean };
  modelos: Record<Tarefa, ModeloDaTarefa>;
}

function lerRodadaBase(db: Banco): { inicio: number; total: number } | null {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(CHAVE_RODADA) as { valor: string } | undefined;
  if (!r) return null;
  try {
    const v = JSON.parse(r.valor) as { inicio?: unknown; total?: unknown };
    return typeof v.inicio === 'number' && typeof v.total === 'number' ? { inicio: v.inicio, total: v.total } : null;
  } catch { return null; }
}

function contarDesde(db: Banco, estado: 'ok' | 'abandonada', inicio: number): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair' AND estado = ? AND atualizado_em >= ?").get(estado, inicio) as { n: number }).n;
}

function montarRodada(db: Banco): Rodada | null {
  const b = lerRodadaBase(db);
  if (!b) return null;
  const concluidas = contarDesde(db, 'ok', b.inicio), falhas = contarDesde(db, 'abandonada', b.inicio);
  const percentual = b.total > 0 ? Math.min(100, Math.floor(((concluidas + falhas) * 100) / b.total)) : 0;
  return { inicio: b.inicio, total: b.total, concluidas, falhas, percentual };
}

/** Chamada quando o dono libera o processamento: retoma a rodada que nao terminou ou abre outra com o tamanho do trabalho de agora. */
export function iniciarRodada(db: Banco, agora: number): void {
  const atual = montarRodada(db);
  if (atual && atual.concluidas + atual.falhas < atual.total) return;
  // "Dias de conversa" ainda nao extraidos (cliente x dia). Os que ja estao na fila continuam sendo pendentes: NAO somar a fila de novo (dobrava a conta).
  const c = diasDeExtracaoPendentes(db, agora);
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(CHAVE_RODADA, JSON.stringify({ inicio: agora, total: c.novos + c.refeitos }));
}

export function estadoDoProcessamento(db: Banco, agora: number): EstadoProcessamento {
  const c = diasDeExtracaoPendentes(db, agora);
  const naFila = (db.prepare("SELECT COUNT(*) AS n FROM fila WHERE tipo = 'extrair' AND estado IN ('pendente','em_andamento')").get() as { n: number }).n;
  const consumo = resumoDeConsumo(db, agora);
  const media = mediaDaTarefa(db, 'extracao');
  const restantes = c.novos + c.refeitos; // a fila e um subconjunto destes: somar dobrava (1.026 em vez de 513 no 1o processamento)
  const porConsulta = media.entrada + media.saida;
  const diario = tetoDiario(db);
  const usado = consumo.hoje.extracao.entrada + consumo.hoje.extracao.saida;
  const tokens = restantes * porConsulta;
  return {
    liberada: extracaoLiberada(db),
    clientes: (db.prepare('SELECT COUNT(*) AS n FROM clientes').get() as { n: number }).n,
    candidatos: contarCandidatosACliente(db),
    descartes: contarDescartes(db),
    diasNovos: c.novos,
    diasRefeitos: c.refeitos,
    naFila,
    consultasPrevistas: restantes,
    rodada: montarRodada(db),
    consumo,
    media,
    estimativa: media.amostras >= AMOSTRAS_MINIMAS && restantes > 0
      ? { consultasRestantes: restantes, tokens, minutos: Math.round((restantes * media.ms) / 60000), diasDeTeto: Math.max(1, Math.ceil(tokens / diario)) }
      : null,
    teto: { diario, usadoHoje: usado, atingido: usado >= diario },
    modelos: Object.fromEntries(TAREFAS.map((t) => [t, lerModelo(db, t)])) as Record<Tarefa, ModeloDaTarefa>
  };
}
