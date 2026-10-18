<!-- source: https://hindsight.vectorize.io/cookbook/applications/stancetracker -->
[Skip to main content](https://hindsight.vectorize.io/cookbook/applications/stancetracker#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

Complete Application

This is a complete, runnable application demonstrating Hindsight integration.
[**View source on GitHub →**](https://github.com/vectorize-io/hindsight-cookbook/tree/main/applications/stancetracker)

An AI-powered application that tracks political candidates' stances on issues over time using Hindsight memory system and web scraping.

## Features [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#features "Direct link to Features")

- **Geographic Targeting**: Track stances by country, state/province, and city
- **Multi-Candidate Tracking**: Monitor multiple candidates simultaneously
- **Temporal Analysis**: Historical stance tracking with configurable time ranges
- **Automated Scraping**: Periodic content collection with configurable frequencies (hourly/daily/weekly)
- **Stance Change Detection**: Automatic detection and highlighting of position changes
- **Interactive Timeline**: Visual graph showing stance evolution with reference callouts
- **Source Attribution**: All stances linked to verified sources with excerpts

## Architecture [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#architecture "Direct link to Architecture")

### Memory System (Hindsight Integration) [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#memory-system-hindsight-integration "Direct link to Memory System (Hindsight Integration)")

This app uses the Hindsight memory system from `github.com/vectorize-io/hindsight`:

1. **Banks**: Each scraper agent has its own memory bank
2. **Retain**: Stores candidate statements and web scraping results
3. **Recall**: Semantic search to retrieve relevant memories
4. **Reflect**: Generates contextual analysis using stored memories
5. **Temporal Search**: Queries memories within specific time periods

### Tech Stack [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#tech-stack "Direct link to Tech Stack")

- **Frontend**: Next.js 16, React, TypeScript, TailwindCSS
- **Visualization**: Recharts for timeline graphs
- **Backend**: Next.js API routes
- **Memory**: Hindsight (from github.com/vectorize-io/hindsight)
- **Database**: JSON file storage (no database required)
- **Web Search**: Tavily API
- **LLM**: OpenAI/Anthropic/Groq (configurable)
- **Scheduling**: node-cron

## Prerequisites [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#prerequisites "Direct link to Prerequisites")

1. **Hindsight API** running (from github.com/vectorize-io/hindsight)
2. **API Keys**:
   - Tavily API key (for web search)
   - LLM provider API key (OpenAI, Anthropic, or Groq)

## Setup [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#setup "Direct link to Setup")

### 1\. Install Dependencies [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#1-install-dependencies "Direct link to 1. Install Dependencies")

```bash
npm install
```

### 2\. Configure Environment [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#2-configure-environment "Direct link to 2. Configure Environment")

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Hindsight API (from github.com/vectorize-io/hindsight)
HINDSIGHT_API_URL=http://localhost:8888

# Tavily API (for web search)
TAVILY_API_KEY=your_tavily_api_key_here

# LLM Provider
LLM_PROVIDER=openai  # or anthropic, groq
LLM_API_KEY=your_llm_api_key_here
LLM_MODEL=gpt-4-turbo-preview
```

### 3\. Start Hindsight [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#3-start-hindsight "Direct link to 3. Start Hindsight")

Clone and run Hindsight from github.com/vectorize-io/hindsight:

```bash
# Clone and run github.com/vectorize-io/hindsight
cd /path/to/hindsight
cargo run --bin hindsight-server
```

Verify Hindsight is running at `http://localhost:8888`

### 4\. Run the Application [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#4-run-the-application "Direct link to 4. Run the Application")

```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#usage "Direct link to Usage")

### Creating a Tracking Session [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#creating-a-tracking-session "Direct link to Creating a Tracking Session")

1. **Set Location**: Enter country (required), state/province, and city (optional)
2. **Choose Topic**: Specify the issue to track (e.g., "Climate Change Policy")
3. **Add Candidates**: Enter names of candidates/politicians to track
4. **Configure Time Range**: Set historical start/end dates for initial analysis
5. **Set Frequency**: Choose how often to check for updates (hourly/daily/weekly)
6. **Start Tracking**: Click "Start Tracking" to begin

### Viewing Results [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#viewing-results "Direct link to Viewing Results")

- **Timeline Graph**: Shows confidence levels of each candidate's stance over time
- **Stance Changes**: Red circles on the graph indicate detected position changes
- **Click Points**: Click any point to see detailed stance information and sources
- **Source Links**: Each stance includes links to original references

### Managing Sessions [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#managing-sessions "Direct link to Managing Sessions")

- **Pause/Resume**: Temporarily stop or restart tracking
- **Run Now**: Trigger an immediate update outside the schedule
- **Status**: View current session status and frequency

## API Endpoints [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#api-endpoints "Direct link to API Endpoints")

### Sessions [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#sessions "Direct link to Sessions")

- `POST /api/sessions` \- Create new tracking session
- `GET /api/sessions?id={id}` \- Get session details
- `GET /api/sessions` \- List all sessions
- `PATCH /api/sessions` \- Update session status

### Stances [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#stances "Direct link to Stances")

- `POST /api/stances` \- Process candidate stance
- `GET /api/stances?sessionId={id}&candidate={name}` \- Get stances

### Scheduler [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#scheduler "Direct link to Scheduler")

- `POST /api/scheduler`\- Control session scheduling
  - Actions: `start`, `stop`, `run`

## Hindsight Integration Examples [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#hindsight-integration-examples "Direct link to Hindsight Integration Examples")

### 1\. Storing Memories [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#1-storing-memories "Direct link to 1. Storing Memories")

```typescript
// Store web scraping results
await hindsightClient.retain(bankId, articleContent, {
  context: 'web_search_result',
  timestamp: articleDate,
  metadata: { url: articleUrl }
});
```

### 2\. Semantic Search [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#2-semantic-search "Direct link to 2. Semantic Search")

```typescript
// Search for relevant memories
const results = await hindsightClient.recall(bankId, query, {
  budget: 'high',
  maxTokens: 8192
});
```

### 3\. Temporal Filtering [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#3-temporal-filtering "Direct link to 3. Temporal Filtering")

```typescript
// Query memories up to a specific point in time
const results = await hindsightClient.recall(bankId, query, {
  queryTimestamp: '2024-12-01T00:00:00Z'
});
```

### 4\. Contextual Analysis [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#4-contextual-analysis "Direct link to 4. Contextual Analysis")

```typescript
// Generate analysis using stored memories
const response = await hindsightClient.reflect(bankId,
  'What is the candidate\'s stance on this issue?',
  { budget: 'high' }
);
```

## Production Deployment [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#production-deployment "Direct link to Production Deployment")

### Vercel Deployment [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#vercel-deployment "Direct link to Vercel Deployment")

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - HINDSIGHT_API_URL
# - TAVILY_API_KEY
# - LLM_PROVIDER
# - LLM_API_KEY
# - LLM_MODEL
```

**Note**: The `data/` directory for JSON storage will be ephemeral on Vercel. For production, consider using a persistent database or object storage.

## Development [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#development "Direct link to Development")

### Project Structure [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#project-structure "Direct link to Project Structure")

```text
stancetracker/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main page
├── components/       # React components
├── lib/
│   ├── db/          # JSON database utilities
│   ├── hindsight-client.ts    # Hindsight API client
│   ├── llm-client.ts       # LLM provider client
│   ├── web-scraper.ts      # Tavily web scraper
│   ├── scraper-agent.ts    # Content scraper
│   ├── rag-system.ts       # Memory retrieval
│   ├── stance-extractor.ts # Stance analysis
│   ├── stance-pipeline.ts  # Main pipeline
│   └── scheduler.ts        # Job scheduling
└── types/           # TypeScript types
```

### Adding New LLM Providers [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#adding-new-llm-providers "Direct link to Adding New LLM Providers")

Edit `lib/llm-client.ts` and add a new method:

```typescript
private async newProviderComplete(messages, options) {
  // Implementation
}
```

## Limitations [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#limitations "Direct link to Limitations")

- **Web Search**: Uses Tavily API which has rate limits
- **Source Verification**: Manual verification recommended for critical applications
- **Stance Extraction**: LLM-based, subject to model limitations
- **Storage**: JSON file storage is not suitable for high-scale production use
- **Rate Limits**: Respect API rate limits for Tavily, Hindsight, and LLM providers

## Future Enhancements [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#future-enhancements "Direct link to Future Enhancements")

- [ ] Real-time social media monitoring
- [ ] Speech/video transcription analysis
- [ ] Multi-language support
- [ ] Sentiment analysis integration
- [ ] Comparative analysis dashboard
- [ ] Export to CSV/PDF
- [ ] Email notifications for stance changes
- [ ] Public API for third-party integrations

## License [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#license "Direct link to License")

MIT

## Support [​](https://hindsight.vectorize.io/cookbook/applications/stancetracker\#support "Direct link to Support")

For issues or questions, please check:

- Hindsight documentation: `github.com/vectorize-io/hindsight/README.md`
- Tavily API docs: [https://tavily.com/](https://tavily.com/)
- Project issues: Create an issue in the repository

- [Features](https://hindsight.vectorize.io/cookbook/applications/stancetracker#features)
- [Architecture](https://hindsight.vectorize.io/cookbook/applications/stancetracker#architecture)
  - [Memory System (Hindsight Integration)](https://hindsight.vectorize.io/cookbook/applications/stancetracker#memory-system-hindsight-integration)
  - [Tech Stack](https://hindsight.vectorize.io/cookbook/applications/stancetracker#tech-stack)
- [Prerequisites](https://hindsight.vectorize.io/cookbook/applications/stancetracker#prerequisites)
- [Setup](https://hindsight.vectorize.io/cookbook/applications/stancetracker#setup)
  - [1\. Install Dependencies](https://hindsight.vectorize.io/cookbook/applications/stancetracker#1-install-dependencies)
  - [2\. Configure Environment](https://hindsight.vectorize.io/cookbook/applications/stancetracker#2-configure-environment)
  - [3\. Start Hindsight](https://hindsight.vectorize.io/cookbook/applications/stancetracker#3-start-hindsight)
  - [4\. Run the Application](https://hindsight.vectorize.io/cookbook/applications/stancetracker#4-run-the-application)
- [Usage](https://hindsight.vectorize.io/cookbook/applications/stancetracker#usage)
  - [Creating a Tracking Session](https://hindsight.vectorize.io/cookbook/applications/stancetracker#creating-a-tracking-session)
  - [Viewing Results](https://hindsight.vectorize.io/cookbook/applications/stancetracker#viewing-results)
  - [Managing Sessions](https://hindsight.vectorize.io/cookbook/applications/stancetracker#managing-sessions)
- [API Endpoints](https://hindsight.vectorize.io/cookbook/applications/stancetracker#api-endpoints)
  - [Sessions](https://hindsight.vectorize.io/cookbook/applications/stancetracker#sessions)
  - [Stances](https://hindsight.vectorize.io/cookbook/applications/stancetracker#stances)
  - [Scheduler](https://hindsight.vectorize.io/cookbook/applications/stancetracker#scheduler)
- [Hindsight Integration Examples](https://hindsight.vectorize.io/cookbook/applications/stancetracker#hindsight-integration-examples)
  - [1\. Storing Memories](https://hindsight.vectorize.io/cookbook/applications/stancetracker#1-storing-memories)
  - [2\. Semantic Search](https://hindsight.vectorize.io/cookbook/applications/stancetracker#2-semantic-search)
  - [3\. Temporal Filtering](https://hindsight.vectorize.io/cookbook/applications/stancetracker#3-temporal-filtering)
  - [4\. Contextual Analysis](https://hindsight.vectorize.io/cookbook/applications/stancetracker#4-contextual-analysis)
- [Production Deployment](https://hindsight.vectorize.io/cookbook/applications/stancetracker#production-deployment)
  - [Vercel Deployment](https://hindsight.vectorize.io/cookbook/applications/stancetracker#vercel-deployment)
- [Development](https://hindsight.vectorize.io/cookbook/applications/stancetracker#development)
  - [Project Structure](https://hindsight.vectorize.io/cookbook/applications/stancetracker#project-structure)
  - [Adding New LLM Providers](https://hindsight.vectorize.io/cookbook/applications/stancetracker#adding-new-llm-providers)
- [Limitations](https://hindsight.vectorize.io/cookbook/applications/stancetracker#limitations)
- [Future Enhancements](https://hindsight.vectorize.io/cookbook/applications/stancetracker#future-enhancements)
- [License](https://hindsight.vectorize.io/cookbook/applications/stancetracker#license)
- [Support](https://hindsight.vectorize.io/cookbook/applications/stancetracker#support)
