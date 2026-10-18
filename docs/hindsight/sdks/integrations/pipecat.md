<!-- source: https://hindsight.vectorize.io/sdks/integrations/pipecat -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/pipecat#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent long-term memory for [Pipecat](https://github.com/pipecat-ai/pipecat) voice AI pipelines via [Hindsight](https://vectorize.io/hindsight). A single `FrameProcessor` slots between your user context aggregator and LLM service — recalling relevant memories before each turn and retaining conversation content after.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/pipecat)

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```bash
pip install hindsight-pipecat
```

```python
from pipecat.pipeline.pipeline import Pipeline
from hindsight_pipecat import HindsightMemoryService

memory = HindsightMemoryService(
    bank_id="user-123",
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key="hsk_...",  # or set HINDSIGHT_API_KEY env var
)

pipeline = Pipeline([\
    transport.input(),\
    stt_service,\
    user_aggregator,\
    memory,           # ← add between user_aggregator and LLM\
    llm_service,\
    assistant_aggregator,\
    tts_service,\
    transport.output(),\
])
```

### Self-hosting (local development) [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#self-hosting-local-development "Direct link to Self-hosting (local development)")

If you'd rather self-host:

```bash
# 1. Start Hindsight
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-openai-key
hindsight-api
```

```python
# 2. Point pipecat at the local server
memory = HindsightMemoryService(
    bank_id="user-123",
    hindsight_api_url="http://localhost:8888",
)
```

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#how-it-works "Direct link to How It Works")

```text
New turn starts
  └─ OpenAILLMContextFrame arrives
       ├─ Retain previous complete turn (user+assistant) — fire-and-forget
       └─ Recall relevant memories for current user query
            └─ Inject as <hindsight_memories> system message
                 └─ Forward enriched context to LLM
```

On each `OpenAILLMContextFrame`:

1. **Retain** — any new complete user+assistant turn pairs are sent to Hindsight asynchronously (non-blocking)
2. **Recall** — the latest user message is used as the search query; results are injected as a system message before the LLM sees the context
3. **Forward** — the enriched context frame is pushed downstream

Memory accumulates across calls. By the third or fourth turn, recall starts surfacing useful context that the pipeline didn't have to re-establish.

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#configuration "Direct link to Configuration")

```python
HindsightMemoryService(
    bank_id="user-123",              # Required: memory bank to use
    hindsight_api_url="...",         # Hindsight API URL
    api_key="hsk_...",               # API key (Hindsight Cloud)
    recall_budget="mid",             # "low", "mid", or "high"
    recall_max_tokens=4096,          # Max tokens for recall results
    enable_recall=True,              # Inject memories before LLM
    enable_retain=True,              # Store turns after each exchange
    memory_prefix="Relevant memories from past conversations:\n",
)
```

### Global Configuration [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#global-configuration "Direct link to Global Configuration")

```python
from hindsight_pipecat import configure

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",  # Hindsight Cloud (default)
    api_key="hsk_...",
    recall_budget="mid",
)

# Now create services without repeating connection details
memory = HindsightMemoryService(bank_id="user-123")
```

## Compatibility [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#compatibility "Direct link to Compatibility")

Tested with Pipecat `v0.0.108`. The processor handles both the new `LLMContextFrame` and the deprecated `OpenAILLMContextFrame` for forward compatibility.

## Manual Testing [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#manual-testing "Direct link to Manual Testing")

The `examples/` directory includes an interactive text-based chat simulator for testing memory recall/retain without requiring Daily/Deepgram/Cartesia API keys:

```bash
python examples/interactive_chat.py --bank demo-user
```

The `examples/basic_pipeline.py` shows the full voice pipeline with Daily + Deepgram + OpenAI + Cartesia.

## Prerequisites [​](https://hindsight.vectorize.io/sdks/integrations/pipecat\#prerequisites "Direct link to Prerequisites")

A running Hindsight instance:

**Self-hosted:**

```bash
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-api-key
hindsight-api  # starts on http://localhost:8888
```

**Hindsight Cloud:** [Sign up](https://ui.hindsight.vectorize.io/) — no self-hosting required.

- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/pipecat#quick-start)
  - [Self-hosting (local development)](https://hindsight.vectorize.io/sdks/integrations/pipecat#self-hosting-local-development)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/pipecat#how-it-works)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/pipecat#configuration)
  - [Global Configuration](https://hindsight.vectorize.io/sdks/integrations/pipecat#global-configuration)
- [Compatibility](https://hindsight.vectorize.io/sdks/integrations/pipecat#compatibility)
- [Manual Testing](https://hindsight.vectorize.io/sdks/integrations/pipecat#manual-testing)
- [Prerequisites](https://hindsight.vectorize.io/sdks/integrations/pipecat#prerequisites)
