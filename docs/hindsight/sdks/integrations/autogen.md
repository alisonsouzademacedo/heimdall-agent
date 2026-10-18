<!-- source: https://hindsight.vectorize.io/sdks/integrations/autogen -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/autogen#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent long-term memory for [AutoGen](https://microsoft.github.io/autogen/) agents via Hindsight. Provides `FunctionTool` instances that plug directly into AutoGen's `AssistantAgent`.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/autogen)

## Features [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#features "Direct link to Features")

- **Memory Tools** — retain, recall, and reflect as AutoGen `FunctionTool` instances compatible with `AssistantAgent(tools=[...])`
- **Async-Native** — Uses `aretain`, `arecall`, `areflect` directly — works seamlessly in AutoGen's async runtime
- **Selective Tools** — Include only the tools you need with `include_retain/recall/reflect` flags
- **Tag-Based Scoping** — Partition memories by topic, session, or user with tags
- **Global Configuration** — Configure once with `configure()`, create tools anywhere

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#installation "Direct link to Installation")

```bash
pip install hindsight-autogen autogen-agentchat "autogen-ext[openai]"
```

`hindsight-autogen` pulls in `autogen-core` and `hindsight-client`. You also need `autogen-agentchat` for `AssistantAgent` and `autogen-ext[openai]` for the OpenAI model client.

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#quick-start "Direct link to Quick Start")

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from hindsight_client import Hindsight
from hindsight_autogen import create_hindsight_tools

async def main():
    client = Hindsight(base_url="http://localhost:8888")
    await client.acreate_bank(bank_id="user-123")

    model_client = OpenAIChatCompletionClient(model="gpt-4o")
    tools = create_hindsight_tools(client=client, bank_id="user-123")

    agent = AssistantAgent(
        name="assistant",
        model_client=model_client,
        tools=tools,
    )

    # Store a memory
    result = await agent.run(task="Remember that I prefer dark mode")
    print(result.messages[-1].content)

    # Hindsight processes retained content asynchronously (fact extraction,
    # entity resolution, embeddings). A brief pause ensures memories are
    # searchable before the next recall. In production, this delay is only
    # needed when retain and recall happen back-to-back in the same script.
    await asyncio.sleep(3)

    # Recall it later
    result = await agent.run(task="What are my UI preferences?")
    print(result.messages[-1].content)

    # Clean up
    await client.aclose()
    await model_client.close()

asyncio.run(main())
```

Jupyter Notebooks

If you're running in a Jupyter notebook, you don't need `asyncio.run()` — just use `await` directly in cells since the notebook already has an active event loop.

The agent gets three tools it can call:

- **`hindsight_retain`** — Store information to long-term memory
- **`hindsight_recall`** — Search long-term memory for relevant facts
- **`hindsight_reflect`** — Synthesize a reasoned answer from memories

## Selecting Tools [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#selecting-tools "Direct link to Selecting Tools")

Include only the tools you need:

```python
tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    include_retain=True,
    include_recall=True,
    include_reflect=False,  # Omit reflect
)
```

## Global Configuration [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#global-configuration "Direct link to Global Configuration")

Instead of passing a client to every call, configure once:

```python
from hindsight_autogen import configure, create_hindsight_tools

configure(
    hindsight_api_url="http://localhost:8888",
    api_key="your-api-key",       # Or set HINDSIGHT_API_KEY env var
    budget="mid",                  # Recall budget: low/mid/high
    max_tokens=4096,               # Max tokens for recall results
    tags=["env:prod"],             # Tags for stored memories
    recall_tags=["scope:global"],  # Tags to filter recall
    recall_tags_match="any",       # Tag match mode
)

# Now create tools without passing client — uses global config
tools = create_hindsight_tools(bank_id="user-123")
```

## Memory Scoping with Tags [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#memory-scoping-with-tags "Direct link to Memory Scoping with Tags")

Use tags to partition memories by topic, session, or user:

```python
# Store memories tagged by source
tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    tags=["source:chat", "session:abc"],
    recall_tags=["source:chat"],
    recall_tags_match="any",
)
```

## Production Patterns [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#production-patterns "Direct link to Production Patterns")

### Error Handling [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#error-handling "Direct link to Error Handling")

Tools raise `HindsightError` on failure, which AutoGen surfaces to the agent as a tool error. Wrap agent calls for graceful degradation:

```python
from hindsight_autogen.errors import HindsightError

try:
    result = await agent.run(task="What do you remember about me?")
except HindsightError as e:
    print(f"Memory operation failed: {e}")
```

### Bank Lifecycle [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#bank-lifecycle "Direct link to Bank Lifecycle")

Create banks before first use and clean up when done:

```python
async def main():
    client = Hindsight(base_url="http://localhost:8888")

    # Create bank (idempotent)
    await client.acreate_bank(bank_id="user-123")

    tools = create_hindsight_tools(client=client, bank_id="user-123")
    # ... use tools ...

    # Optional: delete bank when no longer needed
    await client.adelete_bank(bank_id="user-123")
```

### Multi-Agent Teams [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#multi-agent-teams "Direct link to Multi-Agent Teams")

Give each agent its own memory bank, or share a bank across a team:

```python
# Per-agent memory
researcher_tools = create_hindsight_tools(client=client, bank_id="researcher-memory")
writer_tools = create_hindsight_tools(client=client, bank_id="writer-memory")

# Shared team memory
shared_tools = create_hindsight_tools(
    client=client,
    bank_id="team-shared",
    tags=["team:content"],
)
```

## API Reference [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#api-reference "Direct link to API Reference")

### `create_hindsight_tools()` [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#create_hindsight_tools "Direct link to create_hindsight_tools")

| Parameter | Default | Description |
| --- | --- | --- |
| `bank_id` | _required_ | Hindsight memory bank ID |
| `client` | `None` | Pre-configured Hindsight client |
| `hindsight_api_url` | `None` | API URL (used if no client provided) |
| `api_key` | `None` | API key (used if no client provided) |
| `budget` | `"mid"` | Recall/reflect budget level (low/mid/high) |
| `max_tokens` | `4096` | Maximum tokens for recall results |
| `tags` | `None` | Tags applied when storing memories |
| `recall_tags` | `None` | Tags to filter when searching |
| `recall_tags_match` | `"any"` | Tag matching mode (any/all/any\_strict/all\_strict) |
| `retain_metadata` | `None` | Default metadata dict for retain operations |
| `retain_document_id` | `None` | Default document\_id for retain (groups/upserts memories) |
| `recall_types` | `None` | Fact types to filter (world, experience, observation) |
| `recall_include_entities` | `False` | Include entity information in recall results |
| `reflect_context` | `None` | Additional context for reflect operations |
| `reflect_max_tokens` | `None` | Max tokens for reflect results (defaults to `max_tokens`) |
| `reflect_response_schema` | `None` | JSON schema to constrain reflect output format |
| `reflect_tags` | `None` | Tags to filter memories used in reflect (defaults to `recall_tags`) |
| `reflect_tags_match` | `None` | Tag matching for reflect (defaults to `recall_tags_match`) |
| `include_retain` | `True` | Include the retain (store) tool |
| `include_recall` | `True` | Include the recall (search) tool |
| `include_reflect` | `True` | Include the reflect (synthesize) tool |

### `configure()` [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#configure "Direct link to configure")

| Parameter | Default | Description |
| --- | --- | --- |
| `hindsight_api_url` | Production API | Hindsight API URL |
| `api_key` | `HINDSIGHT_API_KEY` env | API key for authentication |
| `budget` | `"mid"` | Default recall budget level |
| `max_tokens` | `4096` | Default max tokens for recall |
| `tags` | `None` | Default tags for retain operations |
| `recall_tags` | `None` | Default tags to filter recall |
| `recall_tags_match` | `"any"` | Default tag matching mode |

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/autogen\#requirements "Direct link to Requirements")

- Python >= 3.10
- autogen-core >= 0.4.0
- hindsight-client >= 0.4.0

- [Features](https://hindsight.vectorize.io/sdks/integrations/autogen#features)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/autogen#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/autogen#quick-start)
- [Selecting Tools](https://hindsight.vectorize.io/sdks/integrations/autogen#selecting-tools)
- [Global Configuration](https://hindsight.vectorize.io/sdks/integrations/autogen#global-configuration)
- [Memory Scoping with Tags](https://hindsight.vectorize.io/sdks/integrations/autogen#memory-scoping-with-tags)
- [Production Patterns](https://hindsight.vectorize.io/sdks/integrations/autogen#production-patterns)
  - [Error Handling](https://hindsight.vectorize.io/sdks/integrations/autogen#error-handling)
  - [Bank Lifecycle](https://hindsight.vectorize.io/sdks/integrations/autogen#bank-lifecycle)
  - [Multi-Agent Teams](https://hindsight.vectorize.io/sdks/integrations/autogen#multi-agent-teams)
- [API Reference](https://hindsight.vectorize.io/sdks/integrations/autogen#api-reference)
  - [`create_hindsight_tools()`](https://hindsight.vectorize.io/sdks/integrations/autogen#create_hindsight_tools)
  - [`configure()`](https://hindsight.vectorize.io/sdks/integrations/autogen#configure)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/autogen#requirements)
