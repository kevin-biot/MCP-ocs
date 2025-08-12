/**
 * MCP Tool: Knowledge Seeding for Engineers
 * Allows engineers to seed knowledge patterns directly into the vector memory system
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
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
export declare class KnowledgeSeedingTool implements Tool {
    private knowledgeSeedingSystem;
    [x: string]: unknown;
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
export declare const USAGE_EXAMPLES: {
    studentNamespacePattern: {
        operation: string;
        templateType: string;
        templateArgs: string[];
    };
    pvcBindingFix: {
        operation: string;
        templateType: string;
        templateArgs: string[];
    };
    normalCIActivity: {
        operation: string;
        templateType: string;
        templateArgs: string[];
    };
    kubernetesbestPractice: {
        operation: string;
        templateType: string;
        templateArgs: string[];
    };
    customPattern: {
        operation: string;
        title: string;
        content: string;
        sourceClass: string;
        tags: string[];
        author: string;
        reliabilityScore: number;
        cluster: string;
    };
    searchStorageIssues: {
        operation: string;
        searchQuery: string;
        searchSourceClasses: string[];
        reliabilityThreshold: number;
        searchLimit: number;
    };
};
