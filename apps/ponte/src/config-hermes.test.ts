// Gerador do config.yaml do Hermes (docs/plano/runbooks/03-hermes.md). Texto YAML simples: fuso, ferramentas travadas, memoria do Hindsight por MCP so de leitura.
import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarConfigHermes, extrairBlocoModelo, PLATAFORMAS_PROIBIDAS } from './config-hermes.ts';

const BASE = { banco: 'heimdall' };

test('fuso de Sao Paulo, ferramentas perigosas desligadas e a API do Hermes so com o minimo', () => {
  const y = gerarConfigHermes(BASE);
  assert.match(y, /^timezone: "America\/Sao_Paulo"$/m);
  for (const t of ['terminal', 'browser', 'code_execution', 'delegation', 'computer_use', 'web', 'search', 'image_gen', 'video_gen', 'tts', 'file', 'cronjob', 'connections', 'kanban', 'x_search']) assert.match(y, new RegExp(`^    - ${t}$`, 'm'), t);
  assert.match(y, /^platform_toolsets:\n  api_server:\n    - memory\n    - session_search$/m, 'lista branca da plataforma da API');
});

test('escritas do Hermes passam por aprovacao do dono (memoria e skills)', () => {
  const y = gerarConfigHermes(BASE);
  assert.match(y, /^memory:\n(  .*\n)*  write_approval: true$/m);
  assert.match(y, /^skills:\n(  .*\n)*  write_approval: true$/m);
});

test('Hindsight por MCP: banco na URL, so ferramentas de LEITURA (lista branca; nada que apague ou crie)', () => {
  const y = gerarConfigHermes({ banco: 'meu-banco', hindsightUrl: 'http://hindsight:8888' });
  assert.match(y, /^mcp_servers:\n  hindsight:\n    url: "http:\/\/hindsight:8888\/mcp\/meu-banco\/"$/m);
  assert.match(y, /^    tools:\n      include:\n        - recall\n        - reflect\n      prompts: false\n      resources: false$/m);
  assert.doesNotMatch(y, /delete|clear|create|retain|update/i, 'nenhum nome de ferramenta que escreva ou apague');
});

test('nenhuma plataforma de mensagens e ativada (o Hermes nao tem caminho de envio)', () => {
  const y = gerarConfigHermes(BASE);
  for (const p of PLATAFORMAS_PROIBIDAS) assert.doesNotMatch(y, new RegExp(`^\\s*(${p}):`, 'mi'), p);
  assert.doesNotMatch(y, /whatsapp|telegram|discord|slack/i);
});

test('entradas invalidas sao recusadas (banco e URL viram parte de uma URL e de um YAML)', () => {
  for (const banco of ['', 'a b', 'a/b', 'a"b', 'x\ny', '../x']) assert.throws(() => gerarConfigHermes({ banco }), /banco/i, JSON.stringify(banco));
  for (const u of ['', 'ftp://h', 'http://h:8888/\n', 'javascript:1']) assert.throws(() => gerarConfigHermes({ banco: 'ok', hindsightUrl: u }), /url/i, JSON.stringify(u));
  assert.throws(() => gerarConfigHermes({ banco: 'ok', fuso: 'Mars/Base' }), /fuso/i);
});

test('e estavel: mesma entrada, mesmo texto (retrato)', () => {
  assert.equal(gerarConfigHermes(BASE), gerarConfigHermes({ ...BASE }));
  assert.ok(gerarConfigHermes(BASE).endsWith('\n'));
});

test('prompt enxuto: sem regras de agente de programacao nem chamada extra de titulo (menos tokens por pedido)', () => {
  const y = gerarConfigHermes(BASE);
  // agent.execution_guidance e agent.tool_use_enforcement: docs/hermes-agent/user-guide/configuration.md ("Tool-Use Enforcement", "Execution-Discipline Guidance")
  assert.match(y, /^agent:\n(  .*\n)*  execution_guidance: false$/m);
  assert.match(y, /^agent:\n(  .*\n)*  tool_use_enforcement: false$/m);
  // auxiliary.title_generation.enabled: configuration.md ("Auxiliary Models")
  assert.match(y, /^auxiliary:\n  title_generation:\n    enabled: false$/m);
});

const ANTIGO = [
  '# Gerado pelo Heimdall', 'timezone: "America/Sao_Paulo"', 'agent:', '  disabled_toolsets:', '    - terminal', '  reasoning_effort: medium',
  '_config_version: 50', 'model:', '  provider: openai-codex', '  base_url: https://chatgpt.com/backend-api/codex', '  default: gpt-6.1-sol', ''
].join('\n');

test('o login do modelo (secao model:) sobrevive a regerar o config; o resto do arquivo antigo nao volta', () => {
  assert.equal(extrairBlocoModelo(ANTIGO), 'model:\n  provider: openai-codex\n  base_url: https://chatgpt.com/backend-api/codex\n  default: gpt-6.1-sol\n');
  const y = gerarConfigHermes({ ...BASE, configAtual: ANTIGO });
  assert.equal((y.match(/^model:$/gm) ?? []).length, 1);
  assert.match(y, /^model:\n  provider: openai-codex\n  base_url: https:\/\/chatgpt\.com\/backend-api\/codex\n  default: gpt-6\.1-sol\n/m);
  assert.doesNotMatch(y, /_config_version|reasoning_effort: medium/);
  assert.equal(gerarConfigHermes({ ...BASE, configAtual: y }), y, 'regerar sobre o proprio resultado nao muda nada');
});

test('sem config antigo ou sem secao model: nao inventa modelo', () => {
  assert.equal(extrairBlocoModelo('timezone: "x"\n'), null);
  assert.doesNotMatch(gerarConfigHermes(BASE), /^model:/m);
  assert.doesNotMatch(gerarConfigHermes({ ...BASE, configAtual: 'timezone: "x"\n' }), /^model:/m);
});

test('bloco model: suspeito e recusado (nada de tag YAML, comando ou linha fora do formato) em vez de copiado', () => {
  for (const ruim of ['model:\n  default: !!python/object/apply:os.system ["x"]\n', 'model:\n  default: $(rm -rf x)\n', 'model:\nplatforms:\n  whatsapp: {}\n', 'model:\n  a: b\n  c: d\ttab\n']) {
    assert.throws(() => gerarConfigHermes({ ...BASE, configAtual: ruim }), /model/i, JSON.stringify(ruim));
  }
});
