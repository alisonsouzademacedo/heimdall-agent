<!-- source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone -->
[Skip to main content](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#__docusaurus_skipToContent_fallback)

On this page

Managed vector DB for production RAG and search.

## Skill metadata [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#skill-metadata "Direct link to Skill metadata")

|  |  |
| --- | --- |
| Source | Optional — install with `hermes skills install official/mlops/pinecone` |
| Path | `optional-skills/mlops/pinecone` |
| Version | `1.0.1` |
| Author | Orchestra Research |
| License | MIT |
| Dependencies | `pinecone` |
| Platforms | linux, macos, windows |
| Tags | `RAG`, `Pinecone`, `Vector Database`, `Managed Service`, `Serverless`, `Hybrid Search`, `Production`, `Auto-Scaling`, `Low Latency`, `Recommendations` |

## Reference: full SKILL.md [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#reference-full-skillmd "Direct link to Reference: full SKILL.md")

info

The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active.

# Pinecone - Managed Vector Database

The vector database for production AI applications.

## When to use Pinecone [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#when-to-use-pinecone "Direct link to When to use Pinecone")

**Use when:**

- Need managed, serverless vector database
- Production RAG applications
- Auto-scaling required
- Low latency critical (<100ms)
- Don't want to manage infrastructure
- Need hybrid search (dense + sparse vectors)

**Metrics**:

- Fully managed SaaS
- Auto-scales to billions of vectors
- **p95 latency <100ms**
- 99.9% uptime SLA

**Use alternatives instead**:

- **Chroma**: Self-hosted, open-source
- **FAISS**: Offline, pure similarity search
- **Weaviate**: Self-hosted with more features

## Quick start [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#quick-start "Direct link to Quick start")

### Installation [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#installation "Direct link to Installation")

```bash
pip install pinecone
```

> Note: the old `pinecone-client` package is deprecated. Install `pinecone` (v5+; current 9.x). The import stays `from pinecone import Pinecone`.

### Basic usage [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#basic-usage "Direct link to Basic usage")

```python
from pinecone import Pinecone, ServerlessSpec

# Initialize

pc = Pinecone(api_key="your-api-key")

# Create index

pc.create_index(

    name="my-index",

    dimension=1536,  # Must match embedding dimension

    metric="cosine",  # or "euclidean", "dotproduct"

    spec=ServerlessSpec(cloud="aws", region="us-east-1")

)

# Connect to index

index = pc.Index("my-index")

# Upsert vectors

index.upsert(vectors=[\
\
    {"id": "vec1", "values": [0.1, 0.2, ...], "metadata": {"category": "A"}},\
\
    {"id": "vec2", "values": [0.3, 0.4, ...], "metadata": {"category": "B"}}\
\
])

# Query

results = index.query(

    vector=[0.1, 0.2, ...],

    top_k=5,

    include_metadata=True

)

print(results["matches"])
```

## Core operations [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#core-operations "Direct link to Core operations")

### Create index [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#create-index "Direct link to Create index")

```python
# Serverless (recommended)

pc.create_index(

    name="my-index",

    dimension=1536,

    metric="cosine",

    spec=ServerlessSpec(

        cloud="aws",         # or "gcp", "azure"

        region="us-east-1"

    )

)

# Pod-based (for consistent performance)

from pinecone import PodSpec

pc.create_index(

    name="my-index",

    dimension=1536,

    metric="cosine",

    spec=PodSpec(

        environment="us-east1-gcp",

        pod_type="p1.x1"

    )

)
```

### Upsert vectors [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#upsert-vectors "Direct link to Upsert vectors")

```python
# Single upsert

index.upsert(vectors=[\
\
    {\
\
        "id": "doc1",\
\
        "values": [0.1, 0.2, ...],  # 1536 dimensions\
\
        "metadata": {\
\
            "text": "Document content",\
\
            "category": "tutorial",\
\
            "timestamp": "2025-01-01"\
\
        }\
\
    }\
\
])

# Batch upsert (recommended)

vectors = [\
\
    {"id": f"vec{i}", "values": embedding, "metadata": metadata}\
\
    for i, (embedding, metadata) in enumerate(zip(embeddings, metadatas))\
\
]

index.upsert(vectors=vectors, batch_size=100)
```

### Query vectors [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#query-vectors "Direct link to Query vectors")

```python
# Basic query

results = index.query(

    vector=[0.1, 0.2, ...],

    top_k=10,

    include_metadata=True,

    include_values=False

)

# With metadata filtering

results = index.query(

    vector=[0.1, 0.2, ...],

    top_k=5,

    filter={"category": {"$eq": "tutorial"}}

)

# Namespace query

results = index.query(

    vector=[0.1, 0.2, ...],

    top_k=5,

    namespace="production"

)

# Access results

for match in results["matches"]:

    print(f"ID: {match['id']}")

    print(f"Score: {match['score']}")

    print(f"Metadata: {match['metadata']}")
```

### Metadata filtering [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#metadata-filtering "Direct link to Metadata filtering")

```python
# Exact match

filter = {"category": "tutorial"}

# Comparison

filter = {"price": {"$gte": 100}}  # $gt, $gte, $lt, $lte, $ne

# Logical operators

filter = {

    "$and": [\
\
        {"category": "tutorial"},\
\
        {"difficulty": {"$lte": 3}}\
\
    ]

}  # Also: $or

# In operator

filter = {"tags": {"$in": ["python", "ml"]}}
```

## Namespaces [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#namespaces "Direct link to Namespaces")

```python
# Partition data by namespace

index.upsert(

    vectors=[{"id": "vec1", "values": [...]}],

    namespace="user-123"

)

# Query specific namespace

results = index.query(

    vector=[...],

    namespace="user-123",

    top_k=5

)

# List namespaces

stats = index.describe_index_stats()

print(stats['namespaces'])
```

## Hybrid search (dense + sparse) [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#hybrid-search-dense--sparse "Direct link to Hybrid search (dense + sparse)")

```python
# Upsert with sparse vectors

index.upsert(vectors=[\
\
    {\
\
        "id": "doc1",\
\
        "values": [0.1, 0.2, ...],  # Dense vector\
\
        "sparse_values": {\
\
            "indices": [10, 45, 123],  # Token IDs\
\
            "values": [0.5, 0.3, 0.8]   # TF-IDF scores\
\
        },\
\
        "metadata": {"text": "..."}\
\
    }\
\
])

# Hybrid query

# NOTE: index.query() does NOT accept an `alpha` kwarg. Pinecone stores a

# single sparse-dense vector, so weighting must be applied by pre-scaling the

# query vectors before sending them. Use the hybrid_score_norm helper below

# (alpha * dense + (1 - alpha) * sparse; alpha=1 → pure dense, 0 → pure sparse).

def hybrid_score_norm(dense, sparse, alpha: float):

    """Scale dense/sparse query vectors for weighted hybrid search."""

    if not 0 <= alpha <= 1:

        raise ValueError("alpha must be between 0 and 1")

    scaled_sparse = {

        "indices": sparse["indices"],

        "values": [v * (1 - alpha) for v in sparse["values"]],

    }

    return [v * alpha for v in dense], scaled_sparse

hdense, hsparse = hybrid_score_norm(

    dense=[0.1, 0.2, ...],

    sparse={"indices": [10, 45], "values": [0.5, 0.3]},

    alpha=0.5,  # 0=sparse, 1=dense, 0.5=balanced

)

results = index.query(

    vector=hdense,

    sparse_vector=hsparse,

    top_k=5,

)
```

## LangChain integration [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#langchain-integration "Direct link to LangChain integration")

```python
from langchain_pinecone import PineconeVectorStore

from langchain_openai import OpenAIEmbeddings

# Create vector store

vectorstore = PineconeVectorStore.from_documents(

    documents=docs,

    embedding=OpenAIEmbeddings(),

    index_name="my-index"

)

# Query

results = vectorstore.similarity_search("query", k=5)

# With metadata filter

results = vectorstore.similarity_search(

    "query",

    k=5,

    filter={"category": "tutorial"}

)

# As retriever

retriever = vectorstore.as_retriever(search_kwargs={"k": 10})
```

## LlamaIndex integration [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#llamaindex-integration "Direct link to LlamaIndex integration")

```python
from llama_index.vector_stores.pinecone import PineconeVectorStore

# Connect to Pinecone

pc = Pinecone(api_key="your-key")

pinecone_index = pc.Index("my-index")

# Create vector store

vector_store = PineconeVectorStore(pinecone_index=pinecone_index)

# Use in LlamaIndex

from llama_index.core import StorageContext, VectorStoreIndex

storage_context = StorageContext.from_defaults(vector_store=vector_store)

index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
```

## Index management [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#index-management "Direct link to Index management")

```python
# List indices

indexes = pc.list_indexes()

# Describe index

index_info = pc.describe_index("my-index")

print(index_info)

# Get index stats

stats = index.describe_index_stats()

print(f"Total vectors: {stats['total_vector_count']}")

print(f"Namespaces: {stats['namespaces']}")

# Delete index

pc.delete_index("my-index")
```

## Delete vectors [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#delete-vectors "Direct link to Delete vectors")

```python
# Delete by ID

index.delete(ids=["vec1", "vec2"])

# Delete by filter

index.delete(filter={"category": "old"})

# Delete all in namespace

index.delete(delete_all=True, namespace="test")

# Delete entire index

index.delete(delete_all=True)
```

## Best practices [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#best-practices "Direct link to Best practices")

01. **Use serverless** \- Auto-scaling, cost-effective
02. **Batch upserts** \- More efficient (100-200 per batch)
03. **Add metadata** \- Enable filtering
04. **Use namespaces** \- Isolate data by user/tenant
05. **Monitor usage** \- Check Pinecone dashboard
06. **Optimize filters** \- Index frequently filtered fields
07. **Test with free tier** \- 1 index, 100K vectors free
08. **Use hybrid search** \- Better quality
09. **Set appropriate dimensions** \- Match embedding model
10. **Regular backups** \- Export important data

## Performance [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#performance "Direct link to Performance")

| Operation | Latency | Notes |
| --- | --- | --- |
| Upsert | ~50-100ms | Per batch |
| Query (p50) | ~50ms | Depends on index size |
| Query (p95) | ~100ms | SLA target |
| Metadata filter | ~+10-20ms | Additional overhead |

## Pricing (as of 2025) [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#pricing-as-of-2025 "Direct link to Pricing (as of 2025)")

**Serverless**:

- $0.096 per million read units
- $0.06 per million write units
- $0.06 per GB storage/month

**Free tier**:

- 1 serverless index
- 100K vectors (1536 dimensions)
- Great for prototyping

## Resources [​](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone\#resources "Direct link to Resources")

- **Website**: [https://www.pinecone.io](https://www.pinecone.io/)
- **Docs**: [https://docs.pinecone.io](https://docs.pinecone.io/)
- **Console**: [https://app.pinecone.io](https://app.pinecone.io/)
- **Pricing**: [https://www.pinecone.io/pricing](https://www.pinecone.io/pricing)

- [Skill metadata](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#skill-metadata)
- [Reference: full SKILL.md](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#reference-full-skillmd)
- [When to use Pinecone](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#when-to-use-pinecone)
- [Quick start](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#quick-start)
  - [Installation](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#installation)
  - [Basic usage](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#basic-usage)
- [Core operations](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#core-operations)
  - [Create index](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#create-index)
  - [Upsert vectors](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#upsert-vectors)
  - [Query vectors](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#query-vectors)
  - [Metadata filtering](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#metadata-filtering)
- [Namespaces](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#namespaces)
- [Hybrid search (dense + sparse)](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#hybrid-search-dense--sparse)
- [LangChain integration](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#langchain-integration)
- [LlamaIndex integration](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#llamaindex-integration)
- [Index management](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#index-management)
- [Delete vectors](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#delete-vectors)
- [Best practices](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#best-practices)
- [Performance](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#performance)
- [Pricing (as of 2025)](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#pricing-as-of-2025)
- [Resources](https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/mlops/mlops-pinecone#resources)
