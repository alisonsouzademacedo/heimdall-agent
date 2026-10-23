// Gera o config.yaml do Hermes (docs/plano/runbooks/03-hermes.md; chaves conferidas em docs/hermes-agent/user-guide/configuration.md e features/mcp.md):
//  - fuso de Sao Paulo (agenda e relogio do agente);
//  - ferramentas travadas DUAS vezes: lista branca da plataforma da API (platform_toolsets.api_server) e lista negra global (agent.disabled_toolsets);
//  - nenhuma plataforma de mensagens (o Hermes nao tem caminho de envio: regra 1 do AGENTS.md);
//  - escritas do proprio Hermes (memoria e skills) so com aprovacao do dono;
//  - Hindsight por MCP, com LISTA BRANCA de leitura (recall, reflect): "include" vence "exclude", entao nada que apague ou crie entra;
//  - prompt enxuto (menos tokens em TODO pedido): sem o bloco de disciplina de execucao nem o de uso obrigatorio de ferramentas, e sem a chamada extra de
//    titulo de sessao (chaves em docs/hermes-agent/user-guide/configuration.md: "Tool-Use Enforcement", "Execution-Discipline Guidance", "Auxiliary Models");
//  - a secao "model:" que o login (`hermes model`) gravou no arquivo VIVO e preservada ao regerar (senao o modelo se perde); o resto do antigo nao volta.
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
  /** Conteudo do config.yaml que esta valendo no Hermes: so a secao "model:" e aproveitada. */
  configAtual?: string;
}

const BANCO = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const URL_HTTP = /^http:\/\/[A-Za-z0-9.-]+(:\d{1,5})?$/;

const aspas = (t: string): string => JSON.stringify(t);
const lista = (itens: readonly string[], recuo: string): string => itens.map((i) => `${recuo}- ${i}`).join('\n');

const CABECALHO_MODELO = /^model:(?: [A-Za-z0-9_.:\/@+-]{1,100})?$/;
const LINHA_MODELO = /^ {2,}[A-Za-z_][A-Za-z0-9_-]*:(?: [A-Za-z0-9_.:\/@+"' -]{0,200})?$/;

/** Devolve a secao "model:" (cabecalho e linhas recuadas) ou null se nao ha. Lanca se ela tem qualquer coisa fora do formato simples: nunca copia texto estranho para o config. */
export function extrairBlocoModelo(yaml: string): string | null {
  const linhas = yaml.split(/\r?\n/);
  const ini = linhas.findIndex((l) => /^model:/.test(l));
  if (ini < 0) return null;
  const bloco: string[] = [linhas[ini]!];
  if (!CABECALHO_MODELO.test(bloco[0]!)) throw new Error('secao model: do config atual fora do formato esperado');
  for (let i = ini + 1; i < linhas.length; i++) {
    const l = linhas[i]!;
    if (l.trim() === '' || /^\s*#/.test(l)) continue;
    if (!/^\s/.test(l)) break; // proxima chave de nivel zero
    if (!LINHA_MODELO.test(l)) throw new Error('secao model: do config atual tem uma linha fora do formato esperado');
    bloco.push(l);
  }
  if (bloco.length === 1 && bloco[0] === 'model:') throw new Error('secao model: do config atual esta vazia');
  return bloco.join('\n') + '\n';
}

export function gerarConfigHermes(o: OpcoesConfigHermes): string {
  if (!BANCO.test(o.banco)) throw new Error('nome de banco invalido (letras, numeros, - e _)');
  const hindsightUrl = o.hindsightUrl ?? 'http://hindsight:8888';
  if (!URL_HTTP.test(hindsightUrl)) throw new Error('URL do Hindsight invalida (http://servidor:porta)');
  const fuso = o.fuso ?? 'America/Sao_Paulo';
  try { new Intl.DateTimeFormat('en', { timeZone: fuso }); } catch { throw new Error('fuso invalido'); }
  const modelo = o.configAtual === undefined ? null : extrairBlocoModelo(o.configAtual);
  return [
    '# Gerado pelo Heimdall (apps/ponte/src/config-hermes.ts). Pode ser regenerado; edicoes manuais se perdem.',
    `timezone: ${aspas(fuso)}`,
    'agent:',
    '  disabled_toolsets:',
    lista(FERRAMENTAS_DESLIGADAS, '    '),
    '  tool_use_enforcement: false',
    '  execution_guidance: false',
    'auxiliary:',
    '  title_generation:',
    '    enabled: false',
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
    ...(modelo ? [modelo.trimEnd()] : []),
    ''
  ].join('\n');
}
