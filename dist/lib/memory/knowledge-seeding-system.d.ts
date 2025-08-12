/**
 * Knowledge Seeding System v0.3.1
 * Allows engineers to formally add internet knowledge with proper classification
 * Builds on Auto-Memory System v0.3.0 and Qwen's framework design
 */
import { SharedMemoryManager } from './shared-memory.js';
import { AutoMemorySystem } from './auto-memory-system.js';
export declare enum KnowledgeSourceClass {
    ENGINEER_ADDED = "engineer_added",
    INTERNET_KNOWLEDGE = "internet_knowledge",
    OFFICIAL_DOCUMENTATION = "official_documentation",
    COMMUNITY_BEST_PRACTICES = "community_best_practices",
    INTERNAL_OPERATIONAL = "internal_operational",
    TOOL_EXECUTION = "tool_execution",
    SYSTEM_INSIGHTS = "system_insights"
}
export interface KnowledgeSeedTemplate {
    title: string;
    sourceClass: KnowledgeSourceClass;
    content: string;
    tags: string[];
    metadata: {
        author?: string;
        creationDate?: string;
        reliabilityScore?: number;
        referenceUrls?: string[];
        relatedToolCalls?: string[];
        cluster?: string;
        namespace?: string;
    };
}
export interface EnhancedMemoryRecord {
    id: string;
    sourceClass: KnowledgeSourceClass;
    content: string;
    tags: string[];
    context: any;
    metadata: {
        sourceType: KnowledgeSourceClass;
        author?: string;
        creationDate?: string;
        reliability?: number;
        references?: string[];
        cluster?: string;
        namespace?: string;
    };
    toolCall?: {
        toolName: string;
        arguments: any;
        result: any;
        sessionId: string;
        timestamp: number;
    };
}
export declare const ENGINEER_TEMPLATES: {
    PATTERN_DISCOVERY: (title: string, pattern: string, context: string) => KnowledgeSeedTemplate;
    TROUBLESHOOTING_SEQUENCE: (issue: string, steps: string, outcome: string) => KnowledgeSeedTemplate;
    FALSE_POSITIVE: (scenario: string, explanation: string) => KnowledgeSeedTemplate;
    INTERNET_KNOWLEDGE: (title: string, source: string, content: string, url?: string) => KnowledgeSeedTemplate;
};
export declare class KnowledgeSeedingSystem {
    private memoryManager;
    private autoMemorySystem;
    constructor(memoryManager: SharedMemoryManager, autoMemorySystem: AutoMemorySystem);
    /**
     * Seed knowledge into the vector memory system with proper classification
     */
    seedKnowledge(seed: KnowledgeSeedTemplate): Promise<string>;
    /**
     * Search knowledge with advanced filtering capabilities
     */
    searchKnowledge(query: string, options?: {
        sourceClasses?: KnowledgeSourceClass[];
        tags?: string[];
        limit?: number;
        reliabilityThreshold?: number;
        cluster?: string;
        namespace?: string;
    }): Promise<any[]>;
    /**
     * Quick knowledge seeding using predefined templates
     */
    quickSeed(templateType: keyof typeof ENGINEER_TEMPLATES, ...args: string[]): Promise<string>;
    /**
     * Get knowledge statistics by source class
     */
    getKnowledgeStats(): Promise<Record<KnowledgeSourceClass, number>>;
    /**
     * Link knowledge to tool execution memories
     */
    linkToToolExecution(knowledgeId: string, toolExecutionSessionId: string): Promise<void>;
    /**
     * Suggest relevant knowledge before tool execution
     */
    suggestRelevantKnowledge(toolName: string, args: any): Promise<any[]>;
}
