// Pipeline de midia (audio e PDF): baixar -> transcrever | converter PDF -> texto na mensagem. As partes que tocam o mundo de fora
// entram como PORTAS (Baileys para baixar, disco para gravar, Docker para transcrever): o nucleo continua sem dependencias nem arquivos proprios.
// O mesmo arquivo reenviado em outras conversas e guardado e processado UMA vez (sha256); todas as mensagens ligadas a ele recebem o texto.
import { createHash } from 'node:crypto';
import type { Banco } from './db.ts';
import { concluir, enfileirar, falhar, type Trabalho } from './fila.ts';

export class FalhaDefinitiva extends Error {
  constructor(motivo: string) { super(motivo); this.name = 'FalhaDefinitiva'; }
}

export interface PortasBaixar {
  /** Baixa e decifra a midia a partir do descritor guardado (no Baileys: downloadMediaMessage). */
  baixar(descritor: string): Promise<Uint8Array>;
  /** Grava o arquivo (nome pelo hash) e devolve o caminho. */
  gravarMidia(sha256: string, extensao: string, bytes: Uint8Array): Promise<string>;
}

export interface PortasTexto {
  transcrever(caminho: string): Promise<{ texto: string }>;
  converterPdf(caminho: string): Promise<{ markdown: string }>;
}

export const LIMITE_BYTES = { audio: 100 * 1024 * 1024, pdf: 50 * 1024 * 1024 } as const;
export type Resultado = 'ok' | 'reagendada' | 'abandonada';

const mensagemDeErro = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export async function processarBaixarMidia(db: Banco, job: Trabalho, portas: PortasBaixar, agora: number = Date.now()): Promise<Resultado> {
  const mensagemId = Number(job.referencia);
  const m = db.prepare("SELECT id, tipo FROM mensagens WHERE id = ? AND tipo IN ('audio','pdf')").get(mensagemId) as { id: number; tipo: 'audio' | 'pdf' } | undefined;
  const origem = m ? (db.prepare('SELECT descritor FROM midias_origem WHERE mensagem_id = ?').get(mensagemId) as { descritor: string } | undefined) : undefined;
  if (!m || !origem) return falhar(db, job.id, 'sem_descritor', agora, { definitiva: true });
  if (db.prepare('SELECT 1 AS x FROM mensagem_midia WHERE mensagem_id = ?').get(mensagemId)) { concluir(db, job.id, agora); return 'ok'; }

  let bytes: Uint8Array;
  try {
    bytes = await portas.baixar(origem.descritor);
  } catch (e) {
    return falhar(db, job.id, mensagemDeErro(e), agora);
  }
  if (!bytes || bytes.byteLength === 0) return falhar(db, job.id, 'arquivo_vazio', agora, { definitiva: true });
  if (bytes.byteLength > LIMITE_BYTES[m.tipo]) return falhar(db, job.id, 'arquivo_grande', agora, { definitiva: true });
  const hash = createHash('sha256').update(bytes).digest('hex');

  try {
    const existente = db.prepare('SELECT id FROM midias WHERE sha256 = ?').get(hash) as { id: number } | undefined;
    let midiaId: number;
    let caminho: string | null = null;
    if (existente) midiaId = existente.id;
    else caminho = await portas.gravarMidia(hash, m.tipo === 'pdf' ? 'pdf' : 'ogg', bytes);

    db.exec('SAVEPOINT baixar');
    try {
      if (!existente) {
        midiaId = Number(db.prepare('INSERT INTO midias (mensagem_id, tipo, caminho, sha256, bytes, criada_em) VALUES (?, ?, ?, ?, ?, ?)').run(m.id, m.tipo, caminho!, hash, bytes.byteLength, agora).lastInsertRowid);
        enfileirar(db, m.tipo === 'pdf' ? 'converter_pdf' : 'transcrever', String(midiaId), agora);
      } else {
        midiaId = existente.id;
        // Arquivo ja conhecido: se alguma mensagem ligada a ele ja tem texto, esta nasce com o mesmo texto (sem novo processamento).
        const pronto = db.prepare('SELECT t.texto AS texto FROM mensagem_midia l JOIN mensagens t ON t.id = l.mensagem_id WHERE l.midia_id = ? AND t.texto IS NOT NULL LIMIT 1').get(midiaId) as { texto: string } | undefined;
        if (pronto) db.prepare('UPDATE mensagens SET texto = ? WHERE id = ? AND texto IS NULL').run(pronto.texto, m.id);
      }
      db.prepare('INSERT OR IGNORE INTO mensagem_midia (mensagem_id, midia_id) VALUES (?, ?)').run(m.id, midiaId!);
      db.exec('RELEASE baixar');
    } catch (e) {
      db.exec('ROLLBACK TO baixar'); db.exec('RELEASE baixar');
      throw e;
    }
  } catch (e) {
    return falhar(db, job.id, mensagemDeErro(e), agora);
  }
  concluir(db, job.id, agora);
  return 'ok';
}

export async function processarTexto(db: Banco, job: Trabalho, portas: PortasTexto, agora: number = Date.now()): Promise<Resultado> {
  const midia = db.prepare('SELECT id, tipo, caminho FROM midias WHERE id = ?').get(Number(job.referencia)) as { id: number; tipo: 'audio' | 'pdf'; caminho: string } | undefined;
  if (!midia) return falhar(db, job.id, 'midia_inexistente', agora, { definitiva: true });
  let texto: string;
  try {
    texto = midia.tipo === 'pdf' ? (await portas.converterPdf(midia.caminho)).markdown : (await portas.transcrever(midia.caminho)).texto;
  } catch (e) {
    return falhar(db, job.id, mensagemDeErro(e), agora, { definitiva: e instanceof FalhaDefinitiva });
  }
  texto = texto.trim();
  // PDF escaneado (so imagem) sai vazio: nao adianta repetir. Audio sem fala vira texto vazio (processado), nunca "pendente".
  if (midia.tipo === 'pdf' && texto === '') return falhar(db, job.id, 'sem_texto', agora, { definitiva: true });
  db.prepare('UPDATE mensagens SET texto = ? WHERE texto IS NULL AND id IN (SELECT mensagem_id FROM mensagem_midia WHERE midia_id = ?)').run(texto, midia.id);
  concluir(db, job.id, agora);
  return 'ok';
}
