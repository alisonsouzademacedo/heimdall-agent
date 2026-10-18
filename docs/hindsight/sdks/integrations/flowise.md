<!-- source: https://hindsight.vectorize.io/sdks/integrations/flowise -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/flowise#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for [Flowise](https://flowiseai.com/) chatflows and agents via [Hindsight](https://hindsight.vectorize.io/). Three Tool nodes — **Hindsight Retain**, **Hindsight Recall**, **Hindsight Reflect** — drop into any flow alongside your other LangChain tools.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/flowise)

## Why this matters [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#why-this-matters "Direct link to Why this matters")

Flowise is the LangChain-derived visual builder for non-developers and developers alike. Until now, Flowise chatflows have been **stateless across sessions**. With Hindsight tool nodes you can:

- **Retain** every closed conversation, support ticket, or form submission into a memory bank
- **Recall** relevant context before an LLM step so the model sees prior history
- **Reflect** to ask synthesizing questions ("What do we know about this customer?") inside a flow

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#installation "Direct link to Installation")

Flowise distributes nodes only inside its main monorepo, so installation today means using a Flowise checkout with the Hindsight nodes copied in. The user-facing distribution will be the upstream PR to `FlowiseAI/Flowise`.

```bash
git clone https://github.com/FlowiseAI/Flowise.git
cd Flowise

# Copy the three tool nodes
cp -r /path/to/hindsight/hindsight-integrations/flowise/nodes/tools/Hindsight* \
  packages/components/nodes/tools/

# Copy the credential class
cp /path/to/hindsight/hindsight-integrations/flowise/credentials/HindsightApi.credential.ts \
  packages/components/credentials/

# Add the client dep
cd packages/components && pnpm add @vectorize-io/hindsight-client
cd ../.. && pnpm install && pnpm build
pnpm start  # opens http://localhost:3000
```

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#setup "Direct link to Setup")

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — no infrastructure to run. Skip straight to creating your credential below.

1. **Sign up** at [Hindsight Cloud](https://ui.hindsight.vectorize.io/) (free tier) or [self-host](https://hindsight.vectorize.io/developer/installation)
2. **Get an API key** from the Hindsight dashboard
3. **In Flowise**, create a new credential of type **Hindsight API**:
   - **API URL** — defaults to `https://api.hindsight.vectorize.io` (Cloud); change for self-hosted
   - **API Key** — your `hsk_...` key (optional for self-hosted unauthenticated instances)

## Tools [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#tools "Direct link to Tools")

Each Hindsight tool node returns a LangChain `DynamicStructuredTool`, so it slots into any agent that accepts tools.

### Hindsight Retain [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#hindsight-retain "Direct link to Hindsight Retain")

Stores content in a memory bank. Hindsight extracts facts asynchronously after the call returns.

| Field | Description |
| --- | --- |
| Default Bank ID | Memory bank to retain into when the agent doesn't pass one |

Tool input schema (the agent passes these): `bankId`, `content`, optional `tags`.

### Hindsight Recall [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#hindsight-recall "Direct link to Hindsight Recall")

Searches a bank for memories relevant to a query. Returns ranked results.

| Field | Description |
| --- | --- |
| Default Bank ID | Memory bank to search when the agent doesn't pass one |
| Default Budget | `low` / `mid` / `high` |

Tool input schema: `bankId`, `query`, optional `budget`, `maxTokens`, `tags`.

### Hindsight Reflect [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#hindsight-reflect "Direct link to Hindsight Reflect")

Returns an LLM-synthesized answer over the bank.

| Field | Description |
| --- | --- |
| Default Bank ID | Memory bank to reflect on when the agent doesn't pass one |
| Default Budget | `low` / `mid` / `high` |

Tool input schema: `bankId`, `query`, optional `budget`.

## Example chatflow [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#example-chatflow "Direct link to Example chatflow")

**Conversational support agent**

1. **ChatOpenAI** (or any chat LLM)
2. **Conversational Agent** with three tools attached: Hindsight Retain + Hindsight Recall + Hindsight Reflect, all sharing the same `hindsightApi` credential
3. Set Default Bank ID to something like `user-${sessionId}` on each tool
4. The agent learns to call Recall before answering and Retain after meaningful exchanges. Use Reflect for "what do we know about this user?" prompts.

## Source [​](https://hindsight.vectorize.io/sdks/integrations/flowise\#source "Direct link to Source")

- GitHub: [`hindsight-integrations/flowise`](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/flowise)

- [Why this matters](https://hindsight.vectorize.io/sdks/integrations/flowise#why-this-matters)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/flowise#installation)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/flowise#setup)
- [Tools](https://hindsight.vectorize.io/sdks/integrations/flowise#tools)
  - [Hindsight Retain](https://hindsight.vectorize.io/sdks/integrations/flowise#hindsight-retain)
  - [Hindsight Recall](https://hindsight.vectorize.io/sdks/integrations/flowise#hindsight-recall)
  - [Hindsight Reflect](https://hindsight.vectorize.io/sdks/integrations/flowise#hindsight-reflect)
- [Example chatflow](https://hindsight.vectorize.io/sdks/integrations/flowise#example-chatflow)
- [Source](https://hindsight.vectorize.io/sdks/integrations/flowise#source)
