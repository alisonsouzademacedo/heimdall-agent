<!-- source: https://hindsight.vectorize.io/sdks/integrations/eliza -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/eliza#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

The `@vectorize-io/hindsight-eliza` package gives [elizaOS](https://github.com/elizaOS/eliza) agents long-term memory backed by [Hindsight](https://hindsight.vectorize.io/).

It registers two components on your agent:

- A **provider** (`HINDSIGHT_MEMORY`) that recalls relevant memories and injects them into the prompt before each model call.
- An **evaluator** (`HINDSIGHT_RETAIN`) that retains conversation messages to Hindsight after each turn.

Both are enabled by default, layer on top of elizaOS's existing memory, and fail safe — a memory-service hiccup never blocks your agent from responding.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/eliza)

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/eliza\#installation "Direct link to Installation")

```bash
npm install @vectorize-io/hindsight-eliza @vectorize-io/hindsight-client
```

This package targets `@elizaos/core``^1.7.2` (declared as a peer dependency).

## Usage [​](https://hindsight.vectorize.io/sdks/integrations/eliza\#usage "Direct link to Usage")

Create the plugin and add it to your character's plugin list:

```ts
import { createHindsightPlugin } from "@vectorize-io/hindsight-eliza";
import { Hindsight } from "@vectorize-io/hindsight-client";

const hindsightPlugin = createHindsightPlugin({
  client: new Hindsight({ apiKey: process.env.HINDSIGHT_API_KEY }),
  recall: { budget: "high", includeEntities: true },
  retain: { tags: ["source:eliza"] },
});

export const character = {
  name: "Ada",
  plugins: [\
    // ...your other plugins\
    hindsightPlugin,\
  ],
};
```

By default each agent message is stored under a memory **bank** keyed by the
message's `entityId`, giving every user an isolated memory store.

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/eliza\#configuration "Direct link to Configuration")

```ts
createHindsightPlugin({
  client,

  // Which memory bank to read/write. A string uses one fixed bank for all
  // messages; a function derives the bank per message. Defaults to
  // `message.entityId` (one bank per user).
  bank: (message) => message.entityId,

  recall: {
    enabled: true,            // set false to disable recall
    budget: "mid",            // "low" | "mid" | "high" — latency vs. depth
    types: ["world", "experience"], // restrict to fact types
    maxTokens: 1000,          // cap recalled tokens
    includeEntities: false,   // include entity observations
    heading: "# Relevant long-term memories", // prompt heading
  },

  retain: {
    enabled: true,            // set false to disable retain
    async: true,              // fire-and-forget; never adds turn latency
    tags: ["source:eliza"],   // tags on every retained memory
    metadata: { env: "prod" },
    includeAgentMessages: false, // also store the agent's own replies
  },
});
```

### Using only recall or only retain [​](https://hindsight.vectorize.io/sdks/integrations/eliza\#using-only-recall-or-only-retain "Direct link to Using only recall or only retain")

Disable either side with `recall.enabled: false` or `retain.enabled: false`. You
can also build the components directly with `createHindsightProvider` and
`createHindsightEvaluator` if you want to wire them into a plugin yourself.

## How it works [​](https://hindsight.vectorize.io/sdks/integrations/eliza\#how-it-works "Direct link to How it works")

| Component | elizaOS seam | When it runs | What it does |
| --- | --- | --- | --- |
| `HINDSIGHT_MEMORY` | Provider | During prompt composition, before the model call | Calls Hindsight `recall` with the incoming message and injects the results into context |
| `HINDSIGHT_RETAIN` | Evaluator | After the agent processes the turn | Calls Hindsight `retain` to persist the message (and optionally the agent's replies) |

- [Installation](https://hindsight.vectorize.io/sdks/integrations/eliza#installation)
- [Usage](https://hindsight.vectorize.io/sdks/integrations/eliza#usage)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/eliza#configuration)
  - [Using only recall or only retain](https://hindsight.vectorize.io/sdks/integrations/eliza#using-only-recall-or-only-retain)
- [How it works](https://hindsight.vectorize.io/sdks/integrations/eliza#how-it-works)
