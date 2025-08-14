// Minimal no-op shim to satisfy existing imports during rebuild
export class KnowledgeSeedingSystem {
  constructor(_sharedMemory?: any, _autoMemory?: any) {}

  async initialize(): Promise<void> {}
}

// Export placeholders for compatibility if referenced
export type KnowledgeSourceClass = 'user_provided' | 'engineer_added' | 'system_generated';
export type KnowledgeSeedTemplate = any;
export type EnhancedMemoryRecord = any;
export const ENGINEER_TEMPLATES: Record<string, KnowledgeSeedTemplate> = {};

