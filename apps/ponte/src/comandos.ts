// Comandos do self-chat respondidos POR CODIGO, sem chamar o modelo (zero token): "/heimdall hoje", "aguardando", "followups", "cliente <nome>", "ajuda".
// Os dados ja sao calculados pelo nucleo (acompanhamento, relatorio); aqui so se escolhe o recorte e se escreve em portugues. SO LEITURA: nunca grava nada.
// So e comando se o texto depois de /heimdall for EXATAMENTE o comando (com "cliente" + nome); qualquer frase maior e pergunta livre e vai ao modelo.
import type { Banco } from '../../core/src/db.ts';
import { calcularAcompanhamento, CONFIG_PADRAO, type EstadoCliente } from '../../core/src/acompanhamento.ts';
import { mensagensParaAcompanhamento } from '../../core/src/ingestao.ts';
import { aplicarAjustes, caberEmUmaTela, montarPacoteDiario, renderizarDiario, type Ajuste, type Item } from '../../core/src/relatorio.ts';
import { diaLocal } from '../../core/src/calendario.ts';

const sem = (t: string): string => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

const AJUDA = [
  'Comandos (respondo na hora, sem gastar o modelo):',
  '• /heimdall hoje — o resumo do dia',
  '• /heimdall aguardando — quem espera resposta sua',
  '• /heimdall followups — follow-ups devidos',
  '• /heimdall cliente <nome> — como está um cliente',
  'Qualquer outra frase depois de /heimdall é uma pergunta livre ao modelo. Correções: A1, F2, P1; CRM: ok 1 e 3.'
].join('\n');

const linha = (i: Item): string => `• ${i.codigo} ${i.cliente} — ${i.texto}. ${i.motivo}.`;

const ESTADO_LEGIVEL: Record<EstadoCliente, string> = {
  aguardando_usuario: 'aguardando resposta sua',
  follow_up_devido: 'follow-up devido',
  ativo: 'em dia (sem pendência agora)',
  sem_resposta_nunca: 'nunca respondeu (fora do acompanhamento)',
  desconsiderado: 'desconsiderado (7 tentativas sem resposta)',
  fora_das_regras: 'fora das regras comerciais (contato interno)'
};

function detalheDoCliente(db: Banco, id: number, nome: string, agora: number): string {
  const cfg = CONFIG_PADRAO;
  const r = calcularAcompanhamento('cliente', mensagensParaAcompanhamento(db, id), agora, cfg);
  const ajustes = db.prepare('SELECT tipo, ate_dia AS ateDia, criado_em AS criadoEm FROM ajustes_cliente WHERE cliente_id = ?').all(id) as unknown as Ajuste[];
  const estado = aplicarAjustes(r.estado, r.ultimaRespostaClienteEm, ajustes, diaLocal(agora, cfg.fuso));
  const d = (ms: number | null): string => (ms === null ? 'nunca' : diaLocal(ms, cfg.fuso));
  const linhas = [`*${nome}*`, `Situação: ${estado === 'oculto' ? 'oculto por um ajuste seu' : ESTADO_LEGIVEL[estado]}`];
  if (estado === 'follow_up_devido') linhas.push(`Tentativa ${r.tentativas} de ${cfg.maxTentativas}`);
  linhas.push(`Última mensagem dele: ${d(r.ultimaRespostaClienteEm)}`, `Sua última mensagem: ${d(r.ultimaMensagemMinhaEm)}`);
  const ks = db.prepare("SELECT tipo, titulo, data_hora AS dh FROM compromissos WHERE cliente_id = ? AND estado = 'marcado' ORDER BY data_hora LIMIT 3").all(id) as { tipo: string; titulo: string; dh: string | null }[];
  if (ks.length) linhas.push('Combinado: ' + ks.map((k) => `${k.tipo} “${k.titulo}”${k.dh ? ` (${k.dh.slice(0, 10)})` : ''}`).join('; '));
  return linhas.join('\n');
}

/** Resposta do comando, ou null se o texto nao e um comando (entao a frase vai ao modelo). */
export function responderComando(db: Banco, texto: string, agora: number): string | null {
  const t = sem(texto);
  if (t === 'ajuda' || t === '?') return AJUDA;
  if (t === 'hoje') return renderizarDiario(caberEmUmaTela(montarPacoteDiario(db, agora))).trim();
  if (t === 'aguardando') {
    const p = montarPacoteDiario(db, agora);
    return p.aguardando.length ? ['Aguardando resposta sua:', ...p.aguardando.map(linha)].join('\n') : 'Ninguém está aguardando resposta sua agora.';
  }
  if (t === 'followups') {
    const p = montarPacoteDiario(db, agora);
    return p.followups.length ? ['Follow-ups devidos:', ...p.followups.map(linha)].join('\n') : 'Nenhum follow-up devido agora.';
  }
  if (t === 'cliente' || t.startsWith('cliente ')) {
    const busca = t.slice('cliente'.length).trim();
    if (busca === '') return 'Diga o nome: /heimdall cliente <nome>';
    const todos = db.prepare('SELECT id, nome FROM clientes ORDER BY id').all() as { id: number; nome: string }[];
    const achados = todos.filter((c) => sem(c.nome).includes(busca));
    if (achados.length === 0) return `Não achei cliente com “${busca}”. Ainda posso não ter cadastrado esse contato como cliente.`;
    if (achados.length > 1) return ['Achei mais de um cliente, diga o nome com mais letras:', ...achados.slice(0, 8).map((c) => `• ${c.nome}`)].join('\n');
    return detalheDoCliente(db, achados[0]!.id, achados[0]!.nome, agora);
  }
  return null;
}
