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
  MEMORY_STRUCTURED_LOGS: process.env.MEMORY_STRUCTURED_LOGS === 'true',

  // Instrumentation middleware master switch
  ENABLE_INSTRUMENTATION: process.env.ENABLE_INSTRUMENTATION !== 'false',
  // Enable vector writes from middleware (will still noop if Chroma unavailable or MCP_OCS_FORCE_JSON set)
  ENABLE_VECTOR_WRITES: process.env.ENABLE_VECTOR_WRITES !== 'false',
  // Enable pre-search enrichment (Phase 3)
  ENABLE_PRESEARCH: process.env.ENABLE_PRESEARCH === 'true',
  // Optional CSV allowlist of tool full names to instrument; if unset → instrument all
  INSTRUMENT_ALLOWLIST: process.env.INSTRUMENT_ALLOWLIST || ''
} as const;
