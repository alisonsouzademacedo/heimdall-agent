<!-- source: https://hindsight.vectorize.io/sdks/integrations/omo -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/omo#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/omo)

Persistent memory for [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (OMO) using [Hindsight](https://vectorize.io/hindsight). Five lifecycle hooks automatically recall relevant context before each prompt and retain conversations after each turn — no changes to your OMO workflow required.

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/omo\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) for a Hindsight Cloud API key — no self-hosting, no local daemon to manage.

From the `hindsight-integrations/omo/` directory:

```bash
# Hooks (global)
mkdir -p ~/.omo/hooks
cp hooks/hooks.json ~/.omo/hooks/hindsight-hooks.json

# Scripts + settings (global)
mkdir -p ~/.omo/plugins/hindsight/scripts
cp -r scripts/ ~/.omo/plugins/hindsight/scripts/
cp settings.json ~/.omo/plugins/hindsight/settings.json

# Rules (per-project — run from your project root)
mkdir -p .omo/rules
cp rules/hindsight-memory.md .omo/rules/hindsight-memory.md
```

Then set your API key:

```bash
export HINDSIGHT_API_TOKEN=hsk_your_key_here
```

Add env vars to OMO's allowlist in `~/.config/opencode/oh-my-openagent.jsonc`:

```jsonc
{
  "mcp_env_allowlist": [\
    "HINDSIGHT_API_URL",\
    "HINDSIGHT_API_TOKEN",\
    "HINDSIGHT_BANK_ID"\
  ]
}
```

Start a new OMO session — memory is live.

## Features [​](https://hindsight.vectorize.io/sdks/integrations/omo\#features "Direct link to Features")

- **Auto-recall** — on every user prompt, queries Hindsight for relevant memories and injects them as `additionalContext` (invisible to the transcript, visible to OMO)
- **Auto-retain** — after each OMO response and sub-agent stop, stores the conversation transcript to Hindsight for future recall
- **Sub-agent capture** — `SubagentStop` hook captures learnings from OMO's delegated sub-agents (Claude Code, Codex, OpenCode)
- **Dynamic bank IDs** — supports per-project memory isolation based on the working directory
- **Session-level upsert** — uses the session ID as the document ID so re-running the same session updates rather than duplicates stored content
- **Cloud-first** — defaults to Hindsight Cloud with no local daemon to manage
- **Zero dependencies** — pure Python stdlib, no pip install required

## Architecture [​](https://hindsight.vectorize.io/sdks/integrations/omo\#architecture "Direct link to Architecture")

The plugin uses five OMO hook events:

| Hook | Event | Purpose |
| --- | --- | --- |
| `session_start.py` | `SessionStart` | Warm up — verify Hindsight is reachable |
| `recall.py` | `UserPromptSubmit` | **Auto-recall** — query memories, inject as `additionalContext` |
| `retain.py` | `Stop` | **Auto-retain** — extract transcript, POST to Hindsight (async) |
| `retain.py` | `SubagentStop` | **Sub-agent retain** — capture delegated sub-agent learnings |
| `session_end.py` | `SessionEnd` | Force final retain for short sessions |

On `UserPromptSubmit`, the hook reads the prompt, queries Hindsight for the most relevant memories, and outputs a `hookSpecificOutput.additionalContext` block. OMO prepends this to the conversation before sending it to the model:

```text
<hindsight_memories>
Relevant memories from past conversations...
Current time - 2026-06-08 14:30

- Project uses FastAPI with asyncpg — not SQLAlchemy [world] (2026-06-07)
- Preferred testing framework: pytest with pytest-asyncio [experience] (2026-06-07)
</hindsight_memories>
```

On `Stop` and `SubagentStop`, the hook reads the session transcript, strips previously injected memory tags (to prevent feedback loops), and POSTs the conversation to Hindsight asynchronously.

## Connection Modes [​](https://hindsight.vectorize.io/sdks/integrations/omo\#connection-modes "Direct link to Connection Modes")

### 1\. Hindsight Cloud (recommended) [​](https://hindsight.vectorize.io/sdks/integrations/omo\#1-hindsight-cloud-recommended "Direct link to 1. Hindsight Cloud (recommended)")

No setup beyond an API key:

```json
{
  "hindsightApiUrl": "https://api.hindsight.vectorize.io",
  "hindsightApiToken": "hsk_your_token"
}
```

### 2\. Self-Hosted [​](https://hindsight.vectorize.io/sdks/integrations/omo\#2-self-hosted "Direct link to 2. Self-Hosted")

Point at your own Hindsight instance:

```bash
export HINDSIGHT_API_URL=http://localhost:8888
```

Or in `~/.hindsight/omo.json`:

```json
{
  "hindsightApiUrl": "http://localhost:8888"
}
```

No API token is required for local instances.

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/omo\#configuration "Direct link to Configuration")

Settings are loaded from three sources in order (later wins):

1. Plugin `settings.json` (cloud URL pre-set)
2. User config (`~/.hindsight/omo.json`)
3. `HINDSIGHT_*` environment variables

* * *

### Connection [​](https://hindsight.vectorize.io/sdks/integrations/omo\#connection "Direct link to Connection")

| Setting | Env Var | Default | Description |
| --- | --- | --- | --- |
| `hindsightApiUrl` | `HINDSIGHT_API_URL` | `https://api.hindsight.vectorize.io` | API endpoint. |
| `hindsightApiToken` | `HINDSIGHT_API_TOKEN` | — | API key for authentication. Required for Hindsight Cloud. |

* * *

### Memory Bank [​](https://hindsight.vectorize.io/sdks/integrations/omo\#memory-bank "Direct link to Memory Bank")

| Setting | Env Var | Default | Description |
| --- | --- | --- | --- |
| `bankId` | `HINDSIGHT_BANK_ID` | `"omo"` | The bank to read from and write to. All sessions share this bank unless `dynamicBankId` is enabled. |
| `bankMission` | `HINDSIGHT_BANK_MISSION` | OMO orchestrator prompt | Describes the agent's purpose. Sent when creating or updating the bank. |
| `retainMission` | — | extraction prompt | Instructions for Hindsight's fact extraction. |
| `dynamicBankId` | `HINDSIGHT_DYNAMIC_BANK_ID` | `false` | When `true`, derives a unique bank ID from `dynamicBankGranularity` fields. |
| `dynamicBankGranularity` | — | `["agent", "project"]` | Fields to combine for dynamic bank IDs. `"project"` = working directory, `"agent"` = agent name. |
| `bankIdPrefix` | — | `""` | Prefix prepended to all bank IDs. |

* * *

### Auto-Recall [​](https://hindsight.vectorize.io/sdks/integrations/omo\#auto-recall "Direct link to Auto-Recall")

| Setting | Env Var | Default | Description |
| --- | --- | --- | --- |
| `autoRecall` | `HINDSIGHT_AUTO_RECALL` | `true` | Master switch for auto-recall. |
| `recallBudget` | `HINDSIGHT_RECALL_BUDGET` | `"mid"` | Search depth: `"low"` (fast), `"mid"` (balanced), `"high"` (thorough). |
| `recallMaxTokens` | `HINDSIGHT_RECALL_MAX_TOKENS` | `1024` | Max tokens in the recalled memory block. |
| `recallTypes` | — | `["world", "experience"]` | Memory types to retrieve. |
| `recallContextTurns` | `HINDSIGHT_RECALL_CONTEXT_TURNS` | `1` | Prior turns to include when building the recall query. `1` = latest prompt only. |
| `recallMaxQueryChars` | `HINDSIGHT_RECALL_MAX_QUERY_CHARS` | `800` | Max characters in the query sent to Hindsight. |
| `recallRoles` | — | `["user", "assistant"]` | Roles to include when building a multi-turn query. |
| `recallPromptPreamble` | — | built-in | Text placed above the recalled memories in the injected context block. |

* * *

### Auto-Retain [​](https://hindsight.vectorize.io/sdks/integrations/omo\#auto-retain "Direct link to Auto-Retain")

| Setting | Env Var | Default | Description |
| --- | --- | --- | --- |
| `autoRetain` | `HINDSIGHT_AUTO_RETAIN` | `true` | Master switch for auto-retain. |
| `retainMode` | `HINDSIGHT_RETAIN_MODE` | `"full-session"` | `"full-session"` sends the full transcript per session. `"chunked"` sends sliding windows every N turns. |
| `retainEveryNTurns` | — | `10` | Retain fires every N turns. `1` = every turn. Higher values reduce API calls. |
| `retainOverlapTurns` | — | `2` | Extra turns included from the previous chunk (chunked mode only). |
| `retainRoles` | — | `["user", "assistant"]` | Roles to include in the retained transcript. |
| `retainTags` | — | `["{session_id}"]` | Tags attached to the stored document. `{session_id}` is replaced at runtime. |
| `retainMetadata` | — | `{}` | Arbitrary key-value metadata attached to the stored document. |
| `retainContext` | — | `"omo"` | Label identifying the source integration. |

* * *

### Debug [​](https://hindsight.vectorize.io/sdks/integrations/omo\#debug "Direct link to Debug")

| Setting | Env Var | Default | Description |
| --- | --- | --- | --- |
| `debug` | `HINDSIGHT_DEBUG` | `false` | Enable verbose logging to stderr. All log lines are prefixed with `[Hindsight]`. |

## Per-Project Memory [​](https://hindsight.vectorize.io/sdks/integrations/omo\#per-project-memory "Direct link to Per-Project Memory")

To give each project its own isolated memory bank, enable dynamic bank IDs:

```json
{
  "dynamicBankId": true,
  "dynamicBankGranularity": ["agent", "project"]
}
```

With this config, running OMO in `~/projects/api` and `~/projects/frontend` stores and recalls memories separately. Bank IDs are derived from the working directory path (e.g. `omo::api`, `omo::frontend`).

## Multi-Bank Recall [​](https://hindsight.vectorize.io/sdks/integrations/omo\#multi-bank-recall "Direct link to Multi-Bank Recall")

Query additional banks alongside the primary one:

```json
{
  "recallAdditionalBanks": ["shared-team-knowledge"]
}
```

## Troubleshooting [​](https://hindsight.vectorize.io/sdks/integrations/omo\#troubleshooting "Direct link to Troubleshooting")

**No memories recalled**: Recall returns results only after something has been retained. Complete one OMO session first, then start a new one to see memories.

**Memory not being stored**: `retainEveryNTurns` defaults to `10` — retain only fires every 10 turns. While testing, add `"retainEveryNTurns": 1` to `~/.hindsight/omo.json`.

**Cloud mode silently skipping**: If `hindsightApiUrl` points to Hindsight Cloud but no `hindsightApiToken` is set, hooks silently skip. Set `HINDSIGHT_API_TOKEN` or add it to `~/.hindsight/omo.json`.

**Debug mode**: Add `"debug": true` to `~/.hindsight/omo.json` to see what Hindsight is doing on each turn:

```text
[Hindsight] Recalling from bank 'omo', query length: 42
[Hindsight] Injecting 3 memories
[Hindsight] Retaining to bank 'omo', doc 'sess-abc123', 2 messages, 847 chars
```

- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/omo#quick-start)
- [Features](https://hindsight.vectorize.io/sdks/integrations/omo#features)
- [Architecture](https://hindsight.vectorize.io/sdks/integrations/omo#architecture)
- [Connection Modes](https://hindsight.vectorize.io/sdks/integrations/omo#connection-modes)
  - [1\. Hindsight Cloud (recommended)](https://hindsight.vectorize.io/sdks/integrations/omo#1-hindsight-cloud-recommended)
  - [2\. Self-Hosted](https://hindsight.vectorize.io/sdks/integrations/omo#2-self-hosted)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/omo#configuration)
  - [Connection](https://hindsight.vectorize.io/sdks/integrations/omo#connection)
  - [Memory Bank](https://hindsight.vectorize.io/sdks/integrations/omo#memory-bank)
  - [Auto-Recall](https://hindsight.vectorize.io/sdks/integrations/omo#auto-recall)
  - [Auto-Retain](https://hindsight.vectorize.io/sdks/integrations/omo#auto-retain)
  - [Debug](https://hindsight.vectorize.io/sdks/integrations/omo#debug)
- [Per-Project Memory](https://hindsight.vectorize.io/sdks/integrations/omo#per-project-memory)
- [Multi-Bank Recall](https://hindsight.vectorize.io/sdks/integrations/omo#multi-bank-recall)
- [Troubleshooting](https://hindsight.vectorize.io/sdks/integrations/omo#troubleshooting)
