<!-- source: https://hindsight.vectorize.io/sdks/integrations/chat -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/chat#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

We built `@vectorize-io/hindsight-chat` to give [Vercel Chat SDK](https://github.com/vercel/chat) bots persistent, per-user memory with a single handler wrapper. The integration works across Slack, Discord, Teams, Google Chat, GitHub, and Linear — no custom plumbing required.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/chat)

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/chat\#setup "Direct link to Setup")

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — get an API key instantly, no infrastructure to run. Self-hosting? See the [installation guide](https://hindsight.vectorize.io/developer/installation).

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/chat\#installation "Direct link to Installation")

```bash
npm install @vectorize-io/hindsight-chat
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/chat\#quick-start "Direct link to Quick Start")

```typescript
import { Chat } from 'chat';
import { HindsightClient } from '@vectorize-io/hindsight-client';
import { withHindsightChat } from '@vectorize-io/hindsight-chat';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const chat = new Chat({ connectors: [/* your connectors */] });
const hindsight = new HindsightClient({ apiKey: process.env.HINDSIGHT_API_KEY });

chat.onNewMention(
  withHindsightChat(
    {
      client: hindsight,
      bankId: (msg) => msg.author.userId, // per-user memory
    },
    async (thread, message, ctx) => {
      await thread.subscribe();

      const result = await streamText({
        model: openai('gpt-4o'),
        system: ctx.memoriesAsSystemPrompt(),
        messages: [{ role: 'user', content: message.text }],
      });

      // Stream the response
      const chunks: string[] = [];
      for await (const chunk of result.textStream) {
        chunks.push(chunk);
      }
      const fullResponse = chunks.join('');
      await thread.post(fullResponse);

      // Store the conversation in memory
      await ctx.retain(
        `User: ${message.text}\nAssistant: ${fullResponse}`
      );
    }
  )
);
```

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/chat\#configuration "Direct link to Configuration")

### `withHindsightChat(options, handler)` [​](https://hindsight.vectorize.io/sdks/integrations/chat\#withhindsightchatoptions-handler "Direct link to withhindsightchatoptions-handler")

`withHindsightChat` wraps your existing Chat SDK handler and injects memory context automatically. It returns a standard handler `(thread, message) => Promise<void>` so it drops in without changing your handler signature.

#### Options [​](https://hindsight.vectorize.io/sdks/integrations/chat\#options "Direct link to Options")

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `client` | `HindsightClient` | _required_ | Hindsight client instance |
| `bankId` | `string | (msg) => string` | _required_ | Memory bank ID or resolver function |
| `recall.enabled` | `boolean` | `true` | Auto-recall memories before handler |
| `recall.budget` | `'low' | 'mid' | 'high'` | `'mid'` | Processing budget for recall |
| `recall.maxTokens` | `number` | API default | Max tokens for recall results |
| `recall.types` | `FactType[]` | all | Filter to specific fact types |
| `recall.includeEntities` | `boolean` | `true` | Include entity observations |
| `retain.enabled` | `boolean` | `false` | Auto-retain inbound messages |
| `retain.async` | `boolean` | `true` | Fire-and-forget retain |
| `retain.tags` | `string[]` | – | Tags for retained memories |
| `retain.metadata` | `Record<string, string>` | – | Metadata for retained memories |

### Context (`ctx`) [​](https://hindsight.vectorize.io/sdks/integrations/chat\#context-ctx "Direct link to context-ctx")

We inject a third `ctx` argument into your handler that exposes the full Hindsight memory API scoped to the current user's bank:

| Property/Method | Description |
| --- | --- |
| `ctx.bankId` | Resolved bank ID |
| `ctx.memories` | Array of recalled memories |
| `ctx.entities` | Entity observations (or null) |
| `ctx.memoriesAsSystemPrompt(options?)` | Format memories for LLM system prompt |
| `ctx.retain(content, options?)` | Store content in memory |
| `ctx.recall(query, options?)` | Search memories |
| `ctx.reflect(query, options?)` | Reason over memories |

## Examples [​](https://hindsight.vectorize.io/sdks/integrations/chat\#examples "Direct link to Examples")

### Subscribed Message Handler [​](https://hindsight.vectorize.io/sdks/integrations/chat\#subscribed-message-handler "Direct link to Subscribed Message Handler")

```typescript
chat.onSubscribedMessage(
  withHindsightChat(
    {
      client: hindsight,
      bankId: (msg) => msg.author.userId,
      recall: { budget: 'high', maxTokens: 1000 },
    },
    async (thread, message, ctx) => {
      const result = await generateText({
        model: openai('gpt-4o'),
        system: ctx.memoriesAsSystemPrompt(),
        messages: [{ role: 'user', content: message.text }],
      });
      await thread.post(result.text);
    }
  )
);
```

### Auto-Retain Inbound Messages [​](https://hindsight.vectorize.io/sdks/integrations/chat\#auto-retain-inbound-messages "Direct link to Auto-Retain Inbound Messages")

```typescript
chat.onNewMention(
  withHindsightChat(
    {
      client: hindsight,
      bankId: (msg) => msg.author.userId,
      retain: { enabled: true, tags: ['slack', 'inbound'] },
    },
    async (thread, message, ctx) => {
      // Inbound message is already being retained automatically
      const result = await generateText({
        model: openai('gpt-4o'),
        system: ctx.memoriesAsSystemPrompt(),
        messages: [{ role: 'user', content: message.text }],
      });
      await thread.post(result.text);

      // Retain the assistant response separately
      await ctx.retain(`Assistant: ${result.text}`, {
        tags: ['slack', 'outbound'],
      });
    }
  )
);
```

### Static Bank ID (Shared Memory) [​](https://hindsight.vectorize.io/sdks/integrations/chat\#static-bank-id-shared-memory "Direct link to Static Bank ID (Shared Memory)")

```typescript
// All users share the same memory bank
chat.onNewMention(
  withHindsightChat(
    { client: hindsight, bankId: 'shared-team-memory' },
    async (thread, message, ctx) => {
      // ...
    }
  )
);
```

## Error Handling [​](https://hindsight.vectorize.io/sdks/integrations/chat\#error-handling "Direct link to Error Handling")

We designed the integration so that memory failures never break your bot. Auto-recall and auto-retain errors are caught internally, logged as warnings, and the handler continues with empty memories. Manual `ctx.retain()`, `ctx.recall()`, and `ctx.reflect()` calls propagate errors normally so you can handle them as needed.

- [Setup](https://hindsight.vectorize.io/sdks/integrations/chat#setup)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/chat#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/chat#quick-start)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/chat#configuration)
  - [`withHindsightChat(options, handler)`](https://hindsight.vectorize.io/sdks/integrations/chat#withhindsightchatoptions-handler)
  - [Context (`ctx`)](https://hindsight.vectorize.io/sdks/integrations/chat#context-ctx)
- [Examples](https://hindsight.vectorize.io/sdks/integrations/chat#examples)
  - [Subscribed Message Handler](https://hindsight.vectorize.io/sdks/integrations/chat#subscribed-message-handler)
  - [Auto-Retain Inbound Messages](https://hindsight.vectorize.io/sdks/integrations/chat#auto-retain-inbound-messages)
  - [Static Bank ID (Shared Memory)](https://hindsight.vectorize.io/sdks/integrations/chat#static-bank-id-shared-memory)
- [Error Handling](https://hindsight.vectorize.io/sdks/integrations/chat#error-handling)
