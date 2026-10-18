<!-- source: https://hindsight.vectorize.io/sdks/integrations/gemini-spark -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term memory for [Gemini Spark](https://blog.google/products/gemini/gemini-spark/), Google's always-on agentic assistant, via [Hindsight](https://vectorize.io/hindsight)'s MCP server.

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — get an API key instantly, no infrastructure to run. The setup below works with both Cloud and self-hosted Hindsight.

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#how-it-works "Direct link to How It Works")

Spark runs on Google's cloud infrastructure. Unlike OpenClaw or Claude Code, there is **no plugin host** where Hindsight code runs alongside Spark's agent loop. The only third-party extension surface is MCP:

| Capability | Spark support |
| --- | --- |
| Hook-based auto-recall (prepend context to the prompt) | Not available — Spark's prompt assembly is private. The agent calls `recall` when its planner judges it useful. |
| Hook-based auto-retain (save transcripts on turn end) | Not available — third parties don't see Spark's transcripts. The agent calls `retain` when it learns something worth keeping. |
| MCP tools (`recall`, `retain`, etc.) | Yes — Spark calls Hindsight's MCP tools via its built-in MCP client. |

## Architecture [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#architecture "Direct link to Architecture")

### With Hindsight Cloud (recommended) [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#with-hindsight-cloud-recommended "Direct link to With Hindsight Cloud (recommended)")

```text
Gemini Spark (Google Cloud)
        |
        | HTTPS + MCP (Streamable HTTP)
        v
Hindsight Cloud (api.hindsight.vectorize.io)
```

### With self-hosted Hindsight [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#with-self-hosted-hindsight "Direct link to With self-hosted Hindsight")

```text
Gemini Spark (Google Cloud)
        |
        | HTTPS + OAuth 2.1 (Spark's MCP client)
        v
Cloudflare Worker — cloudflare-oauth-proxy
   - OAuth authorization server
   - Auth bridging to Hindsight API token
        |
        | HTTPS + Cloudflare Tunnel
        v
Self-hosted Hindsight + hindsight-embed (MCP server)
```

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#setup "Direct link to Setup")

### Option 1: Hindsight Cloud (recommended) [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#option-1-hindsight-cloud-recommended "Direct link to Option 1: Hindsight Cloud (recommended)")

1. Sign up at [vectorize.io/hindsight](https://vectorize.io/hindsight/) and create a memory bank
2. Copy your API key from the dashboard
3. Register Hindsight in Spark's MCP config (see below)

### Option 2: Self-hosted [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#option-2-self-hosted "Direct link to Option 2: Self-hosted")

1. Deploy a Hindsight instance and run the `hindsight-embed` MCP server pointed at it, exposed on a public HTTPS endpoint
2. Deploy the [`cloudflare-oauth-proxy`](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/cloudflare-oauth-proxy) — Spark only speaks OAuth 2.1 to MCP servers

### Register Hindsight in Spark [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#register-hindsight-in-spark "Direct link to Register Hindsight in Spark")

Spark (via Antigravity 2.0) reads MCP servers from one of two places:

- **Hosted agent / Spark cloud:** an `antigravity.yaml` manifest — see [`manifest.example.yaml`](https://github.com/vectorize-io/hindsight/blob/main/hindsight-integrations/gemini-spark/manifest.example.yaml)
- **Antigravity desktop / IDE:**`~/.gemini/antigravity/mcp_config.json` — see [`mcp_config.example.json`](https://github.com/vectorize-io/hindsight/blob/main/hindsight-integrations/gemini-spark/mcp_config.example.json)

Replace the placeholder URL with your Hindsight Cloud endpoint or OAuth proxy URL.

## Verifying Setup [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#verifying-setup "Direct link to Verifying Setup")

Prompt Spark with something that should trigger the memory tools:

- "What were my open API decisions from last week?" → `recall`
- "Remember that I prefer TypeScript strict mode for new projects." → `retain`

## Example Configs [​](https://hindsight.vectorize.io/sdks/integrations/gemini-spark\#example-configs "Direct link to Example Configs")

Both live in the [integration directory](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/gemini-spark):

- [`manifest.example.yaml`](https://github.com/vectorize-io/hindsight/blob/main/hindsight-integrations/gemini-spark/manifest.example.yaml) — Antigravity 2.0 agent manifest snippet
- [`mcp_config.example.json`](https://github.com/vectorize-io/hindsight/blob/main/hindsight-integrations/gemini-spark/mcp_config.example.json) — Desktop/IDE MCP config for local development

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#how-it-works)
- [Architecture](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#architecture)
  - [With Hindsight Cloud (recommended)](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#with-hindsight-cloud-recommended)
  - [With self-hosted Hindsight](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#with-self-hosted-hindsight)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#setup)
  - [Option 1: Hindsight Cloud (recommended)](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#option-1-hindsight-cloud-recommended)
  - [Option 2: Self-hosted](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#option-2-self-hosted)
  - [Register Hindsight in Spark](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#register-hindsight-in-spark)
- [Verifying Setup](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#verifying-setup)
- [Example Configs](https://hindsight.vectorize.io/sdks/integrations/gemini-spark#example-configs)
