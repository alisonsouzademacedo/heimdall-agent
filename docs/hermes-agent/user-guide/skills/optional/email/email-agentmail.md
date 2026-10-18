<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#__docusaurus_skipToContent_fallback)

On this page

Use when an agent needs AgentMail CLI email inboxes.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/email/agentmail` |
| Path | `optional-skills/email/agentmail` |
| Version | `1.0.0` |
| Author | Haakam Aujla (Haakam21), AgentMail |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `Email`, `CLI`, `AgentMail`, `Communication` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# AgentMail Skill

AgentMail gives an agent its own email inbox for sending mail, receiving
replies, completing email OTP flows, and running inbound email loops. Use it for
agent-owned inboxes, not a user's existing IMAP/SMTP mailbox.

Use the `agentmail` CLI first. Use MCP only when the harness expects MCP tools;
use REST only when the CLI is missing a required operation.

## When to Use [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#when-to-use "Direct link to When to Use")

- The agent needs an email address it owns.
- The task involves email OTP flows, replies, threads, labels, or attachments.
- The agent needs webhook or WebSocket delivery for inbound mail.

## Prerequisites [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#prerequisites "Direct link to Prerequisites")

- Run commands through the `terminal` tool.
- Install the CLI:

```bash
npm install -g agentmail-cli@latest
```

- Export an API key:

```bash
export AGENTMAIL_API_KEY="am_..."
```

No API key yet? Use [signup.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/signup.md).

## How to Run [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#how-to-run "Direct link to How to Run")

Use `--format json` whenever another command or script needs IDs.

```bash
agentmail inboxes list --format json
```

## Quick Reference [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#quick-reference "Direct link to Quick Reference")

- [AgentMail agent reference](https://agentmail.md/): hosted copy.
- [AgentMail](https://agentmail.to/): product landing page.
- [Console](https://console.agentmail.to/): API keys and account management.
- [Docs](https://docs.agentmail.to/): full product documentation.
- [signup.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/signup.md): self-signup and OTP verification.
- [core.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/core.md): inboxes, messages, threads, labels, attachments.
- [webhooks.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/webhooks.md): events to a public HTTPS server.
- [websockets.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/websockets.md): events to a local agent process.
- [mcp.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/mcp.md): MCP integration.

## Procedure [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#procedure "Direct link to Procedure")

1. Install `agentmail-cli@latest` and verify `agentmail inboxes list --format json`.
2. If no API key is available, complete [signup.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/signup.md).
3. Use [core.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/core.md) for inbox, send, read, reply, forward,
label, thread, and attachment flows.
4. Add [webhooks.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/webhooks.md) or
[websockets.md](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/email/agentmail/references/websockets.md) only when polling is not enough.

## Pitfalls [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#pitfalls "Direct link to Pitfalls")

- Prefer `AGENTMAIL_API_KEY` over `--api-key`.
- Never expose `AGENTMAIL_API_KEY` in prompts, logs, URLs, or committed files.
- Use stable `client_id` values for retried create operations.
- Prefer `extracted_text` or `extracted_html` for LLM input when present.
- React to `message.received`, not messages the agent sent.

## Verification [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail\#verification "Direct link to Verification")

```bash
agentmail inboxes list --format json
```

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#reference-full-skillmd)
- [When to Use](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#when-to-use)
- [Prerequisites](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#prerequisites)
- [How to Run](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#how-to-run)
- [Quick Reference](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#quick-reference)
- [Procedure](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#procedure)
- [Pitfalls](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#pitfalls)
- [Verification](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/email/email-agentmail#verification)
