<!-- source: https://hindsight.vectorize.io/sdks/integrations/hermes-desktop -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Configure [Hindsight](https://vectorize.io/hindsight) as the memory provider for the **[Hermes](https://github.com/NousResearch/hermes-agent) desktop app** — entirely from Settings. No `config.json`, no `.env`, no terminal. Pick a mode, paste an API key, and Hermes remembers across every session.

tip

Prefer the command line, or running Hermes as a CLI/gateway? See the [Hermes Agent integration](https://hindsight.vectorize.io/sdks/integrations/hermes) for the `hermes memory setup` wizard, plugin architecture, and the full configuration reference.

Hindsight now installs from the Hermes plugin catalog

Nous Research moved every memory provider out of the Hermes core tree. The desktop app handles this for you: it installs the catalog plugin the first time an agent starts, and your settings, bank and API key are unchanged. Nothing in this guide changes. See [What Changes Now That Hindsight Is a Hermes Plugin](https://hindsight.vectorize.io/blog/2026/10/01/hindsight-hermes-plugin-what-changed) if you also use the CLI.

## Setup [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#setup "Direct link to Setup")

**1\. Open Settings → Memory & Context.** In the **Memory Provider** dropdown, choose **Hindsight**.

![Selecting Hindsight as the memory provider in the Hermes desktop app&#39;s Settings → Memory &amp; Context](https://hindsight.vectorize.io/assets/images/hermes-desktop-dropdown-f6f7352b74a33b7a221f52470a429c75.png)

**2\. Fill in the Hindsight settings panel.** Selecting Hindsight reveals its configuration fields:

![The Hindsight memory provider configuration panel in the Hermes desktop app](https://hindsight.vectorize.io/assets/images/hermes-desktop-config-panel-0963b984ddf6d83287ceb3ab48d044c6.png)

| Field | What it does | Default |
| --- | --- | --- |
| **Mode** | `Cloud` (just needs an API key) or `Local External` (connect to an existing Hindsight instance) | `Cloud` |
| **API key** | Authenticates with the Hindsight API — stored as a write-only secret | — |
| **API URL** | The Hindsight endpoint | `https://api.hindsight.vectorize.io` |
| **Bank ID** | Which memory bank this Hermes profile reads and writes | `hermes` |
| **Recall budget** | How hard recall works each turn: `low` / `mid` / `high` | `mid` |

**3\. Click Save.** That's it — Hermes now has persistent long-term memory.

## Connection Modes [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#connection-modes "Direct link to Connection Modes")

### Cloud (recommended) [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#cloud-recommended "Direct link to Cloud (recommended)")

The fast path. Choose **Cloud**, then paste an API key from [ui.hindsight.vectorize.io/connect](https://ui.hindsight.vectorize.io/connect). Nothing to host — Hindsight Cloud handles storage, extraction, and retrieval.

### Local External [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#local-external "Direct link to Local External")

Already running your own Hindsight instance (Docker or self-hosted)? Choose **Local External** and set the **API URL** to your instance (for example `http://localhost:8888`). Your memory never leaves your infrastructure.

## How Memory Is Stored [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#how-memory-is-stored "Direct link to How Memory Is Stored")

Your settings are saved to the right place automatically:

- **API key** goes to the secret store — it's never read back into the form (you'll see an _API key set_ badge once it's saved).
- **Mode, API URL, Bank ID, and Recall budget** are written to your Hermes profile config.

Each profile points at one **Bank ID**, so memory is isolated per profile and follows you across every machine that profile runs on.

## Next Steps [​](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop\#next-steps "Direct link to Next Steps")

- **Hindsight Cloud (free):** [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io/)
- **Hermes CLI / plugin setup:** [Hermes Agent integration](https://hindsight.vectorize.io/sdks/integrations/hermes)
- **Hermes Agent:** [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

- [Setup](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#setup)
- [Connection Modes](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#connection-modes)
  - [Cloud (recommended)](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#cloud-recommended)
  - [Local External](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#local-external)
- [How Memory Is Stored](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#how-memory-is-stored)
- [Next Steps](https://hindsight.vectorize.io/sdks/integrations/hermes-desktop#next-steps)
