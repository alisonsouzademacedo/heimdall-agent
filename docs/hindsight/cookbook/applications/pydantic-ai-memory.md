<!-- source: https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Complete Application

This is a complete, runnable application demonstrating Hindsight integration.
[**View source on GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/tree/main/applications/pydantic-ai-memory)

Give your Pydantic AI agents persistent long-term memory. Chat with an assistant multiple times and watch it remember what you told it in previous sessions.

## What This Demonstrates [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#what-this-demonstrates "Direct link to What This Demonstrates")

- **Memory tools** — retain, recall, and reflect via `create_hindsight_tools()`
- **Auto-injected context** — relevant memories in every run via `memory_instructions()`
- **Persistent memory across sessions** — the agent remembers between script runs
- **Interactive chat loop** with message history reuse

## Architecture [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#architecture "Direct link to Architecture")

```text
Session 1:
    You: "I'm a Python developer working on a FastAPI project"
    │
    ├─ memory_instructions() ──► recalls prior context (empty on first run)
    ├─ Agent decides to call hindsight_retain ──► stores the fact
    └─ Agent responds with acknowledgement

Session 2:
    You: "What do you know about me?"
    │
    ├─ memory_instructions() ──► injects "User is a Python developer..."
    ├─ Agent calls hindsight_recall ──► finds stored facts
    └─ Agent responds with everything it remembers
```

## Prerequisites [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#prerequisites "Direct link to Prerequisites")

1. **Hindsight running**





```bash
export OPENAI_API_KEY=your-key

docker run --rm -it --pull always -p 8888:8888 -p 9999:9999 \
     -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
     -e HINDSIGHT_API_LLM_MODEL=o3-mini \
     -v $HOME/.hindsight-docker:/home/hindsight/.pg0 \
     ghcr.io/vectorize-io/hindsight:latest
```

2. **OpenAI API key** (for Pydantic AI's LLM)





```bash
export OPENAI_API_KEY=your-key
```

3. **Install dependencies**





```bash
cd applications/pydantic-ai-memory
pip install -r requirements.txt
```


## Quick Start [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#quick-start "Direct link to Quick Start")

### Interactive Chat [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#interactive-chat "Direct link to Interactive Chat")

```bash
python personal_assistant.py
```

Example session:

```text
Personal assistant ready (bank: personal-assistant)
Type 'quit' or 'exit' to stop.

You: I'm a Python developer and I love hiking on weekends
Assistant: I've noted that! You're a Python developer who enjoys weekend hiking.

You: What do you know about me?
Assistant: From my memory, I know that you're a Python developer and you
love hiking on weekends.

You: quit
```

Run it again — the agent still remembers:

```text
You: What are my hobbies?
Assistant: Based on my memories, you enjoy hiking on weekends!
```

### Single Query [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#single-query "Direct link to Single Query")

```bash
python personal_assistant.py "What do you remember about my preferences?"
```

### Reset Memory [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#reset-memory "Direct link to Reset Memory")

```bash
python personal_assistant.py --reset
```

## How It Works [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#how-it-works "Direct link to How It Works")

### 1\. Create a Hindsight Client [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#1-create-a-hindsight-client "Direct link to 1. Create a Hindsight Client")

```python
from hindsight_client import Hindsight

client = Hindsight(base_url="http://localhost:8888")
```

### 2\. Create Memory Tools [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#2-create-memory-tools "Direct link to 2. Create Memory Tools")

`create_hindsight_tools()` returns Pydantic AI `Tool` instances the agent can call:

```python
from hindsight_pydantic_ai import create_hindsight_tools

tools = create_hindsight_tools(client=client, bank_id="personal-assistant")
# Returns: [hindsight_retain, hindsight_recall, hindsight_reflect]
```

### 3\. Add Memory Instructions [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#3-add-memory-instructions "Direct link to 3. Add Memory Instructions")

`memory_instructions()` returns an async callable that auto-recalls relevant memories and injects them into the system prompt on every run:

```python
from hindsight_pydantic_ai import memory_instructions

instructions_fn = memory_instructions(
    client=client,
    bank_id="personal-assistant",
    query="important context about the user",
    max_results=5,
)
```

### 4\. Wire Up the Agent [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#4-wire-up-the-agent "Direct link to 4. Wire Up the Agent")

```python
from pydantic_ai import Agent

agent = Agent(
    "openai:gpt-4o-mini",
    system_prompt="You are a helpful assistant with long-term memory...",
    tools=tools,
    instructions=[instructions_fn],
)

result = await agent.run("What do you know about me?")
```

## Core Files [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#core-files "Direct link to Core Files")

| File | Description |
| --- | --- |
| `personal_assistant.py` | Complete working example with interactive chat and single-query modes |
| `requirements.txt` | Python dependencies |

## Customization [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#customization "Direct link to Customization")

### Use Only Tools (No Auto-Injection) [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#use-only-tools-no-auto-injection "Direct link to Use Only Tools (No Auto-Injection)")

Let the agent decide when to search memory, rather than always injecting context:

```python
agent = Agent(
    "openai:gpt-4o-mini",
    tools=create_hindsight_tools(client=client, bank_id="my-bank"),
)
```

### Use Only Instructions (No Tools) [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#use-only-instructions-no-tools "Direct link to Use Only Instructions (No Tools)")

Auto-inject memories without giving the agent explicit retain/recall/reflect tools:

```python
agent = Agent(
    "openai:gpt-4o-mini",
    instructions=[memory_instructions(client=client, bank_id="my-bank")],
)
```

### Select Specific Tools [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#select-specific-tools "Direct link to Select Specific Tools")

```python
tools = create_hindsight_tools(
    client=client,
    bank_id="my-bank",
    include_retain=True,
    include_recall=True,
    include_reflect=False,  # Omit reflect
)
```

### Use a Different Model [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#use-a-different-model "Direct link to Use a Different Model")

Any [Pydantic AI model](https://ai.pydantic.dev/models/) works:

```python
agent = Agent(
    "anthropic:claude-sonnet-4-20250514",
    tools=create_hindsight_tools(client=client, bank_id="my-bank"),
)
```

## Common Issues [​](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory\#common-issues "Direct link to Common Issues")

**"Connection refused"**

- Make sure Hindsight is running on `localhost:8888`

**"OPENAI\_API\_KEY not set"**

```bash
export OPENAI_API_KEY=your-key
```

**"No module named 'hindsight\_pydantic\_ai'"**

```bash
pip install -r requirements.txt
```

* * *

**Built with:**

- [Pydantic AI](https://ai.pydantic.dev/) \- Type-safe AI agent framework
- [hindsight-pydantic-ai](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/pydantic-ai) \- Hindsight memory tools for Pydantic AI
- [Hindsight](https://github.com/vectorize-io/hindsight) \- Long-term memory for AI agents

- [What This Demonstrates](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#what-this-demonstrates)
- [Architecture](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#architecture)
- [Prerequisites](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#prerequisites)
- [Quick Start](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#quick-start)
  - [Interactive Chat](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#interactive-chat)
  - [Single Query](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#single-query)
  - [Reset Memory](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#reset-memory)
- [How It Works](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#how-it-works)
  - [1\. Create a Hindsight Client](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#1-create-a-hindsight-client)
  - [2\. Create Memory Tools](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#2-create-memory-tools)
  - [3\. Add Memory Instructions](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#3-add-memory-instructions)
  - [4\. Wire Up the Agent](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#4-wire-up-the-agent)
- [Core Files](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#core-files)
- [Customization](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#customization)
  - [Use Only Tools (No Auto-Injection)](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#use-only-tools-no-auto-injection)
  - [Use Only Instructions (No Tools)](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#use-only-instructions-no-tools)
  - [Select Specific Tools](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#select-specific-tools)
  - [Use a Different Model](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#use-a-different-model)
- [Common Issues](https://hindsight.vectorize.io/cookbook/applications/pydantic-ai-memory#common-issues)
