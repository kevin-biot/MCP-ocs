# Testing Requirements - TIER 2

- Async correctness
  - Tool timeouts: verify `timeoutMs` triggers TimeoutError and returns standardized JSON
  - No unawaited promises: static scan; run representative tools to ensure no floating rejections
  - Race conditions: concurrent storeConversation/storeOperational calls do not corrupt files
- Error taxonomy
  - Throw paths produce structured errors with correct `type` and `statusCode`
  - OpenShift command failures map to ExternalCommandError (502)
  - Not found tools map to NotFoundError (404)
  - Standardized error response shape returned by MCP tool handler
