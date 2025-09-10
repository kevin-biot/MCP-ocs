# MCP-OCS Memory Ops Guide

This guide summarizes feature flags and standard procedures for operating the unified memory system safely in production.

## Feature Flags

- `UNIFIED_MEMORY`
  - Enables the UnifiedMemoryAdapter pathway.
  - Default: `false`. Safe to toggle on; JSON fallback is always preserved.

- `CHROMA_COLLECTION_PREFIX`
  - Prefix for vector collections to guarantee isolation (default: `mcp-ocs-`).
  - Results in `mcp-ocs-conversations` and `mcp-ocs-operational`.

- `MCP_OCS_FORCE_JSON`
  - Kill switch to hard-disable vector usage (JSON-only mode), regardless of Chroma health.
  - Use in production until isolation audits pass.

- `MEMORY_STRUCTURED_LOGS`
  - When `true`, emits single-line JSON events for store/search to stderr.
  - Compatible with `STRICT_STDIO_LOGS` for protocol compliance.

- `STRICT_STDIO_LOGS`
  - Enforces protocol-safe logging (no stdout for server runs; stderr only, sanitized).

- `MCP_LOG_VERBOSE`
  - Enables verbose memory subsystem logging (stderr), sanitized.

## Standard Procedures

### 1) JSON-Only Validation (safe default)

- Set: `MCP_OCS_FORCE_JSON=true UNIFIED_MEMORY=true`
- Run sequential or beta entry; verify zero stdout during startup.
- Use tmp scripts:
  - `tsx tmp/store-incident.ts`
  - `tsx tmp/search-operational.ts`
  - `tsx tmp/search-conversations.ts`

### 2) Collection Isolation Audit

- Set prefix: `CHROMA_COLLECTION_PREFIX=mcp-ocs-`
- Audit: `npm run memory:collections:audit`
- Confirm `isolated: true` and no unprefixed collections.

### 3) Vector Safe Test (bounded)

- Preconditions: isolation audit passed.
- Execute: `tsx tmp/vector-safe-test.ts`
  - Creates `mcp-ocs-test-vector-validation`, stores, searches, then deletes the test collection.
  - Captures structured step logs to stderr; stdout returns final JSON result.

### 4) Enabling Vector Path (post‑approval)

- Keep `CHROMA_COLLECTION_PREFIX=mcp-ocs-`.
- Unset `MCP_OCS_FORCE_JSON`.
- Pre-create or reload collections as needed (optional):
  - `tsx src/cli/memory-tools.ts collections:list`
  - `tsx src/cli/memory-tools.ts reload` (bulk JSON→vector), only after isolation verified.
- Verify with: `tsx src/cli/memory-tools.ts test-consistency`.

### 5) Structured Logging

- Enable: `MEMORY_STRUCTURED_LOGS=true`.
- Store/search events appear as one-line JSON on stderr:
  - `store_conversation`, `store_operational`, `search_conversations`, `search_operational`.

### 6) Protocol Smoke (servers)

- Sequential: `STRICT_STDIO_LOGS=true tsx src/index-sequential.ts --version`
- Beta: `STRICT_STDIO_LOGS=true tsx src/index.beta.ts --version`
- Expect: zero stdout; tool registration and readiness logs on stderr only.

### 7) Rollback

- Set `MCP_OCS_FORCE_JSON=true` to return to JSON-only mode at any time.
- Keep `UNIFIED_MEMORY=false` to bypass unified path entirely (legacy).

## Notes

- All server-mode logs are sanitized; emojis and non‑ASCII are stripped.
- Isolation and safety are P0: keep vector disabled until audits pass.

