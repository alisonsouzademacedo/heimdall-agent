<!-- source: https://hindsight.vectorize.io/sdks/integrations/crewai -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/crewai#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for AI agent crews via [CrewAI](https://github.com/crewAIInc/crewAI). Give your crews long-term memory with fact extraction, entity tracking, and temporal awareness.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/crewai)

## Features [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#features "Direct link to Features")

- **Drop-in Storage Backend** \- Implements CrewAI's `Storage` interface for `ExternalMemory`
- **Automatic Memory Flow** \- CrewAI automatically stores task outputs and retrieves relevant memories
- **Per-Agent Banks** \- Optionally give each agent its own isolated memory bank
- **Reflect Tool** \- Agents can explicitly reason over memories with disposition-aware synthesis
- **Simple Configuration** \- Configure once, use everywhere

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#installation "Direct link to Installation")

```bash
pip install hindsight-crewai
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```python
from hindsight_crewai import configure, HindsightStorage
from crewai.memory.external.external_memory import ExternalMemory
from crewai import Agent, Crew, Task

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="hsk_...",  # or set HINDSIGHT_API_KEY env var
)

crew = Crew(
    agents=[Agent(role="Researcher", goal="Find information", backstory="...")],
    tasks=[Task(description="Research AI trends", expected_output="Report")],
    external_memory=ExternalMemory(
        storage=HindsightStorage(bank_id="my-crew")
    ),
)

crew.kickoff()
```

That's it. CrewAI will automatically:

- **Query memories** at the start of each task
- **Store task outputs** to Hindsight after each task completes

Memories persist across crew runs, so your crew learns over time.

### Self-hosting (local development) [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#self-hosting-local-development "Direct link to Self-hosting (local development)")

If you're running Hindsight locally with `./scripts/dev/start-api.sh`, swap the URL:

```python
configure(hindsight_api_url="http://localhost:8888")
```

See the [installation guide](https://hindsight.vectorize.io/developer/installation) for self-hosting setup.

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#how-it-works "Direct link to How It Works")

The integration maps CrewAI's 3-method `Storage` interface to Hindsight's API:

| CrewAI | Hindsight | What happens |
| --- | --- | --- |
| `save(value, metadata, agent)` | `retain(bank_id, content, ...)` | Task output is stored. Hindsight extracts facts, entities, and relationships from the raw text. |
| `search(query, limit)` | `recall(bank_id, query, ...)` | CrewAI constructs a query from the task description. Hindsight runs semantic search, BM25, graph traversal, and reranking. |
| `reset()` | `delete_bank(bank_id)` | Wipes the bank and optionally recreates it with its original mission. |

CrewAI calls `search()` automatically at the start of each task and `save()` after each task completes.

## Configuration Options [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#configuration-options "Direct link to Configuration Options")

```python
from hindsight_crewai import configure

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",  # Hindsight Cloud (default)
    api_key="your-api-key",                     # Or set HINDSIGHT_API_KEY env var
    budget="mid",                               # Recall budget: "low", "mid", "high"
    max_tokens=4096,                            # Max tokens for recall results
    tags=["env:prod"],                          # Tags for stored memories
    recall_tags=["scope:global"],               # Tags to filter recall
    recall_tags_match="any",                    # Tag match: any/all/any_strict/all_strict
    verbose=True,                               # Enable logging
)
```

### Per-Storage Overrides [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#per-storage-overrides "Direct link to Per-Storage Overrides")

Constructor arguments override global configuration:

```python
storage = HindsightStorage(
    bank_id="my-crew",
    budget="high",
    max_tokens=8192,
    tags=["team:alpha"],
)
```

## Bank Missions [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#bank-missions "Direct link to Bank Missions")

Set a mission to guide how Hindsight processes and organizes memories:

```python
storage = HindsightStorage(
    bank_id="my-crew",
    mission="Track software architecture decisions, technical debt, and team preferences.",
)
```

## Per-Agent Memory Banks [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#per-agent-memory-banks "Direct link to Per-Agent Memory Banks")

Give each agent its own isolated memory bank:

```python
storage = HindsightStorage(
    bank_id="my-crew",
    per_agent_banks=True,
    # Researcher -> "my-crew-researcher"
    # Writer     -> "my-crew-writer"
)
```

Or use a custom bank resolver for full control:

```python
storage = HindsightStorage(
    bank_id="my-crew",
    bank_resolver=lambda base, agent: f"{base}-{agent.lower()}" if agent else base,
)
```

info

When `per_agent_banks=True`, the automatic `search()` at task start queries the base bank (shared context), since CrewAI's `search()` method does not receive the agent parameter. For per-agent search isolation, create separate `HindsightStorage` instances per agent.

## Reflect Tool [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#reflect-tool "Direct link to Reflect Tool")

CrewAI's storage interface only supports save/search/reset. To give agents access to Hindsight's `reflect` (disposition-aware memory synthesis), add it as a tool:

```python
from hindsight_crewai import HindsightReflectTool

reflect_tool = HindsightReflectTool(
    bank_id="my-crew",
    budget="mid",
    reflect_context="You are helping a software team track decisions.",
)

agent = Agent(
    role="Analyst",
    goal="Analyze project history",
    backstory="...",
    tools=[reflect_tool],
)
```

When the agent calls this tool, it gets a synthesized, contextual answer based on all relevant memories rather than raw fact snippets.

## Full Example [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#full-example "Direct link to Full Example")

A research crew that remembers findings across runs:

```python
from hindsight_crewai import configure, HindsightStorage, HindsightReflectTool
from crewai.memory.external.external_memory import ExternalMemory
from crewai import Agent, Crew, Task

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="hsk_...",
)

storage = HindsightStorage(
    bank_id="research-crew",
    mission="Track technology research findings and comparisons.",
)

reflect_tool = HindsightReflectTool(bank_id="research-crew", budget="mid")

researcher = Agent(
    role="Researcher",
    goal="Research topics, building on prior knowledge.",
    backstory="Before starting, use hindsight_reflect to check what you already know.",
    tools=[reflect_tool],
)

writer = Agent(
    role="Writer",
    goal="Write summaries incorporating prior findings.",
    backstory="Use hindsight_reflect to recall prior research.",
    tools=[reflect_tool],
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[\
        Task(description="Research the benefits of Rust", expected_output="Analysis", agent=researcher),\
        Task(description="Write an executive summary", expected_output="Summary", agent=writer),\
    ],
    external_memory=ExternalMemory(storage=storage),
)

# Run 1: researches Rust, stores findings
crew.kickoff()

# Run 2: recalls Rust research when comparing with Go
crew.tasks[0].description = "Compare Rust with Go"
crew.kickoff()
```

## API Reference [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#api-reference "Direct link to API Reference")

### Configuration [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#configuration "Direct link to Configuration")

| Function | Description |
| --- | --- |
| `configure(...)` | Set global connection and default settings |
| `get_config()` | Get current configuration |
| `reset_config()` | Reset configuration to None |

### Storage [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#storage "Direct link to Storage")

| Parameter | Default | Description |
| --- | --- | --- |
| `bank_id` | required | Hindsight memory bank ID |
| `hindsight_api_url` | from config | Override API URL |
| `api_key` | from config | Override API key |
| `budget` | `"mid"` | Recall budget (low/mid/high) |
| `max_tokens` | `4096` | Max tokens for recall results |
| `tags` | `None` | Tags applied when storing |
| `recall_tags` | `None` | Tags to filter when searching |
| `recall_tags_match` | `"any"` | Tag matching mode |
| `per_agent_banks` | `False` | Give each agent its own bank |
| `bank_resolver` | `None` | Custom `(bank_id, agent) -> bank_id` |
| `mission` | `None` | Bank mission for memory organization |
| `verbose` | `False` | Enable verbose logging |

### Reflect Tool [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#reflect-tool-1 "Direct link to Reflect Tool")

| Parameter | Default | Description |
| --- | --- | --- |
| `bank_id` | required | Hindsight memory bank ID |
| `budget` | `"mid"` | Reflect budget (low/mid/high) |
| `reflect_context` | `None` | Additional context for reasoning |
| `hindsight_api_url` | from config | Override API URL |
| `api_key` | from config | Override API key |

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/crewai\#requirements "Direct link to Requirements")

- Python >= 3.10
- crewai >= 0.86.0
- A running Hindsight API server

- [Features](https://hindsight.vectorize.io/sdks/integrations/crewai#features)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/crewai#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/crewai#quick-start)
  - [Self-hosting (local development)](https://hindsight.vectorize.io/sdks/integrations/crewai#self-hosting-local-development)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/crewai#how-it-works)
- [Configuration Options](https://hindsight.vectorize.io/sdks/integrations/crewai#configuration-options)
  - [Per-Storage Overrides](https://hindsight.vectorize.io/sdks/integrations/crewai#per-storage-overrides)
- [Bank Missions](https://hindsight.vectorize.io/sdks/integrations/crewai#bank-missions)
- [Per-Agent Memory Banks](https://hindsight.vectorize.io/sdks/integrations/crewai#per-agent-memory-banks)
- [Reflect Tool](https://hindsight.vectorize.io/sdks/integrations/crewai#reflect-tool)
- [Full Example](https://hindsight.vectorize.io/sdks/integrations/crewai#full-example)
- [API Reference](https://hindsight.vectorize.io/sdks/integrations/crewai#api-reference)
  - [Configuration](https://hindsight.vectorize.io/sdks/integrations/crewai#configuration)
  - [Storage](https://hindsight.vectorize.io/sdks/integrations/crewai#storage)
  - [Reflect Tool](https://hindsight.vectorize.io/sdks/integrations/crewai#reflect-tool-1)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/crewai#requirements)
