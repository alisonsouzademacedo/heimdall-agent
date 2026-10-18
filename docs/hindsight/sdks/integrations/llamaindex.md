<!-- source: https://hindsight.vectorize.io/sdks/integrations/llamaindex -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/llamaindex#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent long-term memory for [LlamaIndex](https://docs.llamaindex.ai/) agents via Hindsight. The `hindsight-llamaindex` package provides two complementary patterns:

- **`HindsightToolSpec`** — Agent-driven memory tools (retain/recall/reflect)
- **`HindsightMemory`** — Automatic memory via LlamaIndex's `BaseMemory` interface

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/llamaindex)

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#installation "Direct link to Installation")

```bash
pip install hindsight-llamaindex
```

* * *

## Automatic Memory (BaseMemory) [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#automatic-memory-basememory "Direct link to Automatic Memory (BaseMemory)")

The simplest way to add Hindsight memory to a LlamaIndex agent. Messages are automatically stored on each turn, and relevant memories are recalled and injected as context.

```python
import asyncio
from hindsight_client import Hindsight
from hindsight_llamaindex import HindsightMemory
from llama_index.core.agent import ReActAgent
from llama_index.llms.openai import OpenAI

async def main():
    client = Hindsight(base_url="http://localhost:8888")

    memory = HindsightMemory.from_client(
        client=client,
        bank_id="user-123",
        mission="Track user preferences and project context",
    )

    agent = ReActAgent(tools=[], llm=OpenAI(model="gpt-4o"))
    response = await agent.run("Remember that I prefer dark mode", memory=memory)
    print(response)

asyncio.run(main())
```

### How It Works [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#how-it-works "Direct link to How It Works")

| Event | What Happens |
| --- | --- |
| Agent receives input | `aget(input)` recalls relevant memories from Hindsight, prepends as system message |
| Agent produces output | `aput(message)` retains the message to Hindsight for future recall |
| New session starts | Previous memories are available via recall; local chat buffer starts empty |

### `HindsightMemory.from_client()` [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#hindsightmemoryfrom_client "Direct link to hindsightmemoryfrom_client")

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `client` | `Hindsight` | _required_ | Hindsight client instance |
| `bank_id` | `str` | _required_ | Memory bank ID |
| `mission` | `str` | `None` | Bank mission — auto-creates bank on first use |
| `context` | `str` | `"llamaindex"` | Source label for retain operations |
| `budget` | `str` | `"mid"` | Recall budget level |
| `max_tokens` | `int` | `4096` | Max recall tokens |
| `tags` | `list[str]` | `None` | Tags for retain operations |
| `recall_tags` | `list[str]` | `None` | Tags to filter recall |
| `recall_tags_match` | `str` | `"any"` | Tag matching mode |
| `system_prompt` | `str` | _(built-in)_ | Template for memory system message. Must contain `{memories}` |
| `chat_history_limit` | `int` | `100` | Max messages in local buffer |

Also available: `HindsightMemory.from_url(hindsight_api_url, bank_id, ...)` for creating without a pre-built client.

* * *

## Agent-Driven Tools (BaseToolSpec) [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#agent-driven-tools-basetoolspec "Direct link to Agent-Driven Tools (BaseToolSpec)")

For explicit control, expose retain/recall/reflect as tools the agent can choose to call.

### Quick Start: Tool Spec [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#quick-start-tool-spec "Direct link to Quick Start: Tool Spec")

```python
import asyncio
from hindsight_client import Hindsight
from hindsight_llamaindex import HindsightToolSpec
from llama_index.llms.openai import OpenAI
from llama_index.core.agent import ReActAgent

async def main():
    client = Hindsight(base_url="http://localhost:8888")

    spec = HindsightToolSpec(
        client=client,
        bank_id="user-123",
        mission="Track user preferences",
    )
    tools = spec.to_tool_list()

    agent = ReActAgent(tools=tools, llm=OpenAI(model="gpt-4o"))
    response = await agent.run("Remember that I prefer dark mode")
    print(response)

asyncio.run(main())
```

### Quick Start: Factory Function [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#quick-start-factory-function "Direct link to Quick Start: Factory Function")

```python
from hindsight_llamaindex import create_hindsight_tools

tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    mission="Track user preferences",
)
```

### Selecting Tools [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#selecting-tools "Direct link to Selecting Tools")

```python
# Via to_tool_list()
tools = spec.to_tool_list(spec_functions=["recall_memory", "reflect_on_memory"])

# Via factory flags
tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    include_retain=True,
    include_recall=True,
    include_reflect=False,
)
```

### Configuration [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#configuration "Direct link to Configuration")

Set defaults via `configure()`, override per-call:

```python
from hindsight_llamaindex import configure

configure(
    hindsight_api_url="http://localhost:8888",
    api_key="your-api-key",  # or set HINDSIGHT_API_KEY env var
    budget="mid",
    tags=["source:llamaindex"],
    context="my-app",
    mission="Track user preferences",
)

# Now create tools without passing client/url
tools = create_hindsight_tools(bank_id="user-123")
```

### `HindsightToolSpec()` [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#hindsighttoolspec "Direct link to hindsighttoolspec")

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `bank_id` | `str` | _required_ | Hindsight memory bank to operate on |
| `client` | `Hindsight` | `None` | Pre-configured Hindsight client |
| `hindsight_api_url` | `str` | `None` | API URL (used if no client provided) |
| `api_key` | `str` | `None` | API key (used if no client provided) |
| `budget` | `str` | `None` → `"mid"` | Recall/reflect budget: `low`, `mid`, `high` |
| `max_tokens` | `int` | `None` → `4096` | Max tokens for recall results |
| `tags` | `list[str]` | `None` | Tags applied when storing memories |
| `recall_tags` | `list[str]` | `None` | Tags to filter recall results |
| `recall_tags_match` | `str` | `None` → `"any"` | Tag matching: `any`, `all`, `any_strict`, `all_strict` |
| `retain_metadata` | `dict[str, str]` | `None` | Default metadata for retain operations |
| `retain_document_id` | `str` | `None` | Document ID for retain. Auto-generates `{session}-{timestamp}` if not set |
| `retain_context` | `str` | `"llamaindex"` | Source label for retain operations |
| `recall_types` | `list[str]` | `None` | Fact types: `world`, `experience`, `observation` |
| `recall_include_entities` | `bool` | `False` | Include entity info in recall results |
| `reflect_context` | `str` | `None` | Additional context for reflect |
| `reflect_max_tokens` | `int` | `None` | Max tokens for reflect (defaults to `max_tokens`) |
| `reflect_response_schema` | `dict` | `None` | JSON schema to constrain reflect output |
| `reflect_tags` | `list[str]` | `None` | Tags for reflect (defaults to `recall_tags`) |
| `reflect_tags_match` | `str` | `None` | Tag matching for reflect (defaults to `recall_tags_match`) |
| `mission` | `str` | `None` | Bank mission — auto-creates bank on first use |

* * *

## Production Patterns [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#production-patterns "Direct link to Production Patterns")

### Bank Mission [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#bank-mission "Direct link to Bank Mission")

Set a mission to give the memory engine context for fact extraction:

```python
# Tools
spec = HindsightToolSpec(
    client=client,
    bank_id="user-123",
    mission="Track user coding preferences, project context, and technical decisions",
)

# Memory
memory = HindsightMemory.from_client(
    client=client,
    bank_id="user-123",
    mission="Track user coding preferences, project context, and technical decisions",
)
```

The bank is created automatically on first use. If it already exists, creation is silently skipped.

### Memory Scoping with Tags [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#memory-scoping-with-tags "Direct link to Memory Scoping with Tags")

```python
spec = HindsightToolSpec(
    client=client,
    bank_id="user-123",
    tags=["source:chat", "session:abc"],        # applied to all retains
    recall_tags=["source:chat"],                 # filter recalls to chat memories
    recall_tags_match="any",
)
```

### Error Handling [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#error-handling "Direct link to Error Handling")

Both patterns handle errors gracefully — operations are logged and return friendly messages instead of raising exceptions. Agents continue functioning even if memory is unavailable.

### Combining Tools + Memory [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#combining-tools--memory "Direct link to Combining Tools + Memory")

Use both patterns together for maximum flexibility:

```python
from hindsight_llamaindex import create_hindsight_tools, HindsightMemory

# Automatic memory for context enrichment
memory = HindsightMemory.from_client(client=client, bank_id="user-123")

# Explicit tools for agent-driven reflect
tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    include_retain=False,   # memory handles retain automatically
    include_recall=False,   # memory handles recall automatically
    include_reflect=True,   # agent can still explicitly reflect
)

agent = ReActAgent(tools=tools, llm=llm)

# Pass memory to run()
response = await agent.run("What should I prioritize?", memory=memory)
```

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/llamaindex\#requirements "Direct link to Requirements")

- Python 3.10+
- `llama-index-core >= 0.11.0`
- `hindsight-client >= 0.4.0`

- [Installation](https://hindsight.vectorize.io/sdks/integrations/llamaindex#installation)
- [Automatic Memory (BaseMemory)](https://hindsight.vectorize.io/sdks/integrations/llamaindex#automatic-memory-basememory)
  - [How It Works](https://hindsight.vectorize.io/sdks/integrations/llamaindex#how-it-works)
  - [`HindsightMemory.from_client()`](https://hindsight.vectorize.io/sdks/integrations/llamaindex#hindsightmemoryfrom_client)
- [Agent-Driven Tools (BaseToolSpec)](https://hindsight.vectorize.io/sdks/integrations/llamaindex#agent-driven-tools-basetoolspec)
  - [Quick Start: Tool Spec](https://hindsight.vectorize.io/sdks/integrations/llamaindex#quick-start-tool-spec)
  - [Quick Start: Factory Function](https://hindsight.vectorize.io/sdks/integrations/llamaindex#quick-start-factory-function)
  - [Selecting Tools](https://hindsight.vectorize.io/sdks/integrations/llamaindex#selecting-tools)
  - [Configuration](https://hindsight.vectorize.io/sdks/integrations/llamaindex#configuration)
  - [`HindsightToolSpec()`](https://hindsight.vectorize.io/sdks/integrations/llamaindex#hindsighttoolspec)
- [Production Patterns](https://hindsight.vectorize.io/sdks/integrations/llamaindex#production-patterns)
  - [Bank Mission](https://hindsight.vectorize.io/sdks/integrations/llamaindex#bank-mission)
  - [Memory Scoping with Tags](https://hindsight.vectorize.io/sdks/integrations/llamaindex#memory-scoping-with-tags)
  - [Error Handling](https://hindsight.vectorize.io/sdks/integrations/llamaindex#error-handling)
  - [Combining Tools + Memory](https://hindsight.vectorize.io/sdks/integrations/llamaindex#combining-tools--memory)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/llamaindex#requirements)
