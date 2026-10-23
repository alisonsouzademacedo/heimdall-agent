// Primeiro passo da lacuna "ninguem cria os clientes" (diagnostico de 2026-10-22, secao 4): SOMENTE LEITURA. Mostra, para cada conversa direta, o que
// realmente aconteceu (ida e volta, so eles falaram, so o dono falou, vazia). Nao classifica ninguem como cliente, fornecedor ou pessoal: isso exige
// revisao do dono (D13: cadastro explicito tem prioridade) e, para fornecedor x pessoal, o modelo. Nenhuma escrita no banco.
import type { Banco } from './db.ts';

export type Situacao = 'ida_e_volta' | 'so_eles' | 'so_eu' | 'vazia';

export interface ResumoContatoDm {
  contatoId: number;
  conversaId: number;
  papel: string;
  papelFonte: string;
  clienteId: number | null;
  temNome: boolean;
  deles: number; // mensagens do contato (sem as "ignoradas": reacoes e avisos do sistema)
  meus: number;
  primeiraEm: number | null;
  ultimaEm: number | null;
  situacao: Situacao;
}

export function resumirContatosDm(db: Banco): ResumoContatoDm[] {
  const linhas = db.prepare(
    `SELECT co.id AS contatoId, cv.id AS conversaId, co.papel, co.papel_fonte AS papelFonte, co.cliente_id AS clienteId,
            (co.nome IS NOT NULL AND trim(co.nome) != '') AS temNome,
            COALESCE(SUM(CASE WHEN m.tipo != 'ignorada' AND m.de_mim = 0 THEN 1 ELSE 0 END), 0) AS deles,
            COALESCE(SUM(CASE WHEN m.tipo != 'ignorada' AND m.de_mim = 1 THEN 1 ELSE 0 END), 0) AS meus,
            MIN(CASE WHEN m.tipo != 'ignorada' THEN m.enviada_em END) AS primeiraEm,
            MAX(CASE WHEN m.tipo != 'ignorada' THEN m.enviada_em END) AS ultimaEm
       FROM conversas cv
       JOIN contato_jids j ON j.jid = cv.jid
       JOIN contatos co ON co.id = j.contato_id
       LEFT JOIN mensagens m ON m.conversa_id = cv.id
      WHERE cv.tipo = 'dm'
      GROUP BY cv.id, co.id
      ORDER BY cv.id`
  ).all() as Array<Omit<ResumoContatoDm, 'situacao' | 'temNome'> & { temNome: number }>;
  return linhas.map((l) => ({
    ...l,
    temNome: l.temNome === 1,
    primeiraEm: l.primeiraEm ?? null,
    ultimaEm: l.ultimaEm ?? null,
    situacao: l.deles > 0 && l.meus > 0 ? 'ida_e_volta' : l.deles > 0 ? 'so_eles' : l.meus > 0 ? 'so_eu' : 'vazia'
  }));
}

export function contarPorSituacao(r: ResumoContatoDm[]): Record<Situacao, number> {
  const t: Record<Situacao, number> = { ida_e_volta: 0, so_eles: 0, so_eu: 0, vazia: 0 };
  for (const x of r) t[x.situacao]++;
  return t;
}
