// Testes de arquitetura (E13): olham o CODIGO-FONTE para garantir que nao nasca um segundo caminho de envio,
// de rede ou de apagamento fora dos arquivos autorizados. Se alguem (pessoa ou IA) abrir uma via nova, aqui falha.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url)); // .pathname vira "/C:/..." no Windows (LICOES.md, 2026-10-19)
function listar(pasta: string, prefixo = ''): string[] {
  return readdirSync(join(DIR, pasta), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listar(join(pasta, e.name), `${prefixo}${e.name}/`) : e.name.endsWith('.ts') && !e.name.endsWith('.test.ts') ? [`${prefixo}${e.name}`] : []
  );
}
const fontes = listar('.');
// Remove comentarios de linha (cuidado com "http://" dentro de texto) e de bloco antes de procurar padroes proibidos.
const codigo = (f: string): string => readFileSync(join(DIR, f), 'utf8').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1').replace(/\/\*[\s\S]*?\*\//g, '');

function arquivosCom(padrao: RegExp): string[] {
  return fontes.filter((f) => padrao.test(codigo(f)));
}

test('existem fontes para vigiar (o teste nao passa por falta de arquivos)', () => {
  assert.ok(fontes.length >= 12, fontes.join(','));
  assert.ok(fontes.includes('envio.ts') && fontes.includes('apagar.ts'));
});

test('o transporte so e chamado em envio.ts (nenhum outro arquivo envia)', () => {
  assert.deepEqual(arquivosCom(/\.enviar\s*\(/), ['envio.ts']);
  assert.deepEqual(arquivosCom(/sendMessage|sendPresenceUpdate|sendReceipt|relayMessage|groupParticipantsUpdate/), []);
});

test('rede: so o servidor LOCAL da tela usa node:http, e escuta apenas em 127.0.0.1', () => {
  assert.deepEqual(arquivosCom(/node:http\b|node:https|node:dgram|node:tls|from 'node:net'/).sort(), ['onboarding/servidor.ts']);
  // O unico "fetch(" e o JavaScript do NAVEGADOR (texto em recursos.ts), que so chama o proprio servidor (enderecos relativos;
  // servidor.test.ts garante que nao ha nenhum http(s):// nele).
  assert.deepEqual(arquivosCom(/\bfetch\s*\(|XMLHttpRequest|WebSocket|\.connect\s*\(|createConnection/), ['onboarding/recursos.ts']);
  const srv = codigo('onboarding/servidor.ts');
  assert.match(srv, /\.listen\(porta, '127\.0\.0\.1'/);
  assert.doesNotMatch(srv, /0\.0\.0\.0|'::'|\.listen\(\s*porta\s*\)/);
});

test('processos externos: so ambiente.ts (comandos fixos); nunca eval', () => {
  assert.deepEqual(arquivosCom(/node:child_process|\bexecSync\b|\bexecFile(Sync)?\b|\bspawn(Sync)?\s*\(|\bfork\s*\(/), ['onboarding/ambiente.ts']);
  assert.deepEqual(arquivosCom(/\beval\s*\(|new Function\s*\(/), []);
});

test('a tela local nao tem caminho para envio, apagamento nem aprendizado', () => {
  for (const f of ['onboarding/servidor.ts', 'onboarding/ambiente.ts', 'onboarding/recursos.ts', 'onboarding/passos.ts', 'onboarding/painel.ts']) {
    assert.doesNotMatch(codigo(f), /from '\.\.?\/(\.\.\/)?(envio|apagar|aprendizado|backup)\.ts'/, f);
  }
});

test('backup-copia.ts so copia: nao importa o porteiro de apagar (e por isso a tela e a ponte podem usa-lo)', () => {
  assert.doesNotMatch(codigo('backup-copia.ts'), /from '\.\/(apagar|envio|aprendizado|backup)\.ts'/);
});

test('DELETE FROM e DROP so aparecem em apagar.ts (apagar dados tem um unico porteiro)', () => {
  assert.deepEqual(arquivosCom(/\bDELETE\s+FROM\b/i), ['apagar.ts']);
  assert.deepEqual(arquivosCom(/\bDROP\s+(TABLE|INDEX|VIEW)\b/i), []);
  assert.deepEqual(arquivosCom(/\bTRUNCATE\b/i), []);
});

test('o MCP nao importa o porteiro de apagar nem o de envio', () => {
  const mcp = codigo('mcp-contrato.ts');
  assert.doesNotMatch(mcp, /from '\.\/(apagar|envio)\.ts'/);
});

test('gravar texto em disco: so bugs.ts (relatorios sem segredos); nunca apagar/renomear arquivos', () => {
  assert.deepEqual(arquivosCom(/writeFileSync|appendFileSync|createWriteStream/), ['bugs.ts']);
  assert.deepEqual(arquivosCom(/\bunlinkSync\b|\brmSync\b|\brenameSync\b|\brmdirSync\b|fs\.promises|node:fs\/promises/), []);
});

test('nenhum segredo, token ou chave fixos no codigo', () => {
  assert.deepEqual(arquivosCom(/sk-[A-Za-z0-9_-]{20,}|fc-[a-f0-9]{24,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/), []);
});
