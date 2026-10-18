<!-- source: https://hindsight.vectorize.io/cookbook/recipes/personal_assistant -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Run this notebook

This recipe is available as an interactive Jupyter notebook.
[**Open in GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/blob/main/notebooks/personal_assistant.ipynb)

A general-purpose personal assistant that remembers your preferences, schedule, family, work context, and past conversations.

## Features [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#features "Direct link to Features")

- Remembers family, work, and personal details
- Tracks preferences and habits
- Helps with scheduling and reminders
- Maintains context across conversations

## Prerequisites [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#prerequisites "Direct link to Prerequisites")

- OpenAI API key
- Hindsight running locally via Docker (see setup below)

## Start Hindsight Locally [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#start-hindsight-locally "Direct link to Start Hindsight Locally")

Before running this notebook, start Hindsight in a terminal:

```bash
export OPENAI_API_KEY="your-openai-api-key"

docker run --rm -it --pull always -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
  -e HINDSIGHT_API_LLM_MODEL=gpt-4o-mini \
  -v $HOME/.hindsight-docker:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest
```

## 1\. Install Dependencies [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#1-install-dependencies "Direct link to 1. Install Dependencies")

```python
!pip install -q hindsight-client openai nest-asyncio
```

## 2\. Configure OpenAI API Key [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#2-configure-openai-api-key "Direct link to 2. Configure OpenAI API Key")

Enter your OpenAI API key when prompted (used by both Hindsight and the demo).

```python
import getpass
import os

# Set OpenAI API key (used by both Hindsight and the demo)
if not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")

print("API key configured!")
```

## 3\. Initialize Clients [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#3-initialize-clients "Direct link to 3. Initialize Clients")

```python
import nest_asyncio
nest_asyncio.apply()

from datetime import datetime
from openai import OpenAI
from hindsight_client import Hindsight

# Initialize Hindsight client (connects to local Docker instance)
hindsight = Hindsight(
    base_url=os.getenv("HINDSIGHT_BASE_URL", "http://localhost:8888"),
)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

USER_ID = "assistant-user-demo"

print("Clients initialized!")
```

## 4\. Define Helper Functions [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#4-define-helper-functions "Direct link to 4. Define Helper Functions")

```python
def remember(info: str, category: str = "general") -> str:
    """Store information to remember."""
    today = datetime.now().strftime("%B %d, %Y")

    hindsight.retain(
        bank_id=USER_ID,
        content=f"{today}: {info}",
        metadata={"category": category, "date": today},
    )

    return f"I'll remember: {info}"

def recall_context(query: str) -> str:
    """Recall relevant memories for context."""
    memories = hindsight.recall(
        bank_id=USER_ID,
        query=query,
        budget="high",
    )

    if memories and memories.results:
        return "\n".join(f"- {m.text}" for m in memories.results[:8])
    return ""

def chat(user_message: str) -> str:
    """Chat with the personal assistant."""
    context = recall_context(user_message)

    system_prompt = f"""You are a helpful personal AI assistant with long-term memory.
You remember the user's preferences, schedule, family, work context, and past conversations.

What you remember about this user:
{context if context else "No memories recorded yet."}

Your capabilities:
- Remember things when asked ("Remember that...", "Don't forget...")
- Recall past information ("What did I tell you about...", "When is...")
- Provide personalized suggestions based on known preferences
- Help with scheduling and reminders
- Have natural conversations while maintaining context

Be helpful, proactive, and reference relevant memories naturally."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[\
            {"role": "system", "content": system_prompt},\
            {"role": "user", "content": user_message},\
        ],
        temperature=0.7,
        max_tokens=500,
    )

    answer = response.choices[0].message.content

    # Check if user is asking to remember something
    lower_msg = user_message.lower()
    if any(phrase in lower_msg for phrase in ["remember that", "don't forget", "remind me", "note that"]):
        hindsight.retain(
            bank_id=USER_ID,
            content=f"User asked to remember: {user_message}",
            metadata={"category": "reminder"},
        )

    # Store the interaction
    hindsight.retain(
        bank_id=USER_ID,
        content=f"Conversation - User: {user_message[:100]} | Assistant: {answer[:100]}",
        metadata={"category": "conversation"},
    )

    return answer

def get_summary(topic: str = None) -> str:
    """Get a summary of memories."""
    query = f"Summarize what you know about {topic}" if topic else \
            "Summarize everything you know about this user"

    summary = hindsight.reflect(
        bank_id=USER_ID,
        query=query,
        budget="high",
    )
    return summary.text if hasattr(summary, 'text') else str(summary)

print("Helper functions defined!")
```

## 5\. Build Context [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#5-build-context "Direct link to 5. Build Context")

```python
print("Building context...")

initial_context = [\
    ("My name is Alex and I work as a product manager at TechCorp", "personal"),\
    ("My wife's name is Sarah and we have two kids: Emma (7) and Jack (4)", "family"),\
    ("I prefer morning meetings and try to keep afternoons for deep work", "preference"),\
    ("My mom's birthday is March 15th", "event"),\
    ("I'm trying to read more - currently reading 'Atomic Habits'", "hobby"),\
    ("I have a weekly team standup every Monday at 10am", "schedule"),\
    ("I'm allergic to cats", "health"),\
    ("My favorite coffee is a flat white with oat milk", "preference"),\
    ("I'm training for a half marathon in April", "goal"),\
]

for info, category in initial_context:
    result = remember(info, category)
    print(f"  {result}")
```

## 6\. Have a Conversation [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#6-have-a-conversation "Direct link to 6. Have a Conversation")

```python
import time

print("=" * 60)
print("  Conversation")
print("=" * 60)

conversations = [\
    "Hey, what's my wife's name again?",\
    "Remember that my Q1 review is next Thursday at 2pm",\
    "I need a gift idea for my mom's birthday",\
    "What time is my Monday standup?",\
    "Can you recommend a coffee order for me?",\
    "What books am I reading?",\
]

for message in conversations:
    print(f"\nAlex: {message}")
    print("-" * 40)
    response = chat(message)
    print(f"Assistant: {response}")
    time.sleep(1)
```

## 7\. View Summary [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#7-view-summary "Direct link to 7. View Summary")

```python
print("=" * 60)
print("  What I Know About You")
print("=" * 60)
print(get_summary())
```

```python
print("=" * 60)
print("  Your Family")
print("=" * 60)
print(get_summary("family"))
```

## 8\. Try Your Own Message [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#8-try-your-own-message "Direct link to 8. Try Your Own Message")

```python
your_message = "What should I focus on this month with my training?"  # Change this!

print(f"You: {your_message}")
print("-" * 40)
print(f"Assistant: {chat(your_message)}")
```

## 9\. Cleanup [​](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant\#9-cleanup "Direct link to 9. Cleanup")

```python
hindsight.close()
print("Client connection closed.")
```

- [Features](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#features)
- [Prerequisites](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#prerequisites)
- [Start Hindsight Locally](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#start-hindsight-locally)
- [1\. Install Dependencies](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#1-install-dependencies)
- [2\. Configure OpenAI API Key](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#2-configure-openai-api-key)
- [3\. Initialize Clients](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#3-initialize-clients)
- [4\. Define Helper Functions](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#4-define-helper-functions)
- [5\. Build Context](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#5-build-context)
- [6\. Have a Conversation](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#6-have-a-conversation)
- [7\. View Summary](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#7-view-summary)
- [8\. Try Your Own Message](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#8-try-your-own-message)
- [9\. Cleanup](https://hindsight.vectorize.io/cookbook/recipes/personal_assistant#9-cleanup)
