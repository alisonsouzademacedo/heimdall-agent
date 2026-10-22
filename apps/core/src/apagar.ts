// Apagar dados: sempre em DUAS etapas, so por comando do dono no self-chat (docs/plano/fase-1-seguranca-operacional.md).
// O modelo de linguagem nunca chama nada daqui. Etapa 1 mostra o escopo e gera um codigo; etapa 2 exige a frase exata.
// Este e o UNICO arquivo autorizado a conter DELETE FROM (garantido por arquitetura.test.ts).
import { randomInt } from 'node:crypto';
import type { Banco } from './db.ts';

export const VALIDADE_CODIGO_MS = 10 * 60 * 1000; // proposta nossa: 10 minutos
export const MAX_ERROS_CODIGO = 3; // proposta nossa
export const RETENCAO_MIDIAS_DIAS = 90; // decisao D16

export interface Escopo {
  tipo: 'cliente' | 'midias_antigas';
  contagens: Record<string, number>;
}

export interface Proposta {
  codigo: string;
  escopo: Escopo;
  frase: string; // o que o dono deve digitar
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem letras que se confundem (I, O, 0, 1)

function gerarCodigo(): string {
  let c = '';
  for (let i = 0; i < 6; i++) c += ALFABETO[randomInt(ALFABETO.length)];
  return c;
}

function n(db: Banco, sql: string, ...args: (string | number)[]): number {
  return (db.prepare(sql).get(...args) as { n: number }).n;
}

const DO_CLIENTE = {
  contatos: 'SELECT id FROM contatos WHERE cliente_id = ?',
  jids: 'SELECT jid FROM contato_jids WHERE contato_id IN (SELECT id FROM contatos WHERE cliente_id = ?)'
};

function mensagensDoCliente(db: Banco, clienteId: number): number[] {
  const linhas = db
    .prepare(
      `SELECT DISTINCT m.id FROM mensagens m
       LEFT JOIN conversas c ON c.id = m.conversa_id
       WHERE m.remetente_contato_id IN (${DO_CLIENTE.contatos})
          OR (c.tipo = 'dm' AND c.jid IN (${DO_CLIENTE.jids}))`
    )
    .all(clienteId, clienteId) as { id: number }[];
  return linhas.map((l) => l.id);
}

export function escopoCliente(db: Banco, clienteId: number): Escopo {
  const msgs = mensagensDoCliente(db, clienteId);
  const lista = msgs.length ? msgs.join(',') : '0';
  return {
    tipo: 'cliente',
    contagens: {
      mensagens: msgs.length,
      midias: n(db, `SELECT COUNT(*) AS n FROM midias WHERE mensagem_id IN (${lista})`),
      compromissos: n(db, 'SELECT COUNT(*) AS n FROM compromissos WHERE cliente_id = ?', clienteId),
      sinais: n(db, 'SELECT COUNT(*) AS n FROM sinais_potencial WHERE cliente_id = ?', clienteId),
      ajustes: n(db, 'SELECT COUNT(*) AS n FROM ajustes_cliente WHERE cliente_id = ?', clienteId),
      feedback: n(db, 'SELECT COUNT(*) AS n FROM feedback WHERE cliente_id = ?', clienteId),
      contatos: n(db, 'SELECT COUNT(*) AS n FROM contatos WHERE cliente_id = ?', clienteId)
    }
  };
}

export function escopoMidiasAntigas(db: Banco, agora: number): { escopo: Escopo; limite: number } {
  const limite = agora - RETENCAO_MIDIAS_DIAS * 86_400_000;
  return {
    limite,
    escopo: { tipo: 'midias_antigas', contagens: { midias: n(db, 'SELECT COUNT(*) AS n FROM midias WHERE criada_em < ?', limite) } }
  };
}

function criarPendente(db: Banco, tipo: 'cliente' | 'midias_antigas', clienteId: number | null, limite: number | null, agora: number): string {
  // Uma proposta nova substitui as anteriores do mesmo tipo e cliente.
  db.prepare('DELETE FROM apagar_pendente WHERE tipo = ? AND IFNULL(cliente_id, -1) = IFNULL(?, -1)').run(tipo, clienteId);
  for (;;) {
    const codigo = gerarCodigo();
    try {
      db.prepare('INSERT INTO apagar_pendente (codigo, tipo, cliente_id, limite_em, criado_em) VALUES (?, ?, ?, ?, ?)').run(codigo, tipo, clienteId, limite, agora);
      return codigo;
    } catch {
      /* codigo repetido: sorteia outro */
    }
  }
}

// ETAPA 1: nada e apagado.
export function proporApagarCliente(db: Banco, clienteId: number, agora: number): Proposta | null {
  const existe = db.prepare('SELECT 1 AS x FROM clientes WHERE id = ?').get(clienteId);
  if (!existe) return null;
  const codigo = criarPendente(db, 'cliente', clienteId, null, agora);
  return { codigo, escopo: escopoCliente(db, clienteId), frase: `confirmo apagar ${codigo}` };
}

export function proporLimparMidiasAntigas(db: Banco, agora: number): Proposta {
  const { escopo, limite } = escopoMidiasAntigas(db, agora);
  const codigo = criarPendente(db, 'midias_antigas', null, limite, agora);
  return { codigo, escopo, frase: `confirmo apagar ${codigo}` };
}

// Atalho do comando "apagar arquivos antigos": sem arquivo velho nao cria codigo nenhum.
export function proporLimparMidiasAntigasSeHouver(db: Banco, agora: number): Proposta | null {
  return (escopoMidiasAntigas(db, agora).escopo.contagens.midias ?? 0) === 0 ? null : proporLimparMidiasAntigas(db, agora);
}

export interface Origem {
  selfChat: boolean; // calculado por ehMensagemDoSelfChat(); NUNCA vindo do texto da mensagem
}

export type ResultadoConfirmacao =
  | { ok: true; escopo: Escopo; arquivosApagados: string[] }
  | { ok: false; motivo: 'nao_e_comando' | 'origem_nao_permitida' | 'codigo_invalido' | 'codigo_expirado' | 'bloqueado' };

const FRASE = /^confirmo apagar ([A-Z0-9]{6})$/i;

// ETAPA 2: so executa com origem self-chat, frase exata, codigo valido, nao expirado, no maximo MAX_ERROS_CODIGO erros.
export function confirmarApagar(db: Banco, texto: string, origem: Origem, agora: number, apagarArquivo: (caminho: string) => void): ResultadoConfirmacao {
  const m = FRASE.exec(texto.trim());
  if (!m) return { ok: false, motivo: 'nao_e_comando' };
  if (origem.selfChat !== true) return { ok: false, motivo: 'origem_nao_permitida' };
  const codigo = m[1]!.toUpperCase();
  const p = db.prepare('SELECT * FROM apagar_pendente WHERE codigo = ?').get(codigo) as
    | { codigo: string; tipo: 'cliente' | 'midias_antigas'; cliente_id: number | null; limite_em: number | null; criado_em: number; tentativas_erradas: number }
    | undefined;
  if (!p) {
    // Erro conta contra as propostas abertas: apos 3, todas caem e e preciso pedir de novo.
    db.prepare('UPDATE apagar_pendente SET tentativas_erradas = tentativas_erradas + 1').run();
    db.prepare('DELETE FROM apagar_pendente WHERE tentativas_erradas >= ?').run(MAX_ERROS_CODIGO);
    return { ok: false, motivo: 'codigo_invalido' };
  }
  if (p.tentativas_erradas >= MAX_ERROS_CODIGO) return { ok: false, motivo: 'bloqueado' };
  if (agora - p.criado_em > VALIDADE_CODIGO_MS) {
    db.prepare('DELETE FROM apagar_pendente WHERE codigo = ?').run(codigo);
    return { ok: false, motivo: 'codigo_expirado' };
  }
  // Uso unico: a proposta e consumida antes de executar.
  db.prepare('DELETE FROM apagar_pendente WHERE codigo = ?').run(codigo);
  return p.tipo === 'cliente' ? executarCliente(db, p.cliente_id!, agora, apagarArquivo) : executarMidiasAntigas(db, p.limite_em!, agora, apagarArquivo);
}

function auditar(db: Banco, escopo: Escopo, rotulo: string, agora: number): void {
  // Auditoria SEM conteudo: so o tipo e as contagens. O rotulo nunca leva nome nem texto.
  db.prepare('INSERT INTO auditoria_apagar (escopo, contagens, em) VALUES (?, ?, ?)').run(rotulo, JSON.stringify(escopo.contagens), agora);
}

function executarCliente(db: Banco, clienteId: number, agora: number, apagarArquivo: (c: string) => void): ResultadoConfirmacao {
  const escopo = escopoCliente(db, clienteId);
  const msgs = mensagensDoCliente(db, clienteId);
  const uid = (db.prepare('SELECT uid FROM clientes WHERE id = ?').get(clienteId) as { uid: string }).uid;
  const caminhos: string[] = [];
  db.exec('BEGIN');
  try {
    if (msgs.length) {
      const lista = msgs.join(',');
      // Midia deduplicada por hash: o MESMO arquivo pode estar ligado a mensagens de outros clientes. So sai (registro e arquivo) o que nenhuma
      // outra mensagem usa; se alguem ainda usa, o registro passa a pertencer a uma mensagem que fica.
      const midiaIds = (db.prepare(`SELECT midia_id AS id FROM mensagem_midia WHERE mensagem_id IN (${lista}) UNION SELECT id FROM midias WHERE mensagem_id IN (${lista})`).all() as { id: number }[]).map((r) => r.id);
      db.exec(`DELETE FROM mensagem_midia WHERE mensagem_id IN (${lista})`);
      db.exec(`DELETE FROM midias_origem WHERE mensagem_id IN (${lista})`);
      for (const id of midiaIds) {
        const resta = db.prepare('SELECT mensagem_id AS m FROM mensagem_midia WHERE midia_id = ? ORDER BY mensagem_id LIMIT 1').get(id) as { m: number } | undefined;
        if (resta) {
          db.prepare('UPDATE midias SET mensagem_id = ? WHERE id = ? AND mensagem_id IN (SELECT id FROM mensagens WHERE id IN (' + lista + '))').run(resta.m, id);
        } else {
          const m = db.prepare('SELECT caminho FROM midias WHERE id = ?').get(id) as { caminho: string } | undefined;
          if (m && m.caminho !== '') caminhos.push(m.caminho);
          db.prepare('DELETE FROM midias WHERE id = ?').run(id);
        }
      }
      db.exec(`DELETE FROM compromissos WHERE origem_mensagem_id IN (${lista})`);
      db.exec(`DELETE FROM sinais_potencial WHERE mensagem_id IN (${lista})`);
    }
    db.prepare('DELETE FROM compromissos WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM sinais_potencial WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM ajustes_cliente WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM feedback WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM duvidas WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM crm_propostas WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM crm_leads WHERE cliente_id = ?').run(clienteId);
    if (msgs.length) db.exec(`DELETE FROM mensagens WHERE id IN (${msgs.join(',')})`);
    // Conversas DM do cliente que ficaram vazias. O que foi enviado ao Hindsight sobre elas tambem tem de ser esquecido la (processo da memoria).
    const candidatas = (db.prepare(`SELECT id FROM conversas WHERE tipo = 'dm' AND jid IN (${DO_CLIENTE.jids})`).all(clienteId) as { id: number }[]).map((r) => r.id);
    db.prepare(
      `DELETE FROM conversas WHERE tipo = 'dm' AND jid IN (${DO_CLIENTE.jids}) AND id NOT IN (SELECT DISTINCT conversa_id FROM mensagens)`
    ).run(clienteId);
    for (const id of candidatas) {
      if (db.prepare('SELECT 1 AS x FROM conversas WHERE id = ?').get(id)) continue; // ainda existe (tem mensagens de outra pessoa): fica
      for (const d of db.prepare("SELECT document_id AS d FROM sync_hindsight WHERE tipo = 'conv' AND referencia LIKE ?").all(`conv:${id}:%`) as { d: string }[]) {
        db.prepare('INSERT OR IGNORE INTO memoria_apagar (document_id, pedido_em) VALUES (?, ?)').run(d.d, agora);
      }
      db.prepare("DELETE FROM sync_hindsight WHERE tipo = 'conv' AND referencia LIKE ?").run(`conv:${id}:%`);
      db.prepare("DELETE FROM fila WHERE tipo = 'retain' AND referencia LIKE ?").run(`conv:${id}:%`);
      // Controle da extracao (nada disso vive no Hindsight): sai junto, para nao reprocessar conversa que nao existe mais.
      db.prepare("DELETE FROM sync_hindsight WHERE tipo = 'ext' AND referencia LIKE ?").run(`ext:${id}:%`);
      db.prepare("DELETE FROM fila WHERE tipo = 'extrair' AND referencia LIKE ?").run(`ext:${id}:%`);
    }
    db.prepare(`DELETE FROM contato_jids WHERE contato_id IN (${DO_CLIENTE.contatos})`).run(clienteId);
    db.prepare('DELETE FROM contatos WHERE cliente_id = ?').run(clienteId);
    db.prepare('DELETE FROM clientes WHERE id = ?').run(clienteId);
    // Lista de esquecimento: SO o identificador aleatorio (uid), nunca nome nem texto. Reaplicada depois de restaurar um backup.
    db.prepare('INSERT OR REPLACE INTO esquecimento (cliente_uid, apagado_em) VALUES (?, ?)').run(uid, agora);
    auditar(db, escopo, 'cliente', agora);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  for (const c of caminhos) apagarArquivo(c); // arquivos so depois de o banco confirmar
  return { ok: true, escopo, arquivosApagados: caminhos };
}

function executarMidiasAntigas(db: Banco, limite: number, agora: number, apagarArquivo: (c: string) => void): ResultadoConfirmacao {
  const antigos = db.prepare('SELECT id, caminho FROM midias WHERE criada_em < ?').all(limite) as { id: number; caminho: string }[];
  const escopo: Escopo = { tipo: 'midias_antigas', contagens: { midias: antigos.length } };
  db.exec('BEGIN');
  try {
    // So os ARQUIVOS originais (audio/PDF) saem; o registro, o texto das mensagens e as transcricoes ficam (decisao do dono).
    db.prepare("UPDATE midias SET caminho = '' WHERE criada_em < ?").run(limite);
    auditar(db, escopo, 'midias_antigas', agora);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  const caminhos = antigos.map((a) => a.caminho).filter((c) => c !== '');
  for (const c of caminhos) apagarArquivo(c);
  return { ok: true, escopo, arquivosApagados: caminhos };
}

// Lista de esquecimento: o que o banco guarda mais o que o chamador guarda FORA do banco (arquivo proprio, que
// sobrevive a restauracoes de backups antigos). Devolve os uids a gravar no arquivo externo.
export function listaEsquecimento(db: Banco): string[] {
  return (db.prepare('SELECT cliente_uid FROM esquecimento ORDER BY apagado_em').all() as { cliente_uid: string }[]).map((r) => r.cliente_uid);
}

// Depois de restaurar um backup: reaplica a lista de esquecimento para o que foi apagado nao voltar.
// Usa o uid (aleatorio, nunca reutilizado), nao o numero do cliente, para nunca apagar um cliente novo por engano.
export function reaplicarEsquecimento(db: Banco, externos: readonly string[], agora: number, apagarArquivo: (c: string) => void = () => {}): string[] {
  const uids = new Set([...listaEsquecimento(db), ...externos]);
  const reaplicados: string[] = [];
  for (const uid of uids) {
    const c = db.prepare('SELECT id FROM clientes WHERE uid = ?').get(uid) as { id: number } | undefined;
    if (c) {
      executarCliente(db, c.id, agora, apagarArquivo);
      reaplicados.push(uid);
    } else {
      db.prepare('INSERT OR IGNORE INTO esquecimento (cliente_uid, apagado_em) VALUES (?, ?)').run(uid, agora);
    }
  }
  return reaplicados;
}
