export declare class KnowledgeSeedingSystem {
    constructor(_sharedMemory?: any, _autoMemory?: any);
    initialize(): Promise<void>;
}
export type KnowledgeSourceClass = 'user_provided' | 'engineer_added' | 'system_generated';
export type KnowledgeSeedTemplate = any;
export type EnhancedMemoryRecord = any;
export declare const ENGINEER_TEMPLATES: Record<string, KnowledgeSeedTemplate>;
