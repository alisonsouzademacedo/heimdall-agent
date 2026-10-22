// Ultimo resultado do teste do CRM (Krayin): fica no banco, NAO guarda token nem corpo de resposta.
// A tela e o cartao de fontes so leem isto; quem testa de verdade e o servidor, ao salvar/testar.
import type { Banco } from '../db.ts';

export type EstadoCrm = 'nao_testado' | 'ok' | 'falhou';

export interface StatusCrm {
  estado: EstadoCrm;
  em: number | null;
  motivo: string | null;
  funis: number;
  completo: boolean;
  faltando: string[];
}

const CHAVE = 'crm.status';
const VAZIO: StatusCrm = { estado: 'nao_testado', em: null, motivo: null, funis: 0, completo: false, faltando: [] };

export function lerStatusCrm(db: Banco): StatusCrm {
  const r = db.prepare('SELECT valor FROM configuracao WHERE chave = ?').get(CHAVE) as { valor: string } | undefined;
  if (!r) return { ...VAZIO, faltando: [] };
  try {
    const p = JSON.parse(r.valor) as Partial<StatusCrm>;
    const estado = p.estado === 'ok' || p.estado === 'falhou' ? p.estado : 'nao_testado';
    return {
      estado,
      em: typeof p.em === 'number' ? p.em : null,
      motivo: typeof p.motivo === 'string' ? p.motivo.slice(0, 200) : null,
      funis: Number.isInteger(p.funis) && (p.funis as number) >= 0 ? (p.funis as number) : 0,
      completo: p.completo === true,
      faltando: Array.isArray(p.faltando) ? p.faltando.filter((x): x is string => typeof x === 'string').slice(0, 5).map((x) => x.slice(0, 80)) : []
    };
  } catch { return { ...VAZIO, faltando: [] }; }
}

export function gravarStatusCrm(db: Banco, s: Omit<StatusCrm, 'em'>, agora: number = Date.now()): void {
  const motivo = s.motivo === null ? null : s.motivo.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 200);
  const valor: StatusCrm = {
    estado: s.estado,
    em: agora,
    motivo: motivo === '' ? null : motivo,
    funis: Number.isInteger(s.funis) && s.funis >= 0 ? s.funis : 0,
    completo: s.completo === true,
    faltando: s.faltando.slice(0, 5).map((x) => x.slice(0, 80))
  };
  db.prepare('INSERT INTO configuracao (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor').run(CHAVE, JSON.stringify(valor));
}
