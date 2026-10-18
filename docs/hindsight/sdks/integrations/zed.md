<!-- source: https://hindsight.vectorize.io/sdks/integrations/zed -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/zed#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term memory for the [Zed](https://zed.dev/) editor's AI assistant, powered by [Hindsight](https://vectorize.io/hindsight). One command connects Zed's Agent Panel to the Hindsight MCP server and adds a rule telling the agent to use it — so it recalls relevant memory at the start of a task and retains durable facts as it goes. Recall happens at query time against your actual message, and from your seat it's automatic.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/zed)

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/zed\#how-it-works "Direct link to How It Works")

Zed has no pre-prompt hook, but it supports two things this integration uses:

- **MCP context servers:** Zed runs MCP servers configured under `context_servers` in `settings.json` and surfaces their tools in the Agent Panel. `hindsight-zed` registers the Hindsight MCP server there, giving the agent `recall` / `retain` / `reflect` tools.
- **A global instructions file** (`~/.config/zed/AGENTS.md`) that Zed includes in every conversation. The integration adds a small rule there telling the agent to recall first and retain what it learns.

Zed connects to the Hindsight MCP endpoint natively by URL (with your API key as a Bearer header), so no bridge process runs.

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/zed\#setup "Direct link to Setup")

`hindsight-zed` is a zero-dependency Node CLI — Node.js is only needed to run this setup tool. Run it straight from npm with `npx`:

```bash
npx @vectorize-io/hindsight-zed init --api-token YOUR_HINDSIGHT_API_KEY --bank-id my-memory
```

Or install it globally for a persistent command:

```bash
npm install -g @vectorize-io/hindsight-zed
hindsight-zed init --api-token YOUR_HINDSIGHT_API_KEY --bank-id my-memory
```

`init` adds the `hindsight` MCP server to `~/.config/zed/settings.json` and the recall/retain rule to `~/.config/zed/AGENTS.md`. Restart Zed, open the Agent Panel, and the `hindsight` server should show a green dot.

Use a [Hindsight Cloud](https://hindsight.vectorize.io/) key, or point at a self-hosted server with `--api-url http://localhost:8888` (no token needed for an open local server). If your `settings.json` has comments (JSONC), `init` prints the entry to paste rather than rewriting the file — or run `hindsight-zed init --print-only` anytime.

## Commands [​](https://hindsight.vectorize.io/sdks/integrations/zed\#commands "Direct link to Commands")

| Command | Description |
| --- | --- |
| `hindsight-zed init` | Add the MCP server + recall/retain rule |
| `hindsight-zed status` | Show whether the server + rule are configured |
| `hindsight-zed uninstall` | Remove the server + rule |

## Note [​](https://hindsight.vectorize.io/sdks/integrations/zed\#note "Direct link to Note")

Recall and retain run through MCP tools the agent calls, guided by the always-on rule. This makes recall query-time precise (no lag), with the tradeoff that it relies on the agent following the "recall first" instruction rather than the editor enforcing it.

See the [package README](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/zed) for full configuration options.

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/zed#how-it-works)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/zed#setup)
- [Commands](https://hindsight.vectorize.io/sdks/integrations/zed#commands)
- [Note](https://hindsight.vectorize.io/sdks/integrations/zed#note)
