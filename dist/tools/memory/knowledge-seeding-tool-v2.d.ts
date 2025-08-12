/**
 * Knowledge Seeding Tool Suite - Unified Registration
 *
 * Wraps the KnowledgeSeedingTool in the new StandardTool interface
 * for consistent registration with the UnifiedToolRegistry
 */
import { StandardTool, ToolSuite } from '../../lib/tools/tool-registry.js';
import { KnowledgeSeedingSystem, KnowledgeSourceClass } from '../../lib/memory/knowledge-seeding-system.js';
export interface KnowledgeSeedingToolArguments {
    templateType?: 'PATTERN_DISCOVERY' | 'TROUBLESHOOTING_SEQUENCE' | 'FALSE_POSITIVE' | 'INTERNET_KNOWLEDGE';
    templateArgs?: string[];
    title?: string;
    content?: string;
    sourceClass?: KnowledgeSourceClass;
    tags?: string[];
    author?: string;
    reliabilityScore?: number;
    referenceUrls?: string[];
    cluster?: string;
    namespace?: string;
    searchQuery?: string;
    searchSourceClasses?: KnowledgeSourceClass[];
    searchTags?: string[];
    searchLimit?: number;
    reliabilityThreshold?: number;
    operation: 'seed' | 'search' | 'stats' | 'quick_seed';
}
export declare class KnowledgeSeedingTool {
    private knowledgeSeedingSystem;
    name: string;
    fullName: string;
    description: string;
    inputSchema: any;
    constructor(knowledgeSeedingSystem: KnowledgeSeedingSystem);
    execute(args: KnowledgeSeedingToolArguments): Promise<string>;
    private handleQuickSeed;
    private handleCustomSeed;
    private handleSearch;
    private handleStats;
}
/**
 * Knowledge Tools Suite - Unified Registration
 *
 * Implements ToolSuite interface for integration with UnifiedToolRegistry
 */
export declare class KnowledgeToolsSuite implements ToolSuite {
    private knowledgeSeedingTool;
    category: string;
    version: string;
    metadata: {
        description: string;
        maintainer: string;
    };
    constructor(knowledgeSeedingTool: KnowledgeSeedingTool);
    getTools(): StandardTool[];
}
