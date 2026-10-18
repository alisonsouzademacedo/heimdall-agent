<!-- source: https://hindsight.vectorize.io/sdks/integrations/haystack -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/haystack#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent long-term memory for [Haystack](https://haystack.deepset.ai/) agents via Hindsight. The `hindsight-haystack` package gives you two complementary patterns:

- **`create_hindsight_tools(...)`** — Returns a list of Haystack `Tool`s (`retain_memory`, `recall_memory`, `reflect_on_memory`) the model can call directly inside a turn.
- **`HindsightMemoryWrapper`** — A Haystack `Toolset` that bundles the same tools and adds optional **auto-recall** (inject relevant memories into the system prompt before each turn) and **auto-retain** (store user + assistant messages after each turn).

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/haystack)

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#installation "Direct link to Installation")

```bash
pip install hindsight-haystack
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#quick-start "Direct link to Quick Start")

```python
from hindsight_client import Hindsight
from hindsight_haystack import create_hindsight_tools
from haystack.components.agents import Agent
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

client = Hindsight(base_url="http://localhost:8888")

tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    mission="Track user preferences",
)

agent = Agent(
    chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
    tools=tools,
    system_prompt=(
        "You are a helpful assistant with long-term memory. "
        "Use retain_memory to store important facts. "
        "Use recall_memory to search memory before answering."
    ),
)

result = agent.run(messages=[ChatMessage.from_user("Remember that I prefer dark mode")])
print(result["messages"][-1].text)
```

## Automatic Memory with HindsightMemoryWrapper [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#automatic-memory-with-hindsightmemorywrapper "Direct link to Automatic Memory with HindsightMemoryWrapper")

For automatic recall and retain without relying on the agent to call tools:

```python
from hindsight_haystack import HindsightMemoryWrapper

toolset = HindsightMemoryWrapper(
    client=client,
    bank_id="user-123",
    mission="Track user preferences",
    auto_recall=True,   # Inject memories into the system prompt before each turn
    auto_retain=True,   # Store user + assistant messages after each turn
)

agent = Agent(
    chat_generator=OpenAIChatGenerator(model="gpt-4o-mini"),
    tools=toolset,
    system_prompt="You are a helpful assistant with long-term memory.",
)

# Use toolset.run() for automatic memory behavior
result = toolset.run(agent, messages=[ChatMessage.from_user("I prefer dark mode")])
```

## Selective Tools [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#selective-tools "Direct link to Selective Tools")

```python
# Only retain + recall (no reflect)
tools = create_hindsight_tools(
    client=client,
    bank_id="user-123",
    include_reflect=False,
)
```

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#configuration "Direct link to Configuration")

Call `configure()` once to set connection defaults so you can omit `client=`/`hindsight_api_url=` on every call:

```python
from hindsight_haystack import configure

configure(
    hindsight_api_url="http://localhost:8888",
    api_key="your-api-key",
    budget="mid",
    tags=["source:haystack"],
    context="my-app",
    mission="Track user preferences",
)

tools = create_hindsight_tools(bank_id="user-123")
```

The API URL defaults to Hindsight Cloud (`https://api.hindsight.vectorize.io`), and the API key falls back to the `HINDSIGHT_API_KEY` environment variable.

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#requirements "Direct link to Requirements")

- Python 3.10+
- `haystack-ai >= 2.12.0`
- `hindsight-client >= 0.4.0`

## Prerequisites [​](https://hindsight.vectorize.io/sdks/integrations/haystack\#prerequisites "Direct link to Prerequisites")

A running Hindsight instance:

**Hindsight Cloud (recommended):** [Sign up](https://ui.hindsight.vectorize.io/) — no self-hosting required.

**Self-hosted:**

```bash
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-api-key
hindsight-api  # starts on http://localhost:8888
```

- [Installation](https://hindsight.vectorize.io/sdks/integrations/haystack#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/haystack#quick-start)
- [Automatic Memory with HindsightMemoryWrapper](https://hindsight.vectorize.io/sdks/integrations/haystack#automatic-memory-with-hindsightmemorywrapper)
- [Selective Tools](https://hindsight.vectorize.io/sdks/integrations/haystack#selective-tools)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/haystack#configuration)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/haystack#requirements)
- [Prerequisites](https://hindsight.vectorize.io/sdks/integrations/haystack#prerequisites)
