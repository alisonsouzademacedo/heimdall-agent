<!-- source: https://hindsight.vectorize.io/sdks/integrations/agentcore -->
[Skip to main content](https://hindsight.vectorize.io/sdks/integrations/agentcore#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Building with a coding agent?![Claude Code](https://hindsight.vectorize.io/img/icons/claude-code.png)![Codex](https://hindsight.vectorize.io/img/icons/codex.svg)![Cursor](https://hindsight.vectorize.io/img/icons/cursor.svg)

Install skill

On this page

Persistent memory for [Amazon Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html) agents using Hindsight.

AgentCore Runtime sessions are explicitly ephemeral — they terminate on inactivity and reprovision fresh environments. `hindsight-agentcore` adds durable cross-session memory so agents remember users, decisions, and learned patterns across any number of Runtime sessions.

[View Changelog →](https://hindsight.vectorize.io/changelog/integrations/agentcore)

## How It Works [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#how-it-works "Direct link to How It Works")

```text
AgentCore Runtime invocation
        │
        ▼
   before_turn()         ← Recall relevant memories from Hindsight
        │
        ▼
  Agent executes          ← Prompt enriched with prior context
        │
        ▼
   after_turn()          ← Retain output to Hindsight (async)
```

Memory is keyed to stable user identity — **not** the `runtimeSessionId`. Banks survive session churn.

Default bank format:

```text
tenant:{tenant_id}:user:{user_id}:agent:{agent_name}
```

## Installation [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#installation "Direct link to Installation")

```bash
pip install hindsight-agentcore
```

## Quick Start [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#quick-start "Direct link to Quick Start")

Recommended: Hindsight Cloud

[Sign up free](https://ui.hindsight.vectorize.io/) and grab an API key — no self-hosting required.

```python
import os
from hindsight_agentcore import HindsightRuntimeAdapter, TurnContext, configure

configure(
    hindsight_api_url="https://api.hindsight.vectorize.io",
    api_key=os.environ["HINDSIGHT_API_KEY"],
)

adapter = HindsightRuntimeAdapter(agent_name="support-agent")

# Your AgentCore Runtime handler
async def handler(event: dict) -> dict:
    context = TurnContext(
        runtime_session_id=event["sessionId"],
        user_id=event["userId"],       # from validated auth — never client-supplied
        agent_name="support-agent",
        tenant_id=event.get("tenantId"),
        request_id=event.get("requestId"),
    )

    result = await adapter.run_turn(
        context=context,
        payload={"prompt": event["prompt"]},
        agent_callable=run_my_agent,
    )
    return result

async def run_my_agent(payload: dict, memory_context: str) -> dict:
    prompt = payload["prompt"]
    if memory_context:
        prompt = f"Past context:\n{memory_context}\n\nCurrent request: {prompt}"

    output = await call_bedrock(prompt)
    return {"output": output}
```

## Lower-Level Hooks [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#lower-level-hooks "Direct link to Lower-Level Hooks")

For direct control over the recall → execute → retain cycle:

```python
memory_context = await adapter.before_turn(context, query=user_message)

result = await run_my_agent(payload, memory_context=memory_context)

await adapter.after_turn(context, result=result["output"], query=user_message)
```

## Retrieval Modes [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#retrieval-modes "Direct link to Retrieval Modes")

### Recall (default) [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#recall-default "Direct link to Recall (default)")

Fast multi-strategy retrieval (semantic + keyword + graph + temporal):

```python
from hindsight_agentcore import RecallPolicy

adapter = HindsightRuntimeAdapter(
    recall_policy=RecallPolicy(mode="recall", budget="mid", max_tokens=1500)
)
```

### Reflect [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#reflect "Direct link to Reflect")

LLM-synthesized context for complex reasoning tasks:

```python
adapter = HindsightRuntimeAdapter(
    recall_policy=RecallPolicy(mode="reflect")
)
```

Use `reflect` selectively — it's slower. Reserve it for explicit planning steps or routing decisions.

## Async Retention [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#async-retention "Direct link to Async Retention")

By default, `after_turn()` fires retention as a background task — the user turn is never delayed:

```python
configure(retain_async=True)   # default
configure(retain_async=False)  # await retention before returning
```

## Long-Running Workflows [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#long-running-workflows "Direct link to Long-Running Workflows")

For jobs spanning multiple Runtime sessions, retain at start and completion:

```python
# Task start
await adapter.after_turn(
    context,
    result="Started QBR analysis for Acme Corp",
    query=task_description,
)

# ... long-running work across potentially multiple sessions ...

# Task completion
await adapter.after_turn(
    context,
    result=f"Completed QBR analysis. Finding: {summary}",
    query=task_description,
)
```

## Identity and Auth [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#identity-and-auth "Direct link to Identity and Auth")

**Never use `runtimeSessionId` as the bank ID.** Sessions expire. Memory must survive session churn.

Preferred identity sources (in order):

1. Validated user ID from AgentCore JWT/OAuth context
2. `X-Amzn-Bedrock-AgentCore-Runtime-User-Id` header
3. Application-supplied user ID in trusted server-side deployments

```python
context = TurnContext(
    runtime_session_id=event["sessionId"],
    user_id=jwt_claims["sub"],         # stable identity from validated token
    agent_name="support-agent",
    tenant_id=jwt_claims.get("tenant"),
)
```

## Custom Bank Resolution [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#custom-bank-resolution "Direct link to Custom Bank Resolution")

Override the default `tenant:user:agent` format:

```python
from hindsight_agentcore import TurnContext

def my_resolver(context: TurnContext) -> str:
    return f"acme:{context.user_id}:{context.agent_name}"

adapter = HindsightRuntimeAdapter(bank_resolver=my_resolver)
```

**Security rule:** The resolver must fail closed (`BankResolutionError`) rather than leak memory across users when identity is missing.

## Configuration Reference [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#configuration-reference "Direct link to Configuration Reference")

| Option | Env Variable | Default | Description |
| --- | --- | --- | --- |
| `hindsight_api_url` | `HINDSIGHT_API_URL` | Hindsight Cloud | Hindsight server URL |
| `api_key` | `HINDSIGHT_API_KEY` | — | API key for Hindsight Cloud |
| `recall_budget` | — | `"mid"` | Search depth: `low`, `mid`, `high` |
| `recall_max_tokens` | — | `1500` | Max tokens recalled |
| `retain_async` | — | `True` | Non-blocking retention |
| `timeout` | — | `15.0` | HTTP timeout in seconds |
| `tags` | — | `[]` | Tags applied to all retained memories |
| `verbose` | — | `False` | Log memory operations |

## Failure Modes [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#failure-modes "Direct link to Failure Modes")

| Failure | Behavior |
| --- | --- |
| Hindsight unavailable | `before_turn()` returns `""`, agent continues |
| Recall timeout | Returns `""`, agent continues |
| Retain failure | Logged as warning, user turn unaffected |
| Bad bank resolution | Fails closed — no cross-user memory leakage |

## Requirements [​](https://hindsight.vectorize.io/sdks/integrations/agentcore\#requirements "Direct link to Requirements")

- Python 3.10+
- `hindsight-client>=0.4.0`

- [How It Works](https://hindsight.vectorize.io/sdks/integrations/agentcore#how-it-works)
- [Installation](https://hindsight.vectorize.io/sdks/integrations/agentcore#installation)
- [Quick Start](https://hindsight.vectorize.io/sdks/integrations/agentcore#quick-start)
- [Lower-Level Hooks](https://hindsight.vectorize.io/sdks/integrations/agentcore#lower-level-hooks)
- [Retrieval Modes](https://hindsight.vectorize.io/sdks/integrations/agentcore#retrieval-modes)
  - [Recall (default)](https://hindsight.vectorize.io/sdks/integrations/agentcore#recall-default)
  - [Reflect](https://hindsight.vectorize.io/sdks/integrations/agentcore#reflect)
- [Async Retention](https://hindsight.vectorize.io/sdks/integrations/agentcore#async-retention)
- [Long-Running Workflows](https://hindsight.vectorize.io/sdks/integrations/agentcore#long-running-workflows)
- [Identity and Auth](https://hindsight.vectorize.io/sdks/integrations/agentcore#identity-and-auth)
- [Custom Bank Resolution](https://hindsight.vectorize.io/sdks/integrations/agentcore#custom-bank-resolution)
- [Configuration Reference](https://hindsight.vectorize.io/sdks/integrations/agentcore#configuration-reference)
- [Failure Modes](https://hindsight.vectorize.io/sdks/integrations/agentcore#failure-modes)
- [Requirements](https://hindsight.vectorize.io/sdks/integrations/agentcore#requirements)
