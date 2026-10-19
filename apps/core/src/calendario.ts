// Calendario de dias uteis e janelas de tempo no fuso do usuario (America/Sao_Paulo).
// Regras: docs/plano/fase-1-relatorios.md. Feriados: ignorados no inicio (conjunto vazio), editaveis depois.

export const FUSO_PADRAO = 'America/Sao_Paulo';

export type Dia = string; // 'AAAA-MM-DD' no fuso do usuario

const fmtDia = new Map<string, Intl.DateTimeFormat>();
function formatador(fuso: string): Intl.DateTimeFormat {
  let f = fmtDia.get(fuso);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' });
    fmtDia.set(fuso, f);
  }
  return f;
}

// Dia civil de um instante (ms desde 1970 em UTC) no fuso.
export function diaLocal(instante: number | Date, fuso: string = FUSO_PADRAO): Dia {
  const t = typeof instante === 'number' ? instante : instante.getTime();
  return formatador(fuso).format(new Date(t));
}

function partes(dia: Dia): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  if (!m) throw new Error(`Dia invalido: ${dia}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

// 0 = domingo ... 6 = sabado
export function diaDaSemana(dia: Dia): number {
  const [a, m, d] = partes(dia);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

export function somarDias(dia: Dia, n: number): Dia {
  const [a, m, d] = partes(dia);
  const t = new Date(Date.UTC(a, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

// Diferenca em dias corridos entre dois dias civis (b - a).
export function diasEntre(a: Dia, b: Dia): number {
  const [aa, am, ad] = partes(a);
  const [ba, bm, bd] = partes(b);
  return Math.round((Date.UTC(ba, bm - 1, bd) - Date.UTC(aa, am - 1, ad)) / 86_400_000);
}

export function ehDiaUtil(dia: Dia, feriados: ReadonlySet<Dia> = new Set()): boolean {
  const s = diaDaSemana(dia);
  return s >= 1 && s <= 5 && !feriados.has(dia);
}

// Soma n dias uteis ESTRITAMENTE depois do dia dado (o proprio dia nao conta). Sexta + 2 = terca.
export function somarDiasUteis(dia: Dia, n: number, feriados: ReadonlySet<Dia> = new Set()): Dia {
  if (!Number.isInteger(n) || n < 0) throw new Error('n deve ser inteiro nao negativo');
  let atual = dia;
  let restantes = n;
  while (restantes > 0) {
    atual = somarDias(atual, 1);
    if (ehDiaUtil(atual, feriados)) restantes--;
  }
  return atual;
}

// Instante UTC (ms) em que o relogio do fuso marca dia hh:mm:ss. Resolve o deslocamento do fuso por aproximacao.
export function instanteLocal(dia: Dia, hh: number, mm: number, ss: number, ms: number, fuso: string = FUSO_PADRAO): number {
  const [a, m, d] = partes(dia);
  const alvoComoUtc = Date.UTC(a, m - 1, d, hh, mm, ss, ms);
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: fuso, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const relogioComoUtc = (t: number): number => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second), 0);
  };
  let t = alvoComoUtc;
  for (let i = 0; i < 3; i++) {
    const erro = relogioComoUtc(t) - (alvoComoUtc - ms);
    if (erro === 0) break;
    t -= erro;
  }
  return t;
}

export interface Janela {
  inicio: number; // inclusivo
  fim: number; // inclusivo (23:59:59.999 do ultimo dia)
  primeiroDia: Dia;
  ultimoDia: Dia;
}

function janelaDeDias(primeiro: Dia, ultimo: Dia, fuso: string): Janela {
  return {
    inicio: instanteLocal(primeiro, 0, 0, 0, 0, fuso),
    fim: instanteLocal(ultimo, 23, 59, 59, 999, fuso),
    primeiroDia: primeiro,
    ultimoDia: ultimo
  };
}

// Diario (ter a sex, 08:00): cobre o DIA ANTERIOR (terca cobre segunda; sexta cobre quinta).
export function janelaDiario(agora: number, fuso: string = FUSO_PADRAO): Janela {
  const ontem = somarDias(diaLocal(agora, fuso), -1);
  return janelaDeDias(ontem, ontem, fuso);
}

// Semanal (segunda, 08:00): segunda anterior 00:00 ate domingo 23:59:59.999.
export function janelaSemanal(agora: number, fuso: string = FUSO_PADRAO): Janela {
  const hoje = diaLocal(agora, fuso);
  const dow = diaDaSemana(hoje); // 0..6
  const diasDesdeSegundaDestaSemana = (dow + 6) % 7;
  const segundaDestaSemana = somarDias(hoje, -diasDesdeSegundaDestaSemana);
  const segundaAnterior = somarDias(segundaDestaSemana, -7);
  return janelaDeDias(segundaAnterior, somarDias(segundaAnterior, 6), fuso);
}

// Qual relatorio roda nesse dia: segunda = semanal; ter a sex = diario; fim de semana = nenhum.
export function relatorioDoDia(agora: number, fuso: string = FUSO_PADRAO): 'semanal' | 'diario' | null {
  const s = diaDaSemana(diaLocal(agora, fuso));
  if (s === 1) return 'semanal';
  if (s >= 2 && s <= 5) return 'diario';
  return null;
}
