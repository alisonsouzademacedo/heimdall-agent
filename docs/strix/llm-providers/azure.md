<!-- source: https://docs.strix.ai/llm-providers/azure.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Azure OpenAI

> Configure Strix with OpenAI models via Azure

## Setup

```bash theme={null}
export STRIX_LLM="azure/your-gpt5-deployment"
export AZURE_API_KEY="your-azure-api-key"
export AZURE_API_BASE="https://your-resource.openai.azure.com"
export AZURE_API_VERSION="2025-11-01-preview"
```

## Configuration

| Variable | Description |
| - | - |
| `STRIX_LLM` | `azure/<your-deployment-name>` |
| `AZURE_API_KEY` | Your Azure OpenAI API key |
| `AZURE_API_BASE` | Your Azure OpenAI endpoint URL |
| `AZURE_API_VERSION` | API version (e.g., `2025-11-01-preview`) |

## Example

```bash theme={null}
export STRIX_LLM="azure/gpt-5.4-deployment"
export AZURE_API_KEY="abc123..."
export AZURE_API_BASE="https://mycompany.openai.azure.com"
export AZURE_API_VERSION="2025-11-01-preview"
```

## Prerequisites

1. Create an Azure OpenAI resource
2. Deploy a model (e.g., GPT-5.4)
3. Get the endpoint URL and API key from the Azure portal


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
