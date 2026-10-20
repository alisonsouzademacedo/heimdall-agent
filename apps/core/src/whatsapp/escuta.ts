// A escuta: recebe o que o Baileys entrega (mensagens, atualizacoes, historico), traduz e GRAVA no acervo. So le e grava: nao existe aqui
// nenhum caminho de envio (regra 1; o unico envio do Heimdall e envio.ts). Idempotente: o mesmo evento duas vezes nao muda nada.
// Midia (audio e PDF): a mensagem, o descritor para baixar e o trabalho "baixar_midia" entram NA MESMA operacao; a escuta nunca espera o processamento.
import type { Banco } from '../db.ts';
import type { IdentidadeDono } from '../envio.ts';
import type { OrigemEvento } from '../ingestao.ts';
import { registrarMensagem, registrarEdicao, registrarApagada, idDaMensagem, resolverContato } from '../ingestao.ts';
import { normalizarJid, tipoDoJid } from '../jid.ts';
import { traduzirMensagem, traduzirAtualizacao, type MensagemBaileys, type AtualizacaoBaileys, type Acao } from './traduzir.ts';

export interface Resumo {
  inseridas: number;
  duplicadas: number;
  editadas: number;
  apagadas: number;
  naoEncontradas: number;
  midiasEnfileiradas: number;
  falhas: number;
  ignoradas: { total: number; porMotivo: Record<string, number> };
  ultimaMensagemEm: number | null;
}

export interface Escuta {
  mensagens(msgs: MensagemBaileys[], origem: OrigemEvento, serializar?: (m: MensagemBaileys) => string): Resumo;
  atualizacoes(ups: AtualizacaoBaileys[]): Resumo;
  /** Pares PN<->LID que o Baileys aprendeu (lid-mapping.update, messaging-history.set): ligam as duas formas ao MESMO contato. */
  mapeamentos(pares: { pn?: string | null; lid?: string | null }[]): number;
  /** Nomes da agenda/historico: preenchem so contatos que JA existem e ainda nao tem nome. */
  contatos(lista: { id?: string | null; name?: string | null; notify?: string | null }[]): number;
  /** Nomes de grupos (chats do historico). */
  conversas(lista: { id?: string | null; name?: string | null }[]): number;
  totais(): Resumo;
}

const vazio = (): Resumo => ({ inseridas: 0, duplicadas: 0, editadas: 0, apagadas: 0, naoEncontradas: 0, midiasEnfileiradas: 0, falhas: 0, ignoradas: { total: 0, porMotivo: {} }, ultimaMensagemEm: null });

function somar(a: Resumo, b: Resumo): void {
  a.inseridas += b.inseridas; a.duplicadas += b.duplicadas; a.editadas += b.editadas; a.apagadas += b.apagadas;
  a.naoEncontradas += b.naoEncontradas; a.midiasEnfileiradas += b.midiasEnfileiradas; a.falhas += b.falhas;
  a.ignoradas.total += b.ignoradas.total;
  for (const [k, v] of Object.entries(b.ignoradas.porMotivo)) a.ignoradas.porMotivo[k] = (a.ignoradas.porMotivo[k] ?? 0) + v;
  if (b.ultimaMensagemEm !== null && (a.ultimaMensagemEm === null || b.ultimaMensagemEm > a.ultimaMensagemEm)) a.ultimaMensagemEm = b.ultimaMensagemEm;
}

export function criarEscuta(db: Banco, dono: IdentidadeDono, opcoes: { agora?: () => number } = {}): Escuta {
  const agora = opcoes.agora ?? Date.now;
  const acumulado = vazio();
  let n = 0;

  const ignorar = (r: Resumo, motivo: string) => { r.ignoradas.total++; r.ignoradas.porMotivo[motivo] = (r.ignoradas.porMotivo[motivo] ?? 0) + 1; };

  // Cada item em seu proprio SAVEPOINT: se um falhar, so ele e desfeito e o lote continua.
  function emSavepoint<T>(r: Resumo, f: () => T): T | undefined {
    const nome = `sp_${++n}`;
    db.exec(`SAVEPOINT ${nome}`);
    try {
      const v = f();
      db.exec(`RELEASE ${nome}`);
      return v;
    } catch {
      db.exec(`ROLLBACK TO ${nome}`);
      db.exec(`RELEASE ${nome}`);
      r.falhas++;
      return undefined;
    }
  }

  function aplicar(a: Acao, r: Resumo, bruto?: MensagemBaileys, serializar?: (m: MensagemBaileys) => string): void {
    if (a.tipo === 'ignorar') { ignorar(r, a.motivo); return; }
    if (a.tipo === 'registrar') {
      // Os contadores so mudam DEPOIS que o savepoint foi liberado: se a gravacao falhar, nada fica contado.
      const res = emSavepoint(r, () => {
        const status = registrarMensagem(db, a.evento, dono);
        if (status !== 'inserida') return { status, midia: false };
        if (a.midia) {
          const id = idDaMensagem(db, a.evento.remoteJid, a.evento.waMsgId);
          if (id === undefined) throw new Error('mensagem recem-gravada nao encontrada');
          const descritor = bruto ? (serializar ? serializar(bruto) : JSON.stringify({ key: bruto.key, message: bruto.message })) : '{}';
          db.prepare('INSERT OR IGNORE INTO midias_origem (mensagem_id, descritor) VALUES (?, ?)').run(id, descritor);
          const t = agora();
          db.prepare("INSERT OR IGNORE INTO fila (tipo, referencia, proximo_em, criado_em, atualizado_em) VALUES ('baixar_midia', ?, ?, ?, ?)").run(String(id), t, t, t);
        }
        return { status, midia: a.midia !== undefined };
      });
      if (!res) return;
      if (res.status === 'jid_invalido') { ignorar(r, 'conversa fora do escopo'); return; }
      if (res.status === 'duplicada') { r.duplicadas++; return; }
      r.inseridas++;
      if (res.midia) r.midiasEnfileiradas++;
      if (r.ultimaMensagemEm === null || a.evento.quandoMs > r.ultimaMensagemEm) r.ultimaMensagemEm = a.evento.quandoMs;
      return;
    }
    const resultado = emSavepoint(r, () => (a.tipo === 'editar' ? registrarEdicao(db, a.remoteJid, a.waMsgId, a.novoTexto) : registrarApagada(db, a.remoteJid, a.waMsgId)));
    if (resultado === 'alterada') { if (a.tipo === 'editar') r.editadas++; else r.apagadas++; }
    else if (resultado === 'nao_encontrada') r.naoEncontradas++;
  }

  function lote(fn: (r: Resumo) => void): Resumo {
    const r = vazio();
    db.exec('SAVEPOINT lote');
    try { fn(r); db.exec('RELEASE lote'); } catch (e) { db.exec('ROLLBACK TO lote'); db.exec('RELEASE lote'); throw e; }
    somar(acumulado, r);
    return r;
  }

  return {
    mensagens(msgs, origem, serializar) {
      return lote((r) => { for (const m of msgs) for (const a of traduzirMensagem(m, origem)) aplicar(a, r, m, serializar); });
    },
    atualizacoes(ups) {
      return lote((r) => { for (const u of ups) for (const a of traduzirAtualizacao(u)) aplicar(a, r); });
    },
    mapeamentos(pares) {
      let ligados = 0;
      for (const p of pares) {
        const pn = p.pn ? normalizarJid(p.pn) : null;
        const lid = p.lid ? normalizarJid(p.lid) : null;
        if (!pn || !lid || tipoDoJid(pn) !== 'pn' || tipoDoJid(lid) !== 'lid') continue;
        const r = vazio();
        if (emSavepoint(r, () => resolverContato(db, lid, pn)) !== undefined) ligados++;
      }
      return ligados;
    },
    contatos(lista) {
      let n2 = 0;
      for (const c of lista) {
        const jid = c.id ? normalizarJid(c.id) : null;
        const nome = (c.name ?? c.notify ?? '').trim();
        if (!jid || !nome) continue;
        const r = db.prepare('UPDATE contatos SET nome = ? WHERE nome IS NULL AND id = (SELECT contato_id FROM contato_jids WHERE jid = ?)').run(nome, jid);
        n2 += Number(r.changes);
      }
      return n2;
    },
    conversas(lista) {
      let n2 = 0;
      for (const c of lista) {
        const jid = c.id ? normalizarJid(c.id) : null;
        const nome = (c.name ?? '').trim();
        if (!jid || !nome || tipoDoJid(jid) !== 'grupo') continue;
        const r = db.prepare("UPDATE conversas SET nome = ? WHERE jid = ? AND tipo = 'grupo'").run(nome, jid);
        n2 += Number(r.changes);
      }
      return n2;
    },
    totais() {
      return { ...acumulado, ignoradas: { total: acumulado.ignoradas.total, porMotivo: { ...acumulado.ignoradas.porMotivo } } };
    }
  };
}
