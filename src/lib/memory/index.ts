/**
 * Memory System Entry Point
 * 
 * Exports all memory-related functionality for the MCP-ocs system.
 */

export { VectorMemoryManager } from './vector-memory-manager.js';
export { VectorStore } from './vector-store.js';
export { SharedMemoryManager } from './shared-memory.js';
export { AutoMemorySystem } from './auto-memory-system.js';
export { 
  KnowledgeSeedingSystem, 
  KnowledgeSourceClass, 
  KnowledgeSeedTemplate, 
  EnhancedMemoryRecord,
  ENGINEER_TEMPLATES 
} from './knowledge-seeding-system.js';