<!-- source: https://hindsight.vectorize.io/sdks/integrations/openhands -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/openhands#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term memory for [OpenHands](https://github.com/OpenHands/OpenHands) (formerly OpenDevin), powered by [Hindsight](https://vectorize.io/hindsight). One command connects OpenHands to the Hindsight MCP server and adds a recall/retain rule — so the agent recalls relevant memory at the start of a task and retains durable facts as it works.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/openhands)

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/openhands\#how-it-works "Direct link to How It Works")

OpenHands has **native Streamable-HTTP MCP support**, so the Hindsight MCP endpoint connects directly (no bridge):

```toml
[mcp]
shttp_servers = [\
    {url = "https://api.hindsight.vectorize.io/mcp/my-project/", api_key = "hsk_..."}\
]
```

OpenHands also loads `AGENTS.md` (and repo microagents) into the agent's context on every task — that's where the recall/retain rule lives, telling the agent to `recall` first and `retain` durable facts.

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/openhands\#setup "Direct link to Setup")

```bash
pip install hindsight-openhands
cd your-project
hindsight-openhands init --api-token YOUR_HINDSIGHT_API_KEY --bank-id my-project
```

`init` merges the `[mcp]` entry into `./config.toml` and writes the rule into `./AGENTS.md`. Use a [Hindsight Cloud](https://hindsight.vectorize.io/) key, or point at a self-hosted server with `--api-url http://localhost:8888` (no token needed for an open local server). If `config.toml` can't be parsed safely, `init` prints the snippet to paste instead — or run `hindsight-openhands init --print-only` anytime.

## Commands [​](https://hindsight.vectorize.io/sdks/integrations/openhands\#commands "Direct link to Commands")

| Command | Description |
| --- | --- |
| `hindsight-openhands init` | Add the MCP server + recall/retain rule |
| `hindsight-openhands status` | Show whether the server + rule are configured |
| `hindsight-openhands uninstall` | Remove the server + rule |

See the [package README](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/openhands) for full configuration options.

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/openhands#how-it-works)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/openhands#setup)
- [Commands](https://hindsight.vectorize.io/sdks/integrations/openhands#commands)
