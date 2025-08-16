#!/usr/bin/env node
/**
 * MCP-ocs Entry (Sequential Thinking Parallel)
 *
 * Parallel server entrypoint integrating EnhancedSequentialThinkingOrchestrator
 * without modifying the original src/index.ts
 */
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './lib/memory/mcp-ocs-memory-adapter.js';
