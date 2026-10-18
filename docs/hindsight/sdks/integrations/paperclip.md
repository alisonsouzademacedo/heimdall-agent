<!-- source: https://hindsight.vectorize.io/sdks/integrations/paperclip -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/paperclip#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for [Paperclip AI](https://github.com/paperclipai/paperclip) agents using [Hindsight](https://hindsight.vectorize.io/).

Install the `@vectorize-io/hindsight-paperclip` plugin once. Every agent in your Paperclip instance automatically gets long-term memory that persists across runs, companies, and restarts — no code changes required.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/paperclip)

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#installation "Direct link to Installation")

```bash
pnpm paperclipai plugin install @vectorize-io/hindsight-paperclip
```

Then configure in **Settings → Plugins → Hindsight Memory**.

## Prerequisites [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#prerequisites "Direct link to Prerequisites")

Requires Paperclip **2026.720.0 or newer**. Upgrading from an older plugin version? Open the plugin settings and pick the API key secret again: older versions saved the secret's name, and Paperclip now accepts only a reference chosen with the secret picker.

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — no infrastructure to run. Skip straight to Configuration below.

**Self-hosting alternative** — run Hindsight locally:

```bash
pip install hindsight-all
export HINDSIGHT_API_LLM_API_KEY=your-openai-key
hindsight-api
```

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#how-it-works "Direct link to How It Works")

```text
agent.run.started
  └─ fetch issue via ctx.issues.get
       └─ recall(issueTitle + description) → cached in plugin state for this run

agent running…
  ├─ hindsight_recall(query) → cached context if query matches run start, otherwise live recall
  └─ hindsight_retain(content) → stores immediately

issue.comment.created
  └─ retain(full comment body via ctx.issues.listComments)
       └─ bank attribution: agent comment author when present; otherwise issue assignee

agent.run.finished
  └─ no-op (subscription kept for future use when payload carries output)
```

The bundled plugin manifest declares the `issues.read` and `issue.comments.read` capabilities needed by the new SDK calls, so Paperclip may prompt for these on first install or upgrade.

Memory is keyed to `companyId` \+ `agentId` — never to the run ID — so it accumulates across every run.

## Configuration [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#configuration "Direct link to Configuration")

| Field | Default | Description |
| --- | --- | --- |
| `hindsightApiUrl` | `https://api.hindsight.vectorize.io` | Hindsight server URL (Cloud default; use `http://localhost:8888` for self-hosted) |
| `hindsightApiKeyRef` | — | Paperclip secret holding your Hindsight Cloud API key, chosen with the secret picker. Leave empty for self-hosted |
| `dynamicBankId` | `true` | When `true`, bank ID is derived from `bankGranularity`. Set `false` and provide `bankId` to share one static memory bank across agents |
| `bankId` | — | Static bank ID used when `dynamicBankId` is `false`. All agents sharing this value read/write the same memory bank |
| `bankGranularity` | `["company", "agent"]` | Memory isolation when `dynamicBankId` is `true`: per company+agent, per company, or per agent. Add `"user"` for per-user memory isolation (useful for GDPR compliance) |
| `recallBudget` | `mid` | `low` = fastest, `mid` = balanced, `high` = most thorough |
| `requestTimeoutMs` | `15000` | Timeout for each request to Hindsight. Raise it for self-hosted instances where recall on long issue descriptions is slower |
| `autoRetain` | `true` | Automatically retain run output after every run |

## Bank ID Format [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#bank-id-format "Direct link to Bank ID Format")

```text
paperclip::{companyId}::{agentId}                  ← default (company + agent granularity)
paperclip::{companyId}                             ← company granularity (shared across agents)
paperclip::{agentId}                               ← agent granularity (agent memory across companies)
paperclip::{companyId}::{agentId}::user::{userId}  ← user granularity (per-user isolation, GDPR-friendly)
{bankId}                                           ← static shared bank (dynamicBankId = false)
```

## Agent Tools [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#agent-tools "Direct link to Agent Tools")

Agents can call these tools directly during a run:

**`hindsight_recall(query)`** — search memory for relevant context. Called automatically at run start; agents can also call it mid-run for targeted queries. The run-start result is reused only when the agent asks the same query; any other query triggers a live recall.

**`hindsight_retain(content)`** — store a fact or decision immediately, without waiting for run end.

## Adapter Compatibility [​](https://hindsight.vectorize.io/sdks/integrations/paperclip\#adapter-compatibility "Direct link to Adapter Compatibility")

Works with all Paperclip adapter types via the event system:

| Adapter | Supported |
| --- | --- |
| Claude | ✓ |
| Codex | ✓ |
| Cursor | ✓ |
| HTTP | ✓ |
| Process | ✓ |

- [Installation](https://hindsight.vectorize.io/sdks/integrations/paperclip#installation)
- [Prerequisites](https://hindsight.vectorize.io/sdks/integrations/paperclip#prerequisites)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/paperclip#how-it-works)
- [Configuration](https://hindsight.vectorize.io/sdks/integrations/paperclip#configuration)
- [Bank ID Format](https://hindsight.vectorize.io/sdks/integrations/paperclip#bank-id-format)
- [Agent Tools](https://hindsight.vectorize.io/sdks/integrations/paperclip#agent-tools)
- [Adapter Compatibility](https://hindsight.vectorize.io/sdks/integrations/paperclip#adapter-compatibility)
