<!-- source: https://hindsight.vectorize.io/api-reference -->
[Skip to main content](https://hindsight.vectorize.io/api-reference#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

- Monitoring
  - getHealth check endpoint
  - getReadiness probe
  - getLiveness probe
  - getGet API version and feature flags
  - getPrometheus metrics endpoint
- Memory
  - getGet memory graph data
  - getList memory units
  - postDry-run fact extraction (preview, no persistence)
  - getGet memory unit
  - patchCurate memory unit
  - getGet observation history
  - postRecall memory
  - postReflect and generate answer
  - getList tags
  - getFetch an attachment retained inline with a document
  - getList observation scopes
  - postPreview consolidation strategies
  - delClear observations for a memory
  - postRetain memories
  - delClear memory bank memories
- Banks
  - postPreview an operation's prompts (no LLM call)
  - getList memory banks
  - getGet statistics for memory bank
  - postTest the bank's LLM connectivity
  - getMemory ingestion time-series
  - getGet memory bank profile (removed — use GET .../config)
  - putUpdate memory bank disposition (removed — use PATCH .../config)
  - postAdd/merge memory bank background (removed — use PATCH .../config)
  - getList the bank's aliases
  - postAdd an alias to the bank
  - patchShow this alias in place of the bank id
  - delRemove an alias from the bank
  - putCreate or update memory bank
  - patchPartial update memory bank
  - delDelete memory bank
  - delClear all observations
  - postRecover failed consolidation
  - getGet bank configuration
  - patchUpdate bank configuration
  - delReset bank configuration
  - postTrigger consolidation
- Entities
  - getList entities
  - getGet entity co-occurrence graph
  - getGet entity details
  - postRegenerate entity observations (deprecated)
- Mental Models
  - getList mental models
  - postCreate mental model
  - getGet mental model
  - patchUpdate mental model
  - delDelete mental model
  - getGet mental model history
  - postRefresh mental model
  - postDry-run mental model refresh (preview, no persistence)
  - postClear mental model content
- Knowledge Base
  - getGet the knowledge-base tree
  - postCreate a knowledge-base folder
  - postCreate a knowledge-base page
  - getExport the knowledge base as a markdown bundle
  - getHybrid search over knowledge pages (BM25 + vector)
  - getGet a knowledge-base page
  - patchRename/move a knowledge-base node or update a page's options
  - delDelete a knowledge-base node
- Directives
  - getList directives
  - postCreate directive
  - getGet directive
  - patchUpdate directive
  - delDelete directive
- Documents
  - getList documents
  - getList document chunks
  - postReprocess document
  - getGet document details
  - patchUpdate document
  - delDelete a document
  - getGet chunk details
- Operations
  - getList async operations
  - getGet operation status
  - delCancel a pending or in-flight async operation
  - postRetry a failed async operation
  - delDelete a terminal async operation
- Bank Templates
  - postImport bank template
  - getExport bank template
  - getGet bank template JSON Schema
- Document Transfer
  - getExport documents (removed — use POST .../document-transfer/export)
  - postImport documents (async)
  - postExport documents (async)
  - getDownload a stored file (async export archive)
- Bank Transfer
  - postExport a bank (async)
  - postImport a bank (async)
  - postClone a bank (async)
- Webhooks
  - postRegister webhook
  - getList webhooks
  - delDelete webhook
  - patchUpdate webhook
  - getList webhook deliveries
- Files
  - postConvert files to memories
- Audit
  - getList audit logs
  - getAudit log statistics
- LLM Traces
  - getList LLM request traces
  - getLLM request statistics

[![redocly logo](https://cdn.redoc.ly/redoc/logo-mini.svg)API docs by Redocly](https://redocly.com/redoc/)

# Hindsight HTTP API (1.0.0)

Download OpenAPI specification: [Download](https://hindsight.vectorize.io/openapi.json)

License: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)

HTTP API for Hindsight

## [tag/Monitoring](https://hindsight.vectorize.io/api-reference\#tag/Monitoring) Monitoring

## [tag/Monitoring/operation/health_endpoint_health_get](https://hindsight.vectorize.io/api-reference\#tag/Monitoring/operation/health_endpoint_health_get) Health check endpoint

Readiness check: verifies the API can reach the database. Alias of /health/ready. Use /health/live for liveness probes — this one fails whenever the database is unreachable, which must gate traffic, not restart the process.

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

get/health

https://hindsight.vectorize.io/health

### Response samples

- 200

Content type

application/json

Copy

`null`

## [tag/Monitoring/operation/get_readiness](https://hindsight.vectorize.io/api-reference\#tag/Monitoring/operation/get_readiness) Readiness probe

Returns 200 when the API can serve traffic (database reachable), 503 otherwise. Identical to /health, which stays supported as its alias.

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

get/health/ready

https://hindsight.vectorize.io/health/ready

### Response samples

- 200

Content type

application/json

Copy

`null`

## [tag/Monitoring/operation/get_liveness](https://hindsight.vectorize.io/api-reference\#tag/Monitoring/operation/get_liveness) Liveness probe

Returns 200 whenever the process can serve a request. Performs no database access, so a slow or unreachable database never restarts the pod. Point livenessProbe here and readinessProbe at /health.

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| status<br>required | string (Status) <br>Always "alive" — reaching this handler is the check<br>Value: "alive" |
| version<br>required | string (Version) <br>Hindsight version this process is running |
| uptime\_seconds<br>required | number (Uptime Seconds) <br>Seconds since the process started |

get/health/live

https://hindsight.vectorize.io/health/live

### Response samples

- 200

Content type

application/json

Copy

`{"status": "alive",

"uptime_seconds": 812.4,

"version": "0.4.0"

}`

## [tag/Monitoring/operation/get_version](https://hindsight.vectorize.io/api-reference\#tag/Monitoring/operation/get_version) Get API version and feature flags

Returns API version information and enabled feature flags. Use this to check which capabilities are available in this deployment.

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| api\_version<br>required | string (Api Version) <br>API version string |
| features<br>required | object (FeaturesInfo) <br>Enabled feature flags |

get/version

https://hindsight.vectorize.io/version

### Response samples

- 200

Content type

application/json

Copy
Expand all  Collapse all

`{"api_version": "0.9.0",

"features": {"audit_log": false,

"bank_config_api": false,

"bank_llm_health": true,

"document_export_api": true,

"document_import_api": true,

"file_upload_api": true,

"llm_trace": false,

"mcp": true,

"observations": false,

"store_document_text": true,

"worker": true

}

}`

## [tag/Monitoring/operation/metrics_endpoint_metrics_get](https://hindsight.vectorize.io/api-reference\#tag/Monitoring/operation/metrics_endpoint_metrics_get) Prometheus metrics endpoint

Exports metrics in Prometheus format for scraping

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

get/metrics

https://hindsight.vectorize.io/metrics

### Response samples

- 200

Content type

application/json

Copy

`null`

## [tag/Memory](https://hindsight.vectorize.io/api-reference\#tag/Memory) Memory

## [tag/Memory/operation/get_graph](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/get_graph) Get memory graph data

Retrieve graph data for visualization, optionally filtered by type (world/experience/observation).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| type | Type (string) or Type (null) (Type) |
| limit | integer (Limit)  >= 0 <br>Default: 1000 |
| q | Q (string) or Q (null) (Q) |
| tags | Array of Tags (strings) or Tags (null) (Tags) |
| tags\_match | string (Tags Match) <br>Default: "all\_strict"<br>Enum:"any""all""any\_strict""all\_strict""exact" |
| document\_id | Document Id (string) or Document Id (null) (Document Id) |
| chunk\_id | Chunk Id (string) or Chunk Id (null) (Chunk Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| nodes<br>required | Array of objects (Nodes) |
| edges<br>required | Array of objects (Edges) |
| table\_rows<br>required | Array of objects (Table Rows) |
| total\_units<br>required | integer (Total Units) |
| limit<br>required | integer (Limit) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/graph

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/graph

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"edges": [{"data": {"id": "1-2-semantic",\
\
"linkType": "semantic",\
\
"source": "1",\
\
"target": "2",\
\
"weight": 0.8\
\
}\
\
}\
\
],

"limit": 1000,

"nodes": [{"data": {"id": "1",\
\
"label": "Alice works at Google",\
\
"text": "Alice works at Google"\
\
}\
\
},\
\
{"data": {"id": "2",\
\
"label": "Bob went hiking",\
\
"text": "Bob went hiking"\
\
}\
\
}\
\
],

"table_rows": [{"context": "Work info",\
\
"date": "2024-01-15 10:30",\
\
"entities": "Alice (PERSON), Google (ORGANIZATION)",\
\
"id": "abc12345...",\
\
"text": "Alice works at Google"\
\
}\
\
],

"total_units": 2

}`

## [tag/Memory/operation/list_memories](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/list_memories) List memory units

List memory units with pagination and optional full-text search. Supports filtering by type, source document, linked entity ID, and a time window. Results are sorted by most recent first (mentioned\_at DESC, then created\_at DESC) unless a time window selects another axis.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| type | Type (string) or Type (null) (Type) |
| q | Q (string) or Q (null) (Q) |
| consolidation\_state | Consolidation State (string) or Consolidation State (null) (Consolidation State) |
| state | State (string) or State (null) (State) |
| document\_id | Document Id (string) or Document Id (null) (Document Id) |
| entity\_id | Entity Id (string) or Entity Id (null) (Entity Id) |
| tags | Array of Tags (strings) or Tags (null) (Tags) |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact" |
| time\_field | Time Field (string) or Time Field (null) (Time Field) <br>Time axis to filter and order by. `created_at` / `updated_at` = ingest and last-write time; `mentioned_at` / `occurred_start` / `occurred_end` = event time. Defaults to `created_at` when only `start_date`/`end_date` are given. Filtering and ordering both follow `time_field`, and rows with no value on that column are excluded — so `total` counts only rows carrying that timestamp, and can be 0 on a bank that is not empty. |
| start\_date | Start Date (string) or Start Date (null) (Start Date) <br>Filter from this ISO datetime (inclusive) |
| end\_date | End Date (string) or End Date (null) (End Date) <br>Filter until this ISO datetime (exclusive) |
| limit | integer (Limit)  >= 0 <br>Default: 100 |
| offset | integer (Offset)  >= 0 <br>Default: 0 |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/memories/list

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/list

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"context": "Work conversation",\
\
"date": "2024-01-15T10:30:00Z",\
\
"entities": "Alice, Google",\
\
"fact_type": "world",\
\
"id": "550e8400-e29b-41d4-a716-446655440000",\
\
"metadata": {"channel": "engineering",\
\
"source": "slack"\
\
},\
\
"state": "valid",\
\
"tags": ["user:alice"\
\
],\
\
"text": "Alice works at Google on the AI team"\
\
}\
\
],

"limit": 100,

"offset": 0,

"total": 150

}`

## [tag/Memory/operation/dry_run_extract_memories](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/dry_run_extract_memories) Dry-run fact extraction (preview, no persistence)

Preview what the retain step would extract from text WITHOUT changing the bank — no entity resolution, links, embeddings, or persistence. Returns the candidate facts and the LLM token usage. Every prompt-affecting setting (retain mission, extraction mode, chunk size, …) is overridable in the body to A/B a candidate config against the bank's current one. This is a read-only tool: nothing is stored.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| content<br>required | Content (string) or Array of Content (any) (Content) <br>The raw content to extract facts from. Either a plain string, or an ordered list of content blocks (text, image, file) so images/attachments sit inline where they actually appear. |
| context | string (Context) <br>Default: ""<br>Optional context about the content. |
| timestamp | Timestamp (string) or Timestamp (null) (Timestamp) <br>Reference timestamp for resolving relative times (ISO 8601). |
| agent\_name | Agent Name (string) or Agent Name (null) (Agent Name) <br>Deprecated <br>Deprecated: describe the speaker in `context` instead. Narrator override (memory owner) primed in the prompt; still honored for backwards compatibility. |
| strategy | Strategy (string) or Strategy (null) (Strategy) <br>Name of a retain strategy to extract under (a key of the bank's `retain_strategies`). Omit it and the bank's `retain_default_strategy` applies, exactly as it does for a retain that names none. |
| retain\_mission | Retain Mission (string) or Retain Mission (null) (Retain Mission) |
| retain\_extraction\_mode | Retain Extraction Mode (string) or Retain Extraction Mode (null) (Retain Extraction Mode) |
| retain\_custom\_instructions | Retain Custom Instructions (string) or Retain Custom Instructions (null) (Retain Custom Instructions) |
| retain\_extract\_causal\_links | Retain Extract Causal Links (boolean) or Retain Extract Causal Links (null) (Retain Extract Causal Links) |
| retain\_chunk\_size | Retain Chunk Size (integer) or Retain Chunk Size (null) (Retain Chunk Size) |
| entity\_labels | Array of Entity Labels (objects) or Entity Labels (null) (Entity Labels) <br>Controlled vocabulary for entity labels (overrides the bank's config for this call) |
| entities\_allow\_free\_form | Entities Allow Free Form (boolean) or Entities Allow Free Form (null) (Entities Allow Free Form) |
| llm\_output\_language | Llm Output Language (string) or Llm Output Language (null) (Llm Output Language) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| facts | Array of objects (Facts) <br>Candidate facts the retain step would extract. |
| chunks | Array of objects (Chunks) <br>The chunks the input was cut into before extraction. Already computed on every path; returned because `retain_chunk_size` is otherwise a number with no visible effect. |
| usage | object (TokenUsage) <br>Aggregated token usage across the extraction LLM calls. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/memories/dry-run-extract

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/dry-run-extract

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"content": "string",

"context": "",

"timestamp": "2019-08-24T14:15:22Z",

"agent_name": "string",

"strategy": "string",

"retain_mission": "string",

"retain_extraction_mode": "string",

"retain_custom_instructions": "string",

"retain_extract_causal_links": true,

"retain_chunk_size": 0,

"entity_labels": [{"key": "string",\
\
"description": "",\
\
"type": "value",\
\
"optional": true,\
\
"tag": false,\
\
"values": [ ],\
\
"fields": { }\
\
}\
\
],

"entities_allow_free_form": true,

"llm_output_language": "string"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"facts": [{"text": "string",\
\
"fact_type": "string",\
\
"occurred_start": "string",\
\
"occurred_end": "string",\
\
"entities": ["string"\
\
],\
\
"chunk_index": 0,\
\
"attachments": [{"block_index": 0,\
\
"type": "image",\
\
"media_type": "string"\
\
}\
\
]\
\
}\
\
],

"chunks": [{"text": "string",\
\
"fact_count": 0\
\
}\
\
],

"usage": {"input_tokens": 1500,

"output_tokens": 500,

"total_tokens": 2000

}

}`

## [tag/Memory/operation/get_memory](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/get_memory) Get memory unit

Get a single memory unit by ID with all its metadata including entities and tags. Note: the 'history' field is deprecated and always returns an empty list - use GET /memories/{memory\_id}/history instead.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| memory\_id<br>required | string (Memory Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

get/v1/default/banks/{bank\_id}/memories/{memory\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/{memory\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Memory/operation/update_memory](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/update_memory) Curate memory unit

Edit a memory's text and/or change its curation state (invalidate / revert). Invalidated memories are excluded from recall, consolidation, and graph maintenance but kept for audit (reversible). Only world/experience facts can be curated; observations are derived.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| memory\_id<br>required | string (Memory Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| text | Text (string) or Text (null) (Text) <br>New fact text. Re-embeds the memory, drops its derived observations and links, and triggers re-consolidation. |
| context | Context (string) or Context (null) (Context) <br>New context for the fact. '' clears it; omit to leave unchanged. |
| occurred\_start | Occurred Start (string) or Occurred Start (null) (Occurred Start) <br>New occurred-range start (ISO 8601). '' clears it; omit to leave unchanged. |
| occurred\_end | Occurred End (string) or Occurred End (null) (Occurred End) <br>New occurred-range end (ISO 8601). '' clears it; omit to leave unchanged. |
| fact\_type | Fact Type (string) or Fact Type (null) (Fact Type) <br>Reclassify the fact: 'world' or 'experience'. Omit to leave unchanged. |
| entities | Array of Entities (strings) or Entities (null) (Entities) <br>Replace the fact's entities. How each name is matched to an entity is governed by 'resolve\_entities'. '\[\]' detaches all entities. Omit to leave unchanged. |
| resolve\_entities | boolean (Resolve Entities) <br>Default: true<br>Whether the names in 'entities' are resolved against the entities already in the bank. True (default) is what retain does: a similar existing entity is reused when it scores above the match threshold, so a name close to one already in the bank may resolve to that one instead of the one you wrote. False takes the names literally — an existing entity is reused only on a case-insensitive name match, any other name creates a new entity, and names in the same request are never merged with each other. Use False for hand-authored corrections, where the name you sent is the answer rather than a guess. Ignored when 'entities' is omitted. |
| state | State (string) or State (null) (State) <br>Curation state: 'invalidated' to soft-retire the memory (excluded from recall/consolidation, links and derived observations pruned, moved to the archive) or 'valid' to revert. Reversible. |
| reason | Reason (string) or Reason (null) (Reason) <br>Optional free-text reason recorded when invalidating. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/memories/{memory\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/{memory\_id}

### Request samples

- Payload

Content type

application/json

Copy

`{"reason": "superseded: server decommissioned 2026-06-01",

"state": "invalidated"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Memory/operation/get_observation_history](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/get_observation_history) Get observation history

Get the full history of an observation, with each change's source facts resolved to their text.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| memory\_id<br>required | string (Memory Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

get/v1/default/banks/{bank\_id}/memories/{memory\_id}/history

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/{memory\_id}/history

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Memory/operation/recall_memories](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/recall_memories) Recall memory

Recall memory using semantic similarity and spreading activation.

The `types` parameter is optional and may contain any of:

- `world`: General knowledge about people, places, events, and things that happen
- `experience`: Memories about experience, conversations, actions taken, and tasks performed
- `observation`: Consolidated knowledge synthesized from facts

If `types` is omitted, all fact types are recalled.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| query<br>required | string (Query) |
| types | Array of Types (strings) or Types (null) (Types) <br>List of fact types to recall: 'world', 'experience', 'observation'. Defaults to all fact types if not specified. |
| prefer\_observations | Prefer Observations (boolean) or Prefer Observations (null) (Prefer Observations) <br>When recalling raw facts ('world'/'experience') together with 'observation', drop any raw fact that an observation in the results was consolidated from, so the observation supersedes it and you don't get duplicate content. The freed slots are backfilled with the next results, keeping the result count at the requested budget. When omitted, uses the bank/global recall\_prefer\_observations config (false unless configured). No effect unless 'observation' and at least one raw type are both requested. |
| budget | string (Budget) <br>Default: "mid"<br>Enum:"low""mid""high"<br>Budget levels for recall/reflect operations. |
| max\_tokens | integer (Max Tokens) <br>Default: 4096 |
| trace | boolean (Trace) <br>Default: false |
| query\_timestamp | Query Timestamp (string) or Query Timestamp (null) (Query Timestamp) <br>ISO format date string (e.g., '2023-05-30T23:40:00'). Used as the query-time anchor for relative temporal expressions and recency scoring. |
| include | object (IncludeOptions) <br>Default: {}<br>Options for including additional data (entities are included by default) |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Filter memories by tags. If not specified, all memories are returned. Omitting tags (or passing \[\]) together with tags\_match='exact' filters to untagged/global observations only (the scope written by observation\_scopes='shared'). |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How to match tags: 'any' (OR, includes untagged), 'all' (AND, includes untagged), 'any\_strict' (OR, excludes untagged), 'all\_strict' (AND, excludes untagged), 'exact' (set-equality on the full scope, excludes untagged). With 'exact' and no tags (or \[\]), the empty global scope is selected and only untagged memories match. |
| tag\_groups | (Array of Tag Groups (TagGroupLeaf (object) or TagGroupAnd (object) or TagGroupOr (object) or TagGroupNot (object))) or Tag Groups (null) (Tag Groups) <br>Compound tag filter using boolean groups. Groups in the list are AND-ed. Each group is a leaf {tags, match} or compound {and: \[...\]}, {or: \[...\]}, {not: ...}. A leaf may set resolve='fuzzy' to match its tags against the bank's tags by trigram similarity instead of literally, so a query that says 'typsecript' still reaches memories tagged 'typescript'. |
| min\_scores | MinScores (object) or null<br>Optional per-stage score floors, each inclusive (`>=`). `semantic` and `keyword` are retrieval-level cutoffs pushed into the SQL arm they name (overriding the global similarity/BM25 minimums for this request), and constrain only that arm: recall fuses four arms (semantic, keyword, graph, temporal) and returns a result surfaced by any of them, so a returned result reports null for a stage that did not surface it (a non-null score always clears its floor). Setting both therefore does not restrict the response to results clearing both. `reranker` and `final` are post-ranking filters applied to every scored result, so those floors _are_ guaranteed by each result returned — use them for query abstention. Any field left unset imposes no floor; omitting `min_scores` entirely (the default) applies no score filtering. Use with care — the reranker's absolute scores are not calibrated across queries (a clearly-relevant match may score ~0.001 even though it is ranked first). |
| temporal\_window | TemporalWindow (object) or null<br>Window for the temporal retrieval arm, supplied instead of extracting dates from `query`. Set this when you already know the range you mean — a date picker, or an agent that resolved 'last quarter' itself — and recall will skip parsing the query text for dates. **This ranks, it does not filter**: the temporal arm surfaces memories whose own dates (`mentioned_at`, `occurred_start`, `occurred_end`) fall inside the window so they rank higher, while the semantic, keyword and graph arms are unaffected — so memories dated outside the window are still returned. Ignored when the bank has temporal retrieval disabled. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| results<br>required | Array of objects (Results) |
| trace | Trace (object) or Trace (null) (Trace) |
| entities | Entities (object) or Entities (null) (Entities) <br>Entity states for entities mentioned in results |
| chunks | Chunks (object) or Chunks (null) (Chunks) <br>Chunks for facts, keyed by chunk\_id |
| source\_facts | Source Facts (object) or Source Facts (null) (Source Facts) <br>Source facts for observation-type results, keyed by fact ID |
| source\_facts\_truncated | Source Facts Truncated (boolean) or Source Facts Truncated (null) (Source Facts Truncated) <br>Whether the source\_facts map was cut short by the token budget. When true, some IDs in results\[\].source\_fact\_ids have no entry in source\_facts — the budget ran out, the references are not dangling. Only set when source facts were requested. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/memories/recall

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/recall

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"budget": "mid",

"include": {"entities": {"max_tokens": 500

}

},

"max_tokens": 4096,

"query": "What did Alice say about machine learning?",

"query_timestamp": "2023-05-30T23:40:00",

"tags": ["user_a"\
\
],

"tags_match": "any",

"temporal_window": {"end": "2023-06-30T23:59:59Z",

"start": "2023-04-01T00:00:00Z"

},

"trace": true,

"types": ["world",\
\
"experience"\
\
]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"chunks": {"456e7890-e12b-34d5-a678-901234567890": {"chunk_index": 0,

"id": "456e7890-e12b-34d5-a678-901234567890",

"text": "Alice works at Google on the AI team. She's been there for 3 years..."

}

},

"entities": {"Alice": {"canonical_name": "Alice",

"entity_id": "123e4567-e89b-12d3-a456-426614174001",

"observations": [{"mentioned_at": "2024-01-15T10:30:00Z",\
\
"text": "Alice works at Google on the AI team"\
\
}\
\
]

}

},

"results": [{"chunk_id": "456e7890-e12b-34d5-a678-901234567890",\
\
"context": "work info",\
\
"entities": ["Alice",\
\
"Google"\
\
],\
\
"id": "123e4567-e89b-12d3-a456-426614174000",\
\
"occurred_end": "2024-01-15T10:30:00Z",\
\
"occurred_start": "2024-01-15T10:30:00Z",\
\
"text": "Alice works at Google on the AI team",\
\
"type": "world"\
\
}\
\
],

"trace": {"num_results": 1,

"query": "What did Alice say about machine learning?",

"time_seconds": 0.123

}

}`

## [tag/Memory/operation/reflect](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/reflect) Reflect and generate answer

Reflect and formulate an answer using bank identity, world facts, observations, and mental models.

This endpoint:

1. Retrieves experience (conversations and events)
2. Retrieves world facts relevant to the query
3. Retrieves observations and mental models (bank's synthesized perspectives)
4. Uses LLM to formulate a contextual answer
5. Returns plain text answer and the facts used

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| reflect\_search\_observations\_max\_tokens | Reflect Search Observations Max Tokens (integer) or Reflect Search Observations Max Tokens (null) (Reflect Search Observations Max Tokens) <br>Token budget for reflect's search\_observations tool when the model names none. Observation evidence is often the largest contributor to the reflect context; lowering it trades the lowest-ranked observations for a smaller LLM context. None means use the shipped default (5000). |
| reflect\_search\_observations\_include\_entities | Reflect Search Observations Include Entities (boolean) or Reflect Search Observations Include Entities (null) (Reflect Search Observations Include Entities) <br>Whether search\_observations attaches resolved entity names to each observation. Entities can be more than half the serialized tool payload; turning them off keeps the same observations and ranking with a much smaller context. None means enabled. |
| query<br>required | string (Query) |
| budget | string (Budget) <br>Default: "low"<br>Enum:"low""mid""high"<br>Budget levels for recall/reflect operations. |
| context | Context (string) or Context (null) (Context) <br>Deprecated <br>DEPRECATED: Additional context is now concatenated with the query. Pass context directly in the query field instead. If provided, it will be appended to the query for backward compatibility. |
| max\_tokens | integer (Max Tokens) <br>Default: 4096<br>Maximum tokens for the response |
| include | object (ReflectIncludeOptions) <br>Options for including additional data (disabled by default) |
| response\_schema | Response Schema (object) or Response Schema (null) (Response Schema) <br>Optional JSON Schema for structured output. When provided, the response will include a 'structured\_output' field with the LLM response parsed according to this schema. |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Scope raw facts, observations, mental models, and tagged directives during reflection. With no tags, memory retrieval is unfiltered while only untagged/global directives are loaded. Use tags=\[\] with tags\_match='exact' to select the untagged/global scope. |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How to match tags: 'any' (OR, includes untagged), 'all' (AND, includes untagged), 'any\_strict' (OR, excludes untagged), 'all\_strict' (AND, excludes untagged), or 'exact' (set equality). Untagged directives remain global in every mode. |
| tag\_groups | (Array of Tag Groups (TagGroupLeaf (object) or TagGroupAnd (object) or TagGroupOr (object) or TagGroupNot (object))) or Tag Groups (null) (Tag Groups) <br>Compound tag filter using boolean groups. Groups in the list are AND-ed. Each group is a leaf {tags, match} or compound {and: \[...\]}, {or: \[...\]}, {not: ...}. Mutually exclusive with tags. A leaf may set resolve='fuzzy' to match its tags against the bank's tags by trigram similarity instead of literally, so a query that says 'typsecript' still reaches memories tagged 'typescript'. |
| apply\_all\_directives | boolean (Apply All Directives) <br>Default: false<br>Apply every active directive regardless of tags. By default directives are scoped like memories: untagged directives always apply, and tagged directives apply only when the request's tags match them. Set true to apply all active directives, ignoring tag scope. |
| fact\_types | Array of Fact Types (strings) or Fact Types (null) (Fact Types) <br>Filter which fact types are retrieved during reflect. None means all types (world, experience, observation). |
| exclude\_mental\_models | boolean (Exclude Mental Models) <br>Default: false<br>If true, exclude all mental models from the reflect loop (skip search\_mental\_models tool). |
| exclude\_mental\_model\_ids | Array of Exclude Mental Model Ids (strings) or Exclude Mental Model Ids (null) (Exclude Mental Model Ids) <br>Exclude specific mental models by ID from the reflect loop. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| text<br>required | string (Text) <br>The reflect response as well-formatted markdown (headers, lists, bold/italic, code blocks, etc.) |
| based\_on | ReflectBasedOn (object) or null<br>Evidence used to generate the response. Only present when include.facts is set. |
| structured\_output | Structured Output (object) or Structured Output (null) (Structured Output) <br>Structured output parsed according to the request's response\_schema. Only present when response\_schema was provided in the request. |
| structured\_output\_error | Structured Output Error (string) or Structured Output Error (null) (Structured Output Error) <br>Why structured output could not be produced. Present only when a response\_schema was given and the extraction call failed (provider error, timeout, unparseable output). A missing structured\_output _without_ this field means the answer held nothing matching the schema — the reflect itself still succeeded either way. |
| usage | TokenUsage (object) or null<br>Token usage metrics for LLM calls during reflection. |
| trace | ReflectTrace (object) or null<br>Execution trace of tool and LLM calls. Only present when include.tool\_calls is set. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/reflect

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/reflect

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"budget": "low",

"include": {"facts": { }

},

"max_tokens": 4096,

"query": "What do you think about artificial intelligence?",

"response_schema": {"properties": {"summary": {"type": "string"

},

"key_points": {"items": {"type": "string"

},

"type": "array"

}

},

"required": ["summary",\
\
"key_points"\
\
],

"type": "object"

},

"tags": ["user_a"\
\
],

"tags_match": "any"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"based_on": {"memories": [{"id": "123",\
\
"text": "AI is used in healthcare",\
\
"type": "world"\
\
},\
\
{"id": "456",\
\
"text": "I discussed AI applications last week",\
\
"type": "experience"\
\
}\
\
]

},

"structured_output": {"key_points": ["Used in healthcare",\
\
"Discussed recently"\
\
],

"summary": "AI is transformative"

},

"text": "## AI Overview\n\nBased on my understanding, AI is a **transformative technology**:\n\n- Used extensively in healthcare\n- Discussed in recent conversations\n- Continues to evolve rapidly",

"trace": {"llm_calls": [{"duration_ms": 1200,\
\
"scope": "agent_1"\
\
}\
\
],

"observations": [{"id": "obs-1",\
\
"name": "AI Technology",\
\
"subtype": "structural",\
\
"type": "concept"\
\
}\
\
],

"tool_calls": [{"duration_ms": 150,\
\
"input": {"query": "AI"\
\
},\
\
"tool": "recall"\
\
}\
\
]

},

"usage": {"input_tokens": 1500,

"output_tokens": 500,

"total_tokens": 2000

}

}`

## [tag/Memory/operation/list_tags](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/list_tags) List tags

List all unique tags in a memory bank with usage counts. Supports wildcard search using ' _' (e.g., 'user:_', ' _-fred', 'tag_-2'). Case-insensitive. Use `source=mental_models` to list tags used on mental models instead of memories.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| q | Q (string) or Q (null) (Q) <br>Wildcard pattern to filter tags (e.g., 'user: _' for user:alice, '_-admin' for role-admin). Use '\*' as wildcard. Case-insensitive. |
| source | string (Source) <br>Default: "memories"<br>Enum:"memories""mental\_models"<br>Where to read tags from: 'memories' (memory\_units, default) or 'mental\_models'. |
| limit | integer (Limit)  >= 0 <br>Default: 100<br>Maximum number of tags to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/tags

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/tags

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"count": 42,\
\
"tag": "user:alice"\
\
},\
\
{"count": 15,\
\
"tag": "user:bob"\
\
},\
\
{"count": 8,\
\
"tag": "session:abc123"\
\
}\
\
],

"limit": 100,

"offset": 0,

"total": 25

}`

## [tag/Memory/operation/get_bank_attachment](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/get_bank_attachment) Fetch an attachment retained inline with a document

Serve the bytes of an attachment retained as inline content. The id is the one inside a placeholder token, and is returned on `attachments[].url` by recall and by the document/chunk/memory reads — so an agent can show or reason over the original behind an attachment-derived fact.

Bytes are served with the Content-Type the caller declared at retain. Access is authorized against the bank; a missing attachment and an invisible bank both return 404, so the endpoint cannot be used to probe what a bank holds.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| attachment\_id<br>required | string (Attachment Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Attachment bytes

##### Response Schema: application/octet-stream

string <binary>

**422**

Validation Error

get/v1/default/banks/{bank\_id}/attachments/{attachment\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/attachments/{attachment\_id}

### Response samples

- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"detail": [{"loc": ["string"\
\
],\
\
"msg": "string",\
\
"type": "string",\
\
"input": null,\
\
"ctx": { }\
\
}\
\
]

}`

## [tag/Memory/operation/list_observation_scopes](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/list_observation_scopes) List observation scopes

Enumerate the distinct scopes across a bank's observations. Each observation lives under a scope: the exact set of tags it was consolidated with. Returns every distinct scope (tag order normalized) with the number of observations in it; the empty tag list is the global/untagged scope. Use a returned scope with the graph endpoint (tags= & tags\_match=exact) to filter observations to exactly that scope. Paged: `total` reports every distinct scope in the bank.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  \[ 0 .. 1000 \] <br>Default: 100<br>Maximum number of scopes to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| scopes<br>required | Array of objects (Scopes) <br>Distinct observation scopes, most populous first |
| total<br>required | integer (Total) <br>Total number of distinct scopes in the bank (ignores limit/offset) |
| limit<br>required | integer (Limit) <br>Maximum number of scopes returned in this page |
| offset<br>required | integer (Offset) <br>Offset this page started at |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/observations/scopes

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/observations/scopes

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"limit": 100,

"offset": 0,

"scopes": [{"count": 12,\
\
"tags": ["user:alice"\
\
]\
\
},\
\
{"count": 4,\
\
"tags": ["user:alice",\
\
"project:apollo"\
\
]\
\
},\
\
{"count": 2,\
\
"tags": [ ]\
\
}\
\
],

"total": 3

}`

## [tag/Memory/operation/preview_consolidation_strategies](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/preview_consolidation_strategies) Preview consolidation strategies

Report which of the bank's existing observation scopes each consolidation strategy would apply to, for a draft `consolidation_strategies` value (nothing is saved). Uses the same matching and first-strategy-wins rule as consolidation. Scans up to 10,000 distinct scopes; `complete` is false beyond that and the counts are lower bounds. Scopes with no observations yet do not exist and are not counted.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| strategies<br>required | Array of objects (Strategies) <br>Draft consolidation\_strategies value |
| sample\_limit | integer (Sample Limit)  \[ 0 .. 50 \] <br>Default: 5<br>Example scopes returned per rule |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| strategies<br>required | Array of objects (Strategies) |
| default<br>required | object (DefaultScopesPreview) <br>The scopes no strategy claims — they consolidate under the bank-wide settings. |
| scopes\_scanned<br>required | integer (Scopes Scanned) <br>Distinct scopes the preview was computed over |
| complete<br>required | boolean (Complete) <br>False when the bank has more distinct scopes than the preview scans; counts are then lower bounds |

**404**

The bank does not exist.

**422**

Validation Error

post/v1/default/banks/{bank\_id}/consolidation-strategies/preview

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/consolidation-strategies/preview

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"strategies": [{"scopes": [{"tags": ["string"\
\
],\
\
"tags_match": "string"\
\
}\
\
],\
\
"observations_mission": "string",\
\
"max_observations_per_scope": 0,\
\
"consolidation_source_facts_max_tokens": 0,\
\
"consolidation_source_facts_max_tokens_per_observation": 0\
\
}\
\
],

"sample_limit": 5

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"strategies": [{"active": true,\
\
"claimed_count": 0,\
\
"rules": [{"match_count": 0,\
\
"taken_count": 0,\
\
"observation_count": 0,\
\
"samples": [{"tags": ["string"\
\
],\
\
"count": 0,\
\
"handled_by": 0\
\
}\
\
]\
\
}\
\
]\
\
}\
\
],

"default": {"match_count": 0,

"observation_count": 0,

"samples": [{"tags": ["string"\
\
],\
\
"count": 0,\
\
"handled_by": 0\
\
}\
\
]

},

"scopes_scanned": 0,

"complete": true

}`

## [tag/Memory/operation/clear_memory_observations](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/clear_memory_observations) Clear observations for a memory

Delete all observations derived from a specific memory and reset it for re-consolidation. The memory itself is not deleted. A consolidation job is triggered automatically so the memory will produce fresh observations on the next consolidation run.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| memory\_id<br>required | string (Memory Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| deleted\_count<br>required | integer (Deleted Count) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/memories/{memory\_id}/observations

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories/{memory\_id}/observations

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"deleted_count": 3

}`

## [tag/Memory/operation/retain_memories](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/retain_memories) Retain memories

Retain memory items with automatic fact extraction.

This is the main endpoint for storing memories. It supports both synchronous and asynchronous processing via the `async` parameter.

**Features:**

- Efficient batch processing
- Automatic fact extraction from natural language
- Entity recognition and linking
- Document tracking with automatic upsert (when document\_id is provided)
- Temporal and semantic linking
- Optional asynchronous processing

**The system automatically:**

1. Extracts semantic facts from the content
2. Generates embeddings
3. Deduplicates similar facts
4. Creates temporal, semantic, and entity links
5. Tracks document metadata

**When `async=true`:** Returns immediately after queuing. Use the operations endpoint to monitor progress.

**When `async=false` (default):** Waits for processing to complete.

**Note:** If a memory item has a `document_id` that already exists, the old document and its memory units will be deleted before creating new ones (upsert behavior).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| async | boolean (Async) <br>Default: false<br>If true, process asynchronously in background. If false, wait for completion (default: false) |
| document\_tags | Array of Document Tags (strings) or Document Tags (null) (Document Tags) <br>Deprecated <br>Deprecated. Use item-level tags instead. |
| operation\_id | Operation Id (string) or Operation Id (null) (Operation Id) <br>Optional client-supplied UUID used as the identity of an async retain operation. Re-submitting with the same operation\_id returns the original operation and creates no new work, so retrying after a lost or timed-out acknowledgement will not enqueue a duplicate. Reusing an id that belongs to a different operation returns HTTP 409. Ignored for synchronous retain. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| bank\_id<br>required | string (Bank Id) |
| items\_count<br>required | integer (Items Count) |
| async<br>required | boolean (Async) <br>Whether the operation was processed asynchronously |
| operation\_id | Operation Id (string) or Operation Id (null) (Operation Id) <br>Operation ID for tracking async operations. Use GET /v1/default/banks/{bank\_id}/operations to list operations. Only present when async=true. When items use different per-item strategies, use operation\_ids instead. |
| operation\_ids | Array of Operation Ids (strings) or Operation Ids (null) (Operation Ids) <br>Operation IDs when items were submitted as multiple strategy groups (async=true with mixed per-item strategies). operation\_id is set to the first entry for backward compatibility. |
| usage | TokenUsage (object) or null<br>Token usage metrics for LLM calls during fact extraction (only present for synchronous operations) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/memories

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"async": false,

"items": [{"content": "Alice works at Google",\
\
"context": "work",\
\
"document_id": "conversation_123"\
\
},\
\
{"content": "Bob went hiking yesterday",\
\
"document_id": "conversation_123",\
\
"timestamp": "2024-01-15T10:00:00Z"\
\
}\
\
]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"async": false,

"bank_id": "user123",

"items_count": 2,

"success": true,

"usage": {"input_tokens": 500,

"output_tokens": 100,

"total_tokens": 600

}

}`

## [tag/Memory/operation/clear_bank_memories](https://hindsight.vectorize.io/api-reference\#tag/Memory/operation/clear_bank_memories) Clear memory bank memories

Delete memory units for a memory bank. Optionally filter by type (world, experience, observation) to delete only specific types. This is a destructive operation that cannot be undone. The bank profile (disposition and background) will be preserved.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| type | Type (string) or Type (null) (Type) <br>Optional fact type filter (world, experience, observation) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message | Message (string) or Message (null) (Message) |
| deleted\_count | Deleted Count (integer) or Deleted Count (null) (Deleted Count) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/memories

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/memories

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"deleted_count": 10,

"message": "Deleted successfully",

"success": true

}`

## [tag/Banks](https://hindsight.vectorize.io/api-reference\#tag/Banks) Banks

## [tag/Banks/operation/preview_prompt](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/preview_prompt) Preview an operation's prompts (no LLM call)

Render the exact system and user messages retain, consolidation or reflect would send for this bank, without calling an LLM, reading memories, or changing anything. Everything that shapes the prompt comes from the bank; the runtime data an operation would be given is a fixed placeholder. Both messages are returned: retain and consolidation keep their system prompt bank-agnostic (one provider-side cache serves every bank) and carry the mission in the user message instead.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| operation | string (Operation) <br>Default: "retain"<br>Enum:"retain""consolidation""reflect"<br>Which operation's prompts to render. |
| strategy | Strategy (string) or Strategy (null) (Strategy) <br>Name of a retain strategy to render under (a key of the bank's `retain_strategies`). Retain only. Omit it and the bank's `retain_default_strategy` applies, exactly as it does for a retain that names none. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| messages | Array of objects (Messages) <br>Request messages, in send order. Each is given as the blocks it is built from. |
| strategy | Strategy (string) or Strategy (null) (Strategy) <br>The retain strategy these prompts were rendered under, if any. |
| strategies | Array of strings (Strategies) <br>Names of the bank's retain strategies, so a client can offer them without a second call. |
| run\_settings | Array of objects (Run Settings) <br>Settings that shape the operation without appearing in its prompt, such as chunk sizes. |
| response\_schema | Response Schema (object) or Response Schema (null) (Response Schema) <br>JSON schema the response is constrained to, when the operation constrains it. |
| skipped\_reason | Skipped Reason (string) or Skipped Reason (null) (Skipped Reason) <br>Why no prompt is sent, when the configuration means none is. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/prompts/preview

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/prompts/preview

### Request samples

- Payload

Content type

application/json

Copy

`{"operation": "retain"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"messages": [{"role": "system",\
\
"blocks": [{"text": "string",\
\
"source": "config",\
\
"field": "",\
\
"section": "",\
\
"heading": "",\
\
"active": true,\
\
"value": "string",\
\
"kind": "text",\
\
"choices": ["string"\
\
],\
\
"editable": false\
\
}\
\
]\
\
}\
\
],

"strategy": "string",

"strategies": ["string"\
\
],

"run_settings": [{"field": "string",\
\
"value": "string",\
\
"kind": "text",\
\
"editable": false\
\
}\
\
],

"response_schema": { },

"skipped_reason": "string"

}`

## [tag/Banks/operation/list_banks](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/list_banks) List memory banks

List banks with their profiles and summary stats, most recently written first (`last_write_at` descending), with pagination and optional search.

##### query Parameters

|     |     |
| --- | --- |
| q | Q (string) or Q (null) (Q) <br>Case-insensitive substring filter on bank ID or name (e.g. 'alice') |
| limit | integer (Limit)  >= 0 <br>Default: 100<br>Maximum number of banks to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| banks<br>required | Array of objects (Banks) |
| total<br>required | integer (Total) <br>Total number of banks visible to the caller, ignoring `limit`/`offset`. |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |

**422**

Validation Error

get/v1/default/banks

https://hindsight.vectorize.io/v1/default/banks

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"banks": [{"bank_id": "user123",\
\
"created_at": "2024-01-15T10:30:00Z",\
\
"disposition": {"empathy": 3,\
\
"literalism": 3,\
\
"skepticism": 3\
\
},\
\
"fact_count": 156,\
\
"last_document_at": "2024-01-16T14:20:00Z",\
\
"last_write_at": "2024-01-17T09:05:00Z",\
\
"mission": "I am a software engineer helping my team ship quality code",\
\
"name": "Alice",\
\
"updated_at": "2024-01-16T14:20:00Z"\
\
}\
\
],

"limit": 100,

"offset": 0,

"total": 50

}`

## [tag/Banks/operation/get_agent_stats](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/get_agent_stats) Get statistics for memory bank

Get statistics about nodes and links for a specific agent

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| refresh | boolean (Refresh) <br>Default: false<br>Force a fresh recompute, bypassing the cached value (and refreshing the cache). |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| total\_nodes<br>required | integer (Total Nodes) |
| total\_links<br>required | integer (Total Links) |
| total\_documents<br>required | integer (Total Documents) |
| nodes\_by\_fact\_type<br>required | object (Nodes By Fact Type) |
| links\_by\_link\_type<br>required | object (Links By Link Type) |
| links\_by\_fact\_type<br>required | object (Links By Fact Type) |
| links\_breakdown<br>required | object (Links Breakdown) |
| pending\_operations<br>required | integer (Pending Operations) |
| failed\_operations<br>required | integer (Failed Operations) |
| operations\_by\_status | object (Operations By Status) <br>Async operations grouped by status (pending, processing, completed, failed, cancelled). |
| last\_consolidated\_at | Last Consolidated At (string) or Last Consolidated At (null) (Last Consolidated At) <br>When consolidation last ran (ISO format) |
| last\_memory\_write\_at | Last Memory Write At (string) or Last Memory Write At (null) (Last Memory Write At) <br>When a memory was last written in this bank — stored, edited, or consolidated (ISO format). Null if the bank has no memories. A mental model whose `last_memory_seen_at` is at or after this is up to date whatever its tags; an older one may need a refresh, which only the single mental-model read can confirm. |
| pending\_consolidation | integer (Pending Consolidation) <br>Default: 0<br>Number of source memories (world/experience) still queued for consolidation into observations. Excludes memories whose consolidation permanently failed — those are counted only in failed\_consolidation — so this drains to 0 when the consolidator catches up. |
| failed\_consolidation | integer (Failed Consolidation) <br>Default: 0<br>Number of source memories (world/experience) whose consolidation permanently failed and can be retried via the consolidation recovery endpoint. |
| total\_observations | integer (Total Observations) <br>Default: 0<br>Total number of observations |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/stats

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/stats

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"failed_consolidation": 0,

"failed_operations": 0,

"last_consolidated_at": "2024-01-15T10:30:00Z",

"last_memory_write_at": "2024-01-15T11:05:00Z",

"links_breakdown": {"fact": {"entity": 40,

"semantic": 60,

"temporal": 100

}

},

"links_by_fact_type": {"fact": 200,

"observation": 40,

"preference": 60

},

"links_by_link_type": {"entity": 50,

"semantic": 100,

"temporal": 150

},

"nodes_by_fact_type": {"fact": 100,

"observation": 20,

"preference": 30

},

"pending_consolidation": 0,

"pending_operations": 2,

"total_documents": 10,

"total_links": 300,

"total_nodes": 150,

"total_observations": 45

}`

## [tag/Banks/operation/test_bank_llm](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/test_bank_llm) Test the bank's LLM connectivity

Probe the LLMs this bank would use for retain / consolidation / reflect with one minimal call each (configs shared across operations are probed once), so you can discover 'not configured / unreachable' instead of a silent stall. Deliberate action (makes a real provider call); not for polling. Returns status only — never the provider, model, endpoint, API key, or raw error. Disable with HINDSIGHT\_API\_ENABLE\_BANK\_LLM\_HEALTH=false.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>Bank identifier |
| operations<br>required | Array of objects (Operations) <br>Connectivity status per operation (retain, consolidation, reflect) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/health/llm

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/health/llm

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"operations": [{"latency_ms": 412,\
\
"ok": true,\
\
"operation": "retain",\
\
"status": "connected"\
\
},\
\
{"latency_ms": 412,\
\
"ok": true,\
\
"operation": "consolidation",\
\
"status": "connected"\
\
},\
\
{"ok": false,\
\
"operation": "reflect",\
\
"status": "not_configured"\
\
}\
\
]

}`

## [tag/Banks/operation/get_memories_timeseries](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/get_memories_timeseries) Memory ingestion time-series

Memories ingested over a period, bucketed by time and broken down by fact type.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| period | string (Period) <br>Default: "7d" |
| time\_field | string (Time Field) <br>Default: "created\_at"<br>Timestamp column to bucket on. `created_at` (default) = ingest time; `mentioned_at` / `occurred_start` = event time, useful for migrated corpora where ingest time is a single point and doesn't reflect the underlying knowledge timeline. Unknown values fall back to `created_at`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| period<br>required | string (Period) <br>One of: 1h, 12h, 1d, 7d, 30d, 90d. |
| trunc<br>required | string (Trunc) <br>Bucket granularity: minute, hour, day. |
| time\_field | string (Time Field) <br>Default: "created\_at"<br>Timestamp column used to assign each row to a bucket. `created_at` shows ingest time; `mentioned_at` / `occurred_start` show event time (falls back to `created_at` per row when null). |
| buckets | Array of objects (Buckets) <br>Per-bucket counts, always returned fully padded for the requested period. |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/stats/memories-timeseries

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/stats/memories-timeseries

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"period": "string",

"trunc": "string",

"time_field": "created_at",

"buckets": [{"time": "string",\
\
"world": 0,\
\
"experience": 0,\
\
"observation": 0\
\
}\
\
]

}`

## [tag/Banks/operation/get_bank_profile](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/get_bank_profile) Get memory bank profile (removed — use GET .../config)  Deprecated

**Removed.** The bank profile endpoints have been removed. Disposition traits and the reflect mission are bank configuration: read them from GET /v1/default/banks/{bank\_id}/config as `disposition_skepticism`, `disposition_literalism`, `disposition_empathy` and `reflect_mission`, and write them with PATCH /v1/default/banks/{bank\_id}/config. The `name` field this endpoint also returned was a display-only label; read it from GET /v1/default/banks.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| disposition<br>required | object (DispositionTraits) <br>Disposition traits that influence how memories are formed and interpreted. |
| mission<br>required | string (Mission) <br>The agent's mission - who they are and what they're trying to accomplish |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use mission instead |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/profile

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/profile

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"disposition": {"empathy": 3,

"literalism": 3,

"skepticism": 3

},

"mission": "I am a software engineer helping my team stay organized and ship quality code",

"name": "Alice"

}`

## [tag/Banks/operation/update_bank_disposition](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/update_bank_disposition) Update memory bank disposition (removed — use PATCH .../config)  Deprecated

**Removed.** The bank profile endpoints have been removed. Disposition traits and the reflect mission are bank configuration: read them from GET /v1/default/banks/{bank\_id}/config as `disposition_skepticism`, `disposition_literalism`, `disposition_empathy` and `reflect_mission`, and write them with PATCH /v1/default/banks/{bank\_id}/config. The `name` field this endpoint also returned was a display-only label; read it from GET /v1/default/banks.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| disposition<br>required | object (DispositionTraits) <br>Disposition traits that influence how memories are formed and interpreted. |
| |     |     |
| --- | --- |
| skepticism<br>required | integer (Skepticism)  \[ 1 .. 5 \] <br>How skeptical vs trusting (1=trusting, 5=skeptical) |
| literalism<br>required | integer (Literalism)  \[ 1 .. 5 \] <br>How literally to interpret information (1=flexible, 5=literal) |
| empathy<br>required | integer (Empathy)  \[ 1 .. 5 \] <br>How much to consider emotional context (1=detached, 5=empathetic) | |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| disposition<br>required | object (DispositionTraits) <br>Disposition traits that influence how memories are formed and interpreted. |
| mission<br>required | string (Mission) <br>The agent's mission - who they are and what they're trying to accomplish |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use mission instead |

**422**

Validation Error

put/v1/default/banks/{bank\_id}/profile

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/profile

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"disposition": {"empathy": 3,

"literalism": 3,

"skepticism": 3

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"disposition": {"empathy": 3,

"literalism": 3,

"skepticism": 3

},

"mission": "I am a software engineer helping my team stay organized and ship quality code",

"name": "Alice"

}`

## [tag/Banks/operation/add_bank_background](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/add_bank_background) Add/merge memory bank background (removed — use PATCH .../config)  Deprecated

**Removed.** The bank background was folded into the reflect mission. Write it with PATCH /v1/default/banks/{bank\_id}/config as `reflect_mission`. That call replaces the value rather than merging into it, so read the current mission from GET .../config first if you relied on this endpoint's append behaviour.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| content<br>required | string (Content) <br>New background information to add or merge |
| update\_disposition | boolean (Update Disposition) <br>Default: true<br>Deprecated - disposition is no longer auto-inferred from mission |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| mission<br>required | string (Mission) |
| background | Background (string) or Background (null) (Background) <br>Deprecated: same as mission |
| disposition | DispositionTraits (object) or null |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/background

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/background

### Request samples

- Payload

Content type

application/json

Copy

`{"content": "I was born in Texas",

"update_disposition": true

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"mission": "I was born in Texas. I am a software engineer with 10 years of experience."

}`

## [tag/Banks/operation/list_bank_aliases](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/list_bank_aliases) List the bank's aliases

Extra bank ids that reach this bank. Every endpoint accepts an alias wherever it accepts a bank id, so callers can be moved onto a new id in phases while the old one keeps working.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>The bank's own id, which an alias never replaces |
| aliases<br>required | Array of objects (Aliases) <br>Extra ids that also reach this bank, the primary one first then oldest first |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/aliases

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/aliases

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"aliases": [{"alias": "user-123",\
\
"primary": true\
\
},\
\
{"alias": "legacy-user123",\
\
"primary": false\
\
}\
\
],

"bank_id": "user123"

}`

## [tag/Banks/operation/create_bank_alias](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/create_bank_alias) Add an alias to the bank

Give the bank another id to answer to. Nothing is copied or moved: the bank keeps its own id and all of its data, and the alias is only a second way to reach it — which is what makes it a zero-downtime alternative to renaming.

Returns 409 if the name is already a bank or another alias.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| alias<br>required | string (Alias) <br>The extra bank id. Same rules as a bank id (non-empty, at most 192 bytes of UTF-8, no control characters, no leading underscore), and it must not already name a bank or another alias. |
| primary | boolean (Primary) <br>Default: false<br>Also show the bank under this alias, replacing whichever alias is shown today. |

### Responses

**201**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>The bank's own id, which an alias never replaces |
| aliases<br>required | Array of objects (Aliases) <br>Extra ids that also reach this bank, the primary one first then oldest first |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/aliases

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/aliases

### Request samples

- Payload

Content type

application/json

Copy

`{"alias": "user-123"

}`

### Response samples

- 201
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"aliases": [{"alias": "user-123",\
\
"primary": true\
\
},\
\
{"alias": "legacy-user123",\
\
"primary": false\
\
}\
\
],

"bank_id": "user123"

}`

## [tag/Banks/operation/set_bank_alias_primary](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/set_bank_alias_primary) Show this alias in place of the bank id

Present the bank under one of its aliases. Purely cosmetic: the bank keeps its own `bank_id`, which every other part of the system — authorisation, metering, exports, audit logs — continues to use.

Promoting an alias demotes whichever one was shown before, so a bank is presented under at most one alias. Send `primary: false` to go back to showing its own id.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| alias<br>required | string (Alias) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| primary<br>required | boolean (Primary) <br>True to present the bank under this alias; False to go back to its own id. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>The bank's own id, which an alias never replaces |
| aliases<br>required | Array of objects (Aliases) <br>Extra ids that also reach this bank, the primary one first then oldest first |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/aliases/{alias}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/aliases/{alias}

### Request samples

- Payload

Content type

application/json

Copy

`{"primary": true

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"aliases": [{"alias": "user-123",\
\
"primary": true\
\
},\
\
{"alias": "legacy-user123",\
\
"primary": false\
\
}\
\
],

"bank_id": "user123"

}`

## [tag/Banks/operation/delete_bank_alias](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/delete_bank_alias) Remove an alias from the bank

Stop an id reaching this bank. The bank and its memories are untouched; only the extra name goes away, and callers still using it get the same 404 (or new empty bank) they would have got before it existed.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| alias<br>required | string (Alias) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>The bank's own id, which an alias never replaces |
| aliases<br>required | Array of objects (Aliases) <br>Extra ids that also reach this bank, the primary one first then oldest first |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/aliases/{alias}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/aliases/{alias}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"aliases": [{"alias": "user-123",\
\
"primary": true\
\
},\
\
{"alias": "legacy-user123",\
\
"primary": false\
\
}\
\
],

"bank_id": "user123"

}`

## [tag/Banks/operation/create_or_update_bank](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/create_or_update_bank) Create or update memory bank

Create a new agent or update existing agent with disposition and mission. Auto-fills missing fields with defaults.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name | Name (string) or Name (null) (Name) <br>Deprecated: display label only, not advertised |
| disposition | DispositionTraits (object) or null<br>Deprecated: use update\_bank\_config instead |
| disposition\_skepticism | Disposition Skepticism (integer) or Disposition Skepticism (null) (Disposition Skepticism) <br>Deprecated: use update\_bank\_config instead |
| disposition\_literalism | Disposition Literalism (integer) or Disposition Literalism (null) (Disposition Literalism) <br>Deprecated: use update\_bank\_config instead |
| disposition\_empathy | Disposition Empathy (integer) or Disposition Empathy (null) (Disposition Empathy) <br>Deprecated: use update\_bank\_config instead |
| mission | Mission (string) or Mission (null) (Mission) <br>Deprecated: use update\_bank\_config with reflect\_mission instead |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use update\_bank\_config with reflect\_mission instead |
| reflect\_mission | Reflect Mission (string) or Reflect Mission (null) (Reflect Mission) <br>Mission/context for Reflect operations. Guides how Reflect interprets and uses memories. |
| retain\_mission | Retain Mission (string) or Retain Mission (null) (Retain Mission) <br>Steers what gets extracted during retain(). Injected alongside built-in extraction rules. |
| retain\_extraction\_mode | Retain Extraction Mode (string) or Retain Extraction Mode (null) (Retain Extraction Mode) <br>Fact extraction mode: 'concise' (default), 'verbose', 'custom', 'verbatim', or 'chunks'. |
| retain\_custom\_instructions | Retain Custom Instructions (string) or Retain Custom Instructions (null) (Retain Custom Instructions) <br>Custom extraction prompt. Only active when retain\_extraction\_mode is 'custom'. |
| retain\_chunk\_size | Retain Chunk Size (integer) or Retain Chunk Size (null) (Retain Chunk Size) <br>Target maximum characters for each content chunk during retain. |
| retain\_structured\_chunk\_size | Retain Structured Chunk Size (integer) or Retain Structured Chunk Size (null) (Retain Structured Chunk Size) <br>Maximum characters for a single JSONL line or conversation turn to keep whole during retain. Defaults to retain\_chunk\_size when unset. |
| retain\_max\_attachments\_per\_chunk | Retain Max Attachments Per Chunk (integer) or Retain Max Attachments Per Chunk (null) (Retain Max Attachments Per Chunk) <br>Maximum inline attachments one extraction chunk may carry. retain\_chunk\_size budgets text only — a placeholder costs the characters it occupies and nothing more — so this is what bounds attachments. Match it to the provider's per-request limit. |
| enable\_observations | Enable Observations (boolean) or Enable Observations (null) (Enable Observations) <br>Toggle automatic observation consolidation after retain(). |
| observations\_mission | Observations Mission (string) or Observations Mission (null) (Observations Mission) <br>Controls what gets synthesised into observations. Replaces built-in consolidation rules entirely. |
| enable\_text\_search | Enable Text Search (boolean) or Enable Text Search (null) (Enable Text Search) <br>Toggle the keyword (BM25) retrieval arm during recall. Disabling leaves pure vector search: the arm is left out of the query entirely rather than filtered to nothing, so none of its cost is paid. Also drops the keyword arm from knowledge-page search. |
| enable\_temporal\_retrieval | Enable Temporal Retrieval (boolean) or Enable Temporal Retrieval (null) (Enable Temporal Retrieval) <br>Toggle the temporal retrieval arm during recall, together with the date-aware query analysis that feeds it. Useful for banks whose content carries no meaningful dates. |
| enable\_graph\_retrieval | Enable Graph Retrieval (boolean) or Enable Graph Retrieval (null) (Enable Graph Retrieval) <br>Toggle the entity/link graph traversal arm during recall. Disabling trades relational recall for latency on banks whose content has little entity structure. |
| enable\_reranking | Enable Reranking (boolean) or Enable Reranking (null) (Enable Reranking) <br>Toggle cross-encoder reranking during recall. Disabling returns the RRF-fused ordering directly, which is faster but less precise. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| disposition<br>required | object (DispositionTraits) <br>Disposition traits that influence how memories are formed and interpreted. |
| mission<br>required | string (Mission) <br>The agent's mission - who they are and what they're trying to accomplish |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use mission instead |

**422**

Validation Error

put/v1/default/banks/{bank\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}

### Request samples

- Payload

Content type

application/json

Copy

`{"observations_mission": "Observations are stable facts about people and projects. Always include preferences and skills.",

"retain_mission": "Always include technical decisions and architectural trade-offs. Ignore meeting logistics."

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"disposition": {"empathy": 3,

"literalism": 3,

"skepticism": 3

},

"mission": "I am a software engineer helping my team stay organized and ship quality code",

"name": "Alice"

}`

## [tag/Banks/operation/update_bank](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/update_bank) Partial update memory bank

Partially update an agent's profile. Only provided fields will be updated.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name | Name (string) or Name (null) (Name) <br>Deprecated: display label only, not advertised |
| disposition | DispositionTraits (object) or null<br>Deprecated: use update\_bank\_config instead |
| disposition\_skepticism | Disposition Skepticism (integer) or Disposition Skepticism (null) (Disposition Skepticism) <br>Deprecated: use update\_bank\_config instead |
| disposition\_literalism | Disposition Literalism (integer) or Disposition Literalism (null) (Disposition Literalism) <br>Deprecated: use update\_bank\_config instead |
| disposition\_empathy | Disposition Empathy (integer) or Disposition Empathy (null) (Disposition Empathy) <br>Deprecated: use update\_bank\_config instead |
| mission | Mission (string) or Mission (null) (Mission) <br>Deprecated: use update\_bank\_config with reflect\_mission instead |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use update\_bank\_config with reflect\_mission instead |
| reflect\_mission | Reflect Mission (string) or Reflect Mission (null) (Reflect Mission) <br>Mission/context for Reflect operations. Guides how Reflect interprets and uses memories. |
| retain\_mission | Retain Mission (string) or Retain Mission (null) (Retain Mission) <br>Steers what gets extracted during retain(). Injected alongside built-in extraction rules. |
| retain\_extraction\_mode | Retain Extraction Mode (string) or Retain Extraction Mode (null) (Retain Extraction Mode) <br>Fact extraction mode: 'concise' (default), 'verbose', 'custom', 'verbatim', or 'chunks'. |
| retain\_custom\_instructions | Retain Custom Instructions (string) or Retain Custom Instructions (null) (Retain Custom Instructions) <br>Custom extraction prompt. Only active when retain\_extraction\_mode is 'custom'. |
| retain\_chunk\_size | Retain Chunk Size (integer) or Retain Chunk Size (null) (Retain Chunk Size) <br>Target maximum characters for each content chunk during retain. |
| retain\_structured\_chunk\_size | Retain Structured Chunk Size (integer) or Retain Structured Chunk Size (null) (Retain Structured Chunk Size) <br>Maximum characters for a single JSONL line or conversation turn to keep whole during retain. Defaults to retain\_chunk\_size when unset. |
| retain\_max\_attachments\_per\_chunk | Retain Max Attachments Per Chunk (integer) or Retain Max Attachments Per Chunk (null) (Retain Max Attachments Per Chunk) <br>Maximum inline attachments one extraction chunk may carry. retain\_chunk\_size budgets text only — a placeholder costs the characters it occupies and nothing more — so this is what bounds attachments. Match it to the provider's per-request limit. |
| enable\_observations | Enable Observations (boolean) or Enable Observations (null) (Enable Observations) <br>Toggle automatic observation consolidation after retain(). |
| observations\_mission | Observations Mission (string) or Observations Mission (null) (Observations Mission) <br>Controls what gets synthesised into observations. Replaces built-in consolidation rules entirely. |
| enable\_text\_search | Enable Text Search (boolean) or Enable Text Search (null) (Enable Text Search) <br>Toggle the keyword (BM25) retrieval arm during recall. Disabling leaves pure vector search: the arm is left out of the query entirely rather than filtered to nothing, so none of its cost is paid. Also drops the keyword arm from knowledge-page search. |
| enable\_temporal\_retrieval | Enable Temporal Retrieval (boolean) or Enable Temporal Retrieval (null) (Enable Temporal Retrieval) <br>Toggle the temporal retrieval arm during recall, together with the date-aware query analysis that feeds it. Useful for banks whose content carries no meaningful dates. |
| enable\_graph\_retrieval | Enable Graph Retrieval (boolean) or Enable Graph Retrieval (null) (Enable Graph Retrieval) <br>Toggle the entity/link graph traversal arm during recall. Disabling trades relational recall for latency on banks whose content has little entity structure. |
| enable\_reranking | Enable Reranking (boolean) or Enable Reranking (null) (Enable Reranking) <br>Toggle cross-encoder reranking during recall. Disabling returns the RRF-fused ordering directly, which is faster but less precise. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| disposition<br>required | object (DispositionTraits) <br>Disposition traits that influence how memories are formed and interpreted. |
| mission<br>required | string (Mission) <br>The agent's mission - who they are and what they're trying to accomplish |
| background | Background (string) or Background (null) (Background) <br>Deprecated: use mission instead |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}

### Request samples

- Payload

Content type

application/json

Copy

`{"observations_mission": "Observations are stable facts about people and projects. Always include preferences and skills.",

"retain_mission": "Always include technical decisions and architectural trade-offs. Ignore meeting logistics."

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"disposition": {"empathy": 3,

"literalism": 3,

"skepticism": 3

},

"mission": "I am a software engineer helping my team stay organized and ship quality code",

"name": "Alice"

}`

## [tag/Banks/operation/delete_bank](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/delete_bank) Delete memory bank

Delete an entire memory bank including all memories, entities, documents, and the bank profile itself. This is a destructive operation that cannot be undone.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message | Message (string) or Message (null) (Message) |
| deleted\_count | Deleted Count (integer) or Deleted Count (null) (Deleted Count) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"deleted_count": 10,

"message": "Deleted successfully",

"success": true

}`

## [tag/Banks/operation/clear_observations](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/clear_observations) Clear all observations

Delete all observations for a memory bank. This is useful for resetting the consolidated knowledge.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message | Message (string) or Message (null) (Message) |
| deleted\_count | Deleted Count (integer) or Deleted Count (null) (Deleted Count) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/observations

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/observations

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"deleted_count": 10,

"message": "Deleted successfully",

"success": true

}`

## [tag/Banks/operation/recover_consolidation](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/recover_consolidation) Recover failed consolidation

Reset all memories that were permanently marked as failed during consolidation (after exhausting all LLM retries and adaptive batch splitting) so they are picked up again on the next consolidation run. Does not delete any observations.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| retried\_count<br>required | integer (Retried Count) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/consolidation/recover

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/consolidation/recover

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"retried_count": 42

}`

## [tag/Banks/operation/get_bank_config](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/get_bank_config) Get bank configuration

Get fully resolved configuration for a bank including all hierarchical overrides (global → tenant → bank). The 'config' field contains all resolved config values. The 'overrides' field shows only bank-specific overrides. Always available: HINDSIGHT\_API\_ENABLE\_BANK\_CONFIG\_API gates only the write operations on this resource.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>Bank identifier |
| config<br>required | object (Config) <br>Fully resolved configuration with all hierarchical overrides applied (Python field names) |
| overrides<br>required | object (Overrides) <br>Bank-specific configuration overrides only (Python field names) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/config

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/config

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "my-bank",

"config": {"retain_chunk_size": 3000,

"retain_extraction_mode": "verbose"

},

"overrides": {"retain_extraction_mode": "verbose"

}

}`

## [tag/Banks/operation/update_bank_config](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/update_bank_config) Update bank configuration

Update configuration overrides for a bank. Only hierarchical behavioral settings can be overridden (retention parameters, recall settings, etc.). Keys can be provided in Python field format (retain\_extraction\_mode) or environment variable format (HINDSIGHT\_API\_RETAIN\_EXTRACTION\_MODE).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| updates<br>required | object (Updates) <br>Configuration overrides. Keys can be in Python field format (retain\_extraction\_mode) or environment variable format (HINDSIGHT\_API\_RETAIN\_EXTRACTION\_MODE). Only hierarchical fields can be overridden per-bank. |
| |     |     |
| --- | --- |
| property name\*<br>additional property | any | |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>Bank identifier |
| config<br>required | object (Config) <br>Fully resolved configuration with all hierarchical overrides applied (Python field names) |
| overrides<br>required | object (Overrides) <br>Bank-specific configuration overrides only (Python field names) |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/config

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/config

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"updates": {"retain_custom_instructions": "Extract technical details carefully",

"retain_extraction_mode": "custom"

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "my-bank",

"config": {"retain_chunk_size": 3000,

"retain_extraction_mode": "verbose"

},

"overrides": {"retain_extraction_mode": "verbose"

}

}`

## [tag/Banks/operation/reset_bank_config](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/reset_bank_config) Reset bank configuration

Reset bank configuration to defaults by removing all bank-specific overrides. The bank will then use global and tenant-level configuration only.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>Bank identifier |
| config<br>required | object (Config) <br>Fully resolved configuration with all hierarchical overrides applied (Python field names) |
| overrides<br>required | object (Overrides) <br>Bank-specific configuration overrides only (Python field names) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/config

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/config

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "my-bank",

"config": {"retain_chunk_size": 3000,

"retain_extraction_mode": "verbose"

},

"overrides": {"retain_extraction_mode": "verbose"

}

}`

## [tag/Banks/operation/trigger_consolidation](https://hindsight.vectorize.io/api-reference\#tag/Banks/operation/trigger_consolidation) Trigger consolidation

Run memory consolidation to create/update observations from recent memories.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json

Any of

ConsolidationRequestRequest

|     |     |
| --- | --- |
| observation\_scopes | Array of Observation Scopes (strings) or Observation Scopes (null) (Observation Scopes) <br>Optional list of tag scopes to consolidate. Each scope is a list of tags. Only unconsolidated memories whose tags contain all tags in at least one scope will be processed. If omitted, all unconsolidated memories are processed. |
| Any of <br>Observation ScopesObservation Scopes<br>Array <br>Array <br>string |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| operation\_id<br>required | string (Operation Id) <br>ID of the async consolidation operation |
| deduplicated | boolean (Deduplicated) <br>Default: false<br>True if an existing pending task was reused |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/consolidate

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/consolidate

### Request samples

- Payload

Content type

application/json

Example

ConsolidationRequestRequestConsolidationRequest

Copy
Expand all  Collapse all

`{"observation_scopes": [["string"\
\
]\
\
]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"deduplicated": false

}`

## [tag/Entities](https://hindsight.vectorize.io/api-reference\#tag/Entities) Entities

## [tag/Entities/operation/list_entities](https://hindsight.vectorize.io/api-reference\#tag/Entities/operation/list_entities) List entities

List all entities (people, organizations, etc.) known by the bank, ordered by mention count. Supports pagination.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  >= 0 <br>Default: 100<br>Maximum number of entities to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Only count memories carrying these tags. An entity is returned only when a matching memory mentions it, and its mention count and dates cover the matching memories only. |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How `tags` match (same modes as listing memories). |
| tag\_groups | Tag Groups (string) or Tag Groups (null) (Tag Groups) <br>Compound tag filter as a JSON-encoded list of tag groups — the same shape `tag_groups` takes in a recall body (leaves {tags, match, resolve} and {and: \[...\]}, {or: \[...\]}, {not: ...}; groups are AND-ed). Mutually exclusive with `tags`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/entities

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/entities

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"canonical_name": "John",\
\
"first_seen": "2024-01-15T10:30:00Z",\
\
"id": "123e4567-e89b-12d3-a456-426614174000",\
\
"last_seen": "2024-02-01T14:00:00Z",\
\
"mention_count": 15\
\
}\
\
],

"limit": 100,

"offset": 0,

"total": 150

}`

## [tag/Entities/operation/get_entity_graph](https://hindsight.vectorize.io/api-reference\#tag/Entities/operation/get_entity_graph) Get entity co-occurrence graph

Return a graph of entities (nodes) and their co-occurrences (edges) for visualization.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  >= 0 <br>Default: 1000<br>Maximum number of co-occurrence edges to return |
| min\_count | integer (Min Count) <br>Default: 1<br>Minimum cooccurrence\_count to include an edge |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Only count memories carrying these tags. Edges and node mention counts are computed from the matching memories only. |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How `tags` match (same modes as listing memories). |
| tag\_groups | Tag Groups (string) or Tag Groups (null) (Tag Groups) <br>Compound tag filter as a JSON-encoded list of tag groups — the same shape `tag_groups` takes in a recall body (leaves {tags, match, resolve} and {and: \[...\]}, {or: \[...\]}, {not: ...}; groups are AND-ed). Mutually exclusive with `tags`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| nodes<br>required | Array of objects (Nodes) |
| edges<br>required | Array of objects (Edges) |
| total\_entities<br>required | integer (Total Entities) |
| total\_edges<br>required | integer (Total Edges) |
| limit<br>required | integer (Limit) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/entities/graph

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/entities/graph

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"edges": [{"data": {"color": "#ffd700",\
\
"id": "uuid-1-uuid-2",\
\
"lastCooccurred": "2024-02-01T14:00:00Z",\
\
"lineStyle": "solid",\
\
"linkType": "cooccurrence",\
\
"source": "uuid-1",\
\
"target": "uuid-2",\
\
"weight": 5\
\
}\
\
}\
\
],

"limit": 1000,

"nodes": [{"data": {"color": "#42a5f5",\
\
"id": "uuid-1",\
\
"label": "Alice",\
\
"mentionCount": 12\
\
}\
\
},\
\
{"data": {"color": "#42a5f5",\
\
"id": "uuid-2",\
\
"label": "Google",\
\
"mentionCount": 8\
\
}\
\
}\
\
],

"total_edges": 1,

"total_entities": 2

}`

## [tag/Entities/operation/get_entity](https://hindsight.vectorize.io/api-reference\#tag/Entities/operation/get_entity) Get entity details

Get detailed information about an entity including observations (mental model).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| entity\_id<br>required | string (Entity Id) |

##### query Parameters

|     |     |
| --- | --- |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Only count memories carrying these tags. The entity is a 404 when no matching memory mentions it; its mention count and dates cover the matching memories only. |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How `tags` match (same modes as listing memories). |
| tag\_groups | Tag Groups (string) or Tag Groups (null) (Tag Groups) <br>Compound tag filter as a JSON-encoded list of tag groups — the same shape `tag_groups` takes in a recall body (leaves {tags, match, resolve} and {and: \[...\]}, {or: \[...\]}, {not: ...}; groups are AND-ed). Mutually exclusive with `tags`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| canonical\_name<br>required | string (Canonical Name) |
| mention\_count<br>required | integer (Mention Count) |
| first\_seen | First Seen (string) or First Seen (null) (First Seen) |
| last\_seen | Last Seen (string) or Last Seen (null) (Last Seen) |
| metadata | Metadata (object) or Metadata (null) (Metadata) |
| observations<br>required | Array of objects (Observations) |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/entities/{entity\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/entities/{entity\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"canonical_name": "John",

"first_seen": "2024-01-15T10:30:00Z",

"id": "123e4567-e89b-12d3-a456-426614174000",

"last_seen": "2024-02-01T14:00:00Z",

"mention_count": 15,

"observations": [{"mentioned_at": "2024-01-15T10:30:00Z",\
\
"text": "John works at Google"\
\
}\
\
]

}`

## [tag/Entities/operation/regenerate_entity_observations](https://hindsight.vectorize.io/api-reference\#tag/Entities/operation/regenerate_entity_observations) Regenerate entity observations (deprecated)  Deprecated

This endpoint is deprecated. Entity observations have been replaced by mental models.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| entity\_id<br>required | string (Entity Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| canonical\_name<br>required | string (Canonical Name) |
| mention\_count<br>required | integer (Mention Count) |
| first\_seen | First Seen (string) or First Seen (null) (First Seen) |
| last\_seen | Last Seen (string) or Last Seen (null) (Last Seen) |
| metadata | Metadata (object) or Metadata (null) (Metadata) |
| observations<br>required | Array of objects (Observations) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/entities/{entity\_id}/regenerate

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/entities/{entity\_id}/regenerate

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"canonical_name": "John",

"first_seen": "2024-01-15T10:30:00Z",

"id": "123e4567-e89b-12d3-a456-426614174000",

"last_seen": "2024-02-01T14:00:00Z",

"mention_count": 15,

"observations": [{"mentioned_at": "2024-01-15T10:30:00Z",\
\
"text": "John works at Google"\
\
}\
\
]

}`

## [tag/Mental-Models](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models) Mental Models

## [tag/Mental-Models/operation/list_mental_models](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/list_mental_models) List mental models

List user-curated living documents that stay current.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Filter by tags |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""exact"<br>How to match tags |
| detail | string (Detail) <br>Default: "metadata"<br>Enum:"metadata""content""full"<br>Detail level: 'metadata' (names/tags/staleness — the default), 'content' (adds content/config), 'full' (includes reflect\_response). Content is opt-in: it is returned only when explicitly requested. |
| limit | integer (Limit)  \[ 1 .. 1000 \] <br>Default: 100 |
| offset | integer (Offset)  >= 0 <br>Default: 0 |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) <br>Total number of mental models matching the filter (not just this page) |
| limit<br>required | integer (Limit) <br>Page size that was applied |
| offset<br>required | integer (Offset) <br>Offset that was applied |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/mental-models

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"id": "string",\
\
"bank_id": "string",\
\
"name": "string",\
\
"source_query": "string",\
\
"content": "string",\
\
"tags": [ ],\
\
"max_tokens": 0,\
\
"trigger": {"budget": "low",\
\
"mode": "full",\
\
"refresh_after_consolidation": false,\
\
"refresh_cron": "string",\
\
"full_refresh_cron": "string",\
\
"min_refresh_interval_seconds": 0,\
\
"fact_types": ["world"\
\
],\
\
"exclude_mental_models": false,\
\
"exclude_mental_model_ids": ["string"\
\
],\
\
"tags_match": "any",\
\
"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],\
\
"include_chunks": true,\
\
"recall_max_tokens": 0,\
\
"recall_chunks_max_tokens": 0,\
\
"reflect_search_observations_max_tokens": 1,\
\
"reflect_search_observations_include_entities": true,\
\
"response_schema": { },\
\
"keep_trace": false\
\
},\
\
"last_refreshed_at": "string",\
\
"last_memory_seen_at": "string",\
\
"last_refresh_failed_at": "string",\
\
"last_full_refreshed_at": "string",\
\
"created_at": "string",\
\
"reflect_response": { },\
\
"is_stale": true\
\
}\
\
],

"total": 0,

"limit": 0,

"offset": 0

}`

## [tag/Mental-Models/operation/create_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/create_mental_model) Create mental model

Create a mental model by running reflect with the source query in the background. Returns an operation ID to track progress. The content is auto-generated by the reflect endpoint. Use the operations endpoint to check completion status.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| id | Id (string) or Id (null) (Id) <br>Optional custom ID for the mental model (alphanumeric lowercase with hyphens) |
| name<br>required | string (Name) <br>Human-readable name for the mental model |
| source\_query<br>required | string (Source Query) <br>The query to run to generate content |
| tags | Array of strings (Tags) <br>Default: \[\]<br>Tags for scoped visibility |
| max\_tokens | integer (Max Tokens)  \[ 256 .. 8192 \] <br>Default: 2048<br>Maximum tokens for generated content |
| trigger | object (MentalModelTrigger-Input) <br>Default: {}<br>Trigger settings |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| mental\_model\_id | Mental Model Id (string) or Mental Model Id (null) (Mental Model Id) <br>ID of the created mental model |
| operation\_id<br>required | string (Operation Id) <br>Operation ID to track refresh progress |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/mental-models

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "team-communication",

"max_tokens": 2048,

"name": "Team Communication Preferences",

"source_query": "How does the team prefer to communicate?",

"tags": ["team"\
\
],

"trigger": {"refresh_after_consolidation": false

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"mental_model_id": "string",

"operation_id": "string"

}`

## [tag/Mental-Models/operation/get_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/get_mental_model) Get mental model

Get a specific mental model by ID.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### query Parameters

|     |     |
| --- | --- |
| detail | string (Detail) <br>Default: "full"<br>Enum:"metadata""content""full"<br>Detail level: 'metadata' (names/tags only), 'content' (adds content/config), 'full' (includes reflect\_response) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| source\_query | Source Query (string) or Source Query (null) (Source Query) |
| content | Content (string) or Content (null) (Content) <br>The mental model content as well-formatted markdown (auto-generated from reflect endpoint) |
| tags | Array of strings (Tags) <br>Default: \[\] |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) |
| trigger | MentalModelTrigger (object) or null |
| last\_refreshed\_at | Last Refreshed At (string) or Last Refreshed At (null) (Last Refreshed At) <br>When a refresh last finished for this model — wall-clock, in ISO format. Advances on every refresh that completes, including one that found nothing new and preserved the content, and on a direct edit of `content`. A refresh that failed leaves it alone. This is the field to answer 'have I already refreshed this?'; it says nothing about whether the model is behind the data, which is `last_memory_seen_at` / `is_stale`. |
| last\_memory\_seen\_at | Last Memory Seen At (string) or Last Memory Seen At (null) (Last Memory Seen At) <br>How far through the bank's memories this model is written — the newest in-scope memory the last refresh saw, in ISO format. Stands still when nothing in the model's scope has been written, however often it is refreshed. At or after the bank's `last_memory_write_at` (GET /stats) the model is provably up to date; when it is older, `is_stale` settles it against the model's own scope. Null for a model no refresh has stamped yet. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>When this model's most recent refresh failed, in ISO format, or null when the last one succeeded. While this is set the automatic triggers (`refresh_after_consolidation`, `refresh_cron`, `full_refresh_cron`) skip the model — a refresh that cannot succeed is not retried on every tick. An explicit refresh still runs, and a successful one clears this. The failure itself, with its reason, is in the model's history. |
| last\_full\_refreshed\_at | Last Full Refreshed At (string) or Last Full Refreshed At (null) (Last Full Refreshed At) <br>When a refresh last ran in full mode for this model, in ISO format — requested (`mode: 'full'`, a `full_refresh_cron` tick, a full-mode model) or fallen back to by a delta refresh. `trigger.full_refresh_cron` comes due against this, not `last_refreshed_at`, which every delta refresh moves. Null when no full refresh has completed since this was first tracked. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| reflect\_response | Reflect Response (object) or Reflect Response (null) (Reflect Response) <br>Full reflect API response payload including based\_on facts and observations |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>True when memories matching this mental model's tag/fact\_type scope have been written since last\_memory\_seen\_at — the same check that decides whether a scheduled refresh does any work, so a model flagged here is one a refresh would actually rewrite. Populated on both the single read and the list. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"source_query": "string",

"content": "string",

"tags": [ ],

"max_tokens": 0,

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

},

"last_refreshed_at": "string",

"last_memory_seen_at": "string",

"last_refresh_failed_at": "string",

"last_full_refreshed_at": "string",

"created_at": "string",

"reflect_response": { },

"is_stale": true

}`

## [tag/Mental-Models/operation/update_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/update_mental_model) Update mental model

Update a mental model's name and/or source query.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name | Name (string) or Name (null) (Name) <br>New name for the mental model |
| source\_query | Source Query (string) or Source Query (null) (Source Query) <br>New source query for the mental model |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) <br>Maximum tokens for generated content |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Tags for scoped visibility |
| trigger | MentalModelTrigger (object) or null<br>Trigger settings |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| source\_query | Source Query (string) or Source Query (null) (Source Query) |
| content | Content (string) or Content (null) (Content) <br>The mental model content as well-formatted markdown (auto-generated from reflect endpoint) |
| tags | Array of strings (Tags) <br>Default: \[\] |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) |
| trigger | MentalModelTrigger (object) or null |
| last\_refreshed\_at | Last Refreshed At (string) or Last Refreshed At (null) (Last Refreshed At) <br>When a refresh last finished for this model — wall-clock, in ISO format. Advances on every refresh that completes, including one that found nothing new and preserved the content, and on a direct edit of `content`. A refresh that failed leaves it alone. This is the field to answer 'have I already refreshed this?'; it says nothing about whether the model is behind the data, which is `last_memory_seen_at` / `is_stale`. |
| last\_memory\_seen\_at | Last Memory Seen At (string) or Last Memory Seen At (null) (Last Memory Seen At) <br>How far through the bank's memories this model is written — the newest in-scope memory the last refresh saw, in ISO format. Stands still when nothing in the model's scope has been written, however often it is refreshed. At or after the bank's `last_memory_write_at` (GET /stats) the model is provably up to date; when it is older, `is_stale` settles it against the model's own scope. Null for a model no refresh has stamped yet. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>When this model's most recent refresh failed, in ISO format, or null when the last one succeeded. While this is set the automatic triggers (`refresh_after_consolidation`, `refresh_cron`, `full_refresh_cron`) skip the model — a refresh that cannot succeed is not retried on every tick. An explicit refresh still runs, and a successful one clears this. The failure itself, with its reason, is in the model's history. |
| last\_full\_refreshed\_at | Last Full Refreshed At (string) or Last Full Refreshed At (null) (Last Full Refreshed At) <br>When a refresh last ran in full mode for this model, in ISO format — requested (`mode: 'full'`, a `full_refresh_cron` tick, a full-mode model) or fallen back to by a delta refresh. `trigger.full_refresh_cron` comes due against this, not `last_refreshed_at`, which every delta refresh moves. Null when no full refresh has completed since this was first tracked. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| reflect\_response | Reflect Response (object) or Reflect Response (null) (Reflect Response) <br>Full reflect API response payload including based\_on facts and observations |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>True when memories matching this mental model's tag/fact\_type scope have been written since last\_memory\_seen\_at — the same check that decides whether a scheduled refresh does any work, so a model flagged here is one a refresh would actually rewrite. Populated on both the single read and the list. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"max_tokens": 4096,

"name": "Updated Team Communication Preferences",

"source_query": "How does the team prefer to communicate?",

"tags": ["team",\
\
"communication"\
\
],

"trigger": {"refresh_after_consolidation": true

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"source_query": "string",

"content": "string",

"tags": [ ],

"max_tokens": 0,

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

},

"last_refreshed_at": "string",

"last_memory_seen_at": "string",

"last_refresh_failed_at": "string",

"last_full_refreshed_at": "string",

"created_at": "string",

"reflect_response": { },

"is_stale": true

}`

## [tag/Mental-Models/operation/delete_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/delete_mental_model) Delete mental model

Delete a mental model.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Mental-Models/operation/get_mental_model_history](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/get_mental_model_history) Get mental model history

Get the refresh history of a mental model, showing content changes over time.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

get/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/history

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/history

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Mental-Models/operation/refresh_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/refresh_mental_model) Refresh mental model

Submit an async task to re-run the source query through reflect and update the content. With no body the refresh runs in the model's own `trigger.mode`. Send `{"mode": "full"}` for a full refresh: the content is regenerated from scratch this once (to clear the drift delta edits accumulate) while the stored trigger keeps its mode. Unlike clearing the model first, a full refresh that fails leaves the previous content in place.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json

Any of

RefreshMentalModelRequestRequest

|     |     |
| --- | --- |
| mode | "full" (string) or Mode (null) (Mode) <br>'full' regenerates the content from scratch for this refresh only, whatever `trigger.mode` says; the stored trigger is not changed. null runs the model's own mode. |
| Any of <br>"full"Mode<br>string ("full") <br>'full' regenerates the content from scratch for this refresh only, whatever `trigger.mode` says; the stored trigger is not changed. null runs the model's own mode. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| operation\_id<br>required | string (Operation Id) |
| status<br>required | string (Status) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/refresh

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/refresh

### Request samples

- Payload

Content type

application/json

Example

RefreshMentalModelRequestRequestRefreshMentalModelRequest

Copy

`{"mode": "full"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"operation_id": "550e8400-e29b-41d4-a716-446655440000",

"status": "queued"

}`

## [tag/Mental-Models/operation/dry_run_refresh_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/dry_run_refresh_mental_model) Dry-run mental model refresh (preview, no persistence)

Preview what a refresh would do to this mental model WITHOUT changing it — no content, structured document, watermark, or last\_refreshed\_at is written. Returns the mode the refresh ran in and why (delta silently falls back to full when there is no baseline or the source query changed), the resolved tag scope and time window it read, how many facts retrieval returned versus how many the reflect agent actually used, the delta operations it emitted, and a unified diff from the stored content to the content it would write.

This is the production refresh pipeline with two writes skipped — the content and the watermark — and nothing about it is configurable, so what it reports is what the next refresh will do. Because nothing is persisted, a delta dry run reads exactly the window the next real refresh would, and repeating it reads that same window again.

It costs the same LLM tokens as a refresh and is validated the same way.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| mental\_model\_id<br>required | string (Mental Model Id) <br>The mental model previewed. |
| name<br>required | string (Name) <br>Display name of the mental model. |
| requested\_mode<br>required | string (Requested Mode) <br>Enum:"full""delta"<br>The mode asked for (from the model's trigger, or overridden). |
| effective\_mode<br>required | string (Effective Mode) <br>Enum:"full""delta"<br>The mode the refresh actually ran in. |
| mode\_fallback\_reason | Mode Fallback Reason (string) or Mode Fallback Reason (null) (Mode Fallback Reason) <br>Why delta was requested but not applied, if that happened. |
| outcome<br>required | string (Outcome) <br>Enum:"content\_written""content\_unchanged""content\_preserved\_no\_new\_facts""refresh\_failed\_empty\_candidate""refresh\_failed\_delta\_not\_applied"<br>What a real refresh would do with the document. |
| would\_persist<br>required | boolean (Would Persist) <br>Whether a real refresh would write new content. |
| scope<br>required | object (MentalModelRefreshScope) <br>The resolved memory scope. |
| window<br>required | object (MentalModelRefreshWindow) <br>The snapshot window read from. |
| facts<br>required | object (MentalModelFactCounts) <br>Facts retrieved versus actually used. |
| based\_on | object (Based On) <br>The evidence this run would ground the document on, keyed by fact type — the same shape a refresh persists under reflect\_response.based\_on. Returned so a preview can show its sources without having to write them anywhere. |
| current\_content<br>required | string (Current Content) <br>The model's content as it stands now. |
| candidate\_content<br>required | string (Candidate Content) <br>Raw reflect synthesis, before any delta operations. |
| preview\_content<br>required | string (Preview Content) <br>The content a real refresh would store: the delta-edited document, or the candidate in full mode. |
| diff<br>required | string (Diff) <br>Unified diff from current\_content to preview\_content. Empty when identical. |
| delta\_operations | MentalModelDeltaOperations (object) or null<br>Structured operations emitted, in delta mode. |
| retraction | MentalModelRetraction (object) or null<br>Facts the document cites that no longer exist, and what a real refresh would do about them. |
| trace<br>required | object (MentalModelRefreshTrace) <br>Execution trace of the run, always included for a dry run. |
| usage | object (TokenUsage) <br>Token usage across the run's LLM calls. |
| duration\_ms | integer (Duration Ms) <br>Default: 0<br>Wall-clock duration of the run. |
| warnings | Array of strings (Warnings) <br>Conditions worth a human's attention, in plain language. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/dry-run-refresh

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/dry-run-refresh

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"effective_mode": "full",

"facts": {"retrieved": {"observation": 12

},

"used": {"observation": 4

}

},

"mental_model_id": "coding-style",

"mode_fallback_reason": "source_query_changed",

"name": "Coding Style",

"outcome": "content_written",

"requested_mode": "delta",

"warnings": [ ],

"would_persist": true

}`

## [tag/Mental-Models/operation/clear_mental_model](https://hindsight.vectorize.io/api-reference\#tag/Mental-Models/operation/clear_mental_model) Clear mental model content

Clear a mental model's content so the next refresh performs a full re-synthesis. This is useful for delta-mode models that have accumulated drift over many incremental refreshes. After clearing, call the /refresh endpoint to trigger a clean full rebuild.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| source\_query | Source Query (string) or Source Query (null) (Source Query) |
| content | Content (string) or Content (null) (Content) <br>The mental model content as well-formatted markdown (auto-generated from reflect endpoint) |
| tags | Array of strings (Tags) <br>Default: \[\] |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) |
| trigger | MentalModelTrigger (object) or null |
| last\_refreshed\_at | Last Refreshed At (string) or Last Refreshed At (null) (Last Refreshed At) <br>When a refresh last finished for this model — wall-clock, in ISO format. Advances on every refresh that completes, including one that found nothing new and preserved the content, and on a direct edit of `content`. A refresh that failed leaves it alone. This is the field to answer 'have I already refreshed this?'; it says nothing about whether the model is behind the data, which is `last_memory_seen_at` / `is_stale`. |
| last\_memory\_seen\_at | Last Memory Seen At (string) or Last Memory Seen At (null) (Last Memory Seen At) <br>How far through the bank's memories this model is written — the newest in-scope memory the last refresh saw, in ISO format. Stands still when nothing in the model's scope has been written, however often it is refreshed. At or after the bank's `last_memory_write_at` (GET /stats) the model is provably up to date; when it is older, `is_stale` settles it against the model's own scope. Null for a model no refresh has stamped yet. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>When this model's most recent refresh failed, in ISO format, or null when the last one succeeded. While this is set the automatic triggers (`refresh_after_consolidation`, `refresh_cron`, `full_refresh_cron`) skip the model — a refresh that cannot succeed is not retried on every tick. An explicit refresh still runs, and a successful one clears this. The failure itself, with its reason, is in the model's history. |
| last\_full\_refreshed\_at | Last Full Refreshed At (string) or Last Full Refreshed At (null) (Last Full Refreshed At) <br>When a refresh last ran in full mode for this model, in ISO format — requested (`mode: 'full'`, a `full_refresh_cron` tick, a full-mode model) or fallen back to by a delta refresh. `trigger.full_refresh_cron` comes due against this, not `last_refreshed_at`, which every delta refresh moves. Null when no full refresh has completed since this was first tracked. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| reflect\_response | Reflect Response (object) or Reflect Response (null) (Reflect Response) <br>Full reflect API response payload including based\_on facts and observations |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>True when memories matching this mental model's tag/fact\_type scope have been written since last\_memory\_seen\_at — the same check that decides whether a scheduled refresh does any work, so a model flagged here is one a refresh would actually rewrite. Populated on both the single read and the list. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/clear

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/mental-models/{mental\_model\_id}/clear

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"source_query": "string",

"content": "string",

"tags": [ ],

"max_tokens": 0,

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

},

"last_refreshed_at": "string",

"last_memory_seen_at": "string",

"last_refresh_failed_at": "string",

"last_full_refreshed_at": "string",

"created_at": "string",

"reflect_response": { },

"is_stale": true

}`

## [tag/Knowledge-Base](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base) Knowledge Base

## [tag/Knowledge-Base/operation/get_knowledge_base_tree](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/get_knowledge_base_tree) Get the knowledge-base tree

Return the knowledge base as a nested tree of folders and pages.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Only return pages carrying these tags (matched per `tags_match`, like recall). |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How `tags` match a page's tags: any, all, any\_strict, all\_strict, exact. 'any'/'all' also return untagged pages; the \_strict modes and 'exact' do not. |
| tag\_groups | Tag Groups (string) or Tag Groups (null) (Tag Groups) <br>JSON-encoded compound tag filter, same shape as recall's `tag_groups`, e.g. `[{"or":[{"tags":["user:kate"],"match":"all_strict"},{"tags":["team"]}]}]`. Top-level groups are AND-ed, and AND-ed with `tags`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| roots<br>required | Array of objects (Roots) |
| Array

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| kind<br>required | string (Kind) <br>Enum:"folder""page" |
| name<br>required | string (Name) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |
| mental\_model\_id | Mental Model Id (string) or Mental Model Id (null) (Mental Model Id) <br>Backing mental model id (pages only). |
| managed | boolean (Managed) <br>Default: false<br>Client-set flag: true = system-owned, false = hand-authored. |
| description | Description (string) or Description (null) (Description) <br>Page source query (the page's `description`). |
| tags | Array of strings (Tags) <br>Default: \[\] |
| timestamp | Timestamp (string) or Timestamp (null) (Timestamp) <br>Last refresh (page) or last update (folder). |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>Pages only, populated by the tree endpoint. True when a memory in _this page's_ scope — its tags and fact types — has been written since the page last read the memories. That is the same check a scheduled refresh runs before spending an LLM call, so a flagged page is one a refresh would actually rewrite. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>Pages only: when this page's most recent refresh failed, in ISO format, or null when the last one succeeded. While it is set the page does not rebuild itself on its trigger — see the same field on the mental model. An explicit refresh still runs. |
| trigger | MentalModelTrigger (object) or null<br>Pages only: the page's refresh settings — when it rebuilds itself (`refresh_after_consolidation` or `refresh_cron`, plus any `full_refresh_cron`), in which mode, and over which facts. This is the EFFECTIVE policy: a setting the page never stored is reported at its default, so compare the fields you care about rather than the whole object against a patch you sent. Absent on folders, which have no backing mental model, and on a page with no trigger stored. |
| children | Array of objects (Children) <br>Default: \[\] | |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/knowledge-base/tree

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/tree

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"roots": [{"id": "string",\
\
"kind": "folder",\
\
"name": "string",\
\
"parent_id": "string",\
\
"mental_model_id": "string",\
\
"managed": false,\
\
"description": "string",\
\
"tags": [ ],\
\
"timestamp": "string",\
\
"is_stale": true,\
\
"last_refresh_failed_at": "string",\
\
"trigger": {"budget": "low",\
\
"mode": "full",\
\
"refresh_after_consolidation": false,\
\
"refresh_cron": "string",\
\
"full_refresh_cron": "string",\
\
"min_refresh_interval_seconds": 0,\
\
"fact_types": ["world"\
\
],\
\
"exclude_mental_models": false,\
\
"exclude_mental_model_ids": ["string"\
\
],\
\
"tags_match": "any",\
\
"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],\
\
"include_chunks": true,\
\
"recall_max_tokens": 0,\
\
"recall_chunks_max_tokens": 0,\
\
"reflect_search_observations_max_tokens": 1,\
\
"reflect_search_observations_include_entities": true,\
\
"response_schema": { },\
\
"keep_trace": false\
\
},\
\
"children": [ ]\
\
}\
\
]

}`

## [tag/Knowledge-Base/operation/create_knowledge_folder](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/create_knowledge_folder) Create a knowledge-base folder

Create a folder, optionally nested under a parent folder.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name<br>required | string (Name) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |

### Responses

**201**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| kind<br>required | string (Kind) <br>Enum:"folder""page" |
| name<br>required | string (Name) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |
| mental\_model\_id | Mental Model Id (string) or Mental Model Id (null) (Mental Model Id) <br>Backing mental model id (pages only). |
| managed | boolean (Managed) <br>Default: false<br>Client-set flag: true = system-owned, false = hand-authored. |
| description | Description (string) or Description (null) (Description) <br>Page source query (the page's `description`). |
| tags | Array of strings (Tags) <br>Default: \[\] |
| timestamp | Timestamp (string) or Timestamp (null) (Timestamp) <br>Last refresh (page) or last update (folder). |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>Pages only, populated by the tree endpoint. True when a memory in _this page's_ scope — its tags and fact types — has been written since the page last read the memories. That is the same check a scheduled refresh runs before spending an LLM call, so a flagged page is one a refresh would actually rewrite. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>Pages only: when this page's most recent refresh failed, in ISO format, or null when the last one succeeded. While it is set the page does not rebuild itself on its trigger — see the same field on the mental model. An explicit refresh still runs. |
| trigger | MentalModelTrigger (object) or null<br>Pages only: the page's refresh settings — when it rebuilds itself (`refresh_after_consolidation` or `refresh_cron`, plus any `full_refresh_cron`), in which mode, and over which facts. This is the EFFECTIVE policy: a setting the page never stored is reported at its default, so compare the fields you care about rather than the whole object against a patch you sent. Absent on folders, which have no backing mental model, and on a page with no trigger stored. |
| children | Array of objects (Children) <br>Default: \[\] |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/knowledge-base/folders

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/folders

### Request samples

- Payload

Content type

application/json

Copy

`{"name": "string",

"parent_id": "string"

}`

### Response samples

- 201
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"kind": "folder",

"name": "string",

"parent_id": "string",

"mental_model_id": "string",

"managed": false,

"description": "string",

"tags": [ ],

"timestamp": "string",

"is_stale": true,

"last_refresh_failed_at": "string",

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

},

"children": [ ]

}`

## [tag/Knowledge-Base/operation/create_knowledge_page](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/create_knowledge_page) Create a knowledge-base page

Create a page (a mental model + tree node). Content is generated asynchronously; use the returned operation\_id to track completion.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name<br>required | string (Name) |
| source\_query<br>required | string (Source Query) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Tags that SCOPE which memories this page is built from — not labels. Every tag here, including a `type:<x>` tag used to set the page's rendered type, is part of the filter. By default a tagged page matches with `all_strict`: a memory must carry EVERY one of these tags, and untagged memories are excluded entirely. Tags invented for the page (a topic, a document type) therefore match nothing unless your memories were retained with those exact tags, and the page generates as 'I don't have information about this'. Omit this field to build the page from the whole bank, or set `trigger.tags_match` to 'all' to require the tags while still including untagged memories. |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) |
| trigger | MentalModelTrigger (object) or null |

### Responses

**201**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| page\_id<br>required | string (Page Id) |
| mental\_model\_id<br>required | string (Mental Model Id) |
| operation\_id | Operation Id (string) or Operation Id (null) (Operation Id) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/knowledge-base/pages

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/pages

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"name": "string",

"source_query": "string",

"parent_id": "string",

"tags": ["string"\
\
],

"max_tokens": 0,

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

}

}`

### Response samples

- 201
- 422

Content type

application/json

Copy

`{"page_id": "string",

"mental_model_id": "string",

"operation_id": "string"

}`

## [tag/Knowledge-Base/operation/export_knowledge_base](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/export_knowledge_base) Export the knowledge base as a markdown bundle

Return a portable markdown bundle: a nested index.md, one .md per page, and history logs.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| files<br>required | Array of objects (Files) |
| Array

|     |     |
| --- | --- |
| path<br>required | string (Path) |
| content<br>required | string (Content) | |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/knowledge-base/export

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/export

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"files": [{"path": "string",\
\
"content": "string"\
\
}\
\
]

}`

## [tag/Knowledge-Base/operation/search_knowledge_base](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/search_knowledge_base) Hybrid search over knowledge pages (BM25 + vector)

Doc-level hybrid search across a bank's knowledge pages: a full-text (BM25) match and a vector-similarity match, Reciprocal-Rank-Fusion fused. No reranker — tuned for latency.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| q<br>required | string (Q)  non-empty <br>Search query |
| limit | integer (Limit)  \[ 1 .. 50 \] <br>Default: 10<br>Maximum results to return |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Only return pages carrying these tags (matched per `tags_match`, like recall). |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How `tags` match a page's tags: any, all, any\_strict, all\_strict, exact. 'any'/'all' also return untagged pages; the \_strict modes and 'exact' do not. |
| tag\_groups | Tag Groups (string) or Tag Groups (null) (Tag Groups) <br>JSON-encoded compound tag filter, same shape as recall's `tag_groups`, e.g. `[{"or":[{"tags":["user:kate"],"match":"all_strict"},{"tags":["team"]}]}]`. Top-level groups are AND-ed, and AND-ed with `tags`. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| results<br>required | Array of objects (Results) |
| total<br>required | integer (Total) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/knowledge-base/search

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/search

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"results": [{"id": "string",\
\
"name": "string",\
\
"mental_model_id": "string",\
\
"source_query": "string",\
\
"snippet": "string",\
\
"score": 0,\
\
"updated_at": "string"\
\
}\
\
],

"total": 0

}`

## [tag/Knowledge-Base/operation/get_knowledge_page](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/get_knowledge_page) Get a knowledge-base page

Return a single page as a markdown document (frontmatter + markdown body).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| page\_id<br>required | string (Page Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| name<br>required | string (Name) |
| type<br>required | string (Type) <br>Page type — from a `type:<x>` tag, else 'knowledge-page'. |
| description | Description (string) or Description (null) (Description) <br>The source query that rebuilds the page. |
| tags | Array of strings (Tags) <br>Default: \[\] |
| timestamp | Timestamp (string) or Timestamp (null) (Timestamp) <br>Last refresh time (falls back to creation). |
| body | Body (string) or Body (null) (Body) <br>The page's synthesized markdown body, exactly as stored. Empty until a refresh writes one — unlike `markdown`, which says so in words. Build a UI's own empty state off this field; read `markdown` to show the document itself. |
| markdown<br>required | string (Markdown) <br>The full markdown document: YAML frontmatter + markdown body. A page with no body yet renders 'No content yet.' as its body rather than frontmatter alone, which reads as a page that failed to render. The notice is added here on the way out; the stored body in `body` stays empty, and the export bundle keeps the bare document. |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/knowledge-base/pages/{page\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/pages/{page\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"name": "string",

"type": "string",

"description": "string",

"tags": [ ],

"timestamp": "string",

"body": "string",

"markdown": "string"

}`

## [tag/Knowledge-Base/operation/update_knowledge_node](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/update_knowledge_node) Rename/move a knowledge-base node or update a page's options

Rename a node (set `name`), move it under another folder (set `parent_id`, null for the root), and/or update a page's options (`source_query`, `tags`, `max_tokens`, `trigger`). Changing `source_query` schedules an async refresh so the page rebuilds against the new question. `trigger` is applied as a patch: the fields you send are updated and the rest keep the page's current values.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| node\_id<br>required | string (Node Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name | Name (string) or Name (null) (Name) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |
| source\_query | Source Query (string) or Source Query (null) (Source Query) |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Replaces the page's tags, which SCOPE which memories it is built from. Pass `[]` to clear them and rebuild the page from the whole bank — the fix when a page generates 'I don't have information about this' because its tags match no memory. See the matching rules on this field in `CreatePageRequest`; `trigger.tags_match` widens them. |
| max\_tokens | Max Tokens (integer) or Max Tokens (null) (Max Tokens) |
| trigger | MentalModelTrigger (object) or null<br>Refresh settings to change. Applied as a patch: only the fields present in this object are updated, and the rest keep the page's current values — so moving a page onto a schedule does not reset how it refreshes. Setting refresh\_cron clears refresh\_after\_consolidation and vice versa, since a page refreshes on one or the other, never both. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| kind<br>required | string (Kind) <br>Enum:"folder""page" |
| name<br>required | string (Name) |
| parent\_id | Parent Id (string) or Parent Id (null) (Parent Id) |
| mental\_model\_id | Mental Model Id (string) or Mental Model Id (null) (Mental Model Id) <br>Backing mental model id (pages only). |
| managed | boolean (Managed) <br>Default: false<br>Client-set flag: true = system-owned, false = hand-authored. |
| description | Description (string) or Description (null) (Description) <br>Page source query (the page's `description`). |
| tags | Array of strings (Tags) <br>Default: \[\] |
| timestamp | Timestamp (string) or Timestamp (null) (Timestamp) <br>Last refresh (page) or last update (folder). |
| is\_stale | Is Stale (boolean) or Is Stale (null) (Is Stale) <br>Pages only, populated by the tree endpoint. True when a memory in _this page's_ scope — its tags and fact types — has been written since the page last read the memories. That is the same check a scheduled refresh runs before spending an LLM call, so a flagged page is one a refresh would actually rewrite. Deletions are not observed: removing an in-scope memory leaves no write behind, so it does not raise this flag. |
| last\_refresh\_failed\_at | Last Refresh Failed At (string) or Last Refresh Failed At (null) (Last Refresh Failed At) <br>Pages only: when this page's most recent refresh failed, in ISO format, or null when the last one succeeded. While it is set the page does not rebuild itself on its trigger — see the same field on the mental model. An explicit refresh still runs. |
| trigger | MentalModelTrigger (object) or null<br>Pages only: the page's refresh settings — when it rebuilds itself (`refresh_after_consolidation` or `refresh_cron`, plus any `full_refresh_cron`), in which mode, and over which facts. This is the EFFECTIVE policy: a setting the page never stored is reported at its default, so compare the fields you care about rather than the whole object against a patch you sent. Absent on folders, which have no backing mental model, and on a page with no trigger stored. |
| children | Array of objects (Children) <br>Default: \[\] |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/knowledge-base/nodes/{node\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/nodes/{node\_id}

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"name": "string",

"parent_id": "string",

"source_query": "string",

"tags": ["string"\
\
],

"max_tokens": 0,

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"kind": "folder",

"name": "string",

"parent_id": "string",

"mental_model_id": "string",

"managed": false,

"description": "string",

"tags": [ ],

"timestamp": "string",

"is_stale": true,

"last_refresh_failed_at": "string",

"trigger": {"budget": "low",

"mode": "full",

"refresh_after_consolidation": false,

"refresh_cron": "string",

"full_refresh_cron": "string",

"min_refresh_interval_seconds": 0,

"fact_types": ["world"\
\
],

"exclude_mental_models": false,

"exclude_mental_model_ids": ["string"\
\
],

"tags_match": "any",

"tag_groups": [{"tags": ["string"\
\
],\
\
"match": "any",\
\
"resolve": "exact"\
\
}\
\
],

"include_chunks": true,

"recall_max_tokens": 0,

"recall_chunks_max_tokens": 0,

"reflect_search_observations_max_tokens": 1,

"reflect_search_observations_include_entities": true,

"response_schema": { },

"keep_trace": false

},

"children": [ ]

}`

## [tag/Knowledge-Base/operation/delete_knowledge_node](https://hindsight.vectorize.io/api-reference\#tag/Knowledge-Base/operation/delete_knowledge_node) Delete a knowledge-base node

Delete a folder or page and its whole subtree (pages' mental models are removed too).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| node\_id<br>required | string (Node Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/knowledge-base/nodes/{node\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/knowledge-base/nodes/{node\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Directives](https://hindsight.vectorize.io/api-reference\#tag/Directives) Directives

## [tag/Directives/operation/list_directives](https://hindsight.vectorize.io/api-reference\#tag/Directives/operation/list_directives) List directives

List directive definitions. Unlike reflect, an omitted tag filter returns all directives.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Filter directives by execution scope. Omit or pass \[\] to list all directives. |
| tags\_match | string (Tags Match) <br>Default: "any"<br>Enum:"any""all""exact"<br>How tagged directives match the requested scope. Untagged/global directives are included. |
| active\_only | boolean (Active Only) <br>Default: true<br>Only return active directives |
| limit | integer (Limit)  \[ 1 .. 1000 \] <br>Default: 100 |
| offset | integer (Offset)  >= 0 <br>Default: 0 |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) <br>Total number of directives matching the filter (not just this page) |
| limit<br>required | integer (Limit) <br>Page size that was applied |
| offset<br>required | integer (Offset) <br>Offset that was applied |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/directives

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/directives

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"id": "string",\
\
"bank_id": "string",\
\
"name": "string",\
\
"content": "string",\
\
"priority": 0,\
\
"is_active": true,\
\
"tags": [ ],\
\
"created_at": "string",\
\
"updated_at": "string"\
\
}\
\
],

"total": 0,

"limit": 0,

"offset": 0

}`

## [tag/Directives/operation/create_directive](https://hindsight.vectorize.io/api-reference\#tag/Directives/operation/create_directive) Create directive

Create a global or tag-scoped hard rule for reflect prompts.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name<br>required | string (Name) <br>Human-readable name for the directive |
| content<br>required | string (Content) <br>The directive text to inject into prompts |
| priority | integer (Priority) <br>Default: 0<br>Higher priority directives are injected first |
| is\_active | boolean (Is Active) <br>Default: true<br>Whether this directive is active |
| tags | Array of strings (Tags) <br>Default: \[\]<br>Directive execution scope. Empty means global; non-empty requires a matching reflect scope. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| content<br>required | string (Content) |
| priority | integer (Priority) <br>Default: 0 |
| is\_active | boolean (Is Active) <br>Default: true |
| tags | Array of strings (Tags) <br>Default: \[\] |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/directives

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/directives

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"name": "string",

"content": "string",

"priority": 0,

"is_active": true,

"tags": [ ]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"content": "string",

"priority": 0,

"is_active": true,

"tags": [ ],

"created_at": "string",

"updated_at": "string"

}`

## [tag/Directives/operation/get_directive](https://hindsight.vectorize.io/api-reference\#tag/Directives/operation/get_directive) Get directive

Get a specific directive by ID.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| directive\_id<br>required | string (Directive Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| content<br>required | string (Content) |
| priority | integer (Priority) <br>Default: 0 |
| is\_active | boolean (Is Active) <br>Default: true |
| tags | Array of strings (Tags) <br>Default: \[\] |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/directives/{directive\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/directives/{directive\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"content": "string",

"priority": 0,

"is_active": true,

"tags": [ ],

"created_at": "string",

"updated_at": "string"

}`

## [tag/Directives/operation/update_directive](https://hindsight.vectorize.io/api-reference\#tag/Directives/operation/update_directive) Update directive

Update a directive's properties.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| directive\_id<br>required | string (Directive Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| name | Name (string) or Name (null) (Name) <br>New name |
| content | Content (string) or Content (null) (Content) <br>New content |
| priority | Priority (integer) or Priority (null) (Priority) <br>New priority |
| is\_active | Is Active (boolean) or Is Active (null) (Is Active) <br>New active status |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>New tags |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| name<br>required | string (Name) |
| content<br>required | string (Content) |
| priority | integer (Priority) <br>Default: 0 |
| is\_active | boolean (Is Active) <br>Default: true |
| tags | Array of strings (Tags) <br>Default: \[\] |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/directives/{directive\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/directives/{directive\_id}

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"name": "string",

"content": "string",

"priority": 0,

"is_active": true,

"tags": ["string"\
\
]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"name": "string",

"content": "string",

"priority": 0,

"is_active": true,

"tags": [ ],

"created_at": "string",

"updated_at": "string"

}`

## [tag/Directives/operation/delete_directive](https://hindsight.vectorize.io/api-reference\#tag/Directives/operation/delete_directive) Delete directive

Delete a directive.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| directive\_id<br>required | string (Directive Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/directives/{directive\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/directives/{directive\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Documents](https://hindsight.vectorize.io/api-reference\#tag/Documents) Documents

## [tag/Documents/operation/list_documents](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/list_documents) List documents

List documents with pagination, optional search, and an optional time window. Most recently written first (`updated_at` descending) unless `time_field` selects another axis. Documents are the source content from which memory units are extracted.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| q | Q (string) or Q (null) (Q) <br>Case-insensitive substring filter on document ID or document text (e.g. 'report' matches 'report-2024' or any document containing 'report'). Meant for browsing and inspection, not for high-volume or latency-sensitive workloads — use recall for that. Matches are capped: past the cap, `total` is a lower bound and `total_is_estimate` is true. A store-owned backend may match approximately; each item's `matched_fields` says what matched. |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>Filter documents by tags |
| tags\_match | string (Tags Match) <br>Default: "any\_strict"<br>Enum:"any""all""any\_strict""all\_strict""exact"<br>How to match tags: 'any', 'all', 'any\_strict', 'all\_strict', 'exact' |
| time\_field | Time Field (string) or Time Field (null) (Time Field) <br>Time axis to filter and order by: `created_at` (when the document first arrived) or `updated_at` (its last write, the default ordering). Filtering and ordering both follow `time_field`, and rows with no value on that column are excluded — so `total` counts only rows carrying that timestamp, and can be 0 on a bank that is not empty. |
| start\_date | Start Date (string) or Start Date (null) (Start Date) <br>Filter from this ISO datetime (inclusive) |
| end\_date | End Date (string) or End Date (null) (End Date) <br>Filter until this ISO datetime (exclusive) |
| limit | integer (Limit)  >= 0 <br>Default: 100 |
| offset | integer (Offset)  >= 0 <br>Default: 0 |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |
| total\_is\_estimate | boolean (Total Is Estimate) <br>Default: false<br>True when a `q` search stopped at its match cap, so `total` is a lower bound rather than an exact count. Always false without `q`. |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/documents

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"bank_id": "user123",\
\
"content_hash": "abc123",\
\
"created_at": "2024-01-15T10:30:00Z",\
\
"id": "session_1",\
\
"memory_unit_count": 15,\
\
"tags": ["user_a",\
\
"session_123"\
\
],\
\
"text_length": 5420,\
\
"updated_at": "2024-01-15T10:30:00Z"\
\
}\
\
],

"limit": 100,

"offset": 0,

"total": 50

}`

## [tag/Documents/operation/list_document_chunks](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/list_document_chunks) List document chunks

List all chunks for a given document, ordered by chunk index.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| document\_id<br>required | string (Document Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  \[ 1 .. 1000 \] <br>Default: 100<br>Maximum number of chunks to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/documents/{document\_id}/chunks

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents/{document\_id}/chunks

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"bank_id": "user123",\
\
"chunk_id": "user123_session_1_0",\
\
"chunk_index": 0,\
\
"chunk_text": "This is the first chunk of the document...",\
\
"created_at": "2024-01-15T10:30:00Z",\
\
"document_id": "session_1"\
\
}\
\
],

"total": 0,

"limit": 0,

"offset": 0

}`

## [tag/Documents/operation/reprocess_document](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/reprocess_document) Reprocess document

Re-run the retain pipeline on an existing document without changing its content. This deletes the existing memory units and re-extracts facts using the current engine configuration. Useful when the LLM model, chunking strategy, or extraction settings have changed.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| document\_id<br>required | string (Document Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| operation\_id<br>required | string (Operation Id) |
| items\_count<br>required | integer (Items Count) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/documents/{document\_id}/reprocess

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents/{document\_id}/reprocess

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"success": true,

"operation_id": "string",

"items_count": 0

}`

## [tag/Documents/operation/get_document](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/get_document) Get document details

Get a specific document including its original text

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| document\_id<br>required | string (Document Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | string (Bank Id) |
| original\_text<br>required | Original Text (string) or Original Text (null) (Original Text) |
| content\_hash<br>required | Content Hash (string) or Content Hash (null) (Content Hash) |
| created\_at<br>required | string (Created At) |
| updated\_at<br>required | string (Updated At) |
| memory\_unit\_count<br>required | integer (Memory Unit Count) |
| nodes\_by\_fact\_type | Nodes By Fact Type (object) or Nodes By Fact Type (null) (Nodes By Fact Type) <br>Memory count per fact type (world, experience, observation) |
| tags | Array of strings (Tags) <br>Default: \[\]<br>Tags associated with this document |
| document\_metadata | Document Metadata (object) or Document Metadata (null) (Document Metadata) <br>Document metadata |
| retain\_params | Retain Params (object) or Retain Params (null) (Retain Params) <br>Parameters used during retain |
| observation\_scopes | Observation Scopes (string) or Array of Observation Scopes (strings) or Observation Scopes (null) (Observation Scopes) <br>The observation\_scopes spec configured at retain time (e.g. 'all\_combinations', 'per\_tag', or explicit tag-set lists), captured into retain\_params. None when none was set (default 'combined' scoping) or for documents retained before this was captured. |
| attachments | Array of Attachments (objects) or Attachments (null) (Attachments) <br>Attachments referenced by this document, when it was retained with inline content. Each carries a bank-scoped `url` serving the original bytes. Omitted when there are none. |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/documents/{document\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents/{document\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"content_hash": "abc123",

"created_at": "2024-01-15T10:30:00Z",

"document_metadata": {"channel": "#general",

"source": "slack"

},

"id": "session_1",

"memory_unit_count": 15,

"original_text": "Full document text here...",

"retain_params": {"context": "Team meeting notes",

"event_date": "2024-01-15"

},

"tags": ["user_a",\
\
"session_123"\
\
],

"updated_at": "2024-01-15T10:30:00Z"

}`

## [tag/Documents/operation/update_document](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/update_document) Update document

Update mutable fields on a document without re-processing its content.

**Tags** (`tags`): The array REPLACES the document's tags, it is not merged into them — send the complete set you want the document to end up with, and any tag you leave out is dropped. An empty array (`[]`) therefore clears every tag; only omitting the field entirely is rejected (422).

The new tags are propagated to all associated memory units.

**Observation scopes** (`observation_scopes`): Replaces how the document's memories are scoped during consolidation, with the same values retain accepts. Use it to move a bank whose documents were retained under per-session tags to `shared` without re-extracting anything. It is also what a later reprocess of the document retains with.

A memory is re-consolidated only when the change moves the observation scopes it resolves to: its observations are deleted and it is queued again, along with co-source memories from other documents that shared those observations. A change that resolves to the same scopes (a tag change under `shared`, `combined` over one tag vs `[[that tag]]`, re-sending the current values) keeps every observation and queues nothing.

At least one field must be provided.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| document\_id<br>required | string (Document Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| tags | Array of Tags (strings) or Tags (null) (Tags) <br>The complete new set of tags for the document and its memory units — this REPLACES the existing tags rather than adding to them, so omitting a tag drops it and `[]` clears them all. Triggers observation invalidation and re-consolidation. |
| observation\_scopes | UpdateDocumentObservationScopes (string) or Array of UpdateDocumentObservationScopes (strings) or UpdateDocumentObservationScopes (null) (UpdateDocumentObservationScopes) <br>New observation scoping for the document's memories, with the same values retain accepts (send 'combined' to return to the default). Use it to move memories retained under one scoping to another — e.g. per-session documents to 'shared' — without re-extracting them. Memories whose resolved scopes change lose their observations and are re-consolidated; the rest keep theirs. Also becomes the scoping a later reprocess of the document uses. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success | boolean (Success) <br>Default: true |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/documents/{document\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents/{document\_id}

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"tags": ["team-a",\
\
"team-b"\
\
]

}`

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"success": true

}`

## [tag/Documents/operation/delete_document](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/delete_document) Delete a document

Delete a document and all its associated memory units and links.

This will cascade delete:

- The document itself
- All memory units extracted from this document
- All links (temporal, semantic, entity) associated with those memory units

This operation cannot be undone.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| document\_id<br>required | string (Document Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message<br>required | string (Message) |
| document\_id<br>required | string (Document Id) |
| memory\_units\_deleted<br>required | integer (Memory Units Deleted) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/documents/{document\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/documents/{document\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"document_id": "session_1",

"memory_units_deleted": 5,

"message": "Document 'session_1' and 5 associated memory units deleted successfully",

"success": true

}`

## [tag/Documents/operation/get_chunk](https://hindsight.vectorize.io/api-reference\#tag/Documents/operation/get_chunk) Get chunk details

Get a specific chunk by its ID

##### path Parameters

|     |     |
| --- | --- |
| chunk\_id<br>required | string (Chunk Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| chunk\_id<br>required | string (Chunk Id) |
| document\_id<br>required | string (Document Id) |
| bank\_id<br>required | string (Bank Id) |
| chunk\_index<br>required | integer (Chunk Index) |
| chunk\_text<br>required | string (Chunk Text) |
| created\_at<br>required | string (Created At) |
| attachments | Array of Attachments (objects) or Attachments (null) (Attachments) <br>Attachments referenced by this chunk's text, when it was retained with inline content. Each carries a bank-scoped `url` serving the original bytes. Omitted when there are none. |

**422**

Validation Error

get/v1/default/chunks/{chunk\_id}

https://hindsight.vectorize.io/v1/default/chunks/{chunk\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"bank_id": "user123",

"chunk_id": "user123_session_1_0",

"chunk_index": 0,

"chunk_text": "This is the first chunk of the document...",

"created_at": "2024-01-15T10:30:00Z",

"document_id": "session_1"

}`

## [tag/Operations](https://hindsight.vectorize.io/api-reference\#tag/Operations) Operations

## [tag/Operations/operation/list_operations](https://hindsight.vectorize.io/api-reference\#tag/Operations/operation/list_operations) List async operations

Get a list of async operations for a specific agent, with optional filtering by status and operation type. Results are sorted by most recent first.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| status | Status (string) or Status (null) (Status) <br>Filter by status: pending, processing, completed, failed, or cancelled |
| type | Type (string) or Type (null) (Type) <br>Filter by operation type: retain, consolidation, refresh\_mental\_model, file\_convert\_retain, webhook\_delivery |
| limit | integer (Limit)  \[ 1 .. 100 \] <br>Default: 20<br>Maximum number of operations to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Number of operations to skip |
| exclude\_parents | boolean (Exclude Parents) <br>Default: false<br>Exclude parent batch operations from results |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |
| operations<br>required | Array of objects (Operations) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/operations

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/operations

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "user123",

"limit": 20,

"offset": 0,

"operations": [{"created_at": "2024-01-15T10:30:00Z",\
\
"id": "550e8400-e29b-41d4-a716-446655440000",\
\
"items_count": 5,\
\
"status": "pending",\
\
"task_type": "retain"\
\
}\
\
],

"total": 150

}`

## [tag/Operations/operation/get_operation_status](https://hindsight.vectorize.io/api-reference\#tag/Operations/operation/get_operation_status) Get operation status

Get the status of a specific async operation. Returns 'pending', 'processing', 'completed', 'failed', or 'cancelled'. Completed operations remain queryable with their payload for the configured retention window and are pruned afterward.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| operation\_id<br>required | string (Operation Id) |

##### query Parameters

|     |     |
| --- | --- |
| include\_payload | boolean (Include Payload) <br>Default: false<br>Include the raw task payload (submission params) in the response. May be large. |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| operation\_id<br>required | string (Operation Id) |
| status<br>required | string (Status) <br>Enum:"pending""processing""completed""failed""cancelled""not\_found" |
| operation\_type | Operation Type (string) or Operation Type (null) (Operation Type) |
| id | Id (string) or Id (null) (Id) <br>Same as `operation_id`; the name the operations list uses. |
| task\_type | Task Type (string) or Task Type (null) (Task Type) <br>Same as `operation_type`; the name the operations list uses. |
| mental\_model\_id | Mental Model Id (string) or Mental Model Id (null) (Mental Model Id) <br>Mental model this operation acted on (refresh\_mental\_model); null for other task types. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |
| completed\_at | Completed At (string) or Completed At (null) (Completed At) |
| error\_message | Error Message (string) or Error Message (null) (Error Message) |
| retry\_count | Retry Count (integer) or Retry Count (null) (Retry Count) <br>Number of times this operation has been retried after failure. |
| next\_retry\_at | Next Retry At (string) or Next Retry At (null) (Next Retry At) <br>When the worker will next attempt this operation. For a pending operation, a value in the future indicates the task is parked — a refresh\_mental\_model held back by min\_refresh\_interval\_seconds, or an extension raising DeferOperation — rather than awaiting immediate pickup. |
| progress | OperationProgress (object) or null<br>Last-known progress snapshot for a running operation; null if none was recorded. |
| result\_metadata | Result Metadata (object) or Result Metadata (null) (Result Metadata) <br>Internal metadata for debugging. Structure may change without notice. Not for production use. |
| details | RefreshMentalModelOperationDetails (object) or null<br>Typed, per-operation-type outcome detail, discriminated by its own `operation_type`. Populated for `refresh_mental_model` operations that have finished; null for operation types that report no typed detail, for operations still in flight, and for operations recorded before this field existed. Unlike `result_metadata` this is a supported field — new operation types add their own shape here rather than flattening fields onto the operation. |
| child\_operations | Array of Child Operations (objects) or Child Operations (null) (Child Operations) <br>Child operations for batch operations (if applicable) |
| task\_payload | Task Payload (object) or Task Payload (null) (Task Payload) <br>Raw task payload (params the operation was submitted with). Only populated when include\_payload=true. |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/operations/{operation\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/operations/{operation\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"completed_at": "2024-01-15T10:31:30Z",

"created_at": "2024-01-15T10:30:00Z",

"operation_id": "550e8400-e29b-41d4-a716-446655440000",

"operation_type": "refresh_mental_model",

"status": "completed",

"updated_at": "2024-01-15T10:31:30Z"

}`

## [tag/Operations/operation/cancel_operation](https://hindsight.vectorize.io/api-reference\#tag/Operations/operation/cancel_operation) Cancel a pending or in-flight async operation

Cancel a queued or running async operation. A 'pending' operation is never started. A 'processing' one is cancelled cooperatively: the row is marked 'cancelled' immediately and the worker running it stops at its next checkpoint, so work already in flight may finish the batch it is on. This also clears operations stranded in 'processing' by a crashed worker. Returns 409 for operations that already reached a terminal state.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| operation\_id<br>required | string (Operation Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message<br>required | string (Message) |
| operation\_id<br>required | string (Operation Id) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/operations/{operation\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/operations/{operation\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"message": "Operation 550e8400-e29b-41d4-a716-446655440000 cancelled",

"operation_id": "550e8400-e29b-41d4-a716-446655440000",

"success": true

}`

## [tag/Operations/operation/retry_operation](https://hindsight.vectorize.io/api-reference\#tag/Operations/operation/retry_operation) Retry a failed async operation

Re-queue a failed async operation so the worker picks it up again

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| operation\_id<br>required | string (Operation Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message<br>required | string (Message) |
| operation\_id<br>required | string (Operation Id) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/operations/{operation\_id}/retry

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/operations/{operation\_id}/retry

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"message": "Operation 550e8400-e29b-41d4-a716-446655440000 queued for retry",

"operation_id": "550e8400-e29b-41d4-a716-446655440000",

"success": true

}`

## [tag/Operations/operation/delete_operation](https://hindsight.vectorize.io/api-reference\#tag/Operations/operation/delete_operation) Delete a terminal async operation

Permanently remove a failed, cancelled, or completed async operation record

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| operation\_id<br>required | string (Operation Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message<br>required | string (Message) |
| operation\_id<br>required | string (Operation Id) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/operations/{operation\_id}/delete

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/operations/{operation\_id}/delete

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"message": "Operation 550e8400-e29b-41d4-a716-446655440000 deleted",

"operation_id": "550e8400-e29b-41d4-a716-446655440000",

"success": true

}`

## [tag/Bank-Templates](https://hindsight.vectorize.io/api-reference\#tag/Bank-Templates) Bank Templates

## [tag/Bank-Templates/operation/import_bank_template](https://hindsight.vectorize.io/api-reference\#tag/Bank-Templates/operation/import_bank_template) Import bank template

Import a bank template manifest to create or update a bank's configuration, mental models, and directives. If the bank does not exist it is created. Config fields are applied as per-bank overrides. Mental models are matched by id, directives by name — existing ones are updated, new ones are created. Use dry\_run=true to validate the manifest without applying changes.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| dry\_run | boolean (Dry Run) <br>Default: false<br>Validate only, do not apply changes |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| version<br>required | string (Version) <br>Manifest schema version (currently '1') |
| bank | BankTemplateConfig (object) or null<br>Bank configuration to apply. Omit to leave config unchanged. |
| mental\_models | Array of Mental Models (objects) or Mental Models (null) (Mental Models) <br>Mental models to create or update (matched by id). Omit to leave unchanged. |
| directives | Array of Directives (objects) or Directives (null) (Directives) <br>Directives to create or update (matched by name). Omit to leave unchanged. |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) <br>Bank that was imported into |
| config\_applied<br>required | boolean (Config Applied) <br>Whether bank config was updated |
| mental\_models\_created | Array of strings (Mental Models Created) <br>Default: \[\]<br>IDs of newly created mental models |
| mental\_models\_updated | Array of strings (Mental Models Updated) <br>Default: \[\]<br>IDs of updated mental models |
| directives\_created | Array of strings (Directives Created) <br>Default: \[\]<br>Names of newly created directives |
| directives\_updated | Array of strings (Directives Updated) <br>Default: \[\]<br>Names of updated directives |
| operation\_ids | Array of strings (Operation Ids) <br>Default: \[\]<br>Operation IDs for mental model content generation (async) |
| dry\_run | boolean (Dry Run) <br>Default: false<br>True if this was a validation-only run |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/import

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/import

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"bank": {"disposition_empathy": 5,

"enable_observations": true,

"reflect_mission": "You are helping a support agent remember customer interactions.",

"retain_mission": "Extract customer issues, resolutions, and sentiment."

},

"directives": [{"content": "Always respond with empathy and understanding.",\
\
"name": "Always be empathetic",\
\
"priority": 10\
\
}\
\
],

"mental_models": [{"id": "sentiment-overview",\
\
"name": "Customer Sentiment Overview",\
\
"source_query": "What is the overall sentiment trend?",\
\
"trigger": {"refresh_after_consolidation": true\
\
}\
\
}\
\
],

"version": "1"

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"config_applied": true,

"mental_models_created": [ ],

"mental_models_updated": [ ],

"directives_created": [ ],

"directives_updated": [ ],

"operation_ids": [ ],

"dry_run": false

}`

## [tag/Bank-Templates/operation/export_bank_template](https://hindsight.vectorize.io/api-reference\#tag/Bank-Templates/operation/export_bank_template) Export bank template

Export a bank's current configuration, mental models, and directives as a template manifest. The exported manifest can be imported into another bank to replicate the setup.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| version<br>required | string (Version) <br>Manifest schema version (currently '1') |
| bank | BankTemplateConfig (object) or null<br>Bank configuration to apply. Omit to leave config unchanged. |
| mental\_models | Array of Mental Models (objects) or Mental Models (null) (Mental Models) <br>Mental models to create or update (matched by id). Omit to leave unchanged. |
| directives | Array of Directives (objects) or Directives (null) (Directives) <br>Directives to create or update (matched by name). Omit to leave unchanged. |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/export

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/export

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank": {"disposition_empathy": 5,

"enable_observations": true,

"reflect_mission": "You are helping a support agent remember customer interactions.",

"retain_mission": "Extract customer issues, resolutions, and sentiment."

},

"directives": [{"content": "Always respond with empathy and understanding.",\
\
"name": "Always be empathetic",\
\
"priority": 10\
\
}\
\
],

"mental_models": [{"id": "sentiment-overview",\
\
"name": "Customer Sentiment Overview",\
\
"source_query": "What is the overall sentiment trend?",\
\
"trigger": {"refresh_after_consolidation": true\
\
}\
\
}\
\
],

"version": "1"

}`

## [tag/Bank-Templates/operation/get_bank_template_schema](https://hindsight.vectorize.io/api-reference\#tag/Bank-Templates/operation/get_bank_template_schema) Get bank template JSON Schema

Returns the JSON Schema for the bank template manifest format. Use this to validate template manifests before importing.

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

get/v1/bank-template-schema

https://hindsight.vectorize.io/v1/bank-template-schema

### Response samples

- 200

Content type

application/json

Copy

`null`

## [tag/Document-Transfer](https://hindsight.vectorize.io/api-reference\#tag/Document-Transfer) Document Transfer

## [tag/Document-Transfer/operation/export_documents_sync_removed](https://hindsight.vectorize.io/api-reference\#tag/Document-Transfer/operation/export_documents_sync_removed) Export documents (removed — use POST .../document-transfer/export)  Deprecated

**Removed.** The synchronous whole-bank export loaded the entire bank into memory and held a database connection for the full request, which could exhaust memory and take down the shared API on large banks. Use the asynchronous POST /v1/default/banks/{bank\_id}/document-transfer/export instead: it returns an operation\_id, runs the export in the background, and exposes a download URL on completion.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

any

**422**

Validation Error

get/v1/default/banks/{bank\_id}/document-transfer

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/document-transfer

### Response samples

- 200
- 422

Content type

application/json

Copy

`null`

## [tag/Document-Transfer/operation/import_documents](https://hindsight.vectorize.io/api-reference\#tag/Document-Transfer/operation/import_documents) Import documents (async)  Deprecated

Submit a transfer archive (produced by the export endpoint) for import into a bank. Runs as a background operation: facts are re-embedded with the target bank's embedding model and entities are re-resolved — no LLM extraction. Returns an operation\_id; poll GET /v1/default/banks/{bank\_id}/operations/{operation\_id} for status and the imported/skipped counts in result\_metadata. Use on\_conflict to control existing document ids: skip (default), replace, or new-id.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| on\_conflict | string (On Conflict) <br>Default: "skip"<br>skip \| replace \| new-id |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: multipart/form-data  required

|     |     |
| --- | --- |
| file<br>required | string <binary>  (File) <br>Transfer ZIP archive |

### Responses

**202**

Successful Response

**422**

Validation Error

post/v1/default/banks/{bank\_id}/document-transfer

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/document-transfer

### Response samples

- 202
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"status": "pending"

}`

## [tag/Document-Transfer/operation/export_documents](https://hindsight.vectorize.io/api-reference\#tag/Document-Transfer/operation/export_documents) Export documents (async)  Deprecated

Submit an async export of a bank's documents (extracted facts, entity names, causal links, chunks) as a transfer ZIP archive. Embeddings and database ids are not included — importing re-embeds with the target bank's model and re-resolves entities. Runs as a background operation to avoid pinning the API on large banks. Returns an operation\_id; poll GET /v1/default/banks/{bank\_id}/operations/{operation\_id}. On completion the operation's result\_metadata carries download\_url (fetch the ZIP from GET /v1/default/files/download/{key}), storage\_key, byte\_size, and filename. Pass document\_id query params to export specific documents, or omit to export the whole bank; include\_observations=true carries consolidated observations and include\_knowledge\_base=true carries Mental Models plus Knowledge Pages (all whole-bank export only).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| document\_id | Array of Document Id (strings) or Document Id (null) (Document Id) <br>Document id(s) to export; omit for all |
| include\_observations | boolean (Include Observations) <br>Default: false<br>Also export consolidated observations (restored on import; whole-bank only) |
| include\_knowledge\_base | boolean (Include Knowledge Base) <br>Default: false<br>Also export Mental Models and Knowledge Pages (restored on import; whole-bank only) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**202**

Successful Response

**422**

Validation Error

post/v1/default/banks/{bank\_id}/document-transfer/export

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/document-transfer/export

### Response samples

- 202
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"status": "pending"

}`

## [tag/Document-Transfer/operation/download_file](https://hindsight.vectorize.io/api-reference\#tag/Document-Transfer/operation/download_file) Download a stored file (async export archive)

Stream a file previously written to file storage — currently the transfer ZIP produced by an async document export. The key comes from the export operation's result\_metadata (storage\_key / download\_url). Access is authorized against the bank the key belongs to.

##### path Parameters

|     |     |
| --- | --- |
| key<br>required | string (Key) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Stored file

##### Response Schema: application/zip

string <binary>

**422**

Validation Error

get/v1/default/files/download/{key}

https://hindsight.vectorize.io/v1/default/files/download/{key}

### Response samples

- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"detail": [{"loc": ["string"\
\
],\
\
"msg": "string",\
\
"type": "string",\
\
"input": null,\
\
"ctx": { }\
\
}\
\
]

}`

## [tag/Bank-Transfer](https://hindsight.vectorize.io/api-reference\#tag/Bank-Transfer) Bank Transfer

## [tag/Bank-Transfer/operation/export_bank_transfer](https://hindsight.vectorize.io/api-reference\#tag/Bank-Transfer/operation/export_bank_transfer) Export a bank (async)

Submit an async export of a bank as a transfer ZIP archive. Three flags choose what the archive carries: include\_data (documents, facts, observations, attachments and their bytes, the curation archive, the operations log and the maintenance queues), include\_bank\_config (bank config, mental models and their history, knowledge pages), include\_bank\_config (the bank's config overrides, directives and webhooks) and include\_history (audit\_log, llm\_requests). Embeddings and database ids are never carried — importing re-embeds with the target bank's model and re-resolves entities, so an archive moves between instances configured with different embedding models. Returns an operation\_id; poll GET /v1/default/banks/{bank\_id}/operations/{operation\_id}, then fetch the archive from the download\_url in its result\_metadata. Pass document\_id to export specific documents instead of the whole bank (a document subset carries no bank-level sections).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| include\_data | boolean (Include Data) <br>Default: true<br>Carry the memories and everything backing them |
| include\_bank\_config | boolean (Include Bank Config) <br>Default: true<br>Carry the bank's config overrides, directives and webhooks |
| include\_history | boolean (Include History) <br>Default: false<br>Carry audit\_log and llm\_requests |
| document\_id | Array of Document Id (strings) or Document Id (null) (Document Id) <br>Document id(s); omit for the whole bank |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**202**

Successful Response

**404**

The bank does not exist.

**422**

Validation Error

post/v1/default/banks/{bank\_id}/transfer/export

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/transfer/export

### Response samples

- 202
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"status": "pending"

}`

## [tag/Bank-Transfer/operation/import_bank_transfer](https://hindsight.vectorize.io/api-reference\#tag/Bank-Transfer/operation/import_bank_transfer) Import a bank (async)

Submit a transfer archive (produced by the export endpoint) for import. Runs as a background operation: facts are re-embedded with the target bank's embedding model and entities are re-resolved — no LLM extraction, so the import costs no tokens and invents no new facts.

Two modes. `restore` (default) writes a whole bank into target\_bank\_id, which must NOT already exist — it restores a bank rather than merging into one, and is how a bank is moved between instances or copied under a new id. `merge` folds an archive's documents into this bank, with document\_conflict deciding what happens to ids that already exist (skip, replace, new-id).

The include flags narrow what is restored to a subset of what the archive holds; they cannot add what the producer did not export. Returns an operation\_id; poll GET /v1/default/banks/{bank\_id}/operations/{operation\_id} for status and per-component counts. The operation is recorded against {bank\_id} even in restore mode, because the target bank does not exist yet.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| mode | string (Mode) <br>Default: "restore"<br>restore (into a fresh bank) \| merge (into this bank) |
| target\_bank\_id | Target Bank Id (string) or Target Bank Id (null) (Target Bank Id) <br>restore mode: the bank to create; defaults to the archive's source bank |
| document\_conflict | string (Document Conflict) <br>Default: "skip"<br>merge mode: skip \| replace \| new-id |
| include\_data | Include Data (boolean) or Include Data (null) (Include Data) <br>restore mode: carry the memories and everything backing them (default true) |
| include\_bank\_config | Include Bank Config (boolean) or Include Bank Config (null) (Include Bank Config) <br>restore mode: restore the bank's config overrides, directives and webhooks (default true) |
| include\_history | Include History (boolean) or Include History (null) (Include History) <br>restore mode: carry audit\_log and llm\_requests (default false) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: multipart/form-data  required

|     |     |
| --- | --- |
| file<br>required | string <binary>  (File) <br>Transfer ZIP archive |

### Responses

**202**

Successful Response

**422**

Validation Error

post/v1/default/banks/{bank\_id}/transfer/import

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/transfer/import

### Response samples

- 202
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"status": "pending"

}`

## [tag/Bank-Transfer/operation/clone_bank](https://hindsight.vectorize.io/api-reference\#tag/Bank-Transfer/operation/clone_bank) Clone a bank (async)

Copy this bank into a new one, in a single call. The clone starts with the source's memories as they are at clone time and evolves independently from then on: later retains, consolidation and edits on either bank leave the other alone.

This is the export and import above run back to back on this instance, so nothing is re-extracted and no LLM is called — facts are re-embedded and entities re-resolved, exactly as a restore does. The same three flags choose what the clone inherits: include\_data (documents, facts, observations, attachments, the curation archive, the operations log, and the mental models and knowledge pages synthesized from them), include\_bank\_config (the bank's config overrides, directives and **webhooks**) and include\_history (audit\_log, llm\_requests).

Note the webhooks: they travel with the bank's configuration, so a clone made with the default flags will call the source's webhook endpoints. Pass include\_bank\_config=false, or delete them on the clone, when they point at a per-bank consumer.

target\_bank\_id must not already exist. Returns an operation\_id, recorded against the source bank (the target does not exist yet); poll GET /v1/default/banks/{bank\_id}/operations/{operation\_id} for status and the per-component counts.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| target\_bank\_id<br>required | string (Target Bank Id) <br>Bank to create; must not already exist |
| include\_data | boolean (Include Data) <br>Default: true<br>Copy the memories, what backs them, and the mental models and knowledge pages synthesized from them |
| include\_bank\_config | boolean (Include Bank Config) <br>Default: true<br>Copy the bank's config overrides, directives and webhooks |
| include\_history | boolean (Include History) <br>Default: false<br>Copy audit\_log and llm\_requests |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**202**

Successful Response

**404**

The bank does not exist.

**422**

Validation Error

post/v1/default/banks/{bank\_id}/clone

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/clone

### Response samples

- 202
- 422

Content type

application/json

Copy

`{"operation_id": "string",

"status": "pending"

}`

## [tag/Webhooks](https://hindsight.vectorize.io/api-reference\#tag/Webhooks) Webhooks

## [tag/Webhooks/operation/create_webhook](https://hindsight.vectorize.io/api-reference\#tag/Webhooks/operation/create_webhook) Register webhook

Register a webhook endpoint to receive event notifications for this bank.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| url<br>required | string (Url) <br>HTTP(S) endpoint URL to deliver events to |
| secret | Secret (string) or Secret (null) (Secret) <br>HMAC-SHA256 signing secret (optional) |
| event\_types | Array of strings (Event Types) <br>Default: \["consolidation.completed"\]<br>List of event types to deliver. Supported: 'retain.completed', 'consolidation.completed', 'memory\_defense.triggered'. |
| enabled | boolean (Enabled) <br>Default: true<br>Whether this webhook is active |
| http\_config | object (WebhookHttpConfig) <br>HTTP delivery configuration (method, timeout, headers, params) |

### Responses

**201**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | Bank Id (string) or Bank Id (null) (Bank Id) |
| url<br>required | string (Url) |
| secret | Secret (string) or Secret (null) (Secret) <br>Signing secret (redacted in responses) |
| event\_types<br>required | Array of strings (Event Types) |
| enabled<br>required | boolean (Enabled) |
| http\_config | object (WebhookHttpConfig) <br>HTTP delivery configuration for a webhook. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/webhooks

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/webhooks

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"url": "string",

"secret": "string",

"event_types": ["consolidation.completed"\
\
],

"enabled": true,

"http_config": {"method": "POST",

"timeout_seconds": 30,

"headers": {"property1": "string",

"property2": "string"

},

"params": {"property1": "string",

"property2": "string"

}

}

}`

### Response samples

- 201
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"url": "string",

"secret": "string",

"event_types": ["string"\
\
],

"enabled": true,

"http_config": {"method": "POST",

"timeout_seconds": 30,

"headers": {"property1": "string",

"property2": "string"

},

"params": {"property1": "string",

"property2": "string"

}

},

"created_at": "string",

"updated_at": "string"

}`

## [tag/Webhooks/operation/list_webhooks](https://hindsight.vectorize.io/api-reference\#tag/Webhooks/operation/list_webhooks) List webhooks

List the webhooks registered for a bank, oldest first. Paged: `total` reports every webhook on the bank.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  \[ 0 .. 1000 \] <br>Default: 100<br>Maximum number of webhooks to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| total<br>required | integer (Total) <br>Total number of webhooks on the bank (ignores limit/offset) |
| limit<br>required | integer (Limit) <br>Maximum number of webhooks returned in this page |
| offset<br>required | integer (Offset) <br>Offset this page started at |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/webhooks

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/webhooks

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"id": "string",\
\
"bank_id": "string",\
\
"url": "string",\
\
"secret": "string",\
\
"event_types": ["string"\
\
],\
\
"enabled": true,\
\
"http_config": {"method": "POST",\
\
"timeout_seconds": 30,\
\
"headers": {"property1": "string",\
\
"property2": "string"\
\
},\
\
"params": {"property1": "string",\
\
"property2": "string"\
\
}\
\
},\
\
"created_at": "string",\
\
"updated_at": "string"\
\
}\
\
],

"total": 0,

"limit": 0,

"offset": 0

}`

## [tag/Webhooks/operation/delete_webhook](https://hindsight.vectorize.io/api-reference\#tag/Webhooks/operation/delete_webhook) Delete webhook

Remove a registered webhook.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| webhook\_id<br>required | string (Webhook Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| success<br>required | boolean (Success) |
| message | Message (string) or Message (null) (Message) |
| deleted\_count | Deleted Count (integer) or Deleted Count (null) (Deleted Count) |

**422**

Validation Error

delete/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}

### Response samples

- 200
- 422

Content type

application/json

Copy

`{"deleted_count": 10,

"message": "Deleted successfully",

"success": true

}`

## [tag/Webhooks/operation/update_webhook](https://hindsight.vectorize.io/api-reference\#tag/Webhooks/operation/update_webhook) Update webhook

Update one or more fields of a registered webhook. Only provided fields are changed.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| webhook\_id<br>required | string (Webhook Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: application/json  required

|     |     |
| --- | --- |
| url | Url (string) or Url (null) (Url) <br>HTTP(S) endpoint URL |
| secret | Secret (string) or Secret (null) (Secret) <br>HMAC-SHA256 signing secret. Omit to keep existing; send null to clear. |
| event\_types | Array of Event Types (strings) or Event Types (null) (Event Types) <br>List of event types |
| enabled | Enabled (boolean) or Enabled (null) (Enabled) <br>Whether this webhook is active |
| http\_config | WebhookHttpConfig (object) or null<br>HTTP delivery configuration |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| id<br>required | string (Id) |
| bank\_id<br>required | Bank Id (string) or Bank Id (null) (Bank Id) |
| url<br>required | string (Url) |
| secret | Secret (string) or Secret (null) (Secret) <br>Signing secret (redacted in responses) |
| event\_types<br>required | Array of strings (Event Types) |
| enabled<br>required | boolean (Enabled) |
| http\_config | object (WebhookHttpConfig) <br>HTTP delivery configuration for a webhook. |
| created\_at | Created At (string) or Created At (null) (Created At) |
| updated\_at | Updated At (string) or Updated At (null) (Updated At) |

**422**

Validation Error

patch/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}

### Request samples

- Payload

Content type

application/json

Copy
Expand all  Collapse all

`{"url": "string",

"secret": "string",

"event_types": ["string"\
\
],

"enabled": true,

"http_config": {"method": "POST",

"timeout_seconds": 30,

"headers": {"property1": "string",

"property2": "string"

},

"params": {"property1": "string",

"property2": "string"

}

}

}`

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"id": "string",

"bank_id": "string",

"url": "string",

"secret": "string",

"event_types": ["string"\
\
],

"enabled": true,

"http_config": {"method": "POST",

"timeout_seconds": 30,

"headers": {"property1": "string",

"property2": "string"

},

"params": {"property1": "string",

"property2": "string"

}

},

"created_at": "string",

"updated_at": "string"

}`

## [tag/Webhooks/operation/list_webhook_deliveries](https://hindsight.vectorize.io/api-reference\#tag/Webhooks/operation/list_webhook_deliveries) List webhook deliveries

Inspect delivery history for a webhook (useful for debugging).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| webhook\_id<br>required | string (Webhook Id) |

##### query Parameters

|     |     |
| --- | --- |
| limit | integer (Limit)  <= 200 <br>Default: 50<br>Maximum number of deliveries to return |
| cursor | Cursor (string) or Cursor (null) (Cursor) <br>Pagination cursor (created\_at of last item) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| items<br>required | Array of objects (Items) |
| next\_cursor | Next Cursor (string) or Next Cursor (null) (Next Cursor) |

**422**

Validation Error

get/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}/deliveries

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/webhooks/{webhook\_id}/deliveries

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"items": [{"id": "string",\
\
"event_id": "string",\
\
"webhook_id": "string",\
\
"url": "string",\
\
"event_type": "string",\
\
"status": "string",\
\
"attempts": 0,\
\
"next_retry_at": "string",\
\
"last_error": "string",\
\
"last_response_status": 0,\
\
"last_response_body": "string",\
\
"last_attempt_at": "string",\
\
"created_at": "string",\
\
"updated_at": "string"\
\
}\
\
],

"next_cursor": "string"

}`

## [tag/Files](https://hindsight.vectorize.io/api-reference\#tag/Files) Files

## [tag/Files/operation/file_retain](https://hindsight.vectorize.io/api-reference\#tag/Files/operation/file_retain) Convert files to memories

Upload files (PDF, DOCX, etc.), convert them to markdown, and retain as memories.

This endpoint handles file upload, conversion, and memory creation in a single operation.

**Features:**

- Supports PDF, DOCX, PPTX, XLSX, images (parser-dependent OCR), audio (with transcription)
- Automatic file-to-markdown conversion using pluggable parsers
- Files stored in object storage (PostgreSQL by default, S3 for production)
- Each file becomes a separate document with optional metadata/tags
- Always processes asynchronously — returns operation IDs immediately

**The system automatically:**

1. Stores uploaded files in object storage
2. Converts files to markdown
3. Creates document records with file metadata
4. Extracts facts and creates memory units (same as regular retain)

Use the operations endpoint to monitor progress.

**Request format:** multipart/form-data with:

- `files`: One or more files to upload
- `request`: JSON string with FileRetainRequest model

**Parser selection:**

- Set `parser` in the request body to override the server default for all files.
- Set `parser` inside a `files_metadata` entry for per-file control.
- Pass a list (e.g. `['iris', 'markitdown']`) to define an ordered fallback chain — each parser is tried in sequence until one succeeds.
- Falls back to the server default (`HINDSIGHT_API_FILE_PARSER`) if not specified.
- Only parsers enabled on the server may be requested; others return HTTP 400.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

##### Request Body schema: multipart/form-data  required

|     |     |
| --- | --- |
| files<br>required | Array of strings <binary>  (Files) \[ items <binary > \]<br>Files to upload and convert |
| request<br>required | string (Request) <br>JSON string with FileRetainRequest model |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| operation\_ids<br>required | Array of strings (Operation Ids) <br>Operation IDs for tracking file conversion operations. Use GET /v1/default/banks/{bank\_id}/operations to list operations. |

**422**

Validation Error

post/v1/default/banks/{bank\_id}/files/retain

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/files/retain

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"operation_ids": ["550e8400-e29b-41d4-a716-446655440000",\
\
"550e8400-e29b-41d4-a716-446655440001",\
\
"550e8400-e29b-41d4-a716-446655440002"\
\
]

}`

## [tag/Audit](https://hindsight.vectorize.io/api-reference\#tag/Audit) Audit

## [tag/Audit/operation/list_audit_logs](https://hindsight.vectorize.io/api-reference\#tag/Audit/operation/list_audit_logs) List audit logs

List audit log entries for a bank, ordered by most recent first.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| action | Action (string) or Action (null) (Action) <br>Filter by action type |
| transport | Transport (string) or Transport (null) (Transport) <br>Filter by transport (http, mcp, system) |
| start\_date | Start Date (string) or Start Date (null) (Start Date) <br>Filter from this ISO datetime (inclusive) |
| end\_date | End Date (string) or End Date (null) (End Date) <br>Filter until this ISO datetime (exclusive) |
| limit | integer (Limit)  \[ 1 .. 500 \] <br>Default: 50<br>Max items to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |
| items<br>required | Array of objects (Items) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/audit-logs

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/audit-logs

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"total": 0,

"limit": 0,

"offset": 0,

"items": [{"id": "string",\
\
"action": "string",\
\
"transport": "string",\
\
"bank_id": "string",\
\
"started_at": "string",\
\
"ended_at": "string",\
\
"duration_ms": 0,\
\
"request": { },\
\
"response": { },\
\
"metadata": { }\
\
}\
\
]

}`

## [tag/Audit/operation/audit_log_stats](https://hindsight.vectorize.io/api-reference\#tag/Audit/operation/audit_log_stats) Audit log statistics

Get audit log counts grouped by time bucket for charting.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| action | Action (string) or Action (null) (Action) <br>Filter by action type |
| period | string (Period) <br>Default: "7d"<br>Time period: 1d, 7d, or 30d |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| period<br>required | string (Period) |
| trunc<br>required | string (Trunc) |
| start<br>required | string (Start) |
| buckets<br>required | Array of objects (Buckets) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/audit-logs/stats

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/audit-logs/stats

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"period": "string",

"trunc": "string",

"start": "string",

"buckets": [{"time": "string",\
\
"actions": {"property1": 0,\
\
"property2": 0\
\
},\
\
"total": 0\
\
}\
\
]

}`

## [tag/LLM-Traces](https://hindsight.vectorize.io/api-reference\#tag/LLM-Traces) LLM Traces

## [tag/LLM-Traces/operation/list_llm_requests](https://hindsight.vectorize.io/api-reference\#tag/LLM-Traces/operation/list_llm_requests) List LLM request traces

List traced LLM requests for a bank, ordered by most recent first. Requires LLM request tracing to be enabled (HINDSIGHT\_API\_LLM\_TRACE\_ENABLED).

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| status | Status (string) or Status (null) (Status) <br>Filter by status (success, error) |
| operation | Operation (string) or Operation (null) (Operation) <br>Filter by operation (retain, reflect, consolidation) |
| scope | Scope (string) or Scope (null) (Scope) <br>Filter by call scope |
| provider | Provider (string) or Provider (null) (Provider) <br>Filter by LLM provider |
| trace\_id | Trace Id (string) or Trace Id (null) (Trace Id) <br>Filter to one operation run (all LLM calls sharing a trace) |
| document\_id | Document Id (string) or Document Id (null) (Document Id) <br>Filter to LLM calls that processed a given document |
| memory\_id | Memory Id (string) or Memory Id (null) (Memory Id) <br>Filter to the operation run(s) that produced or consumed a given memory\_unit |
| group | boolean (Group) <br>Default: false<br>Paginate by operation run (trace) instead of by call; returns whole runs |
| start\_date | Start Date (string) or Start Date (null) (Start Date) <br>Filter from this ISO datetime (inclusive) |
| end\_date | End Date (string) or End Date (null) (End Date) <br>Filter until this ISO datetime (exclusive) |
| limit | integer (Limit)  \[ 1 .. 500 \] <br>Default: 50<br>Max items to return |
| offset | integer (Offset)  >= 0 <br>Default: 0<br>Offset for pagination |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| total<br>required | integer (Total) |
| limit<br>required | integer (Limit) |
| offset<br>required | integer (Offset) |
| items<br>required | Array of objects (Items) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/llm-requests

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/llm-requests

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"total": 0,

"limit": 0,

"offset": 0,

"items": [{"id": "string",\
\
"bank_id": "string",\
\
"operation": "string",\
\
"scope": "string",\
\
"trace_id": "string",\
\
"span_id": "string",\
\
"parent_span_id": "string",\
\
"provider": "string",\
\
"model": "string",\
\
"status": "string",\
\
"started_at": "string",\
\
"ended_at": "string",\
\
"duration_ms": 0,\
\
"input_tokens": 0,\
\
"output_tokens": 0,\
\
"cached_tokens": 0,\
\
"thoughts_tokens": 0,\
\
"total_tokens": 0,\
\
"input": null,\
\
"output": null,\
\
"error": "string",\
\
"llm_info": { },\
\
"metadata": { }\
\
}\
\
]

}`

## [tag/LLM-Traces/operation/llm_request_stats](https://hindsight.vectorize.io/api-reference\#tag/LLM-Traces/operation/llm_request_stats) LLM request statistics

Get LLM request counts grouped by time bucket and status for charting.

##### path Parameters

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |

##### query Parameters

|     |     |
| --- | --- |
| operation | Operation (string) or Operation (null) (Operation) <br>Filter by operation |
| period | string (Period) <br>Default: "7d"<br>Time period: 1d, 7d, or 30d |

##### header Parameters

|     |     |
| --- | --- |
| authorization | Authorization (string) or Authorization (null) (Authorization) |

### Responses

**200**

Successful Response

##### Response Schema: application/json

|     |     |
| --- | --- |
| bank\_id<br>required | string (Bank Id) |
| period<br>required | string (Period) |
| trunc<br>required | string (Trunc) |
| start<br>required | string (Start) |
| buckets<br>required | Array of objects (Buckets) |

**404**

The bank does not exist.

**422**

Validation Error

get/v1/default/banks/{bank\_id}/llm-requests/stats

https://hindsight.vectorize.io/v1/default/banks/{bank\_id}/llm-requests/stats

### Response samples

- 200
- 422

Content type

application/json

Copy
Expand all  Collapse all

`{"bank_id": "string",

"period": "string",

"trunc": "string",

"start": "string",

"buckets": [{"time": "string",\
\
"statuses": {"property1": 0,\
\
"property2": 0\
\
},\
\
"total": 0,\
\
"tokens": {"input": 0,\
\
"output": 0,\
\
"cached": 0,\
\
"thoughts": 0,\
\
"total": 0\
\
}\
\
}\
\
]

}`
