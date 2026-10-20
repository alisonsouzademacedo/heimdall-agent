// Regras da ponte, lendo o codigo-fonte: so hermes.ts usa rede (e so para o proprio computador); nada de WhatsApp, de envio direto ou de programas externos;
// as respostas ao dono saem so pela caixa de saida (saida.ts); apagar so pelo porteiro do nucleo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const fontes = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const sem = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/.*$/gm, '$1');
const codigo = (f: string) => sem(readFileSync(join(DIR, f), 'utf8'));

test('ha fontes para conferir', () => assert.ok(fontes.length >= 4, fontes.join(',')));
test('rede (fetch) so em hermes.ts, e o endereco e travado em 127.0.0.1/localhost', () => {
  for (const f of fontes) if (f !== 'hermes.ts') assert.doesNotMatch(codigo(f), /\bfetch\b|node:http|node:https|node:net|WebSocket|XMLHttpRequest/, f);
  assert.match(codigo('hermes.ts'), /new Set\(\['127\.0\.0\.1', 'localhost'\]\)/);
});
test('hermes.ts so chama /v1/chat/completions (POST) e /health (GET)', () => {
  const c = codigo('hermes.ts');
  assert.doesNotMatch(c, /['"](DELETE|PUT|PATCH)['"]/);
  assert.doesNotMatch(c, /\/api\/(jobs|sessions)|\/v1\/(runs|responses)/, 'nada de criar tarefas, apagar sessoes ou rodar runs');
});
test('sem WhatsApp, sem envio direto (so a caixa de saida), sem programas externos', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /child_process|\bspawn\(|execSync|spawnSync|baileys|sendMessage|criarEnvio|criarTransporte/i, f);
});
test('a ponte nao apaga arquivos nem linhas por conta propria (apagar e do porteiro do nucleo)', () => {
  for (const f of fontes) assert.doesNotMatch(codigo(f), /\bunlink|\brm(Sync)?\(|DELETE\s+FROM|DROP\s+TABLE|writeFile/i, f);
});
test('config do Hermes nunca ativa plataforma de mensagens', () => {
  const c = codigo('config-hermes.ts');
  assert.match(c, /PLATAFORMAS_PROIBIDAS/);
  assert.doesNotMatch(c.replace(/PLATAFORMAS_PROIBIDAS[\s\S]*?\] as const;/, ''), /whatsapp|telegram|discord|slack/i);
});
