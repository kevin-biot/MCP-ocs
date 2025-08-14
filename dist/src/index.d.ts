#!/usr/bin/env node
/**
 * MCP-ocs Main Entry Point - Complete Tool Suite
 * Registers ALL tools: diagnostics, read-ops, state-mgmt, write-ops
 */
export { MCPOcsMemoryAdapter } from './lib/memory/mcp-ocs-memory-adapter.js';
export type { OCSIncidentMemory } from './lib/memory/mcp-ocs-memory-adapter.js';
