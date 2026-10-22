// Fluxo do CRM (Krayin): o Heimdall SO PROPOE movimentos; o dono aprova no self-chat.
// Nada aqui fala com a rede: as chamadas ao Krayin entram pela porta ApiCrm, para os testes usarem uma API falsa.
import type { Banco } from '../db.ts';
import { calcularAcompanhamento } from '../acompanhamento.ts';
import { mensagensParaAcompanhamento } from '../ingestao.ts';
import { diaLocal, FUSO_PADRAO } from '../calendario.ts';

export interface EtapaCrm {
  id: number;
  nome: string;
  codigo: string | null;
}

export interface EtapasCrm {
  contato: EtapaCrm;
  primeira: EtapaCrm;
  segunda: EtapaCrm;
  ganho: EtapaCrm;
  perdido: EtapaCrm;
}

export type TipoPropostaCrm = 'criar' | 'mover' | 'ganho' | 'perdido';

export interface PropostaCrm {
  numero: number;
  clienteId: number;
  cliente: string;
  tipo: TipoPropostaCrm;
  leadId: number | null;
  etapaAtual: number | null;
  etapaDestino: number;
  etapaDestinoNome: string;
  motivo: string;
}

export interface PropostaSalva extends PropostaCrm {
  id: number;
  dia: string;
  estado: 'proposta' | 'aplicada' | 'recusada' | 'expirada' | 'falhou';
  erro: string | null;
}

export interface ApiCrm {
  criarLead(entrada: { titulo: string; descricao: string; etapaId: number }): Promise<{ ok: boolean; id?: number; motivo?: string }>;
  moverEtapa(leadId: number, etapaId: number): Promise<{ ok: boolean; motivo?: string }>;
}

export interface ResultadoAplicacaoCrm {
  numero: number;
  cliente: string;
  tipo: TipoPropostaCrm;
  ok: boolean;
  erro?: string;
}

export interface RespostaCrm {
  aprovados: number[];
  recusados: number[];
  ignorados: number[];
  resultados: ResultadoAplicacaoCrm[];
  semPropostas: boolean;
}

export const MAX_PROPOSTAS = 5;
const DESCRICAO_LEAD = 'Criado pelo Heimdall com aprovação do dono. Cliente respondeu no WhatsApp.';

const dm = (iso: string): string => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const numero = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

interface ClienteLinha { id: number; nome: string }
interface Vinculo { leadId: number; etapaId: number }
interface Reuniao { dh: string; estado: string }

function vinculoDe(db: Banco, clienteId: number): Vinculo | null {
  const r = db.prepare('SELECT lead_id AS leadId, etapa_id AS etapaId FROM crm_leads WHERE cliente_id = ?').get(clienteId) as Vinculo | undefined;
  return r ?? null;
}

function reunioesDe(db: Banco, clienteId: number): Reuniao[] {
  return db.prepare(
    "SELECT data_hora AS dh, estado FROM compromissos WHERE cliente_id = ? AND tipo = 'reuniao' AND data_hora IS NOT NULL AND estado != 'cancelado' ORDER BY data_hora, id"
  ).all(clienteId) as unknown as Reuniao[];
}

// Calcula o que MUDOU desde a ultima etapa conhecida. Nao chama a API e nao grava nada.
export function proporMovimentos(db: Banco, etapas: EtapasCrm, agora: number, dia: string = diaLocal(agora, FUSO_PADRAO)): PropostaCrm[] {
  const clientes = db.prepare(
    `SELECT DISTINCT cl.id, cl.nome FROM clientes cl JOIN contatos k ON k.cliente_id = cl.id WHERE k.papel IN ('cliente','desconhecido') ORDER BY cl.id`
  ).all() as unknown as ClienteLinha[];

  const candidatas: (PropostaCrm & { prioridade: number })[] = [];
  for (const c of clientes) {
    const msgs = mensagensParaAcompanhamento(db, c.id);
    const r = calcularAcompanhamento('cliente', msgs, agora);
    const temResposta = msgs.some((m) => !m.deMim && m.em <= agora);
    if (!temResposta) continue; // quem nunca respondeu nao vira lead no CRM

    // Uma proposta do MESMO dia nao se repete; propostas de dias anteriores sao expiradas quando uma nova e salva.
    if (db.prepare("SELECT 1 AS x FROM crm_propostas WHERE cliente_id = ? AND dia = ? AND estado IN ('proposta','falhou')").get(c.id, dia)) continue;

    const v = vinculoDe(db, c.id);
    const ultima = r.ultimaRespostaClienteEm !== null ? diaLocal(r.ultimaRespostaClienteEm, FUSO_PADRAO) : dia;

    if (v === null) {
      candidatas.push({
        numero: 0, clienteId: c.id, cliente: c.nome, tipo: 'criar', leadId: null, etapaAtual: null,
        etapaDestino: etapas.contato.id, etapaDestinoNome: etapas.contato.nome,
        motivo: `cliente respondeu em ${dm(ultima)} e ainda não tem lead no CRM`, prioridade: 4
      });
      continue;
    }

    if (r.estado === 'desconsiderado' && v.etapaId !== etapas.perdido.id) {
      candidatas.push({
        numero: 0, clienteId: c.id, cliente: c.nome, tipo: 'perdido', leadId: v.leadId, etapaAtual: v.etapaId,
        etapaDestino: etapas.perdido.id, etapaDestinoNome: etapas.perdido.nome,
        motivo: `7 tentativas de contato sem resposta desde ${dm(ultima)}`, prioridade: 0
      });
      continue;
    }

    const reunioes = reunioesDe(db, c.id);
    if (v.etapaId === etapas.contato.id) {
      const marcada = reunioes[0];
      if (marcada) {
        candidatas.push({
          numero: 0, clienteId: c.id, cliente: c.nome, tipo: 'mover', leadId: v.leadId, etapaAtual: v.etapaId,
          etapaDestino: etapas.primeira.id, etapaDestinoNome: etapas.primeira.nome,
          motivo: `reunião marcada para ${dm(marcada.dh)}`, prioridade: 2
        });
      }
    } else if (v.etapaId === etapas.primeira.id) {
      // Primeira reuniao: ja aconteceu (data passou ou foi marcada como realizada) E existe uma segunda marcada.
      const primeira = reunioes.find((x) => ['realizado', 'transcricao_recebida', 'cumprido'].includes(x.estado) || x.dh.slice(0, 10) < dia);
      const segunda = primeira ? reunioes.find((x) => x.dh > primeira.dh && x.dh.slice(0, 10) >= dia) : undefined;
      if (primeira && segunda) {
        candidatas.push({
          numero: 0, clienteId: c.id, cliente: c.nome, tipo: 'mover', leadId: v.leadId, etapaAtual: v.etapaId,
          etapaDestino: etapas.segunda.id, etapaDestinoNome: etapas.segunda.nome,
          motivo: `primeira reunião em ${dm(primeira.dh)} e segunda marcada para ${dm(segunda.dh)}`, prioridade: 1
        });
      }
    }
  }

  candidatas.sort((a, b) => a.prioridade - b.prioridade || a.clienteId - b.clienteId);
  return candidatas.slice(0, MAX_PROPOSTAS).map((p, i) => ({ ...p, numero: i + 1 }));
}

interface LinhaProposta {
  id: number;
  dia: string;
  numero: number;
  cliente_id: number;
  cliente: string;
  lead_id: number | null;
  etapa_atual: number | null;
  etapa_destino: number;
  etapa_destino_nome: string;
  tipo: TipoPropostaCrm;
  motivo: string;
  estado: PropostaSalva['estado'];
  erro: string | null;
}

function deLinha(l: LinhaProposta): PropostaSalva {
  return {
    id: l.id, dia: l.dia, numero: l.numero, clienteId: l.cliente_id, cliente: l.cliente,
    tipo: l.tipo, leadId: l.lead_id, etapaAtual: l.etapa_atual, etapaDestino: l.etapa_destino,
    etapaDestinoNome: l.etapa_destino_nome, motivo: l.motivo, estado: l.estado, erro: l.erro
  };
}

function doDia(db: Banco, dia: string): PropostaSalva[] {
  const linhas = db.prepare(
    `SELECT p.id, p.dia, p.numero, p.cliente_id, cl.nome AS cliente, p.lead_id, p.etapa_atual,
            p.etapa_destino, p.etapa_destino_nome, p.tipo, p.motivo, p.estado, p.erro
       FROM crm_propostas p JOIN clientes cl ON cl.id = p.cliente_id
      WHERE p.dia = ? ORDER BY p.numero`
  ).all(dia) as unknown as LinhaProposta[];
  return linhas.map(deLinha);
}

// Grava as propostas do dia. Se o dia ja tem propostas, devolve as que existem (idempotente).
// Mesmo sem propostas novas, expira as antigas: o relatorio novo sempre invalida a leva anterior.
export function salvarPropostas(db: Banco, dia: string, propostas: readonly PropostaCrm[], agora: number): PropostaSalva[] {
  const existentes = doDia(db, dia);
  db.exec('BEGIN IMMEDIATE');
  try {
    // Propostas de dias anteriores que o dono nao respondeu perdem a validade: o relatorio novo traz o estado atual.
    db.prepare("UPDATE crm_propostas SET estado = 'expirada', respondida_em = ? WHERE estado IN ('proposta','falhou') AND dia < ?").run(agora, dia);
    // Se o dia ja foi processado (relatorio gerado de novo), nao cria outra leva: devolve so o que ainda esta aberto.
    if (existentes.length > 0) {
      db.exec('COMMIT');
      return existentes.filter((p) => p.estado === 'proposta' || p.estado === 'falhou');
    }
    if (propostas.length > 0) {
      const ins = db.prepare(
        `INSERT INTO crm_propostas (dia, numero, cliente_id, lead_id, etapa_atual, etapa_destino, etapa_destino_nome,
                                    tipo, motivo, estado, criada_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposta', ?)`
      );
      for (const p of propostas) {
        ins.run(dia, p.numero, p.clienteId, p.leadId, p.etapaAtual, p.etapaDestino, p.etapaDestinoNome, p.tipo, p.motivo, agora);
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return doDia(db, dia);
}

// So as propostas abertas do dia mais recente; e delas que o dono fala no self-chat.
export function lerPropostasAbertas(db: Banco): PropostaSalva[] {
  const dia = (db.prepare("SELECT MAX(dia) AS d FROM crm_propostas WHERE estado IN ('proposta','falhou')").get() as { d: string | null }).d;
  if (!dia) return [];
  return doDia(db, dia).filter((p) => p.estado === 'proposta' || p.estado === 'falhou');
}

function dedupe(xs: number[]): number[] {
  return [...new Set(xs)];
}

function numerosDe(texto: string): number[] {
  return dedupe([...texto.matchAll(/\b(\d{1,3})\b/g)].map((m) => Number(m[1])));
}

// Respostas aceitas: "ok 1 e 3", "não, o 2 fica", "C1 ok, C2 não", "aprovar 2, 4".
// Devolve null quando a mensagem nao e uma aprovacao/recusa do CRM (ela segue para o Hermes).
export function interpretarRespostaCrm(texto: string): { aprovados: number[]; recusados: number[] } | null {
  if (typeof texto !== 'string') return null;
  const t = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

  const porCodigo = [...t.matchAll(/\bc(\d{1,3})\s*,?\s*(ok|aprovar|aprovado|sim|nao|recusar|recusado)\b/g)];
  if (porCodigo.length > 0) {
    const aprovados: number[] = [];
    const recusados: number[] = [];
    for (const m of porCodigo) {
      const n = Number(m[1]);
      if (['ok', 'aprovar', 'aprovado', 'sim'].includes(m[2]!)) aprovados.push(n);
      else recusados.push(n);
    }
    return { aprovados: dedupe(aprovados), recusados: dedupe(recusados) };
  }

  const m = /^(ok|aprovar|aprovado|sim|nao|recusar|recusado)\b[\s,.:;-]*(.*)$/.exec(t);
  if (!m) return null;
  const ns = numerosDe(m[2]!);
  if (ns.length === 0) return null;
  return ['ok', 'aprovar', 'aprovado', 'sim'].includes(m[1]!)
    ? { aprovados: ns, recusados: [] }
    : { aprovados: [], recusados: ns };
}

// Aplica a resposta do dono. So o self-chat pode chamar. A API e chamada UMA vez por proposta; falha deixa a proposta
// aberta para ele tentar de novo, e criar lead nunca e repetido se o vinculo ja existe.
export async function aplicarRespostaCrm(
  db: Banco, texto: string, api: ApiCrm, origem: { selfChat: boolean }, agora: number
): Promise<RespostaCrm | null> {
  if (origem.selfChat !== true) throw new Error('Aprovacao do CRM so pode vir do self-chat');
  const pedido = interpretarRespostaCrm(texto);
  if (!pedido) return null;
  const abertas = lerPropostasAbertas(db);
  const pedidos = dedupe([...pedido.aprovados, ...pedido.recusados]);
  if (abertas.length === 0) {
    return { ...pedido, ignorados: pedidos, resultados: [], semPropostas: true };
  }

  const porNumero = new Map(abertas.map((p) => [p.numero, p]));
  const ignorados: number[] = [];
  const resultados: ResultadoAplicacaoCrm[] = [];
  const aprovados: number[] = [];
  const recusados: number[] = [];

  for (const n of pedido.recusados) {
    const p = porNumero.get(n);
    if (!p) { ignorados.push(n); continue; }
    db.prepare("UPDATE crm_propostas SET estado = 'recusada', respondida_em = ?, erro = NULL WHERE id = ?").run(agora, p.id);
    recusados.push(n);
    resultados.push({ numero: n, cliente: p.cliente, tipo: p.tipo, ok: true });
  }

  for (const n of pedido.aprovados) {
    const p = porNumero.get(n);
    if (!p) { ignorados.push(n); continue; }
    aprovados.push(n);
    const v = vinculoDe(db, p.clienteId);
    const leadId = v?.leadId ?? p.leadId;

    if (p.tipo !== 'criar' && leadId === null) {
      const erro = 'sem vínculo com o lead no CRM';
      db.prepare("UPDATE crm_propostas SET estado = 'falhou', respondida_em = ?, erro = ? WHERE id = ?").run(agora, erro, p.id);
      resultados.push({ numero: n, cliente: p.cliente, tipo: p.tipo, ok: false, erro });
      continue;
    }

    // Se o vinculo ja existe, "criar" vira movimento: nunca cria um segundo lead para o mesmo cliente.
    const r = p.tipo === 'criar' && v === null
      ? await api.criarLead({ titulo: p.cliente, descricao: DESCRICAO_LEAD, etapaId: p.etapaDestino })
      : await api.moverEtapa(leadId!, p.etapaDestino);

    if (!r.ok) {
      const erro = r.motivo ?? 'falha ao falar com o CRM';
      db.prepare("UPDATE crm_propostas SET estado = 'falhou', respondida_em = ?, erro = ? WHERE id = ?").run(agora, erro, p.id);
      resultados.push({ numero: n, cliente: p.cliente, tipo: p.tipo, ok: false, erro });
      continue;
    }

    const idFinal = p.tipo === 'criar' && v === null ? numero((r as { id?: number }).id) : leadId;
    if (idFinal === null) {
      const erro = 'o CRM respondeu sem o id do lead';
      db.prepare("UPDATE crm_propostas SET estado = 'falhou', respondida_em = ?, erro = ? WHERE id = ?").run(agora, erro, p.id);
      resultados.push({ numero: n, cliente: p.cliente, tipo: p.tipo, ok: false, erro });
      continue;
    }

    db.prepare(
      `INSERT INTO crm_leads (cliente_id, lead_id, etapa_id, atualizado_em) VALUES (?, ?, ?, ?)
       ON CONFLICT(cliente_id) DO UPDATE SET lead_id = excluded.lead_id, etapa_id = excluded.etapa_id, atualizado_em = excluded.atualizado_em`
    ).run(p.clienteId, idFinal, p.etapaDestino, agora);
    db.prepare("UPDATE crm_propostas SET estado = 'aplicada', respondida_em = ?, erro = NULL WHERE id = ?").run(agora, p.id);
    resultados.push({ numero: n, cliente: p.cliente, tipo: p.tipo, ok: true });
  }

  return { aprovados, recusados, ignorados: dedupe(ignorados), resultados, semPropostas: false };
}
