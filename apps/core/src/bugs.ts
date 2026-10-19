// Relatorio de bugs de instalacao/uso (docs/plano/fase-1-instalador-e-bugs.md).
// Objetivo: quando algo falha na maquina do dono, fica um arquivo LIMPO de segredos que uma IA le, transforma em teste
// que falha, corrige, registra em LICOES.md e faz o commit. Os relatorios ficam em data/bugs/ (fora do git).
// Este e o UNICO arquivo do nucleo autorizado a gravar texto em disco (garantido por arquitetura.test.ts).
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const MAX_SAIDA = 4000; // so o final da saida: e onde costuma estar o erro

// Tira o que nao pode ir para um arquivo que sera lido por IA e, depois, citado em teste e commit.
export function sanitizar(texto: string): string {
  let t = texto;
  t = t.replace(/\b(sk|fc|ghp|gho|ghs|xox[abp])[-_][A-Za-z0-9_-]{16,}/g, '$1-***');
  t = t.replace(/github_pat_[A-Za-z0-9_]{20,}/g, 'github_pat_***');
  t = t.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer ***');
  t = t.replace(/(api[_-]?key|token|secret|senha|password|passwd|authorization)(["']?\s*[:=]\s*["']?)[^\s"',;]+/gi, '$1$2***');
  t = t.replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '<chave-privada>');
  t = t.replace(/\b\d{6,}(?::\d+)?@(s\.whatsapp\.net|lid|g\.us|broadcast|newsletter)\b/gi, '<jid>');
  t = t.replace(/\b\d+-\d+@g\.us\b/gi, '<jid>');
  t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email>');
  t = t.replace(/\+?\b\d{2}[\s-]?\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}\b/g, '<telefone>');
  t = t.replace(/\b[0-9a-fA-F]{40,}\b/g, '<hash-longo>');
  t = t.replace(/([A-Za-z]:\\Users\\)[^\\\s"']+/gi, '$1<usuario>');
  t = t.replace(/(\/home\/|\/Users\/)[^/\s"']+/g, '$1<usuario>');
  return t;
}

export interface DadosBug {
  etapa: string; // ex.: "docker", "git", "onboarding-ambiente"
  resumo: string; // uma frase
  comando?: string;
  saida?: string;
  codigoSaida?: number;
  ambiente?: Record<string, string>; // versoes, sistema... (sem segredos)
  origem: 'instalador' | 'onboarding' | 'nucleo';
}

export function slug(texto: string): string {
  const s = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (s || 'sem-nome').slice(0, 40);
}

function carimbo(agora: number): string {
  return new Date(agora).toISOString().replace(/[-:]/g, '').replace(/\..*$/, '').replace('T', '-');
}

export function nomeDoArquivo(d: DadosBug, agora: number): string {
  return `${carimbo(agora)}-${slug(d.etapa)}.md`;
}

export function montarRelatorio(d: DadosBug, agora: number): string {
  const saida = sanitizar(d.saida ?? '');
  const fim = saida.length > MAX_SAIDA ? `[...cortado...]\n${saida.slice(-MAX_SAIDA)}` : saida;
  const amb = Object.entries(d.ambiente ?? {}).map(([k, v]) => `- ${slug(k)}: ${sanitizar(String(v)).replace(/\s+/g, ' ').slice(0, 200)}`).join('\n') || '- (nao informado)';
  return [
    '---',
    'tipo: bug',
    `id: ${carimbo(agora)}-${slug(d.etapa)}`,
    `origem: ${d.origem}`,
    `etapa: ${slug(d.etapa)}`,
    'estado: aberto',
    `criado_em: ${new Date(agora).toISOString()}`,
    '---',
    '',
    `# Bug: ${sanitizar(d.resumo).replace(/\s+/g, ' ').slice(0, 300)}`,
    '',
    '## Ambiente',
    amb,
    '',
    '## Comando e saida (sem segredos)',
    d.comando ? `Comando: \`${sanitizar(d.comando).replace(/`/g, "'").slice(0, 300)}\`` : 'Comando: (nao informado)',
    d.codigoSaida !== undefined ? `Codigo de saida: ${d.codigoSaida}` : '',
    '',
    '```',
    fim,
    '```',
    '',
    '## O que a IA deve fazer (AGENTS.md, "Bugs de instalacao")',
    '1. Reproduzir com um teste automatizado que FALHA (tests/ ou apps/core/src). Se depender de hardware/login/WhatsApp real, escrever o passo em docs/plano/runbooks/08-testes-de-fumaca.md.',
    '2. Corrigir. Rodar TODOS os testes. 3. Atualizar instrucoes/runbook (Armadilhas). 4. Registrar em docs/plano/LICOES.md.',
    '5. Trocar `estado: aberto` por `estado: resolvido` neste arquivo e anotar o teste e o commit. 6. Commit e envio ao GitHub (peca ao dono o login se for preciso).',
    ''
  ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}

export function gravarRelatorio(dir: string, d: DadosBug, agora: number): string {
  mkdirSync(dir, { recursive: true });
  let nome = nomeDoArquivo(d, agora);
  const existentes = new Set(readdirSync(dir));
  for (let n = 2; existentes.has(nome); n++) nome = nomeDoArquivo(d, agora).replace(/\.md$/, `-${n}.md`);
  const caminho = join(dir, nome);
  writeFileSync(caminho, montarRelatorio(d, agora), { encoding: 'utf8', flag: 'wx' });
  return caminho;
}

export function listarAbertos(dir: string): string[] {
  try {
    return readdirSync(dir).filter((f) => f.endsWith('.md')).filter((f) => /^estado: aberto$/m.test(readFileSync(join(dir, f), 'utf8'))).sort();
  } catch { return []; }
}
