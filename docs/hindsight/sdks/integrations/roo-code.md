<!-- source: https://hindsight.vectorize.io/sdks/integrations/roo-code -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/roo-code#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent long-term memory for [Roo Code](https://github.com/RooVetGit/Roo-Code) via [Hindsight](https://vectorize.io/hindsight). A one-command installer registers Hindsight's MCP server and injects custom rules that teach Roo to recall context before tasks and retain learnings after.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/roo-code)

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#quick-start "Direct link to Quick Start")

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — get an API key instantly, no infrastructure to run.

```bash
# Install the CLI
pip install hindsight-roo-code

# Install the integration into your project (defaults to Hindsight Cloud)
hindsight-roo-code install

# Restart Roo Code — memory is active
```

**Self-hosting alternative:**

```bash
# Start Hindsight locally first
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-openai-key
hindsight-api

# Then install with the local URL
hindsight-roo-code install --api-url http://localhost:8888
```

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#how-it-works "Direct link to How It Works")

Roo Code has two primary extensibility mechanisms: **MCP servers** for tools and **custom rules** for system-prompt injection. This integration uses both.

```text
New task starts
  └─ Rules file instructs Roo to call recall
       └─ Relevant memories injected into context automatically

Agent working…
  └─ Agent calls retain for significant decisions/discoveries

Task ends
  └─ Rules file instructs Roo to call retain with a summary
       └─ Summary stored for future sessions
```

The installer writes:

- **`.roo/mcp.json`** — registers Hindsight's `/mcp` endpoint as an MCP server, with `recall` and `retain` auto-approved
- **`.roo/rules/hindsight-memory.md`** — instructions injected into every Roo system prompt

## Installation Options [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#installation-options "Direct link to Installation Options")

### Project-local install (default) [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#project-local-install-default "Direct link to Project-local install (default)")

Writes to `.roo/` in the current directory — memory is scoped to this project:

```bash
hindsight-roo-code install
hindsight-roo-code install --api-url https://api.hindsight.vectorize.io  # default (Hindsight Cloud)
hindsight-roo-code install --api-url http://localhost:8888                 # self-hosted
hindsight-roo-code install --project-dir /path/to/project
```

### Global install [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#global-install "Direct link to Global install")

Writes to `~/.roo/` — applies to all projects:

```bash
hindsight-roo-code install --global
```

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#configuration "Direct link to Configuration")

The MCP entry written to `.roo/mcp.json`:

```json
{
  "mcpServers": {
    "hindsight": {
      "type": "streamable-http",
      "url": "http://localhost:8888/mcp",
      "timeout": 30,
      "alwaysAllow": ["recall", "retain"]
    }
  }
}
```

To update the API URL after installation, re-run the installer or edit `.roo/mcp.json` directly.

## MCP Tools [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#mcp-tools "Direct link to MCP Tools")

Hindsight exposes two tools via its `/mcp` endpoint:

| Tool | Description |
| --- | --- |
| `recall` | Search memory for context relevant to a query |
| `retain` | Store content in memory immediately |

The rules file instructs Roo to call these automatically at task start and end. Agents can also call them explicitly mid-task.

## Verifying Setup [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#verifying-setup "Direct link to Verifying Setup")

1. Start Hindsight and run the installer
2. Open Roo Code in your project
3. Check **Settings → MCP Servers** — `hindsight` should show as connected
4. Start a task — you should see `recall` invoked in the tool call log

## Prerequisites [​](https://hindsight.vectorize.io/sdks/integrations/roo-code\#prerequisites "Direct link to Prerequisites")

A running Hindsight instance:

**Hindsight Cloud (recommended):** [Sign up](https://ui.hindsight.vectorize.io/) — no self-hosting required.

**Self-hosted:**

```bash
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-api-key
hindsight-api  # starts on http://localhost:8888
```

- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/roo-code#quick-start)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/roo-code#how-it-works)
- [Installation Options](https://hindsight.vectorize.io/sdks/integrations/roo-code#installation-options)
  - [Project-local install (default)](https://hindsight.vectorize.io/sdks/integrations/roo-code#project-local-install-default)
  - [Global install](https://hindsight.vectorize.io/sdks/integrations/roo-code#global-install)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/roo-code#configuration)
- [MCP Tools](https://hindsight.vectorize.io/sdks/integrations/roo-code#mcp-tools)
- [Verifying Setup](https://hindsight.vectorize.io/sdks/integrations/roo-code#verifying-setup)
- [Prerequisites](https://hindsight.vectorize.io/sdks/integrations/roo-code#prerequisites)
