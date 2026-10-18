# Firecrawl

Usado como **ferramenta de pesquisa** (scrape, crawl, map, search) para reunir informação que alimenta o agente (hermes-agent). Não faz parte do runtime do agente.

## Integração: MCP hospedado (OAuth)
`.mcp.json` aponta para `https://mcp.firecrawl.dev/v2/mcp-oauth`. Não há chave no repositório: no primeiro uso, o cliente abre o login do Firecrawl e você escolhe o time.

### Claude Code
1. Abra o Claude Code neste repo e aprove o servidor `firecrawl`.
2. Rode `/mcp`, selecione `firecrawl` e autentique.

### Alternativa sem navegador (CI / execução sem interação)
Use o mesmo URL com o header `Authorization: Bearer $FIRECRAWL_API_KEY` ou o URL `https://mcp.firecrawl.dev/v2/mcp`. A chave fica só em variável de ambiente ou `.env` (git-ignorado), nunca no URL nem no git.

## Ferramentas MCP principais
`firecrawl_scrape`, `firecrawl_map`, `firecrawl_crawl`, `firecrawl_search`, `firecrawl_agent`, `firecrawl_interact`, `firecrawl_credit_usage`.

## Pesquisas
Salvar os resultados de pesquisa em `docs/research/` (um arquivo por tema).
