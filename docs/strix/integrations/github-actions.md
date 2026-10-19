<!-- source: https://docs.strix.ai/integrations/github-actions.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub Actions

> Run Strix security scans on every pull request

Integrate Strix into your GitHub workflow to catch vulnerabilities before they reach production.

## Basic Workflow

```yaml .github/workflows/security.yml theme={null}
name: Security Scan

on:
  pull_request:

jobs:
  strix-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Strix
        run: curl -sSL https://strix.ai/install | bash

      - name: Run Security Scan
        env:
          STRIX_LLM: ${{ secrets.STRIX_LLM }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: strix -n -t ./ --scan-mode quick
```

## Required Secrets

Add these secrets to your repository:

| Secret | Description |
| - | - |
| `STRIX_LLM` | Model name (e.g., `openrouter/z-ai/glm-5.3`) |
| `LLM_API_KEY` | API key for your LLM provider |

## Exit Codes

The workflow fails when vulnerabilities are found:

| Code | Result |
| - | - |
| 0 | Pass — No vulnerabilities (with `--fail-on`, none at or above the threshold) |
| 2 | Fail — Vulnerabilities found |

Add `--fail-on high` (or `critical`, `medium`, `low`) to fail only on findings at or above that severity. Lower findings still appear in the report, so a passing run is not necessarily finding-free.

## Scan Modes for CI

| Mode | Duration | Use Case |
| - | - | - |
| `quick` | Minutes | Every PR |
| `standard` | \~30 min | Nightly builds |
| `deep` | 1-4 hours | Release candidates |

<Tip>
  Use `quick` mode for PRs to keep feedback fast. Schedule `deep` scans nightly.
</Tip>

<Note>
  For pull\_request workflows, Strix automatically uses changed-files diff-scope in CI/headless runs. If diff resolution fails, ensure full history is fetched (`fetch-depth: 0`) or set `--diff-base`.
</Note>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
