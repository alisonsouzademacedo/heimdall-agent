# Firecrawl

Transforma páginas web em markdown/JSON limpo para o agente (scrape, crawl, map, search, extract).

## Integração
- **Desenvolvimento (Claude Code):** MCP via `.mcp.json` (`firecrawl-mcp`, lido de `FIRECRAWL_API_KEY`).
- **Runtime do agente:** usar a API/SDK oficial (`https://api.firecrawl.dev/v2`), que dá controle de timeout, retry e custo.

## Configuração
1. `cp .env.example .env` e preencha `FIRECRAWL_API_KEY`.
2. Exporte a variável no shell (`export FIRECRAWL_API_KEY=...`) antes de abrir o Claude Code.
3. No Claude Code, aprove o servidor `firecrawl` quando solicitado e rode `/mcp` para conferir.

## Ferramentas MCP principais
`firecrawl_scrape`, `firecrawl_map`, `firecrawl_crawl`, `firecrawl_search`, `firecrawl_agent`, `firecrawl_interact`, `firecrawl_credit_usage`.
