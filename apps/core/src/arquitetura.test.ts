// Testes de arquitetura (E13): olham o CODIGO-FONTE para garantir que nao nasca um segundo caminho de envio,
// de rede ou de apagamento fora dos arquivos autorizados. Se alguem (pessoa ou IA) abrir uma via nova, aqui falha.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = new URL('.', import.meta.url).pathname;
const fontes = readdirSync(DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const codigo = (f: string): string => readFileSync(join(DIR, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

function arquivosCom(padrao: RegExp): string[] {
  return fontes.filter((f) => padrao.test(codigo(f)));
}

test('existem fontes para vigiar (o teste nao passa por falta de arquivos)', () => {
  assert.ok(fontes.length >= 8, fontes.join(','));
  assert.ok(fontes.includes('envio.ts') && fontes.includes('apagar.ts'));
});

test('o transporte so e chamado em envio.ts (nenhum outro arquivo envia)', () => {
  assert.deepEqual(arquivosCom(/\.enviar\s*\(/), ['envio.ts']);
  assert.deepEqual(arquivosCom(/sendMessage|sendPresenceUpdate|sendReceipt|relayMessage|groupParticipantsUpdate/), []);
});

test('o nucleo nao abre rede, processos nem eval fora de arquivos autorizados (hoje: nenhum)', () => {
  assert.deepEqual(arquivosCom(/\bfetch\s*\(|node:http|node:https|node:net|node:dgram|node:tls|XMLHttpRequest|WebSocket/), []);
  assert.deepEqual(arquivosCom(/node:child_process|\bexecSync\b|\bspawn\s*\(|\beval\s*\(|new Function\s*\(/), []);
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

test('nenhum arquivo grava texto direto no disco (so o backup copia o banco)', () => {
  assert.deepEqual(arquivosCom(/writeFileSync|appendFileSync|createWriteStream|\bunlinkSync\b|\brmSync\b|\brenameSync\b/), []);
});

test('nenhum segredo, token ou chave fixos no codigo', () => {
  assert.deepEqual(arquivosCom(/sk-[A-Za-z0-9_-]{20,}|fc-[a-f0-9]{24,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/), []);
});
