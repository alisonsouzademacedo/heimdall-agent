<!-- source: https://hindsight.vectorize.io/sdks/integrations/continue -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/continue#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Long-term memory for the [Continue.dev](https://continue.dev/) coding assistant, powered by [Hindsight](https://vectorize.io/hindsight). Recall relevant project memory directly into chat, and optionally let the agent recall and retain automatically in agent mode.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/continue)

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/continue\#how-it-works "Direct link to How It Works")

Continue has no hook that runs before a message is sent, but it supports two native extension points that `hindsight-continue` uses:

- **HTTP context provider (precise recall):** type `@hindsight <query>` (or a bare `@hindsight`) in Continue chat and relevant memory is recalled and injected into the model's context **at query time**. The package ships a small adapter server that implements Continue's HTTP context-provider contract (`{query, fullInput, options, workspacePath}` → context items) on top of Hindsight recall.
- **MCP server + rules (automatic):** point Continue's agent mode at the Hindsight MCP server for `retain`/`recall`/`reflect` tools, with a rules file that instructs the agent to recall at the start of every task and retain durable facts.

Memory is scoped per **bank** — use one bank per project so context from one codebase doesn't leak into another.

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/continue\#setup "Direct link to Setup")

```bash
pip install hindsight-continue
```

Run the adapter, pointing it at your Hindsight instance and bank:

```bash
export HINDSIGHT_API_KEY=hsk_...
export HINDSIGHT_CONTINUE_BANK_ID=my-project
hindsight-continue            # serves on 127.0.0.1:8123
```

Then register it in Continue's `config.yaml`:

```yaml
context:
  - provider: http
    params:
      url: "http://127.0.0.1:8123/"
      title: hindsight
      displayTitle: Hindsight
      description: Recall long-term memory from Hindsight
```

Use a [Hindsight Cloud](https://hindsight.vectorize.io/) key, or point at a self-hosted server with `HINDSIGHT_API_URL=http://localhost:8888`.

## Automatic recall (optional) [​](https://hindsight.vectorize.io/sdks/integrations/continue\#automatic-recall-optional "Direct link to Automatic recall (optional)")

For hands-off recall and retain in agent mode, wire the Hindsight MCP server into Continue and add a "recall first" rule. See the [`examples/.continue/`](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/continue/examples/.continue) assets in the integration directory.

## Limitation [​](https://hindsight.vectorize.io/sdks/integrations/continue\#limitation "Direct link to Limitation")

Continue has no pre-prompt hook, so memory cannot be injected fully passively on every message. The `@hindsight` provider gives precise, query-time recall on demand; the MCP + rules setup gives automatic recall in agent mode, subject to the agent following the rule.

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/continue#how-it-works)
- [Setup](https://hindsight.vectorize.io/sdks/integrations/continue#setup)
- [Automatic recall (optional)](https://hindsight.vectorize.io/sdks/integrations/continue#automatic-recall-optional)
- [Limitation](https://hindsight.vectorize.io/sdks/integrations/continue#limitation)
