// Aprendizado a partir das correcoes do dono (docs/plano/fase-1-aprendizado.md).
// Regras que o CODIGO garante: so o self-chat ensina; regras decididas pelo dono nao mudam sozinhas; tudo tem versao e desfazer.
import type { Banco } from './db.ts';
import { diaLocal, FUSO_PADRAO } from './calendario.ts';

export interface OrigemEnsino { selfChat: boolean }

export class EnsinoNaoPermitido extends Error {
  constructor(motivo: string) { super(`Ensino nao permitido: ${motivo}`); this.name = 'EnsinoNaoPermitido'; }
}

// ---------- tipos 1-6 ----------
export type TipoFeedback = 1 | 2 | 3 | 4 | 5 | 6;

export function registrarFeedback(db: Banco, f: { texto: string; tipo: TipoFeedback; clienteId?: number; itemCodigo?: string }, origem: OrigemEnsino, agora: number): number {
  // Texto de cliente, PDF ou transcricao NUNCA ensina: a origem vem do codigo (self-chat), nao do texto.
  if (origem.selfChat !== true) throw new EnsinoNaoPermitido('so mensagens do proprio dono no self-chat ensinam o Heimdall');
  const texto = f.texto.trim();
  if (!texto) throw new EnsinoNaoPermitido('correcao vazia');
  if (texto.length > 2000) throw new EnsinoNaoPermitido('correcao longa demais');
  const r = db.prepare('INSERT INTO feedback (texto, tipo, cliente_id, item_codigo, criado_em) VALUES (?, ?, ?, ?, ?)').run(texto, f.tipo, f.clienteId ?? null, f.itemCodigo ?? null, agora);
  return Number(r.lastInsertRowid);
}

// ---------- codigos curtos do relatorio: "A1 ja resolvi", "F2 pausa ate 30/10", "P1 nao e potencial: so pediu catalogo" ----------
export type Correcao =
  | { codigo: string; acao: 'resolvido' }
  | { codigo: string; acao: 'silenciar'; ateDia: string }
  | { codigo: string; acao: 'nao_potencial'; motivo: string }
  | { codigo: string; acao: 'prioridade_baixa' };

// Rejeita datas impossiveis (31/02): a data tem de sobreviver a ida e volta pelo calendario.
function diaValido(dia: string): boolean {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(a, m - 1, d));
  return t.getUTCFullYear() === a && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

export function interpretarCorrecoes(texto: string, hoje: string): Correcao[] {
  const saida: Correcao[] = [];
  for (const parte of texto.split(/\s*[·;\n]\s*|\s{2,}/)) {
    const m = /^([AFP])(\d{1,3})\s+(.*)$/i.exec(parte.trim());
    if (!m) continue;
    const codigo = `${m[1]!.toUpperCase()}${m[2]}`;
    const resto = m[3]!.trim().toLowerCase();
    const data = /(?:ate|até)\s+(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/.exec(resto);
    if (/^(ja|já)\s+(resolvi|respondi|resolvido|respondido)/.test(resto)) saida.push({ codigo, acao: 'resolvido' });
    else if (/pausa|silencia|não cobrar|nao cobrar/.test(resto) && data) {
      const ano = data[3] ? Number(data[3]) : Number(hoje.slice(0, 4));
      let dia = `${ano}-${data[2]!.padStart(2, '0')}-${data[1]!.padStart(2, '0')}`;
      if (!data[3] && dia < hoje) dia = `${ano + 1}-${data[2]!.padStart(2, '0')}-${data[1]!.padStart(2, '0')}`;
      if (diaValido(dia)) saida.push({ codigo, acao: 'silenciar', ateDia: dia });
    } else if (/^(nao|não)\s+(e|é)\s+potencial/.test(resto)) saida.push({ codigo, acao: 'nao_potencial', motivo: resto.replace(/^(nao|não)\s+(e|é)\s+potencial:?\s*/, '') });
    else if (/n[ãa]o [ée] prioridade/.test(resto)) saida.push({ codigo, acao: 'prioridade_baixa' });
  }
  return saida;
}

export function registrarItensDoRelatorio(db: Banco, dia: string, itens: { codigo: string; clienteId: number }[]): void {
  const ins = db.prepare('INSERT OR REPLACE INTO relatorio_itens (dia, codigo, cliente_id) VALUES (?, ?, ?)');
  for (const i of itens) ins.run(dia, i.codigo, i.clienteId);
}

export type ResultadoAplicar = { ok: true; descricao: string } | { ok: false; motivo: 'codigo_desconhecido' };

// Aplica a correcao ao cliente do item (ajuste por cliente, tipo 2) e registra o caso para criterios (tipo 3).
export function aplicarCorrecao(db: Banco, dia: string, c: Correcao, origem: OrigemEnsino, agora: number): ResultadoAplicar {
  if (origem.selfChat !== true) throw new EnsinoNaoPermitido('so o self-chat ensina');
  const item = db.prepare('SELECT cliente_id AS id FROM relatorio_itens WHERE dia = ? AND codigo = ?').get(dia, c.codigo) as { id: number } | undefined;
  if (!item) return { ok: false, motivo: 'codigo_desconhecido' };
  const ins = (tipo: string, ate: string | null) => db.prepare('INSERT INTO ajustes_cliente (cliente_id, tipo, ate_dia, criado_em) VALUES (?, ?, ?, ?)').run(item.id, tipo, ate, agora);
  switch (c.acao) {
    case 'resolvido': ins('resolvido', null); registrarFeedback(db, { texto: `${c.codigo} resolvido`, tipo: 2, clienteId: item.id, itemCodigo: c.codigo }, origem, agora); return { ok: true, descricao: 'fora de "aguardando" ate nova mensagem' };
    case 'silenciar': ins('silenciar', c.ateDia); registrarFeedback(db, { texto: `${c.codigo} pausa ate ${c.ateDia}`, tipo: 2, clienteId: item.id, itemCodigo: c.codigo }, origem, agora); return { ok: true, descricao: `pausado ate ${c.ateDia}` };
    case 'prioridade_baixa': ins('prioridade_baixa', null); registrarFeedback(db, { texto: `${c.codigo} sem prioridade`, tipo: 2, clienteId: item.id, itemCodigo: c.codigo }, origem, agora); return { ok: true, descricao: 'prioridade baixa' };
    case 'nao_potencial':
      registrarFeedback(db, { texto: `${c.codigo} nao e potencial: ${c.motivo}`, tipo: 3, clienteId: item.id, itemCodigo: c.codigo }, origem, agora);
      registrarCasoCriterio(db, 'potencial:nao_potencial', item.id, agora);
      return { ok: true, descricao: 'caso registrado para o criterio de potencial' };
  }
}

// ---------- criterios: casos parecidos viram PROPOSTA; so o dono aprova ----------
export const MIN_CASOS = 3; // palpite inicial: 3 casos parecidos em 30 dias (ver "nao verificado" em fase-1-aprendizado.md)
export const JANELA_CASOS_DIAS = 30;
// Decididas pelo dono: nunca mudam por proposta do modelo, so por ordem explicita dele.
export const REGRAS_PROTEGIDAS = ['maxTentativas', 'intervaloDiasUteis', 'aguardandoNoTopo'] as const;

export function registrarCasoCriterio(db: Banco, chave: string, clienteId: number | null, agora: number): void {
  db.prepare('INSERT INTO casos_criterio (chave, cliente_id, em) VALUES (?, ?, ?)').run(chave, clienteId, agora);
}

export interface Proposta { id: number; chave: string; descricao: string }

export function proporCriterio(db: Banco, chave: string, descricao: string, agora: number): Proposta | null {
  const desde = agora - JANELA_CASOS_DIAS * 86_400_000;
  // Depois de uma recusa, so conta casos NOVOS (mesma evidencia nao se repete).
  const ultimaRecusa = db.prepare("SELECT MAX(respondida_em) AS t FROM propostas_criterio WHERE chave = ? AND estado = 'recusada'").get(chave) as { t: number | null };
  const aberta = db.prepare("SELECT 1 AS x FROM propostas_criterio WHERE chave = ? AND estado = 'proposta'").get(chave);
  if (aberta) return null;
  const inicio = Math.max(desde, (ultimaRecusa.t ?? 0) + 1);
  const casos = (db.prepare('SELECT COUNT(*) AS n FROM casos_criterio WHERE chave = ? AND em >= ? AND em <= ?').get(chave, inicio, agora) as { n: number }).n;
  if (casos < MIN_CASOS) return null;
  const id = Number(db.prepare('INSERT INTO propostas_criterio (chave, descricao, criada_em) VALUES (?, ?, ?)').run(chave, descricao, agora).lastInsertRowid);
  return { id, chave, descricao };
}

export function responderProposta(db: Banco, id: number, resposta: 'aprovar' | 'recusar', conteudoNovo: string, origem: OrigemEnsino, agora: number): void {
  if (origem.selfChat !== true) throw new EnsinoNaoPermitido('so o dono aprova ou recusa');
  const p = db.prepare('SELECT chave, estado FROM propostas_criterio WHERE id = ?').get(id) as { chave: string; estado: string } | undefined;
  if (!p || p.estado !== 'proposta') throw new EnsinoNaoPermitido('proposta inexistente ou ja respondida');
  if (resposta === 'recusar') {
    db.prepare("UPDATE propostas_criterio SET estado = 'recusada', respondida_em = ? WHERE id = ?").run(agora, id);
    return;
  }
  for (const k of REGRAS_PROTEGIDAS) {
    if (p.chave.includes(k) || conteudoNovo.includes(k)) throw new EnsinoNaoPermitido(`a regra "${k}" so muda por ordem explicita do dono`);
  }
  const v = (db.prepare('SELECT COALESCE(MAX(versao), 0) AS v FROM criterios_versoes').get() as { v: number }).v + 1; // numeros nunca se repetem, mesmo apos desfazer
  db.exec('BEGIN');
  try {
    db.prepare("UPDATE propostas_criterio SET estado = 'aprovada', respondida_em = ? WHERE id = ?").run(agora, id);
    db.prepare('INSERT INTO criterios_versoes (versao, conteudo, proposta_id, aprovada_em) VALUES (?, ?, ?, ?)').run(v, conteudoNovo, id, agora);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

export function criterioAtual(db: Banco): { versao: number; conteudo: string } | null {
  const r = db.prepare('SELECT versao, conteudo FROM criterios_versoes WHERE ativa = 1 ORDER BY versao DESC LIMIT 1').get() as { versao: number; conteudo: string } | undefined;
  return r ? { versao: r.versao, conteudo: r.conteudo } : null;
}

// "Desfaz a ultima": marca a proposta como desfeita e desativa a versao mais recente (a anterior volta a valer).
// Versoes nunca sao apagadas: ficam como historico.
export function desfazerUltimoCriterio(db: Banco, origem: OrigemEnsino): number | null {
  if (origem.selfChat !== true) throw new EnsinoNaoPermitido('so o dono desfaz');
  const ult = db.prepare('SELECT versao, proposta_id AS pid FROM criterios_versoes WHERE ativa = 1 ORDER BY versao DESC LIMIT 1').get() as { versao: number; pid: number | null } | undefined;
  if (!ult) return null;
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE propostas_criterio SET estado = ? WHERE id = ?').run('desfeita', ult.pid);
    db.prepare('UPDATE criterios_versoes SET ativa = 0 WHERE versao = ?').run(ult.versao);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return criterioAtual(db)?.versao ?? 0;
}

export function hojeLocal(agora: number, fuso: string = FUSO_PADRAO): string { return diaLocal(agora, fuso); }
