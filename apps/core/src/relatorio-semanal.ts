// Relatorio semanal (segunda, 08:00): cobre a semana anterior inteira (seg 00:00 a dom 23:59:59). Estados, contagens e datas vem do codigo;
// o modelo so redige (prompts/relatorios/semanal.md). Este renderizador deterministico e a RESERVA se o modelo falhar.
import type { Banco } from './db.ts';
import { calcularAcompanhamento, CONFIG_PADRAO, type ConfigAcompanhamento } from './acompanhamento.ts';
import { mensagensParaAcompanhamento } from './ingestao.ts';
import { diaLocal, janelaSemanal, instanteLocal, somarDias, FUSO_PADRAO } from './calendario.ts';
import { aplicarAjustes, contarPalavras, MAX_PALAVRAS_SEMANAL, type Ajuste, type Item } from './relatorio.ts';

export interface PacoteSemanal {
  tipo: 'semanal';
  titulo: string;
  resumo: string;
  aguardando: Item[];
  hoje: string[];
  evolucao: { avancaram: string[]; estagnados: string[]; desconsiderados: string[]; nuncaResponderam: number };
  potencial: Item[];
  reunioes: { realizadas: number; semTranscricao: string[]; proximas: string[] };
  compromissos: string[];
  processo: string[];
  aprendizado: string[];
  numeros: { mensagens: number; audios: number; pdfs: number; falhas: number };
  semNovidade: number;
}

const dm = (dia: string): string => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

export function tituloSemanal(agora: number, fuso: string = FUSO_PADRAO): string {
  const j = janelaSemanal(agora, fuso);
  return `Semanal — semana de ${dm(j.primeiroDia)} a ${dm(j.ultimoDia)}`;
}

interface Cmp { titulo: string; data_hora: string | null; tipo: string; estado: string }

export function montarPacoteSemanal(db: Banco, agora: number, cfg: ConfigAcompanhamento = CONFIG_PADRAO): PacoteSemanal {
  const hoje = diaLocal(agora, cfg.fuso);
  const j = janelaSemanal(agora, cfg.fuso);
  const proxFim = instanteLocal(somarDias(hoje, 6), 23, 59, 59, 999, cfg.fuso);
  const clientes = db.prepare(
    `SELECT DISTINCT cl.id, cl.nome FROM clientes cl JOIN contatos k ON k.cliente_id = cl.id WHERE k.papel IN ('cliente','desconhecido') ORDER BY cl.id`
  ).all() as { id: number; nome: string }[];

  const aguardando: (Item & { desde: number })[] = [];
  const avancaram: string[] = [], estagnados: string[] = [], desconsiderados: string[] = [];
  let nuncaResponderam = 0, semNovidade = 0;
  for (const c of clientes) {
    const msgs = mensagensParaAcompanhamento(db, c.id);
    const r = calcularAcompanhamento('cliente', msgs, agora, cfg);
    const ajustes = db.prepare('SELECT tipo, ate_dia AS ateDia, criado_em AS criadoEm FROM ajustes_cliente WHERE cliente_id = ?').all(c.id) as unknown as Ajuste[];
    const estado = aplicarAjustes(r.estado, r.ultimaRespostaClienteEm, ajustes, hoje);
    if (estado === 'oculto') continue;
    const naSemana = msgs.filter((m) => m.em >= j.inicio && m.em <= j.fim);
    if (estado === 'aguardando_usuario') {
      const dias = Math.max(0, Math.round((agora - r.aguardandoUsuarioDesde!) / 86_400_000));
      aguardando.push({ codigo: '', clienteId: c.id, cliente: c.nome, texto: `espera há ${dias} ${dias === 1 ? 'dia' : 'dias'}`, motivo: `última mensagem do cliente em ${diaLocal(r.aguardandoUsuarioDesde!, cfg.fuso)} sem resposta sua`, desde: r.aguardandoUsuarioDesde! });
      continue;
    }
    if (estado === 'desconsiderado') { desconsiderados.push(c.nome); continue; }
    if (estado === 'sem_resposta_nunca') { nuncaResponderam++; continue; }
    if (naSemana.some((m) => !m.deMim)) avancaram.push(c.nome);
    else if (estado === 'follow_up_devido' || estado === 'ativo') {
      if (naSemana.length === 0) estagnados.push(c.nome); else semNovidade++;
    }
  }
  aguardando.sort((x, y) => x.desde - y.desde);
  aguardando.forEach((x, i) => { x.codigo = `A${i + 1}`; });

  const potencial: Item[] = [];
  (db.prepare('SELECT s.cliente_id AS id, cl.nome AS nome, s.tipo AS tipo FROM sinais_potencial s JOIN clientes cl ON cl.id = s.cliente_id WHERE s.em BETWEEN ? AND ? ORDER BY s.em').all(j.inicio, j.fim) as { id: number; nome: string; tipo: string }[])
    .forEach((s, i) => potencial.push({ codigo: `P${i + 1}`, clienteId: s.id, cliente: s.nome, texto: s.tipo.replaceAll('_', ' '), motivo: 'sinal registrado na semana' }));

  const cmps = db.prepare('SELECT titulo, data_hora, tipo, estado FROM compromissos WHERE data_hora IS NOT NULL ORDER BY data_hora').all() as unknown as Cmp[];
  const reunioes = { realizadas: 0, semTranscricao: [] as string[], proximas: [] as string[] };
  const hojeLista: string[] = [], compromissos: string[] = [];
  for (const c of cmps) {
    const t = Date.parse(c.data_hora!);
    if (Number.isNaN(t)) continue;
    const dia = diaLocal(t, cfg.fuso);
    if (c.tipo === 'reuniao' && t >= j.inicio && t <= j.fim && (c.estado === 'realizado' || c.estado === 'transcricao_recebida')) {
      reunioes.realizadas++;
      if (c.estado === 'realizado') reunioes.semTranscricao.push(c.titulo);
    }
    if (c.estado !== 'marcado') continue;
    if (dia === hoje) hojeLista.push(`${c.titulo} (hoje)`);
    else if (dia < hoje) hojeLista.push(`${c.titulo} (atrasado desde ${dm(dia)})`);
    else if (t <= proxFim) {
      compromissos.push(`${dm(dia)} — ${c.titulo}`);
      if (c.tipo === 'reuniao') reunioes.proximas.push(c.titulo);
    }
  }

  const n = (sql: string) => (db.prepare(sql).get(j.inicio, j.fim) as { n: number }).n;
  return {
    tipo: 'semanal',
    titulo: tituloSemanal(agora, cfg.fuso),
    resumo: aguardando.length ? `${aguardando.length} cliente(s) aguardam resposta sua. Comece por ${aguardando[0]!.cliente}.` : 'Nenhum cliente aguardando resposta sua.',
    aguardando: aguardando.map(({ desde: _d, ...i }) => i),
    hoje: hojeLista,
    evolucao: { avancaram, estagnados, desconsiderados, nuncaResponderam },
    potencial, reunioes, compromissos, processo: [], aprendizado: [],
    numeros: {
      mensagens: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo != 'ignorada' AND enviada_em BETWEEN ? AND ?"),
      audios: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'audio' AND enviada_em BETWEEN ? AND ?"),
      pdfs: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'pdf' AND enviada_em BETWEEN ? AND ?"),
      falhas: 0
    },
    semNovidade
  };
}

const pl = (n: number, um: string, varios: string): string => `${n} ${n === 1 ? um : varios}`;
const secao = (titulo: string, linhas: string[]): string => (linhas.length ? `\n## ${titulo}\n${linhas.join('\n')}\n` : '');
const linhaItem = (i: Item): string => {
  const base = `- **${i.codigo}** ${i.cliente} — ${i.texto}. Motivo: ${i.motivo}.`;
  return i.rascunho ? `${base}\n  Rascunho: "${i.rascunho}"` : base;
};

export function renderizarSemanal(p: PacoteSemanal): string {
  const e = p.evolucao;
  const evolucao: string[] = [];
  if (e.avancaram.length) evolucao.push(`- Avançaram: ${e.avancaram.join(', ')}`);
  if (e.estagnados.length) evolucao.push(`- Estagnados: ${e.estagnados.join(', ')}`);
  if (e.desconsiderados.length) evolucao.push(`- Desconsiderados (7 tentativas): ${e.desconsiderados.join(', ')}`);
  if (e.nuncaResponderam > 0) evolucao.push(`- Abordados que nunca responderam: ${e.nuncaResponderam}`);
  const r = p.reunioes;
  const reun: string[] = [];
  if (r.realizadas) reun.push(`- Realizadas: ${r.realizadas}.${r.semTranscricao.length ? ` Sem transcrição: ${r.semTranscricao.join(', ')}.` : ''}`);
  if (r.proximas.length) reun.push(`- Próximas: ${r.proximas.join(', ')}`);
  return [
    `# ${p.titulo}\n\n**Resumo:** ${p.resumo}\n`,
    secao('Aguardando você', p.aguardando.map(linhaItem)),
    secao('Hoje', p.hoje.map((h) => `- ${h}`)),
    secao('Evolução por cliente', evolucao),
    secao('Potencial', p.potencial.map(linhaItem)),
    secao('Reuniões', reun),
    secao('Compromissos da semana', p.compromissos.map((c) => `- ${c}`)),
    secao('Seu processo', p.processo.map((c) => `- ${c}`)),
    secao('Aprendizado e dúvidas', p.aprendizado.map((c) => `- ${c}`)),
    p.semNovidade > 0 ? `\n+${p.semNovidade} sem novidade\n` : '',
    `\n_Semana: ${pl(p.numeros.mensagens, 'mensagem', 'mensagens')}, ${pl(p.numeros.audios, 'áudio', 'áudios')}, ${pl(p.numeros.pdfs, 'PDF', 'PDFs')}, ${pl(p.numeros.falhas, 'falha', 'falhas')}._\n`
  ].join('');
}

// Cabe em uma tela: corta do menor para o maior valor (nunca menos de 3 em "Aguardando você").
export function caberSemanal(p: PacoteSemanal, maxPalavras: number = MAX_PALAVRAS_SEMANAL): PacoteSemanal {
  const c: PacoteSemanal = structuredClone(p);
  const listas: ((x: PacoteSemanal) => unknown[])[] = [(x) => x.processo, (x) => x.compromissos, (x) => x.reunioes.proximas, (x) => x.potencial, (x) => x.evolucao.estagnados, (x) => x.hoje, (x) => x.aguardando];
  for (;;) {
    if (contarPalavras(renderizarSemanal(c)) <= maxPalavras) return c;
    let cortou = false;
    for (let i = 0; i < listas.length; i++) {
      const lista = listas[i]!(c);
      if (i === listas.length - 1 && lista.length <= 3) continue;
      if (lista.length > 0) { lista.pop(); c.semNovidade++; cortou = true; break; }
    }
    if (!cortou) return c;
  }
}
