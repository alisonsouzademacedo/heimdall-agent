// Regras do processo da memoria, lendo o codigo-fonte: so o hindsight.ts usa rede (e so para o proprio computador); sem WhatsApp,
// sem programas externos, sem apagar nada (nem arquivos, nem linhas, nem memoria do Hindsight).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const fontes = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const sem = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/.*$/gm, '$1');
const codigo = (f: string) => sem(readFileSync(join(DIR, f), 'utf8'));

test('ha fontes para conferir', () => assert.ok(fontes.length >= 3, fontes.join(',')));
test('rede (fetch) so em hindsight.ts', () => {
  for (const f of fontes) if (f !== 'hindsight.ts') assert.doesNotMatch(codigo(f), /\bfetch\b|node:http|node:https|node:net|WebSocket|XMLHttpRequest/, f);
});
test('hindsight.ts: so GET, POST e UM DELETE de documento, e o endereco e travado em 127.0.0.1/localhost', () => {
  const c = codigo('hindsight.ts');
  assert.doesNotMatch(c, /['"](PUT|PATCH)['"]/);
  // Unico DELETE: UM documento de conversa nosso (conv:<n>:<dia>), para esquecer um cliente apagado; nada de memories, clear nem do banco inteiro.
  assert.equal([...c.matchAll(/'DELETE'/g)].length, 2, 'o DELETE aparece so no tipo do metodo e na unica chamada');
  assert.match(c, /pedir\('DELETE', `\/v1\/default\/banks\/\$\{banco\}\/documents\/\$\{encodeURIComponent\(documentId\)\}`\)/);
  assert.match(c, /\^conv:\\d\+:\\d\{4\}-\\d\{2\}-\\d\{2\}\$/, 'o id do documento e validado antes de sair');
  assert.match(c, /\['127\.0\.0\.1', 'localhost'\]/);
  assert.doesNotMatch(c, /\/memories\/\$\{|\/clear|\/banks\/\$\{banco\}['"`]\s*[,)]/, 'nenhum caminho de apagar memorias soltas ou o banco');
});
test('sem programas externos, sem WhatsApp, sem envio de mensagem', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /child_process|\bspawn\(|execSync|spawnSync|baileys|sendMessage|criarEnvio/i, f);
});
test('nunca apaga nem grava arquivos', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /\bunlink|\brm(Sync)?\(|DELETE\s+FROM|DROP\s+TABLE|writeFile/i, f);
});
