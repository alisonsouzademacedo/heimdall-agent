<!-- source: https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Complete Application

This is a complete, runnable application demonstrating Hindsight integration.
[**View source on GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/tree/main/applications/hindsight-litellm-demo)

Interactive Streamlit app comparing three memory approaches for LLM applications:

1. **No Memory** \- Each query is independent (baseline)
2. **Full Conversation History** \- Pass entire conversation (truncated to simulate context limits)
3. **Hindsight Memory** \- Intelligent semantic memory retrieval

This demo showcases how Hindsight's semantic memory outperforms traditional approaches, especially as conversations grow longer.

## Quick Start [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#quick-start "Direct link to Quick Start")

```bash
# 1. Set your OpenAI API key
export OPENAI_API_KEY=your-key

# 2. Start Hindsight server
docker run -d -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  ghcr.io/vectorize-io/hindsight:latest

# 3. Run the demo
./run.sh
```

Then open [http://localhost:8501](http://localhost:8501/) in your browser.

## What This Demo Shows [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#what-this-demo-shows "Direct link to What This Demo Shows")

### The Problem with Traditional Approaches [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#the-problem-with-traditional-approaches "Direct link to The Problem with Traditional Approaches")

| Approach | How it Works | Limitation |
| --- | --- | --- |
| **No Memory** | Each query standalone | Forgets everything between messages |
| **Full History** | Pass all messages to LLM | Token limits cause truncation - loses early context |
| **Hindsight** | Semantic retrieval of relevant facts | Retrieves what's relevant regardless of when it was said |

### Key Insight [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#key-insight "Direct link to Key Insight")

After 5-10 messages, watch the **Full Conversation History** column start losing early context due to truncation (artificially set to 4 messages to demonstrate this quickly). Meanwhile, **Hindsight Memory** can still recall facts from the beginning because it uses semantic retrieval rather than sequential history.

## Testing the Demo [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#testing-the-demo "Direct link to Testing the Demo")

1. **Introduce yourself**:
   - "Hi, I'm Sarah, a data scientist at Netflix"
   - "I prefer Python and love machine learning"
2. **Have several exchanges** about different topics

3. **Test recall**:
   - "What programming language should I use?"
   - "What do you know about me?"

Watch how the three columns respond differently as the conversation grows.

## Features [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#features "Direct link to Features")

- **Side-by-side comparison** of all three approaches
- **Debug panels** showing what context each approach uses
- **Memory explorer** to search Hindsight memories directly
- **Configurable settings** for history truncation, max memories, etc.
- **Multi-provider support** via LiteLLM (OpenAI, Anthropic, Groq)

## Prerequisites [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#prerequisites "Direct link to Prerequisites")

- Python 3.10+
- Hindsight server running (Docker recommended)
- At least one LLM API key (OpenAI recommended)

## Setup [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#setup "Direct link to Setup")

### Using run.sh (Recommended) [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#using-runsh-recommended "Direct link to Using run.sh (Recommended)")

```bash
# Set API key
export OPENAI_API_KEY=your-key

# Start Hindsight, then run:
./run.sh
```

The script will check and install dependencies automatically.

### Manual Setup [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#manual-setup "Direct link to Manual Setup")

```bash
# Install dependencies
pip install streamlit litellm

# Install Hindsight packages
pip install hindsight-client hindsight-litellm

# Run the app
streamlit run app.py
```

### Starting Hindsight Server [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#starting-hindsight-server "Direct link to Starting Hindsight Server")

```bash
docker run -d -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  ghcr.io/vectorize-io/hindsight:latest

# Verify it's running
curl http://localhost:8888/health
```

## Configuration [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#configuration "Direct link to Configuration")

### Sidebar Options [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#sidebar-options "Direct link to Sidebar Options")

**Model Selection:**

- Provider: OpenAI, Anthropic, Groq
- Model: Various models per provider
- Custom model ID support

**Full History Config:**

- Max Messages to Keep (default: 4 to demonstrate truncation)

**Hindsight Config:**

- API URL (default: [http://localhost:8888](http://localhost:8888/))
- Bank ID and Entity ID for memory isolation
- Max Memories to retrieve
- Recall Budget (low/mid/high)

**Generation Settings:**

- Temperature
- Max Tokens
- System Prompt

## Supported Models [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#supported-models "Direct link to Supported Models")

### OpenAI [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#openai "Direct link to OpenAI")

- gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo

### Anthropic [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#anthropic "Direct link to Anthropic")

- claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022
- claude-3-opus-20240229, claude-3-sonnet-20240229

### Groq [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#groq "Direct link to Groq")

- groq/llama-3.1-70b-versatile, groq/llama-3.1-8b-instant
- groq/mixtral-8x7b-32768

## Environment Variables [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#environment-variables "Direct link to Environment Variables")

```bash
# Required
export OPENAI_API_KEY=sk-...

# Optional (for other providers)
export ANTHROPIC_API_KEY=sk-ant-...
export GROQ_API_KEY=gsk_...

# Optional
export HINDSIGHT_URL=http://localhost:8888
```

## Troubleshooting [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#troubleshooting "Direct link to Troubleshooting")

### Hindsight server not responding [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#hindsight-server-not-responding "Direct link to Hindsight server not responding")

```bash
# Check if running
curl http://localhost:8888/health

# Start with Docker
docker run -d -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  ghcr.io/vectorize-io/hindsight:latest
```

### hindsight-litellm not installed [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#hindsight-litellm-not-installed "Direct link to hindsight-litellm not installed")

```bash
pip install hindsight-litellm
```

### API key errors [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#api-key-errors "Direct link to API key errors")

Make sure the appropriate API key is set:

```bash
export OPENAI_API_KEY=your-key
```

## Related [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#related "Direct link to Related")

- [Hindsight](https://github.com/vectorize-io/hindsight) \- Memory infrastructure for AI applications
- [hindsight-litellm](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/litellm) \- LiteLLM integration package

## License [​](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo\#license "Direct link to License")

MIT

- [Quick Start](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#quick-start)
- [What This Demo Shows](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#what-this-demo-shows)
  - [The Problem with Traditional Approaches](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#the-problem-with-traditional-approaches)
  - [Key Insight](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#key-insight)
- [Testing the Demo](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#testing-the-demo)
- [Features](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#features)
- [Prerequisites](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#prerequisites)
- [Setup](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#setup)
  - [Using run.sh (Recommended)](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#using-runsh-recommended)
  - [Manual Setup](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#manual-setup)
  - [Starting Hindsight Server](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#starting-hindsight-server)
- [Configuration](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#configuration)
  - [Sidebar Options](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#sidebar-options)
- [Supported Models](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#supported-models)
  - [OpenAI](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#openai)
  - [Anthropic](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#anthropic)
  - [Groq](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#groq)
- [Environment Variables](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#environment-variables)
- [Troubleshooting](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#troubleshooting)
  - [Hindsight server not responding](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#hindsight-server-not-responding)
  - [hindsight-litellm not installed](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#hindsight-litellm-not-installed)
  - [API key errors](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#api-key-errors)
- [Related](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#related)
- [License](https://hindsight.vectorize.io/cookbook/applications/hindsight-litellm-demo#license)
