<!-- source: https://hindsight.vectorize.io/sdks/integrations/composio -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/composio#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for [Composio](https://composio.dev/) agents via Hindsight. Exposes Hindsight's
**retain**, **recall**, and **reflect** operations as Composio in-process custom tools your agent
can call directly.

The Hindsight memory bank for each call is the Composio session's `user_id`, so a single
registered tool set isolates memory per user automatically.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/composio)

## Features [​](https://hindsight.vectorize.io/sdks/integrations/composio\#features "Direct link to Features")

- **Composio Custom Tools** — registered via `composio.experimental.tool()` and bound to a session
- **Per-user memory** — the session `user_id` maps to the Hindsight `bank_id` (with a configurable fallback bank)
- **Three Memory Tools** — Retain (store), Recall (search), Reflect (synthesize) — include any combination
- **Simple Configuration** — pass a client/URL directly, or `configure()` once globally

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/composio\#installation "Direct link to Installation")

```bash
pip install hindsight-composio
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/composio\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```python
from composio import Composio
from hindsight_composio import register_hindsight_tools

composio = Composio()  # uses COMPOSIO_API_KEY

tools = register_hindsight_tools(
    composio,
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="hsk_...",  # or set HINDSIGHT_API_KEY env var
)

session = composio.create(
    user_id="user-123",  # becomes the Hindsight bank_id
    experimental={"custom_tools": tools},
)

# Pass session.tools() to your agent/LLM as usual.
```

The session now has three tools the agent can call:

- **`HINDSIGHT_RETAIN`** — Store information to long-term memory
- **`HINDSIGHT_RECALL`** — Search long-term memory for relevant facts
- **`HINDSIGHT_REFLECT`** — Synthesize a reasoned answer from memories

## Bank selection [​](https://hindsight.vectorize.io/sdks/integrations/composio\#bank-selection "Direct link to Bank selection")

The bank is resolved per call:

1. The session's `user_id` (recommended — one tool set, isolated per user).
2. `default_bank` (passed to `register_hindsight_tools` or `configure`) when a call has no `user_id`.

If neither is available, the tool raises an error.

```python
tools = register_hindsight_tools(
    composio,
    hindsight_api_url="https://api.hindsight.vectorize.io",
    default_bank="shared",  # used only when a session has no user_id
)
```

### Self-hosting (local development) [​](https://hindsight.vectorize.io/sdks/integrations/composio\#self-hosting-local-development "Direct link to Self-hosting (local development)")

If you're running Hindsight locally with `./scripts/dev/start-api.sh`, swap the URL:

```python
tools = register_hindsight_tools(
    composio,
    hindsight_api_url="http://localhost:8888",
)
```

See the [installation guide](https://hindsight.vectorize.io/developer/installation) for self-hosting setup.

## Selecting tools [​](https://hindsight.vectorize.io/sdks/integrations/composio\#selecting-tools "Direct link to Selecting tools")

Include only the tools you need:

```python
tools = register_hindsight_tools(
    composio,
    hindsight_api_url="https://api.hindsight.vectorize.io",
    enable_retain=True,
    enable_recall=True,
    enable_reflect=False,  # omit reflect
)
```

## Global configuration [​](https://hindsight.vectorize.io/sdks/integrations/composio\#global-configuration "Direct link to Global configuration")

Instead of passing connection details every time, configure once:

```python
from hindsight_composio import configure, register_hindsight_tools

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="your-api-key",       # or set HINDSIGHT_API_KEY env var
    default_bank="shared",         # fallback bank when no user_id
    budget="mid",                  # recall/reflect budget: low/mid/high
    max_tokens=4096,               # max tokens for recall results
    tags=["env:prod"],             # tags for stored memories
    recall_tags=["scope:global"],  # tags to filter recall
    recall_tags_match="any",       # any/all/any_strict/all_strict
)

tools = register_hindsight_tools(composio)
```

## Configuration Reference [​](https://hindsight.vectorize.io/sdks/integrations/composio\#configuration-reference "Direct link to Configuration Reference")

### `register_hindsight_tools()` [​](https://hindsight.vectorize.io/sdks/integrations/composio\#register_hindsight_tools "Direct link to register_hindsight_tools")

| Parameter | Default | Description |
| --- | --- | --- |
| `composio` | _required_ | The `Composio` instance (provides the decorator) |
| `client` | `None` | Pre-configured Hindsight client |
| `hindsight_api_url` | `None` | API URL (used if no client provided) |
| `api_key` | `None` | API key (used if no client provided) |
| `default_bank` | `None` | Bank used when a call has no Composio `user_id` |
| `budget` | `"mid"` | Recall/reflect budget level (low/mid/high) |
| `max_tokens` | `4096` | Maximum tokens for recall results |
| `tags` | `None` | Tags applied when storing memories |
| `recall_tags` | `None` | Tags to filter when searching |
| `recall_tags_match` | `"any"` | Tag matching mode |
| `enable_retain` | `True` | Include the retain (store) tool |
| `enable_recall` | `True` | Include the recall (search) tool |
| `enable_reflect` | `True` | Include the reflect (synthesize) tool |

### `configure()` [​](https://hindsight.vectorize.io/sdks/integrations/composio\#configure "Direct link to configure")

| Parameter | Default | Description |
| --- | --- | --- |
| `hindsight_api_url` | Hindsight Cloud (`https://api.hindsight.vectorize.io`) | Hindsight API URL |
| `api_key` | `HINDSIGHT_API_KEY` env | API key for authentication |
| `default_bank` | `None` | Fallback bank when a session has no `user_id` |
| `budget` | `"mid"` | Default recall/reflect budget level |
| `max_tokens` | `4096` | Default max tokens for recall |
| `tags` | `None` | Default tags for retain operations |
| `recall_tags` | `None` | Default tags to filter recall |
| `recall_tags_match` | `"any"` | Default tag matching mode |

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/composio\#requirements "Direct link to Requirements")

- Python >= 3.10
- composio >= 0.13.1, < 1
- hindsight-client >= 0.4.0
- A running Hindsight API server (or Hindsight Cloud)

note

Composio's custom-tools API is currently experimental. This integration targets the Composio
0.13.x SDK (`from composio import Composio`) and intentionally excludes the in-progress `1.0.0`
rewrite, whose API differs.

- [Features](https://hindsight.vectorize.io/sdks/integrations/composio#features)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/composio#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/composio#quick-start)
- [Bank selection](https://hindsight.vectorize.io/sdks/integrations/composio#bank-selection)
  - [Self-hosting (local development)](https://hindsight.vectorize.io/sdks/integrations/composio#self-hosting-local-development)
- [Selecting tools](https://hindsight.vectorize.io/sdks/integrations/composio#selecting-tools)
- [Global configuration](https://hindsight.vectorize.io/sdks/integrations/composio#global-configuration)
- [Configuration Reference](https://hindsight.vectorize.io/sdks/integrations/composio#configuration-reference)
  - [`register_hindsight_tools()`](https://hindsight.vectorize.io/sdks/integrations/composio#register_hindsight_tools)
  - [`configure()`](https://hindsight.vectorize.io/sdks/integrations/composio#configure)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/composio#requirements)
