<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#__docusaurus_skipToContent_fallback)

On this page

Iterative Python via live Jupyter kernel (hamelnb).

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/data-science/jupyter-notebook` |
| Path | `optional-skills/data-science/jupyter-notebook` |
| Version | `1.0.0` |
| Author | Hermes Agent |
| License | MIT |
| Platforms | linux, macos, windows |
| Tags | `jupyter`, `notebook`, `repl`, `data-science`, `exploration`, `iterative` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Jupyter Notebook (hamelnb live kernel)

Gives you a **stateful Python REPL** via a live Jupyter kernel. Variables persist
across executions. Use this instead of `execute_code` when you need to build up
state incrementally, explore APIs, inspect DataFrames, or iterate on complex code.

## When to Use This vs Other Tools [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#when-to-use-this-vs-other-tools "Direct link to When to Use This vs Other Tools")

| Tool | Use When |
| --- | --- |
| **This skill** | Iterative exploration, state across steps, data science, ML, "let me try this and check" |
| `execute_code` | One-shot scripts needing hermes tool access (web\_search, file ops). Stateless. |
| `terminal` | Shell commands, builds, installs, git, process management |

**Rule of thumb:** If you'd want a Jupyter notebook for the task, use this skill.

## Prerequisites [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#prerequisites "Direct link to Prerequisites")

1. **uv** must be installed (check: `which uv`)
2. **JupyterLab** must be installed: `uv tool install jupyterlab`
3. A Jupyter server must be running (see Setup below)

## Setup [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#setup "Direct link to Setup")

The hamelnb script location:

```text
SCRIPT="$HOME/.agent-skills/hamelnb/skills/jupyter-live-kernel/scripts/jupyter_live_kernel.py"
```

If not cloned yet:

```text
git clone https://github.com/hamelsmu/hamelnb.git ~/.agent-skills/hamelnb
```

### Starting JupyterLab [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#starting-jupyterlab "Direct link to Starting JupyterLab")

Check if a server is already running:

```text
uv run "$SCRIPT" servers
```

If no servers found, start one:

```text
jupyter-lab --no-browser --port=8888 --notebook-dir=$HOME/notebooks \

  --IdentityProvider.token='' --ServerApp.password='' > ~/.hermes/cache/scratch/jupyter.log 2>&1 &

sleep 3
```

Note: Token/password disabled for local agent access. The server runs headless.

### Creating a Notebook for REPL Use [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#creating-a-notebook-for-repl-use "Direct link to Creating a Notebook for REPL Use")

If you just need a REPL (no existing notebook), create a minimal notebook file:

```text
mkdir -p ~/notebooks
```

Write a minimal .ipynb JSON file with one empty code cell, then start a kernel
session via the Jupyter REST API:

```text
curl -s -X POST http://127.0.0.1:8888/api/sessions \

  -H "Content-Type: application/json" \

  -d '{"path":"scratch.ipynb","type":"notebook","name":"scratch.ipynb","kernel":{"name":"python"}}'
```

## Core Workflow [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#core-workflow "Direct link to Core Workflow")

All commands return structured JSON. Always use `--compact` to save tokens.

### 1\. Discover servers and notebooks [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#1-discover-servers-and-notebooks "Direct link to 1. Discover servers and notebooks")

```text
uv run "$SCRIPT" servers --compact

uv run "$SCRIPT" notebooks --compact
```

### 2\. Execute code (primary operation) [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#2-execute-code-primary-operation "Direct link to 2. Execute code (primary operation)")

```text
uv run "$SCRIPT" execute --path <notebook.ipynb> --code '<python code>' --compact
```

State persists across execute calls. Variables, imports, objects all survive.

Multi-line code works with $'...' quoting:

```text
uv run "$SCRIPT" execute --path scratch.ipynb --code $'import os\nfiles = os.listdir(".")\nprint(f"Found {len(files)} files")' --compact
```

### 3\. Inspect live variables [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#3-inspect-live-variables "Direct link to 3. Inspect live variables")

```text
uv run "$SCRIPT" variables --path <notebook.ipynb> list --compact

uv run "$SCRIPT" variables --path <notebook.ipynb> preview --name <varname> --compact
```

### 4\. Edit notebook cells [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#4-edit-notebook-cells "Direct link to 4. Edit notebook cells")

```text
# View current cells

uv run "$SCRIPT" contents --path <notebook.ipynb> --compact

# Insert a new cell

uv run "$SCRIPT" edit --path <notebook.ipynb> insert \

  --at-index <N> --cell-type code --source '<code>' --compact

# Replace cell source (use cell-id from contents output)

uv run "$SCRIPT" edit --path <notebook.ipynb> replace-source \

  --cell-id <id> --source '<new code>' --compact

# Delete a cell

uv run "$SCRIPT" edit --path <notebook.ipynb> delete --cell-id <id> --compact
```

### 5\. Verification (restart + run all) [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#5-verification-restart--run-all "Direct link to 5. Verification (restart + run all)")

Only use when the user asks for a clean verification or you need to confirm
the notebook runs top-to-bottom:

```text
uv run "$SCRIPT" restart-run-all --path <notebook.ipynb> --save-outputs --compact
```

## Practical Tips from Experience [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#practical-tips-from-experience "Direct link to Practical Tips from Experience")

01. **First execution after server start may timeout** — the kernel needs a moment
    to initialize. If you get a timeout, just retry.

02. **The kernel Python is JupyterLab's Python** — packages must be installed in
    that environment. If you need additional packages, install them into the
    JupyterLab tool environment first.

03. **--compact flag saves significant tokens** — always use it. JSON output can
    be very verbose without it.

04. **For pure REPL use**, create a scratch.ipynb and don't bother with cell editing.
    Just use `execute` repeatedly.

05. **Argument order matters** — subcommand flags like `--path` go BEFORE the
    sub-subcommand. E.g.: `variables --path nb.ipynb list` not `variables list --path nb.ipynb`.

06. **If a session doesn't exist yet**, you need to start one via the REST API
    (see Setup section). The tool can't execute without a live kernel session.

07. **Errors are returned as JSON** with traceback — read the `ename` and `evalue`
    fields to understand what went wrong.

08. **Occasional websocket timeouts** — some operations may timeout on first try,
    especially after a kernel restart. Retry once before escalating.

09. **If websocket consistently times out on this host**, force zmq transport:
    `uv run "$SCRIPT" execute --transport zmq ...`. Symptom: every execute returns
    "Websocket execution may already have reached the kernel, so auto fallback was
    skipped". The kernel actually ran fine (REST shows execution\_state=idle and
    execution\_count increments) — only the websocket reply channel is broken.
    zmq transport uses jupyter\_client directly and sidesteps the issue.

10. **When starting a fresh server for REST-only use**, add
    `--ServerApp.disable_check_xsrf=True` — otherwise POST /api/sessions returns
    `"'_xsrf' argument missing from POST"` and kernel session creation fails.


## Timeout Defaults [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook\#timeout-defaults "Direct link to Timeout Defaults")

The script has a 30-second default timeout per execution. For long-running
operations, pass `--timeout 120`. Use generous timeouts (60+) for initial
setup or heavy computation.

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#reference-full-skillmd)
- [When to Use This vs Other Tools](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#when-to-use-this-vs-other-tools)
- [Prerequisites](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#prerequisites)
- [Setup](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#setup)
  - [Starting JupyterLab](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#starting-jupyterlab)
  - [Creating a Notebook for REPL Use](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#creating-a-notebook-for-repl-use)
- [Core Workflow](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#core-workflow)
  - [1\. Discover servers and notebooks](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#1-discover-servers-and-notebooks)
  - [2\. Execute code (primary operation)](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#2-execute-code-primary-operation)
  - [3\. Inspect live variables](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#3-inspect-live-variables)
  - [4\. Edit notebook cells](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#4-edit-notebook-cells)
  - [5\. Verification (restart + run all)](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#5-verification-restart--run-all)
- [Practical Tips from Experience](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#practical-tips-from-experience)
- [Timeout Defaults](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/data-science/data-science-jupyter-notebook#timeout-defaults)
