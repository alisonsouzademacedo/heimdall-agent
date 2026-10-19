<!-- source: https://docs.strix.ai/tools/terminal.md -->
> ## Documentation Index
> Fetch the complete documentation index at: https://docs.strix.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Terminal

> Bash shell for running commands and security tools

Strix has access to a persistent bash terminal running inside the Docker sandbox. This gives the agent access to all [pre-installed security tools](/tools/sandbox).

## Capabilities

| Feature | Description |
| - | - |
| Persistent state | Working directory and environment persist between commands |
| Multiple sessions | Run parallel terminals for concurrent operations |
| Background jobs | Start long-running processes without blocking |
| Interactive | Respond to prompts and control running processes |

## Common Uses

### Running Security Tools

```bash theme={null}
# Subdomain enumeration
subfinder -d example.com

# Vulnerability scanning
nuclei -u https://example.com

# SQL injection testing
sqlmap -u "https://example.com/page?id=1"
```

### Code Analysis

```bash theme={null}
# Fast SAST triage
semgrep --config auto ./src

# Structural AST search
sg scan ./src

# Secret detection
gitleaks detect --source ./
trufflehog filesystem ./

# Supply-chain and misconfiguration checks
trivy fs ./
```

### Custom Scripts

```bash theme={null}
# Run Python exploits
python3 exploit.py

# Execute shell scripts
./test_auth_bypass.sh
```

## Session Management

The agent can run multiple terminal sessions concurrently, for example:

* Main session for primary testing
* Secondary session for monitoring
* Background processes for servers or watchers


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.
