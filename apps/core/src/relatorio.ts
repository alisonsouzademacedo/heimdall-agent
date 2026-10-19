// Pacote e texto base dos relatorios (docs/plano/fase-1-relatorios.md; prompts/relatorios/).
// O modelo de linguagem escreve o relatorio final a partir deste pacote; este renderizador deterministico serve de
// RESERVA (se o modelo falhar) e de referencia para os testes de "retrato". Todos os numeros e estados vem do codigo.
import type { Banco } from './db.ts';
import { calcularAcompanhamento, CONFIG_PADRAO, type ConfigAcompanhamento, type EstadoCliente } from './acompanhamento.ts';
import { mensagensParaAcompanhamento } from './ingestao.ts';
import { diaLocal, diaDaSemana, diasEntre, janelaDiario, FUSO_PADRAO } from './calendario.ts';

export interface Item {
  codigo: string; // A1, F2, P1
  cliente: string;
  texto: string;
  motivo: string; // toda recomendacao traz o dado que a sustenta
  rascunho?: string;
}

export interface PacoteDiario {
  tipo: 'diario';
  titulo: string;
  resumo: string;
  aguardando: Item[];
  hoje: Item[];
  followups: Item[];
  potencial: Item[];
  reunioes: string[];
  pedro: string[];
  novos: string[];
  aprendizado: string[];
  numeros: { mensagens: number; audios: number; pdfs: number; falhas: number };
  semNovidade: number;
}

export const MAX_PALAVRAS_DIARIO = 350;
export const MAX_PALAVRAS_SEMANAL = 450;

const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export function contarPalavras(texto: string): number {
  return texto.split(/\s+/).filter((p) => p.length > 0).length;
}

export function tituloDiario(agora: number, fuso: string = FUSO_PADRAO): string {
  const dia = diaLocal(agora, fuso);
  const [, m, d] = dia.split('-');
  return `Diário — ${DIAS[diaDaSemana(dia)]}, ${d}/${m}`;
}

const pl = (n: number, um: string, varios: string): string => `${n} ${n === 1 ? um : varios}`;

function secao(titulo: string, linhas: string[]): string {
  return linhas.length ? `\n## ${titulo}\n${linhas.join('\n')}\n` : '';
}

function linhaItem(i: Item): string {
  const base = `- **${i.codigo}** ${i.cliente} — ${i.texto}. Motivo: ${i.motivo}.`;
  return i.rascunho ? `${base}\n  Rascunho: "${i.rascunho}"` : base;
}

// Ordem fixa das secoes e rodape de numeros (prompts/relatorios/comum.md).
export function renderizarDiario(p: PacoteDiario): string {
  const partes = [
    `# ${p.titulo}\n\n**Resumo:** ${p.resumo}\n`,
    secao('Aguardando você', p.aguardando.map(linhaItem)),
    secao('Hoje / atrasados', p.hoje.map(linhaItem)),
    secao('Follow-ups devidos', p.followups.map(linhaItem)),
    secao('Potencial', p.potencial.map(linhaItem)),
    secao('Reuniões', p.reunioes.map((r) => `- ${r}`)),
    secao('Pedro', p.pedro.map((r) => `- ${r}`)),
    secao('Novos contatos', p.novos.map((r) => `- ${r}`)),
    secao('Aprendizado e dúvidas', p.aprendizado.map((r) => `- ${r}`)),
    p.semNovidade > 0 ? `\n+${p.semNovidade} sem novidade\n` : '',
    `\n_Ontem: ${pl(p.numeros.mensagens, 'mensagem', 'mensagens')}, ${pl(p.numeros.audios, 'áudio', 'áudios')}, ${pl(p.numeros.pdfs, 'PDF', 'PDFs')}, ${pl(p.numeros.falhas, 'falha', 'falhas')}._\n`
  ];
  return partes.join('');
}

// Cabe em uma tela: retira itens de menor prioridade ate caber (nunca deixa menos de 3 itens em "Aguardando você").
export function caberEmUmaTela(p: PacoteDiario, maxPalavras: number = MAX_PALAVRAS_DIARIO): PacoteDiario {
  const copia: PacoteDiario = structuredClone(p);
  const ordemDeCorte: (keyof PacoteDiario)[] = ['novos', 'pedro', 'reunioes', 'potencial', 'followups', 'hoje', 'aguardando'];
  const MIN_AGUARDANDO = 3;
  for (;;) {
    if (contarPalavras(renderizarDiario(copia)) <= maxPalavras) return copia;
    let cortou = false;
    for (const chave of ordemDeCorte) {
      const lista = copia[chave] as unknown[];
      if (chave === 'aguardando' && lista.length <= MIN_AGUARDANDO) continue;
      if (lista.length > 0) {
        lista.pop();
        copia.semNovidade++;
        cortou = true;
        break;
      }
    }
    if (!cortou) return copia; // nada mais a cortar; o chamador ve que estourou
  }
}

export interface Ajuste { tipo: 'silenciar' | 'prioridade_baixa' | 'resolvido'; ateDia: string | null; criadoEm: number }

// Aplica os ajustes do dono (tipo 2 de docs/plano/fase-1-aprendizado.md). Funcao pura.
export function aplicarAjustes(estado: EstadoCliente, ultimaMensagemClienteEm: number | null, ajustes: readonly Ajuste[], hoje: string): EstadoCliente | 'oculto' {
  for (const a of ajustes) {
    if (a.tipo === 'silenciar' && a.ateDia !== null && hoje <= a.ateDia) return 'oculto';
    if (a.tipo === 'resolvido' && estado === 'aguardando_usuario' && (ultimaMensagemClienteEm ?? 0) <= a.criadoEm) return 'oculto';
  }
  return estado;
}

interface ClienteLinha { id: number; nome: string }

// Monta o pacote do diario a partir do banco: estados calculados por codigo, ajustes aplicados, itens ordenados por espera.
export function montarPacoteDiario(db: Banco, agora: number, cfg: ConfigAcompanhamento = CONFIG_PADRAO): PacoteDiario {
  const hoje = diaLocal(agora, cfg.fuso);
  const janela = janelaDiario(agora, cfg.fuso);
  const clientes = db.prepare(
    `SELECT DISTINCT cl.id, cl.nome FROM clientes cl JOIN contatos k ON k.cliente_id = cl.id WHERE k.papel IN ('cliente','desconhecido') ORDER BY cl.id`
  ).all() as unknown as ClienteLinha[];

  const aguardando: (Item & { desde: number })[] = [];
  const followups: Item[] = [];
  const potencial: Item[] = [];
  let a = 0, f = 0, pot = 0, semNovidade = 0;

  for (const c of clientes) {
    const msgs = mensagensParaAcompanhamento(db, c.id);
    const r = calcularAcompanhamento('cliente', msgs, agora, cfg);
    const ajustes = (db.prepare('SELECT tipo, ate_dia AS ateDia, criado_em AS criadoEm FROM ajustes_cliente WHERE cliente_id = ?').all(c.id) as unknown as Ajuste[]);
    const estado = aplicarAjustes(r.estado, r.ultimaRespostaClienteEm, ajustes, hoje);
    if (estado === 'oculto') continue;
    if (estado === 'aguardando_usuario') {
      const dias = Math.max(0, diasEntre(diaLocal(r.aguardandoUsuarioDesde!, cfg.fuso), hoje)); // dias corridos, no fuso do dono
      aguardando.push({ codigo: '', cliente: c.nome, texto: `espera há ${dias} ${dias === 1 ? 'dia' : 'dias'}`, motivo: `última mensagem do cliente em ${diaLocal(r.aguardandoUsuarioDesde!, cfg.fuso)} sem resposta sua`, desde: r.aguardandoUsuarioDesde! });
    } else if (estado === 'follow_up_devido') {
      f++;
      followups.push({ codigo: `F${f}`, cliente: c.nome, texto: `tentativa ${r.tentativas} de ${cfg.maxTentativas}`, motivo: `seu último contato foi em ${diaLocal(r.ultimaMensagemMinhaEm!, cfg.fuso)} e venceu o prazo de ${cfg.intervaloDiasUteis} dias úteis` });
    } else if (estado === 'ativo' || estado === 'sem_resposta_nunca' || estado === 'desconsiderado') {
      semNovidade++;
    }
    const sinais = db.prepare('SELECT tipo FROM sinais_potencial WHERE cliente_id = ? AND em BETWEEN ? AND ?').all(c.id, janela.inicio, janela.fim) as { tipo: string }[];
    if (sinais.length) {
      pot++;
      potencial.push({ codigo: `P${pot}`, cliente: c.nome, texto: sinais[0]!.tipo.replaceAll('_', ' '), motivo: 'sinal registrado no dia anterior' });
    }
  }
  aguardando.sort((x, y) => x.desde - y.desde);
  aguardando.forEach((x) => { a++; x.codigo = `A${a}`; });

  const n = (sql: string) => (db.prepare(sql).get(janela.inicio, janela.fim) as { n: number }).n;
  return {
    tipo: 'diario',
    titulo: tituloDiario(agora, cfg.fuso),
    resumo: aguardando.length ? `${aguardando.length} cliente(s) aguardam resposta sua. Comece por ${aguardando[0]!.cliente}.` : 'Nenhum cliente aguardando resposta sua.',
    aguardando: aguardando.map(({ desde: _d, ...i }) => i),
    hoje: [], followups, potencial, reunioes: [], pedro: [], novos: [], aprendizado: [],
    numeros: {
      mensagens: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo != 'ignorada' AND enviada_em BETWEEN ? AND ?"),
      audios: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'audio' AND enviada_em BETWEEN ? AND ?"),
      pdfs: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'pdf' AND enviada_em BETWEEN ? AND ?"),
      falhas: 0
    },
    semNovidade
  };
}

// Verificacoes usadas pelos testes e, depois, pelo gerador: ordem das secoes e codigos unicos.
export const ORDEM_SECOES = ['Aguardando você', 'Hoje / atrasados', 'Follow-ups devidos', 'Potencial', 'Reuniões', 'Pedro', 'Novos contatos', 'Aprendizado e dúvidas'];

export function secoesDoTexto(md: string): string[] {
  return [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]!);
}
