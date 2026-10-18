<!-- source: https://hindsight.vectorize.io/sdks/integrations/smolagents -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/smolagents#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory tools for [SmolAgents](https://github.com/huggingface/smolagents) agents via Hindsight. Give your agents long-term memory with retain, recall, and reflect — using SmolAgents' native Tool pattern.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/smolagents)

## Features [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#features "Direct link to Features")

- **Native Tool Subclasses** \- Each tool extends SmolAgents' `Tool` base class
- **Memory Instructions** \- Pre-recall memories for injection into agent system prompt
- **Three Memory Tools** \- Retain (store), Recall (search), Reflect (synthesize) — include any combination
- **Factory Function** \- Create all tools in one call with shared configuration
- **Simple Configuration** \- Configure once globally, or pass a client directly

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#installation "Direct link to Installation")

```bash
pip install hindsight-smolagents
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```python
from smolagents import CodeAgent, HfApiModel
from hindsight_smolagents import create_hindsight_tools

tools = create_hindsight_tools(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="hsk_...",  # or set HINDSIGHT_API_KEY env var
)

agent = CodeAgent(
    tools=tools,
    model=HfApiModel(),
)

agent.run("Remember that I prefer dark mode")
agent.run("What are my preferences?")
```

The agent now has three tools it can call:

- **`hindsight_retain`** — Store information to long-term memory
- **`hindsight_recall`** — Search long-term memory for relevant facts
- **`hindsight_reflect`** — Synthesize a reasoned answer from memories

### Self-hosting (local development) [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#self-hosting-local-development "Direct link to Self-hosting (local development)")

If you're running Hindsight locally with `./scripts/dev/start-api.sh`, swap the URL:

```python
tools = create_hindsight_tools(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
)
```

See the [installation guide](https://hindsight.vectorize.io/developer/installation) for self-hosting setup.

## With Memory Instructions [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#with-memory-instructions "Direct link to With Memory Instructions")

Pre-recall relevant memories and inject them into the system prompt:

```python
from hindsight_smolagents import create_hindsight_tools, memory_instructions

tools = create_hindsight_tools(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
)

memories = memory_instructions(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
)

agent = CodeAgent(
    tools=tools,
    model=HfApiModel(),
    system_prompt=f"You are a helpful assistant.\n\n{memories}",
)
```

## Individual Tools [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#individual-tools "Direct link to Individual Tools")

You can also use the tool classes directly:

```python
from hindsight_smolagents import HindsightRetainTool, HindsightRecallTool

agent = CodeAgent(
    tools=[\
        HindsightRetainTool(\
            bank_id="user-123",\
            hindsight_api_url="https://api.hindsight.vectorize.io",\
        ),\
        HindsightRecallTool(\
            bank_id="user-123",\
            hindsight_api_url="https://api.hindsight.vectorize.io",\
        ),\
    ],
    model=HfApiModel(),
)
```

## Selecting Tools [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#selecting-tools "Direct link to Selecting Tools")

Include only the tools you need via the factory:

```python
tools = create_hindsight_tools(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
    enable_retain=True,
    enable_recall=True,
    enable_reflect=False,  # Omit reflect
)
```

## Global Configuration [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#global-configuration "Direct link to Global Configuration")

Instead of passing connection details to every tool, configure once:

```python
from hindsight_smolagents import configure, create_hindsight_tools

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="your-api-key",       # Or set HINDSIGHT_API_KEY env var
    budget="mid",                  # Recall budget: low/mid/high
    max_tokens=4096,               # Max tokens for recall results
    tags=["env:prod"],             # Tags for stored memories
    recall_tags=["scope:global"],  # Tags to filter recall
    recall_tags_match="any",       # Tag match mode: any/all/any_strict/all_strict
)

# Now create tools without passing connection details
tools = create_hindsight_tools(bank_id="user-123")
```

## Configuration Reference [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#configuration-reference "Direct link to Configuration Reference")

### `create_hindsight_tools()` [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#create_hindsight_tools "Direct link to create_hindsight_tools")

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
| `recall_tags_match` | `"any"` | Tag matching mode |
| `enable_retain` | `True` | Include the retain (store) tool |
| `enable_recall` | `True` | Include the recall (search) tool |
| `enable_reflect` | `True` | Include the reflect (synthesize) tool |

### `memory_instructions()` [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#memory_instructions "Direct link to memory_instructions")

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

### `configure()` [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#configure "Direct link to configure")

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

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/smolagents\#requirements "Direct link to Requirements")

- Python >= 3.10
- smolagents
- hindsight-client >= 0.4.0
- A running Hindsight API server

- [Features](https://hindsight.vectorize.io/sdks/integrations/smolagents#features)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/smolagents#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/smolagents#quick-start)
  - [Self-hosting (local development)](https://hindsight.vectorize.io/sdks/integrations/smolagents#self-hosting-local-development)
- [With Memory Instructions](https://hindsight.vectorize.io/sdks/integrations/smolagents#with-memory-instructions)
- [Individual Tools](https://hindsight.vectorize.io/sdks/integrations/smolagents#individual-tools)
- [Selecting Tools](https://hindsight.vectorize.io/sdks/integrations/smolagents#selecting-tools)
- [Global Configuration](https://hindsight.vectorize.io/sdks/integrations/smolagents#global-configuration)
- [Configuration Reference](https://hindsight.vectorize.io/sdks/integrations/smolagents#configuration-reference)
  - [`create_hindsight_tools()`](https://hindsight.vectorize.io/sdks/integrations/smolagents#create_hindsight_tools)
  - [`memory_instructions()`](https://hindsight.vectorize.io/sdks/integrations/smolagents#memory_instructions)
  - [`configure()`](https://hindsight.vectorize.io/sdks/integrations/smolagents#configure)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/smolagents#requirements)
