<!-- source: https://hindsight.vectorize.io/sdks/integrations/agno -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/agno#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory tools for [Agno](https://github.com/agno-agi/agno) agents via Hindsight. Give your agents long-term memory with retain, recall, and reflect — using Agno's native Toolkit pattern.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/agno)

## Features [​](https://hindsight.vectorize.io/sdks/integrations/agno\#features "Direct link to Features")

- **Native Toolkit** \- Extends Agno's `Toolkit` base class, just like `Mem0Tools`
- **Memory Instructions** \- Pre-recall memories for injection into `Agent(instructions=[...])`
- **Three Memory Tools** \- Retain (store), Recall (search), Reflect (synthesize) — include any combination
- **Flexible Bank Resolution** \- Static bank ID, `RunContext.user_id`, or custom resolver
- **Simple Configuration** \- Configure once globally, or pass a client directly

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/agno\#installation "Direct link to Installation")

```bash
pip install hindsight-agno
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/agno\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from hindsight_agno import HindsightTools

agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[HindsightTools(\
        bank_id="user-123",\
        hindsight_api_url="https://api.hindsight.vectorize.io",\
        api_key="hsk_...",  # or set HINDSIGHT_API_KEY env var\
    )],
)

agent.print_response("Remember that I prefer dark mode")
agent.print_response("What are my preferences?")
```

### Self-hosting (local development) [​](https://hindsight.vectorize.io/sdks/integrations/agno\#self-hosting-local-development "Direct link to Self-hosting (local development)")

If you're running Hindsight locally with `./scripts/dev/start-api.sh`, swap the URL to `http://localhost:8888`. See the [installation guide](https://hindsight.vectorize.io/developer/installation) for setup.

The agent now has three tools it can call:

- **`retain_memory`** — Store information to long-term memory
- **`recall_memory`** — Search long-term memory for relevant facts
- **`reflect_on_memory`** — Synthesize a reasoned answer from memories

## With Memory Instructions [​](https://hindsight.vectorize.io/sdks/integrations/agno\#with-memory-instructions "Direct link to With Memory Instructions")

Pre-recall relevant memories and inject them into the system prompt:

```python
from hindsight_agno import HindsightTools, memory_instructions

agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[HindsightTools(\
        bank_id="user-123",\
        hindsight_api_url="https://api.hindsight.vectorize.io",\
    )],
    instructions=[memory_instructions(\
        bank_id="user-123",\
        hindsight_api_url="https://api.hindsight.vectorize.io",\
    )],
)
```

## Selecting Tools [​](https://hindsight.vectorize.io/sdks/integrations/agno\#selecting-tools "Direct link to Selecting Tools")

Include only the tools you need:

```python
tools = [HindsightTools(\
    bank_id="user-123",\
    hindsight_api_url="https://api.hindsight.vectorize.io",\
    enable_retain=True,\
    enable_recall=True,\
    enable_reflect=False,  # Omit reflect\
)]
```

## Bank Resolution [​](https://hindsight.vectorize.io/sdks/integrations/agno\#bank-resolution "Direct link to Bank Resolution")

The bank ID is resolved in order:

1. **`bank_resolver`** — Custom callable `(RunContext) -> str`
2. **`bank_id`** — Static bank ID passed to constructor
3. **`run_context.user_id`** — Automatic per-user banks

```python
# Per-user banks from RunContext
agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[HindsightTools(hindsight_api_url="https://api.hindsight.vectorize.io")],
    user_id="user-123",  # Used as bank_id
)

# Custom resolver
def resolve_bank(ctx):
    return f"team-{ctx.user_id}"

agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[HindsightTools(\
        bank_resolver=resolve_bank,\
        hindsight_api_url="https://api.hindsight.vectorize.io",\
    )],
)
```

## Global Configuration [​](https://hindsight.vectorize.io/sdks/integrations/agno\#global-configuration "Direct link to Global Configuration")

Instead of passing connection details to every toolkit, configure once:

```python
from hindsight_agno import configure, HindsightTools

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="your-api-key",       # Or set HINDSIGHT_API_KEY env var
    budget="mid",                  # Recall budget: low/mid/high
    max_tokens=4096,               # Max tokens for recall results
    tags=["env:prod"],             # Tags for stored memories
    recall_tags=["scope:global"],  # Tags to filter recall
    recall_tags_match="any",       # Tag match mode: any/all/any_strict/all_strict
)

# Now create toolkit without passing connection details
tools = [HindsightTools(bank_id="user-123")]
```

## Configuration Reference [​](https://hindsight.vectorize.io/sdks/integrations/agno\#configuration-reference "Direct link to Configuration Reference")

### `HindsightTools()` [​](https://hindsight.vectorize.io/sdks/integrations/agno\#hindsighttools "Direct link to hindsighttools")

| Parameter | Default | Description |
| --- | --- | --- |
| `bank_id` | `None` | Static Hindsight memory bank ID |
| `bank_resolver` | `None` | Callable `(RunContext) -> str` for dynamic bank ID |
| `client` | `None` | Pre-configured Hindsight client |
| `hindsight_api_url` | `None` | API URL (used if no client provided) |
| `api_key` | `None` | API key (used if no client provided) |
| `budget` | `"mid"` | Recall/reflect budget level (low/mid/high) |
| `max_tokens` | `4096` | Maximum tokens for recall results |
| `tags` | `None` | Tags applied when storing memories |
| `recall_tags` | `None` | Tags to filter when searching |
| `recall_tags_match` | `"any"` | Tag matching mode |
| `enable_retain` | `True` | Include the retain (store) tool |
| `enable_recall` | `True` | Include the recall (search) tool |
| `enable_reflect` | `True` | Include the reflect (synthesize) tool |

### `memory_instructions()` [​](https://hindsight.vectorize.io/sdks/integrations/agno\#memory_instructions "Direct link to memory_instructions")

| Parameter | Default | Description |
| --- | --- | --- |
| `bank_id` | _required_ | Hindsight memory bank ID |
| `client` | `None` | Pre-configured Hindsight client |
| `hindsight_api_url` | `None` | API URL (used if no client provided) |
| `api_key` | `None` | API key (used if no client provided) |
| `query` | `"relevant context about the user"` | Recall query for memory injection |
| `budget` | `"low"` | Recall budget level |
| `max_results` | `5` | Maximum memories to inject |
| `max_tokens` | `4096` | Maximum tokens for recall results |
| `prefix` | `"Relevant memories:\n"` | Text prepended before memory list |
| `tags` | `None` | Tags to filter recall results |
| `tags_match` | `"any"` | Tag matching mode |

### `configure()` [​](https://hindsight.vectorize.io/sdks/integrations/agno\#configure "Direct link to configure")

| Parameter | Default | Description |
| --- | --- | --- |
| `hindsight_api_url` | Hindsight Cloud (`https://api.hindsight.vectorize.io`) | Hindsight API URL |
| `api_key` | `HINDSIGHT_API_KEY` env | API key for authentication |
| `budget` | `"mid"` | Default recall budget level |
| `max_tokens` | `4096` | Default max tokens for recall |
| `tags` | `None` | Default tags for retain operations |
| `recall_tags` | `None` | Default tags to filter recall |
| `recall_tags_match` | `"any"` | Default tag matching mode |
| `verbose` | `False` | Enable verbose logging |

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/agno\#requirements "Direct link to Requirements")

- Python >= 3.10
- agno
- hindsight-client >= 0.4.0
- A running Hindsight API server

- [Features](https://hindsight.vectorize.io/sdks/integrations/agno#features)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/agno#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/agno#quick-start)
  - [Self-hosting (local development)](https://hindsight.vectorize.io/sdks/integrations/agno#self-hosting-local-development)
- [With Memory Instructions](https://hindsight.vectorize.io/sdks/integrations/agno#with-memory-instructions)
- [Selecting Tools](https://hindsight.vectorize.io/sdks/integrations/agno#selecting-tools)
- [Bank Resolution](https://hindsight.vectorize.io/sdks/integrations/agno#bank-resolution)
- [Global Configuration](https://hindsight.vectorize.io/sdks/integrations/agno#global-configuration)
- [Configuration Reference](https://hindsight.vectorize.io/sdks/integrations/agno#configuration-reference)
  - [`HindsightTools()`](https://hindsight.vectorize.io/sdks/integrations/agno#hindsighttools)
  - [`memory_instructions()`](https://hindsight.vectorize.io/sdks/integrations/agno#memory_instructions)
  - [`configure()`](https://hindsight.vectorize.io/sdks/integrations/agno#configure)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/agno#requirements)
