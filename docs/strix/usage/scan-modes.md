<!-- source: https://docs.strix.ai/usage/scan-modes.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Scan Modes

> Choose the right scan depth for your use case

Strix offers three scan modes to balance speed and thoroughness.

## Quick

```bash theme={null}
strix --target ./app --scan-mode quick
```

Fast checks for obvious vulnerabilities. Best for:

* CI/CD pipelines
* Pull request validation
* Rapid smoke tests

**Duration**: Minutes

## Standard

```bash theme={null}
strix --target ./app --scan-mode standard
```

Balanced testing for routine security reviews. Best for:

* Regular security assessments
* Pre-release validation
* Development milestones

**Duration**: 30 minutes to 1 hour

**White-box behavior**: Uses source-aware mapping and static triage to prioritize dynamic exploit validation paths.

## Deep

```bash theme={null}
strix --target ./app --scan-mode deep
```

Thorough penetration testing. Best for:

* Comprehensive security audits
* Pre-production reviews
* Critical application assessments

**Duration**: 1-4 hours depending on target complexity

**White-box behavior**: Runs broad source-aware triage (`semgrep`, AST structural search, secrets, supply-chain checks) and then systematically validates top candidates dynamically.

<Note>
  Deep mode is the default. It explores edge cases, chained vulnerabilities, and complex attack paths.
</Note>

## Choosing a Mode

| Scenario | Recommended Mode |
| - | - |
| Every PR | Quick |
| Weekly scans | Standard |
| Before major release | Deep |
| Bug bounty hunting | Deep |


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
