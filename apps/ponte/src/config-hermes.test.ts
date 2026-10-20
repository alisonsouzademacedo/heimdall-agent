// Gerador do config.yaml do Hermes (docs/plano/runbooks/03-hermes.md). Texto YAML simples: fuso, ferramentas travadas, memoria do Hindsight por MCP so de leitura.
import test from 'node:test';
import assert from 'node:assert/strict';
import { gerarConfigHermes, PLATAFORMAS_PROIBIDAS } from './config-hermes.ts';

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
