<!-- source: https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Run this notebook

This recipe is available as an interactive Jupyter notebook.
[**Open in GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/blob/main/notebooks/04-litellm-memory-demo.ipynb)

This notebook demonstrates how to add persistent memory to any LLM app using the `hindsight-litellm` package. Memory storage and injection happen automatically via LiteLLM callbacks - no manual memory management needed!

**Key features demonstrated:**

1. `configure()` \+ `enable()` \- Set up automatic memory integration
2. Automatic storage - Conversations are stored after each LLM call
3. Automatic injection - Relevant memories are injected into prompts

The `hindsight-litellm` package hooks into LiteLLM's callback system to:

- Store each conversation after successful LLM responses
- Inject relevant memories into the system prompt before LLM calls

## Prerequisites [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#prerequisites "Direct link to Prerequisites")

Make sure you have Hindsight running:

```bash
export OPENAI_API_KEY=your-key

docker run --rm -it --pull always -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  -e HINDSIGHT_API_LLM_MODEL=o3-mini \
  -v $HOME/.hindsight-docker:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest
```

- API: [http://localhost:8888](http://localhost:8888/)
- UI: [http://localhost:9999](http://localhost:9999/)

## Installation [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#installation "Direct link to Installation")

```python
!pip install hindsight-litellm litellm nest_asyncio python-dotenv -U -q
```

## Setup [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#setup "Direct link to Setup")

```python
import os
import uuid
import time
import logging
import nest_asyncio
from dotenv import load_dotenv

# Apply nest_asyncio for Jupyter compatibility
nest_asyncio.apply()

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logging.getLogger("LiteLLM").setLevel(logging.WARNING)
logging.getLogger("LiteLLM Router").setLevel(logging.WARNING)
logging.getLogger("LiteLLM Proxy").setLevel(logging.WARNING)

# Import hindsight_litellm
import hindsight_litellm

# Configuration
HINDSIGHT_API_URL = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")

# Check for API key
if not os.getenv("OPENAI_API_KEY"):
    print("Warning: OPENAI_API_KEY not set")
```

## Configure and Enable Automatic Memory [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#configure-and-enable-automatic-memory "Direct link to Configure and Enable Automatic Memory")

This is all you need! After this, all LiteLLM calls will automatically:

- Have relevant memories injected into the prompt
- Store conversations to Hindsight after the response

```python
# Generate a unique bank_id for this demo session
bank_id = f"demo-{uuid.uuid4().hex[:8]}"
print(f"Using bank_id: {bank_id}")

# Configure and enable hindsight
hindsight_litellm.configure(
    hindsight_api_url=HINDSIGHT_API_URL,
    bank_id=bank_id,
    store_conversations=True,  # Automatically store conversations
    inject_memories=True,       # Automatically inject relevant memories
    verbose=True,               # Enable logging to debug memory operations
)
hindsight_litellm.enable()

print("Hindsight memory integration enabled!")
```

## Conversation 1: User Introduces Themselves [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#conversation-1-user-introduces-themselves "Direct link to Conversation 1: User Introduces Themselves")

In this first conversation, the user shares some information about themselves. This will be automatically stored to Hindsight memory.

```python
user_message_1 = "Hi! I'm Alex and I work at Google as a software engineer. I love Python and machine learning."
print(f"User: {user_message_1}\n")

# Use hindsight_litellm.completion() directly
response_1 = hindsight_litellm.completion(
    model="gpt-4o-mini",
    messages=[\
        {"role": "system", "content": "You are a helpful assistant."},\
        {"role": "user", "content": user_message_1}\
    ],
)

assistant_response_1 = response_1.choices[0].message.content
print(f"Assistant: {assistant_response_1}")
print("\n(Conversation automatically stored to Hindsight)")
```

## Wait for Memory Processing [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#wait-for-memory-processing "Direct link to Wait for Memory Processing")

Hindsight needs a few seconds to process and extract facts from the conversation.

```python
print("Waiting 12 seconds for memory processing...")
time.sleep(12)
print("Done!")
```

## Conversation 2: Test Memory-Augmented Response [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#conversation-2-test-memory-augmented-response "Direct link to Conversation 2: Test Memory-Augmented Response")

Now we start a fresh conversation and ask what the assistant remembers. The memories from the previous conversation will be automatically injected into the prompt!

```python
user_message_2 = "What do you know about me? What programming language should I use for my next project?"
print(f"User: {user_message_2}\n")

# Memories are automatically injected before this call!
response_2 = hindsight_litellm.completion(
    model="gpt-4o-mini",
    messages=[\
        {"role": "system", "content": "You are a helpful assistant."},\
        {"role": "user", "content": user_message_2}\
    ],
)

print(f"Assistant: {response_2.choices[0].message.content}")
```

## Summary [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#summary "Direct link to Summary")

The assistant should have remembered that Alex:

- Works at Google as a software engineer
- Loves Python and machine learning

And it should have recommended Python based on that knowledge!

```python
print(f"Memories stored in bank: {bank_id}")
print(f"View in UI: http://localhost:9999/banks/{bank_id}")
```

## Cleanup [​](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo\#cleanup "Direct link to Cleanup")

```python
hindsight_litellm.cleanup()

# Optional: delete the bank
import requests
response = requests.delete(f"{HINDSIGHT_API_URL}/v1/default/banks/{bank_id}")
print(f"Deleted bank: {response.json()}")
```

- [Prerequisites](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#prerequisites)
- [Installation](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#installation)
- [Setup](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#setup)
- [Configure and Enable Automatic Memory](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#configure-and-enable-automatic-memory)
- [Conversation 1: User Introduces Themselves](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#conversation-1-user-introduces-themselves)
- [Wait for Memory Processing](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#wait-for-memory-processing)
- [Conversation 2: Test Memory-Augmented Response](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#conversation-2-test-memory-augmented-response)
- [Summary](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#summary)
- [Cleanup](https://hindsight.vectorize.io/cookbook/recipes/litellm-memory-demo#cleanup)
