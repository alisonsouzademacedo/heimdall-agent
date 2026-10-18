<!-- source: https://hindsight.vectorize.io/sdks/go -->
# Go Client

Official Go client for the Hindsight API, generated from the OpenAPI 3.1 spec using [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator).




## Installation

```bash
go get github.com/vectorize-io/hindsight/hindsight-clients/go
```

Requires Go 1.23+.

## Quick Start

```go
cfg := hindsight.NewConfiguration()
cfg.Servers = hindsight.ServerConfigurations{
	{URL: "http://localhost:8888"},
}
client := hindsight.NewAPIClient(cfg)
ctx := context.Background()

// Retain a memory
retainReq := hindsight.RetainRequest{
	Items: []hindsight.MemoryItem{
		{Content: hindsight.TextContent("Alice works at Google")},
	},
}
client.MemoryAPI.RetainMemories(ctx, "my-bank").RetainRequest(retainReq).Execute()

// Recall memories
recallReq := hindsight.RecallRequest{
	Query: "What does Alice do?",
}
resp, _, _ := client.MemoryAPI.RecallMemories(ctx, "my-bank").RecallRequest(recallReq).Execute()
for _, r := range resp.Results {
	fmt.Println(r.Text)
}

// Reflect - generate response
reflectReq := hindsight.ReflectRequest{
	Query: "Tell me about Alice",
}
answer, _, _ := client.MemoryAPI.Reflect(ctx, "my-bank").ReflectRequest(reflectReq).Execute()
fmt.Println(answer.GetText())
```

## API Structure

The Go client provides access to all Hindsight API operations through structured namespaces:

- **`client.MemoryAPI`** - Retain, recall, reflect operations
- **`client.BanksAPI`** - Bank management
- **`client.DirectivesAPI`** - Directive management
- **`client.MentalModelsAPI`** - Mental model management
- **`client.DocumentsAPI`** - Document operations
- **`client.EntitiesAPI`** - Entity operations
- **`client.OperationsAPI`** - Async operation monitoring

## Working with Nullable Fields

The Go client uses `NullableString`, `NullableTime`, and similar types for optional fields:

```go
// Creating nullable values
timestamp := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC)
retainReq2 := hindsight.RetainRequest{
	Items: []hindsight.MemoryItem{
		{
			Content:   hindsight.TextContent("Alice got promoted"),
			Context:   *hindsight.NewNullableString(hindsight.PtrString("career update")),
			Timestamp: *hindsight.NewNullableTimestamp(&hindsight.Timestamp{TimeTime: hindsight.PtrTime(timestamp)}),
			Tags:      []string{"career"},
		},
	},
}
retainResp, _, _ := client.MemoryAPI.RetainMemories(ctx, "my-bank").RetainRequest(retainReq2).Execute()

// Checking if a value is set
if retainResp.HasOperationId() {
	fmt.Println("OperationId:", retainResp.GetOperationId())
}
```

## Error Handling

```go
_, httpResp2, err := client.MemoryAPI.RecallMemories(ctx, "my-bank").
	RecallRequest(recallReq).
	Execute()

if err != nil {
	log.Fatalf("Recall failed: %v", err)
}
defer httpResp2.Body.Close()
```

## More Examples

For detailed examples of all operations, see:
- [Python SDK documentation](./python.mdx) - API concepts are the same
- [Node.js SDK documentation](./nodejs.mdx) - API concepts are the same
- [OpenAPI specification](https://hindsight.dev/openapi.json) - Complete API reference


---
