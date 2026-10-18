<!-- source: https://hindsight.vectorize.io/sdks/integrations/zapier -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/zapier#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term agent memory for [Zapier](https://zapier.com/) via [Hindsight](https://hindsight.vectorize.io/). The Hindsight Zapier app adds three actions — **Retain**, **Recall**, **Reflect** — plus instant **triggers** that start a Zap when a memory event fires, so memory flows between Hindsight and 7,000+ apps.

## Why this matters [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#why-this-matters "Direct link to Why this matters")

Zapier connects everything: Gmail, Slack, Sheets, HubSpot, Notion, forms, and thousands more. On its own, those Zaps are **stateless**. With Hindsight you can:

- **Retain** every closed ticket, form submission, or call summary into a memory bank
- **Recall** relevant context before an AI step so the model sees prior history
- **Reflect** to get a synthesized, memory-grounded answer right inside a Zap
- **Trigger** a Zap the moment a memory operation completes (e.g. notify Slack when consolidation finishes)

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#setup "Direct link to Setup")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

1. **Sign up** at [Hindsight Cloud](https://ui.hindsight.vectorize.io/) (free tier) or [self-host](https://hindsight.vectorize.io/developer/installation)
2. **Get an API key** (`hsk_...`) from the Hindsight dashboard

Availability

The native Hindsight Zapier app (the **Retain / Recall / Reflect** steps and triggers) is
currently a **private beta** — it isn't listed in Zapier's public App Directory yet, so
searching "Hindsight" in Zapier won't find it. Use the **Webhooks by Zapier** path below.

### Webhooks by Zapier [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#webhooks-by-zapier "Direct link to Webhooks by Zapier")

Every Hindsight operation is a plain REST call, so you can drive it from Zapier's built-in
**Webhooks by Zapier** action (or **API Request**) with nothing to install:

- **Method:**`POST`
- **URL**(Hindsight Cloud):
  - Retain — `https://api.hindsight.vectorize.io/v1/default/banks/<bank>/memories`
  - Recall — `https://api.hindsight.vectorize.io/v1/default/banks/<bank>/memories/recall`
  - Reflect — `https://api.hindsight.vectorize.io/v1/default/banks/<bank>/reflect`
- **Headers:**`Authorization: Bearer hsk_...` and `Content-Type: application/json`
- **Body:** the JSON payload for the operation — see the [API Reference](https://hindsight.vectorize.io/api-reference) for the exact fields.

For self-hosted, swap the host for your own instance URL; drop the `Authorization` header if it runs without auth.

## Actions [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#actions "Direct link to Actions")

### Retain [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#retain "Direct link to Retain")

Store content in a bank. Hindsight extracts facts asynchronously after the call returns.

| Field | Description |
| --- | --- |
| Bank | Memory bank to store in (dynamic dropdown; auto-created on first use) |
| Content | Free text to retain |
| Context | Optional context for the content |
| Tags | Comma-separated tags |
| Timestamp | When the content occurred (defaults to now) |

### Recall (search) [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#recall-search "Direct link to Recall (search)")

Search a bank for memories relevant to a query.

| Field | Description |
| --- | --- |
| Bank | Memory bank to search |
| Query | Natural-language query |
| Budget | `low` / `mid` / `high` |
| Tags / Tags Match | Optional tag filter |

### Reflect (search) [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#reflect-search "Direct link to Reflect (search)")

Get an LLM-synthesized answer grounded in the bank's memories.

| Field | Description |
| --- | --- |
| Bank | Memory bank |
| Query | Question to answer |
| Budget | `low` / `mid` / `high` |

## Triggers [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#triggers "Direct link to Triggers")

Instant triggers (REST Hooks) that fire when a memory event completes in a bank:

| Trigger | Fires when |
| --- | --- |
| **Retain Completed** | An asynchronous retain finishes processing |
| **Consolidation Completed** | Memory consolidation synthesizes observations / mental models |

## Example Zaps [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#example-zaps "Direct link to Example Zaps")

**Support assistant** — a closed-ticket trigger (Zendesk) → Hindsight **Retain** the resolution. New ticket → Hindsight **Recall** similar past issues → OpenAI drafts the first reply.

**Memory digest** — Hindsight **Consolidation Completed** trigger → format the new observations → post to Slack so the team sees what the agent learned.

**Daily prep** — a calendar trigger → Hindsight **Reflect** ("What do we know about this prospect?") → append the answer to the prep doc.

## Source [​](https://hindsight.vectorize.io/sdks/integrations/zapier\#source "Direct link to Source")

- GitHub: [`hindsight-integrations/zapier`](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/zapier)

- [Why this matters](https://hindsight.vectorize.io/sdks/integrations/zapier#why-this-matters)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/zapier#setup)
  - [Webhooks by Zapier](https://hindsight.vectorize.io/sdks/integrations/zapier#webhooks-by-zapier)
- [Actions](https://hindsight.vectorize.io/sdks/integrations/zapier#actions)
  - [Retain](https://hindsight.vectorize.io/sdks/integrations/zapier#retain)
  - [Recall (search)](https://hindsight.vectorize.io/sdks/integrations/zapier#recall-search)
  - [Reflect (search)](https://hindsight.vectorize.io/sdks/integrations/zapier#reflect-search)
- [Triggers](https://hindsight.vectorize.io/sdks/integrations/zapier#triggers)
- [Example Zaps](https://hindsight.vectorize.io/sdks/integrations/zapier#example-zaps)
- [Source](https://hindsight.vectorize.io/sdks/integrations/zapier#source)
