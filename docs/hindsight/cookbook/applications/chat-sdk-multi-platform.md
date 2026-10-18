<!-- source: https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Complete Application

This is a complete, runnable application demonstrating Hindsight integration.
[**View source on GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/tree/main/applications/chat-sdk-multi-platform)

A demo chat bot that runs on Slack and Discord simultaneously, sharing a single Hindsight memory bank. Tell the bot something in Slack, ask about it in Discord, and it remembers.

Built with [Vercel Chat SDK](https://github.com/vercel/chat), [Hindsight](https://github.com/vectorize-io/hindsight), and [Vercel AI SDK](https://sdk.vercel.ai/).

## Features [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#features "Direct link to Features")

- **Cross-platform memory**: Slack and Discord share one memory bank
- **LLM-powered responses**: Uses OpenAI via Vercel AI SDK
- **Auto-recall**: Memories are retrieved before every response
- **Auto-retain**: Conversations are stored automatically
- **One handler, all platforms**: `withHindsightChat()` wraps any Chat SDK handler

## Architecture [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#architecture "Direct link to Architecture")

```text
Slack message ─────┐
                    ├─→ withHindsightChat() ─→ auto-recall ─→ LLM handler ─→ auto-retain
Discord message ───┘                              │
                                                  ▼
                                           Hindsight API
                                           (shared bank)
```

## Setup [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#setup "Direct link to Setup")

### 1\. Start Hindsight API [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#1-start-hindsight-api "Direct link to 1. Start Hindsight API")

```bash
export OPENAI_API_KEY=your-key

docker run --rm -it --pull always -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  -e HINDSIGHT_API_LLM_MODEL=gpt-4o-mini \
  -v $HOME/.hindsight-docker:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest
```

- API: [http://localhost:8888](http://localhost:8888/)
- UI: [http://localhost:9999](http://localhost:9999/)

### 2\. Set Up Slack [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#2-set-up-slack "Direct link to 2. Set Up Slack")

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
2. Under **OAuth & Permissions**, add scopes: `app_mentions:read`, `chat:write`, `channels:history`
3. Install the app to your workspace
4. Copy the **Bot User OAuth Token** and **Signing Secret**

### 3\. Set Up Discord [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#3-set-up-discord "Direct link to 3. Set Up Discord")

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and create a new app
2. Under **Bot**, click **Reset Token** and copy it
3. Enable **Message Content Intent** under Privileged Gateway Intents
4. Under **General Information**, copy the **Application ID** and **Public Key**
5. Under **OAuth2 > URL Generator**, select scopes `bot` \+ `applications.commands`, permissions: Send Messages, Read Message History
6. Invite the bot to your server using the generated URL

### 4\. Configure Environment [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#4-configure-environment "Direct link to 4. Configure Environment")

```bash
cp .env.example .env.local
# Edit .env.local with your tokens
```

Or create `.env.local` manually:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# Discord
DISCORD_BOT_TOKEN=...
DISCORD_PUBLIC_KEY=...
DISCORD_APPLICATION_ID=...
DISCORD_MENTION_ROLE_IDS=...  # Optional: comma-separated role IDs

# Hindsight
HINDSIGHT_API_URL=http://localhost:8888

# LLM
OPENAI_API_KEY=sk-...
```

### 5\. Expose Your Local Server [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#5-expose-your-local-server "Direct link to 5. Expose Your Local Server")

Discord and Slack need to reach your webhook endpoints:

```bash
ngrok http 3000
```

- Set Slack's **Event Subscriptions > Request URL** to `https://your-ngrok-url/api/webhooks/slack`
- Set Discord's **Interactions Endpoint URL** to `https://your-ngrok-url/api/webhooks/discord`

### 6\. Install and Run [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#6-install-and-run "Direct link to 6. Install and Run")

```bash
npm install
npm run dev
```

### 7\. Start the Discord Gateway [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#7-start-the-discord-gateway "Direct link to 7. Start the Discord Gateway")

Discord requires a WebSocket connection to receive messages (unlike Slack which pushes events via HTTP). Open this URL in your browser after the dev server starts:

```text
http://localhost:3000/api/discord/gateway
```

This keeps a Gateway connection alive for 10 minutes. In production, use a cron job to restart it.

## Try It [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#try-it "Direct link to Try It")

1. **Slack**: `@memory-bot I'm building a Rust compiler that targets WebAssembly`
2. Wait a few seconds for Hindsight to index the memory
3. **Discord**: `@memory-bot what am I working on?`
4. The bot recalls the Rust/WebAssembly memory from Slack

## How It Works [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#how-it-works "Direct link to How It Works")

The key file is `lib/bot.ts`. Both Slack and Discord adapters are registered with the same Chat instance, and both handlers use `withHindsightChat()` with a shared bank ID:

```typescript
bot.onNewMention(
  withHindsightChat(
    {
      client: hindsight,
      bankId: () => BANK_ID,    // same bank for all platforms
      retain: { enabled: true },
    },
    async (thread, message, ctx) => {
      const system = ctx.memoriesAsSystemPrompt();
      // ... generate LLM response with memory context
    }
  )
);
```

- **`client`**: A `@vectorize-io/hindsight-client` instance pointing at your Hindsight API
- **`bankId`**: Static string or function -- shared bank = cross-platform memory
- **`ctx.memoriesAsSystemPrompt()`**: Formats recalled memories for the LLM system prompt
- **`ctx.retain()`**: Stores conversation content back to the bank

## Bank ID Strategies [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#bank-id-strategies "Direct link to Bank ID Strategies")

| Strategy | Example | Use Case |
| --- | --- | --- |
| Static | `bankId: 'demo'` | Shared team memory |
| Per-user | `bankId: (msg) => msg.author.userId` | Isolated per-user memory |
| Cross-platform identity | Map platform IDs to canonical user | Same user, same bank, any platform |

## License [​](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform\#license "Direct link to License")

MIT

- [Features](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#features)
- [Architecture](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#architecture)
- [Setup](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#setup)
  - [1\. Start Hindsight API](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#1-start-hindsight-api)
  - [2\. Set Up Slack](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#2-set-up-slack)
  - [3\. Set Up Discord](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#3-set-up-discord)
  - [4\. Configure Environment](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#4-configure-environment)
  - [5\. Expose Your Local Server](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#5-expose-your-local-server)
  - [6\. Install and Run](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#6-install-and-run)
  - [7\. Start the Discord Gateway](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#7-start-the-discord-gateway)
- [Try It](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#try-it)
- [How It Works](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#how-it-works)
- [Bank ID Strategies](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#bank-id-strategies)
- [License](https://hindsight.vectorize.io/cookbook/applications/chat-sdk-multi-platform#license)
