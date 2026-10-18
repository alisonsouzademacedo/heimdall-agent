<!-- source: https://hindsight.vectorize.io/cookbook/applications/claims-iq -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/applications/claims-iq#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Complete Application

This is a complete, runnable application demonstrating Hindsight integration.
[**View source on GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/tree/main/applications/claims-iq)

An AI agent that processes insurance claims through a multi-step workflow. The agent starts as a "confused rookie" and becomes a "seasoned expert" as [Hindsight](https://github.com/anthropics/hindsight) memories accumulate.

Watch the agent learn coverage rules, adjuster assignments, and escalation patterns in real-time through a pipeline dashboard.

## Quick Start [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#quick-start "Direct link to Quick Start")

### 1\. Start Hindsight API (port 8888) [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#1-start-hindsight-api-port-8888 "Direct link to 1. Start Hindsight API (port 8888)")

```bash
docker run -p 8888:8888 ghcr.io/anthropics/hindsight:latest
```

### 2\. Start Backend (port 8000) [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#2-start-backend-port-8000 "Direct link to 2. Start Backend (port 8000)")

```bash
cd backend
pip install -r requirements.txt
./run.sh
```

### 3\. Start Frontend (port 5173) [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#3-start-frontend-port-5173 "Direct link to 3. Start Frontend (port 5173)")

```bash
cd frontend
npm install
npm run dev
```

### 4\. Open Browser [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#4-open-browser "Direct link to 4. Open Browser")

Navigate to `http://localhost:5173`.

## How It Works [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#how-it-works "Direct link to How It Works")

The agent processes insurance claims using 6 tools:

1. **Classify** the claim category (auto, property, flood, etc.)
2. **Look up** the policy details
3. **Check coverage** rules for the policy type
4. **Check fraud** indicators
5. **Assign** the right adjuster
6. **Submit** a decision for validation

The system validates each decision against ground truth. If the agent makes a mistake (wrong adjuster, incorrect coverage call), the decision is rejected with feedback — creating learning signal for Hindsight.

## Agent Modes [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#agent-modes "Direct link to Agent Modes")

| Mode | Description |
| --- | --- |
| **No Memory** | Baseline — agent starts fresh every claim |
| **Recall** | Raw facts from past claims injected before processing |
| **Reflect** | LLM-synthesized knowledge injected |
| **Mental Models** | Full Hindsight mental models with auto-refresh |

## Key Learning Challenges [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#key-learning-challenges "Direct link to Key Learning Challenges")

- **Water damage vs Flood**: Gold policies cover water damage (burst pipe) but NOT flood damage (rain/river). The agent must learn this subtle distinction.
- **Adjuster routing**: 8 adjusters with different specialties and regions. The agent must learn who handles what.
- **Escalation thresholds**: Claims over $50K need a senior adjuster; over $100K need manager review.
- **Fraud detection**: Multiple indicators (near-limit claims, repeated address) route to the fraud specialist.

## Environment Variables [​](https://hindsight.vectorize.io/cookbook/applications/claims-iq\#environment-variables "Direct link to Environment Variables")

| Variable | Default | Description |
| --- | --- | --- |
| `LLM_MODEL` | `openai/gpt-4o` | LLM model for the agent |
| `HINDSIGHT_API_URL` | `http://localhost:8888` | Hindsight API URL |
| `BACKEND_PORT` | `8000` | Backend server port |

- [Quick Start](https://hindsight.vectorize.io/cookbook/applications/claims-iq#quick-start)
  - [1\. Start Hindsight API (port 8888)](https://hindsight.vectorize.io/cookbook/applications/claims-iq#1-start-hindsight-api-port-8888)
  - [2\. Start Backend (port 8000)](https://hindsight.vectorize.io/cookbook/applications/claims-iq#2-start-backend-port-8000)
  - [3\. Start Frontend (port 5173)](https://hindsight.vectorize.io/cookbook/applications/claims-iq#3-start-frontend-port-5173)
  - [4\. Open Browser](https://hindsight.vectorize.io/cookbook/applications/claims-iq#4-open-browser)
- [How It Works](https://hindsight.vectorize.io/cookbook/applications/claims-iq#how-it-works)
- [Agent Modes](https://hindsight.vectorize.io/cookbook/applications/claims-iq#agent-modes)
- [Key Learning Challenges](https://hindsight.vectorize.io/cookbook/applications/claims-iq#key-learning-challenges)
- [Environment Variables](https://hindsight.vectorize.io/cookbook/applications/claims-iq#environment-variables)
