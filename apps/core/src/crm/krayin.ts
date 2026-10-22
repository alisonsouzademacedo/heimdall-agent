// Cliente fino da API REST do Krayin (docs/krayin/rest-api). Sem SDK: fetch do proprio Node, com tempo limite,
// sem seguir redirecionamento (o token nao pode vazar para outro endereco) e sem gravar o token em lugar nenhum.
// As rotas e os formatos vem de docs/krayin/rest-api/routes e dos controladores copiados; o que nao foi testado
// contra um Krayin real esta marcado em docs/plano/fase-2-crm.md (validar na VPS).
import type { ConfigCrm } from './config.ts';

export type { ConfigCrm } from './config.ts';

export interface EtapaKrayin { id: number; nome: string; codigo: string | null }
export interface FunilKrayin { id: number; nome: string; padrao: boolean; etapas: EtapaKrayin[] }

export interface ListaFunis { ok: boolean; funis: FunilKrayin[]; motivo?: string }
export interface TesteConexao { ok: boolean; funis: number; motivo?: string }
export interface ResultadoLead { ok: boolean; id?: number; motivo?: string }

export interface FunilVerificado {
  funil: FunilKrayin | null;
  etapas: { contato: EtapaKrayin | null; primeira: EtapaKrayin | null; segunda: EtapaKrayin | null; ganho: EtapaKrayin | null; perdido: EtapaKrayin | null };
  faltando: string[];
  completo: boolean;
}

const TEMPO_MS = 8000;

export function normalizarNome(s: string): string {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Nomes do funil combinado com o dono (docs/plano/fase-2-crm.md). Ganho/perda valem pelo code, nao pelo nome.
const ESPERADAS = [
  { chave: 'contato', nome: 'Contato iniciado', codigo: null },
  { chave: 'primeira', nome: '1ª Reunião Agendada', codigo: null },
  { chave: 'segunda', nome: '2ª Reunião Agendada', codigo: null },
  { chave: 'ganho', nome: 'Fechamento / Ganho', codigo: 'won' },
  { chave: 'perdido', nome: 'Perdido / Arquivado', codigo: 'lost' }
] as const;

type ChaveEtapa = (typeof ESPERADAS)[number]['chave'];

function listaDe(dados: unknown): unknown[] {
  if (Array.isArray(dados)) return dados;
  if (dados && typeof dados === 'object') {
    const o = dados as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    const d = o.data;
    if (d && typeof d === 'object') {
      const dd = d as Record<string, unknown>;
      if (Array.isArray(dd.data)) return dd.data;
      if (Array.isArray(dd.items)) return dd.items;
    }
    if (Array.isArray(o.items)) return o.items;
  }
  return [];
}

function texto(o: Record<string, unknown>, chave: string): string {
  const v = o[chave];
  return typeof v === 'string' ? v : '';
}

function etapasDe(bruto: unknown): EtapaKrayin[] {
  let lista: unknown[] = [];
  if (Array.isArray(bruto)) lista = bruto;
  else if (bruto && typeof bruto === 'object' && Array.isArray((bruto as Record<string, unknown>).data)) lista = (bruto as Record<string, unknown>).data as unknown[];
  const saida: EtapaKrayin[] = [];
  for (const e of lista) {
    if (!e || typeof e !== 'object') continue;
    const o = e as Record<string, unknown>;
    const id = Number(o.id);
    if (!Number.isInteger(id) || id <= 0) continue;
    const codigo = texto(o, 'code');
    saida.push({ id, nome: texto(o, 'name'), codigo: codigo === '' ? null : codigo });
  }
  return saida;
}

function funisDe(dados: unknown): FunilKrayin[] {
  const saida: FunilKrayin[] = [];
  for (const f of listaDe(dados)) {
    if (!f || typeof f !== 'object') continue;
    const o = f as Record<string, unknown>;
    const id = Number(o.id);
    if (!Number.isInteger(id) || id <= 0) continue;
    saida.push({ id, nome: texto(o, 'name'), padrao: o.is_default === true || o.is_default === 1, etapas: etapasDe(o.stages) });
  }
  return saida;
}

function mensagemCurta(dados: unknown): string | null {
  if (!dados || typeof dados !== 'object') return null;
  const o = dados as Record<string, unknown>;
  for (const chave of ['message', 'error']) {
    const v = o[chave];
    if (typeof v === 'string' && v.trim() !== '') return v.replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  return null;
}

interface Resposta { ok: boolean; status: number; dados: unknown; falha?: string }

async function pedir(config: ConfigCrm, metodo: string, caminho: string, corpo: unknown, buscar: typeof fetch): Promise<Resposta> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TEMPO_MS);
  try {
    const r = await buscar(`${config.url}/api/v1${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
        ...(corpo === undefined ? {} : { 'Content-Type': 'application/json' })
      },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: ctrl.signal,
      redirect: 'error'
    });
    const texto = await r.text();
    let dados: unknown = null;
    try { dados = texto === '' ? null : JSON.parse(texto); } catch { dados = null; }
    return { ok: r.ok, status: r.status, dados };
  } catch (e) {
    const nome = e instanceof Error ? e.name : '';
    return { ok: false, status: 0, dados: null, falha: nome === 'AbortError' ? 'tempo esgotado' : 'sem conexao' };
  } finally { clearTimeout(timer); }
}

function motivo(r: Resposta): string {
  if (r.status === 0) return r.falha ?? 'sem conexao';
  const m = mensagemCurta(r.dados);
  return `HTTP ${r.status}${m ? `: ${m}` : ''}`;
}

export async function listarFunis(config: ConfigCrm, buscar: typeof fetch = fetch): Promise<ListaFunis> {
  const r = await pedir(config, 'GET', '/settings/pipelines', undefined, buscar);
  if (!r.ok) return { ok: false, funis: [], motivo: motivo(r) };
  return { ok: true, funis: funisDe(r.dados) };
}

export function verificarFunil(funis: FunilKrayin[]): FunilVerificado {
  const vazio: FunilVerificado['etapas'] = { contato: null, primeira: null, segunda: null, ganho: null, perdido: null };
  if (funis.length === 0) return { funil: null, etapas: vazio, faltando: ESPERADAS.map((e) => e.nome), completo: false };
  // Prefere o funil padrao; se ele nao tiver as etapas, escolhe o que mais se aproxima (sem misturar dois funis).
  let melhor: { funil: FunilKrayin; etapas: FunilVerificado['etapas']; faltando: string[] } | null = null;
  for (const f of funis) {
    const etapas: FunilVerificado['etapas'] = { ...vazio };
    const faltando: string[] = [];
    for (const e of ESPERADAS) {
      const achada = e.codigo
        ? f.etapas.find((x) => normalizarNome(x.codigo ?? '') === e.codigo)
        : f.etapas.find((x) => normalizarNome(x.nome) === normalizarNome(e.nome));
      if (achada) etapas[e.chave as ChaveEtapa] = achada; else faltando.push(e.nome);
    }
    const candidato = { funil: f, etapas, faltando };
    if (melhor === null || faltando.length < melhor.faltando.length || (faltando.length === melhor.faltando.length && f.padrao && !melhor.funil.padrao)) melhor = candidato;
  }
  return { ...melhor!, completo: melhor!.faltando.length === 0 };
}

export async function testarConexao(config: ConfigCrm, buscar: typeof fetch = fetch): Promise<TesteConexao> {
  const r = await listarFunis(config, buscar);
  return r.ok ? { ok: true, funis: r.funis.length } : { ok: false, funis: 0, motivo: r.motivo };
}

export async function criarLead(config: ConfigCrm, entrada: { titulo: string; descricao?: string; etapaId?: number }, buscar: typeof fetch = fetch): Promise<ResultadoLead> {
  const titulo = String(entrada.titulo ?? '').trim();
  if (titulo === '') return { ok: false, motivo: 'titulo vazio' };
  const corpo: Record<string, unknown> = { title: titulo, lead_value: 0 };
  if (entrada.descricao !== undefined && entrada.descricao.trim() !== '') corpo.description = entrada.descricao.trim();
  if (entrada.etapaId !== undefined) {
    if (!Number.isInteger(entrada.etapaId) || entrada.etapaId <= 0) return { ok: false, motivo: 'etapa invalida' };
    corpo.lead_pipeline_stage_id = entrada.etapaId;
  }
  const r = await pedir(config, 'POST', '/leads', corpo, buscar);
  if (!r.ok) return { ok: false, motivo: motivo(r) };
  const d = r.dados && typeof r.dados === 'object' ? (r.dados as Record<string, unknown>) : {};
  const dados = d.data && typeof d.data === 'object' ? (d.data as Record<string, unknown>) : d;
  const id = Number(dados.id);
  return Number.isInteger(id) && id > 0 ? { ok: true, id } : { ok: false, motivo: 'resposta sem id do lead' };
}

export async function moverEtapa(config: ConfigCrm, leadId: number, etapaId: number, buscar: typeof fetch = fetch): Promise<{ ok: boolean; motivo?: string }> {
  if (!Number.isInteger(leadId) || leadId <= 0) return { ok: false, motivo: 'lead invalido' };
  if (!Number.isInteger(etapaId) || etapaId <= 0) return { ok: false, motivo: 'etapa invalida' };
  const r = await pedir(config, 'PUT', `/leads/stage/edit/${leadId}`, { lead_pipeline_stage_id: etapaId }, buscar);
  return r.ok ? { ok: true } : { ok: false, motivo: motivo(r) };
}
