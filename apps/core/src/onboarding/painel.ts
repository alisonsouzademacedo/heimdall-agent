// Dados dos passos e do painel da tela de configuracao. TUDO e lido do banco: os outros processos (listener, executor, memoria, ponte) gravam.
// Nada aqui usa a rede, apaga dados ou fala com o WhatsApp; as duas acoes (teste do self-chat e relatorio de teste) so escrevem na caixa de saida,
// que nao tem destino: o listener entrega ao self-chat do dono.
import type { Banco } from '../db.ts';
import { lerEstado, lerQr, lerServicos, type EstadoLido } from '../whatsapp/estado.ts';
import { resumoDaFila } from '../fila.ts';
import { enfileirarSaida, ehMensagemNossa, resumoDaSaida } from '../saida.ts';
import { lerBackup } from '../backup-copia.ts';
import { caberEmUmaTela, contarPalavras, montarPacoteDiario, renderizarDiario, MAX_PALAVRAS_DIARIO, MAX_PALAVRAS_SEMANAL } from '../relatorio.ts';
import { extracaoLiberada } from '../extracao.ts';
import { resumoHistoricoAntigo, type ResumoHistorico } from '../historico-antigo.ts';
import { caberSemanal, montarPacoteSemanal, renderizarSemanal } from '../relatorio-semanal.ts';

export type EstadoTesteSelfChat = 'nao_feito' | 'aguardando_envio' | 'aguardando_resposta' | 'ok' | 'falhou';

export interface Painel {
  whatsapp: { estado: EstadoLido['estado']; dono: string | null; motivo: string | null; aviso: EstadoLido['aviso']; historico: EstadoLido['historico']; contagem: EstadoLido['contagem']; qrSvg: string | null };
  fila: { total: Record<'pendente' | 'em_andamento' | 'ok' | 'erro' | 'abandonada', number>; porTipo: Record<string, Record<string, number>> };
  saida: Record<'pendente' | 'enviada' | 'abandonada', number>;
  acervo: { mensagens: number; conversas: number; audios: number; pdfs: number };
  memoria: { documentosEnviados: number };
  relatorios: { ultimo: { chave: string; criadaEm: number } | null };
  servicos: Record<string, { ok: boolean; ha: number }>;
  selfchat: { teste: EstadoTesteSelfChat };
  backup: { destino: string | null; ultimoEm: number | null; erro: string | null };
  historicoAntigo: ResumoHistorico;
  processamento: { liberada: boolean };
}

const SVG_MAX = 100_000;
// O desenho do QR vem do listener e vai para a tela como imagem; mesmo assim so passa um SVG "de desenho": sem script, link, imagem embutida ou evento.
export function svgSeguro(svg: unknown): string | null {
  if (typeof svg !== 'string' || svg.length === 0 || svg.length > SVG_MAX) return null;
  if (!/^<svg[ >]/.test(svg.trimStart())) return null;
  if (/<script|<foreignObject|<image|<a[ >]|<use|<style|\son[a-z]+\s*=|href\s*=|javascript:/i.test(svg)) return null;
  return svg;
}

const SERVICO_VALE_MS = 120_000;

export function estadoDoTesteSelfChat(db: Banco): EstadoTesteSelfChat {
  const t = db.prepare("SELECT estado, wa_msg_id AS wa, enviada_em AS em FROM saida WHERE chave LIKE 'teste:selfchat:%' ORDER BY id DESC LIMIT 1").get() as { estado: string; wa: string | null; em: number | null } | undefined;
  if (!t) return 'nao_feito';
  if (t.estado === 'pendente') return 'aguardando_envio';
  if (t.estado === 'abandonada') return 'falhou';
  const msgs = db.prepare(
    `SELECT m.wa_msg_id AS wa, m.texto FROM mensagens m JOIN conversas c ON c.id = m.conversa_id
     WHERE c.tipo = 'self' AND m.de_mim = 1 AND m.origem_evento = 'notify' AND m.estado = 'ativa' AND m.texto IS NOT NULL AND m.enviada_em > ?`
  ).all(t.em ?? 0) as { wa: string; texto: string }[];
  return msgs.some((m) => !ehMensagemNossa(db, m.texto, m.wa)) ? 'ok' : 'aguardando_resposta';
}

export function montarPainel(db: Banco, agora: number = Date.now()): Painel {
  const w = lerEstado(db);
  const qr = w.estado === 'conectado' ? null : lerQr(db);
  const porTipo: Painel['fila']['porTipo'] = {};
  for (const l of db.prepare('SELECT tipo, estado, COUNT(*) AS n FROM fila GROUP BY tipo, estado').all() as { tipo: string; estado: string; n: number }[]) (porTipo[l.tipo] ??= {})[l.estado] = l.n;
  const n = (sql: string): number => (db.prepare(sql).get() as { n: number }).n;
  const ultimo = db.prepare("SELECT chave, criada_em AS criadaEm FROM saida WHERE tipo = 'relatorio' AND chave IS NOT NULL ORDER BY id DESC LIMIT 1").get() as { chave: string; criadaEm: number } | undefined;
  const servicos: Painel['servicos'] = {};
  for (const [nome, s] of Object.entries(lerServicos(db))) servicos[nome] = { ok: s.ok && agora - s.em <= SERVICO_VALE_MS, ha: Math.max(0, Math.round((agora - s.em) / 1000)) };
  return {
    whatsapp: { estado: w.estado, dono: w.dono, motivo: w.motivo, aviso: w.aviso, historico: w.historico, contagem: w.contagem, qrSvg: svgSeguro(qr?.svg) },
    fila: { total: resumoDaFila(db), porTipo },
    saida: resumoDaSaida(db),
    acervo: {
      mensagens: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo != 'ignorada'"),
      conversas: n('SELECT COUNT(*) AS n FROM conversas'),
      audios: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'audio'"),
      pdfs: n("SELECT COUNT(*) AS n FROM mensagens WHERE tipo = 'pdf'")
    },
    memoria: { documentosEnviados: n('SELECT COUNT(*) AS n FROM sync_hindsight') },
    relatorios: { ultimo: ultimo ?? null },
    servicos,
    selfchat: { teste: estadoDoTesteSelfChat(db) },
    backup: lerBackup(db),
    historicoAntigo: resumoHistoricoAntigo(db),
    processamento: { liberada: extracaoLiberada(db) }
  };
}

// Passo "Self-chat": pede UMA mensagem de teste ao dono (pela caixa de saida). Devolve false se ja ha um teste em andamento.
export function pedirTesteSelfChat(db: Banco, agora: number = Date.now()): boolean {
  const e = estadoDoTesteSelfChat(db);
  if (e === 'aguardando_envio' || e === 'aguardando_resposta') return false;
  return enfileirarSaida(db, 'aviso', 'Teste do Heimdall: se você está lendo isto, a ida funcionou. Responda aqui com qualquer texto (por exemplo "oi") para testar a volta.', agora, `teste:selfchat:${agora}`) !== null;
}

// Passo "Agenda": gera o diario e o semanal AGORA (qualquer dia da semana), com os dados reais do acervo, so para o dono ver e conferir o tamanho.
export function gerarRelatorioDeTeste(db: Banco, agora: number = Date.now()): { tipo: 'diario' | 'semanal'; palavras: number; cabe: boolean }[] {
  const diario = renderizarDiario(caberEmUmaTela(montarPacoteDiario(db, agora)));
  const semanal = renderizarSemanal(caberSemanal(montarPacoteSemanal(db, agora)));
  const saida: { tipo: 'diario' | 'semanal'; palavras: number; cabe: boolean }[] = [];
  for (const [tipo, texto, max] of [['diario', diario, MAX_PALAVRAS_DIARIO], ['semanal', semanal, MAX_PALAVRAS_SEMANAL]] as const) {
    const palavras = contarPalavras(texto);
    enfileirarSaida(db, 'relatorio', `[TESTE] ${texto}`, agora, `teste:${tipo}:${agora}`);
    saida.push({ tipo, palavras, cabe: palavras <= max });
  }
  return saida;
}

// Marca as etapas que o banco ja prova: o dono nao precisa clicar "ok". So estes passos sao automaticos; os demais dependem de uma acao dele na tela.
export function atualizarEtapas(db: Banco, p: Painel, agora: number = Date.now()): void {
  const marca = (passo: string, estado: 'verde' | 'vermelho' | null): void => {
    if (estado === null) return;
    db.prepare('UPDATE onboarding_etapas SET estado = ?, fim = ?, erro = NULL WHERE passo = ? AND estado != ?').run(estado, agora, passo, estado);
  };
  const w = p.whatsapp;
  marca('whatsapp', w.estado === 'conectado' ? 'verde' : w.estado === 'deslogado' || w.estado === 'erro' ? 'vermelho' : null);
  // sincronizar, extrair e processar NAO sao gravados aqui: o verde "pegajoso" escondia trabalho novo. Veja estadosAoVivo (calculado a cada leitura).
  marca('backup', p.backup.destino !== null && p.backup.ultimoEm !== null && p.backup.erro === null ? 'verde' : null);
  marca('selfchat', p.selfchat.teste === 'ok' ? 'verde' : p.selfchat.teste === 'falhou' ? 'vermelho' : null);
}

// Estado "ao vivo" dos passos que dependem de trabalho em andamento: calculado a cada leitura, NUNCA gravado (verde nao fica pegajoso).
// Porcentagem so onde existe total conhecido (arquivos da fila; progresso que o WhatsApp informa; conversas do historico antigo); senao null.
export interface EstadoAoVivo { estado: 'pendente' | 'processando' | 'verde' | 'vermelho'; percentual: number | null; detalhe: string }
type EntradaAoVivo = Pick<Painel, 'whatsapp' | 'fila' | 'acervo' | 'historicoAntigo' | 'processamento'>;
const soma = (o: Record<string, number> | undefined): number => Object.values(o ?? {}).reduce((a, b) => a + b, 0);
const pct = (parte: number, total: number): number => (total > 0 ? Math.floor((parte * 100) / total) : 0);

export function estadosAoVivo(p: EntradaAoVivo): { sincronizar: EstadoAoVivo; extrair: EstadoAoVivo; processar: EstadoAoVivo } {
  const w = p.whatsapp;
  const conectado = w.estado === 'conectado';
  const recebido = conectado && w.historico !== null && (w.historico.ultima === true || (w.historico.progresso ?? 0) >= 100);

  let sincronizar: EstadoAoVivo;
  const ha = p.historicoAntigo;
  if (!conectado) sincronizar = { estado: 'pendente', percentual: null, detalhe: 'Conecte o WhatsApp primeiro.' };
  else if (!recebido) sincronizar = { estado: 'processando', percentual: w.historico?.progresso ?? null, detalhe: `${p.acervo.mensagens} mensagens em ${p.acervo.conversas} conversas recebidas ate agora` };
  else if (ha.pendentes + ha.emAndamento > 0) {
    // Ha conversa antiga por pedir: o passo NAO pode ficar verde. Amarelo so quando a busca esta liberada;
    // pausada, fica cinza com o numero real do que falta (o dono ve o tamanho do trabalho e decide).
    sincronizar = ha.liberado
      ? { estado: 'processando', percentual: pct(ha.concluidas + ha.esgotadas, ha.conversas), detalhe: `Buscando mensagens mais antigas: ${ha.concluidas + ha.esgotadas} de ${ha.conversas} conversas (${ha.novas} mensagens novas)` }
      : { estado: 'pendente', percentual: null, detalhe: `Busca de mensagens antigas pausada: ${ha.pendentes} conversa(s) ainda nao pedida(s).` };
  } else sincronizar = { estado: 'verde', percentual: 100, detalhe: ha.liberado && ha.conversas > 0 ? `Historico recebido; conversas antigas: ${ha.concluidas} concluidas, ${ha.esgotadas} no limite` : 'Historico recebido.' };

  const b = p.fila.porTipo.baixar_midia ?? {};
  const total = soma(b), ok = b.ok ?? 0, pend = (b.pendente ?? 0) + (b.em_andamento ?? 0), sem = (b.abandonada ?? 0) + (b.erro ?? 0);
  const semArq = sem > 0 ? `${sem} sem arquivo (o WhatsApp nao entregou)` : '';
  const texto = pend > 0 || sem === 0 ? `${ok} de ${total} arquivos${semArq ? ` (${semArq})` : ''}` : `${ok} baixados; ${semArq}`;
  let extrair: EstadoAoVivo;
  if (!conectado) extrair = { estado: 'pendente', percentual: null, detalhe: 'Conecte o WhatsApp primeiro.' };
  else if (!recebido || pend > 0) extrair = { estado: 'processando', percentual: total > 0 ? pct(ok, total) : null, detalhe: total > 0 ? texto : 'Aguardando o historico chegar.' };
  else if (p.acervo.mensagens > 0) extrair = { estado: 'verde', percentual: 100, detalhe: total > 0 ? texto : 'Mensagens guardadas; nao ha audios nem PDFs.' };
  else extrair = { estado: 'pendente', percentual: null, detalhe: 'Ainda nao ha mensagens guardadas.' };

  const e = p.fila.porTipo.extrair ?? {};
  const totalE = soma(e), okE = e.ok ?? 0, pendE = (e.pendente ?? 0) + (e.em_andamento ?? 0);
  let processar: EstadoAoVivo;
  if (!p.processamento.liberada) processar = { estado: 'pendente', percentual: null, detalhe: 'Aguardando o seu OK para liberar o processamento.' };
  else if (totalE === 0) processar = { estado: 'pendente', percentual: null, detalhe: 'Liberado; ainda sem dias para processar.' };
  else if (pendE > 0) processar = { estado: 'processando', percentual: pct(okE, totalE), detalhe: `${okE} de ${totalE} dias processados` };
  else processar = { estado: 'verde', percentual: 100, detalhe: `${okE} de ${totalE} dias processados` };
  return { sincronizar, extrair, processar };
}
