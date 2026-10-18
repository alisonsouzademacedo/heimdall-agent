<!-- source: https://hindsight.vectorize.io/sdks/integrations/chatgpt -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/chatgpt#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Add persistent, searchable memory to [ChatGPT](https://chatgpt.com/) using [Hindsight](https://vectorize.io/hindsight). Store insights from your conversations and automatically recall relevant context in future sessions—all secured with OAuth.

## Overview [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#overview "Direct link to Overview")

ChatGPT's built-in memory helps with preferences, but knowledge from specific conversations (research, code, decisions) is lost when you start a new chat. Hindsight solves this by providing:

- **Cross-session memory** — Knowledge from one conversation persists to the next
- **Smart recall** — Hindsight automatically retrieves relevant memories when you need them
- **No API keys** — OAuth handles authentication securely
- **Custom instructions** — Aggressive auto-retain/recall via system prompts

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#quick-start "Direct link to Quick Start")

### 1\. Create a Hindsight Cloud Account [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#1-create-a-hindsight-cloud-account "Direct link to 1. Create a Hindsight Cloud Account")

[Sign up free](https://ui.hindsight.vectorize.io/) for Hindsight Cloud.

### 2\. Add Hindsight as a Connector in ChatGPT [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#2-add-hindsight-as-a-connector-in-chatgpt "Direct link to 2. Add Hindsight as a Connector in ChatGPT")

1. Go to [ChatGPT Settings](https://chatgpt.com/settings)
2. Navigate to **Apps & Connectors → Connectors**
3. Click **Create connector**
4. Fill in:
   - **Name:**`Hindsight` (or your preferred name)
   - **URL:**`https://api.hindsight.vectorize.io/mcp/default/`
5. Click **Create** — a browser window opens for Hindsight Cloud login
6. Sign in to [Hindsight Cloud](https://ui.hindsight.vectorize.io/) and approve access
7. Return to ChatGPT; the connector is now active

To use in a chat: click **+** in the message composer → **More** → select **Hindsight**

### 3\. Configure Custom Instructions for Automatic Retention [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#3-configure-custom-instructions-for-automatic-retention "Direct link to 3. Configure Custom Instructions for Automatic Retention")

The connector is now active, but you need to tell ChatGPT to actually use it. Add custom instructions to enable automatic memory capture and recall:

1. Go to **Settings → Personalization → Custom instructions**
2. Copy and paste this instruction:

```text
After every response, automatically use the Hindsight tool to retain key information from our conversation:
- Important facts, decisions, or learnings we discussed
- Your preferences, goals, or constraints mentioned
- Code patterns, architecture decisions, or technical insights
- Any information that might be useful in future conversations

Before generating each response, automatically use the Hindsight tool to recall relevant memories that might apply to the current conversation. Include recalled memories in your reasoning.

Retain and recall aggressively—assume everything is valuable. The Hindsight tool will handle deduplication and relevance filtering.
```

3. Save and close settings

From now on, ChatGPT will automatically store insights from your conversations and surface relevant memories without you needing to ask.

tip

Feel free to experiment with the instructions to ensure proper behavior.

## Features [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#features "Direct link to Features")

- **Automatic retention** — Custom instructions tell ChatGPT to store insights after every response
- **Intelligent recall** — ChatGPT queries Hindsight before generating each response to include relevant memories as context
- **OAuth-secured** — No API keys to copy-paste; sign in once via browser
- **Bank isolation** — Separate memory banks for different projects or purposes
- **Semantic search** — Hindsight understands context, not just keyword matching

## What to Store [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#what-to-store "Direct link to What to Store")

Store meaningful, specific knowledge for best results:

- **Project context** — goals, requirements, architecture decisions, constraints
- **Personal preferences** — coding style, communication preferences, learning style
- **Discoveries** — research findings, useful resources, lessons learned
- **Domain knowledge** — industry facts, patterns, techniques you reference
- **Decision history** — why you chose A over B, trade-offs considered

**Example of what to store:**

```text
"We're building a real-time collaboration tool. Constraints:
- <500ms latency for cursor updates
- Support 10k concurrent users
- GDPR-compliant data storage
- Team prefers WebSockets over polling"
```

Later, when you ask ChatGPT _"How should we structure our database?"_, Hindsight recalls these constraints. ChatGPT's answer becomes tailored to your actual situation, not generic advice.

## Best Practices [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#best-practices "Direct link to Best Practices")

**Be intentional about what you store.** Not every conversation needs retention. Focus on storing insights that will be useful later: lessons learned, architectural decisions, research findings, and personal preferences. Storing trivial facts clutters your memory bank and makes retrieval less useful.

**Use consistent terminology.** If you call your project "ProjectX" in one session and "Project X" in another, Hindsight's semantic search may miss the connection. Establish naming conventions and stick to them.

**Review and refine.** The Hindsight Cloud dashboard lets you browse your memory bank. Periodically review what you've stored. Delete outdated information and consolidate similar insights. A curated memory bank is more valuable than an exhaustive one.

**Structure multi-part decisions.** When storing complex decisions (like architecture trade-offs), include context: the constraints, alternatives considered, and why you chose one path. Future-you will thank present-you for the context.

## Architecture: Single-Bank vs. Multi-Bank [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#architecture-single-bank-vs-multi-bank "Direct link to Architecture: Single-Bank vs. Multi-Bank")

### Single-Bank Mode (Recommended) [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#single-bank-mode-recommended "Direct link to Single-Bank Mode (Recommended)")

Each connector accesses one memory bank. Simpler for most users.

- **URL:**`https://api.hindsight.vectorize.io/mcp/YOUR_BANK_ID/`
- **Setup:** Just enter the URL in the Connector settings
- **Best for:** Dedicated memory per tool (e.g., ChatGPT uses a `writing` bank)

### Multi-Bank Mode [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#multi-bank-mode "Direct link to Multi-Bank Mode")

Both tools access multiple banks via bank\_id parameter.

- **URL:**`https://api.hindsight.vectorize.io/mcp`
- **Setup:** Requires additional configuration in Hindsight Cloud
- **Best for:** When ChatGPT and Perplexity collaborate on the same project

## Data Privacy and Security [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#data-privacy-and-security "Direct link to Data Privacy and Security")

- **OAuth-secured** — no API keys, no copy-paste secrets
- **Your account** — memories live in your Hindsight Cloud account
- **Encrypted in transit** — HTTPS + TLS for all connections
- **No vendor lock-in** — export your memories anytime
- **Scoped access** — the connector can only read/write to its assigned bank

When you approve OAuth in the browser, you're authorizing ChatGPT to:

- **Read** your memory banks (to recall relevant facts)
- **Write** to your memory banks (to store new discoveries)
- **Search** your memories (to find context)

You can revoke access anytime by removing the connector in ChatGPT settings.

## Troubleshooting [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#troubleshooting "Direct link to Troubleshooting")

**"Connector failed to load"**

- Verify the URL is correct (no typos in your bank ID)
- Check that your Hindsight Cloud account is active
- Try re-creating the connector

**"Authorization failed" or "Access denied"**

- Make sure you're signing in with the same Hindsight Cloud account where you want to store memories
- If using a team account, verify you have permission to access the bank
- Try logging out and back in

**"Memory tools appear but don't return results"**

- Give Hindsight a few seconds to index memories (processing is async)
- Make sure you've stored relevant memories using the `retain` operation
- Check the memory bank name matches your connector URL

**Memories aren't being stored**

- Use the Hindsight Cloud dashboard to verify memories are being created
- In ChatGPT, explicitly ask Hindsight to store something: _"Hindsight, remember that we use Vue.js for frontend"_
- Check that your bank isn't full (unlikely, but possible with very large memory sets)

## Next Steps [​](https://hindsight.vectorize.io/sdks/integrations/chatgpt\#next-steps "Direct link to Next Steps")

1. Create your Hindsight Cloud account
2. Add the Hindsight connector to ChatGPT
3. Set up your custom instructions
4. Store your first memory — ask ChatGPT to remember something important to you
5. Start a new chat and ask a related question — watch Hindsight retrieve your stored memory
6. Build the habit of storing meaningful insights over time

Over weeks and months, as your memory bank grows, ChatGPT will give increasingly personalized, informed answers because it's working with your accumulated context instead of starting fresh every time.

- [Overview](https://hindsight.vectorize.io/sdks/integrations/chatgpt#overview)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/chatgpt#quick-start)
  - [1\. Create a Hindsight Cloud Account](https://hindsight.vectorize.io/sdks/integrations/chatgpt#1-create-a-hindsight-cloud-account)
  - [2\. Add Hindsight as a Connector in ChatGPT](https://hindsight.vectorize.io/sdks/integrations/chatgpt#2-add-hindsight-as-a-connector-in-chatgpt)
  - [3\. Configure Custom Instructions for Automatic Retention](https://hindsight.vectorize.io/sdks/integrations/chatgpt#3-configure-custom-instructions-for-automatic-retention)
- [Features](https://hindsight.vectorize.io/sdks/integrations/chatgpt#features)
- [What to Store](https://hindsight.vectorize.io/sdks/integrations/chatgpt#what-to-store)
- [Best Practices](https://hindsight.vectorize.io/sdks/integrations/chatgpt#best-practices)
- [Architecture: Single-Bank vs. Multi-Bank](https://hindsight.vectorize.io/sdks/integrations/chatgpt#architecture-single-bank-vs-multi-bank)
  - [Single-Bank Mode (Recommended)](https://hindsight.vectorize.io/sdks/integrations/chatgpt#single-bank-mode-recommended)
  - [Multi-Bank Mode](https://hindsight.vectorize.io/sdks/integrations/chatgpt#multi-bank-mode)
- [Data Privacy and Security](https://hindsight.vectorize.io/sdks/integrations/chatgpt#data-privacy-and-security)
- [Troubleshooting](https://hindsight.vectorize.io/sdks/integrations/chatgpt#troubleshooting)
- [Next Steps](https://hindsight.vectorize.io/sdks/integrations/chatgpt#next-steps)
