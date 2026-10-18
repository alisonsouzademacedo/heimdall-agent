<!-- source: https://hindsight.vectorize.io/sdks/integrations/opencode -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/opencode#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Superseded by the Coding Agents plugin

**The opencode plugin** is superseded by the [Coding Agents plugin](https://hindsight.vectorize.io/sdks/integrations/coding-agents) — one
package covering Claude Code, Codex, opencode, Kilo, Cursor, Copilot, Grok, Antigravity, Devin and Cline and other CLI agents, with a per-repo memory bank they all share instead
of one bank per agent.

This page and the published package still work; they are no longer developed. To switch:

```bash
cd /path/to/your/repo
npx @vectorize-io/hindsight-coding-agents install opencode
```

Memory does not move automatically — the banks are scoped differently and this agent's history cannot be imported (it is kept in an internal database). See
[Migrating from the per-agent plugins](https://hindsight.vectorize.io/sdks/integrations/coding-agents#migrating-from-the-per-agent-plugins).

Persistent long-term memory plugin for [OpenCode](https://opencode.ai/) using [Hindsight](https://vectorize.io/hindsight). Automatically captures conversations, recalls relevant context on session start, and provides retain/recall/reflect tools the agent can call directly.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/opencode)

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#quick-start "Direct link to Quick Start")

Add to your `opencode.json` (project) or `~/.config/opencode/opencode.json` (global):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@vectorize-io/opencode-hindsight"]
}
```

OpenCode auto-installs plugins in the `"plugin"` array on startup — no `npm install` required.

Point the plugin at your Hindsight server and start OpenCode:

```bash
export HINDSIGHT_API_URL="http://localhost:8888"
opencode
```

### Using Hindsight Cloud [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#using-hindsight-cloud "Direct link to Using Hindsight Cloud")

Get an API key at [ui.hindsight.vectorize.io/connect](https://ui.hindsight.vectorize.io/connect):

```bash
export HINDSIGHT_API_URL="https://api.hindsight.vectorize.io"
export HINDSIGHT_API_TOKEN="your-api-key"
opencode
```

Or configure inline via plugin options in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [\
    ["@vectorize-io/opencode-hindsight", {\
      "hindsightApiUrl": "https://api.hindsight.vectorize.io",\
      "hindsightApiToken": "your-api-key"\
    }]\
  ]
}
```

## Features [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#features "Direct link to Features")

### Custom Tools [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#custom-tools "Direct link to Custom Tools")

The plugin registers three tools the agent can call explicitly:

| Tool | Description |
| --- | --- |
| `hindsight_retain` | Store information in long-term memory |
| `hindsight_recall` | Search long-term memory for relevant information |
| `hindsight_reflect` | Generate a synthesized answer from long-term memory |

### Auto-Retain [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#auto-retain "Direct link to Auto-Retain")

When the session goes idle (`session.idle` event), the plugin automatically retains the conversation transcript to Hindsight. Configurable via `retainEveryNTurns` to control frequency.

### Session Recall [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#session-recall "Direct link to Session Recall")

When a new session starts, the plugin recalls relevant project context and injects it into the system prompt, giving the agent access to memories from prior sessions.

### Compaction Hook [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#compaction-hook "Direct link to Compaction Hook")

When OpenCode compacts the context window, the plugin:

1. Retains the current conversation before compaction
2. Recalls relevant memories and injects them into the compaction context

This ensures memories survive context window trimming.

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#configuration "Direct link to Configuration")

### Plugin Options [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#plugin-options "Direct link to Plugin Options")

```json
{
  "plugin": [\
    ["@vectorize-io/opencode-hindsight", {\
      "hindsightApiUrl": "http://localhost:8888",\
      "hindsightApiToken": "your-api-key",\
      "bankId": "my-project",\
      "autoRecall": true,\
      "autoRetain": true,\
      "recallBudget": "mid",\
      "recallTags": [],\
      "recallTagsMatch": "any",\
      "retainTags": [],\
      "retainEveryNTurns": 3,\
      "debug": false\
    }]\
  ]
}
```

### Config File [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#config-file "Direct link to Config File")

Create `~/.hindsight/opencode.json` for persistent configuration that applies across all projects:

```json
{
  "hindsightApiUrl": "http://localhost:8888",
  "hindsightApiToken": "your-api-key",
  "recallBudget": "mid"
}
```

### Environment Variables [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#environment-variables "Direct link to Environment Variables")

| Variable | Description | Default |
| --- | --- | --- |
| `HINDSIGHT_API_URL` | Hindsight API base URL | _(required)_ |
| `HINDSIGHT_API_TOKEN` | API key for authentication |  |
| `HINDSIGHT_BANK_ID` | Static memory bank ID | `opencode` |
| `HINDSIGHT_AGENT_NAME` | Agent name for dynamic bank IDs | `opencode` |
| `HINDSIGHT_AUTO_RECALL` | Auto-recall on session start | `true` |
| `HINDSIGHT_AUTO_RETAIN` | Auto-retain on session idle | `true` |
| `HINDSIGHT_RETAIN_MODE` | `full-session` or `last-turn` | `full-session` |
| `HINDSIGHT_RECALL_BUDGET` | Recall budget: `low`, `mid`, `high` | `mid` |
| `HINDSIGHT_RECALL_MAX_TOKENS` | Max tokens for recall results | `1024` |
| `HINDSIGHT_RECALL_TAGS` | Comma-separated tags to filter recall results |  |
| `HINDSIGHT_RECALL_TAGS_MATCH` | Tag match mode: `any`, `all`, `any_strict`, `all_strict` | `any` |
| `HINDSIGHT_DYNAMIC_BANK_ID` | Enable dynamic bank ID derivation | `false` |
| `HINDSIGHT_BANK_MISSION` | Bank mission/context for reflect |  |

Configuration priority (later wins): defaults < `~/.hindsight/opencode.json` < plugin options < env vars.

### Logging & debugging [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#logging--debugging "Direct link to Logging & debugging")

The plugin logs through OpenCode's own log stream (`service=hindsight`), visible with `opencode --print-logs` or in the OpenCode log files. Errors (failed retain/recall, unreachable API, auth problems) and the resolved API URL + bank are logged **by default** — so if memories aren't saving, the reason is visible without any opt-in.

Verbose tracing is controlled by the `debug` option, which is **config-only** (set `"debug": true` in `opencode.json` plugin options or `~/.hindsight/opencode.json`). There is intentionally no `HINDSIGHT_DEBUG` environment variable: env vars are unreliable to set for OpenCode's plugin runtime (notably on Windows, where a persistent OpenCode server may never see them).

```json
{
  "plugin": [["@vectorize-io/opencode-hindsight", { "debug": true }]]
}
```

## Dynamic Bank IDs [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#dynamic-bank-ids "Direct link to Dynamic Bank IDs")

For multi-project isolation, enable dynamic bank ID derivation:

```bash
export HINDSIGHT_DYNAMIC_BANK_ID=true
```

The bank ID is composed from granularity fields (default: `agent::project`). Supported fields: `agent`, `project`, `channel`, `user`.

For multi-user scenarios (e.g., shared agent serving multiple users):

```bash
export HINDSIGHT_CHANNEL_ID="slack-general"
export HINDSIGHT_USER_ID="user123"
```

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/opencode\#how-it-works "Direct link to How It Works")

1. **Plugin loads** when OpenCode starts — creates a `HindsightClient`, derives the bank ID, and registers tools + hooks
2. **Session starts** — `session.created` event triggers, plugin marks session for recall injection
3. **System transform** — on the first LLM call, recalled memories are injected into the system prompt
4. **Agent works** — can call `hindsight_recall` and `hindsight_retain` explicitly during the session
5. **Session idles** — `session.idle` event triggers auto-retain of the conversation
6. **Compaction** — if the context window fills up, memories are preserved through the compaction

- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/opencode#quick-start)
  - [Using Hindsight Cloud](https://hindsight.vectorize.io/sdks/integrations/opencode#using-hindsight-cloud)
- [Features](https://hindsight.vectorize.io/sdks/integrations/opencode#features)
  - [Custom Tools](https://hindsight.vectorize.io/sdks/integrations/opencode#custom-tools)
  - [Auto-Retain](https://hindsight.vectorize.io/sdks/integrations/opencode#auto-retain)
  - [Session Recall](https://hindsight.vectorize.io/sdks/integrations/opencode#session-recall)
  - [Compaction Hook](https://hindsight.vectorize.io/sdks/integrations/opencode#compaction-hook)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/opencode#configuration)
  - [Plugin Options](https://hindsight.vectorize.io/sdks/integrations/opencode#plugin-options)
  - [Config File](https://hindsight.vectorize.io/sdks/integrations/opencode#config-file)
  - [Environment Variables](https://hindsight.vectorize.io/sdks/integrations/opencode#environment-variables)
  - [Logging & debugging](https://hindsight.vectorize.io/sdks/integrations/opencode#logging--debugging)
- [Dynamic Bank IDs](https://hindsight.vectorize.io/sdks/integrations/opencode#dynamic-bank-ids)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/opencode#how-it-works)
