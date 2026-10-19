<!-- source: https://docs.strix.ai/llm-providers/vercel-ai-gateway.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Vercel AI Gateway

> Configure Strix with models via Vercel AI Gateway

[Vercel AI Gateway](https://vercel.com/docs/ai-gateway) provides an OpenAI-compatible API for models from multiple providers.

## Setup

Create an [AI Gateway API key](https://vercel.com/docs/ai-gateway/authentication-and-byok), then configure Strix:

```bash theme={null}
export STRIX_LLM="openai/anthropic/claude-opus-5"
export LLM_API_KEY="your-ai-gateway-api-key"
export LLM_API_BASE="https://ai-gateway.vercel.sh/v1"
```

The first `openai/` segment tells Strix to use its OpenAI-compatible client. The remaining value is the [AI Gateway model ID](https://vercel.com/docs/ai-gateway/models-and-providers).

## Available Models

Use any language model returned by the AI Gateway models endpoint:

```text theme={null}
https://ai-gateway.vercel.sh/v1/models
```

Prefix its model ID with `openai/` when setting `STRIX_LLM`. For example, the Gateway model ID `anthropic/claude-opus-5` becomes `openai/anthropic/claude-opus-5` in Strix.

## Get API Key

1. Open the [AI Gateway API key settings](https://vercel.com/docs/ai-gateway/authentication-and-byok)
2. Create an API key
3. Set the key as `LLM_API_KEY`

## Benefits

* Access models from multiple providers through one endpoint
* Track Gateway usage and cost in Vercel


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
