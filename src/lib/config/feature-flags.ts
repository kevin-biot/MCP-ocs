// Feature flags for FIX-001 emergency consolidation
export const FEATURE_FLAGS = {
  // When true, suppress stdout during server operation and sanitize stderr
  STRICT_STDIO_LOGS: process.env.STRICT_STDIO_LOGS === 'true',
  // When true, use unified memory backend once available
  UNIFIED_MEMORY: process.env.UNIFIED_MEMORY === 'true',
  // Optional: enable orchestration-context memory retrieval
  ENABLE_ORCH_CONTEXT: process.env.ENABLE_ORCH_CONTEXT === 'true',
  // When true, allow verbose memory logging to stderr
  MCP_LOG_VERBOSE: process.env.MCP_LOG_VERBOSE === 'true',
  // Structured memory logs (one-line JSON events)
  MEMORY_STRUCTURED_LOGS: process.env.MEMORY_STRUCTURED_LOGS === 'true'
} as const;
