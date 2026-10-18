<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#__docusaurus_skipToContent_fallback)

On this page

List, auth, and call MCP servers/tools from the terminal.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/mcp/mcporter` |
| Path | `optional-skills/mcp/mcporter` |
| Version | `1.0.0` |
| Author | community |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `MCP`, `Tools`, `API`, `Integrations`, `Interop` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# mcporter

Use `mcporter` to discover, call, and manage [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) servers and tools directly from the terminal.

## Prerequisites [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#prerequisites "Direct link to Prerequisites")

Requires Node.js:

```bash
# No install needed (runs via npx)

npx mcporter list

# Or install globally

npm install -g mcporter
```

## Quick Start [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#quick-start "Direct link to Quick Start")

```bash
# List MCP servers already configured on this machine

mcporter list

# List tools for a specific server with schema details

mcporter list <server> --schema

# Call a tool

mcporter call <server.tool> key=value
```

## Discovering MCP Servers [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#discovering-mcp-servers "Direct link to Discovering MCP Servers")

mcporter auto-discovers servers configured by other MCP clients (Claude Desktop, Cursor, etc.) on the machine. To find new servers to use, browse registries like [mcpfinder.dev](https://mcpfinder.dev/) or [mcp.so](https://mcp.so/), then connect ad-hoc:

```bash
# Connect to any MCP server by URL (no config needed)

mcporter list --http-url https://some-mcp-server.com --name my_server

# Or run a stdio server on the fly

mcporter list --stdio "npx -y @modelcontextprotocol/server-filesystem" --name fs
```

## Calling Tools [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#calling-tools "Direct link to Calling Tools")

```bash
# Key=value syntax

mcporter call linear.list_issues team=ENG limit:5

# Function syntax

mcporter call "linear.create_issue(title: \"Bug fix needed\")"

# Ad-hoc HTTP server (no config needed)

mcporter call https://api.example.com/mcp.fetch url=https://example.com

# Ad-hoc stdio server

mcporter call --stdio "bun run ./server.ts" scrape url=https://example.com

# JSON payload

mcporter call <server.tool> --args '{"limit": 5}'

# Machine-readable output (recommended for Hermes)

mcporter call <server.tool> key=value --output json
```

## Auth and Config [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#auth-and-config "Direct link to Auth and Config")

```bash
# OAuth login for a server

mcporter auth <server | url> [--reset]

# Manage config

mcporter config list

mcporter config get <key>

mcporter config add <server>

mcporter config remove <server>

mcporter config import <path>
```

Config file location: `./config/mcporter.json` (override with `--config`).

## Daemon [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#daemon "Direct link to Daemon")

For persistent server connections:

```bash
mcporter daemon start

mcporter daemon status

mcporter daemon stop

mcporter daemon restart
```

## Code Generation [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#code-generation "Direct link to Code Generation")

```bash
# Generate a CLI wrapper for an MCP server

mcporter generate-cli --server <name>

mcporter generate-cli --command <url>

# Inspect a generated CLI

mcporter inspect-cli <path> [--json]

# Generate TypeScript types/client

mcporter emit-ts <server> --mode client

mcporter emit-ts <server> --mode types
```

## Notes [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter\#notes "Direct link to Notes")

- Use `--output json` for structured output that's easier to parse
- Ad-hoc servers (HTTP URL or `--stdio` command) work without any config — useful for one-off calls
- OAuth auth may require interactive browser flow — use `terminal(command="mcporter auth <server>", pty=true)` if needed

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#reference-full-skillmd)
- [Prerequisites](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#prerequisites)
- [Quick Start](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#quick-start)
- [Discovering MCP Servers](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#discovering-mcp-servers)
- [Calling Tools](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#calling-tools)
- [Auth and Config](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#auth-and-config)
- [Daemon](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#daemon)
- [Code Generation](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#code-generation)
- [Notes](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mcp/mcp-mcporter#notes)
