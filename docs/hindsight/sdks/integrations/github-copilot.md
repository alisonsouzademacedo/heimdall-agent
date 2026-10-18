<!-- source: https://hindsight.vectorize.io/sdks/integrations/github-copilot -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/github-copilot#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term memory for [GitHub Copilot](https://github.com/features/copilot) in VS Code, powered by [Hindsight](https://vectorize.io/hindsight). One command connects Copilot's agent mode to the Hindsight MCP server and adds a recall/retain rule — so Copilot recalls relevant memory at the start of a task and retains durable facts as it works.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/github-copilot)

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/github-copilot\#how-it-works "Direct link to How It Works")

VS Code Copilot supports two things this integration uses:

- **MCP servers** via `.vscode/mcp.json` (agent mode), including **HTTP servers** with headers — so the Hindsight MCP endpoint connects directly:





```json
{
    "servers": {
      "hindsight": {
        "type": "http",
        "url": "https://api.hindsight.vectorize.io/mcp/my-project/",
        "headers": { "Authorization": "Bearer hsk_..." }
      }
    }
}
```

- **`.github/copilot-instructions.md`**, which Copilot applies to every chat in the workspace — that's where the recall/retain rule lives.


## Setup [​](https://hindsight.vectorize.io/sdks/integrations/github-copilot\#setup "Direct link to Setup")

```bash
pip install hindsight-copilot
cd your-project
hindsight-copilot init --api-token YOUR_HINDSIGHT_API_KEY --bank-id my-project
```

`init` merges the `servers` entry into `./.vscode/mcp.json` and writes the rule into `./.github/copilot-instructions.md`. Reload VS Code, open Copilot Chat in **agent mode**, and start the `hindsight` MCP server from the chat's tools menu.

Use a [Hindsight Cloud](https://hindsight.vectorize.io/) key, or a self-hosted server with `--api-url http://localhost:8888` (no token needed for an open local server). If `mcp.json` has comments, `init` prints the snippet to paste instead — or run `hindsight-copilot init --print-only` anytime.

## Commands [​](https://hindsight.vectorize.io/sdks/integrations/github-copilot\#commands "Direct link to Commands")

| Command | Description |
| --- | --- |
| `hindsight-copilot init` | Add the MCP server + recall/retain rule |
| `hindsight-copilot status` | Show whether the server + rule are configured |
| `hindsight-copilot uninstall` | Remove the server + rule |

See the [package README](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/github-copilot) for full configuration options.

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/github-copilot#how-it-works)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/github-copilot#setup)
- [Commands](https://hindsight.vectorize.io/sdks/integrations/github-copilot#commands)
