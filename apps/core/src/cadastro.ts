// Cadastro da equipe INTERNA com numero inteligente. Nao consulta o WhatsApp: so normaliza o que o dono digitou e casa com os contatos que o
// acervo ja tem (contato_jids). O nono digito brasileiro nao esta documentado em docs/baileys/ (ver PROGRESS.md, 2026-10-19): por isso as DUAS formas.
// O DDD 55 (Santa Maria) nao se confunde com o codigo do pais: quem decide e o NUMERO DE DIGITOS (10 ou 11 = nacional; 12 ou 13 = com 55).
import type { Banco } from './db.ts';

export type Normalizado = { ok: true; variantes: string[]; exibir: string[]; ddd: string } | { ok: false; motivo: string };

const formatar = (ddd: string, n: string): string => `+55 ${ddd} ${n.slice(0, n.length - 4)}-${n.slice(-4)}`;
// Mostra so o final do numero (a tela e os avisos nunca precisam do numero inteiro).
const mascarar = (digitos: string): string => {
  const ddd = digitos.slice(2, 4), num = digitos.slice(4);
  return `+55 ${ddd} ${'*'.repeat(Math.max(0, num.length - 4))}-${num.slice(-4)}`;
};

export function normalizarTelefone(entrada: string): Normalizado {
  const bruto = entrada.trim();
  if (bruto === '') return { ok: false, motivo: 'Informe o telefone.' };
  const d = bruto.replace(/\D/g, '');
  if (d === '') return { ok: false, motivo: 'Digite os digitos do telefone.' };
  if (d.length > 13) return { ok: false, motivo: 'Numero longo demais: confira os digitos.' };
  let nacional: string;
  if (d.length === 12 || d.length === 13) {
    if (!d.startsWith('55')) return { ok: false, motivo: 'So aceito telefones do Brasil (codigo 55).' };
    nacional = d.slice(2);
  } else if (d.length === 10 || d.length === 11) nacional = d;
  else if (d.length === 8 || d.length === 9) return { ok: false, motivo: 'Faltou o DDD (dois digitos antes do numero).' };
  else return { ok: false, motivo: 'Numero curto: faltam digitos (DDD mais 8 ou 9 digitos).' };
  const ddd = nacional.slice(0, 2);
  if (Number(ddd) < 11) return { ok: false, motivo: `DDD invalido (${ddd}).` };
  const n = nacional.slice(2);
  let locais: string[];
  if (n.length === 9) {
    if (n[0] !== '9') return { ok: false, motivo: 'Celular de 9 digitos precisa comecar com 9.' };
    locais = [n, n.slice(1)]; // digitada primeiro; a outra e a forma antiga, sem o 9
  } else if (/^[6-9]/.test(n)) locais = [n, `9${n}`]; // 8 digitos de celular: a conta antiga no WhatsApp pode ter ou nao o 9
  else locais = [n]; // fixo (comeca em 2 a 5): nao ganha 9
  return { ok: true, ddd, variantes: locais.map((l) => `55${ddd}${l}`), exibir: locais.map((l) => formatar(ddd, l)) };
}

const limpar = (t: string, max: number): string => t.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export type ResultadoCadastro = { ok: true; achou: boolean; aviso?: string; exibir: string[] } | { ok: false; motivo: string };

export function cadastrarMembro(db: Banco, entrada: { nome: string; funcao: string; telefone: string }, agora: number): ResultadoCadastro {
  const nome = limpar(entrada.nome, 80);
  if (nome === '') return { ok: false, motivo: 'Informe o nome.' };
  const funcao = limpar(entrada.funcao, 80);
  const n = normalizarTelefone(entrada.telefone);
  if (!n.ok) return n;
  const jids = n.variantes.map((v) => `${v}@s.whatsapp.net`);
  let contatoId: number | null = null;
  for (const j of jids) {
    const r = db.prepare('SELECT contato_id AS id FROM contato_jids WHERE jid = ?').get(j) as { id: number } | undefined;
    if (r) { contatoId = r.id; break; }
  }
  const achou = contatoId !== null;
  if (contatoId !== null) {
    const c = db.prepare('SELECT cliente_id AS cliente FROM contatos WHERE id = ?').get(contatoId) as { cliente: number | null };
    if (c.cliente !== null) return { ok: false, motivo: 'Este numero e de um cliente; o cadastro aqui e so da equipe interna.' };
    if (db.prepare('SELECT 1 AS x FROM equipe WHERE contato_id = ?').get(contatoId)) return { ok: false, motivo: 'Este numero ja esta na equipe.' };
    db.prepare("UPDATE contatos SET papel = 'interno', papel_fonte = 'cadastro', nome = ? WHERE id = ?").run(nome, contatoId);
  } else {
    contatoId = Number(db.prepare("INSERT INTO contatos (nome, papel, papel_fonte) VALUES (?, 'interno', 'cadastro')").run(nome).lastInsertRowid);
  }
  for (const j of jids) db.prepare("INSERT OR IGNORE INTO contato_jids (jid, contato_id, tipo) VALUES (?, ?, 'pn')").run(j, contatoId);
  db.prepare('INSERT INTO equipe (nome, funcao, contato_id, telefone_digitos, achou_no_acervo, criado_em) VALUES (?, ?, ?, ?, ?, ?)').run(nome, funcao === '' ? null : funcao, contatoId, n.variantes[0]!, achou ? 1 : 0, agora);
  return achou
    ? { ok: true, achou: true, exibir: n.exibir }
    : { ok: true, achou: false, exibir: n.exibir, aviso: `Nao achei este numero entre os contatos importados do WhatsApp. Guardei as duas formas (${n.variantes.map(mascarar).join(' e ')}); quando essa pessoa conversar, as mensagens caem nela.` };
}

export interface MembroListado { id: number; nome: string; funcao: string; telefone: string; achou: boolean }
export function listarEquipe(db: Banco): MembroListado[] {
  return (db.prepare('SELECT id, nome, funcao, telefone_digitos AS tel, achou_no_acervo AS achou FROM equipe ORDER BY id').all() as { id: number; nome: string; funcao: string | null; tel: string; achou: number }[]).map((l) => {
    return { id: l.id, nome: l.nome, funcao: l.funcao ?? '', telefone: mascarar(l.tel), achou: l.achou === 1 };
  });
}
