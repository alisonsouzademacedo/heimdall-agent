// Fumaca do executor com o DOCKER DE VERDADE (chamada por tests/infra/smoke_executor.sh, nunca pelo npm test): cria um acervo temporario,
// enfileira um "audio" (tom sintetico) e um PDF sintetico, roda os ciclos do executor com as portas reais e confere o resultado.
// Uso: node apps/trabalhos/scripts/fumaca.ts <pasta-temporaria>
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { abrirBanco, migrar } from '../../core/src/db.ts';
import { enfileirar, resumoDaFila } from '../../core/src/fila.ts';
import { criarPortasDocker } from '../src/portas.ts';
import { rodarCiclo } from '../src/ciclo.ts';

const tmp = resolve(process.argv[2]!);
const raiz = process.cwd();
const midias = join(tmp, 'midias');
mkdirSync(midias, { recursive: true });

function tom(): Buffer {
  const n = 32000; const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(16000, 24); b.writeUInt32LE(32000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 440 * i) / 16000)), 44 + i * 2);
  return b;
}
function pdf(texto: string): Buffer {
  const corpo = `BT /F1 24 Tf 72 700 Td (${texto}) Tj ET`;
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${corpo.length} >>\nstream\n${corpo}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let s = '%PDF-1.4\n'; const off: number[] = [];
  objs.forEach((o, i) => { off.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = s.length;
  s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return Buffer.from(s, 'latin1');
}

const db = abrirBanco(join(tmp, 'acervo.sqlite')); migrar(db);
db.exec("INSERT INTO conversas (jid, tipo) VALUES ('5511999990001@s.whatsapp.net','dm')");
const itens: [string, 'audio' | 'pdf', Buffer, string][] = [['a1', 'audio', tom(), 'ogg'], ['p1', 'pdf', pdf('Ata da reuniao de segunda'), 'pdf']];
for (const [i, [id, tipo, bytes, ext]] of itens.entries()) {
  const sha = createHash('sha256').update(bytes).digest('hex');
  writeFileSync(join(midias, `${sha}.${ext}`), bytes);
  db.prepare("INSERT INTO mensagens (conversa_id, wa_msg_id, de_mim, enviada_em, tipo, origem_evento) VALUES (1, ?, 0, 1, ?, 'notify')").run(id, tipo);
  db.prepare('INSERT INTO midias (mensagem_id, tipo, caminho, sha256, bytes, criada_em) VALUES (?, ?, ?, ?, ?, 1)').run(i + 1, tipo, `data/midias/${sha}.${ext}`, sha, bytes.length);
  db.prepare('INSERT INTO mensagem_midia (mensagem_id, midia_id) VALUES (?, ?)').run(i + 1, i + 1);
  enfileirar(db, tipo === 'pdf' ? 'converter_pdf' : 'transcrever', String(i + 1), Date.now());
}

const portas = criarPortasDocker({ composeFile: join(raiz, 'infra', 'compose', 'docker-compose.yml'), envFile: join(tmp, 'ambiente.env'), pastaDados: tmp, timeoutAudioMs: 300_000, timeoutPdfMs: 120_000 });
const r1 = await rodarCiclo(db, portas); const r2 = await rodarCiclo(db, portas); const r3 = await rodarCiclo(db, portas);
const textos = db.prepare('SELECT wa_msg_id, texto FROM mensagens ORDER BY id').all() as { wa_msg_id: string; texto: string | null }[];
const ok = r1 === 'ok' && r2 === 'ok' && r3 === 'vazio' && textos[0]!.texto !== null && (textos[1]!.texto ?? '').includes('Ata da reuniao de segunda') && resumoDaFila(db).ok === 2;
console.log(JSON.stringify({ ciclos: [r1, r2, r3], audio_texto_nao_nulo: textos[0]!.texto !== null, pdf_ok: (textos[1]!.texto ?? '').includes('Ata da reuniao de segunda'), fila: resumoDaFila(db) }));
db.close();
process.exit(ok ? 0 : 1);
