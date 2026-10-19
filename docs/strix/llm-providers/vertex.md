<!-- source: https://docs.strix.ai/llm-providers/vertex.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Google Vertex AI

> Configure Strix with Gemini models via Google Cloud

## Setup

```bash theme={null}
export STRIX_LLM="vertex_ai/gemini-3-pro-preview"
```

No API key required—uses Google Cloud Application Default Credentials.

## Authentication

### Option 1: gcloud CLI

```bash theme={null}
gcloud auth application-default login
```

### Option 2: Service Account

```bash theme={null}
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

## Available Models

| Model | Description |
| - | - |
| `vertex_ai/gemini-3-pro-preview` | Best overall performance for security testing |
| `vertex_ai/gemini-3-flash-preview` | Faster and cheaper |

## Project Configuration

```bash theme={null}
export VERTEXAI_PROJECT="your-project-id"
export VERTEXAI_LOCATION="global"
```

## Prerequisites

1. Enable the Vertex AI API in your Google Cloud project
2. Ensure your account has the `Vertex AI User` role


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
