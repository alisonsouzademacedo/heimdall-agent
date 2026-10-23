// Lacuna "ninguem cria os clientes" (diagnostico de 2026-10-22, secao 4). resumirContatosDm mostra, para cada conversa direta, o que realmente aconteceu
// (ida e volta, so eles falaram, so o dono falou, vazia) e NAO escreve nada. cadastrarClientesQueResponderam aplica a regra que o dono decidiu em
// 2026-10-23: todo contato que RESPONDEU (ida e volta) e ainda nao tem papel vira cliente. O nome nasce provisorio (nome do contato ou "Contato final
// NNNN"): o dono cita nome e empresa DENTRO das conversas, entao a extracao pelo modelo melhora o nome depois (clientes.nome_origem).
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

/** Quantos contatos seriam cadastrados agora (so conta, nao escreve). */
export function contarCandidatosACliente(db: Banco): number {
  return resumirContatosDm(db).filter(ehCandidato).length;
}
const ehCandidato = (r: ResumoContatoDm): boolean => r.situacao === 'ida_e_volta' && r.papel === 'desconhecido' && r.clienteId === null;

/**
 * Cadastra como cliente todo contato que respondeu (ida e volta) e ainda esta como "desconhecido". Quem ja e interno, fornecedor, pessoal ou ja cliente
 * nao muda. papel_fonte fica "inferido" (da para desfazer em lote). Idempotente: rodar de novo so pega quem passou a responder depois.
 */
export function cadastrarClientesQueResponderam(db: Banco, agora: number = Date.now()): { criados: number } {
  const candidatos = resumirContatosDm(db).filter(ehCandidato);
  let criados = 0;
  db.exec('SAVEPOINT cadastrar_clientes');
  try {
    for (const c of candidatos) {
      const nome = nomeProvisorio(db, c);
      const cliente = Number(db.prepare("INSERT INTO clientes (nome, nome_origem, criado_em) VALUES (?, 'provisorio', ?)").run(nome, agora).lastInsertRowid);
      db.prepare("UPDATE contatos SET cliente_id = ?, papel = 'cliente', papel_fonte = 'inferido' WHERE id = ? AND papel = 'desconhecido' AND cliente_id IS NULL").run(cliente, c.contatoId);
      criados++;
    }
    db.exec('RELEASE cadastrar_clientes');
  } catch (e) {
    db.exec('ROLLBACK TO cadastrar_clientes'); db.exec('RELEASE cadastrar_clientes');
    throw e;
  }
  return { criados };
}

function nomeProvisorio(db: Banco, c: ResumoContatoDm): string {
  const n = db.prepare('SELECT nome FROM contatos WHERE id = ?').get(c.contatoId) as { nome: string | null };
  if (n.nome && n.nome.trim() !== '') return n.nome.trim().slice(0, 120);
  const j = db.prepare("SELECT jid FROM contato_jids WHERE contato_id = ? ORDER BY CASE tipo WHEN 'pn' THEN 0 ELSE 1 END LIMIT 1").get(c.contatoId) as { jid: string } | undefined;
  const digitos = (j?.jid ?? '').split('@')[0]!.replace(/\D/g, '');
  return digitos.length >= 4 ? `Contato final ${digitos.slice(-4)}` : `Contato ${c.contatoId}`;
}
