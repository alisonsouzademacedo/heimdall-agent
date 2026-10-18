<!-- source: https://hindsight.vectorize.io/sdks/integrations/nemoclaw -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for [NemoClaw](https://nemoclaw.ai/) sandboxed agents using [Hindsight](https://hindsight.vectorize.io/).

NemoClaw runs [OpenClaw](https://openclaw.ai/) inside an OpenShell sandbox with controlled filesystem, process, and network egress policies. The `hindsight-nemoclaw` package automates adding Hindsight memory to a sandbox in one command — no code changes required.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/nemoclaw)

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#quick-start "Direct link to Quick Start")

Hindsight Cloud (recommended)

[Sign up free](https://ui.hindsight.vectorize.io/) — get an API key instantly, no infrastructure to run.

```bash
npx @vectorize-io/hindsight-nemoclaw setup \
  --sandbox my-assistant \
  --api-token <your-api-key> \
  --bank-prefix my-sandbox
```

You'll see output like:

```text
[0] Preflight checks...
  ✓ openshell found
  ✓ openclaw found

[1] Installing @vectorize-io/hindsight-openclaw plugin...
  ✓ Plugin installed

[2] Configuring plugin in ~/.openclaw/openclaw.json...
  ✓ Plugin config written (bank: my-sandbox-openclaw)

[3] Applying Hindsight network policy to sandbox "my-assistant"...
  ✓ Policy version 2 submitted
  ✓ Policy version 2 loaded (active version: 2)

[4] Restarting OpenClaw gateway...
  ✓ Gateway restarted

✓ Setup complete!
```

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#how-it-works "Direct link to How It Works")

### The sandbox problem [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#the-sandbox-problem "Direct link to The sandbox problem")

OpenShell enforces strict network egress — every outbound endpoint must be explicitly permitted in the sandbox policy. By default, the Hindsight API (`api.hindsight.vectorize.io`) is not in that list.

The `hindsight-openclaw` plugin supports **external API mode**, where it skips the local daemon entirely and makes direct HTTPS calls to Hindsight Cloud. This is the natural fit for sandboxed environments: the plugin becomes a thin HTTP client, and the only sandbox change needed is one egress rule.

### What the setup command does [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#what-the-setup-command-does "Direct link to What the setup command does")

1. **Preflight** — verifies `openshell` and `openclaw` are installed
2. **Install plugin** — runs `openclaw plugins install @vectorize-io/hindsight-openclaw`
3. **Configure plugin** — writes external API mode config to `~/.openclaw/openclaw.json`
4. **Apply policy** — reads the current sandbox policy, merges the Hindsight egress block, and re-applies via `openshell policy set`
5. **Restart gateway** — runs `openclaw gateway restart`

### Memory flow [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#memory-flow "Direct link to Memory flow")

Once set up, the `hindsight-openclaw` plugin hooks into the OpenClaw gateway lifecycle:

- **`before_agent_start`** — recalls relevant memories from past sessions and injects them into context
- **`agent_end`** — retains the conversation to the Hindsight memory bank

The sandbox doesn't interfere with either step — it sees the Hindsight calls as normal HTTPS egress to a permitted endpoint.

## CLI Reference [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#cli-reference "Direct link to CLI Reference")

```text
hindsight-nemoclaw setup [options]

Options:
  --sandbox <name>       NemoClaw sandbox name (required)
  --api-token <token>    Hindsight API token (required)
  --api-url <url>        Hindsight API URL (default: https://api.hindsight.vectorize.io)
  --bank-prefix <prefix> Memory bank prefix (default: "nemoclaw")
  --skip-policy          Skip sandbox network policy update
  --skip-plugin-install  Skip openclaw plugin installation
  --dry-run              Preview changes without applying
  --help                 Show help
```

Use `--dry-run` to preview all changes before applying anything. Use `--skip-policy` if you manage sandbox policies manually.

## Manual Setup [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#manual-setup "Direct link to Manual Setup")

If you prefer to apply the steps yourself instead of using the CLI:

### 1\. Install the plugin [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#1-install-the-plugin "Direct link to 1. Install the plugin")

```bash
openclaw plugins install @vectorize-io/hindsight-openclaw
```

### 2\. Configure `~/.openclaw/openclaw.json` [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#2-configure-openclawopenclawjson "Direct link to 2-configure-openclawopenclawjson")

```json
{
  "plugins": {
    "entries": {
      "hindsight-openclaw": {
        "enabled": true,
        "config": {
          "hindsightApiUrl": "https://api.hindsight.vectorize.io",
          "hindsightApiToken": "<your-api-key>",
          "llmProvider": "claude-code",
          "dynamicBankId": false,
          "bankIdPrefix": "my-sandbox"
        }
      }
    }
  }
}
```

`llmProvider: "claude-code"` uses the Claude Code process already present in the sandbox — no additional API key needed.

### 3\. Add the Hindsight network policy [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#3-add-the-hindsight-network-policy "Direct link to 3. Add the Hindsight network policy")

`openshell policy set` replaces the entire policy document. Export your current policy first, add the Hindsight block, then re-apply:

```yaml
network_policies:
  hindsight:
    name: hindsight
    endpoints:
      - host: api.hindsight.vectorize.io
        port: 443
        protocol: rest
        tls: terminate
        enforcement: enforce
        rules:
          - allow:
              method: GET
              path: /**
          - allow:
              method: POST
              path: /**
          - allow:
              method: PUT
              path: /**
    binaries:
      - path: /usr/local/bin/openclaw
```

```bash
openshell policy set my-sandbox --policy /path/to/full-policy.yaml --wait
openclaw gateway restart
```

## Configuration Options [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#configuration-options "Direct link to Configuration Options")

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `hindsightApiUrl` | string | — | Hindsight API base URL |
| `hindsightApiToken` | string | — | API token for authentication |
| `llmProvider` | string | auto-detect | LLM provider for memory extraction |
| `dynamicBankId` | boolean | `false` | Isolate memory per user (`true`) or share across sessions (`false`) |
| `bankIdPrefix` | string | `"nemoclaw"` | Prefix for the memory bank name |

### Bank naming [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#bank-naming "Direct link to Bank naming")

When `dynamicBankId: false`, all sessions write to a single bank named `{bankIdPrefix}-openclaw`. When `dynamicBankId: true`, each user gets an isolated bank — useful for multi-tenant deployments.

## Verifying It Works [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#verifying-it-works "Direct link to Verifying It Works")

After setup, check the gateway logs:

```bash
tail -f /tmp/openclaw/openclaw-*.log | grep Hindsight
```

On startup you should see:

```text
[Hindsight] Plugin loaded successfully
[Hindsight] ✓ Using external API: https://api.hindsight.vectorize.io
[Hindsight] External API health: {"status":"healthy","database":"connected"}
[Hindsight] Default bank: my-sandbox-openclaw
[Hindsight] ✓ Ready (external API mode)
```

After a conversation:

```text
[Hindsight] before_agent_start - bank: my-sandbox-openclaw, channel: undefined/webchat
[Hindsight Hook] agent_end triggered - bank: my-sandbox-openclaw
[Hindsight] Retained 6 messages to bank my-sandbox-openclaw for session agent:main:...
```

## Pitfalls [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#pitfalls "Direct link to Pitfalls")

### Policy replacement is full-document [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#policy-replacement-is-full-document "Direct link to Policy replacement is full-document")

`openshell policy set` replaces the entire policy document. The `hindsight-nemoclaw setup` command handles this automatically. If you're applying manually, export the current policy first so existing rules aren't lost.

### LaunchAgent can't follow symlinks on macOS [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#launchagent-cant-follow-symlinks-on-macos "Direct link to LaunchAgent can't follow symlinks on macOS")

On macOS, the OpenClaw gateway runs as a LaunchAgent under a restricted security context. `openclaw plugins install --link` creates a symlink the LaunchAgent can't follow — the setup command installs as a copy instead. If you see `EPERM: operation not permitted, scandir` in gateway logs, this is the cause.

### Memory retention is asynchronous [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#memory-retention-is-asynchronous "Direct link to Memory retention is asynchronous")

Fact extraction and entity resolution happen in the background after `retain`. If you open a new session immediately after closing one, the most recent memories may not be indexed yet — typically a few seconds.

### Binary-scoped egress [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#binary-scoped-egress "Direct link to Binary-scoped egress")

The `binaries` field in the network policy restricts the egress rule to a specific executable path. If OpenClaw updates and the binary path changes, the rule silently stops working. Check your binary path after upgrades.

## Troubleshooting [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#troubleshooting "Direct link to Troubleshooting")

### Plugin not loading [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#plugin-not-loading "Direct link to Plugin not loading")

```bash
openclaw plugins list | grep hindsight
# Should show: ✓ enabled │ Hindsight Memory │ ...

# Reinstall
openclaw plugins install @vectorize-io/hindsight-openclaw
```

### Egress blocked [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#egress-blocked "Direct link to Egress blocked")

If calls to `api.hindsight.vectorize.io` are being blocked, check the active sandbox policy:

```bash
openshell sandbox get my-assistant
```

Verify the `hindsight` block is present and the `binaries` path matches your OpenClaw binary:

```bash
which openclaw
```

### External API not connecting [​](https://hindsight.vectorize.io/sdks/integrations/nemoclaw\#external-api-not-connecting "Direct link to External API not connecting")

```bash
tail -f /tmp/openclaw/openclaw-*.log | grep Hindsight

# If you see daemon startup messages instead of "Using external API",
# the plugin config isn't being read — check ~/.openclaw/openclaw.json
```

- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#quick-start)
- [How It Works](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#how-it-works)
  - [The sandbox problem](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#the-sandbox-problem)
  - [What the setup command does](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#what-the-setup-command-does)
  - [Memory flow](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#memory-flow)
- [CLI Reference](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#cli-reference)
- [Manual Setup](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#manual-setup)
  - [1\. Install the plugin](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#1-install-the-plugin)
  - [2\. Configure `~/.openclaw/openclaw.json`](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#2-configure-openclawopenclawjson)
  - [3\. Add the Hindsight network policy](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#3-add-the-hindsight-network-policy)
- [Configuration Options](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#configuration-options)
  - [Bank naming](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#bank-naming)
- [Verifying It Works](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#verifying-it-works)
- [Pitfalls](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#pitfalls)
  - [Policy replacement is full-document](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#policy-replacement-is-full-document)
  - [LaunchAgent can't follow symlinks on macOS](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#launchagent-cant-follow-symlinks-on-macos)
  - [Memory retention is asynchronous](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#memory-retention-is-asynchronous)
  - [Binary-scoped egress](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#binary-scoped-egress)
- [Troubleshooting](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#troubleshooting)
  - [Plugin not loading](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#plugin-not-loading)
  - [Egress blocked](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#egress-blocked)
  - [External API not connecting](https://hindsight.vectorize.io/sdks/integrations/nemoclaw#external-api-not-connecting)
