# Performance Metrics - Process v3.2

- Timeouts: default tool timeout controlled via `TOOL_TIMEOUT_MS`
- Memory ops serialized only for writes; read paths remain parallel to preserve throughput
- No external network dependencies added; only fetch timeouts applied to existing Chroma calls
