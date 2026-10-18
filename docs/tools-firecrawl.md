# Firecrawl

Usado como **ferramenta de pesquisa** (scrape, crawl, map, search) para reunir informação que alimenta o agente (hermes-agent). Não faz parte do runtime do agente.

## Integração: MCP hospedado
`.mcp.json` aponta para `https://mcp.firecrawl.dev/v2/mcp`, sem chave no repositório.

- **Sessões na nuvem (claude.ai/code):** a chave fica como *segredo de rede* (tipo Bearer, sites `api.firecrawl.dev` e `mcp.firecrawl.dev`) nas configurações do ambiente. A plataforma injeta `Authorization: Bearer ...` nas chamadas; a sessão nunca vê a chave. Vale só para sessões novas.
- **Claude Code local:** definir o header `Authorization: Bearer $FIRECRAWL_API_KEY` (variável de ambiente) ou usar o URL `/v2/mcp-oauth` e autenticar com `/mcp`.

## Ferramentas MCP principais
`firecrawl_scrape`, `firecrawl_map`, `firecrawl_crawl`, `firecrawl_search`, `firecrawl_agent`, `firecrawl_interact`, `firecrawl_credit_usage`.

## Pesquisas
Salvar os resultados de pesquisa em `docs/research/` (um arquivo por tema).
