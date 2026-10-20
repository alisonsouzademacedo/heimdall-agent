// Regras do executor, lendo o codigo-fonte: so ele roda programas, so o comando "docker" montado por docker.ts, sem rede propria e sem WhatsApp.
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
test('child_process so em executar.ts, e sempre sem shell', () => {
  for (const f of fontes) if (f !== 'executar.ts') assert.doesNotMatch(codigo(f), /child_process|\bspawn\(|\bexec\(|execSync|spawnSync/, f);
  const c = codigo('executar.ts');
  assert.match(c, /shell:\s*false/);
  assert.doesNotMatch(c, /shell:\s*true|\bexec\(|execSync/);
});
test('a palavra "docker" como programa so aparece em docker.ts', () => {
  for (const f of fontes) if (f !== 'docker.ts') assert.doesNotMatch(codigo(f), /['"]docker['"]/, f);
});
test('sem rede propria, sem WhatsApp, sem envio de mensagem', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /node:http|node:https|node:net|\bfetch\s*\(|baileys|sendMessage|criarEnvio/i, f);
});
test('o executor nunca apaga arquivos nem dados', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /\bunlink|\brm(Sync)?\(|DELETE\s+FROM|DROP\s+TABLE|writeFile/i, f);
});
