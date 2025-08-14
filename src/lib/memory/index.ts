/**
 * Memory System Entry Point
 *
 * Streamlined exports for the stability-first rebuild.
 */

export { SharedMemoryManager } from './shared-memory.js';
export { MCPOcsMemoryAdapter } from './mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './mcp-ocs-memory-adapter.js';
export { createOcsAdapter } from './adapter-entry.js';
