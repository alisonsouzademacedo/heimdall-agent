// Gera o config.yaml do Hermes (docs/plano/runbooks/03-hermes.md; chaves conferidas em docs/hermes-agent/user-guide/configuration.md e features/mcp.md):
//  - fuso de Sao Paulo (agenda e relogio do agente);
//  - ferramentas travadas DUAS vezes: lista branca da plataforma da API (platform_toolsets.api_server) e lista negra global (agent.disabled_toolsets);
//  - nenhuma plataforma de mensagens (o Hermes nao tem caminho de envio: regra 1 do AGENTS.md);
//  - escritas do proprio Hermes (memoria e skills) so com aprovacao do dono;
//  - Hindsight por MCP, com LISTA BRANCA de leitura (recall, reflect): "include" vence "exclude", entao nada que apague ou crie entra.
// Texto YAML simples gerado a mao (o nucleo nao tem dependencias): so escalares entre aspas e listas.

export const FERRAMENTAS_DESLIGADAS = [
  'terminal', 'browser', 'code_execution', 'delegation', 'computer_use', 'web', 'search', 'image_gen', 'video_gen', 'tts',
  'file', 'cronjob', 'connections', 'kanban', 'x_search', 'todo', 'vision', 'video', 'skills', 'catalog', 'desktop_ui', 'project'
] as const;
export const FERRAMENTAS_LIGADAS_NA_API = ['memory', 'session_search'] as const;
export const FERRAMENTAS_DO_HINDSIGHT = ['recall', 'reflect'] as const;
/** Nomes que nunca podem aparecer como chave do config: plataformas de mensagens do Hermes. */
export const PLATAFORMAS_PROIBIDAS = ['whatsapp', 'telegram', 'discord', 'slack', 'signal', 'matrix', 'mattermost', 'email', 'sms', 'bluebubbles'] as const;

export interface OpcoesConfigHermes {
  banco: string;
  fuso?: string;
  hindsightUrl?: string;
}

const BANCO = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const URL_HTTP = /^http:\/\/[A-Za-z0-9.-]+(:\d{1,5})?$/;

const aspas = (t: string): string => JSON.stringify(t);
const lista = (itens: readonly string[], recuo: string): string => itens.map((i) => `${recuo}- ${i}`).join('\n');

export function gerarConfigHermes(o: OpcoesConfigHermes): string {
  if (!BANCO.test(o.banco)) throw new Error('nome de banco invalido (letras, numeros, - e _)');
  const hindsightUrl = o.hindsightUrl ?? 'http://hindsight:8888';
  if (!URL_HTTP.test(hindsightUrl)) throw new Error('URL do Hindsight invalida (http://servidor:porta)');
  const fuso = o.fuso ?? 'America/Sao_Paulo';
  try { new Intl.DateTimeFormat('en', { timeZone: fuso }); } catch { throw new Error('fuso invalido'); }
  return [
    '# Gerado pelo Heimdall (apps/ponte/src/config-hermes.ts). Pode ser regenerado; edicoes manuais se perdem.',
    `timezone: ${aspas(fuso)}`,
    'agent:',
    '  disabled_toolsets:',
    lista(FERRAMENTAS_DESLIGADAS, '    '),
    'platform_toolsets:',
    '  api_server:',
    lista(FERRAMENTAS_LIGADAS_NA_API, '    '),
    'memory:',
    '  write_approval: true',
    'skills:',
    '  write_approval: true',
    'mcp_servers:',
    '  hindsight:',
    `    url: ${aspas(`${hindsightUrl}/mcp/${o.banco}/`)}`,
    '    tools:',
    '      include:',
    lista(FERRAMENTAS_DO_HINDSIGHT, '        '),
    '      prompts: false',
    '      resources: false',
    ''
  ].join('\n');
}
