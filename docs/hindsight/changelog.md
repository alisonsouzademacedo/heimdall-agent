<!-- source: https://hindsight.vectorize.io/changelog -->
[Skip to main content](https://hindsight.vectorize.io/changelog#__docusaurus_skipToContent_fallback)

New: **Introducing Hindsight Memlake**, serving 100M memories at <100ms p99 on object storage. [Read the post →](https://hindsight.vectorize.io/blog/2026/10/13/memlake)

# Changelog

User-facing changes only. Internal maintenance and infrastructure updates are omitted.

This page covers the Hindsight core (API, CLI, control plane). Each integration is released on its own
cadence and has its own changelog — find it on the [integration's page](https://hindsight.vectorize.io/integrations).

## [1.0.0](https://github.com/vectorize-io/hindsight/releases/tag/v1.0.0) [​](https://hindsight.vectorize.io/changelog\#100 "Direct link to 100")

**Breaking Changes**

- Reject tag-scoped API callers from operations that return data for an entire memory bank.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [8caa10968](https://github.com/vectorize-io/hindsight/commit/8caa10968)

**Improvements**

- Expose consistent provider tracing data for memory operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [504ef0ac0](https://github.com/vectorize-io/hindsight/commit/504ef0ac0)

**Bug Fixes**

- Return 503 with Retry-After when the memory store is temporarily unavailable instead of reporting an internal error.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [62242b06e](https://github.com/vectorize-io/hindsight/commit/62242b06e)
- Correctly handle retain requests whose prose indicates that no facts should be stored.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [504ef0ac0](https://github.com/vectorize-io/hindsight/commit/504ef0ac0)
- Preserve JSON-array appends to newly created documents as a single array.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3abbc6068](https://github.com/vectorize-io/hindsight/commit/3abbc6068)
- Make the CLI and generated clients compatible with newly returned API fields and documented enum values.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c6d3ff11f](https://github.com/vectorize-io/hindsight/commit/c6d3ff11f)
- Prevent CLI exports from polling indefinitely when an export does not complete.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c6d3ff11f](https://github.com/vectorize-io/hindsight/commit/c6d3ff11f)
- Fix the control-plane entity-label editor so it can be built and used successfully.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [db3aa5322](https://github.com/vectorize-io/hindsight/commit/db3aa5322)
- Hide the inactive add-field control at the root of entity-label configuration.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [efc1f326d](https://github.com/vectorize-io/hindsight/commit/efc1f326d)

## [0.10.3](https://github.com/vectorize-io/hindsight/releases/tag/v0.10.3) [​](https://hindsight.vectorize.io/changelog\#0103 "Direct link to 0103")

**Breaking Changes**

- Removed ineffective worker --max-retries and --log-level command-line flags.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [4738d431f](https://github.com/vectorize-io/hindsight/commit/4738d431f)

**Features**

- Added configuration for the database connection-pool slow-acquire warning threshold.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9dff2a38d](https://github.com/vectorize-io/hindsight/commit/9dff2a38d)
- Added a configurable per-candidate token limit for reranking across providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b3b62e0a6](https://github.com/vectorize-io/hindsight/commit/b3b62e0a6)
- Add an option for OpenAI-compatible providers that do not support JSON-object response mode.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4f8fb49bb](https://github.com/vectorize-io/hindsight/commit/4f8fb49bb)
- Add an opt-in storage-backend label to operation and recall-phase metrics.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f7dd3f4fd](https://github.com/vectorize-io/hindsight/commit/f7dd3f4fd)
- Shared banks now support per-caller tag scopes for controlled reading and writing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [09e5dc23a](https://github.com/vectorize-io/hindsight/commit/09e5dc23a)
- Entity list, detail, and graph views can now be filtered by tags.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b0219dfd2](https://github.com/vectorize-io/hindsight/commit/b0219dfd2)
- Knowledge-base tree browsing and search can now be filtered by tags.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bc2af4c6f](https://github.com/vectorize-io/hindsight/commit/bc2af4c6f)

**Improvements**

- Workers begin claiming work immediately after restart while recovery continues in the background.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a77c1f341](https://github.com/vectorize-io/hindsight/commit/a77c1f341)
- Overlong recall queries are truncated to the supported limit instead of returning HTTP 400.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5f6392da8](https://github.com/vectorize-io/hindsight/commit/5f6392da8)
- Label HTTP metrics by stable route templates for clearer operational monitoring.· [![@kubaodias](https://github.com/kubaodias.png?size=40)@kubaodias](https://github.com/kubaodias)· [fd80305ba](https://github.com/vectorize-io/hindsight/commit/fd80305ba)
- Speed up document imports and allow interrupted bank imports to resume cleanly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1a378af8f](https://github.com/vectorize-io/hindsight/commit/1a378af8f)
- Python client file preparation no longer blocks application async event loops.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [f3391545d](https://github.com/vectorize-io/hindsight/commit/f3391545d)

**Bug Fixes**

- Fixed Oracle timestamps to consistently use UTC.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9db878b8e](https://github.com/vectorize-io/hindsight/commit/9db878b8e)
- Store requests now return 404 when a bank was deleted by another process, even while cached.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [31fc17cb2](https://github.com/vectorize-io/hindsight/commit/31fc17cb2)
- Worker append races are deferred for retry instead of failing lost writes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ca4da5f36](https://github.com/vectorize-io/hindsight/commit/ca4da5f36)
- Consolidation now reads all sources from a response together before applying its changes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fb11ddfea](https://github.com/vectorize-io/hindsight/commit/fb11ddfea)
- Consolidation applies each response's writes atomically and prepares its actions concurrently.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ddc660bb9](https://github.com/vectorize-io/hindsight/commit/ddc660bb9)
- Control-plane recall responses now include source facts and truncation metadata.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6a9fa03a1](https://github.com/vectorize-io/hindsight/commit/6a9fa03a1)
- Missing API keys during alias resolution no longer produce misleading traceback warnings.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5e344e18b](https://github.com/vectorize-io/hindsight/commit/5e344e18b)
- Retain retries now tell the model which keys were incorrect so it can correct them.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dc3093fc6](https://github.com/vectorize-io/hindsight/commit/dc3093fc6)
- Template re-imports no longer rewrite unchanged mental models or directives.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b8483e42c](https://github.com/vectorize-io/hindsight/commit/b8483e42c)
- Structured-output schemas now remove numeric bounds for compatibility across all LLM providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7808a4445](https://github.com/vectorize-io/hindsight/commit/7808a4445)
- Knowledge-page refreshes continue after temporary provider failures instead of remaining paused.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [169ddaa22](https://github.com/vectorize-io/hindsight/commit/169ddaa22)
- Entity matching no longer runs trigram probes below the configured merge threshold.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5716c3ff1](https://github.com/vectorize-io/hindsight/commit/5716c3ff1)
- Reflection tolerates malformed Qwen completion calls and prevents delta refreshes from overwriting batch synthesis.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ea5ab3034](https://github.com/vectorize-io/hindsight/commit/ea5ab3034)
- Store-owned appends now verify the document content hash before writing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8facc90ec](https://github.com/vectorize-io/hindsight/commit/8facc90ec)
- Cancelling a chunked retain request now cancels its in-flight sub-batches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b5ec06b6c](https://github.com/vectorize-io/hindsight/commit/b5ec06b6c)
- Workers retry final status updates inline and exit cleanly if the database remains unavailable.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [76188c73a](https://github.com/vectorize-io/hindsight/commit/76188c73a)
- Retain reports processed content-token counts correctly for oversized re-retains.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [7e7427b6f](https://github.com/vectorize-io/hindsight/commit/7e7427b6f)
- GCS download URLs now work for object keys containing percent characters.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [2a3c55aac](https://github.com/vectorize-io/hindsight/commit/2a3c55aac)
- Synchronous retain requests are cancelled when their client disconnects.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e6f101bd5](https://github.com/vectorize-io/hindsight/commit/e6f101bd5)
- Consolidation pins cited source facts to their batch and reports actions with no citations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3adc7eba7](https://github.com/vectorize-io/hindsight/commit/3adc7eba7)
- OpenRouter structured-output requests now use only upstream models that support response-format responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f1783fae7](https://github.com/vectorize-io/hindsight/commit/f1783fae7)
- Document imports into existing banks now enforce bank-write validation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5088396de](https://github.com/vectorize-io/hindsight/commit/5088396de)
- Reflection replaces memory IDs that were not available to the model in answers and knowledge pages.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b13031b0a](https://github.com/vectorize-io/hindsight/commit/b13031b0a)
- Recall results retain their post-rerank temporal boost instead of decaying it by rank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8830bbb3b](https://github.com/vectorize-io/hindsight/commit/8830bbb3b)
- Reflection omits temperature from structured extraction requests when temperature is disabled.· [![@SebastianThiebaud](https://github.com/SebastianThiebaud.png?size=40)@SebastianThiebaud](https://github.com/SebastianThiebaud)· [8cca87e69](https://github.com/vectorize-io/hindsight/commit/8cca87e69)
- Embed CLI commands now use the resolved profile configuration.· [![@Mar-garet](https://github.com/Mar-garet.png?size=40)@Mar-garet](https://github.com/Mar-garet)· [369540e02](https://github.com/vectorize-io/hindsight/commit/369540e02)
- CLI error responses now preserve the server's HTTP status when diagnostics are present.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [2ff1c01a0](https://github.com/vectorize-io/hindsight/commit/2ff1c01a0)
- Stopping the npm daemon now preserves the caller's environment.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [26be36386](https://github.com/vectorize-io/hindsight/commit/26be36386)
- Healthy worker batches no longer perform unnecessary per-parent startup recovery.· [![@BrianMcBrayer](https://github.com/BrianMcBrayer.png?size=40)@BrianMcBrayer](https://github.com/BrianMcBrayer)· [4b995c547](https://github.com/vectorize-io/hindsight/commit/4b995c547)
- Reflection still performs its required recall step when the context is full.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cc755b5cc](https://github.com/vectorize-io/hindsight/commit/cc755b5cc)
- Windows embed daemon launchers no longer open unwanted terminal windows.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d6d43c5a2](https://github.com/vectorize-io/hindsight/commit/d6d43c5a2)
- Oracle now handles large text and byte values without ORA-01461 errors.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [cc06cb5fc](https://github.com/vectorize-io/hindsight/commit/cc06cb5fc)
- Retry interrupted TEI inference responses to improve embedding reliability.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [78e69543d](https://github.com/vectorize-io/hindsight/commit/78e69543d)
- Fix Oracle filtering by result metadata.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [7102a5acb](https://github.com/vectorize-io/hindsight/commit/7102a5acb)
- Use Cohere's query embedding mode for memory recall searches.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [06eccac17](https://github.com/vectorize-io/hindsight/commit/06eccac17)
- Preserve single-retain strategy and scope settings in the Python client.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [c5b3fa3ca](https://github.com/vectorize-io/hindsight/commit/c5b3fa3ca)
- Clarify recall token limits and return more compact JSON from the MCP interface.· [![@JayOfTheKeyboard](https://github.com/JayOfTheKeyboard.png?size=40)@JayOfTheKeyboard](https://github.com/JayOfTheKeyboard)· [1a61579a6](https://github.com/vectorize-io/hindsight/commit/1a61579a6)
- Preserve attachment loading and vision-model settings when retaining grouped batches.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [1b2fb1020](https://github.com/vectorize-io/hindsight/commit/1b2fb1020)
- Persist streaming retain checkpoints when using Oracle storage.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [2aff4b5de](https://github.com/vectorize-io/hindsight/commit/2aff4b5de)
- Ensure audit events are written before shutdown.· [![@G26karthik](https://github.com/G26karthik.png?size=40)@G26karthik](https://github.com/G26karthik)· [4eb24a234](https://github.com/vectorize-io/hindsight/commit/4eb24a234)
- Expose supported memory-listing filters in the Python client.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [8caf4a76d](https://github.com/vectorize-io/hindsight/commit/8caf4a76d)
- Preserve the configured SDK identity in Python client bank helpers.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [a06504f70](https://github.com/vectorize-io/hindsight/commit/a06504f70)
- Normalize Python client base URLs before configuring transport.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [10db17718](https://github.com/vectorize-io/hindsight/commit/10db17718)
- Keep Reflect retrieval depth intact when using a shallow answer budget.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [804c668b8](https://github.com/vectorize-io/hindsight/commit/804c668b8)
- Account for JSON response wrapping when budgeting split Reflect synthesis.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1df72b0d1](https://github.com/vectorize-io/hindsight/commit/1df72b0d1)
- Support Oracle ordering expressions that rank results by their position in a supplied list.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [70a026bdf](https://github.com/vectorize-io/hindsight/commit/70a026bdf)
- Restore knowledge-page search support with Oracle Text indexes.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [574939c8c](https://github.com/vectorize-io/hindsight/commit/574939c8c)
- Restore Markdown typography in Reflect results in the control plane.· [![@divideby0](https://github.com/divideby0.png?size=40)@divideby0](https://github.com/divideby0)· [b32e992b4](https://github.com/vectorize-io/hindsight/commit/b32e992b4)
- Present refused mental-model delta responses as text instead of failing replay.· [![@Tong-bit-art](https://github.com/Tong-bit-art.png?size=40)@Tong-bit-art](https://github.com/Tong-bit-art)· [567e56798](https://github.com/vectorize-io/hindsight/commit/567e56798)
- Allow each model in a multi-LLM chain to build its own prompt cache.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9770fe400](https://github.com/vectorize-io/hindsight/commit/9770fe400)
- Count every source when creating consolidated observations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [07c288e25](https://github.com/vectorize-io/hindsight/commit/07c288e25)
- Reject malformed completed Reflect documents rather than storing invalid content.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1904ff7cb](https://github.com/vectorize-io/hindsight/commit/1904ff7cb)
- Measure embedding input limits with each embedding model's tokenizer.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [eb93d79bd](https://github.com/vectorize-io/hindsight/commit/eb93d79bd)
- Prevent errors when failing over to Gemini during a tool-use loop.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6716206da](https://github.com/vectorize-io/hindsight/commit/6716206da)
- Prevent retain from merging items without document IDs into another document.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e6edfaf13](https://github.com/vectorize-io/hindsight/commit/e6edfaf13)
- Apply embedding concurrency limits to single-batch requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c0fe05d95](https://github.com/vectorize-io/hindsight/commit/c0fe05d95)
- Return real memory IDs in Reflect answers and mental-model citations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9f576ef75](https://github.com/vectorize-io/hindsight/commit/9f576ef75)
- Accept trigger tag groups as plain JSON in MCP tool requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [564f9e77b](https://github.com/vectorize-io/hindsight/commit/564f9e77b)
- Forward request headers when resolving MCP bank aliases.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1ad841adc](https://github.com/vectorize-io/hindsight/commit/1ad841adc)
- Keep the strongest relationship when multiple links target the same recalled memory.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a7a49f89f](https://github.com/vectorize-io/hindsight/commit/a7a49f89f)
- Retry required Reflect retrieval steps instead of silently omitting them.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5b50f1579](https://github.com/vectorize-io/hindsight/commit/5b50f1579)
- Correctly remove reasoning content from malformed prefilled LLM template responses.· [![@FenjuFu](https://github.com/FenjuFu.png?size=40)@FenjuFu](https://github.com/FenjuFu)· [99eb2c71a](https://github.com/vectorize-io/hindsight/commit/99eb2c71a)
- Retain tags from the current observation during consolidation.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [b80910713](https://github.com/vectorize-io/hindsight/commit/b80910713)
- Reject unsupported reranker minimum-score settings and avoid reporting invalid reranker scores.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1b99ac0f0](https://github.com/vectorize-io/hindsight/commit/1b99ac0f0)
- Apply link-expansion timeouts while expanding the observation graph during recall.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cc806c4d6](https://github.com/vectorize-io/hindsight/commit/cc806c4d6)
- Honor environment proxy settings when configuring banks through the Python client.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [b6c26ddec](https://github.com/vectorize-io/hindsight/commit/b6c26ddec)
- Preserve bank IDs in Python client request URLs.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [80550c41b](https://github.com/vectorize-io/hindsight/commit/80550c41b)
- Raise errors when Python client export archive downloads fail.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [030373483](https://github.com/vectorize-io/hindsight/commit/030373483)
- Python client now rejects invalid non-finite Retry-After delays instead of mishandling retries.· [![@rudycelekli](https://github.com/rudycelekli.png?size=40)@rudycelekli](https://github.com/rudycelekli)· [270c8c9cb](https://github.com/vectorize-io/hindsight/commit/270c8c9cb)
- Internal memory prompts now limit included context to avoid oversized requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [017b3f5d8](https://github.com/vectorize-io/hindsight/commit/017b3f5d8)
- Store-owned banks now preserve explicitly supplied entity names during retention.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d863f78aa](https://github.com/vectorize-io/hindsight/commit/d863f78aa)
- Failed single-batch retain operations now abort their store session cleanly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [128c9c34e](https://github.com/vectorize-io/hindsight/commit/128c9c34e)
- Fixed several memory workflow gaps affecting store-owned banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1c4505487](https://github.com/vectorize-io/hindsight/commit/1c4505487)
- Recall and reflection source text now respects the tags of its originating document.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c71cd0437](https://github.com/vectorize-io/hindsight/commit/c71cd0437)
- Bank-list API operations now correctly honor their declared access scope.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c82c7fde6](https://github.com/vectorize-io/hindsight/commit/c82c7fde6)
- Mental-model refreshes now use the correct scope watermark when determining updates.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [13f72ebe0](https://github.com/vectorize-io/hindsight/commit/13f72ebe0)
- Recall now passes temporal windows correctly to full-memory searches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1b89dd340](https://github.com/vectorize-io/hindsight/commit/1b89dd340)
- Deleting a bank that does not exist now succeeds as a no-op instead of returning a server error.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6854bc994](https://github.com/vectorize-io/hindsight/commit/6854bc994)

**Database Migrations**

- `c8e2f4a6b1d3` — Oracle Text index for knowledge-page search·`mental_models`medium· [#4804](https://github.com/vectorize-io/hindsight/pull/4804)

## [0.10.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.10.2) [​](https://hindsight.vectorize.io/changelog\#0102 "Direct link to 0102")

**Features**

- Configure independent refresh budgets for each mental model, without inheriting reflect defaults.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [022583d43](https://github.com/vectorize-io/hindsight/commit/022583d43)
- Add extension hooks for validating memory-curation operations.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [26981c6b4](https://github.com/vectorize-io/hindsight/commit/26981c6b4)
- Add opt-in CUDA acceleration for ONNX embedding generation.· [![@Alkapuce](https://github.com/Alkapuce.png?size=40)@Alkapuce](https://github.com/Alkapuce)· [5c92e8ba2](https://github.com/vectorize-io/hindsight/commit/5c92e8ba2)
- Support multimodal extraction input in dry runs and add an Extraction Tester interface.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5e51d5350](https://github.com/vectorize-io/hindsight/commit/5e51d5350)
- Allow pg0 PostgreSQL connection URL query parameters to be passed through.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fee3cad0b](https://github.com/vectorize-io/hindsight/commit/fee3cad0b)
- Allow reflect operations to use a document’s own metadata.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [82342ca62](https://github.com/vectorize-io/hindsight/commit/82342ca62)
- Carry attachments through observations and Reflect `based_on` inputs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [303216822](https://github.com/vectorize-io/hindsight/commit/303216822)
- Add bank aliases to support zero-downtime bank ID migrations and stable display IDs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a45a8821f](https://github.com/vectorize-io/hindsight/commit/a45a8821f)
- Add configurable consolidation strategies for individual memory scopes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4133ae85c](https://github.com/vectorize-io/hindsight/commit/4133ae85c)

**Improvements**

- Distribute consolidation work more fairly across scope groups.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c08e07560](https://github.com/vectorize-io/hindsight/commit/c08e07560)
- Speed up recall queries for observations from connected sources.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9a34cd0a8](https://github.com/vectorize-io/hindsight/commit/9a34cd0a8)
- Record reasoning-token usage separately in LLM traces.· [![@PraveenKumarSridhar](https://github.com/PraveenKumarSridhar.png?size=40)@PraveenKumarSridhar](https://github.com/PraveenKumarSridhar)· [415a8d763](https://github.com/vectorize-io/hindsight/commit/415a8d763)
- Scope entity fuzzy matching by bank for faster, more isolated lookups.· [![@slayoffer](https://github.com/slayoffer.png?size=40)@slayoffer](https://github.com/slayoffer)· [071330cd2](https://github.com/vectorize-io/hindsight/commit/071330cd2)
- Stream bank and document exports to avoid building large exports entirely in memory.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [0e3d28cf7](https://github.com/vectorize-io/hindsight/commit/0e3d28cf7)
- Improve control-plane translations and localize timeline content.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [45f7fe95a](https://github.com/vectorize-io/hindsight/commit/45f7fe95a)
- Allow each tenant's memory store to migrate its derived state independently.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9b590b1f4](https://github.com/vectorize-io/hindsight/commit/9b590b1f4)
- Reduce Reflect input usage by sending mental models as a page with focused snippets.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5009e8ad4](https://github.com/vectorize-io/hindsight/commit/5009e8ad4)
- Reduce Reflect refresh cost by returning tool results directly and completing through the done tool.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [500da5372](https://github.com/vectorize-io/hindsight/commit/500da5372)
- Omit unused memory-unit fields from bank-list responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3684be009](https://github.com/vectorize-io/hindsight/commit/3684be009)
- Make per-tenant metrics labels configurable to control metric cardinality.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [697a24534](https://github.com/vectorize-io/hindsight/commit/697a24534)
- Preserve store ordering when paginating bank lists.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2cfc7ab8e](https://github.com/vectorize-io/hindsight/commit/2cfc7ab8e)

**Bug Fixes**

- Restore OpenAI provider compatibility with GPT-6 models.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e329623c0](https://github.com/vectorize-io/hindsight/commit/e329623c0)
- Return a proper not-found response when recalling a bank deleted by another process.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [563a357b4](https://github.com/vectorize-io/hindsight/commit/563a357b4)
- Discard consolidation results when their source facts change during processing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ff7f96ce2](https://github.com/vectorize-io/hindsight/commit/ff7f96ce2)
- Retry mental-model updates when a response references a mistyped block ID.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ab602f522](https://github.com/vectorize-io/hindsight/commit/ab602f522)
- Prevent in-process reranking from exceeding its wall-clock timeout.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [60f06e1de](https://github.com/vectorize-io/hindsight/commit/60f06e1de)
- Prevent untagged writes from incorrectly marking tagged mental models as stale.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6830c43f5](https://github.com/vectorize-io/hindsight/commit/6830c43f5)
- Clear completed operation errors and use consistent fields in operation responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f4f6b154b](https://github.com/vectorize-io/hindsight/commit/f4f6b154b)
- Enable all retain workflows when using Oracle storage.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8924a5bcf](https://github.com/vectorize-io/hindsight/commit/8924a5bcf)
- Handle JSON responses wrapped in code fences across supported LLM providers.· [![@kuishou68](https://github.com/kuishou68.png?size=40)@kuishou68](https://github.com/kuishou68)· [266d8aa73](https://github.com/vectorize-io/hindsight/commit/266d8aa73)
- Show each consolidation observation source only once.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9a5b9fa1c](https://github.com/vectorize-io/hindsight/commit/9a5b9fa1c)
- Apply consistent pagination and limit bounds to MCP list tools.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [78c34f201](https://github.com/vectorize-io/hindsight/commit/78c34f201)
- Bound TypeSafe reranker token use while preserving result order across chunks.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [2fbc25e09](https://github.com/vectorize-io/hindsight/commit/2fbc25e09)
- Enforce LLM request deadlines even when an upstream provider trickles responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [878f43998](https://github.com/vectorize-io/hindsight/commit/878f43998)
- Preserve result ordering when Memory Defense partially blocks a retain request.· [![@dakjdakd](https://github.com/dakjdakd.png?size=40)@dakjdakd](https://github.com/dakjdakd)· [3976f5d4b](https://github.com/vectorize-io/hindsight/commit/3976f5d4b)
- Honor native Anthropic tool-choice settings in agent calls.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [48ce1ecd1](https://github.com/vectorize-io/hindsight/commit/48ce1ecd1)
- Preserve all caller-supplied fields when appending retained content.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a4e0f0a49](https://github.com/vectorize-io/hindsight/commit/a4e0f0a49)
- Move explicitly scoped observations when renaming a tag.· [![@nabilaameena](https://github.com/nabilaameena.png?size=40)@nabilaameena](https://github.com/nabilaameena)· [50ddb2b88](https://github.com/vectorize-io/hindsight/commit/50ddb2b88)
- Resolve chained section anchors during reflection.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [8ad962683](https://github.com/vectorize-io/hindsight/commit/8ad962683)
- Use compatible timeout handling for Anthropic API clients.· [![@drakeo338](https://github.com/drakeo338.png?size=40)@drakeo338](https://github.com/drakeo338)· [148ba350c](https://github.com/vectorize-io/hindsight/commit/148ba350c)
- Support document and chunk IDs containing slashes in the control plane.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [25d266937](https://github.com/vectorize-io/hindsight/commit/25d266937)
- Make the embedding daemon start more reliably.· [![@diatche](https://github.com/diatche.png?size=40)@diatche](https://github.com/diatche)· [25b539ac9](https://github.com/vectorize-io/hindsight/commit/25b539ac9)
- Ignore excessively long entity-name candidates during retain processing.· [![@slayoffer](https://github.com/slayoffer.png?size=40)@slayoffer](https://github.com/slayoffer)· [ccc832acc](https://github.com/vectorize-io/hindsight/commit/ccc832acc)
- Report tool-selection failures correctly in reflect compatibility errors.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [c11676164](https://github.com/vectorize-io/hindsight/commit/c11676164)
- Allow clients to download presigned export archives without API credentials.· [![@dakjdakd](https://github.com/dakjdakd.png?size=40)@dakjdakd](https://github.com/dakjdakd)· [e23de7e39](https://github.com/vectorize-io/hindsight/commit/e23de7e39)
- Keep entity names that differ by numbers distinct.· [![@jiangLLM](https://github.com/jiangLLM.png?size=40)@jiangLLM](https://github.com/jiangLLM)· [aef669b1b](https://github.com/vectorize-io/hindsight/commit/aef669b1b)
- Avoid duplicating large tool results when splitting reflect requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [559050e49](https://github.com/vectorize-io/hindsight/commit/559050e49)
- Reduce recall strategy boosts based on source rank after reranking.· [![@1346154262](https://github.com/1346154262.png?size=40)@1346154262](https://github.com/1346154262)· [ac4a4b31a](https://github.com/vectorize-io/hindsight/commit/ac4a4b31a)
- Allow graph links to be recreated after observation sweep source locks.· [![@BrianMcBrayer](https://github.com/BrianMcBrayer.png?size=40)@BrianMcBrayer](https://github.com/BrianMcBrayer)· [93d6aeaa0](https://github.com/vectorize-io/hindsight/commit/93d6aeaa0)
- Safely serialize conversation chunks containing lone Unicode surrogates.· [![@kubaodias](https://github.com/kubaodias.png?size=40)@kubaodias](https://github.com/kubaodias)· [f41df14e3](https://github.com/vectorize-io/hindsight/commit/f41df14e3)
- Display causal links in control-plane bank statistics.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [7be554770](https://github.com/vectorize-io/hindsight/commit/7be554770)
- Show “all fact types” when no mental-model fact-type filter is selected.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [5bb45ddc0](https://github.com/vectorize-io/hindsight/commit/5bb45ddc0)
- Handle GPT-6 as a reasoning model when using OpenAI Responses.· [![@Harshul1484](https://github.com/Harshul1484.png?size=40)@Harshul1484](https://github.com/Harshul1484)· [fd065ba38](https://github.com/vectorize-io/hindsight/commit/fd065ba38)
- Prevent embedded daemon startup from inheriting interactive standard input and hanging.· [![@E-R-Butch](https://github.com/E-R-Butch.png?size=40)@E-R-Butch](https://github.com/E-R-Butch)· [403f9c68a](https://github.com/vectorize-io/hindsight/commit/403f9c68a)
- Allow Reflect's completion tool to accept document arguments encoded as strings.· [![@bannert1337](https://github.com/bannert1337.png?size=40)@bannert1337](https://github.com/bannert1337)· [ce8d5d6e4](https://github.com/vectorize-io/hindsight/commit/ce8d5d6e4)
- Make standalone Docker image build arguments take effect correctly.· [![@M-r-A](https://github.com/M-r-A.png?size=40)@M-r-A](https://github.com/M-r-A)· [8f873ec30](https://github.com/vectorize-io/hindsight/commit/8f873ec30)
- Route Helm Ingress data API requests through the `/v1` endpoint.· [![@dakjdakd](https://github.com/dakjdakd.png?size=40)@dakjdakd](https://github.com/dakjdakd)· [dc642d650](https://github.com/vectorize-io/hindsight/commit/dc642d650)
- Fix the control-plane document date-range picker being clipped.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [284db9c35](https://github.com/vectorize-io/hindsight/commit/284db9c35)
- Derive LLM session IDs correctly from Responses API input.· [![@davidneyra2804](https://github.com/davidneyra2804.png?size=40)@davidneyra2804](https://github.com/davidneyra2804)· [5125ffad8](https://github.com/vectorize-io/hindsight/commit/5125ffad8)
- Prevent concurrent refreshes of the same mental model.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [6be8d3bd3](https://github.com/vectorize-io/hindsight/commit/6be8d3bd3)
- Allow Retain to append monotonically growing JSON conversation arrays.· [![@Tosko4](https://github.com/Tosko4.png?size=40)@Tosko4](https://github.com/Tosko4)· [8f0eb1bae](https://github.com/vectorize-io/hindsight/commit/8f0eb1bae)
- Avoid sending unsupported explicit tool choices to Z.AI models.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [176c03e3a](https://github.com/vectorize-io/hindsight/commit/176c03e3a)
- Reject no-op knowledge-node update requests without reading the bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c708ad53f](https://github.com/vectorize-io/hindsight/commit/c708ad53f)
- Return empty pages as empty content instead of placeholder text.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a7eafb2f3](https://github.com/vectorize-io/hindsight/commit/a7eafb2f3)
- Release the database migration lock when a migration fails.· [![@nabilaameena](https://github.com/nabilaameena.png?size=40)@nabilaameena](https://github.com/nabilaameena)· [f8980263d](https://github.com/vectorize-io/hindsight/commit/f8980263d)
- Avoid creating unnecessary per-bank vector indexes for store-owned memories.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [166ad9745](https://github.com/vectorize-io/hindsight/commit/166ad9745)
- Serve Prometheus metrics without blocking the API event loop.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [85c3dfcc6](https://github.com/vectorize-io/hindsight/commit/85c3dfcc6)
- Support URL-encoded Oracle credentials and Oracle connect descriptors.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [7a593e8ce](https://github.com/vectorize-io/hindsight/commit/7a593e8ce)
- Persist Retain operation document IDs when using Oracle.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [66db5efa3](https://github.com/vectorize-io/hindsight/commit/66db5efa3)
- Correct Oracle handling of parent-exclusion JSON queries.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [6bac552e6](https://github.com/vectorize-io/hindsight/commit/6bac552e6)
- Treat PostgreSQL-specific `SET LOCAL` statements as no-ops on Oracle.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [b8fc67672](https://github.com/vectorize-io/hindsight/commit/b8fc67672)
- Allow knowledge-base trees with Oracle CLOB names to be sorted correctly.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [2667fd388](https://github.com/vectorize-io/hindsight/commit/2667fd388)
- Ensure Oracle JSON merge-patch operations return CLOB values.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [9d153043c](https://github.com/vectorize-io/hindsight/commit/9d153043c)
- Compare mental-model staleness timestamps in UTC on Oracle.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [a2a0000b3](https://github.com/vectorize-io/hindsight/commit/a2a0000b3)
- Allow UUID relationship IDs when relinking graph data on Oracle.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [53996a880](https://github.com/vectorize-io/hindsight/commit/53996a880)
- Restore bank archive rows correctly during transfers on Oracle.· [![@rodrigoedu94-png](https://github.com/rodrigoedu94-png.png?size=40)@rodrigoedu94-png](https://github.com/rodrigoedu94-png)· [0254f0d5b](https://github.com/vectorize-io/hindsight/commit/0254f0d5b)
- Reject invalid mental-model delta responses and request a schema-valid retry.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [63da77730](https://github.com/vectorize-io/hindsight/commit/63da77730)
- Fixed four product issues uncovered while validating all documentation code examples.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [83bd08ec7](https://github.com/vectorize-io/hindsight/commit/83bd08ec7)
- Stop failed mental-model refreshes instead of repeatedly retrying and consuming LLM usage.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6786420d](https://github.com/vectorize-io/hindsight/commit/6786420d)

**Database Migrations**

This release alters high-volume tables (`entities`). Migrations run on startup, so allow extra time on large deployments.

- `b8d3f1a6c2e4` — Add last\_refresh\_failed\_at column to mental\_models·`mental_models`medium· [#4618](https://github.com/vectorize-io/hindsight/pull/4618)
- `c8d1e4f7a20b` — Add bank\_aliases: extra ids a bank also answers to.·`bank_aliases`small· [#4706](https://github.com/vectorize-io/hindsight/pull/4706)
- `d4f8b1c6e903` — Let one of a bank's aliases be the id shown in its place.·`bank_aliases`small· [#4724](https://github.com/vectorize-io/hindsight/pull/4724)
- `7c2e5a9d1f40` — Scope the entities trigram index by bank: GIN (bank\_id, LOWER(canonical\_name)).·`entities`high volume· [#4775](https://github.com/vectorize-io/hindsight/pull/4775)
- `a6c4e8f1b203` — Store per-request reasoning tokens alongside visible output tokens.· [#4745](https://github.com/vectorize-io/hindsight/pull/4745)
- `e5b1c7d3a902` — Merge divergent heads from the bank-scoped trigram index and reasoning tokens· [#4788](https://github.com/vectorize-io/hindsight/pull/4788)

## [0.10.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.10.1) [​](https://hindsight.vectorize.io/changelog\#0101 "Direct link to 0101")

**Features**

- Added a TypeSafe reranker provider to remove irrelevant recall candidates.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6fd2e95a8](https://github.com/vectorize-io/hindsight/commit/6fd2e95a8)
- Reflection search-observation budgets and entity settings are now configurable.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [610dfb0b0](https://github.com/vectorize-io/hindsight/commit/610dfb0b0)
- The control plane document list now supports preset and custom date-range filters.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d6a4e89bb](https://github.com/vectorize-io/hindsight/commit/d6a4e89bb)
- Added an opt-in server setting that permits facts without when, where, who, or why fields.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c3aaf47ae](https://github.com/vectorize-io/hindsight/commit/c3aaf47ae)
- Memory and document list APIs now support server-side time filtering and sorting.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5789679f3](https://github.com/vectorize-io/hindsight/commit/5789679f3)
- Added an advanced search dialog for knowledge pages in the control plane.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [55a3c8c2b](https://github.com/vectorize-io/hindsight/commit/55a3c8c2b)
- Automatic mental-model refreshes can now use a separate LLM configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [311a2d495](https://github.com/vectorize-io/hindsight/commit/311a2d495)
- Added an API to clone a bank in a single request.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a71b06245](https://github.com/vectorize-io/hindsight/commit/a71b06245)
- Added unified bank export and import APIs for transferring banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6e6098a03](https://github.com/vectorize-io/hindsight/commit/6e6098a03)
- Added an admin command to rename a bank without recreating it.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [88b1db875](https://github.com/vectorize-io/hindsight/commit/88b1db875)
- Simplified control-plane recall and reflect option forms and added help for every option.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d6bc553ce](https://github.com/vectorize-io/hindsight/commit/d6bc553ce)
- Added configuration for the default trigger used when creating knowledge pages.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [08626936a](https://github.com/vectorize-io/hindsight/commit/08626936a)
- Added attachment filenames for documents in store-owned banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7ed568ac4](https://github.com/vectorize-io/hindsight/commit/7ed568ac4)
- Attachments are now explicitly associated with their source documents.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b6634ea2](https://github.com/vectorize-io/hindsight/commit/b6634ea2)

**Improvements**

- Retaining multi-chunk content now avoids repeated prompt and schema generation.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [9f9a0d396](https://github.com/vectorize-io/hindsight/commit/9f9a0d396)
- Listing banks no longer scans all memory units, improving performance at scale.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [81e4a674a](https://github.com/vectorize-io/hindsight/commit/81e4a674a)
- Improved recall performance by reusing source-memory information throughout processing.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [be0e93997](https://github.com/vectorize-io/hindsight/commit/be0e93997)
- Released Jina MLX reranker memory after each batch to reduce memory pressure.· [![@w-seok](https://github.com/w-seok.png?size=40)@w-seok](https://github.com/w-seok)· [50c63abce](https://github.com/vectorize-io/hindsight/commit/50c63abce)

**Bug Fixes**

- Outbound HTTP requests now honor proxy environment variables.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [44bf0c4f5](https://github.com/vectorize-io/hindsight/commit/44bf0c4f5)
- Embedding availability checks no longer disrupt the caller's event loop.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [272c7491f](https://github.com/vectorize-io/hindsight/commit/272c7491f)
- Temporal recall results are now correctly ordered before result fusion.· [![@rocke2020](https://github.com/rocke2020.png?size=40)@rocke2020](https://github.com/rocke2020)· [ccfc38020](https://github.com/vectorize-io/hindsight/commit/ccfc38020)
- Entity clustering now applies word-level agreement checks within the same ingestion batch.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [7905cb10d](https://github.com/vectorize-io/hindsight/commit/7905cb10d)
- Rate-limit retries now honor numeric retry-after values returned by providers.· [![@i-Hun](https://github.com/i-Hun.png?size=40)@i-Hun](https://github.com/i-Hun)· [9f99abec9](https://github.com/vectorize-io/hindsight/commit/9f99abec9)
- Renaming a bank now moves its stored files to the new bank location.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ea55ac038](https://github.com/vectorize-io/hindsight/commit/ea55ac038)
- Object-store backends now return retrieved content as native bytes.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [79a2fb152](https://github.com/vectorize-io/hindsight/commit/79a2fb152)
- MLX is now installed only on supported Apple Silicon systems.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8f852444e](https://github.com/vectorize-io/hindsight/commit/8f852444e)
- Retain retries foreign-key delete races instead of dropping the memory request.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f52c2f0a6](https://github.com/vectorize-io/hindsight/commit/f52c2f0a6)
- Knowledge-page search scores are now normalized to a consistent 0–1 range.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fb4a01625](https://github.com/vectorize-io/hindsight/commit/fb4a01625)
- Reflection now rejects blank queries without making unnecessary LLM calls.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [13b828bb4](https://github.com/vectorize-io/hindsight/commit/13b828bb4)
- Local models no longer use Apple Silicon MPS execution.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e73a4bf5e](https://github.com/vectorize-io/hindsight/commit/e73a4bf5e)
- Store-owned bank attachments and uploaded originals now stay synchronized with their documents.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [760c0ea57](https://github.com/vectorize-io/hindsight/commit/760c0ea57)
- Recall now correctly rejects requests for missing banks before responding with not found.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c4deb82af](https://github.com/vectorize-io/hindsight/commit/c4deb82af)
- Reflection prompts now clearly define disposition levels for more reliable tool use.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [475cc0278](https://github.com/vectorize-io/hindsight/commit/475cc0278)
- Windows embedding support now correctly launches Python from uv virtual environments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a63525347](https://github.com/vectorize-io/hindsight/commit/a63525347)
- Bank imports and clones now work when memories are stored in the memories store.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [12a070cbb](https://github.com/vectorize-io/hindsight/commit/12a070cbb)
- Bank archive creation now avoids blocking the event loop and long read transactions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fea8cd8bb](https://github.com/vectorize-io/hindsight/commit/fea8cd8bb)
- Database migrations now scope vector-index lookups to the correct relation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a5552d4e8](https://github.com/vectorize-io/hindsight/commit/a5552d4e8)
- Setting the recall query token cap to zero now correctly disables the cap.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e5c3f65f7](https://github.com/vectorize-io/hindsight/commit/e5c3f65f7)
- Cancelled client requests now stop waiting in capacity-retry backoff.· [![@Tosko4](https://github.com/Tosko4.png?size=40)@Tosko4](https://github.com/Tosko4)· [ba5f9a49c](https://github.com/vectorize-io/hindsight/commit/ba5f9a49c)
- Retained non-English facts now preserve their original writing script.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [de0b34a1a](https://github.com/vectorize-io/hindsight/commit/de0b34a1a)
- Mental-model refreshes no longer overwrite a page with older event state.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a6518c919](https://github.com/vectorize-io/hindsight/commit/a6518c919)
- Prevented remaining delete-and-reingest operations from deadlocking.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [590657901](https://github.com/vectorize-io/hindsight/commit/590657901)
- Made the control-plane UI available when the service is bound to a loopback address.· [![@snevesgraca-nwmo](https://github.com/snevesgraca-nwmo.png?size=40)@snevesgraca-nwmo](https://github.com/snevesgraca-nwmo)· [1a000a527](https://github.com/vectorize-io/hindsight/commit/1a000a527)
- Made retention apply its language behavior more consistently.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [567927c8f](https://github.com/vectorize-io/hindsight/commit/567927c8f)
- Prevented observation cleanup and re-ingestion from deadlocking by using a consistent processing order.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f6077c31f](https://github.com/vectorize-io/hindsight/commit/f6077c31f)
- Made recall's default time window use UTC consistently across server time zones.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [5ef65534a](https://github.com/vectorize-io/hindsight/commit/5ef65534a)
- Improved full-text recall search by matching meaningful query terms instead of raw sentences.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d6c556f65](https://github.com/vectorize-io/hindsight/commit/d6c556f65)
- Prevented tenant information from leaking between extension requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [882e32c3e](https://github.com/vectorize-io/hindsight/commit/882e32c3e)
- Rejected bank IDs that are too long or contain control characters.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [909a8c18f](https://github.com/vectorize-io/hindsight/commit/909a8c18f)
- Prevented same-bank cleanup from deadlocking while deleting or re-ingesting documents.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [0246ee571](https://github.com/vectorize-io/hindsight/commit/0246ee571)
- Made asynchronous retain submission validators receive the same context as synchronous submissions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5f0d6c7df](https://github.com/vectorize-io/hindsight/commit/5f0d6c7df)
- Made the API fail immediately when its configured listen port is unavailable.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [758e3c3d2](https://github.com/vectorize-io/hindsight/commit/758e3c3d2)
- Avoided incorrectly redacting technical numbers as credit-card numbers.· [![@kyletser](https://github.com/kyletser.png?size=40)@kyletser](https://github.com/kyletser)· [5f7d5216f](https://github.com/vectorize-io/hindsight/commit/5f7d5216f)
- Made embedding provider probing work reliably regardless of the server locale.· [![@L4XB](https://github.com/L4XB.png?size=40)@L4XB](https://github.com/L4XB)· [2252291c5](https://github.com/vectorize-io/hindsight/commit/2252291c5)
- Deleted stored files with their bank and isolated file storage between tenants.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cfef62b8d](https://github.com/vectorize-io/hindsight/commit/cfef62b8d)
- Made reflection honor configured recall budgets and limit tool token requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4b5c0c461](https://github.com/vectorize-io/hindsight/commit/4b5c0c461)
- Preserved converted-file references on documents in store-owned banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2c96869c8](https://github.com/vectorize-io/hindsight/commit/2c96869c8)
- Made bulk memory deletion return the correct number of deleted memories.· [![@1jeffchristensen](https://github.com/1jeffchristensen.png?size=40)@1jeffchristensen](https://github.com/1jeffchristensen)· [041bb1f2b](https://github.com/vectorize-io/hindsight/commit/041bb1f2b)
- Allowed OAuth store locking to continue when the local store cannot be written.· [![@LoneExile](https://github.com/LoneExile.png?size=40)@LoneExile](https://github.com/LoneExile)· [fb6fc7629](https://github.com/vectorize-io/hindsight/commit/fb6fc7629)
- Redacted Hindsight API keys from memory-defense output.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [6e86e68bc](https://github.com/vectorize-io/hindsight/commit/6e86e68bc)
- Prevented store-owned bank attachments from being reclaimed unexpectedly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ad068d99a](https://github.com/vectorize-io/hindsight/commit/ad068d99a)

**Database Migrations**

- `a7c2e9f41b60` — Give every attachment an owning document, and drop document\_attachments.·`attachments`medium`document_attachments`medium· [#4471](https://github.com/vectorize-io/hindsight/pull/4471)

## [0.10.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.10.0) [​](https://hindsight.vectorize.io/changelog\#0100 "Direct link to 0100")

**Breaking Changes**

- Mental-model list responses now return metadata by default rather than full model content.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [fb94ce034](https://github.com/vectorize-io/hindsight/commit/fb94ce034)
- API runtime Docker images no longer include curl.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5f9bff905](https://github.com/vectorize-io/hindsight/commit/5f9bff905)
- Removed the bank profile and background API endpoints.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [163fbb0ed](https://github.com/vectorize-io/hindsight/commit/163fbb0ed)
- Removed the `count_chunks` extension hook from the memory extension API.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d8b11907b](https://github.com/vectorize-io/hindsight/commit/d8b11907b)

**Features**

- Configure separate timeout and retry limits for each model in a multi-LLM chain.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [54fc68e70](https://github.com/vectorize-io/hindsight/commit/54fc68e70)
- API requests can wait briefly for capacity, with clients retrying transient admission limits.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6ac46e230](https://github.com/vectorize-io/hindsight/commit/6ac46e230)
- Prometheus metrics now cover every API worker and report event-loop lag distributions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2cd0561f1](https://github.com/vectorize-io/hindsight/commit/2cd0561f1)
- Recall and read results now include the attachments supporting facts, including for store-owned banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [48b62ee08](https://github.com/vectorize-io/hindsight/commit/48b62ee08)
- The control plane keeps the currently selected bank at the top of the bank selector.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4af316e74](https://github.com/vectorize-io/hindsight/commit/4af316e74)
- Add a control-plane button to pause ambient constellation motion.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [558017a84](https://github.com/vectorize-io/hindsight/commit/558017a84)
- Enable CPU profiling through environment configuration and emit profiles to application logs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [da0444a72](https://github.com/vectorize-io/hindsight/commit/da0444a72)
- Add a control-plane prompt tester for retain and prompt previews for every operation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9e6d9e76c](https://github.com/vectorize-io/hindsight/commit/9e6d9e76c)
- Route retained items to an LLM chain member based on their metadata.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [864d92692](https://github.com/vectorize-io/hindsight/commit/864d92692)
- Added a control-plane bank overview with bulk deletion support.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7244098c0](https://github.com/vectorize-io/hindsight/commit/7244098c0)
- Support images and files as first-class inline content when retaining memories.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [280f09820](https://github.com/vectorize-io/hindsight/commit/280f09820)
- Added Meta Model API as a first-class LLM provider.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [30ce3b8d1](https://github.com/vectorize-io/hindsight/commit/30ce3b8d1)
- Added fuzzy matching support for leaf tags within tag groups during recall.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f747d96c3](https://github.com/vectorize-io/hindsight/commit/f747d96c3)
- Added an option to run database migrations in a separate subprocess.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a46783815](https://github.com/vectorize-io/hindsight/commit/a46783815)
- Added multi-valued open-text entity labels.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [21c216004](https://github.com/vectorize-io/hindsight/commit/21c216004)
- Webhook deliveries now include timestamped SHA-256 signatures for verification.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d936d4931](https://github.com/vectorize-io/hindsight/commit/d936d4931)
- Added separate credential directories for each Codex LLM provider configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c42e6323e](https://github.com/vectorize-io/hindsight/commit/c42e6323e)
- Mental-model delta refreshes now receive the operation schema.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f22c36250](https://github.com/vectorize-io/hindsight/commit/f22c36250)
- Added configurable dimensions and more reliable startup checks for LiteLLM embeddings.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [dd60a542e](https://github.com/vectorize-io/hindsight/commit/dd60a542e)
- Added a CUDA-enabled standalone Docker deployment recipe.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [a6a6c8e5a](https://github.com/vectorize-io/hindsight/commit/a6a6c8e5a)
- Exposed the complete mental-model trigger policy through MCP, including knowledge pages.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [56ba04204](https://github.com/vectorize-io/hindsight/commit/56ba04204)
- Added a CLI option to choose full or delta trigger mode when updating mental models.· [![@mdbenito](https://github.com/mdbenito.png?size=40)@mdbenito](https://github.com/mdbenito)· [1cc2f9c10](https://github.com/vectorize-io/hindsight/commit/1cc2f9c10)
- Allow configuring the PostgreSQL schema that provides pg\_search extension functions.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [0b6b5261a](https://github.com/vectorize-io/hindsight/commit/0b6b5261a)
- Added Helm support for Prometheus Operator ServiceMonitors.· [![@aWN4Y25pa2EK](https://github.com/aWN4Y25pa2EK.png?size=40)@aWN4Y25pa2EK](https://github.com/aWN4Y25pa2EK)· [a6f99c995](https://github.com/vectorize-io/hindsight/commit/a6f99c995)
- Allow extra containers and init containers in Helm deployments for the API, worker, and control plane.· [![@Adrastopoulos](https://github.com/Adrastopoulos.png?size=40)@Adrastopoulos](https://github.com/Adrastopoulos)· [eb3d1d587](https://github.com/vectorize-io/hindsight/commit/eb3d1d587)
- Added Control Plane translations for knowledge-base and mental-model refinement workflows.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [35b98cb94](https://github.com/vectorize-io/hindsight/commit/35b98cb94)
- Document transfers can now export a knowledge base.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8d8dab346](https://github.com/vectorize-io/hindsight/commit/8d8dab346)
- Added a Business Executive memory-bank template.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [b75fa6103](https://github.com/vectorize-io/hindsight/commit/b75fa6103)
- Added a per-bank option to disable text search and use pure vector recall.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cd8d4d399](https://github.com/vectorize-io/hindsight/commit/cd8d4d399)

**Improvements**

- Reduce CPU usage and latency on recall requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d9df6d2a4](https://github.com/vectorize-io/hindsight/commit/d9df6d2a4)
- Improve API throughput, especially for inexpensive routes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2544a73c4](https://github.com/vectorize-io/hindsight/commit/2544a73c4)
- Speed up retain processing by accelerating semantic-link calculation within a batch.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [b04579481](https://github.com/vectorize-io/hindsight/commit/b04579481)
- Reduce overhead when resolving Hindsight configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3e1d47fdc](https://github.com/vectorize-io/hindsight/commit/3e1d47fdc)
- Improve performance when resolving duplicate entities within a retain batch.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [bc06bd051](https://github.com/vectorize-io/hindsight/commit/bc06bd051)
- Reduce API overhead by avoiding unnecessary mental-model staleness checks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [78c10a382](https://github.com/vectorize-io/hindsight/commit/78c10a382)
- Reduced standalone Docker image dependencies by removing the NodeSource bootstrap.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [798aebd66](https://github.com/vectorize-io/hindsight/commit/798aebd66)
- Reduced control-plane-only Docker image dependencies by omitting unused curl.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d6ec007df](https://github.com/vectorize-io/hindsight/commit/d6ec007df)
- Updated container images to use the active Node.js 24 LTS runtime.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c57331a94](https://github.com/vectorize-io/hindsight/commit/c57331a94)
- Improved Docker image build performance by setting file ownership during copy operations.· [![@SharkyRawr](https://github.com/SharkyRawr.png?size=40)@SharkyRawr](https://github.com/SharkyRawr)· [01ed1e15f](https://github.com/vectorize-io/hindsight/commit/01ed1e15f)
- Reduced runtime Docker image size by removing unused libxml2 packages.· [![@rschlek](https://github.com/rschlek.png?size=40)@rschlek](https://github.com/rschlek)· [f9e91e21f](https://github.com/vectorize-io/hindsight/commit/f9e91e21f)
- Included operation attributes in exported tracing spans for better observability.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [356aa6cd4](https://github.com/vectorize-io/hindsight/commit/356aa6cd4)
- Improved remote embedding throughput by processing provider batches concurrently.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9697c6900](https://github.com/vectorize-io/hindsight/commit/9697c6900)
- Reduced API startup time by avoiding unnecessary loading of LLM and document-processing dependencies.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e48a0c9a7](https://github.com/vectorize-io/hindsight/commit/e48a0c9a7)
- Accelerated token counting used during memory processing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bce43b8e1](https://github.com/vectorize-io/hindsight/commit/bce43b8e1)
- Added recall-phase metrics for recalls answered directly from stored memories.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b746ad139](https://github.com/vectorize-io/hindsight/commit/b746ad139)
- Improved tracing by naming API operations clearly and linking queued retains to their workers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ebcd88f97](https://github.com/vectorize-io/hindsight/commit/ebcd88f97)
- Added detailed timing metrics for recall request phases.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b00cc4047](https://github.com/vectorize-io/hindsight/commit/b00cc4047)
- Added timing metrics for operation validation hooks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [97ae1d08c](https://github.com/vectorize-io/hindsight/commit/97ae1d08c)
- Improved configuration hot-path performance by retaining cached settings where freshness is not required.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c9591229e](https://github.com/vectorize-io/hindsight/commit/c9591229e)
- Hardened Docker runtime images by removing npm from runtime stages and expanding base-image security scanning.· [![@rschlek](https://github.com/rschlek.png?size=40)@rschlek](https://github.com/rschlek)· [466517ff9](https://github.com/vectorize-io/hindsight/commit/466517ff9)
- Improved recall performance by fetching expanded observation graphs in a single database query.· [![@jervaise](https://github.com/jervaise.png?size=40)@jervaise](https://github.com/jervaise)· [3bba2c01f](https://github.com/vectorize-io/hindsight/commit/3bba2c01f)
- Avoided unnecessary document retagging when a tags update makes no change.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [43f545e9b](https://github.com/vectorize-io/hindsight/commit/43f545e9b)
- Improved retain throughput by reducing embedding-vector conversion overhead.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [0478c09c4](https://github.com/vectorize-io/hindsight/commit/0478c09c4)
- Reduced unnecessary database queries when creating or accessing banks.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [059951ce1](https://github.com/vectorize-io/hindsight/commit/059951ce1)
- Improved pg\_search query handling by using the backend's native tokenization.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [600890c43](https://github.com/vectorize-io/hindsight/commit/600890c43)
- Meter mental-model content based on what is delivered rather than the endpoint used.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [870d20d6f](https://github.com/vectorize-io/hindsight/commit/870d20d6f)
- Improved CPU reranker performance by avoiding unnecessary full garbage collections.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [6f9f935e6](https://github.com/vectorize-io/hindsight/commit/6f9f935e6)
- Deployments can take ownership of database maintenance routines.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [7ba5fb23a](https://github.com/vectorize-io/hindsight/commit/7ba5fb23a)
- Reduced memory overhead while retaining large documents by accumulating document content across sub-batches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3ad9d618e](https://github.com/vectorize-io/hindsight/commit/3ad9d618e)
- Improved tokenization performance and updated the default tokenizer encoding.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9fcb7ca7a](https://github.com/vectorize-io/hindsight/commit/9fcb7ca7a)
- Improved retain throughput by batching chunk embedding requests for each document.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ca2c983e1](https://github.com/vectorize-io/hindsight/commit/ca2c983e1)

**Bug Fixes**

- CPU profiling now captures worker processes as well as the supervisor when enabled.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cdac00842](https://github.com/vectorize-io/hindsight/commit/cdac00842)
- Custom memory stores no longer maintain indexes that do not apply to them.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5a6083175](https://github.com/vectorize-io/hindsight/commit/5a6083175)
- Reflect no longer states a specific value for a period the memories don't cover — it says the data isn't recorded instead of extrapolating a number from neighbouring periods.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [630c3a63e](https://github.com/vectorize-io/hindsight/commit/630c3a63e)
- Mental-model and knowledge-page delta refreshes no longer overwrite stored content from what the newest batch alone says, such as replacing a running count or erasing an earlier recorded event.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [630c3a63e](https://github.com/vectorize-io/hindsight/commit/630c3a63e)
- Correct public API issues uncovered by end-to-end system testing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [59e25d74f](https://github.com/vectorize-io/hindsight/commit/59e25d74f)
- Generated API clients now receive downloaded binary content as bytes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [88456981f](https://github.com/vectorize-io/hindsight/commit/88456981f)
- Entity mention counts are restored correctly when mentions are removed.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [64a98aa56](https://github.com/vectorize-io/hindsight/commit/64a98aa56)
- Clearing an occurrence start date also clears the legacy event date.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [203d95c7c](https://github.com/vectorize-io/hindsight/commit/203d95c7c)
- Reflection turns use unique tool-call IDs for compatibility with strict LLM APIs.· [![@gwthm-in](https://github.com/gwthm-in.png?size=40)@gwthm-in](https://github.com/gwthm-in)· [5df6398fa](https://github.com/vectorize-io/hindsight/commit/5df6398fa)
- Retain operations no longer risk chunk ID collisions between banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [179938a65](https://github.com/vectorize-io/hindsight/commit/179938a65)
- Reflection reports when structured-output extraction fails instead of silently obscuring the cause.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f5b3f76a8](https://github.com/vectorize-io/hindsight/commit/f5b3f76a8)
- Expose the bank-template import request body in the API schema and generated clients.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1081a2ea4](https://github.com/vectorize-io/hindsight/commit/1081a2ea4)
- Store-owned retain operations no longer fail while recording their own log entries.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [134207d3c](https://github.com/vectorize-io/hindsight/commit/134207d3c)
- List and graph API responses now return consistently typed records.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ef3ccdba3](https://github.com/vectorize-io/hindsight/commit/ef3ccdba3)
- Retain completion events are emitted only after the associated store transaction succeeds.· [![@kyletser](https://github.com/kyletser.png?size=40)@kyletser](https://github.com/kyletser)· [511c86e10](https://github.com/vectorize-io/hindsight/commit/511c86e10)
- Split append operations retain the full document body instead of only its trailing portion.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fda969777](https://github.com/vectorize-io/hindsight/commit/fda969777)
- Recall traces now report the query timestamp supplied by the caller.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e366ff407](https://github.com/vectorize-io/hindsight/commit/e366ff407)
- Vertex single-content embedding models now receive one text per embedding request.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b2a7257eb](https://github.com/vectorize-io/hindsight/commit/b2a7257eb)
- Local ML ARM64 images now run on older ARMv8.0 CPUs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [aeaf4b1bd](https://github.com/vectorize-io/hindsight/commit/aeaf4b1bd)
- Future-dated search items are safely handled in recency scoring.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [1ca8c4d60](https://github.com/vectorize-io/hindsight/commit/1ca8c4d60)
- Sent Gemini embedding inputs as separate content items for correct provider handling.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [a08ec8ddf](https://github.com/vectorize-io/hindsight/commit/a08ec8ddf)
- Returned 404 for bank-scoped read requests targeting banks that do not exist.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [66992496f](https://github.com/vectorize-io/hindsight/commit/66992496f)
- Limited embedding requests to each model's usable context window, including provider prefixes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a3c5b350d](https://github.com/vectorize-io/hindsight/commit/a3c5b350d)
- Improved consolidation by explicitly identifying deletion targets and accounting for discarded batch responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [05c775c41](https://github.com/vectorize-io/hindsight/commit/05c775c41)
- Processed queued concurrent requests in arrival order to prevent unfair waiting.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [310c9f694](https://github.com/vectorize-io/hindsight/commit/310c9f694)
- Applied configured token limits when reflection uses forced synthesis.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d39170010](https://github.com/vectorize-io/hindsight/commit/d39170010)
- Prevented imports from creating observations that cite missing source units.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4a447c061](https://github.com/vectorize-io/hindsight/commit/4a447c061)
- Loaded environment configuration before engine startup so configured concurrency limits take effect.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [f19c424e0](https://github.com/vectorize-io/hindsight/commit/f19c424e0)
- Allow cancellation of operations that are still in progress.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b1de1b941](https://github.com/vectorize-io/hindsight/commit/b1de1b941)
- Correctly recognized requests made through OpenAI-compatible LLM providers.· [![@SharkyRawr](https://github.com/SharkyRawr.png?size=40)@SharkyRawr](https://github.com/SharkyRawr)· [5092f3e11](https://github.com/vectorize-io/hindsight/commit/5092f3e11)
- Sanitized all retained content at the memory engine boundary.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bd607ab8b](https://github.com/vectorize-io/hindsight/commit/bd607ab8b)
- Interpret "last weekend" requested during a weekend as the preceding weekend.· [![@NgoQuocViet2001](https://github.com/NgoQuocViet2001.png?size=40)@NgoQuocViet2001](https://github.com/NgoQuocViet2001)· [cef202e6b](https://github.com/vectorize-io/hindsight/commit/cef202e6b)
- Prevented the CLI from aborting when its output is piped to a command that closes early.· [![@2anoubis](https://github.com/2anoubis.png?size=40)@2anoubis](https://github.com/2anoubis)· [a72f9de15](https://github.com/vectorize-io/hindsight/commit/a72f9de15)
- Added bounded retry handling for all remote reranker requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d69abe7b9](https://github.com/vectorize-io/hindsight/commit/d69abe7b9)
- Used one thread-local HTTP client per thread for TEI embeddings to avoid cross-thread client issues.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e7987ba69](https://github.com/vectorize-io/hindsight/commit/e7987ba69)
- Applied the shared embedding retry policy to Cohere and ZeroEntropy providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c1f70087f](https://github.com/vectorize-io/hindsight/commit/c1f70087f)
- Applied the shared embedding retry policy to Gemini requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [36f4a061f](https://github.com/vectorize-io/hindsight/commit/36f4a061f)
- Made split-synthesis reflection map calls deterministic by using zero temperature.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [98e565d3f](https://github.com/vectorize-io/hindsight/commit/98e565d3f)
- Allowed Bedrock inference profile ARNs to be used through the LiteLLM embedding provider.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7a52b0a6b](https://github.com/vectorize-io/hindsight/commit/7a52b0a6b)
- Preserved per-memory entity-label tags when re-retaining content updates document tags.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [576cf40a2](https://github.com/vectorize-io/hindsight/commit/576cf40a2)
- Installed PostgreSQL extensions in the public schema for reliable database setup.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [901b5c696](https://github.com/vectorize-io/hindsight/commit/901b5c696)
- Forwarded all HINDSIGHT\_\* environment settings to the embedded daemon.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7eb0fcc61](https://github.com/vectorize-io/hindsight/commit/7eb0fcc61)
- Ran tenant provisioning migrations within the database isolation boundary.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [216272814](https://github.com/vectorize-io/hindsight/commit/216272814)
- Showed the server response body in CLI output when API requests fail.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [737e5bf42](https://github.com/vectorize-io/hindsight/commit/737e5bf42)
- Paginated observation-scope and webhook listing endpoints.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d20893a83](https://github.com/vectorize-io/hindsight/commit/d20893a83)
- Fixed fuzzy tag matching to compare tag values rather than namespaced tag names.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [00caa8eab](https://github.com/vectorize-io/hindsight/commit/00caa8eab)
- Fixed tokenizer cache leakage during memory processing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [53ed37488](https://github.com/vectorize-io/hindsight/commit/53ed37488)
- Aligned bank configuration behavior between client wrappers and the server.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e8518c392](https://github.com/vectorize-io/hindsight/commit/e8518c392)
- Duplicate mental-model IDs now return a conflict response instead of failing unexpectedly.· [![@kubaodias](https://github.com/kubaodias.png?size=40)@kubaodias](https://github.com/kubaodias)· [1a8a1f50e](https://github.com/vectorize-io/hindsight/commit/1a8a1f50e)
- Improved concurrent API reliability when initializing date parsing locales.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3d0a66602](https://github.com/vectorize-io/hindsight/commit/3d0a66602)
- Prevented shutdown activity from being falsely reported as an event-loop stall.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f0cf699cc](https://github.com/vectorize-io/hindsight/commit/f0cf699cc)
- Improved reliability of embedded local models with misaligned model weights.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4e952b4e5](https://github.com/vectorize-io/hindsight/commit/4e952b4e5)
- Re-retaining a document with changed scope now invalidates outdated observations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7be0f88ef](https://github.com/vectorize-io/hindsight/commit/7be0f88ef)
- LLM timeout errors now identify the request phase in which they occurred.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3531e82f9](https://github.com/vectorize-io/hindsight/commit/3531e82f9)
- Reflection runs now fail when their retrieval tools fail, rather than continuing with incomplete results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [921ae824a](https://github.com/vectorize-io/hindsight/commit/921ae824a)
- Fixed prioritized recall ranking so boosts are applied consistently in rank space.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [aee42254a](https://github.com/vectorize-io/hindsight/commit/aee42254a)
- Fixed reflection output to use the required document sections format.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9bfad10a4](https://github.com/vectorize-io/hindsight/commit/9bfad10a4)
- Prevented bulk ingestion in one bank from starving work in other banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b75e94191](https://github.com/vectorize-io/hindsight/commit/b75e94191)
- Skipped unnecessary reflection loops when a mental-model scope has no content to process.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c507e70e3](https://github.com/vectorize-io/hindsight/commit/c507e70e3)
- Stopped retain extraction from deriving its narrator from a bank’s display name.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [aabbe8b22](https://github.com/vectorize-io/hindsight/commit/aabbe8b22)
- Fixed authorization handling for bank-template imports.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [17fbc4f14](https://github.com/vectorize-io/hindsight/commit/17fbc4f14)
- Improved compatibility of strict structured-output schemas that use JSON references.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [db87a7467](https://github.com/vectorize-io/hindsight/commit/db87a7467)
- Fixed consolidation batching to resolve observation scopes before processing tag sets.· [![@ferrastas](https://github.com/ferrastas.png?size=40)@ferrastas](https://github.com/ferrastas)· [eff3546ec](https://github.com/vectorize-io/hindsight/commit/eff3546ec)
- Ensured banks are authorized and provisioned before legacy mutations are applied.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [24adcfce7](https://github.com/vectorize-io/hindsight/commit/24adcfce7)
- Expanded native knowledge BM25 searches to return matches for any search term.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [a373ffab6](https://github.com/vectorize-io/hindsight/commit/a373ffab6)
- Memory edits now update their vector embedding together with their fields.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [31db3983a](https://github.com/vectorize-io/hindsight/commit/31db3983a)
- Made Grafana dashboards compatible with older Grafana versions.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [7083fd790](https://github.com/vectorize-io/hindsight/commit/7083fd790)
- Bank-specific configuration reads now use fresh bank settings instead of stale process-cached values.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [689c9b694](https://github.com/vectorize-io/hindsight/commit/689c9b694)
- Reprocessing retained content now re-runs extraction instead of leaving it unchanged.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9a4be5e05](https://github.com/vectorize-io/hindsight/commit/9a4be5e05)
- Bound concurrent local embedding work to prevent resource exhaustion during ONNX embedding requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7051c6e3b](https://github.com/vectorize-io/hindsight/commit/7051c6e3b)
- Applied reliable per-request deadlines to all LLM providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7729396e1](https://github.com/vectorize-io/hindsight/commit/7729396e1)
- Applied keyword minimum-score thresholds consistently across all text-search backends.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [78d46a718](https://github.com/vectorize-io/hindsight/commit/78d46a718)
- Updated standalone Docker images to remove fixed high-severity vulnerabilities.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [44f937631](https://github.com/vectorize-io/hindsight/commit/44f937631)
- Improved recall ranking for broad date expressions by scoring the full date period.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6a796f9f5](https://github.com/vectorize-io/hindsight/commit/6a796f9f5)
- Fixed malformed JSON handling for OpenAI-compatible LLM providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [98e29817a](https://github.com/vectorize-io/hindsight/commit/98e29817a)
- Correctly send consecutive Anthropic tool results together in a user message.· [![@zlguo1996](https://github.com/zlguo1996.png?size=40)@zlguo1996](https://github.com/zlguo1996)· [169c6ef58](https://github.com/vectorize-io/hindsight/commit/169c6ef58)
- Ensure complete mental-model documents are embedded whenever they are written.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fd2e0c61f](https://github.com/vectorize-io/hindsight/commit/fd2e0c61f)
- Allow reflection delta updates to add sections containing explicit IDs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6b8dfe74f](https://github.com/vectorize-io/hindsight/commit/6b8dfe74f)
- Accurately report visible output-token usage for OpenAI-compatible providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [72c9c8f9e](https://github.com/vectorize-io/hindsight/commit/72c9c8f9e)
- Read embedding profiles and log files as UTF-8 regardless of the host locale.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [ff29e5ad7](https://github.com/vectorize-io/hindsight/commit/ff29e5ad7)
- Apply all memory writes from a consolidation response atomically.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ca38687cd](https://github.com/vectorize-io/hindsight/commit/ca38687cd)
- Report a clear truncation error when a non-streaming LLM completion exceeds its output limit.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [7ef98859e](https://github.com/vectorize-io/hindsight/commit/7ef98859e)
- Avoid unsupported occurred-date constraints on retain backends that do not support them.· [![@nickanderson](https://github.com/nickanderson.png?size=40)@nickanderson](https://github.com/nickanderson)· [5c78b8132](https://github.com/vectorize-io/hindsight/commit/5c78b8132)
- Preserve base64 padding in API keys read from CLI configuration files.· [![@2anoubis](https://github.com/2anoubis.png?size=40)@2anoubis](https://github.com/2anoubis)· [ddf57744c](https://github.com/vectorize-io/hindsight/commit/ddf57744c)
- Enforce the dedicated bank-read permission when viewing mental-model history.· [![@Sword-Saint69](https://github.com/Sword-Saint69.png?size=40)@Sword-Saint69](https://github.com/Sword-Saint69)· [ad2ffa499](https://github.com/vectorize-io/hindsight/commit/ad2ffa499)
- Preserve complete retain items so API reprocessing faithfully replays the original request.· [![@shauneccles](https://github.com/shauneccles.png?size=40)@shauneccles](https://github.com/shauneccles)· [7b6177b46](https://github.com/vectorize-io/hindsight/commit/7b6177b46)
- Avoid repeatedly attempting database settings that PostgreSQL has rejected as invalid.· [![@Andreymi](https://github.com/Andreymi.png?size=40)@Andreymi](https://github.com/Andreymi)· [eca881d0b](https://github.com/vectorize-io/hindsight/commit/eca881d0b)
- Honor configured LLM temperature settings during reflection.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [7874561b0](https://github.com/vectorize-io/hindsight/commit/7874561b0)
- Read embedding profile configuration and Control Center environment files as UTF-8.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [3e8226d1a](https://github.com/vectorize-io/hindsight/commit/3e8226d1a)
- Preserve intended HTTP validation status codes for webhooks.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [8743b4594](https://github.com/vectorize-io/hindsight/commit/8743b4594)
- Apply knowledge-base node updates atomically.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [29901d43b](https://github.com/vectorize-io/hindsight/commit/29901d43b)
- Sanitize model-generated text consistently at all LLM boundaries.· [![@BrianMcBrayer](https://github.com/BrianMcBrayer.png?size=40)@BrianMcBrayer](https://github.com/BrianMcBrayer)· [aab937e5f](https://github.com/vectorize-io/hindsight/commit/aab937e5f)
- Do not apply source-language rules when an output language is explicitly configured.· [![@feniix](https://github.com/feniix.png?size=40)@feniix](https://github.com/feniix)· [ba0be9b30](https://github.com/vectorize-io/hindsight/commit/ba0be9b30)
- Ensure SDK trigger updates modify only the settings explicitly supplied by callers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [55dafc27b](https://github.com/vectorize-io/hindsight/commit/55dafc27b)
- Stop stalled consolidation tasks after a bounded idle period.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [698620786](https://github.com/vectorize-io/hindsight/commit/698620786)
- Accept reflection delta responses provided as a top-level operation array.· [![@ebarkhordar](https://github.com/ebarkhordar.png?size=40)@ebarkhordar](https://github.com/ebarkhordar)· [7fe6a5e79](https://github.com/vectorize-io/hindsight/commit/7fe6a5e79)
- Honor configured LLM timeouts when using the native Ollama provider.· [![@MasterST1337](https://github.com/MasterST1337.png?size=40)@MasterST1337](https://github.com/MasterST1337)· [6e0f044f2](https://github.com/vectorize-io/hindsight/commit/6e0f044f2)
- Detect and recover worker tasks that are stuck without making stage progress.· [![@BrianHotopp](https://github.com/BrianHotopp.png?size=40)@BrianHotopp](https://github.com/BrianHotopp)· [532aa8698](https://github.com/vectorize-io/hindsight/commit/532aa8698)
- Add bounded retries, backoff, and timeouts for LiteLLM embedding providers.· [![@icculp](https://github.com/icculp.png?size=40)@icculp](https://github.com/icculp)· [906dbcdbd](https://github.com/vectorize-io/hindsight/commit/906dbcdbd)
- Improve retry behavior for Text Embeddings Inference embedding requests.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [8916986f5](https://github.com/vectorize-io/hindsight/commit/8916986f5)
- Bound within-batch retain linking work to prevent large deltas from exhausting worker memory.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8833a7518](https://github.com/vectorize-io/hindsight/commit/8833a7518)
- Improved OpenAI rate-limit handling by honoring the provider's reset timing after 429 responses.· [![@romanbsd](https://github.com/romanbsd.png?size=40)@romanbsd](https://github.com/romanbsd)· [20e66093d](https://github.com/vectorize-io/hindsight/commit/20e66093d)
- Fixed transferred mental models so their evidence references remain valid.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c143de2a9](https://github.com/vectorize-io/hindsight/commit/c143de2a9)
- Fixed the Knowledge view so page and mental-model data is restricted to the selected bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3a399343b](https://github.com/vectorize-io/hindsight/commit/3a399343b)
- Fixed full-text search ranking so each result is scored independently.· [![@mameikagou](https://github.com/mameikagou.png?size=40)@mameikagou](https://github.com/mameikagou)· [23c63e173](https://github.com/vectorize-io/hindsight/commit/23c63e173)
- Fixed retain processing for oversized items so sub-batches are rebuilt from the correct source span.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d258f7b82](https://github.com/vectorize-io/hindsight/commit/d258f7b82)
- Restore administrator identity sequence values after database restores.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [e82f670f](https://github.com/vectorize-io/hindsight/commit/e82f670f)

**Other**

- Kept the llama.cpp prompt cache in RAM to avoid persisting potentially sensitive prompts.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [676e2139e](https://github.com/vectorize-io/hindsight/commit/676e2139e)

**Database Migrations**

This release alters high-volume tables (`memory_units_bm25`). Migrations run on startup, so allow extra time on large deployments.

- `e2f4a6c8b0d1` — Add attachments and document\_attachments (inline retain attachments).·`attachments`medium`document_attachments`medium· [#4077](https://github.com/vectorize-io/hindsight/pull/4077)
- `f3a5b7c9d1e2` — Drop the unused memory\_units\_bm25 materialized view.·`memory_units_bm25`high volume· [#4357](https://github.com/vectorize-io/hindsight/pull/4357)

## [0.9.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.9.2) [​](https://hindsight.vectorize.io/changelog\#092 "Direct link to 092")

**Features**

- Recall callers can now supply an explicit temporal window instead of relying on parsed time expressions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3de41af86](https://github.com/vectorize-io/hindsight/commit/3de41af86)
- Control plane now shows per-model staleness with consistent wording across views.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [97dbebb00](https://github.com/vectorize-io/hindsight/commit/97dbebb00)
- Automatic mental-model refreshes now enforce a minimum interval to prevent overly frequent refresh cycles.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2b54a1d3c](https://github.com/vectorize-io/hindsight/commit/2b54a1d3c)
- Text-in embedding providers can now use asymmetric query/passage prefixes to improve retrieval quality.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e256a7409](https://github.com/vectorize-io/hindsight/commit/e256a7409)
- Knowledge-base tree now exposes each page’s refresh trigger, making refresh behavior easier to inspect.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0dd32a3d6](https://github.com/vectorize-io/hindsight/commit/0dd32a3d6)
- Add a GitHub Copilot subscription provider, so Hindsight can run its LLM lanes on a Copilot plan.· [![@dudujuju828](https://github.com/dudujuju828.png?size=40)@dudujuju828](https://github.com/dudujuju828)· [1d9a6a381](https://github.com/vectorize-io/hindsight/commit/1d9a6a381)
- Expose the knowledge base as native MCP tools, so an agent can browse, search and maintain its pages over MCP instead of falling back to HTTP.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6582e26ef](https://github.com/vectorize-io/hindsight/commit/6582e26ef)

**Improvements**

- Retain processing uses less memory and handles large batches more efficiently by streaming sub-batch splitting.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [634312795](https://github.com/vectorize-io/hindsight/commit/634312795)
- Mental model deltas are stored as verbatim Markdown blocks for more faithful, readable model change tracking.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fe5c25d64](https://github.com/vectorize-io/hindsight/commit/fe5c25d64)
- Batch retain is routed through batch-capable multi-LLM handling for better throughput and provider compatibility.· [![@handnewb](https://github.com/handnewb.png?size=40)@handnewb](https://github.com/handnewb)· [7f7d9c133](https://github.com/vectorize-io/hindsight/commit/7f7d9c133)
- Database write overhead is reduced by disabling row counting when min\_rows=0 and by interpreting 0 as 'off'.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [94815f5d0](https://github.com/vectorize-io/hindsight/commit/94815f5d0)
- Engine now serves addressed document/chunk/entity reads from the backing store, improving read consistency.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7c5646436](https://github.com/vectorize-io/hindsight/commit/7c5646436)
- Mental-model refresh operations now record what changes were made, improving auditability and debugging.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [300c546c5](https://github.com/vectorize-io/hindsight/commit/300c546c5)
- CLI output is now non-interactive-friendly by disabling ANSI color and spinners when not running in a TTY.· [![@yossiovadia](https://github.com/yossiovadia.png?size=40)@yossiovadia](https://github.com/yossiovadia)· [b7c65fbb2](https://github.com/vectorize-io/hindsight/commit/b7c65fbb2)
- Vector index creation is now proportional to bank size instead of always creating three per bank, reducing DB bloat.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [edd0d0c5b](https://github.com/vectorize-io/hindsight/commit/edd0d0c5b)
- Retain and update\_memory can now optionally resolve entities via a dedicated flag, enabling more controlled entity handling.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [df8ac42b5](https://github.com/vectorize-io/hindsight/commit/df8ac42b5)
- Maintenance cross-tenant sweeps scale with tenant count to reduce unnecessary work on large deployments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3770d62e3](https://github.com/vectorize-io/hindsight/commit/3770d62e3)
- Worker polling uses a pooled DB connection per cycle with consolidated session setup, improving throughput.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [32b90cc98](https://github.com/vectorize-io/hindsight/commit/32b90cc98)
- The bank list endpoint is now paginated.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6692e38c8](https://github.com/vectorize-io/hindsight/commit/6692e38c8)
- Background worker runs are now traced and join the caller's trace, giving end-to-end visibility into async work.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [08a119eeb](https://github.com/vectorize-io/hindsight/commit/08a119eeb)

**Bug Fixes**

- Consolidation now avoids retrying an entire batch when only some LLM calls fail, improving reliability of batch runs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ad6312a51](https://github.com/vectorize-io/hindsight/commit/ad6312a51)
- Retain now enforces a memory budget (rather than per-document limits) to prevent runaway memory usage on large inputs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e65973b1d](https://github.com/vectorize-io/hindsight/commit/e65973b1d)
- Consolidation claims are serialized per bank within a batch to prevent conflicts and inconsistent results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [85bd23d50](https://github.com/vectorize-io/hindsight/commit/85bd23d50)
- Knowledge pages keep their intended scope reliably and trigger updates no longer reset it unexpectedly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [99a319513](https://github.com/vectorize-io/hindsight/commit/99a319513)
- Entity resolution no longer merges entities based only on history-matched names, reducing incorrect merges.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [92695c6e5](https://github.com/vectorize-io/hindsight/commit/92695c6e5)
- Retain retries and fails clearly when fact extraction encounters schema drift, instead of silently producing bad data.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d8a71c313](https://github.com/vectorize-io/hindsight/commit/d8a71c313)
- Reflect runs now fail if no answer is produced, preventing placeholder memories from being stored.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f4a936950](https://github.com/vectorize-io/hindsight/commit/f4a936950)
- Recall now skips over-budget facts instead of stopping early, and avoids returning empty matches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1f5006583](https://github.com/vectorize-io/hindsight/commit/1f5006583)
- If llama.cpp is missing, the system now reports the configuration problem instead of looping on connection errors.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bdee2bc88](https://github.com/vectorize-io/hindsight/commit/bdee2bc88)
- Embedding profile env files are now read as UTF-8 to avoid failures with non-ASCII characters.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [86675983b](https://github.com/vectorize-io/hindsight/commit/86675983b)
- Batch recovery is now correctly tied to the account that submitted the batch, preventing cross-account mixups.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6ff6dc692](https://github.com/vectorize-io/hindsight/commit/6ff6dc692)
- Provider content-policy refusals during retain are treated as permanent failures rather than endlessly retried.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b81a3742b](https://github.com/vectorize-io/hindsight/commit/b81a3742b)
- Control plane: clearing the memories query no longer closes the search view unexpectedly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9ef1f1b84](https://github.com/vectorize-io/hindsight/commit/9ef1f1b84)
- Re-retain now correctly deletes chunks that were removed when content is reduced, preventing stale data from lingering.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [801f4910e](https://github.com/vectorize-io/hindsight/commit/801f4910e)
- Query analyzer no longer misinterprets lone four-digit numbers as years.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e20bb290f](https://github.com/vectorize-io/hindsight/commit/e20bb290f)
- Knowledge tree writes are serialized to prevent write conflicts and corruption under concurrency.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [ea9efa860](https://github.com/vectorize-io/hindsight/commit/ea9efa860)
- CLI now exits with a non-zero status when configured with an invalid API URL, making failures script-friendly.· [![@Alan5168](https://github.com/Alan5168.png?size=40)@Alan5168](https://github.com/Alan5168)· [71029fb81](https://github.com/vectorize-io/hindsight/commit/71029fb81)
- Retain strict-schema behavior is now honored consistently for batch processing.· [![@kamilfurtak](https://github.com/kamilfurtak.png?size=40)@kamilfurtak](https://github.com/kamilfurtak)· [2bba17ee4](https://github.com/vectorize-io/hindsight/commit/2bba17ee4)
- Bank configuration is validated and persisted atomically to prevent partial or inconsistent config saves.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2e0af7550](https://github.com/vectorize-io/hindsight/commit/2e0af7550)
- Consolidation now respects the configured temperature setting when generating consolidated results.· [![@lusoris](https://github.com/lusoris.png?size=40)@lusoris](https://github.com/lusoris)· [31cb1c2c8](https://github.com/vectorize-io/hindsight/commit/31cb1c2c8)
- Retain now fails closed on malformed memory-defense policies instead of skipping screening.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [400fd3684](https://github.com/vectorize-io/hindsight/commit/400fd3684)
- Mental model refresh now removes references to facts that no longer exist, preventing stale citations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ba97f8585](https://github.com/vectorize-io/hindsight/commit/ba97f8585)
- Misconfigured retain settings now fail loudly instead of silently falling back to defaults.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cc2dd3945](https://github.com/vectorize-io/hindsight/commit/cc2dd3945)
- Ollama free-form calls now use the API path that honors num\_ctx, improving context-window correctness.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2409c2d5a](https://github.com/vectorize-io/hindsight/commit/2409c2d5a)
- Voyage embeddings preserve asymmetric query/passage behavior to maintain retrieval quality.· [![@Tosko4](https://github.com/Tosko4.png?size=40)@Tosko4](https://github.com/Tosko4)· [4d03f7d48](https://github.com/vectorize-io/hindsight/commit/4d03f7d48)
- Knowledge-base page staleness is now computed per scope rather than from the bank watermark, improving accuracy.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a5d00660b](https://github.com/vectorize-io/hindsight/commit/a5d00660b)
- Embedding configuration now inherits unspecified LLM settings instead of overwriting them with defaults.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [e4e5f8b28](https://github.com/vectorize-io/hindsight/commit/e4e5f8b28)
- Recall budget limits now apply all the way through vector-index querying, improving predictability of results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [31c1aaf21](https://github.com/vectorize-io/hindsight/commit/31c1aaf21)
- Recall performance is improved by avoiding inefficient query plans on nested observation graph lookups.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5f137bf39](https://github.com/vectorize-io/hindsight/commit/5f137bf39)
- Embedded daemon/UI lifecycle is hardened to reduce startup/shutdown errors and improve stability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d98990b46](https://github.com/vectorize-io/hindsight/commit/d98990b46)
- Consolidation preserves source dates when observations are merged, improving timeline accuracy.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2e2dfe130](https://github.com/vectorize-io/hindsight/commit/2e2dfe130)
- Null metadata values are dropped during retain and recall to prevent invalid metadata from propagating.· [![@NovaLux12](https://github.com/NovaLux12.png?size=40)@NovaLux12](https://github.com/NovaLux12)· [19318ac08](https://github.com/vectorize-io/hindsight/commit/19318ac08)
- Secret redaction uses ASCII token boundaries so secrets adjacent to CJK text are properly detected and removed.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [e181fb75c](https://github.com/vectorize-io/hindsight/commit/e181fb75c)
- Mental models now ensure only one refresh is queued at a time, preventing refresh backlogs and duplication.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d69c53739](https://github.com/vectorize-io/hindsight/commit/d69c53739)
- Knowledge-base page triggers are now patched (not replaced) on create/update, preserving existing trigger settings.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b64943d19](https://github.com/vectorize-io/hindsight/commit/b64943d19)
- List endpoints for mental models and directives now return a correct total count for pagination.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [803a45171](https://github.com/vectorize-io/hindsight/commit/803a45171)
- Automatic cache affinity is disabled for Azure OpenAI to avoid routing issues and instability.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [7850efcef](https://github.com/vectorize-io/hindsight/commit/7850efcef)
- Memory updated\_at is now refreshed on all writes that change a memory, improving freshness tracking and sync behaviors.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b919b97df](https://github.com/vectorize-io/hindsight/commit/b919b97df)
- Retention sweep is now batched to prevent it from stalling foreground queries.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0480f171e](https://github.com/vectorize-io/hindsight/commit/0480f171e)
- Recall with long BM25 queries keeps the most selective terms, improving relevance and avoiding degraded search results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a37257ede](https://github.com/vectorize-io/hindsight/commit/a37257ede)
- Retain writes keep entity postings and witness coverage consistent by applying them together in one write group.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f660a4ad8](https://github.com/vectorize-io/hindsight/commit/f660a4ad8)
- A mental model's last\_refreshed\_at records when the refresh finished again, not the source-data watermark, which is now carried by the new last\_memory\_seen\_at. Clients testing staleness against last\_memory\_write\_at should compare last\_memory\_seen\_at.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8fbdc6bf7](https://github.com/vectorize-io/hindsight/commit/8fbdc6bf7)
- Maintenance skips a schema under concurrent schema change instead of deadlocking against it.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [435f1640b](https://github.com/vectorize-io/hindsight/commit/435f1640b)
- Vertex AI's EU and US regional endpoints work again instead of returning 404.· [![@ferrastas](https://github.com/ferrastas.png?size=40)@ferrastas](https://github.com/ferrastas)· [3e6a812f7](https://github.com/vectorize-io/hindsight/commit/3e6a812f7)
- The embedded daemon no longer flashes console windows on Windows.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [3f14672ea](https://github.com/vectorize-io/hindsight/commit/3f14672ea)

## [0.9.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.9.1) [​](https://hindsight.vectorize.io/changelog\#091 "Direct link to 091")

**Features**

- Add per-bank store capability checks, including the ability for a store to mark a bank as read-only (close it to writes).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6c5857813](https://github.com/vectorize-io/hindsight/commit/6c5857813)
- Allow selected HTTP request headers to be forwarded to extensions.· [![@rares-mollie](https://github.com/rares-mollie.png?size=40)@rares-mollie](https://github.com/rares-mollie)· [27d4386de](https://github.com/vectorize-io/hindsight/commit/27d4386de)
- Add asynchronous document export for bank transfers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [00b520e59](https://github.com/vectorize-io/hindsight/commit/00b520e59)
- Improve bank import/export by preserving the Knowledge Pages tree and rebuilding related search state on import.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fd294227c](https://github.com/vectorize-io/hindsight/commit/fd294227c)
- Make all bank configuration fields exportable and importable via bank templates.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3e3e3f372](https://github.com/vectorize-io/hindsight/commit/3e3e3f372)
- Add a new xAI OAuth LLM provider for using LLM lanes with a SuperGrok subscription.· [![@JoshFunnell](https://github.com/JoshFunnell.png?size=40)@JoshFunnell](https://github.com/JoshFunnell)· [82852c522](https://github.com/vectorize-io/hindsight/commit/82852c522)
- Add an opt-in forced-tool mode to produce structured outputs when using LiteLLM providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7b35d2c6f](https://github.com/vectorize-io/hindsight/commit/7b35d2c6f)

**Improvements**

- Restore server-side prompt caching when using load-balanced OpenAI-compatible backends.· [![@JoshFunnell](https://github.com/JoshFunnell.png?size=40)@JoshFunnell](https://github.com/JoshFunnell)· [e62015cbf](https://github.com/vectorize-io/hindsight/commit/e62015cbf)
- Speed up recall by making temporal extraction significantly faster without changing results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e8c42f2a7](https://github.com/vectorize-io/hindsight/commit/e8c42f2a7)
- Speed up recall scoring by evaluating observation expansion as sets instead of per-candidate rows.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e6fb5d479](https://github.com/vectorize-io/hindsight/commit/e6fb5d479)
- Improve recall efficiency by reusing entity IDs already returned in results to avoid redundant fetches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [00acde015](https://github.com/vectorize-io/hindsight/commit/00acde015)
- Reduce large entity-pruning sweeps by processing entity pruning through a queue.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [681a79e6b](https://github.com/vectorize-io/hindsight/commit/681a79e6b)
- Make graph maintenance job submission smarter by deduplicating against running jobs as well as pending ones.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [a763109d8](https://github.com/vectorize-io/hindsight/commit/a763109d8)

**Bug Fixes**

- Prevent recall from crashing when given extreme relative date offsets in queries.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [423e25db4](https://github.com/vectorize-io/hindsight/commit/423e25db4)
- Ensure retrieved evidence is never dropped when synthesis is forced during reflection.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [07aec3b95](https://github.com/vectorize-io/hindsight/commit/07aec3b95)
- Fix document statements being incorrectly shared across banks by scoping them to the correct bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [da8077ade](https://github.com/vectorize-io/hindsight/commit/da8077ade)
- Prevent lost turns when appending to the same document concurrently.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [11a4eda80](https://github.com/vectorize-io/hindsight/commit/11a4eda80)
- Fix batched file uploads so each file gets a unique storage key.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [45713adcc](https://github.com/vectorize-io/hindsight/commit/45713adcc)
- Fix markdown table rendering in structured documents.· [![@dragonkid](https://github.com/dragonkid.png?size=40)@dragonkid](https://github.com/dragonkid)· [e9a14da69](https://github.com/vectorize-io/hindsight/commit/e9a14da69)
- Fix knowledge base search errors on deployments without native text-search backends.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [18bff79ae](https://github.com/vectorize-io/hindsight/commit/18bff79ae)
- Fix Knowledge Pages search to use PGroonga when configured, improving correctness and reliability.· [![@JiehoonKwak](https://github.com/JiehoonKwak.png?size=40)@JiehoonKwak](https://github.com/JiehoonKwak)· [81b58934d](https://github.com/vectorize-io/hindsight/commit/81b58934d)
- Add a DB-independent liveness probe so slow databases don’t cause pods to restart unnecessarily.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [00bad1711](https://github.com/vectorize-io/hindsight/commit/00bad1711)
- Validate UUID inputs for entity and observation-history endpoints to prevent bad requests from triggering server errors.· [![@Alan5168](https://github.com/Alan5168.png?size=40)@Alan5168](https://github.com/Alan5168)· [862a77c1a](https://github.com/vectorize-io/hindsight/commit/862a77c1a)
- Fix OpenAI/LLM reasoning handling by preserving literal inline <think> text and honoring configured reasoning effort.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [39ee97a61](https://github.com/vectorize-io/hindsight/commit/39ee97a61)
- Fix Llama.cpp requests so extra request fields (extra\_body) are correctly passed through.· [![@handnewb](https://github.com/handnewb.png?size=40)@handnewb](https://github.com/handnewb)· [650da8c1e](https://github.com/vectorize-io/hindsight/commit/650da8c1e)
- Make Ollama “think” behavior configurable via extra request fields (extra\_body).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3a4b0214f](https://github.com/vectorize-io/hindsight/commit/3a4b0214f)
- Prevent reranking failures/timeouts by batching FlashRank passage scoring instead of using an unbounded single pass.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3e1b4611c](https://github.com/vectorize-io/hindsight/commit/3e1b4611c)
- Prevent bank deletion deadlocks involving vector index schema changes during concurrent deletes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d733772e3](https://github.com/vectorize-io/hindsight/commit/d733772e3)
- Validate bank configuration value types to prevent misconfigurations from wedging background tasks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2cf31d7fb](https://github.com/vectorize-io/hindsight/commit/2cf31d7fb)
- Improve transfer import handling by rejecting invalid import ZIPs with a clear 400 error explaining how to fix it.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d506641dc](https://github.com/vectorize-io/hindsight/commit/d506641dc)
- Fix whole-bank import to assign fresh internal IDs to avoid collisions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d7c33fdea](https://github.com/vectorize-io/hindsight/commit/d7c33fdea)
- Fix document upload cleanup so failed uploads are correctly deleted.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [78f1a0ef0](https://github.com/vectorize-io/hindsight/commit/78f1a0ef0)
- Avoid database lock issues by using a consistent lock order when inserting memory links.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [83a080f90](https://github.com/vectorize-io/hindsight/commit/83a080f90)
- Fix long-running or stuck mental-model delta operations by tracing the call and decoupling its completion cap.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [500ab70f1](https://github.com/vectorize-io/hindsight/commit/500ab70f1)
- Fix consolidation after multi-round drains by refreshing all affected mental models.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [64ede3617](https://github.com/vectorize-io/hindsight/commit/64ede3617)
- Fix consolidation batching so sibling tag groups are canceled when a batch fails, preventing cascading stuck work.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dca002551](https://github.com/vectorize-io/hindsight/commit/dca002551)
- Fix pending consolidation statistics by removing memories that have permanently failed.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dbe0ffb98](https://github.com/vectorize-io/hindsight/commit/dbe0ffb98)
- Fix embed daemon shutdown detection to use actual port occupancy instead of an unreliable health probe.· [![@Alan5168](https://github.com/Alan5168.png?size=40)@Alan5168](https://github.com/Alan5168)· [c094ac27d](https://github.com/vectorize-io/hindsight/commit/c094ac27d)

## [0.9.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.9.0) [​](https://hindsight.vectorize.io/changelog\#090 "Direct link to 090")

**Features**

- Add per-bank toggles to enable/disable temporal search, graph expansion, and reranking during recall.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [d3946f17c](https://github.com/vectorize-io/hindsight/commit/d3946f17c)
- Allow configuring a per-budget cap on how many candidates the reranker considers during recall.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [359e619a4](https://github.com/vectorize-io/hindsight/commit/359e619a4)
- Add a reranker failover chain so recall can fall back across multiple reranker configurations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [76d8ba8a5](https://github.com/vectorize-io/hindsight/commit/76d8ba8a5)
- Add configurable locale detection for date parsing in the query analyzer.· [![@yufanw03](https://github.com/yufanw03.png?size=40)@yufanw03](https://github.com/yufanw03)· [f2ae61eda](https://github.com/vectorize-io/hindsight/commit/f2ae61eda)
- Add support for the OpenAI Responses API via a new `openai-responses` LLM provider.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [55883dc51](https://github.com/vectorize-io/hindsight/commit/55883dc51)
- Add a generic per-input token cap for embeddings across providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8e953c230](https://github.com/vectorize-io/hindsight/commit/8e953c230)
- Allow per-operation overrides of extra LLM request body fields via configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cac55feda](https://github.com/vectorize-io/hindsight/commit/cac55feda)
- Introduce Knowledge Pages: client-managed knowledge content with Control Plane UI and `hindsight fs` CLI management.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [218e6d34b](https://github.com/vectorize-io/hindsight/commit/218e6d34b)
- Add tools to troubleshoot mental model refreshes, including dry-run mode and trace retention.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [06e9c7054](https://github.com/vectorize-io/hindsight/commit/06e9c7054)
- Surface structured output for reflect/mental-model operations in the Control Plane.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4278f0989](https://github.com/vectorize-io/hindsight/commit/4278f0989)
- Introduce Hindsight Coding Agents: harness-pluggable long-term memory for coding agents.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b5d8439c8](https://github.com/vectorize-io/hindsight/commit/b5d8439c8)
- Add a local daemon mode for Coding Agents and let users choose the server during installation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e1b3d438e](https://github.com/vectorize-io/hindsight/commit/e1b3d438e)
- Add `--import-conversations` to Coding Agents to migrate/import conversations from older per-agent plugins.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [17b7f46ae](https://github.com/vectorize-io/hindsight/commit/17b7f46ae)
- Add a headless CLI tool to ingest/sync an Obsidian vault (`hindsight-obsidian-sync`).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [93fa0b016](https://github.com/vectorize-io/hindsight/commit/93fa0b016)
- Add a recall option to prefer returning observations (via OpenClaw integration).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d19f54c77](https://github.com/vectorize-io/hindsight/commit/d19f54c77)
- Allow `agent_knowledge_recall` (Agent SDK) to request source chunks alongside results.· [![@chethanuk](https://github.com/chethanuk.png?size=40)@chethanuk](https://github.com/chethanuk)· [cd4064939](https://github.com/vectorize-io/hindsight/commit/cd4064939)
- Add support for custom OCR headers in the file parser.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [f61d383ac](https://github.com/vectorize-io/hindsight/commit/f61d383ac)

**Improvements**

- Improve security and reliability of outbound webhooks by hardening delivery destinations and response handling.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ad85affb1](https://github.com/vectorize-io/hindsight/commit/ad85affb1)
- Add Hermes-branded bank templates grounded in real Hermes user stories.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [5e557dbfc](https://github.com/vectorize-io/hindsight/commit/5e557dbfc)
- Require an explicit Coding Agents install target (e.g., `install all` or a specific harness) to avoid accidental installs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [05b55d20f](https://github.com/vectorize-io/hindsight/commit/05b55d20f)
- Make the memories storage backend pluggable so deployments can swap storage implementations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b769045b6](https://github.com/vectorize-io/hindsight/commit/b769045b6)
- Add Control Plane indicators for documents being updated by an in-flight retain operation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3868c8d05](https://github.com/vectorize-io/hindsight/commit/3868c8d05)
- Show the originating coding agent’s logo on documents and memories in the Control Plane.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [aa38790dd](https://github.com/vectorize-io/hindsight/commit/aa38790dd)
- Improve the Control Plane UI design system and visual consistency.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bf6c12d55](https://github.com/vectorize-io/hindsight/commit/bf6c12d55)

**Bug Fixes**

- Fix bank restore/import so label entities are correctly classified.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [53948468a](https://github.com/vectorize-io/hindsight/commit/53948468a)
- Fix workers leaving behind in-progress operations by reconciling still-owned operations when a worker stops.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c15b565c8](https://github.com/vectorize-io/hindsight/commit/c15b565c8)
- Prevent scheduled mental-model refresh jobs from enqueueing duplicate work.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [afdea53a9](https://github.com/vectorize-io/hindsight/commit/afdea53a9)
- Improve entity deduplication within a batch to avoid duplicate/variant entities being created.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [25a7237b1](https://github.com/vectorize-io/hindsight/commit/25a7237b1)
- Fix recalls so `created_after`/`created_before` time windows also constrain graph expansion.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bda7ffd28](https://github.com/vectorize-io/hindsight/commit/bda7ffd28)
- Fix embeddings so local providers honor configured query/document prompts.· [![@jpmf33](https://github.com/jpmf33.png?size=40)@jpmf33](https://github.com/jpmf33)· [468cc4b7d](https://github.com/vectorize-io/hindsight/commit/468cc4b7d)
- Fix LLM retry behavior to release concurrency permits during backoff to avoid unnecessary throttling.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [f6b3ce3e3](https://github.com/vectorize-io/hindsight/commit/f6b3ce3e3)
- Prevent unbounded log growth in the embedding daemon.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [9d828cc7b](https://github.com/vectorize-io/hindsight/commit/9d828cc7b)
- Keep observations in the original source language during consolidation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [42e8c53da](https://github.com/vectorize-io/hindsight/commit/42e8c53da)
- Prevent mental model documents from being overwritten by delta-window candidates.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ba5a4813b](https://github.com/vectorize-io/hindsight/commit/ba5a4813b)
- Ensure internal (non-HTTP) recall paths also enforce the query token cap.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5c15f28af](https://github.com/vectorize-io/hindsight/commit/5c15f28af)
- Return a proper 422 error when recall requests specify invalid fact types.· [![@tao943](https://github.com/tao943.png?size=40)@tao943](https://github.com/tao943)· [4b76d8be2](https://github.com/vectorize-io/hindsight/commit/4b76d8be2)
- Fix retention so metadata updates are applied even when memories are otherwise unchanged.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [751deb47b](https://github.com/vectorize-io/hindsight/commit/751deb47b)
- Fix auto-splitting of overlong retention output by unifying the OutputTooLong error handling.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f572d8647](https://github.com/vectorize-io/hindsight/commit/f572d8647)
- Show accurate last-write timestamps for banks and documents in the API.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1ce308f35](https://github.com/vectorize-io/hindsight/commit/1ce308f35)
- Improve database connection handling so pooled connections aren’t held across embedding/LLM calls, reducing contention and timeouts.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [24825200b](https://github.com/vectorize-io/hindsight/commit/24825200b)
- Retry embedding connect timeouts for TEI-based embedding providers.· [![@jooneyp](https://github.com/jooneyp.png?size=40)@jooneyp](https://github.com/jooneyp)· [417efb35d](https://github.com/vectorize-io/hindsight/commit/417efb35d)
- Fix delete operations to sweep orphan entities even when no relink victims were enqueued.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [797faf798](https://github.com/vectorize-io/hindsight/commit/797faf798)
- Fix configuration errors to explicitly report which fields are disallowed when permissions are violated.· [![@kubaodias](https://github.com/kubaodias.png?size=40)@kubaodias](https://github.com/kubaodias)· [13cacf21a](https://github.com/vectorize-io/hindsight/commit/13cacf21a)
- Fix Coding Agents session import attribution to use recorded working directory (cwd) rather than the session name.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d238d2f7d](https://github.com/vectorize-io/hindsight/commit/d238d2f7d)
- Fix Coding Agents Devin transcript ingestion by using node:sqlite and failing early if it’s missing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [333812c85](https://github.com/vectorize-io/hindsight/commit/333812c85)
- Fix macOS installs so they work without requiring a Rust toolchain.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8de576b4b](https://github.com/vectorize-io/hindsight/commit/8de576b4b)

## [0.8.6](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.6) [​](https://hindsight.vectorize.io/changelog\#086 "Direct link to 086")

**Features**

- Control plane: add document tag filtering and a unified facet chip UI for browsing memories.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3a1841c42](https://github.com/vectorize-io/hindsight/commit/3a1841c42)
- Reflect: add an option to apply directives across all scopes (bypass directive tag scoping) when needed.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6a460d2c9](https://github.com/vectorize-io/hindsight/commit/6a460d2c9)
- Retain: detect and report documents that produce zero extracted facts at write time.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9452ac29d](https://github.com/vectorize-io/hindsight/commit/9452ac29d)
- Configuration: allow per-operation overrides of LLM reasoning\_effort.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b1a0ef5f7](https://github.com/vectorize-io/hindsight/commit/b1a0ef5f7)
- Temporal parsing: add Russian temporal period rules for better date/period understanding.· [![@dimonnld](https://github.com/dimonnld.png?size=40)@dimonnld](https://github.com/dimonnld)· [4724f26d3](https://github.com/vectorize-io/hindsight/commit/4724f26d3)
- Configuration: make embedding thresholds configurable.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [ada3329bb](https://github.com/vectorize-io/hindsight/commit/ada3329bb)
- Control plane: display the API version in the sidebar.· [![@handnewb](https://github.com/handnewb.png?size=40)@handnewb](https://github.com/handnewb)· [7a9ea7058](https://github.com/vectorize-io/hindsight/commit/7a9ea7058)
- Engine: add a bulk API to delete multiple memory units in one operation.· [![@chrislatimer](https://github.com/chrislatimer.png?size=40)@chrislatimer](https://github.com/chrislatimer)· [64fe5e81f](https://github.com/vectorize-io/hindsight/commit/64fe5e81f)
- API/UI: filter memory lists by linked entity and add an entity timeline view.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c41ad9bd7](https://github.com/vectorize-io/hindsight/commit/c41ad9bd7)
- Extensions: support extension-owned, bank-scoped tables with automatic provisioning.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [57c18bc29](https://github.com/vectorize-io/hindsight/commit/57c18bc29)
- Configuration: allow per-bank overrides for storing document text (store\_document\_text).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6a0b85f10](https://github.com/vectorize-io/hindsight/commit/6a0b85f10)
- TypeScript client: support custom HTTP headers on requests.· [![@menelsystemsbot](https://github.com/menelsystemsbot.png?size=40)@menelsystemsbot](https://github.com/menelsystemsbot)· [dbf3b9d9b](https://github.com/vectorize-io/hindsight/commit/dbf3b9d9b)
- Engine: add created\_before filtering to list\_memory\_units to query memories by ingest age.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [441cf2272](https://github.com/vectorize-io/hindsight/commit/441cf2272)
- Observability: a stalled /health check now self-diagnoses — it reports whether the event loop is blocked or the database connection pool is exhausted.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [489d55fa6](https://github.com/vectorize-io/hindsight/commit/489d55fa6)
- Added a GitHub Copilot CLI integration that recalls memory before a session and retains a summary after.· [![@ScottGuymer](https://github.com/ScottGuymer.png?size=40)@ScottGuymer](https://github.com/ScottGuymer)· [6500944c7](https://github.com/vectorize-io/hindsight/commit/6500944c7)

**Improvements**

- Reflect: fail fast on unusable tool calls instead of attempting to salvage leaked text, improving correctness and safety.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [678ca0e90](https://github.com/vectorize-io/hindsight/commit/678ca0e90)
- Performance: reduce redundant graph seeding and UUID scans for faster operation on large datasets.· [![@zommiommy](https://github.com/zommiommy.png?size=40)@zommiommy](https://github.com/zommiommy)· [b475f5cca](https://github.com/vectorize-io/hindsight/commit/b475f5cca)
- Retain: reject misplaced file retain metadata to prevent invalid ingestion requests.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [1fa2de332](https://github.com/vectorize-io/hindsight/commit/1fa2de332)
- Workers: per-type slot settings are now named `HINDSIGHT_API_WORKER_<TYPE>_RESERVED_SLOTS`, since they reserve a guaranteed minimum rather than cap concurrency. The old `*_MAX_SLOTS` names keep working but log a deprecation warning.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [979999651](https://github.com/vectorize-io/hindsight/commit/979999651)
- Python 3.14 is now supported.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a514d3962](https://github.com/vectorize-io/hindsight/commit/a514d3962)

**Bug Fixes**

- Control plane: dark mode styling now correctly follows the configured dark theme class.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [94f4adfbe](https://github.com/vectorize-io/hindsight/commit/94f4adfbe)
- Python and other clients: expose mental-model query controls (and async retain operation\_id) so callers can tune queries and track async operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [70c09adcf](https://github.com/vectorize-io/hindsight/commit/70c09adcf)
- Reflect: mental-model scoping is now applied correctly for empty scopes.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [c5643fdf5](https://github.com/vectorize-io/hindsight/commit/c5643fdf5)
- Graph maintenance: fix a race between enqueuing maintenance work and worker draining to prevent missed/duplicated queue work.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [40d2b7f6b](https://github.com/vectorize-io/hindsight/commit/40d2b7f6b)
- Oracle support: fix full-text/vector and audit/log related SQL issues to improve compatibility and reliability on Oracle.· [![@dcbouius](https://github.com/dcbouius.png?size=40)@dcbouius](https://github.com/dcbouius)· [4f4c2988e](https://github.com/vectorize-io/hindsight/commit/4f4c2988e)
- Tracing/observability: provider responses are now safely serialized even when unvalidated.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [b8e1524a1](https://github.com/vectorize-io/hindsight/commit/b8e1524a1)
- TEI embeddings/reranking: automatically retry on HTTP 429 backpressure to reduce transient failures.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [91160f3ba](https://github.com/vectorize-io/hindsight/commit/91160f3ba)
- Workers: prevent wedged retain jobs from occupying worker slots indefinitely.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8133c5ab7](https://github.com/vectorize-io/hindsight/commit/8133c5ab7)
- LLM integrations: reasoning\_effort is now consistently sent across tool paths/providers (including Codex).· [![@merlinr68](https://github.com/merlinr68.png?size=40)@merlinr68](https://github.com/merlinr68)· [9a1ba951f](https://github.com/vectorize-io/hindsight/commit/9a1ba951f)
- Batch retain: improve retry/recovery so parent jobs can be re-run and stranded work is reconciled after failures.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ac4df7eb8](https://github.com/vectorize-io/hindsight/commit/ac4df7eb8)
- Transfers/import: preserve consolidation lifecycle state when importing an entire bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [af196287e](https://github.com/vectorize-io/hindsight/commit/af196287e)
- Local embeddings/reranking: default to CPU on Apple Silicon to avoid an MPS memory leak.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2620a2a3f](https://github.com/vectorize-io/hindsight/commit/2620a2a3f)
- Claude Code integration: reflect tool calls now work and honor the configured model.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8f19087c2](https://github.com/vectorize-io/hindsight/commit/8f19087c2)
- Control plane: audit-log and observations tabs now respect resolved per-bank configuration, and observations inheritance is preserved.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ed248447e](https://github.com/vectorize-io/hindsight/commit/ed248447e)
- Library import: avoid dotenv side effects when importing Hindsight as a dependency.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5792b2b86](https://github.com/vectorize-io/hindsight/commit/5792b2b86)
- Consolidation: stop emitting an unsupported maxItems field that broke AWS Bedrock consolidation.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [c908fade1](https://github.com/vectorize-io/hindsight/commit/c908fade1)
- Retain/dry run: return free-form entities from dry-run extraction and accept a text alias in fact extraction inputs.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [f7ff5341f](https://github.com/vectorize-io/hindsight/commit/f7ff5341f)
- Graph: edited/restored memories are now re-queued for relinking so links stay up to date.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [73b575c7a](https://github.com/vectorize-io/hindsight/commit/73b575c7a)
- Curation: preserve causal links across edit and invalidate/restore operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0e5aa8896](https://github.com/vectorize-io/hindsight/commit/0e5aa8896)
- Auth: ensure bank writes are authorized before provisioning occurs.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [0f47c7a8d](https://github.com/vectorize-io/hindsight/commit/0f47c7a8d)
- Helm/Kubernetes: ensure workers use the correct API port override to avoid service-discovery failures.· [![@Fyko](https://github.com/Fyko.png?size=40)@Fyko](https://github.com/Fyko)· [d29f4703e](https://github.com/vectorize-io/hindsight/commit/d29f4703e)
- Mental models: fix delta refresh watermarking so refreshes anchor to the newest processed memory.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [af8cf142d](https://github.com/vectorize-io/hindsight/commit/af8cf142d)
- Retain: async retries are now idempotent via caller-supplied operation\_id.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [31218127e](https://github.com/vectorize-io/hindsight/commit/31218127e)
- CLI: preserve HTTP 400 error details to make failures easier to diagnose.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [1ff09ccf9](https://github.com/vectorize-io/hindsight/commit/1ff09ccf9)
- LLM endpoints: normalize LM Studio/Ollama base URLs to /v1 for compatibility.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [47a7d4380](https://github.com/vectorize-io/hindsight/commit/47a7d4380)
- Retain/linking: fix within-batch cosine similarity and adjust causal-target offsets to improve link quality.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [7b161740d](https://github.com/vectorize-io/hindsight/commit/7b161740d)
- Backups: fix restore schema compatibility issues.· [![@oldnicke](https://github.com/oldnicke.png?size=40)@oldnicke](https://github.com/oldnicke)· [3cc371382](https://github.com/vectorize-io/hindsight/commit/3cc371382)
- Retain: oversized append-only documents are recognized as appends again, so re-ingesting long histories no longer re-extracts everything from scratch.· [![@Korayem](https://github.com/Korayem.png?size=40)@Korayem](https://github.com/Korayem)· [a6c875156](https://github.com/vectorize-io/hindsight/commit/a6c875156)
- Retain: fix a database deadlock where flushing statistics took a second connection while the first still held uncommitted row locks, which could hang a retain indefinitely (notably on Oracle, where no deadlock error is raised).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6d5157575](https://github.com/vectorize-io/hindsight/commit/6d5157575)

**Other**

- Zapier: remove the memoryDefenseTriggered trigger (gated capability) from the integration surface.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [e57765e01](https://github.com/vectorize-io/hindsight/commit/e57765e01)

## [0.8.5](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.5) [​](https://hindsight.vectorize.io/changelog\#085 "Direct link to 085")

**Features**

- Add opt-in request dumps for rejected (4xx) LLM calls to make diagnosing provider errors easier.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [be6caf9dc](https://github.com/vectorize-io/hindsight/commit/be6caf9dc)
- Add an optional fail-on-extraction-errors mode for retain(), allowing stricter handling when fact extraction fails.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [ec3b415c4](https://github.com/vectorize-io/hindsight/commit/ec3b415c4)
- Add tag-based filtering to memory listing endpoints (list\_memories and list\_memory\_units).· [![@superafun](https://github.com/superafun.png?size=40)@superafun](https://github.com/superafun)· [c1fadc008](https://github.com/vectorize-io/hindsight/commit/c1fadc008)
- Allow deleting terminal bank operations via the API (with control-plane support).· [![@chethanuk](https://github.com/chethanuk.png?size=40)@chethanuk](https://github.com/chethanuk)· [dcef72480](https://github.com/vectorize-io/hindsight/commit/dcef72480)
- Allow overriding audit logging settings per bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0d2dbe756](https://github.com/vectorize-io/hindsight/commit/0d2dbe756)
- Add support for pg0:// URLs carrying optional user/password credentials for easier configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0c38d46ee](https://github.com/vectorize-io/hindsight/commit/0c38d46ee)
- Add a configurable cap on planner parallelism to reduce connection pool pressure on busy deployments.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [347b9c23c](https://github.com/vectorize-io/hindsight/commit/347b9c23c)
- Support Anthropic Message Batches (batch API) for discounted token usage.· [![@hb-cam](https://github.com/hb-cam.png?size=40)@hb-cam](https://github.com/hb-cam)· [7f2df54e0](https://github.com/vectorize-io/hindsight/commit/7f2df54e0)
- Add Anthropic prompt caching support (including carrying cache markers in batch system prompts) to reduce repeated prompt costs.· [![@hb-cam](https://github.com/hb-cam.png?size=40)@hb-cam](https://github.com/hb-cam)· [7c3a5619f](https://github.com/vectorize-io/hindsight/commit/7c3a5619f)
- Add step-by-step context caching for Gemini tool loops to improve efficiency across multi-step tool interactions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [81aa4979b](https://github.com/vectorize-io/hindsight/commit/81aa4979b)

**Improvements**

- Add bank attribution for remote reranker calls to improve per-bank observability and accounting.· [![@Jordan-Jarvis](https://github.com/Jordan-Jarvis.png?size=40)@Jordan-Jarvis](https://github.com/Jordan-Jarvis)· [8a7a70b82](https://github.com/vectorize-io/hindsight/commit/8a7a70b82)

**Bug Fixes**

- Recover from malformed LLM JSON responses using a last-resort repair fallback, reducing failures on structured outputs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a23187a45](https://github.com/vectorize-io/hindsight/commit/a23187a45)
- Ensure per-operation strict JSON schema handling works correctly and respects explicit per-call opt-out.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9fe339dfb](https://github.com/vectorize-io/hindsight/commit/9fe339dfb)
- Improve compatibility with OpenAI-style tool calling by emitting canonical tool-result messages and preserving required tools for custom endpoints.· [![@Jordan-Jarvis](https://github.com/Jordan-Jarvis.png?size=40)@Jordan-Jarvis](https://github.com/Jordan-Jarvis)· [434dbee64](https://github.com/vectorize-io/hindsight/commit/434dbee64)
- Fix Claude Code LLM calls with max\_turns=1 by preventing built-in tools from interfering with single-turn requests.· [![@peter216](https://github.com/peter216.png?size=40)@peter216](https://github.com/peter216)· [b82fb603c](https://github.com/vectorize-io/hindsight/commit/b82fb603c)
- Increase reliability of retain() fact extraction by handling retries/edge cases (zero retry budgets, boundary batches, degenerate text) and preserving fact alignment.· [![@chethanuk](https://github.com/chethanuk.png?size=40)@chethanuk](https://github.com/chethanuk)· [912f8e22d](https://github.com/vectorize-io/hindsight/commit/912f8e22d)
- Make retain() more robust by reasserting resolved entities before linking and standardizing extracted entities as plain strings.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0679d38e8](https://github.com/vectorize-io/hindsight/commit/0679d38e8)
- Preserve bank attribution and refresh search vectors during memory curation, improving correctness of curated memories.· [![@Jordan-Jarvis](https://github.com/Jordan-Jarvis.png?size=40)@Jordan-Jarvis](https://github.com/Jordan-Jarvis)· [6ba98c040](https://github.com/vectorize-io/hindsight/commit/6ba98c040)
- Fix audit coverage so memory updates are properly recorded when auditing is enabled.· [![@handnewb](https://github.com/handnewb.png?size=40)@handnewb](https://github.com/handnewb)· [000fb9ddb](https://github.com/vectorize-io/hindsight/commit/000fb9ddb)
- Repair vector index coverage per bank after restore/upgrade to prevent missing or incomplete search results.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bd853be35](https://github.com/vectorize-io/hindsight/commit/bd853be35)
- Improve stability and correctness of background operation processing (retry budgeting, completing successful operations, bounding terminal history, and isolating side-effect failures).· [![@handnewb](https://github.com/handnewb.png?size=40)@handnewb](https://github.com/handnewb)· [234f5a062](https://github.com/vectorize-io/hindsight/commit/234f5a062)
- Fix delta refresh watermark handling so no-op refreshes still advance and don’t cause repeated processing.· [![@SunneeYang](https://github.com/SunneeYang.png?size=40)@SunneeYang](https://github.com/SunneeYang)· [c1fae2ae1](https://github.com/vectorize-io/hindsight/commit/c1fae2ae1)
- Fix PostgreSQL startup to honor credentials embedded in the database URL.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [820019f3c](https://github.com/vectorize-io/hindsight/commit/820019f3c)
- Fix database migrations to correctly handle percent-encoded database URLs and install maintenance routines in the configured schema.· [![@Jordan-Jarvis](https://github.com/Jordan-Jarvis.png?size=40)@Jordan-Jarvis](https://github.com/Jordan-Jarvis)· [8bd9ce194](https://github.com/vectorize-io/hindsight/commit/8bd9ce194)
- Improve date parsing by selecting the strongest match and fixing day+month+year interpretation (avoids collapsing to whole-month dates).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [d28b85273](https://github.com/vectorize-io/hindsight/commit/d28b85273)
- Fix crashes and incorrect results in Chinese temporal extraction (including year-0 edge cases).· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [5f1a86765](https://github.com/vectorize-io/hindsight/commit/5f1a86765)
- Prevent oversized embedding requests from failing by truncating inputs before embedding.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [263eba134](https://github.com/vectorize-io/hindsight/commit/263eba134)
- Improve consolidation robustness by requesting JSON dedup decisions and normalizing/handling invalid dedup actions safely.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [6d82c8a55](https://github.com/vectorize-io/hindsight/commit/6d82c8a55)
- Fix memory browsing endpoints to return associated metadata.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [5cc1482a7](https://github.com/vectorize-io/hindsight/commit/5cc1482a7)
- Preserve JSONB and timestamp provenance during transfers to avoid losing data fidelity.· [![@Korayem](https://github.com/Korayem.png?size=40)@Korayem](https://github.com/Korayem)· [d7c32f963](https://github.com/vectorize-io/hindsight/commit/d7c32f963)
- Make LLM trace writing safer by avoiding writes during startup/shutdown races and gating on lifecycle state.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3fb33b987](https://github.com/vectorize-io/hindsight/commit/3fb33b987)

## [0.8.4](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.4) [​](https://hindsight.vectorize.io/changelog\#084 "Direct link to 084")

**Features**

- Added Requesty as an OpenAI-compatible LLM provider option.· [![@Thibaultjaigu](https://github.com/Thibaultjaigu.png?size=40)@Thibaultjaigu](https://github.com/Thibaultjaigu)· [6eb85570a](https://github.com/vectorize-io/hindsight/commit/6eb85570a)
- Recall can now return structured per-stage scores and supports two-level min\_scores filtering for finer result control.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [758f346d3](https://github.com/vectorize-io/hindsight/commit/758f346d3)
- Mental models can now be refreshed on a cron schedule automatically.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dae18b1fa](https://github.com/vectorize-io/hindsight/commit/dae18b1fa)
- Multi-LLM setups now support configuring LiteLLM Router and Vertex service account keys.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [47992d843](https://github.com/vectorize-io/hindsight/commit/47992d843)
- Multi-LLM configurations can now set Vertex AI project and region per indexed member.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [4fe477eaa](https://github.com/vectorize-io/hindsight/commit/4fe477eaa)
- Added multi-LLM failover and round-robin selection via indexed configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f7c7a62e5](https://github.com/vectorize-io/hindsight/commit/f7c7a62e5)
- Added Atlas Cloud as an OpenAI-compatible LLM provider option.· [![@lucaszhu-hue](https://github.com/lucaszhu-hue.png?size=40)@lucaszhu-hue](https://github.com/lucaszhu-hue)· [f8d277697](https://github.com/vectorize-io/hindsight/commit/f8d277697)
- Recall can now prefer observations to avoid returning raw facts that have been superseded.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5f0b71551](https://github.com/vectorize-io/hindsight/commit/5f0b71551)
- Recall supports configurable recency decay (linear, exponential, or none) to tune ranking toward recent memory.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a2166ee4f](https://github.com/vectorize-io/hindsight/commit/a2166ee4f)
- Local reranking can now accelerate on Intel XPU where available.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [1a09a9ccc](https://github.com/vectorize-io/hindsight/commit/1a09a9ccc)
- Added an Aider integration to bracket sessions and persist memory more cleanly.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [aab703207](https://github.com/vectorize-io/hindsight/commit/aab703207)
- Added an Eve (Microsoft Agent Framework) MCP connection helper for easier integration.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [d0b77f5be](https://github.com/vectorize-io/hindsight/commit/d0b77f5be)
- Added a Windsurf (Codeium) integration via MCP.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [7194f98b1](https://github.com/vectorize-io/hindsight/commit/7194f98b1)
- Added a GitHub Copilot (VS Code) integration via MCP.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [91bf32842](https://github.com/vectorize-io/hindsight/commit/91bf32842)

**Improvements**

- Memory explorer now shows full memory details for easier inspection and debugging.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [f8ce15b9b](https://github.com/vectorize-io/hindsight/commit/f8ce15b9b)
- Bank stats are faster and more scalable, with a refresh option to force recomputation when needed.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d68f61896](https://github.com/vectorize-io/hindsight/commit/d68f61896)
- LLM configuration now supports per-operation temperature control for more predictable behavior across different workflows.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a27754fb1](https://github.com/vectorize-io/hindsight/commit/a27754fb1)
- Reflect structured output will retry fewer times, reducing latency and avoiding runaway retries.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [85599f3ef](https://github.com/vectorize-io/hindsight/commit/85599f3ef)
- Standalone workers now warn when worker\_id is missing or unstable, helping prevent misconfigured deployments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [680305aea](https://github.com/vectorize-io/hindsight/commit/680305aea)
- Recall tracing now reports phase timing that matches total request duration more accurately.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9e06237e4](https://github.com/vectorize-io/hindsight/commit/9e06237e4)
- Token usage reporting now includes cached tokens and model “thoughts” tokens where available.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [b4874672f](https://github.com/vectorize-io/hindsight/commit/b4874672f)
- MCP responses omit reflect directives\_applied by default to reduce noise in traces.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [246803bcf](https://github.com/vectorize-io/hindsight/commit/246803bcf)
- Control plane upload size limit is now configurable.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5543992d7](https://github.com/vectorize-io/hindsight/commit/5543992d7)
- Database migrations are faster and more flexible, including optional extension reconciliation and dropping an unused global vector index.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [51cb32896](https://github.com/vectorize-io/hindsight/commit/51cb32896)

**Bug Fixes**

- Batch fact extraction now honors the configured LLM temperature, making outputs consistent with your settings.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [8ed49e438](https://github.com/vectorize-io/hindsight/commit/8ed49e438)
- CLI explore now correctly handles header selection when displaying results.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [82afa7618](https://github.com/vectorize-io/hindsight/commit/82afa7618)
- Per-scope LLM timeouts and retry policies are now correctly applied to providers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [40fe7aac8](https://github.com/vectorize-io/hindsight/commit/40fe7aac8)
- LiteLLM-backed providers now correctly apply configured default request headers.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [5e73d5ff6](https://github.com/vectorize-io/hindsight/commit/5e73d5ff6)
- Dynamic banks now correctly inherit configured defaults.· [![@devinkuhn](https://github.com/devinkuhn.png?size=40)@devinkuhn](https://github.com/devinkuhn)· [ef2e8ab7f](https://github.com/vectorize-io/hindsight/commit/ef2e8ab7f)
- Reflect now correctly parses JSON-wrapped responses from models.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [82b01ace5](https://github.com/vectorize-io/hindsight/commit/82b01ace5)
- Trace-based token/cost accounting is preserved even when tool-call argument parsing fails.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [01eda5188](https://github.com/vectorize-io/hindsight/commit/01eda5188)
- Python and TypeScript SDK wrappers now correctly pass recall min\_scores filtering options.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [cce0a2cb3](https://github.com/vectorize-io/hindsight/commit/cce0a2cb3)
- Consolidation no longer drops items when a dedup action is missing; it defaults to keeping data.· [![@koriyoshi2041](https://github.com/koriyoshi2041.png?size=40)@koriyoshi2041](https://github.com/koriyoshi2041)· [1c1cf4ce5](https://github.com/vectorize-io/hindsight/commit/1c1cf4ce5)
- Markitdown parser now correctly handles certain UTF-8 text files that begin with an ASCII prefix.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [74e82a3ea](https://github.com/vectorize-io/hindsight/commit/74e82a3ea)
- Database migration bootstrap now respects the configured vector extension.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [017b8d727](https://github.com/vectorize-io/hindsight/commit/017b8d727)
- Consolidation now keeps search vectors up-to-date for observations, improving recall quality and reliability.· [![@qxxaa](https://github.com/qxxaa.png?size=40)@qxxaa](https://github.com/qxxaa)· [21176f8ee](https://github.com/vectorize-io/hindsight/commit/21176f8ee)
- Embedding on Windows now reliably finds pythonw when installed alongside the API script.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [911d27fc5](https://github.com/vectorize-io/hindsight/commit/911d27fc5)
- Retain append mode now correctly merges JSON arrays to preserve conversation-aware chunking.· [![@qxxaa](https://github.com/qxxaa.png?size=40)@qxxaa](https://github.com/qxxaa)· [78d32cd16](https://github.com/vectorize-io/hindsight/commit/78d32cd16)
- Control plane now shows documents that are uploaded but still pending processing.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [91e095afa](https://github.com/vectorize-io/hindsight/commit/91e095afa)
- PATCH bank no longer accidentally creates new banks.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [a7d1f26f9](https://github.com/vectorize-io/hindsight/commit/a7d1f26f9)
- Dry-run extraction no longer creates banks as a side effect.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [0673131a8](https://github.com/vectorize-io/hindsight/commit/0673131a8)
- Memory defense now shows the correct number of matched patterns.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [8e66c397a](https://github.com/vectorize-io/hindsight/commit/8e66c397a)
- CLI pagination now correctly supports large limit/offset values.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [63a92bef5](https://github.com/vectorize-io/hindsight/commit/63a92bef5)
- Gemini structured output prompts no longer duplicate schema instructions.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [199ae146a](https://github.com/vectorize-io/hindsight/commit/199ae146a)
- List endpoints now reject negative limit/offset with a clear 422 error instead of a server error.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [4db8a1236](https://github.com/vectorize-io/hindsight/commit/4db8a1236)
- Reduced risk of graph maintenance queue deadlocks under concurrency.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [cabcb3bb0](https://github.com/vectorize-io/hindsight/commit/cabcb3bb0)
- Recall can now accurately filter for untagged/global observations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0ba613c3c](https://github.com/vectorize-io/hindsight/commit/0ba613c3c)
- Async operations now return a clean 404 for missing banks instead of an internal database error.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [04703d215](https://github.com/vectorize-io/hindsight/commit/04703d215)
- Bank configuration writes now validate disposition\_\* ranges to prevent invalid settings.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [387c09e91](https://github.com/vectorize-io/hindsight/commit/387c09e91)
- Anthropic strict structured output is now produced more reliably by using tool\_use instead of prompt-based injection.· [![@eldar702](https://github.com/eldar702.png?size=40)@eldar702](https://github.com/eldar702)· [cbce93704](https://github.com/vectorize-io/hindsight/commit/cbce93704)
- Bank stats no longer become stale after deletes/clears thanks to improved cache invalidation.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [f21944d78](https://github.com/vectorize-io/hindsight/commit/f21944d78)
- Bank stats cache invalidation no longer leaves stale results in some cases.· [![@zupengwang](https://github.com/zupengwang.png?size=40)@zupengwang](https://github.com/zupengwang)· [ccd3eb24c](https://github.com/vectorize-io/hindsight/commit/ccd3eb24c)
- Retain chunking is now idempotent, preventing failures when structured chunk size settings increase.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ba5ddd59a](https://github.com/vectorize-io/hindsight/commit/ba5ddd59a)

## [0.8.3](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.3) [​](https://hindsight.vectorize.io/changelog\#083 "Direct link to 083")

**Features**

- Added OpenHands integration with native MCP configuration and built-in recall/retain rules.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [65862c4fe](https://github.com/vectorize-io/hindsight/commit/65862c4fe)
- Added Zed editor integration via an MCP context server with recall/retain rules.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [539101af3](https://github.com/vectorize-io/hindsight/commit/539101af3)
- Added Continue.dev integration via an HTTP context provider.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [c05ab9103](https://github.com/vectorize-io/hindsight/commit/c05ab9103)
- Added Composio integration so Hindsight memory can be used as custom tools.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [1c9ba0e65](https://github.com/vectorize-io/hindsight/commit/1c9ba0e65)
- Added a Zapier app with actions and REST-hook triggers for automating workflows with Hindsight.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [359b2bc76](https://github.com/vectorize-io/hindsight/commit/359b2bc76)
- Added a dry-run fact extraction API endpoint to preview extraction results without saving them.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d382b340f](https://github.com/vectorize-io/hindsight/commit/d382b340f)
- Added optional MarkItDown-based OCR support for extracting text from documents.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [5ee53c512](https://github.com/vectorize-io/hindsight/commit/5ee53c512)
- Improved Chinese temporal query understanding for more accurate time-based searches.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [d0c54560a](https://github.com/vectorize-io/hindsight/commit/d0c54560a)
- Added tool annotations (read-only/destructive hints) to MCP tools for safer client behavior.· [![@yunanwg](https://github.com/yunanwg.png?size=40)@yunanwg](https://github.com/yunanwg)· [27aa6bbf4](https://github.com/vectorize-io/hindsight/commit/27aa6bbf4)
- Added support for the "shared" observation scope across consolidation and the Control Plane UI.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0a046f97a](https://github.com/vectorize-io/hindsight/commit/0a046f97a)
- Added support for exact tag matching (tags\_match=exact) across the UI and client libraries.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2f075dede](https://github.com/vectorize-io/hindsight/commit/2f075dede)
- Added Intel XPU detection to enable local embedding acceleration when available.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2fb2de1aa](https://github.com/vectorize-io/hindsight/commit/2fb2de1aa)

**Improvements**

- Exposed additional operation/worker backlog metrics to make async processing health easier to monitor.· [![@MattJackson](https://github.com/MattJackson.png?size=40)@MattJackson](https://github.com/MattJackson)· [b1fe23fbe](https://github.com/vectorize-io/hindsight/commit/b1fe23fbe)
- Added Gemini service tier configuration options.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [d68bd0742](https://github.com/vectorize-io/hindsight/commit/d68bd0742)
- API responses now omit wire-safe null fields to reduce payload size.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e20a36c95](https://github.com/vectorize-io/hindsight/commit/e20a36c95)
- Improved search recency scoring using effective-time fallback for better ranking of results.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [3d6b19af5](https://github.com/vectorize-io/hindsight/commit/3d6b19af5)
- Parallelized tenant schema migrations to reduce migration time on multi-tenant deployments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [460fc63d9](https://github.com/vectorize-io/hindsight/commit/460fc63d9)

**Bug Fixes**

- Fixed retain chunking so oversized documents no longer lose content when split into multiple sub-batches.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [81865bf87](https://github.com/vectorize-io/hindsight/commit/81865bf87)
- Fixed MCP so custom tool instructions are applied correctly again.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [f4bac2d41](https://github.com/vectorize-io/hindsight/commit/f4bac2d41)
- MCP responses no longer include reflect tool/LLM traces by default, preventing unexpected extra output.· [![@yunanwg](https://github.com/yunanwg.png?size=40)@yunanwg](https://github.com/yunanwg)· [44972d321](https://github.com/vectorize-io/hindsight/commit/44972d321)
- Prevented hung LiteLLM calls from blocking forever by enforcing a hard timeout.· [![@kubaodias](https://github.com/kubaodias.png?size=40)@kubaodias](https://github.com/kubaodias)· [551932991](https://github.com/vectorize-io/hindsight/commit/551932991)
- Fixed bank listing so bank-config disposition and mission overlays are applied consistently.· [![@PathKnower](https://github.com/PathKnower.png?size=40)@PathKnower](https://github.com/PathKnower)· [cb73790c2](https://github.com/vectorize-io/hindsight/commit/cb73790c2)
- Dry-run extraction now rejects empty/whitespace inputs and runs only after passing the precheck step.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [a92e25bcf](https://github.com/vectorize-io/hindsight/commit/a92e25bcf)
- Fixed consolidation when the LLM returns single-value source\_fact\_ids so runs don’t fail unexpectedly.· [![@haodonp](https://github.com/haodonp.png?size=40)@haodonp](https://github.com/haodonp)· [94619ce52](https://github.com/vectorize-io/hindsight/commit/94619ce52)
- Fixed metric labeling for HTTP endpoints so bank IDs are templated correctly (avoids high-cardinality labels).· [![@sireika](https://github.com/sireika.png?size=40)@sireika](https://github.com/sireika)· [4efa20472](https://github.com/vectorize-io/hindsight/commit/4efa20472)
- Fixed provider quota reset behavior by deferring retries to avoid unnecessary retry storms.· [![@oldschoola](https://github.com/oldschoola.png?size=40)@oldschoola](https://github.com/oldschoola)· [2b521c3a0](https://github.com/vectorize-io/hindsight/commit/2b521c3a0)
- Honored CODEX\_HOME for locating Codex auth.json, fixing auth in custom home directories.· [![@mdenil](https://github.com/mdenil.png?size=40)@mdenil](https://github.com/mdenil)· [0c9bc765c](https://github.com/vectorize-io/hindsight/commit/0c9bc765c)
- Fixed the Control Plane so the “shared” observation scope is selectable in the Add Document UI.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [0ca0226d3](https://github.com/vectorize-io/hindsight/commit/0ca0226d3)
- Improved output sanitization by stripping malformed reasoning tags/blocks from non-structured outputs.· [![@grimmjoww](https://github.com/grimmjoww.png?size=40)@grimmjoww](https://github.com/grimmjoww)· [7b17da7a0](https://github.com/vectorize-io/hindsight/commit/7b17da7a0)

## [0.8.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.2) [​](https://hindsight.vectorize.io/changelog\#082 "Direct link to 082")

**Features**

- Added support for observation scopes, including listing, filtering, visualization, and per-scope observation limits.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b08f43496](https://github.com/vectorize-io/hindsight/commit/b08f43496)
- Added SIEM-focused enrichment fields to Memory Defense webhook events to improve downstream security alert context.· [![@chrislatimer](https://github.com/chrislatimer.png?size=40)@chrislatimer](https://github.com/chrislatimer)· [f304ce7e0](https://github.com/vectorize-io/hindsight/commit/f304ce7e0)
- Introduced reversible memory curation so memory units can be edited, invalidated, and reverted.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [de22b606e](https://github.com/vectorize-io/hindsight/commit/de22b606e)
- Added per-bank provider cost attribution using the OpenAI "user" field.· [![@sireika](https://github.com/sireika.png?size=40)@sireika](https://github.com/sireika)· [fb16fc4fd](https://github.com/vectorize-io/hindsight/commit/fb16fc4fd)
- Added a native Nous Portal LLM provider with OAuth authentication (no external CLI dependency).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [82c7df726](https://github.com/vectorize-io/hindsight/commit/82c7df726)
- Added a per-bank LLM connectivity probe to help verify provider configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0d55a9b78](https://github.com/vectorize-io/hindsight/commit/0d55a9b78)
- Added Gemini Batch API support for retain fact extraction.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a942b1c81](https://github.com/vectorize-io/hindsight/commit/a942b1c81)
- Added support for the Gemini embedding-2 model family (per-input embeddings).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [22ae72a90](https://github.com/vectorize-io/hindsight/commit/22ae72a90)
- Improved retain ingestion by chunking JSONL files on line boundaries to avoid splitting records.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4e7780e59](https://github.com/vectorize-io/hindsight/commit/4e7780e59)
- Added an option in the UI to export a constellation as a shareable SVG poster.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0280b3486](https://github.com/vectorize-io/hindsight/commit/0280b3486)
- Added a Cursor plugin providing Hindsight persistent memory integration.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [91d767cdc](https://github.com/vectorize-io/hindsight/commit/91d767cdc)
- Added a pip-installable Cline integration package (hindsight-cline).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [36e31c675](https://github.com/vectorize-io/hindsight/commit/36e31c675)
- Added a pip-installable Cursor CLI integration package (hindsight-cursor-cli).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [c6dd08944](https://github.com/vectorize-io/hindsight/commit/c6dd08944)
- Added Hindsight memory integration for Microsoft Agent Framework (no MCP required).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [f5a6c300f](https://github.com/vectorize-io/hindsight/commit/f5a6c300f)

**Improvements**

- Added a local Control Center web app for embedded deployments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4032b2791](https://github.com/vectorize-io/hindsight/commit/4032b2791)
- Improved reflect synthesis to better respect directives and language rules in final outputs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [90ee101be](https://github.com/vectorize-io/hindsight/commit/90ee101be)
- Added support for selecting Amazon Bedrock service tier.· [![@mobilinkd](https://github.com/mobilinkd.png?size=40)@mobilinkd](https://github.com/mobilinkd)· [27cb1c684](https://github.com/vectorize-io/hindsight/commit/27cb1c684)

**Bug Fixes**

- Fixed the control-plane bank view to avoid double-loading graph data, improving performance and reducing redundant requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d81486ff9](https://github.com/vectorize-io/hindsight/commit/d81486ff9)
- Fixed per-scope observation limiting so a limit of 0 correctly prevents new observations from being created.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [f6710963e](https://github.com/vectorize-io/hindsight/commit/f6710963e)
- Improved cancellation handling so abandoned recall/reflect operations can be reliably cancelled on disconnect.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [07c85da98](https://github.com/vectorize-io/hindsight/commit/07c85da98)
- Fixed a concurrency issue where model initialization could change the global Torch default dtype, ensuring consistent float32 behavior.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [30fb287d1](https://github.com/vectorize-io/hindsight/commit/30fb287d1)
- Fixed webhook payloads to include previously missing fields.· [![@chrislatimer](https://github.com/chrislatimer.png?size=40)@chrislatimer](https://github.com/chrislatimer)· [87448b161](https://github.com/vectorize-io/hindsight/commit/87448b161)
- Fixed PostgreSQL history storage by widening history bank\_id to TEXT to prevent failures with longer IDs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [621ab7e66](https://github.com/vectorize-io/hindsight/commit/621ab7e66)
- Fixed the CLI to correctly parse get-memory responses.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [72d9881a6](https://github.com/vectorize-io/hindsight/commit/72d9881a6)
- Fixed the control-plane meeting notes flow to drop empty messages that could fail locale validation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8e6dc5fcd](https://github.com/vectorize-io/hindsight/commit/8e6dc5fcd)
- Improved rolling-deployment migration skipping to handle wrapped dependency-resolution errors more reliably.· [![@bionicbutterfly13](https://github.com/bionicbutterfly13.png?size=40)@bionicbutterfly13](https://github.com/bionicbutterfly13)· [0afa046fc](https://github.com/vectorize-io/hindsight/commit/0afa046fc)

## [0.8.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.1) [​](https://hindsight.vectorize.io/changelog\#081 "Direct link to 081")

**Features**

- Add an API configuration flag to skip storing raw document text.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1296e9fc1](https://github.com/vectorize-io/hindsight/commit/1296e9fc1)
- Add an Oh-My-OpenAgent (OMO) integration for connecting Hindsight memory to OMO workflows.· [![@dcbouius](https://github.com/dcbouius.png?size=40)@dcbouius](https://github.com/dcbouius)· [6dc56498c](https://github.com/vectorize-io/hindsight/commit/6dc56498c)
- Add a Cline integration that hooks into lifecycle events to save and retrieve Hindsight memory.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [66e58a23a](https://github.com/vectorize-io/hindsight/commit/66e58a23a)
- Add a Haystack integration to use Hindsight as a memory component in Haystack pipelines.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [394d66e60](https://github.com/vectorize-io/hindsight/commit/394d66e60)
- Add a Cursor CLI integration for capturing and using Hindsight memory from Cursor workflows.· [![@Korayem](https://github.com/Korayem.png?size=40)@Korayem](https://github.com/Korayem)· [dbfe83a2a](https://github.com/vectorize-io/hindsight/commit/dbfe83a2a)

**Improvements**

- Introduce an official Obsidian plugin to sync and use Hindsight memory from Obsidian.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [b0f86f9c0](https://github.com/vectorize-io/hindsight/commit/b0f86f9c0)
- Package the Roo Code integration as an installable PyPI CLI (hindsight-roo-code).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [644e37ac1](https://github.com/vectorize-io/hindsight/commit/644e37ac1)

**Bug Fixes**

- Fix vector index behavior to avoid forcing vchordrq.probes settings on vchord indexes that don't support it.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [109e1bd95](https://github.com/vectorize-io/hindsight/commit/109e1bd95)
- Ensure database maintenance routines are installed correctly when using the public schema.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [95d77233b](https://github.com/vectorize-io/hindsight/commit/95d77233b)

## [0.8.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.8.0) [​](https://hindsight.vectorize.io/changelog\#080 "Direct link to 080")

**Features**

- Add periodic background maintenance to reconcile consolidation state and enforce retention across tenants.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e77461762](https://github.com/vectorize-io/hindsight/commit/e77461762)
- Add durable progress snapshots for long-running consolidation and batch retain operations, so status can be resumed/inspected reliably.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c94935bfa](https://github.com/vectorize-io/hindsight/commit/c94935bfa)
- Enable LLM request tracing by default (with per-bank support) and retain traces for 1 day for easier debugging/observability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f4a3329ce](https://github.com/vectorize-io/hindsight/commit/f4a3329ce)
- Add semantic deduplication of near-duplicate observations during consolidation (enabled by default, except on Oracle).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8aa31edd4](https://github.com/vectorize-io/hindsight/commit/8aa31edd4)
- Store mental-model and observation history in dedicated database tables for better scalability and reliability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7e1145c08](https://github.com/vectorize-io/hindsight/commit/7e1145c08)
- Add a local ONNX embeddings provider so embeddings can be generated without a hosted embeddings API.· [![@shoveller](https://github.com/shoveller.png?size=40)@shoveller](https://github.com/shoveller)· [b5a324b77](https://github.com/vectorize-io/hindsight/commit/b5a324b77)
- Add whole-bank export/import for cross-instance migration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [602c9f55e](https://github.com/vectorize-io/hindsight/commit/602c9f55e)
- Add document export/import between banks without re-running the LLM (reusing previously extracted results).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1d6d73bce](https://github.com/vectorize-io/hindsight/commit/1d6d73bce)
- Add provider-agnostic prompt-prefix caching (default on) to reduce repeated LLM work for retain, consolidation, and reflect.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [d7a3aa526](https://github.com/vectorize-io/hindsight/commit/d7a3aa526)
- Add global support for sending extra provider request fields via HINDSIGHT\_API\_LLM\_EXTRA\_BODY.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [01296d8d5](https://github.com/vectorize-io/hindsight/commit/01296d8d5)
- Honor HINDSIGHT\_API\_LLM\_STRICT\_SCHEMA across all JSON-schema capable LLM providers for stricter structured outputs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a3d3d42b3](https://github.com/vectorize-io/hindsight/commit/a3d3d42b3)
- Add Superagent safety middleware integration for safer agent execution.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [b70830218](https://github.com/vectorize-io/hindsight/commit/b70830218)

**Improvements**

- Improve client SDK trace visibility by exposing reflect tool/LLM call details in the Python and TypeScript wrappers.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0db70bb88](https://github.com/vectorize-io/hindsight/commit/0db70bb88)
- Allow tuning recall behavior with configurable per-strategy retrieval boosts via environment configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [01134047d](https://github.com/vectorize-io/hindsight/commit/01134047d)
- Allow tuning semantic recall sensitivity with a configurable minimum similarity threshold (HINDSIGHT\_API\_SEMANTIC\_MIN\_SIMILARITY).· [![@zwcf5200](https://github.com/zwcf5200.png?size=40)@zwcf5200](https://github.com/zwcf5200)· [aa024a5cd](https://github.com/vectorize-io/hindsight/commit/aa024a5cd)
- Avoid an unnecessary extra LLM call during reflect when a fresh mental model can be used directly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c255d3552](https://github.com/vectorize-io/hindsight/commit/c255d3552)
- Speed up and reduce load from bank statistics queries via caching and more efficient computation.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [7683f2900](https://github.com/vectorize-io/hindsight/commit/7683f2900)
- Improve visibility when audit logs or LLM requests are disabled by showing a clear "not enabled" splash in the control plane UI.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [283419280](https://github.com/vectorize-io/hindsight/commit/283419280)
- Improve OpenCode integration observability with clearer debug logging, endpoint reporting, and surfaced errors.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [796a9eff9](https://github.com/vectorize-io/hindsight/commit/796a9eff9)

**Bug Fixes**

- Fix consolidation runs failing or truncating output by enforcing an explicit output token budget.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [c2524473e](https://github.com/vectorize-io/hindsight/commit/c2524473e)
- Reduce slow/expensive temporal recall paths by limiting how many entries are scanned per fact type.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4c33a4e55](https://github.com/vectorize-io/hindsight/commit/4c33a4e55)
- Fix pgroonga BM25 search failures by escaping query text properly.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [6b8fc53d7](https://github.com/vectorize-io/hindsight/commit/6b8fc53d7)
- Preserve correct RRF (fusion) source ranks in retrieval traces/results.· [![@zwcf5200](https://github.com/zwcf5200.png?size=40)@zwcf5200](https://github.com/zwcf5200)· [f62500193](https://github.com/vectorize-io/hindsight/commit/f62500193)
- Prevent the API from hanging indefinitely at startup by failing fast when model initialization blocks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4f5003480](https://github.com/vectorize-io/hindsight/commit/4f5003480)
- Fix recall and mental-model history support when using the Oracle database backend.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [23710f4a8](https://github.com/vectorize-io/hindsight/commit/23710f4a8)
- Validate embedding vector dimensions before writing to pgvector to prevent storage/query errors.· [![@ai-ag2026](https://github.com/ai-ag2026.png?size=40)@ai-ag2026](https://github.com/ai-ag2026)· [06c88e043](https://github.com/vectorize-io/hindsight/commit/06c88e043)
- Improve retain concurrency safety by rechecking freshness before extraction and serializing concurrent writes to the same document.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [23168ebf6](https://github.com/vectorize-io/hindsight/commit/23168ebf6)
- Fix incorrect fact attribution during retain caused by bank routing key leakage.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d695611ad](https://github.com/vectorize-io/hindsight/commit/d695611ad)
- Fix mental model creation failures by ensuring the bank exists before inserting the model.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [56b4271d9](https://github.com/vectorize-io/hindsight/commit/56b4271d9)
- Fix external Postgres setups using vchord by adding required catalogs to the session search\_path.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [049901802](https://github.com/vectorize-io/hindsight/commit/049901802)
- Improve Docker standalone diagnostics by providing a clear error when pg0 bind-mount permissions prevent startup.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [75a7c19d6](https://github.com/vectorize-io/hindsight/commit/75a7c19d6)
- Improve compatibility with LLM servers that mishandle tool\_choice="required" by falling back to a safer tool-choice mode.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e30f8af14](https://github.com/vectorize-io/hindsight/commit/e30f8af14)
- Fix Bedrock IAM authentication with the LiteLLM reranker by making the reranker API key optional.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [3c8ca47dd](https://github.com/vectorize-io/hindsight/commit/3c8ca47dd)
- Expose retain outcome metadata so users can see what happened during a retain operation.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [831f0efa1](https://github.com/vectorize-io/hindsight/commit/831f0efa1)
- Make bank config PATCH persist correctly even for banks that have never retained data yet.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a809547aa](https://github.com/vectorize-io/hindsight/commit/a809547aa)
- Prevent fact extraction prompt formatting from breaking extraction by removing Markdown bold markers.· [![@Oxygen56](https://github.com/Oxygen56.png?size=40)@Oxygen56](https://github.com/Oxygen56)· [50b7eda2a](https://github.com/vectorize-io/hindsight/commit/50b7eda2a)
- Improve recall stability/performance by gating VectorChord BM25 usage and applying per-source candidate caps.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [70d98c7a2](https://github.com/vectorize-io/hindsight/commit/70d98c7a2)
- Fix control plane UI localization issues for operations and graph legends.· [![@MapleEve](https://github.com/MapleEve.png?size=40)@MapleEve](https://github.com/MapleEve)· [a14ce623c](https://github.com/vectorize-io/hindsight/commit/a14ce623c)
- Improve transfer import reporting by including mental\_model\_history counts in CLI summaries.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [3346363d2](https://github.com/vectorize-io/hindsight/commit/3346363d2)

## [0.7.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.7.2) [​](https://hindsight.vectorize.io/changelog\#072 "Direct link to 072")

**Features**

- Added Google ADK integration to connect Hindsight memory with Google ADK agents.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [c032a74f](https://github.com/vectorize-io/hindsight/commit/c032a74f)
- Added Flowise integration with Hindsight memory tools.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [41ad2b55](https://github.com/vectorize-io/hindsight/commit/41ad2b55)
- Added Fireworks AI as a batch inference provider.· [![@Fyko](https://github.com/Fyko.png?size=40)@Fyko](https://github.com/Fyko)· [537b2812](https://github.com/vectorize-io/hindsight/commit/537b2812)
- Added Roo Code integration via MCP (including rules support) to connect Roo Code with Hindsight memory.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [bf6b9026](https://github.com/vectorize-io/hindsight/commit/bf6b9026)
- Added Vapi webhook integration to send voice-agent interactions into Hindsight memory.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [dde133da](https://github.com/vectorize-io/hindsight/commit/dde133da)
- Added Gemini Spark integration via MCP.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [7cdacc4b](https://github.com/vectorize-io/hindsight/commit/7cdacc4b)

**Improvements**

- Improved graph maintenance performance for vector search seeding (faster ANN maintenance work).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [99c7367f](https://github.com/vectorize-io/hindsight/commit/99c7367f)
- Improved vector search correctness/tuning by using cosine opclass for vchord ANN and applying backend-specific tuning settings.· [![@isac322](https://github.com/isac322.png?size=40)@isac322](https://github.com/isac322)· [e4686b92](https://github.com/vectorize-io/hindsight/commit/e4686b92)
- Reduced consolidation retry backoff to recover faster from transient failures.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f49b85c0](https://github.com/vectorize-io/hindsight/commit/f49b85c0)

**Bug Fixes**

- Fixed a control-plane i18n redirect loop by pinning the Next.js version.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [201f5d7c](https://github.com/vectorize-io/hindsight/commit/201f5d7c)
- Limited native ML thread pools to available CPU cores to prevent resource overuse and instability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0a2ee845](https://github.com/vectorize-io/hindsight/commit/0a2ee845)
- Fixed PostgreSQL upgrade issues for v0.7.x deployments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b7f267b0](https://github.com/vectorize-io/hindsight/commit/b7f267b0)
- Fixed backup/restore to include previously missing tables.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [867b7b4a](https://github.com/vectorize-io/hindsight/commit/867b7b4a)
- Made memory consolidation more reliable under concurrency by improving scope-aware locking/dispatch and atomic submission behavior.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [08ce8176](https://github.com/vectorize-io/hindsight/commit/08ce8176)
- Fixed retention of oversized documents to prevent incorrect chunk indexing and loss of full document content.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [364ccf17](https://github.com/vectorize-io/hindsight/commit/364ccf17)
- Improved retain/recall robustness for unusual Unicode inputs (special-token literals and lone surrogates).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4bc7013e](https://github.com/vectorize-io/hindsight/commit/4bc7013e)
- Fixed a race condition when inserting memory links during retain operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8cf0dcbf](https://github.com/vectorize-io/hindsight/commit/8cf0dcbf)
- Fixed Windows embedded daemon launch behavior to avoid opening an extra terminal tab.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4280ac3f](https://github.com/vectorize-io/hindsight/commit/4280ac3f)
- Improved embedded Postgres stop/restart reliability by updating the embedded DB dependency.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8d9000a8](https://github.com/vectorize-io/hindsight/commit/8d9000a8)
- Fixed CLI memory retain timestamp handling and corrected supported fact-type values.· [![@slayoffer](https://github.com/slayoffer.png?size=40)@slayoffer](https://github.com/slayoffer)· [df73c792](https://github.com/vectorize-io/hindsight/commit/df73c792)
- Fixed directive listing/reflect to honor tag groups so filtering behaves as expected.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [fb554664](https://github.com/vectorize-io/hindsight/commit/fb554664)
- Fixed daemon networking to honor an explicitly configured host and port.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [77380211](https://github.com/vectorize-io/hindsight/commit/77380211)
- Isolated the Claude Code provider subprocess from user plugins to prevent interference and improve reliability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bcae23d9](https://github.com/vectorize-io/hindsight/commit/bcae23d9)
- Improved daemon startup reliability by waiting for health before reclaiming its port.· [![@s09x](https://github.com/s09x.png?size=40)@s09x](https://github.com/s09x)· [5e547f71](https://github.com/vectorize-io/hindsight/commit/5e547f71)
- Made worker retry behavior respect the configured maximum retries.· [![@aaronwestphal](https://github.com/aaronwestphal.png?size=40)@aaronwestphal](https://github.com/aaronwestphal)· [85f6769e](https://github.com/vectorize-io/hindsight/commit/85f6769e)
- Prevented retain from silently dropping memories when fact extraction fails.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6e734e1a](https://github.com/vectorize-io/hindsight/commit/6e734e1a)
- Fixed control-plane auth redirects to validate return targets and honor basePath (improving security and correct routing).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9571a341](https://github.com/vectorize-io/hindsight/commit/9571a341)
- Preserved raw reranker scores for providers that already return calibrated \[0,1\] scores.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [18b9c596](https://github.com/vectorize-io/hindsight/commit/18b9c596)

## [0.7.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.7.1) [​](https://hindsight.vectorize.io/changelog\#071 "Direct link to 071")

**Features**

- Allow configuring LLM "reasoning effort" via environment variable.· [![@s9rkn](https://github.com/s9rkn.png?size=40)@s9rkn](https://github.com/s9rkn)· [1890d2b7](https://github.com/vectorize-io/hindsight/commit/1890d2b7)
- Add per-provider HTTP timeout environment variables for reranker requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a510b07a](https://github.com/vectorize-io/hindsight/commit/a510b07a)
- Add additional Chinese locale variants in the control plane UI.· [![@MapleEve](https://github.com/MapleEve.png?size=40)@MapleEve](https://github.com/MapleEve)· [617939d8](https://github.com/vectorize-io/hindsight/commit/617939d8)

**Improvements**

- Schedule consolidation work using bank priorities so higher-priority banks are processed first.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cf637799](https://github.com/vectorize-io/hindsight/commit/cf637799)
- Expose "graph\_maintenance" in the control plane operations type filter dropdown.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [691cb539](https://github.com/vectorize-io/hindsight/commit/691cb539)

**Bug Fixes**

- Make consolidation more reliable by retrying indefinitely with backoff and preventing duplicate work per bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0d2ba56f](https://github.com/vectorize-io/hindsight/commit/0d2ba56f)
- Fixed memory corruption when retaining large documents that exceeded a single LLM call — some extracted memories could be lost. Re-retain affected documents after upgrading.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [74525cc0](https://github.com/vectorize-io/hindsight/commit/74525cc0)
- Improve Codex OAuth embeddings stability by adding token refresh support and follow-up fixes.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [ffa6fbf2](https://github.com/vectorize-io/hindsight/commit/ffa6fbf2)
- Fix recall recency scoring to anchor timestamps to the query time for more consistent results.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [2de19e57](https://github.com/vectorize-io/hindsight/commit/2de19e57)

## [0.7.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.7.0) [​](https://hindsight.vectorize.io/changelog\#070 "Direct link to 070")

**Features**

- Added support for ParadeDB pg\_search as a Citus-compatible BM25 search backend.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4cd260b6](https://github.com/vectorize-io/hindsight/commit/4cd260b6)
- Added tokenizer configuration for pg\_search to better control how text is tokenized for search.· [![@Sanderhoff-alt](https://github.com/Sanderhoff-alt.png?size=40)@Sanderhoff-alt](https://github.com/Sanderhoff-alt)· [16f80769](https://github.com/vectorize-io/hindsight/commit/16f80769)
- Added a new embeddings provider: ZeroEntropy.· [![@flamerged](https://github.com/flamerged.png?size=40)@flamerged](https://github.com/flamerged)· [ec49175f](https://github.com/vectorize-io/hindsight/commit/ec49175f)
- Added support for Codex OAuth-based embeddings authentication.· [![@haha0815](https://github.com/haha0815.png?size=40)@haha0815](https://github.com/haha0815)· [d802f914](https://github.com/vectorize-io/hindsight/commit/d802f914)
- Added an API endpoint to clear mental model content.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7bd11bed](https://github.com/vectorize-io/hindsight/commit/7bd11bed)
- Added targeted consolidation by observation scope to focus consolidation on specific parts of memory.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ac3ab2b5](https://github.com/vectorize-io/hindsight/commit/ac3ab2b5)
- Added support for the Alibaba Qwen3 rerank model.· [![@quicklyfast](https://github.com/quicklyfast.png?size=40)@quicklyfast](https://github.com/quicklyfast)· [b83bb87d](https://github.com/vectorize-io/hindsight/commit/b83bb87d)
- Added Right Agent integration.· [![@onsails](https://github.com/onsails.png?size=40)@onsails](https://github.com/onsails)· [203ddfdd](https://github.com/vectorize-io/hindsight/commit/203ddfdd)
- Added an OpenCode Go LLM provider.· [![@tevenfeng](https://github.com/tevenfeng.png?size=40)@tevenfeng](https://github.com/tevenfeng)· [c29c76e3](https://github.com/vectorize-io/hindsight/commit/c29c76e3)

**Improvements**

- Added configurable BM25 language/tokenization and optional PGroonga backend for better multilingual search tuning.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cb04cb79](https://github.com/vectorize-io/hindsight/commit/cb04cb79)
- Added an environment variable to enable API access logging (Uvicorn access logs).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [25387083](https://github.com/vectorize-io/hindsight/commit/25387083)
- Control plane now exposes a UI action to clear the mental model.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [6e9b741b](https://github.com/vectorize-io/hindsight/commit/6e9b741b)
- Improved observation consolidation quality, including better handling of temporal reasoning.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d1ef9da9](https://github.com/vectorize-io/hindsight/commit/d1ef9da9)
- Control plane now supports internationalization with 8 locales.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [486c3a8b](https://github.com/vectorize-io/hindsight/commit/486c3a8b)

**Bug Fixes**

- Fixed stale outgoing links after deletions by recomputing links asynchronously.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cc3ba4a3](https://github.com/vectorize-io/hindsight/commit/cc3ba4a3)
- Fixed Codex configuration to ignore inherited base URLs and automatically refresh OAuth access tokens.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [795c081d](https://github.com/vectorize-io/hindsight/commit/795c081d)
- Stopped sending the temperature parameter to Anthropic requests to avoid API incompatibilities.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dabbf9ff](https://github.com/vectorize-io/hindsight/commit/dabbf9ff)
- Prevented duplicate webhook batch deliveries for retain events.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [6348f424](https://github.com/vectorize-io/hindsight/commit/6348f424)
- Improved reliability for large retain requests by splitting oversized single items in batch retains.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c3b2b154](https://github.com/vectorize-io/hindsight/commit/c3b2b154)
- Fixed Ollama support by adding an Ollama Cloud provider and correcting authentication for cloud endpoints.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cb037290](https://github.com/vectorize-io/hindsight/commit/cb037290)
- Ensured disabled tools are not included in the agent system prompt.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2582b45a](https://github.com/vectorize-io/hindsight/commit/2582b45a)
- Avoided retries when an embeddings provider returns invalid vector dimensions.· [![@ai-ag2026](https://github.com/ai-ag2026.png?size=40)@ai-ag2026](https://github.com/ai-ag2026)· [e1e1a5e0](https://github.com/vectorize-io/hindsight/commit/e1e1a5e0)
- Prevented prompt formatting errors by escaping literal braces in all user-supplied prompt fields.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [67ae2a41](https://github.com/vectorize-io/hindsight/commit/67ae2a41)
- Fixed issues with mental-model baseline refresh and capped history size to prevent database JSON overflow.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [44b34c89](https://github.com/vectorize-io/hindsight/commit/44b34c89)
- Enabled gzip handling to keep graph responses parseable when compressed.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [31d1e172](https://github.com/vectorize-io/hindsight/commit/31d1e172)
- Added per-operation LLM concurrency caps to prevent overload and improve stability under parallel workloads.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [daf2348b](https://github.com/vectorize-io/hindsight/commit/daf2348b)
- Preserved tag group/triggers correctly when updating tags.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [9c161e4e](https://github.com/vectorize-io/hindsight/commit/9c161e4e)
- Improved reranking robustness by detecting pre-normalized scores and applying rank-based normalization when needed.· [![@xuli500177](https://github.com/xuli500177.png?size=40)@xuli500177](https://github.com/xuli500177)· [dcf5588e](https://github.com/vectorize-io/hindsight/commit/dcf5588e)
- Fixed entity resolution so user-defined label entities are not fuzzy-matched incorrectly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [46dd2dfd](https://github.com/vectorize-io/hindsight/commit/46dd2dfd)
- Improved worker resilience by handling stale pending schema routines.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [592f01bb](https://github.com/vectorize-io/hindsight/commit/592f01bb)
- Fixed embedded UI startup on Windows by resolving the correct npx path before launch.· [![@tuancookiez-hub](https://github.com/tuancookiez-hub.png?size=40)@tuancookiez-hub](https://github.com/tuancookiez-hub)· [2e5186a6](https://github.com/vectorize-io/hindsight/commit/2e5186a6)
- Improved control-plane session security by verifying signed session cookies instead of just checking presence.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [878ef957](https://github.com/vectorize-io/hindsight/commit/878ef957)

## [0.6.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.6.2) [​](https://hindsight.vectorize.io/changelog\#062 "Direct link to 062")

**Features**

- Added a configurable MCP request timeout to the Claude Code integration so long-running recall/reflect calls no longer time out at the default.· [![@rsaulo](https://github.com/rsaulo.png?size=40)@rsaulo](https://github.com/rsaulo)· [55ef7067](https://github.com/vectorize-io/hindsight/commit/55ef7067)

**Improvements**

- Renamed the Agent SDK `agent_knowledge_recall``max_results` parameter to `max_tokens` and raised the default from 10 to 1024 so default-config users get useful recall results.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [d9dd1499](https://github.com/vectorize-io/hindsight/commit/d9dd1499)
- Applied the same `max_results`→`max_tokens` rename to the Claude Code MCP plugin so both integrations stay in sync.· [![@offendingcommit](https://github.com/offendingcommit.png?size=40)@offendingcommit](https://github.com/offendingcommit)· [909a4fd4](https://github.com/vectorize-io/hindsight/commit/909a4fd4)

**Security**

- Bumped vulnerable dependencies across the stack to address GitHub-reported CVEs — including litellm to ≥1.83.14, urllib3 to 2.7.0, and additional high/critical pip and npm packages.· [![@dcbouius](https://github.com/dcbouius.png?size=40)@dcbouius](https://github.com/dcbouius)· [fd05bdab](https://github.com/vectorize-io/hindsight/commit/fd05bdab)

**Bug Fixes**

- Fixed the CLI “memory retain” timestamp/Event Date option so the provided timestamp is actually sent to the API.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [51ea9aa2](https://github.com/vectorize-io/hindsight/commit/51ea9aa2)
- Repaired a database migration issue affecting mental model subtype data at the current schema head.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [debbd919](https://github.com/vectorize-io/hindsight/commit/debbd919)
- Improved migration robustness by handling transient database OID errors during the embedding-dimension migration.· [![@dcbouius](https://github.com/dcbouius.png?size=40)@dcbouius](https://github.com/dcbouius)· [9dfbfb4b](https://github.com/vectorize-io/hindsight/commit/9dfbfb4b)
- Fixed Claude Code knowledge `get_page` calls to request `detail=content` and avoid tool-result spillover so full page content returns reliably.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [b2a693ab](https://github.com/vectorize-io/hindsight/commit/b2a693ab)
- Applied the same `agent_knowledge_get_page``detail=content` fix to the Agent SDK so SDK callers also receive full page content.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [b593d40f](https://github.com/vectorize-io/hindsight/commit/b593d40f)
- Aligned the Paperclip integration with Paperclip's actual event payload shape, restoring correct fact extraction from incoming events.· [![@amirhmoradi](https://github.com/amirhmoradi.png?size=40)@amirhmoradi](https://github.com/amirhmoradi)· [be908d5b](https://github.com/vectorize-io/hindsight/commit/be908d5b)

## [0.6.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.6.1) [​](https://hindsight.vectorize.io/changelog\#061 "Direct link to 061")

**Features**

- Added AlloyDB ScaNN vector index support, providing a high-performance vector index option for AlloyDB deployments· [![@can1357](https://github.com/can1357.png?size=40)@can1357](https://github.com/can1357)· [e4422a9b](https://github.com/vectorize-io/hindsight/commit/e4422a9b)
- Added map-type entity labels so entity extraction can produce structured groups (e.g. address fields) instead of flat strings· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [2b725bc4](https://github.com/vectorize-io/hindsight/commit/2b725bc4)
- Added z.ai (智谱) as a first-class LLM provider with a free-tier-friendly default model· [![@Burgunthy](https://github.com/Burgunthy.png?size=40)@Burgunthy](https://github.com/Burgunthy)· [4c75cd9e](https://github.com/vectorize-io/hindsight/commit/4c75cd9e)
- Added a litellmrouter provider that lets the API call multiple LLM endpoints with automatic fallback chains· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [98f33cbf](https://github.com/vectorize-io/hindsight/commit/98f33cbf)
- Added an optional read-only database backend for recall queries, letting recall traffic go to a replica while writes stay on the primary· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [cf9b1f59](https://github.com/vectorize-io/hindsight/commit/cf9b1f59)
- Added optional access-key login to the Control Plane for protecting the admin UI without a full SSO setup· [![@ariel-ai-bot](https://github.com/ariel-ai-bot.png?size=40)@ariel-ai-bot](https://github.com/ariel-ai-bot)· [c0ff87ea](https://github.com/vectorize-io/hindsight/commit/c0ff87ea)
- Added a `--strategy` flag to `memory retain-files` in the CLI for selecting how files are split before retention· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [375747f5](https://github.com/vectorize-io/hindsight/commit/375747f5)
- Bank dropdown in the Control Plane now shows per-bank memory counts to make bank selection easier· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5a0cb4a5](https://github.com/vectorize-io/hindsight/commit/5a0cb4a5)

**Improvements**

- Worker progress-stats fanout is now scoped to schemas with pending work, eliminating wasted polling on idle tenants· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [39d31ad2](https://github.com/vectorize-io/hindsight/commit/39d31ad2)

**Bug Fixes**

- Fixed fact extraction reliability by removing multiplicative retry layers that could turn one transient LLM failure into many· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a22e8bdd](https://github.com/vectorize-io/hindsight/commit/a22e8bdd)
- Fixed reflect to read document metadata from the original retain parameters so reflect outputs include the right document context· [![@nepenth](https://github.com/nepenth.png?size=40)@nepenth](https://github.com/nepenth)· [f2a2f9fe](https://github.com/vectorize-io/hindsight/commit/f2a2f9fe)
- Failed batch\_retain operations now propagate the child error\_message to the parent, so failures surface a meaningful reason instead of a generic error· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [7b82d05b](https://github.com/vectorize-io/hindsight/commit/7b82d05b)
- Fixed macOS daemon mode by replacing os.fork() with subprocess.Popen, restoring compatibility with PyTorch MPS· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8d77976a](https://github.com/vectorize-io/hindsight/commit/8d77976a)
- Hardened Control Plane access-key authentication and improved login UX (clearer errors, redirect handling)· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b628716f](https://github.com/vectorize-io/hindsight/commit/b628716f)
- Reduced retain memory pressure by clearing content references after use, helping long-running workers avoid OOM on large batches· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c9145805](https://github.com/vectorize-io/hindsight/commit/c9145805)
- Fixed Docker image to chmod 755 /home/hindsight so containers run cleanly with --user UID:GID overrides· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a5cef602](https://github.com/vectorize-io/hindsight/commit/a5cef602)
- Hard-pinned meta packages (hindsight-api, hindsight-all, hindsight-all-slim) to matching hindsight-api-slim, preventing stale slim installs after upgrade· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a86d5381](https://github.com/vectorize-io/hindsight/commit/a86d5381)
- Worker now probes pg\_proc before calling the optional schemas\_with\_pending\_work() function, so older databases without it don't crash the worker· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a1c1b7de](https://github.com/vectorize-io/hindsight/commit/a1c1b7de)
- TypeScript client now derives CLIENT\_VERSION via tsup define so the published package version is always reported correctly· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ab8cc3e6](https://github.com/vectorize-io/hindsight/commit/ab8cc3e6)

## [0.6.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.6.0) [​](https://hindsight.vectorize.io/changelog\#060 "Direct link to 060")

**Features**

- Added Dify integration providing Hindsight memory tools inside Dify workflows.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [bc23750b](https://github.com/vectorize-io/hindsight/commit/bc23750b)
- Added n8n community node package for using Hindsight memory in n8n automations.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [c1eaf711](https://github.com/vectorize-io/hindsight/commit/c1eaf711)
- Added SmolAgents integration providing Hindsight memory tools for SmolAgents-based agents.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [8314de5e](https://github.com/vectorize-io/hindsight/commit/8314de5e)
- Added AWS Bedrock AgentCore Runtime integration (hindsight-agentcore).· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [c91696f5](https://github.com/vectorize-io/hindsight/commit/c91696f5)
- Added an Oracle Database backend option for enterprise storage.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [50f559c9](https://github.com/vectorize-io/hindsight/commit/50f559c9)
- Added the ability to cancel long-running async operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [7f30dcc7](https://github.com/vectorize-io/hindsight/commit/7f30dcc7)
- Typescript client now supports AbortSignal across all methods for request cancellation.· [![@harryplusplus](https://github.com/harryplusplus.png?size=40)@harryplusplus](https://github.com/harryplusplus)· [8367930c](https://github.com/vectorize-io/hindsight/commit/8367930c)

**Improvements**

- Python client now exposes retain\_async via retain()/aretain() for async memory retention flows.· [![@harryplusplus](https://github.com/harryplusplus.png?size=40)@harryplusplus](https://github.com/harryplusplus)· [daae8223](https://github.com/vectorize-io/hindsight/commit/daae8223)
- Anthropic provider now supports environment-configurable max retries and default headers.· [![@TuftyBruno](https://github.com/TuftyBruno.png?size=40)@TuftyBruno](https://github.com/TuftyBruno)· [fa4bf700](https://github.com/vectorize-io/hindsight/commit/fa4bf700)
- Memories timeseries stats can now be grouped by different time fields (time\_field toggle).· [![@aliu-ronin](https://github.com/aliu-ronin.png?size=40)@aliu-ronin](https://github.com/aliu-ronin)· [cf1a97ab](https://github.com/vectorize-io/hindsight/commit/cf1a97ab)
- Improved database performance for observation reads by reducing overhead and making reads backend-aware.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [d8ec2d7f](https://github.com/vectorize-io/hindsight/commit/d8ec2d7f)

**Bug Fixes**

- Fixed search ranking by correcting BM25 score direction for the vchord backend.· [![@liling](https://github.com/liling.png?size=40)@liling](https://github.com/liling)· [b322b0c5](https://github.com/vectorize-io/hindsight/commit/b322b0c5)
- Recall now correctly inherits observation entities through source\_memory\_ids, improving entity continuity across related memories.· [![@youchi1](https://github.com/youchi1.png?size=40)@youchi1](https://github.com/youchi1)· [8507095a](https://github.com/vectorize-io/hindsight/commit/8507095a)
- Entity co-occurrence timestamps now use the event date instead of the ingestion time, improving timeline accuracy.· [![@aliu-ronin](https://github.com/aliu-ronin.png?size=40)@aliu-ronin](https://github.com/aliu-ronin)· [fc624cbf](https://github.com/vectorize-io/hindsight/commit/fc624cbf)
- Daemon mode now respects configured host settings (CLI --host and HINDSIGHT\_API\_HOST).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3d3aa76b](https://github.com/vectorize-io/hindsight/commit/3d3aa76b)
- Webhooks are now processed tenant-aware to prevent cross-tenant routing issues.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [b9069c28](https://github.com/vectorize-io/hindsight/commit/b9069c28)
- API per-document graph and counts now include observations, improving completeness of document-level views.· [![@youchi1](https://github.com/youchi1.png?size=40)@youchi1](https://github.com/youchi1)· [7cc2daf4](https://github.com/vectorize-io/hindsight/commit/7cc2daf4)
- Improved compatibility with OpenAI-compatible providers by hardening JSON response parsing and handling null content.· [![@voarsh2](https://github.com/voarsh2.png?size=40)@voarsh2](https://github.com/voarsh2)· [bc14e5c4](https://github.com/vectorize-io/hindsight/commit/bc14e5c4)
- Fixed Windows worker startup by handling platforms that don't implement add\_signal\_handler.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [08b56fdc](https://github.com/vectorize-io/hindsight/commit/08b56fdc)
- Retain/batch retain reliability improved by fixing transactional atomicity, recovery checkpoint scoping, and a cascade deadlock risk.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [f4ca3038](https://github.com/vectorize-io/hindsight/commit/f4ca3038)
- Typescript client now exposes previously missing recall/reflect parameters.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [641b3912](https://github.com/vectorize-io/hindsight/commit/641b3912)
- MCP recall tool now exposes tag\_groups so recalls can be filtered/grouped by tag groups.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b948b574](https://github.com/vectorize-io/hindsight/commit/b948b574)
- Embed/daemon startup reliability improved (script path resolution, correct extras when spawning API, and safer subprocess output handling).· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [0f15f76a](https://github.com/vectorize-io/hindsight/commit/0f15f76a)
- Configuration logging now redacts database URLs to avoid leaking credentials in logs.· [![@xmh1011](https://github.com/xmh1011.png?size=40)@xmh1011](https://github.com/xmh1011)· [2bada2db](https://github.com/vectorize-io/hindsight/commit/2bada2db)
- Fixed support for OpenAI-compatible embedding dimensions by allowing provider-specific parameters.· [![@zwcf5200](https://github.com/zwcf5200.png?size=40)@zwcf5200](https://github.com/zwcf5200)· [324b4b0a](https://github.com/vectorize-io/hindsight/commit/324b4b0a)

## [0.5.6](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.6) [​](https://hindsight.vectorize.io/changelog\#056 "Direct link to 056")

**Bug Fixes**

- Reverted the JSON schema simplification introduced in 0.5.5 (`5b1c3486`). The change inlined `$ref`/`$defs` into a large blob that caused some LLMs (notably GPT-4o-mini in soft-enforcement mode) to echo the schema structure instead of producing valid responses, resulting in 0 facts extracted during retain. **If you are on 0.5.5, upgrade to 0.5.6 immediately.**

## [0.5.5](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.5) [​](https://hindsight.vectorize.io/changelog\#055 "Direct link to 055")

warning

**0.5.5 contains a regression that can cause 0 facts to be extracted during retain.** The JSON schema simplification change (`5b1c3486`) was reverted in [0.5.6](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.6). Please upgrade to 0.5.6.

**Features**

- Added a new LlamaParse file parser, using the LlamaIndex Cloud parsing API to convert documents (PDF, DOCX, etc.) to markdown before retain.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [91106f30](https://github.com/vectorize-io/hindsight/commit/91106f30)
- Added a new Mental Models list view and tag filtering from mental models.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8fbe85f0](https://github.com/vectorize-io/hindsight/commit/8fbe85f0)
- Added Pipecat voice AI pipeline integration so voice agents can use Hindsight long-term memory.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [f7cc9ad6](https://github.com/vectorize-io/hindsight/commit/f7cc9ad6)
- Added an option to force IPv4 for Gemini embeddings to improve compatibility in restricted network environments.· [![@connorblack](https://github.com/connorblack.png?size=40)@connorblack](https://github.com/connorblack)· [6fb8ac97](https://github.com/vectorize-io/hindsight/commit/6fb8ac97)
- Added support to control Cohere embedding output dimensions via configuration.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a7514e18](https://github.com/vectorize-io/hindsight/commit/a7514e18)
- Added a new Document Chunks API plus document reprocessing and a richer document detail experience in the UI.· [8eb6e0e5b](https://github.com/vectorize-io/hindsight/commit/8eb6e0e5b)
- Added an exclude\_parents filter for list operations to better control what results are returned.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8f6e0e5b](https://github.com/vectorize-io/hindsight/commit/8f6e0e5b)
- Operation responses now include retry information (retry count and next retry time).· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [45f47a91](https://github.com/vectorize-io/hindsight/commit/45f47a91)
- Retain results now include processed content token counts for better usage/throughput visibility.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [9c9d7917](https://github.com/vectorize-io/hindsight/commit/9c9d7917)

**Improvements**

- Added full Windows support for the embedded runtime and improved how the local API is discovered/launched.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4ba54d8c](https://github.com/vectorize-io/hindsight/commit/4ba54d8c)
- Operation status reporting now includes processing and cancelled states across the API and UI.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [80982da5](https://github.com/vectorize-io/hindsight/commit/80982da5)
- Workers can reserve per-operation slots when claiming tasks, improving fairness and throughput under load.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c81e62ae](https://github.com/vectorize-io/hindsight/commit/c81e62ae)
- PostgreSQL connections now support a configurable statement timeout to prevent runaway queries.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [bdb3a55d](https://github.com/vectorize-io/hindsight/commit/bdb3a55d)
- ~~Improved LLM interoperability by simplifying JSON schemas and avoiding problematic tool-choice defaults.~~ _Reverted in 0.5.6 — caused 0 facts extracted with some LLMs._· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5b1c3486](https://github.com/vectorize-io/hindsight/commit/5b1c3486)
- Worker scheduling no longer allows child tasks to block parent execution.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a49d19cd](https://github.com/vectorize-io/hindsight/commit/a49d19cd)

**Bug Fixes**

- Fixed DeepSeek compatibility issues (including tool-calling quirks) and added it as a first-class LLM provider.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [461b00d4](https://github.com/vectorize-io/hindsight/commit/461b00d4)
- Fixed Amazon Bedrock Converse compatibility by adjusting how causal relations are represented.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4bc772d8](https://github.com/vectorize-io/hindsight/commit/4bc772d8)
- GET /banks/{bank\_id}/profile no longer creates a bank as a side effect.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [99a89789](https://github.com/vectorize-io/hindsight/commit/99a89789)
- Reduced memory fan-out during consolidation recall to prevent excessive retrieval and improve stability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [4ba2fffe](https://github.com/vectorize-io/hindsight/commit/4ba2fffe)
- External PostgreSQL connection strings now accept asyncpg-style URLs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [db7f4921](https://github.com/vectorize-io/hindsight/commit/db7f4921)
- Timeseries stats buckets now return timezone-aware ISO timestamps.· [![@aliu-ronin](https://github.com/aliu-ronin.png?size=40)@aliu-ronin](https://github.com/aliu-ronin)· [cd1ab497](https://github.com/vectorize-io/hindsight/commit/cd1ab497)
- Fixed conversation storage when using streaming LLM responses via LiteLLM.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [ac5181f5](https://github.com/vectorize-io/hindsight/commit/ac5181f5)
- Removed the MCP delete\_memory tool to close an authorization-bypass vulnerability.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [90674aef](https://github.com/vectorize-io/hindsight/commit/90674aef)
- First-time UI launch no longer requires manual confirmation to install the control plane.· [![@bwjoke](https://github.com/bwjoke.png?size=40)@bwjoke](https://github.com/bwjoke)· [33aacf5c](https://github.com/vectorize-io/hindsight/commit/33aacf5c)

## [0.5.4](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.4) [​](https://hindsight.vectorize.io/changelog\#054 "Direct link to 054")

**Features**

- Delta mental model refresh now scopes recall to memories created since the last refresh, making updates faster and more accurate.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e90cfa4a](https://github.com/vectorize-io/hindsight/commit/e90cfa4a)
- OpenAI-compatible embedding providers now support configurable batch sizes for better throughput.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [30700de6](https://github.com/vectorize-io/hindsight/commit/30700de6)
- Embedded daemon now includes a liveness check that auto-recovers from crashes.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [59f9a2bf](https://github.com/vectorize-io/hindsight/commit/59f9a2bf)
- Disable daemon idle timeout by default so embedded instances stay alive between requests.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f5dfe59b](https://github.com/vectorize-io/hindsight/commit/f5dfe59b)
- Add `{user_id}` template variable for retainTags in the Claude Code integration.· [![@soichisumi](https://github.com/soichisumi.png?size=40)@soichisumi](https://github.com/soichisumi)· [9181c9a2](https://github.com/vectorize-io/hindsight/commit/9181c9a2)
- New `decommission-workers` and `worker-status` admin CLI commands for managing worker fleets.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [c8b898bd](https://github.com/vectorize-io/hindsight/commit/c8b898bd)

**Bug Fixes**

- Fix duplicate memory units caused by chunk index scrambling during concurrent upserts.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [511ca723](https://github.com/vectorize-io/hindsight/commit/511ca723)
- Prevent directive content from leaking into reflect answers on empty banks.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3d877b05](https://github.com/vectorize-io/hindsight/commit/3d877b05)
- Honor the reflect\_mission identity framing in the prompt builder so agent personality works correctly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [a3b0d265](https://github.com/vectorize-io/hindsight/commit/a3b0d265)
- Allow reflect-specific LLM configuration when the default LLM provider is disabled.· [![@zwcf5200](https://github.com/zwcf5200.png?size=40)@zwcf5200](https://github.com/zwcf5200)· [afd00c03](https://github.com/vectorize-io/hindsight/commit/afd00c03)
- Preserve document `created_at` timestamp across upsert and add UI edit flow for documents.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [10785666](https://github.com/vectorize-io/hindsight/commit/10785666)
- Fix `ensure_ascii=False` in json.dumps for LLM prompts so non-Latin text is preserved.· [![@harryplusplus](https://github.com/harryplusplus.png?size=40)@harryplusplus](https://github.com/harryplusplus)· [d05b49a2](https://github.com/vectorize-io/hindsight/commit/d05b49a2)
- Route `update_bank` through the config resolver with generic config\_updates.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [abbd3619](https://github.com/vectorize-io/hindsight/commit/abbd3619)
- Workers now scan for active schemas before claiming tasks, preventing work on decommissioned tenants.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [7126bf8a](https://github.com/vectorize-io/hindsight/commit/7126bf8a)
- Pass DeferOperation through MemoryEngine.execute\_task so extensions can requeue work.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [858f0b3a](https://github.com/vectorize-io/hindsight/commit/858f0b3a)
- Downgrade LLM verify\_connection failure to a warning instead of crashing on startup.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9901aa1e](https://github.com/vectorize-io/hindsight/commit/9901aa1e)
- Fix `items_count` in list\_operations response to populate from result\_metadata.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [41710ba1](https://github.com/vectorize-io/hindsight/commit/41710ba1)
- Align AI SDK ReflectBasedOn types with the OpenAPI spec.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3d6b3805](https://github.com/vectorize-io/hindsight/commit/3d6b3805)
- Fix database migration path by merging divergent Alembic heads for v0.5.3.· [![@grimmjoww](https://github.com/grimmjoww.png?size=40)@grimmjoww](https://github.com/grimmjoww)· [487e2a5e](https://github.com/vectorize-io/hindsight/commit/487e2a5e)
- Lower OpenCode retainEveryNTurns default from 10 to 3 for more frequent memory saves.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [902704df](https://github.com/vectorize-io/hindsight/commit/902704df)

## [0.5.3](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.3) [​](https://hindsight.vectorize.io/changelog\#053 "Direct link to 053")

**Features**

- Add a setting to limit how many memories can be consolidated per round, helping control consolidation workload and cost.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [ca561aca](https://github.com/vectorize-io/hindsight/commit/ca561aca)
- Add integration with the OpenAI Agents SDK.· [![@DK09876](https://github.com/DK09876.png?size=40)@DK09876](https://github.com/DK09876)· [b8da88c8](https://github.com/vectorize-io/hindsight/commit/b8da88c8)
- Improve mental model refresh and updates with structured operations and cleaner observation handling on upsert.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [8b80959b](https://github.com/vectorize-io/hindsight/commit/8b80959b)
- Allow extensions to requeue work by throwing a DeferOperation exception from worker operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f8904797](https://github.com/vectorize-io/hindsight/commit/f8904797)
- Make recall budget mapping configurable per memory bank.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [576c44d2](https://github.com/vectorize-io/hindsight/commit/576c44d2)
- Control plane now shows failed consolidation counts with a drilldown to investigate issues.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [e1e5f36c](https://github.com/vectorize-io/hindsight/commit/e1e5f36c)
- Add mental-model staleness signals and a refreshed UI/experience for reviewing model history and snapshots.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [654e4c0c](https://github.com/vectorize-io/hindsight/commit/654e4c0c)
- Replace the embedded Paperclip library with the Paperclip plugin for more flexible integrations.· [![@benfrank241](https://github.com/benfrank241.png?size=40)@benfrank241](https://github.com/benfrank241)· [c571fac7](https://github.com/vectorize-io/hindsight/commit/c571fac7)
- JSON logs can now include tenant information and support a configurable allowlist for what gets logged.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [3bedc1ce](https://github.com/vectorize-io/hindsight/commit/3bedc1ce)
- CLI now supports named connection profiles (via -p/--profile) for easier switching between environments.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [70d60e96](https://github.com/vectorize-io/hindsight/commit/70d60e96)

**Improvements**

- Reduce the default number of retries for LLM calls to fail faster when providers are erroring or unavailable.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [b52b483c](https://github.com/vectorize-io/hindsight/commit/b52b483c)
- Make reranker failures easier to diagnose and add a configurable timeout for the TEI reranker.· [![@octo-patch](https://github.com/octo-patch.png?size=40)@octo-patch](https://github.com/octo-patch)· [69383af8](https://github.com/vectorize-io/hindsight/commit/69383af8)

**Bug Fixes**

- Fix crashes when using Jina MLX on Metal GPUs by serializing GPU operations.· [![@lkttle](https://github.com/lkttle.png?size=40)@lkttle](https://github.com/lkttle)· [2e74a324](https://github.com/vectorize-io/hindsight/commit/2e74a324)
- Fix database migration path so upgrades from v0.4.22 to v0.5.x work correctly.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [5437cc02](https://github.com/vectorize-io/hindsight/commit/5437cc02)
- Prevent orphaned observations if a source memory is deleted during consolidation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f9042e37](https://github.com/vectorize-io/hindsight/commit/f9042e37)
- Fix Ollama requests by explicitly disabling "think" mode in the native call payload.· [![@karl-8888](https://github.com/karl-8888.png?size=40)@karl-8888](https://github.com/karl-8888)· [7d4fd1aa](https://github.com/vectorize-io/hindsight/commit/7d4fd1aa)
- Fix file retain uploads and prevent orphaned retained files.· [![@christerence](https://github.com/christerence.png?size=40)@christerence](https://github.com/christerence)· [9e30ae25](https://github.com/vectorize-io/hindsight/commit/9e30ae25)
- Fix file retain API to correctly accept and map a provided "timestamp" field.· [![@christerence](https://github.com/christerence.png?size=40)@christerence](https://github.com/christerence)· [13f3052e](https://github.com/vectorize-io/hindsight/commit/13f3052e)
- Improve fairness across tenants when workers claim tasks, reducing the chance of noisy tenants starving others.· [![@cdbartholomew](https://github.com/cdbartholomew.png?size=40)@cdbartholomew](https://github.com/cdbartholomew)· [a5e53721](https://github.com/vectorize-io/hindsight/commit/a5e53721)
- Ensure the mental model max\_tokens setting is respected during refresh/reflect operations.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [568e3c30](https://github.com/vectorize-io/hindsight/commit/568e3c30)
- Fix control-plane links by properly encoding bank IDs in URLs end-to-end.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [cbaec36f](https://github.com/vectorize-io/hindsight/commit/cbaec36f)
- Make task submission idempotent when a payload is already set, preventing duplicate/failed submissions.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [088dfecb](https://github.com/vectorize-io/hindsight/commit/088dfecb)

## [0.5.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.2) [​](https://hindsight.vectorize.io/changelog\#052 "Direct link to 052")

**Features**

- Added a co-occurrence graph view for exploring entity relationships in the control plane.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f64c5d20](https://github.com/vectorize-io/hindsight/commit/f64c5d20)
- Added recall controls to the mental model trigger API/CLI so you can tune what gets recalled during runs.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [f2fc8f9f](https://github.com/vectorize-io/hindsight/commit/f2fc8f9f)
- Async operations now expose task payload details and associated document IDs for better observability and debugging.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [870bf4a3](https://github.com/vectorize-io/hindsight/commit/870bf4a3)

**Improvements**

- Revamped the control plane bank statistics view for clearer insights.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [34365c32](https://github.com/vectorize-io/hindsight/commit/34365c32)
- Clients now send an identifying User-Agent header on all HTTP requests for easier server-side diagnostics.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [9372462e](https://github.com/vectorize-io/hindsight/commit/9372462e)

**Bug Fixes**

- Fixed consolidation retry budget handling so retries are correctly applied at the LLM call site.· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [dee58139](https://github.com/vectorize-io/hindsight/commit/dee58139)
- Fixed a crash during retain when embeddings and extracted facts counts didn’t match.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [dbd1d1a7](https://github.com/vectorize-io/hindsight/commit/dbd1d1a7)
- Improved embedded mode cleanup stability by adding a timeout when acquiring the cleanup lock (prevents hangs).· [![@r266-tech](https://github.com/r266-tech.png?size=40)@r266-tech](https://github.com/r266-tech)· [6b5aa3af](https://github.com/vectorize-io/hindsight/commit/6b5aa3af)
- OpenClaw plugins now reliably register agent hooks on every entry invocation.· [![@nicoloboschi](https://github.com/nicoloboschi.png?size=40)@nicoloboschi](https://github.com/nicoloboschi)· [1be5ff33](https://github.com/vectorize-io/hindsight/commit/1be5ff33)
- TypeScript SDK now re-exports BankTemplate types from the package root for simpler imports.· [![@mrkhachaturov](https://github.com/mrkhachaturov.png?size=40)@mrkhachaturov](https://github.com/mrkhachaturov)· [581bbf3f](https://github.com/vectorize-io/hindsight/commit/581bbf3f)
- Bank template configuration validation was aligned with configurable fields to prevent invalid/ignored settings.· [![@mrkhachaturov](https://github.com/mrkhachaturov.png?size=40)@mrkhachaturov](https://github.com/mrkhachaturov)· [099f4c92](https://github.com/vectorize-io/hindsight/commit/099f4c92)

## [0.5.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.1) [​](https://hindsight.vectorize.io/changelog\#051 "Direct link to 051")

**Breaking Changes**

- OpenClaw now reads configuration from plugin config instead of environment variables. ( [`e22ae05f`](https://github.com/vectorize-io/hindsight/commit/e22ae05f))

**Features**

- Added SiliconFlow as a supported reranker provider. ( [`d0b2ab9a`](https://github.com/vectorize-io/hindsight/commit/d0b2ab9a))
- Added an interactive OpenClaw setup wizard with Cloud / API / Embedded modes. ( [`87322396`](https://github.com/vectorize-io/hindsight/commit/87322396))
- Added a config-aware CLI to backfill OpenClaw history. ( [`72fd3d59`](https://github.com/vectorize-io/hindsight/commit/72fd3d59))
- Added OpenClaw session pattern filtering to ignore or treat sessions as stateless. ( [`5a61ac50`](https://github.com/vectorize-io/hindsight/commit/5a61ac50))
- Added a Cloudflare OAuth proxy integration option for self-hosted Hindsight. ( [`aad07a14`](https://github.com/vectorize-io/hindsight/commit/aad07a14))
- Expanded the CLI to cover all OpenAPI endpoints and request-body parameters. ( [`c05c491d`](https://github.com/vectorize-io/hindsight/commit/c05c491d))
- Added a default bank template environment variable (HINDSIGHT\_API\_DEFAULT\_BANK\_TEMPLATE). ( [`fc941d5c`](https://github.com/vectorize-io/hindsight/commit/fc941d5c))
- Added a daemon lifecycle package (@vectorize-io/hindsight-all) to simplify running the all-in-one daemon. ( [`576016f5`](https://github.com/vectorize-io/hindsight/commit/576016f5))
- Added recallTags and recallTagsMatch configuration options to control which tagged memories are recalled. ( [`b57e337f`](https://github.com/vectorize-io/hindsight/commit/b57e337f))

**Improvements**

- Improved OpenClaw reliability with more resilient startup behavior and richer retain metadata. ( [`1f1716bd`](https://github.com/vectorize-io/hindsight/commit/1f1716bd))

**Bug Fixes**

- OpenClaw setup wizard now prompts for the token value (not the env var name). ( [`9679d813`](https://github.com/vectorize-io/hindsight/commit/9679d813))
- Fixed embedded mode daemon start/stop race that could terminate healthy daemons. ( [`e5724fcb`](https://github.com/vectorize-io/hindsight/commit/e5724fcb))
- Fixed reranker initialization issues to show real import errors and avoid a Transformers 5.x race in jina-mlx. ( [`f82f58fa`](https://github.com/vectorize-io/hindsight/commit/f82f58fa))
- Fixed worker consolidation slot accounting to respect the configured maximum concurrency. ( [`2d74007d`](https://github.com/vectorize-io/hindsight/commit/2d74007d))
- Improved CLI API error output by including the HTTP response body. ( [`93300b91`](https://github.com/vectorize-io/hindsight/commit/93300b91))
- Fixed CLI memory listing showing "\[UNKNOWN\]" for fact types. ( [`2635bbb4`](https://github.com/vectorize-io/hindsight/commit/2635bbb4))
- Fixed recall ranking so RRF ordering is preserved when the reranker is configured as a passthrough. ( [`4f9cf15c`](https://github.com/vectorize-io/hindsight/commit/4f9cf15c))
- Fixed retain chunk insertion to be idempotent and avoid repeated retries on integrity errors. ( [`2d95f78b`](https://github.com/vectorize-io/hindsight/commit/2d95f78b))
- Fixed retain ANN seed temp table creation to run inside a transaction for better reliability. ( [`3fc87e76`](https://github.com/vectorize-io/hindsight/commit/3fc87e76))
- Fixed LLM requests to use the correct max token parameter for reasoning models and Azure OpenAI. ( [`7b2263ba`](https://github.com/vectorize-io/hindsight/commit/7b2263ba))

## [0.5.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.5.0) [​](https://hindsight.vectorize.io/changelog\#050 "Direct link to 050")

**Breaking Changes**

- Removed BFS and MPFP graph retrieval strategies. LinkExpansionRetriever is now the sole graph retrieval algorithm, offering simpler, faster, and more accurate results. ( [`ea834bc7`](https://github.com/vectorize-io/hindsight/commit/ea834bc7))
- Dropped the `hindsight-hermes` integration package. ( [`cf0537ba`](https://github.com/vectorize-io/hindsight/commit/cf0537ba))

**Features**

- Built-in llama.cpp LLM provider for fully local inference without external API calls. ( [`f74b577e`](https://github.com/vectorize-io/hindsight/commit/f74b577e))
- Retain `update_mode='append'` for concatenating new content onto an existing document instead of replacing it. ( [`3c633e5e`](https://github.com/vectorize-io/hindsight/commit/3c633e5e))
- OpenRouter support for LLM, embeddings, and reranking. ( [`e5944b63`](https://github.com/vectorize-io/hindsight/commit/e5944b63))
- Bank template import/export with Template Hub — export a bank's configuration, mental models, and directives as a reusable manifest, then import into other banks. ( [`30a319a6`](https://github.com/vectorize-io/hindsight/commit/30a319a6))
- Constellation view in the Control Plane — interactive, zoomable canvas visualization of entity relationship graphs with heat-gradient coloring and dark mode support. ( [`36783df3`](https://github.com/vectorize-io/hindsight/commit/36783df3))
- Added `detail` parameter to list/get mental model endpoints for controlling response verbosity. ( [`8d1bfbbd`](https://github.com/vectorize-io/hindsight/commit/8d1bfbbd))
- Added AutoGen integration (`hindsight-autogen`) for persistent long-term memory in AutoGen agents. ( [`a757765a`](https://github.com/vectorize-io/hindsight/commit/a757765a))
- Added Paperclip integration (`@vectorize-io/hindsight-paperclip`) with Express middleware and process adapter modes for stateless agent memory. ( [`81441ee9`](https://github.com/vectorize-io/hindsight/commit/81441ee9))
- Added OpenCode persistent memory plugin for the OpenCode editor. ( [`e1c6220f`](https://github.com/vectorize-io/hindsight/commit/e1c6220f))
- OpenClaw JSONL-backed retain queue for external API resilience — buffers retain calls locally when the API is unreachable. ( [`087545cc`](https://github.com/vectorize-io/hindsight/commit/087545cc))
- OpenClaw now supports `bankId` for static bank configurations. ( [`0e81d1a2`](https://github.com/vectorize-io/hindsight/commit/0e81d1a2))
- Added Google embeddings and reranker provider support. ( [`07de798c`](https://github.com/vectorize-io/hindsight/commit/07de798c))
- Added persistent volume support in Helm chart for local model cache. ( [`cefa7554`](https://github.com/vectorize-io/hindsight/commit/cefa7554))
- MCP server now includes a `sync_retain` tool and validates UUID inputs. ( [`48185a4b`](https://github.com/vectorize-io/hindsight/commit/48185a4b))
- Recall combined scoring now includes `proof_count` boost for better ranking. ( [`26794aab`](https://github.com/vectorize-io/hindsight/commit/26794aab))

**Improvements**

- 3-phase retain pipeline restructures memory ingestion into pre-resolve, insert, and post-link phases, dramatically improving throughput under concurrent load by removing slow reads from write transactions. ( [`914ba796`](https://github.com/vectorize-io/hindsight/commit/914ba796))
- Recall entity graph expansion now caps per-entity fanout and includes a timeout fallback, preventing slow queries on banks with high-fanout entities. ( [`57f15445`](https://github.com/vectorize-io/hindsight/commit/57f15445))
- Fact serialization in think-prompt now includes `occurred_end` and `mentioned_at` for richer temporal context. ( [`37348c85`](https://github.com/vectorize-io/hindsight/commit/37348c85))
- Consolidation observation quality improved with structured processing rules. ( [`6f173b10`](https://github.com/vectorize-io/hindsight/commit/6f173b10))

**Bug Fixes**

- LiteLLM SDK embeddings `encoding_format` is now configurable instead of hardcoded. ( [`cece2c90`](https://github.com/vectorize-io/hindsight/commit/cece2c90))
- Fixed out-of-range `content_index` crash in recall result mapping. ( [`9790d904`](https://github.com/vectorize-io/hindsight/commit/9790d904))
- Experience fact types are now preserved correctly during normalization. ( [`9cfdd464`](https://github.com/vectorize-io/hindsight/commit/9cfdd464))
- Clear memories endpoint no longer deletes the bank profile. ( [`26a64cc0`](https://github.com/vectorize-io/hindsight/commit/26a64cc0))
- Embedding daemon clears stale processes on the port before starting. ( [`7d6c570a`](https://github.com/vectorize-io/hindsight/commit/7d6c570a))
- Per-bank vector index migration now respects vector extension configuration. ( [`4fd7c5d1`](https://github.com/vectorize-io/hindsight/commit/4fd7c5d1))
- Timeline group sort uses numeric date comparison instead of locale string comparison. ( [`f3f2c6b0`](https://github.com/vectorize-io/hindsight/commit/f3f2c6b0))
- Resolved 25 test regressions from the streaming retain pipeline. ( [`7415ebff`](https://github.com/vectorize-io/hindsight/commit/7415ebff))
- MCP server now auto-coerces string-encoded JSON in tool arguments. ( [`443c94c8`](https://github.com/vectorize-io/hindsight/commit/443c94c8))
- Entity labels structure is now validated on PATCH to prevent invalid configurations. ( [`7e23f8e1`](https://github.com/vectorize-io/hindsight/commit/7e23f8e1))
- Fixed `bank_id` metric label to be opt-in, preventing OTel memory leak. ( [`cf4bd598`](https://github.com/vectorize-io/hindsight/commit/cf4bd598))
- Fixed `max_tokens` handling for OpenAI-compatible endpoints with custom base URLs. ( [`cd99eef4`](https://github.com/vectorize-io/hindsight/commit/cd99eef4))
- Fixed `event_date` AttributeError when date is None in fact extraction. ( [`6cb309f7`](https://github.com/vectorize-io/hindsight/commit/6cb309f7))
- Query analyzer now handles dateparser internal crashes gracefully. ( [`e0e65c44`](https://github.com/vectorize-io/hindsight/commit/e0e65c44))
- Embedding profile `.env` overwrite skipped when config has no Hindsight keys. ( [`9e2890ba`](https://github.com/vectorize-io/hindsight/commit/9e2890ba))
- Windows compatibility fix for hindsight-embed. ( [`f9fe6953`](https://github.com/vectorize-io/hindsight/commit/f9fe6953))
- Addressed critical and high severity security vulnerabilities in dependencies. ( [`ee4510a7`](https://github.com/vectorize-io/hindsight/commit/ee4510a7))

## [0.4.22](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.22) [​](https://hindsight.vectorize.io/changelog\#0422 "Direct link to 0422")

**Features**

- API now supports passing custom LLM request parameters via the HINDSIGHT\_API\_LLM\_EXTRA\_BODY configuration. ( [`ecaa1ad1`](https://github.com/vectorize-io/hindsight/commit/ecaa1ad1))
- Document metadata is now exposed through the API and control plane. ( [`627ec5d5`](https://github.com/vectorize-io/hindsight/commit/627ec5d5))
- Added a /code-review skill for automated code quality checks against project standards. ( [`bdb33c58`](https://github.com/vectorize-io/hindsight/commit/bdb33c58))
- ZeroEntropy reranker now supports a configurable base URL. ( [`a915584e`](https://github.com/vectorize-io/hindsight/commit/a915584e))
- Codex can now retain structured tool calls from rollout files. ( [`3461398b`](https://github.com/vectorize-io/hindsight/commit/3461398b))

**Improvements**

- Embeddings via the LiteLLM SDK can now optionally specify output dimensions. ( [`f841bcb9`](https://github.com/vectorize-io/hindsight/commit/f841bcb9))
- API responses now include an X-Ignored-Params header to warn when unknown request parameters were ignored. ( [`cef42d81`](https://github.com/vectorize-io/hindsight/commit/cef42d81))
- OpenClaw CLI startup is faster by deferring heavy initialization until the service starts. ( [`41025c3b`](https://github.com/vectorize-io/hindsight/commit/41025c3b))

**Bug Fixes**

- Mental model triggers now support the full config schema, including tag matching and tag group filters. ( [`2c32ffad`](https://github.com/vectorize-io/hindsight/commit/2c32ffad))
- Cohere reranking via Azure endpoints now works reliably (avoids 404 errors). ( [`84985ee9`](https://github.com/vectorize-io/hindsight/commit/84985ee9))
- Claude Code provider no longer defers to built-in tools, preventing MCP tool handling issues. ( [`fa82efc8`](https://github.com/vectorize-io/hindsight/commit/fa82efc8))
- Recall endpoint now returns metadata correctly instead of dropping it from the response. ( [`4768bf39`](https://github.com/vectorize-io/hindsight/commit/4768bf39))
- Gemini 3.1+ tool calls now read thought signatures correctly. ( [`1b5c262a`](https://github.com/vectorize-io/hindsight/commit/1b5c262a))
- First-person agent memories are now correctly classified as "experience" facts. ( [`00961156`](https://github.com/vectorize-io/hindsight/commit/00961156))
- Codex upgrades now preserve and merge new settings instead of skipping them. ( [`b104bad0`](https://github.com/vectorize-io/hindsight/commit/b104bad0))
- LlamaIndex integration fixes improve document ID handling, memory API behavior, and ReAct tracing. ( [`d93dfea8`](https://github.com/vectorize-io/hindsight/commit/d93dfea8))

## [0.4.21](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.21) [​](https://hindsight.vectorize.io/changelog\#0421 "Direct link to 0421")

**Features**

- Added audit logging for feature usage tracking, including request duration in audit entries. ( [`083295dc`](https://github.com/vectorize-io/hindsight/commit/083295dc))
- Added Hindsight memory integration for the OpenAI Codex CLI. ( [`0b17a67c`](https://github.com/vectorize-io/hindsight/commit/0b17a67c))
- Added an MCP hook to filter tool visibility per user. ( [`f8285b7b`](https://github.com/vectorize-io/hindsight/commit/f8285b7b))
- Added a per-bank limit setting to cap the number of observations stored per scope. ( [`b32767ca`](https://github.com/vectorize-io/hindsight/commit/b32767ca))
- Added native Windows support so Hindsight can run without Docker. ( [`c5700ff5`](https://github.com/vectorize-io/hindsight/commit/c5700ff5))
- Added a 'none' LLM provider to support chunk-only storage without LLM calls. ( [`9e5a066d`](https://github.com/vectorize-io/hindsight/commit/9e5a066d))
- Added a setup command/skill to register hooks more reliably. ( [`22ca6a8d`](https://github.com/vectorize-io/hindsight/commit/22ca6a8d))
- Hermes now supports file-based configuration. ( [`0ff36548`](https://github.com/vectorize-io/hindsight/commit/0ff36548))
- Added a LiteLLM-based provider to support Bedrock and many additional LLM providers. ( [`db70fdbe`](https://github.com/vectorize-io/hindsight/commit/db70fdbe))
- Added support for Strands Agents SDK integration with Hindsight memory tools. ( [`7fe773c0`](https://github.com/vectorize-io/hindsight/commit/7fe773c0))
- Added LlamaIndex integration. ( [`2d787c4f`](https://github.com/vectorize-io/hindsight/commit/2d787c4f))
- Added AG2 framework integration. ( [`73123870`](https://github.com/vectorize-io/hindsight/commit/73123870))
- Added support for Ark and Volcano LLM providers. ( [`417fac61`](https://github.com/vectorize-io/hindsight/commit/417fac61))
- Retain now supports delta mode to skip LLM processing for unchanged chunks on upsert. ( [`fd88c0ef`](https://github.com/vectorize-io/hindsight/commit/fd88c0ef))
- Claude Code integration can now retain full sessions with document upsert and configurable tags, and records tool calls as structured JSON. ( [`2d31b67d`](https://github.com/vectorize-io/hindsight/commit/2d31b67d))
- MCP retain tool now supports selecting a retain strategy via a parameter. ( [`4285e944`](https://github.com/vectorize-io/hindsight/commit/4285e944))

**Improvements**

- OpenClaw logging is now configurable and can emit structured output. ( [`d441ab81`](https://github.com/vectorize-io/hindsight/commit/d441ab81))
- Made inclusion of source facts in search observations configurable. ( [`5095d5e3`](https://github.com/vectorize-io/hindsight/commit/5095d5e3))
- Integrations no longer use hardcoded default models, relying on configured defaults instead. ( [`58e68f3e`](https://github.com/vectorize-io/hindsight/commit/58e68f3e))

**Bug Fixes**

- Improved MCP server compatibility by handling Claude Code GET probes and allowing stateless HTTP mode to be configured. ( [`d8050387`](https://github.com/vectorize-io/hindsight/commit/d8050387))
- Per-bank vector index creation now respects the configured vector extension setting. ( [`6488c9bc`](https://github.com/vectorize-io/hindsight/commit/6488c9bc))
- Verbose retain extraction now correctly includes the retain mission context. ( [`d2965e64`](https://github.com/vectorize-io/hindsight/commit/d2965e64))
- Codex integration no longer crashes on startup when the API quota is exhausted (HTTP 429). ( [`111e8c70`](https://github.com/vectorize-io/hindsight/commit/111e8c70))
- OpenAI embeddings client now correctly parses query parameters included in base\_url. ( [`a209ef1a`](https://github.com/vectorize-io/hindsight/commit/a209ef1a))
- Fixed tool\_choice handling for Codex/Claude Code when forcing specific tool calls. ( [`585ac76f`](https://github.com/vectorize-io/hindsight/commit/585ac76f))
- OpenClaw auto-recall now supports a configurable timeout to prevent hangs. ( [`cd4d449f`](https://github.com/vectorize-io/hindsight/commit/cd4d449f))
- Fixed control plane UI issues affecting recall and data viewing. ( [`6bb83f46`](https://github.com/vectorize-io/hindsight/commit/6bb83f46))
- Recall responses now include associated metadata. ( [`0bcbf849`](https://github.com/vectorize-io/hindsight/commit/0bcbf849))
- Python client update\_bank\_config() now exposes all configurable fields. ( [`7c18723f`](https://github.com/vectorize-io/hindsight/commit/7c18723f))
- API OpenAPI schema now correctly includes Pydantic v2 ValidationError fields. ( [`939cb40a`](https://github.com/vectorize-io/hindsight/commit/939cb40a))
- JSON-string tags are now coerced to lists for MemoryItem and MCP tools to prevent tagging errors. ( [`c5273f5f`](https://github.com/vectorize-io/hindsight/commit/c5273f5f))

## [0.4.20](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.20) [​](https://hindsight.vectorize.io/changelog\#0420 "Direct link to 0420")

**Features**

- Add a one-command setup CLI package for the NemoClaw integration. ( [`d284de28`](https://github.com/vectorize-io/hindsight/commit/d284de28))
- Add a LangGraph integration for using Hindsight memory within LangGraph agents. ( [`b4320254`](https://github.com/vectorize-io/hindsight/commit/b4320254))
- Add reflect filters to exclude specific fact types and mental model content during reflection. ( [`ea662d06`](https://github.com/vectorize-io/hindsight/commit/ea662d06))
- Introduce independent versioning for integrations so they can be released separately from the core server. ( [`31f1c53c`](https://github.com/vectorize-io/hindsight/commit/31f1c53c))
- Add a Claude Code integration plugin. ( [`f4390bdc`](https://github.com/vectorize-io/hindsight/commit/f4390bdc))

**Improvements**

- Add a wall-clock timeout to reflect operations so they don’t run indefinitely. ( [`8ce06e3e`](https://github.com/vectorize-io/hindsight/commit/8ce06e3e))
- Provide richer context when validating operations via the OperationValidator extension. ( [`2eb1019d`](https://github.com/vectorize-io/hindsight/commit/2eb1019d))
- Make the hindsight-api package runnable directly via uvx by adding script entry points. ( [`97f7a365`](https://github.com/vectorize-io/hindsight/commit/97f7a365))
- Support passing query parameters during OpenAI-compatible client initialization for broader provider compatibility. ( [`20e17f28`](https://github.com/vectorize-io/hindsight/commit/20e17f28))
- Upgrade the default MiniMax model from M2.5 to M2.7. ( [`1f1462a5`](https://github.com/vectorize-io/hindsight/commit/1f1462a5))

**Bug Fixes**

- Prevent context overflow during observation search by disabling source facts in results. ( [`8e2e2d5b`](https://github.com/vectorize-io/hindsight/commit/8e2e2d5b))
- Fix Claude Code integration session startup by pre-starting the daemon in the background. ( [`26944e25`](https://github.com/vectorize-io/hindsight/commit/26944e25))
- Fix Claude Code integration installation and configuration experience so setup is more reliable. ( [`35b2cbb6`](https://github.com/vectorize-io/hindsight/commit/35b2cbb6))
- Fix a memory leak in entity resolution that could grow over time under load. ( [`e6333719`](https://github.com/vectorize-io/hindsight/commit/e6333719))
- Avoid crashes and retain failures when the Postgres pg\_trgm extension is unavailable by handling detection/fallback correctly. ( [`365fa3ce`](https://github.com/vectorize-io/hindsight/commit/365fa3ce))
- Strip Markdown code fences from model outputs across all LLM providers for more consistent parsing. ( [`2f2db2a6`](https://github.com/vectorize-io/hindsight/commit/2f2db2a6))
- Return a clear 400 error for empty recall queries and fix a SQL parameterization issue. ( [`5cdc714a`](https://github.com/vectorize-io/hindsight/commit/5cdc714a))
- Ensure file retain requests include authentication headers so uploads work in authenticated deployments. ( [`78aa7c53`](https://github.com/vectorize-io/hindsight/commit/78aa7c53))
- Fix MCP tool calls when MCP\_AUTH\_TOKEN and TENANT\_API\_KEY differ. ( [`8364b9c5`](https://github.com/vectorize-io/hindsight/commit/8364b9c5))
- Allow claude-agent-sdk to install correctly on Linux/Docker environments. ( [`3f31cbf5`](https://github.com/vectorize-io/hindsight/commit/3f31cbf5))
- In LiteLLM mode, fall back to the last user message when no explicit hindsight query is provided. ( [`5e8952c5`](https://github.com/vectorize-io/hindsight/commit/5e8952c5))
- Fix non-atomic async operation creation to prevent inconsistent operation records. ( [`94cf89b5`](https://github.com/vectorize-io/hindsight/commit/94cf89b5))
- Prevent orphaned parent operations when a batch retain child fails unexpectedly. ( [`43942455`](https://github.com/vectorize-io/hindsight/commit/43942455))
- Fix failures for non-ASCII entity names by ensuring entity IDs are set correctly. ( [`438ce98b`](https://github.com/vectorize-io/hindsight/commit/438ce98b))
- Correctly store LLM facts labeled as "assistant" as "experience" in the database. ( [`446c75f3`](https://github.com/vectorize-io/hindsight/commit/446c75f3))

## [0.4.19](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.19) [​](https://hindsight.vectorize.io/changelog\#0419 "Direct link to 0419")

**Features**

- TypeScript client now works in Deno environments. ( [`72c25c97`](https://github.com/vectorize-io/hindsight/commit/72c25c97))
- Added Agno integration to use Hindsight as a memory toolkit. ( [`8c378b98`](https://github.com/vectorize-io/hindsight/commit/8c378b98))
- Added Hermes Agent integration (hindsight-hermes) for persistent memory. ( [`ef90842f`](https://github.com/vectorize-io/hindsight/commit/ef90842f))
- Expanded retain behavior with new `verbatim` and `chunks` extraction modes and named retain strategies. ( [`e4f8a157`](https://github.com/vectorize-io/hindsight/commit/e4f8a157))

**Improvements**

- Improved local reranker performance/efficiency with FP16 and bucketed batching, plus compatibility with Transformers 5.x. ( [`e7da7d0e`](https://github.com/vectorize-io/hindsight/commit/e7da7d0e))

**Bug Fixes**

- Prevented silent memory loss when consolidation fails (failed consolidations are tracked and can be recovered). ( [`28dac7c7`](https://github.com/vectorize-io/hindsight/commit/28dac7c7))
- Fixed Docker control-plane startup to respect the configured control-plane hostname. ( [`8a64dc8d`](https://github.com/vectorize-io/hindsight/commit/8a64dc8d))
- Database cleanup migration now removes orphaned observation memory units to avoid inconsistent memory state. ( [`f09ad9de`](https://github.com/vectorize-io/hindsight/commit/f09ad9de))
- Deleting a document now also deletes linked memory units to prevent leftover/stale memory entries. ( [`f27bd953`](https://github.com/vectorize-io/hindsight/commit/f27bd953))
- Fixed MCP middleware to send an Accept header, preventing 406 response errors in some setups. ( [`836fd81e`](https://github.com/vectorize-io/hindsight/commit/836fd81e))
- Improved compatibility with Gemini tool-calling by preserving thought signature metadata to avoid failures on gemini-3.1-flash-lite-preview. ( [`21f9f46c`](https://github.com/vectorize-io/hindsight/commit/21f9f46c))

## [0.4.18](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.18) [​](https://hindsight.vectorize.io/changelog\#0418 "Direct link to 0418")

**Features**

- Add compound tag filtering using tag groups. ( [`5de793ee`](https://github.com/vectorize-io/hindsight/commit/5de793ee))
- Publish new slim Python packages (hindsight-api-slim and hindsight-all-slim) for smaller installs. ( [`15ea23d5`](https://github.com/vectorize-io/hindsight/commit/15ea23d5))
- Add MiniMax as a supported LLM provider. ( [`2344484f`](https://github.com/vectorize-io/hindsight/commit/2344484f))
- Add Jina MLX reranker provider optimized for Apple Silicon. ( [`1caf5ec9`](https://github.com/vectorize-io/hindsight/commit/1caf5ec9))

**Improvements**

- Allow configuring maximum recall query tokens via an environment variable. ( [`66dedb8d`](https://github.com/vectorize-io/hindsight/commit/66dedb8d))
- Improve retrieval performance by switching to per-bank HNSW indexes. ( [`43b3efc4`](https://github.com/vectorize-io/hindsight/commit/43b3efc4))

**Bug Fixes**

- Prevent reranking failures by truncating long documents that exceed LiteLLM reranker context limits. ( [`eeb938fc`](https://github.com/vectorize-io/hindsight/commit/eeb938fc))
- Ensure recalled memories are injected as system context for OpenClaw. ( [`b17f338e`](https://github.com/vectorize-io/hindsight/commit/b17f338e))
- Ensure embedded profiles are registered in CLI metadata when the daemon starts. ( [`06b0f74a`](https://github.com/vectorize-io/hindsight/commit/06b0f74a))
- Cancel in-flight async operations when a bank is deleted to avoid dangling work. ( [`0560f626`](https://github.com/vectorize-io/hindsight/commit/0560f626))

## [0.4.17](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.17) [​](https://hindsight.vectorize.io/changelog\#0417 "Direct link to 0417")

**Features**

- Added a manual retry option for failed asynchronous operations. ( [`dcaacbe4`](https://github.com/vectorize-io/hindsight/commit/dcaacbe4))
- You can now change/update tags on an existing document. ( [`1b4ad7f4`](https://github.com/vectorize-io/hindsight/commit/1b4ad7f4))
- Added history tracking and a diff view for mental model changes. ( [`e2baca8b`](https://github.com/vectorize-io/hindsight/commit/e2baca8b))
- Added observation history tracking with a UI diff view to review changes over time. ( [`576473b6`](https://github.com/vectorize-io/hindsight/commit/576473b6))
- File uploads can now choose a parser per request, with configurable fallback chains. ( [`99220d05`](https://github.com/vectorize-io/hindsight/commit/99220d05))
- Added an extension hook that runs after file-to-Markdown conversion completes. ( [`1d17dea2`](https://github.com/vectorize-io/hindsight/commit/1d17dea2))

**Improvements**

- Operations view now supports filtering by operation type and has more reliable auto-refresh behavior. ( [`f7a60f89`](https://github.com/vectorize-io/hindsight/commit/f7a60f89))
- Added token limits for “source facts” used during consolidation and recall to better control context usage. ( [`5d05962d`](https://github.com/vectorize-io/hindsight/commit/5d05962d))
- Improved bank selector usability by truncating very long bank names in the dropdown. ( [`1e40cd22`](https://github.com/vectorize-io/hindsight/commit/1e40cd22))

**Bug Fixes**

- Fixed webhook schema issues affecting multi-tenant retain webhooks. ( [`32a4882a`](https://github.com/vectorize-io/hindsight/commit/32a4882a))
- Fixed file ingestion failures by stripping null bytes from parsed file content before retaining. ( [`cd3a6a22`](https://github.com/vectorize-io/hindsight/commit/cd3a6a22))
- Fixed tool selection handling for OpenAI-compatible providers when using named tool\_choice. ( [`1cdfb7c2`](https://github.com/vectorize-io/hindsight/commit/1cdfb7c2))
- Improved consolidation behavior to prioritize a bank’s mission over an ephemeral-state heuristic. ( [`00ccf0b2`](https://github.com/vectorize-io/hindsight/commit/00ccf0b2))
- Fixed database migrations to correctly handle mental model embedding dimension changes. ( [`7accac94`](https://github.com/vectorize-io/hindsight/commit/7accac94))
- Fixed file upload failures caused by an Iris parser httpx read timeout. ( [`fa3501d4`](https://github.com/vectorize-io/hindsight/commit/fa3501d4))
- Improved reliability of running migrations by serializing Alembic upgrades within the process. ( [`f88b50a4`](https://github.com/vectorize-io/hindsight/commit/f88b50a4))
- Fixed Google Cloud Storage authentication when using Workload Identity Federation credentials. ( [`d2504ac5`](https://github.com/vectorize-io/hindsight/commit/d2504ac5))
- Fixed the bank selector to refresh the bank list when the dropdown is opened. ( [`0ad8c2d0`](https://github.com/vectorize-io/hindsight/commit/0ad8c2d0))

## [0.4.16](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.16) [​](https://hindsight.vectorize.io/changelog\#0416 "Direct link to 0416")

**Features**

- Added Webhooks with `consolidation.completed` and `retain.completed` events. ( [`abbf874d`](https://github.com/vectorize-io/hindsight/commit/abbf874d))

**Improvements**

- Improved OpenClaw recall/retention controls. ( [`d425e93c`](https://github.com/vectorize-io/hindsight/commit/d425e93c))
- Improved search/reranking quality by switching combined scoring to multiplicative boosts. ( [`aa8e5475`](https://github.com/vectorize-io/hindsight/commit/aa8e5475))
- Improved performance of observation recall by 40x on large banks. ( [`ad2cf72a`](https://github.com/vectorize-io/hindsight/commit/ad2cf72a))
- Improved server shutdown behavior by capping graceful shutdown time and allowing a forced kill on a second Ctrl+C. ( [`4c058b4b`](https://github.com/vectorize-io/hindsight/commit/4c058b4b))

**Bug Fixes**

- Fixed an async deadlock risk by running database schema migrations in a background thread during startup. ( [`e0a2ac63`](https://github.com/vectorize-io/hindsight/commit/e0a2ac63))
- Fixed webhook delivery/outbox processing so transactions don’t silently roll back due to using the wrong database schema name. ( [`75b95106`](https://github.com/vectorize-io/hindsight/commit/75b95106))
- Fixed observation results to correctly resolve and return related chunks using source\_memory\_ids. ( [`cb6d1c46`](https://github.com/vectorize-io/hindsight/commit/cb6d1c46))
- Fixed MCP bank-level tool filtering compatibility with FastMCP 3.x. ( [`f17406fd`](https://github.com/vectorize-io/hindsight/commit/f17406fd))
- Fixed crashes when an LLM returns invalid JSON across all retries (now handled cleanly instead of raising a TypeError). ( [`66423b85`](https://github.com/vectorize-io/hindsight/commit/66423b85))
- Fixed observations without source dates to preserve missing (None) temporal fields instead of incorrectly populating them. ( [`891c33b1`](https://github.com/vectorize-io/hindsight/commit/891c33b1))

## [0.4.15](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.15) [​](https://hindsight.vectorize.io/changelog\#0415 "Direct link to 0415")

**Features**

- Added observation\_scopes to control the granularity/visibility of observations. ( [`55af4681`](https://github.com/vectorize-io/hindsight/commit/55af4681))
- List documents API now supports filtering by tags (and fixes the q parameter description). ( [`1d70abfe`](https://github.com/vectorize-io/hindsight/commit/1d70abfe))
- Added PydanticAI integration for persistent agent memory. ( [`cab5a40f`](https://github.com/vectorize-io/hindsight/commit/cab5a40f))
- Added richer entity label support (optional labels, free-form values, multi-value fields, and UI polish). ( [`9b96becc`](https://github.com/vectorize-io/hindsight/commit/9b96becc))
- Added support for timestamp="unset" so content can be retained without a date. ( [`f903948a`](https://github.com/vectorize-io/hindsight/commit/f903948a))
- OpenClaw can now automatically retain the last n+2 turns every n turns (default n=10). ( [`ad1660b3`](https://github.com/vectorize-io/hindsight/commit/ad1660b3))
- Added configurable Gemini/Vertex AI safety settings for LLM calls. ( [`73ef99e7`](https://github.com/vectorize-io/hindsight/commit/73ef99e7))
- Added extension hooks to customize root routing and error headers. ( [`e407f4bc`](https://github.com/vectorize-io/hindsight/commit/e407f4bc))

**Improvements**

- Improved recall performance by fetching all recall chunks in a single query. ( [`61bf428b`](https://github.com/vectorize-io/hindsight/commit/61bf428b))
- Improved recall/retain performance and scalability for large memory banks. ( [`7942f181`](https://github.com/vectorize-io/hindsight/commit/7942f181))

**Bug Fixes**

- Fixed the TypeScript SDK to send null (not undefined) when includeEntities is false. ( [`15f4b876`](https://github.com/vectorize-io/hindsight/commit/15f4b876))
- Prevented reflect from failing with context\_length\_exceeded on large memory banks. ( [`77defd96`](https://github.com/vectorize-io/hindsight/commit/77defd96))
- Fixed a consolidation deadlock caused by retrying after zombie processing tasks. ( [`c2876490`](https://github.com/vectorize-io/hindsight/commit/c2876490))
- Fixed observations count in the control plane that always showed 0. ( [`eaeaa1f2`](https://github.com/vectorize-io/hindsight/commit/eaeaa1f2))
- Fixed ZeroEntropy rerank endpoint URL and ensured the MCP retain async\_processing parameter is handled correctly. ( [`f6f1a7d8`](https://github.com/vectorize-io/hindsight/commit/f6f1a7d8))
- Fixed JSON serialization issues and logging-related exception propagation when using the claude\_code LLM provider. ( [`ecb833f4`](https://github.com/vectorize-io/hindsight/commit/ecb833f4))
- Added bank-scoped request validation to prevent cross-bank/invalid bank operations. ( [`5270aa5a`](https://github.com/vectorize-io/hindsight/commit/5270aa5a))

## [0.4.14](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.14) [​](https://hindsight.vectorize.io/changelog\#0414 "Direct link to 0414")

**Features**

- Add Chat SDK integration to give chatbots persistent memory. ( [`fed987f9`](https://github.com/vectorize-io/hindsight/commit/fed987f9))
- Allow configuring which MCP tools are exposed per memory bank, and expand the MCP tool set with additional tools and parameters. ( [`3ffec650`](https://github.com/vectorize-io/hindsight/commit/3ffec650))
- Enable the bank configuration API by default. ( [`4d030707`](https://github.com/vectorize-io/hindsight/commit/4d030707))
- Support filtering graph-based memory retrieval by tags. ( [`0bb5ca4c`](https://github.com/vectorize-io/hindsight/commit/0bb5ca4c))
- Add batch observations consolidation to process multiple observations more efficiently. ( [`0aa7c2b3`](https://github.com/vectorize-io/hindsight/commit/0aa7c2b3))
- Add OpenClaw options to toggle autoRecall and exclude specific providers. ( [`3f9eb27c`](https://github.com/vectorize-io/hindsight/commit/3f9eb27c))
- Add a ZeroEntropy reranker provider option. ( [`17259675`](https://github.com/vectorize-io/hindsight/commit/17259675))

**Improvements**

- Increase customization options for reflect, retain, and consolidation behavior. ( [`2a322732`](https://github.com/vectorize-io/hindsight/commit/2a322732))
- Include source document metadata in fact extraction results. ( [`87219b73`](https://github.com/vectorize-io/hindsight/commit/87219b73))

**Bug Fixes**

- Raise a clear error when embedding dimensions exceed pgvector HNSW limits (instead of failing later at runtime). ( [`8cd65b98`](https://github.com/vectorize-io/hindsight/commit/8cd65b98))
- Fix multi-tenant schema isolation issues in storage and the bank config API. ( [`b180b3ad`](https://github.com/vectorize-io/hindsight/commit/b180b3ad))
- Ensure LiteLLM embedding calls use the correct float encoding format to prevent embedding failures. ( [`58f2de70`](https://github.com/vectorize-io/hindsight/commit/58f2de70))
- Improve recall performance by reducing memory usage during retrieval. ( [`9f0c031d`](https://github.com/vectorize-io/hindsight/commit/9f0c031d))
- Handle observation regeneration correctly when underlying memories are deleted. ( [`ac9a94ad`](https://github.com/vectorize-io/hindsight/commit/ac9a94ad))
- Fix reflect retrieval to correctly populate dependencies and enforce full hierarchical retrieval. ( [`8b1a4658`](https://github.com/vectorize-io/hindsight/commit/8b1a4658))
- Fix OpenClaw health checks by passing the auth token to the health endpoint. ( [`40b02645`](https://github.com/vectorize-io/hindsight/commit/40b02645))

## [0.4.13](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.13) [​](https://hindsight.vectorize.io/changelog\#0413 "Direct link to 0413")

**Features**

- Switched the default OpenAI LLM to gpt-4o-mini. ( [`325b5cc1`](https://github.com/vectorize-io/hindsight/commit/325b5cc1))
- Observation recall now includes the source facts behind recalled observations. ( [`5569d4ad`](https://github.com/vectorize-io/hindsight/commit/5569d4ad))
- Added CrewAI integration to enable persistent memory. ( [`41db2960`](https://github.com/vectorize-io/hindsight/commit/41db2960))

**Bug Fixes**

- Fixed npx hindsight-control-plane failing to run. ( [`0758827d`](https://github.com/vectorize-io/hindsight/commit/0758827d))
- Improved MCP compatibility by aligning the local MCP implementation with the server and removing the deprecated stateless parameter. ( [`ea8163c5`](https://github.com/vectorize-io/hindsight/commit/ea8163c5))
- Fixed Docker startup failures when using named Docker volumes. ( [`ac739487`](https://github.com/vectorize-io/hindsight/commit/ac739487))
- Prevented reranker crashes when an upstream provider returns an error. ( [`58c4d657`](https://github.com/vectorize-io/hindsight/commit/58c4d657))
- Improved accuracy of fact temporal ordering by reducing per-fact time offsets. ( [`c3ef1555`](https://github.com/vectorize-io/hindsight/commit/c3ef1555))
- Client timeout settings are now properly respected. ( [`dcaa9f14`](https://github.com/vectorize-io/hindsight/commit/dcaa9f14))
- Fixed documents not being tracked when fact extraction returns zero facts. ( [`f78278ea`](https://github.com/vectorize-io/hindsight/commit/f78278ea))

## [0.4.12](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.12) [​](https://hindsight.vectorize.io/changelog\#0412 "Direct link to 0412")

**Features**

- Accept and ingest PDFs, images, and common Office documents as inputs. ( [`224b7b74`](https://github.com/vectorize-io/hindsight/commit/224b7b74))
- Add the Iris file parser for improved document parsing support. ( [`7eafba66`](https://github.com/vectorize-io/hindsight/commit/7eafba66))
- Add async Retain support via provider Batch APIs (e.g., OpenAI and Groq) for higher-throughput ingestion. ( [`40d42c58`](https://github.com/vectorize-io/hindsight/commit/40d42c58))
- Allow Recall to return chunks only (no memories) by setting max\_tokens=0. ( [`7dad9da0`](https://github.com/vectorize-io/hindsight/commit/7dad9da0))
- Add a Go client SDK for the Hindsight API. ( [`2a47389f`](https://github.com/vectorize-io/hindsight/commit/2a47389f))
- Add support for the pgvectorscale (DiskANN) vector index backend. ( [`95c42204`](https://github.com/vectorize-io/hindsight/commit/95c42204))
- Add support for Azure pg\_diskann vector indexing. ( [`476726c2`](https://github.com/vectorize-io/hindsight/commit/476726c2))

**Improvements**

- Improve reliability of async batch Retain when ingesting large payloads. ( [`aefb3fcf`](https://github.com/vectorize-io/hindsight/commit/aefb3fcf))
- Improve AI SDK tooling to make it easier to work with Hindsight programmatically. ( [`d06a0259`](https://github.com/vectorize-io/hindsight/commit/d06a0259))

**Bug Fixes**

- Ensure document tags are preserved when using the async Retain flow. ( [`b4b5c44a`](https://github.com/vectorize-io/hindsight/commit/b4b5c44a))
- Fix OpenClaw ingestion failures for very large content (E2BIG). ( [`6bad6673`](https://github.com/vectorize-io/hindsight/commit/6bad6673))
- Harden OpenClaw behavior (safer shell usage, better HTTP mode handling, and more reliable initialization), including per-user banks support. ( [`c4610130`](https://github.com/vectorize-io/hindsight/commit/c4610130))
- Improve Python client async API consistency and reduce connection drop issues via keepalive timeout fixes. ( [`8114ef44`](https://github.com/vectorize-io/hindsight/commit/8114ef44))

## [0.4.11](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.11) [​](https://hindsight.vectorize.io/changelog\#0411 "Direct link to 0411")

**Features**

- Added support for LiteLLM SDK as an embeddings and reranking provider. ( [`e408b7e`](https://github.com/vectorize-io/hindsight/commit/e408b7e))
- Expanded Postgres search support with additional text/vector extensions, including TimescaleDB pg\_textsearch and vchord/pgvector options. ( [`d871c30`](https://github.com/vectorize-io/hindsight/commit/d871c30))
- Added hierarchical configuration scopes (system, tenant, bank) for more flexible multi-tenant setup and overrides. ( [`8d731f2`](https://github.com/vectorize-io/hindsight/commit/8d731f2))
- Added reverse proxy/base-path support for running Hindsight behind a proxy. ( [`93ddd41`](https://github.com/vectorize-io/hindsight/commit/93ddd41))
- Added MCP tools to create, read, update, and delete mental models. ( [`f641b30`](https://github.com/vectorize-io/hindsight/commit/f641b30))
- Added a "docs" skill for agents/tools to access documentation-oriented capabilities. ( [`dd1e098`](https://github.com/vectorize-io/hindsight/commit/dd1e098))
- Added an OpenClaw configuration option to skip recall/retain for specific providers. ( [`fb7be3e`](https://github.com/vectorize-io/hindsight/commit/fb7be3e))

**Improvements**

- Improved LiteLLM gateway model configuration for more reliable provider/model selection. ( [`7d95a00`](https://github.com/vectorize-io/hindsight/commit/7d95a00))
- Exposed actual LLM token usage in retain results to improve cost/usage visibility. ( [`83ca669`](https://github.com/vectorize-io/hindsight/commit/83ca669))
- Added user-initiated attribution to request context to improve async task and usage attribution. ( [`90be7c6`](https://github.com/vectorize-io/hindsight/commit/90be7c6))
- Added OpenTelemetry tracing for improved request traceability and observability. ( [`69dec8e`](https://github.com/vectorize-io/hindsight/commit/69dec8e))
- Helm chart: split TEI embedding and reranker into separate deployments for independent scaling and rollout. ( [`43f9a8b`](https://github.com/vectorize-io/hindsight/commit/43f9a8b))
- Helm chart: added PodDisruptionBudgets and per-component affinity controls for more resilient scheduling. ( [`9943957`](https://github.com/vectorize-io/hindsight/commit/9943957))

**Bug Fixes**

- Fixed a recursion issue in memory retention that could cause failures or runaway memory usage. ( [`4f11210`](https://github.com/vectorize-io/hindsight/commit/4f11210))
- Fixed Reflect API serialization/schema issues for "based\_on" so reflections are returned and stored correctly. ( [`f9a8a8e`](https://github.com/vectorize-io/hindsight/commit/f9a8a8e))
- Improved MCP server compatibility by allowing extra tool arguments when appropriate and fixing bank ID resolution priority. ( [`7ee229b`](https://github.com/vectorize-io/hindsight/commit/7ee229b))
- Added missing trust\_code environment configuration support. ( [`60574ee`](https://github.com/vectorize-io/hindsight/commit/60574ee))
- Hardened the MCP server with fixes to routing/validation and more accurate usage metering. ( [`e798979`](https://github.com/vectorize-io/hindsight/commit/e798979))
- Fixed the slim Docker image to include tiktoken to prevent runtime tokenization errors. ( [`6eec83b`](https://github.com/vectorize-io/hindsight/commit/6eec83b))
- Fixed MCP operations not being tracked correctly for usage metering. ( [`888b50d`](https://github.com/vectorize-io/hindsight/commit/888b50d))
- Helm chart: fixed GKE deployments overriding the configured HINDSIGHT\_API\_PORT. ( [`03f47e2`](https://github.com/vectorize-io/hindsight/commit/03f47e2))

## [0.4.10](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.10) [​](https://hindsight.vectorize.io/changelog\#0410 "Direct link to 0410")

**Features**

- Provided a slimmer Docker distribution to reduce image size and speed up pulls. ( [`f648178`](https://github.com/vectorize-io/hindsight/commit/f648178))
- Added Markdown support in Reflect and Mental Models content. ( [`c4ef090`](https://github.com/vectorize-io/hindsight/commit/c4ef090))
- Added built-in Supabase tenant extension for running Hindsight with Supabase-backed multi-tenancy. ( [`e99ee0f`](https://github.com/vectorize-io/hindsight/commit/e99ee0f))
- Added TenantExtension authentication support to the MCP endpoint. ( [`fedfb49`](https://github.com/vectorize-io/hindsight/commit/fedfb49))

**Improvements**

- Improved MCP tool availability/routing based on the endpoint being used. ( [`d90588b`](https://github.com/vectorize-io/hindsight/commit/d90588b))

**Bug Fixes**

- Stopped logging database usernames and passwords to prevent credential leaks in logs. ( [`c568094`](https://github.com/vectorize-io/hindsight/commit/c568094))
- Fixed OpenClaw sessions wiping memory on each new session. ( [`981cf60`](https://github.com/vectorize-io/hindsight/commit/981cf60))
- Fixed hindsight-embed profiles not loading correctly. ( [`0430588`](https://github.com/vectorize-io/hindsight/commit/0430588))
- Fixed tagged directives so they correctly apply to tagged mental models. ( [`278718d`](https://github.com/vectorize-io/hindsight/commit/278718d))
- Fixed a cast error that could cause failures at runtime. ( [`093ecff`](https://github.com/vectorize-io/hindsight/commit/093ecff))

**Other**

- Added a docker-compose example to simplify local deployment and testing. ( [`5179d5f`](https://github.com/vectorize-io/hindsight/commit/5179d5f))

## [0.4.9](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.9) [​](https://hindsight.vectorize.io/changelog\#049 "Direct link to 049")

**Features**

- New AI SDK integration. ( [`7e339e1`](https://github.com/vectorize-io/hindsight/commit/7e339e1))
- Add a Python SDK for running Hindsight in embedded mode (HindsightEmbedded). ( [`d3302c9`](https://github.com/vectorize-io/hindsight/commit/d3302c9))
- Add streaming support to the hindsight-litellm wrappers. ( [`665877b`](https://github.com/vectorize-io/hindsight/commit/665877b))
- Add OpenClaw support for connecting to an external Hindsight API and using dynamic per-channel memory banks. ( [`6b34692`](https://github.com/vectorize-io/hindsight/commit/6b34692))

**Improvements**

- Improve the mental models experience in the control plane UI. ( [`7097716`](https://github.com/vectorize-io/hindsight/commit/7097716))
- Reduce noisy Hugging Face logging output. ( [`34d9188`](https://github.com/vectorize-io/hindsight/commit/34d9188))

**Bug Fixes**

- Improve recall endpoint reliability by handling timeouts correctly and rejecting overly long queries. ( [`dd621a6`](https://github.com/vectorize-io/hindsight/commit/dd621a6))
- Improve /reflect behavior with Claude Code and Codex providers. ( [`a43d208`](https://github.com/vectorize-io/hindsight/commit/a43d208))
- Fix OpenClaw shell argument escaping for more reliable command execution. ( [`63e2964`](https://github.com/vectorize-io/hindsight/commit/63e2964))

## [0.4.8](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.8) [​](https://hindsight.vectorize.io/changelog\#048 "Direct link to 048")

**Features**

- Added profile support for `hindsight-embed`, enabling separate embedding configurations/workspaces. ( [`6c7f057`](https://github.com/vectorize-io/hindsight/commit/6c7f057))
- Added support for additional LLM backends, including OpenAI Codex and Claude Code. ( [`539190b`](https://github.com/vectorize-io/hindsight/commit/539190b))

**Improvements**

- Enhanced OpenClaw and `hindsight-embed` parameter/config options for easier configuration and better defaults. ( [`749478d`](https://github.com/vectorize-io/hindsight/commit/749478d))
- Added OpenClaw plugin configuration options to select LLM provider and model. ( [`8564135`](https://github.com/vectorize-io/hindsight/commit/8564135))
- Server now prints its version during startup to simplify debugging and support requests. ( [`1499ce5`](https://github.com/vectorize-io/hindsight/commit/1499ce5))
- Improved tracing/debuggability by propagating request context through asynchronous background tasks. ( [`44d9125`](https://github.com/vectorize-io/hindsight/commit/44d9125))
- Added stronger validation and context for mental model create/refresh operations to prevent invalid requests. ( [`35127d5`](https://github.com/vectorize-io/hindsight/commit/35127d5))

**Bug Fixes**

- Improved embedding CLI experience with richer logs and isolated profiles to avoid cross-contamination between runs. ( [`794a743`](https://github.com/vectorize-io/hindsight/commit/794a743))
- Operation validation now runs correctly in the worker process, preventing invalid background operations from slipping through. ( [`96f0e54`](https://github.com/vectorize-io/hindsight/commit/96f0e54))
- Fixed unreliable behavior when using a custom PostgreSQL schema. ( [`3825506`](https://github.com/vectorize-io/hindsight/commit/3825506))

## [0.4.7](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.7) [​](https://hindsight.vectorize.io/changelog\#047 "Direct link to 047")

**Features**

- Add extension hooks to validate and customize mental model operations. ( [`9c3fda7`](https://github.com/vectorize-io/hindsight/commit/9c3fda7))
- Add support for using an external embedding API provider in OpenClaw plugin (with additional OpenClaw compatibility fixes). ( [`4b57b82`](https://github.com/vectorize-io/hindsight/commit/4b57b82))

**Improvements**

- Speed up container startup by preloading the tiktoken encoding during Docker image builds. ( [`039944c`](https://github.com/vectorize-io/hindsight/commit/039944c))

**Bug Fixes**

- Prevent PostgreSQL insert failures by stripping null bytes from text fields before saving. ( [`ef9d3a1`](https://github.com/vectorize-io/hindsight/commit/ef9d3a1))
- Fix worker schema selection so it uses the correct default database schema. ( [`d788a55`](https://github.com/vectorize-io/hindsight/commit/d788a55))
- Honor an already-set HINDSIGHT\_API\_DATABASE\_URL instead of overwriting it in the hindsight-embed workflow. ( [`f0cb192`](https://github.com/vectorize-io/hindsight/commit/f0cb192))

## [0.4.6](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.6) [​](https://hindsight.vectorize.io/changelog\#046 "Direct link to 046")

**Improvements**

- Improved OpenClaw configuration setup to make embedding integration easier to configure. ( [`27498f9`](https://github.com/vectorize-io/hindsight/commit/27498f9))

**Bug Fixes**

- Fixed OpenClaw embedding version binding/versioning to prevent mismatches when using the embed integration. ( [`1163b1f`](https://github.com/vectorize-io/hindsight/commit/1163b1f))

## [0.4.5](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.5) [​](https://hindsight.vectorize.io/changelog\#045 "Direct link to 045")

**Bug Fixes**

- Fixed occasional failures when retaining memories asynchronously with timestamps. ( [`cbb8fc6`](https://github.com/vectorize-io/hindsight/commit/cbb8fc6))

## [0.4.4](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.4) [​](https://hindsight.vectorize.io/changelog\#044 "Direct link to 044")

**Bug Fixes**

- Fixed async “retain” operations failing when a timestamp is provided. ( [`35f0984`](https://github.com/vectorize-io/hindsight/commit/35f0984))
- Corrected the OpenClaw daemon integration name to “openclaw” (previously “openclawd”). ( [`b364bc3`](https://github.com/vectorize-io/hindsight/commit/b364bc3))

## [0.4.3](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.3) [​](https://hindsight.vectorize.io/changelog\#043 "Direct link to 043")

**Features**

- Add Vertex AI as a supported LLM provider. ( [`c2ac7d0`](https://github.com/vectorize-io/hindsight/commit/c2ac7d0), [`49ae55a`](https://github.com/vectorize-io/hindsight/commit/49ae55a))
- Add Bearer token authentication for MCP and propagate tenant authentication across MCP requests. ( [`0da77ce`](https://github.com/vectorize-io/hindsight/commit/0da77ce))

**Improvements**

- CLI: add a --wait flag for consolidate and a --date filter for listing documents. ( [`ff20bf9`](https://github.com/vectorize-io/hindsight/commit/ff20bf9))

**Bug Fixes**

- Fix worker polling deadlocks to prevent background processing from stalling. ( [`f4f86e3`](https://github.com/vectorize-io/hindsight/commit/f4f86e3))
- Improve reliability of Docker builds by retrying ML model downloads. ( [`ecc590c`](https://github.com/vectorize-io/hindsight/commit/ecc590c))
- Fix tenant authentication handling for internal background tasks and ensure the control-plane forwards required auth to the dataplane. ( [`03bf13e`](https://github.com/vectorize-io/hindsight/commit/03bf13e))
- Ensure tenant database migrations run at startup and workers use the correct tenant schema context. ( [`657fe02`](https://github.com/vectorize-io/hindsight/commit/657fe02))
- Fix control-plane graph endpoint errors when upstream data is missing. ( [`751f99a`](https://github.com/vectorize-io/hindsight/commit/751f99a))

**Other**

- Rename the default bot/user identity from "moltbot" to "openclaw". ( [`728ce13`](https://github.com/vectorize-io/hindsight/commit/728ce13))

## [0.4.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.2) [​](https://hindsight.vectorize.io/changelog\#042 "Direct link to 042")

**Features**

- Added Clawdbot/Moltbot/OpenClaw integration. ( [`12e9a3d`](https://github.com/vectorize-io/hindsight/commit/12e9a3d))

**Improvements**

- Added additional configuration options to control LLM retry behavior. ( [`3f211f0`](https://github.com/vectorize-io/hindsight/commit/3f211f0))
- Added real-time logs showing a detailed timing breakdown during consolidation runs. ( [`8781c9f`](https://github.com/vectorize-io/hindsight/commit/8781c9f))

**Bug Fixes**

- Fixed hindsight-embed crashing on macOS. ( [`c16ccc2`](https://github.com/vectorize-io/hindsight/commit/c16ccc2))

## [0.4.1](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.1) [​](https://hindsight.vectorize.io/changelog\#041 "Direct link to 041")

**Features**

- Added support for using a non-default PostgreSQL schema by default. ( [`2b72e1f`](https://github.com/vectorize-io/hindsight/commit/2b72e1f))

**Improvements**

- Improved memory consolidation performance (benchmarking and optimizations). ( [`b43ef98`](https://github.com/vectorize-io/hindsight/commit/b43ef98))

**Bug Fixes**

- Fixed the /version endpoint returning an incorrect version. ( [`cfcc23c`](https://github.com/vectorize-io/hindsight/commit/cfcc23c))
- Fixed mental model search failing due to UUID type mismatch after text-ID migration. ( [`94cc0a1`](https://github.com/vectorize-io/hindsight/commit/94cc0a1))
- Added safer PyTorch device detection to prevent crashes on some environments. ( [`67c4788`](https://github.com/vectorize-io/hindsight/commit/67c4788))
- Fixed Python packages exposing an incorrect **version** value. ( [`fccbdfe`](https://github.com/vectorize-io/hindsight/commit/fccbdfe))

## [0.4.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.4.0) [​](https://hindsight.vectorize.io/changelog\#040 "Direct link to 040")

**Observations**, **Mental Models**, new **Agentic Reflect** and Directives, read the [announcement](https://hindsight.vectorize.io/blog/learning-capabilities).

**Features**

- Added support for providing a custom prompt for memory extraction. ( [`3172e99`](https://github.com/vectorize-io/hindsight/commit/3172e99))
- Expanded the LiteLLM integration with async retain/reflect support, cleaner API, and support for tags/mission (including passing API keys correctly). ( [`1d4879a`](https://github.com/vectorize-io/hindsight/commit/1d4879a))
- Added a new worker service to run background tasks at scale. ( [`4c79240`](https://github.com/vectorize-io/hindsight/commit/4c79240))
- MCP retain now supports timestamps. ( [`b378f68`](https://github.com/vectorize-io/hindsight/commit/b378f68))
- Added support for installing skills via `npx add-skill`. ( [`ec22317`](https://github.com/vectorize-io/hindsight/commit/ec22317))

**Improvements**

- CLI retain-files now accepts more file types. ( [`1eeced3`](https://github.com/vectorize-io/hindsight/commit/1eeced3))

**Bug Fixes**

- Fixed a macOS crash in the embed daemon caused by an XPC connection issue. ( [`e5fc6ee`](https://github.com/vectorize-io/hindsight/commit/e5fc6ee))
- Fixed occasional extraction in the wrong language. ( [`87d4a36`](https://github.com/vectorize-io/hindsight/commit/87d4a36))
- Fixed PyTorch model initialization issues that could cause startup failures (meta tensor/init problems). ( [`ddaa5f5`](https://github.com/vectorize-io/hindsight/commit/ddaa5f5))

**Features**

- Add memory tags so you can label and filter memories during recall/reflect. ( [`20c8f8b`](https://github.com/vectorize-io/hindsight/commit/20c8f8b))
- Allow choosing different AI providers/models per operation. ( [`e6709d5`](https://github.com/vectorize-io/hindsight/commit/e6709d5))
- Add Cohere support for embeddings and reranking. ( [`4de0730`](https://github.com/vectorize-io/hindsight/commit/4de0730))
- Add configurable embedding dimensions and OpenAI embeddings support. ( [`70de23e`](https://github.com/vectorize-io/hindsight/commit/70de23e))
- Support custom base URLs for OpenAI-style embeddings and Cohere endpoints. ( [`fa53917`](https://github.com/vectorize-io/hindsight/commit/fa53917))
- Add LiteLLM gateway support for routing LLM/embedding requests. ( [`d47c8a2`](https://github.com/vectorize-io/hindsight/commit/d47c8a2))
- Add multilingual content support to improve handling and retrieval across languages. ( [`c65c6a9`](https://github.com/vectorize-io/hindsight/commit/c65c6a9))
- Add delete memory bank capability. ( [`4b82d2d`](https://github.com/vectorize-io/hindsight/commit/4b82d2d))
- Add backup/restore tooling for memory banks. ( [`67b273d`](https://github.com/vectorize-io/hindsight/commit/67b273d))

**Improvements**

- Add retention modes to control how memories are extracted and stored. ( [`fb31a35`](https://github.com/vectorize-io/hindsight/commit/fb31a35))
- Add offline (optional) database migrations to support restricted/air-gapped deployments. ( [`233bd2e`](https://github.com/vectorize-io/hindsight/commit/233bd2e))
- Add database connection configuration options for more flexible deployments. ( [`33fac2c`](https://github.com/vectorize-io/hindsight/commit/33fac2c))
- Load .env automatically on startup to simplify configuration. ( [`c06d9b4`](https://github.com/vectorize-io/hindsight/commit/c06d9b4))
- Expose an operation ID from retain requests so async/background processing can be tracked. ( [`1dacd0e`](https://github.com/vectorize-io/hindsight/commit/1dacd0e))
- Add per-request LLM token usage metrics for monitoring and cost tracking. ( [`29a542d`](https://github.com/vectorize-io/hindsight/commit/29a542d))
- Add LLM call latency metrics for performance monitoring. ( [`5e1f13e`](https://github.com/vectorize-io/hindsight/commit/5e1f13e))
- Include tenant in metrics labels for better multi-tenant observability. ( [`1ffc2a4`](https://github.com/vectorize-io/hindsight/commit/1ffc2a4))
- Add async processing option to MCP retain tool for background retention workflows. ( [`37fc7fb`](https://github.com/vectorize-io/hindsight/commit/37fc7fb))

**Bug Fixes**

- Fix extension loading in multi-worker deployments so all workers load extensions correctly. ( [`f5f3fca`](https://github.com/vectorize-io/hindsight/commit/f5f3fca))
- Improve recall performance by batching recall queries. ( [`5991308`](https://github.com/vectorize-io/hindsight/commit/5991308))
- Improve retrieval quality and stability for large memory banks (graph/MPFP retrieval fixes). ( [`6232e69`](https://github.com/vectorize-io/hindsight/commit/6232e69))
- Fix entities list being limited to 100 entities. ( [`26bf571`](https://github.com/vectorize-io/hindsight/commit/26bf571))
- Fix UI only showing the first 1000 memories. ( [`67c1a42`](https://github.com/vectorize-io/hindsight/commit/67c1a42))
- Fix duplicated causal relationships and improve token usage during processing. ( [`49e233c`](https://github.com/vectorize-io/hindsight/commit/49e233c))
- Improve causal link detection accuracy. ( [`2a00df0`](https://github.com/vectorize-io/hindsight/commit/2a00df0))
- Make retain max completion tokens configurable to prevent truncation issues. ( [`7715a51`](https://github.com/vectorize-io/hindsight/commit/7715a51))
- Fix Python SDK not sending the Authorization header, preventing authenticated requests. ( [`39e3f7c`](https://github.com/vectorize-io/hindsight/commit/39e3f7c))
- Fix stats endpoint missing tenant authentication in multi-tenant setups. ( [`d6ff191`](https://github.com/vectorize-io/hindsight/commit/d6ff191))
- Fix embedding dimension handling for tenant schemas in multi-tenant databases. ( [`6fe9314`](https://github.com/vectorize-io/hindsight/commit/6fe9314))
- Fix Groq free-tier compatibility so requests work correctly. ( [`d899d18`](https://github.com/vectorize-io/hindsight/commit/d899d18))
- Fix security vulnerability (qs / CVE-2025-15284). ( [`b3becb6`](https://github.com/vectorize-io/hindsight/commit/b3becb6))
- Restore MCP tools for listing and creating memory banks. ( [`9fd5679`](https://github.com/vectorize-io/hindsight/commit/9fd5679))

## [0.2.0](https://github.com/vectorize-io/hindsight/releases/tag/v0.2.0) [​](https://hindsight.vectorize.io/changelog\#020 "Direct link to 020")

**Features**

- Add additional model provider support, including Anthropic Claude and LM Studio. ( [`787ed60`](https://github.com/vectorize-io/hindsight/commit/787ed60))
- Add multi-bank access and new MCP tools for interacting with multiple memory banks via MCP. ( [`6b5f593`](https://github.com/vectorize-io/hindsight/commit/6b5f593))
- Allow supplying custom entities when retaining memories via the retain endpoint. ( [`dd59bc8`](https://github.com/vectorize-io/hindsight/commit/dd59bc8))
- Enhance the /reflect endpoint with max\_tokens control and optional structured output responses. ( [`d49e820`](https://github.com/vectorize-io/hindsight/commit/d49e820))

**Improvements**

- Improve local LLM support for reasoning-capable models and streamline Docker startup for local deployments. ( [`eea0f27`](https://github.com/vectorize-io/hindsight/commit/eea0f27))
- Support operation validator extensions and return proper HTTP errors when validation fails. ( [`ce45d30`](https://github.com/vectorize-io/hindsight/commit/ce45d30))
- Add configurable observation thresholds to control when observations are created/updated. ( [`54e2df0`](https://github.com/vectorize-io/hindsight/commit/54e2df0))
- Improve graph visualization to the control plane for exploring memory relationships. ( [`1a62069`](https://github.com/vectorize-io/hindsight/commit/1a62069))

**Bug Fixes**

- Fix MCP server lifecycle handling so MCP lifespan is correctly tied to the FastAPI app lifespan. ( [`6b78f7d`](https://github.com/vectorize-io/hindsight/commit/6b78f7d))

## [0.1.15](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.15) [​](https://hindsight.vectorize.io/changelog\#0115 "Direct link to 0115")

**Features**

- Add the ability to delete documents from the web UI. ( [`f7ff32d`](https://github.com/vectorize-io/hindsight/commit/f7ff32d))

**Improvements**

- Improve the API health check endpoint and update the generated client APIs/types accordingly. ( [`e06a612`](https://github.com/vectorize-io/hindsight/commit/e06a612))

## [0.1.14](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.14) [​](https://hindsight.vectorize.io/changelog\#0114 "Direct link to 0114")

**Bug Fixes**

- Fixes the embedded “get-skill” installer so installing skills works correctly. ( [`0b352d1`](https://github.com/vectorize-io/hindsight/commit/0b352d1))

## [0.1.13](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.13) [​](https://hindsight.vectorize.io/changelog\#0113 "Direct link to 0113")

**Improvements**

- Improve reliability by surfacing task handler failures so retries can occur when processing fails. ( [`904ea4d`](https://github.com/vectorize-io/hindsight/commit/904ea4d))
- Revamp the hindsight-embed component architecture, including a new daemon/client model and CLI updates for embedding workflows. ( [`e6511e7`](https://github.com/vectorize-io/hindsight/commit/e6511e7))

**Bug Fixes**

- Fix memory retention so timestamps are correctly taken into account. ( [`234d426`](https://github.com/vectorize-io/hindsight/commit/234d426))

## [0.1.12](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.12) [​](https://hindsight.vectorize.io/changelog\#0112 "Direct link to 0112")

**Features**

- Added an extensions system for plugging in new operations/skills (including built-in tenant support). ( [`2a0c490`](https://github.com/vectorize-io/hindsight/commit/2a0c490))
- Introduced the hindsight-embed tool and a native agentic skill for embedding/agent workflows. ( [`da44a5e`](https://github.com/vectorize-io/hindsight/commit/da44a5e))

**Improvements**

- Improved reliability when parsing LLM JSON by retrying on parse errors and adding clearer diagnostics. ( [`a831a7b`](https://github.com/vectorize-io/hindsight/commit/a831a7b))

**Bug Fixes**

- Fixed structured-output support for Ollama-based LLM providers. ( [`32bca12`](https://github.com/vectorize-io/hindsight/commit/32bca12))
- Adjusted LLM validation to cap max completion tokens at 100 to prevent validation failures. ( [`b94b5cf`](https://github.com/vectorize-io/hindsight/commit/b94b5cf))

## [0.1.11](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.11) [​](https://hindsight.vectorize.io/changelog\#0111 "Direct link to 0111")

**Bug Fixes**

- Fixed the standalone Docker image and control plane standalone build process so standalone deployments build correctly. ( [`2948cb6`](https://github.com/vectorize-io/hindsight/commit/2948cb6))

## [0.1.10](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.10) [​](https://hindsight.vectorize.io/changelog\#0110 "Direct link to 0110")

_This release contains internal maintenance and infrastructure changes only._

## [0.1.9](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.9) [​](https://hindsight.vectorize.io/changelog\#019 "Direct link to 019")

**Features**

- Simplified local MCP installation and added a standalone UI option for easier setup. ( [`1c6acc3`](https://github.com/vectorize-io/hindsight/commit/1c6acc3))

**Bug Fixes**

- Fixed the standalone Docker image so it builds and starts reliably. ( [`b52eb90`](https://github.com/vectorize-io/hindsight/commit/b52eb90))
- Improved Docker runtime reliability by adding required system utilities (procps). ( [`ae80876`](https://github.com/vectorize-io/hindsight/commit/ae80876))

## [0.1.8](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.8) [​](https://hindsight.vectorize.io/changelog\#018 "Direct link to 018")

**Bug Fixes**

- Fix bank list responses when a bank has no name. ( [`04f01ab`](https://github.com/vectorize-io/hindsight/commit/04f01ab))
- Fix failures when retaining memories asynchronously. ( [`63f5138`](https://github.com/vectorize-io/hindsight/commit/63f5138))
- Fix a race condition in the bank selector when switching banks. ( [`e468a4e`](https://github.com/vectorize-io/hindsight/commit/e468a4e))

## [0.1.7](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.7) [​](https://hindsight.vectorize.io/changelog\#017 "Direct link to 017")

_This release contains internal maintenance and infrastructure changes only._

## [0.1.6](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.6) [​](https://hindsight.vectorize.io/changelog\#016 "Direct link to 016")

**Features**

- Added support for the Gemini 3 Pro and GPT-5.2 models. ( [`bb1f9cb`](https://github.com/vectorize-io/hindsight/commit/bb1f9cb))
- Added a local MCP server option for running/connecting to Hindsight via MCP without a separate remote service. ( [`7dd6853`](https://github.com/vectorize-io/hindsight/commit/7dd6853))

**Improvements**

- Updated the Postgres/pg0 dependency to a newer 0.11.x series for improved compatibility and stability. ( [`47be07f`](https://github.com/vectorize-io/hindsight/commit/47be07f))

## [0.1.5](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.5) [​](https://hindsight.vectorize.io/changelog\#015 "Direct link to 015")

**Features**

- Added LiteLLM integration so Hindsight can capture and manage memories from LiteLLM-based LLM calls. ( [`dfccbf2`](https://github.com/vectorize-io/hindsight/commit/dfccbf2))
- Added an optional graph-based retriever (MPFP) to improve recall by leveraging relationships between memories. ( [`7445cef`](https://github.com/vectorize-io/hindsight/commit/7445cef))

**Improvements**

- Switched the embedded Postgres layer to pg0-embedded for a smoother local/standalone experience. ( [`94c2b85`](https://github.com/vectorize-io/hindsight/commit/94c2b85))

**Bug Fixes**

- Fixed repeated retries on 400 errors from the LLM, preventing unnecessary request loops and failures. ( [`70983f5`](https://github.com/vectorize-io/hindsight/commit/70983f5))
- Fixed recall trace visualization in the control plane so search/recall debugging displays correctly. ( [`922164e`](https://github.com/vectorize-io/hindsight/commit/922164e))
- Fixed the CLI installer to make installation more reliable. ( [`158a6aa`](https://github.com/vectorize-io/hindsight/commit/158a6aa))
- Updated Next.js to patch security vulnerabilities (CVE-2025-55184, CVE-2025-55183). ( [`f018cc5`](https://github.com/vectorize-io/hindsight/commit/f018cc5))

## [0.1.3](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.3) [​](https://hindsight.vectorize.io/changelog\#013 "Direct link to 013")

**Improvements**

- Improved CLI and UI branding/polish, including new banner/logo assets and updated interface styling. ( [`fa554b8`](https://github.com/vectorize-io/hindsight/commit/fa554b8))

## [0.1.2](https://github.com/vectorize-io/hindsight/releases/tag/v0.1.2) [​](https://hindsight.vectorize.io/changelog\#012 "Direct link to 012")

**Bug Fixes**

- Fixed the standalone Docker image so it builds/runs correctly. ( [`1056a20`](https://github.com/vectorize-io/hindsight/commit/1056a20))
