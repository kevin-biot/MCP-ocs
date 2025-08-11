/**
 * Vector Memory Manager - Enhanced for Tool Intelligence and Learning
 *
 * Automatically manages tool memories with semantic tagging and vector embeddings
 * for context-aware diagnostics in operational environments.
 */
import { ToolCall, ToolResult } from '../tools/tool-types.js';
export interface MemoryRecord {
    id: string;
    toolCall: ToolCall;
    result: ToolResult;
    timestamp: number;
    tags: string[];
    context: any;
    diagnosis?: any;
    confidence?: number;
    validation?: {
        status: 'verified' | 'pending' | 'failed';
        accuracy: number;
        source: string;
    };
}
export declare class VectorMemoryManager {
    private vectorStore;
    private memoryCache;
    constructor();
    /**
     * Automatically store tool execution as memory with proper tagging
     */
    storeToolMemory(toolCall: ToolCall, result: ToolResult, context?: any): Promise<string>;
    /**
     * Generate automatic tags for tool memories
     */
    private generateAutomaticTags;
    /**
     * Generate structured diagnosis from tool result
     */
    private generateDiagnosis;
    /**
     * Extract key evidence from tool execution
     */
    private extractKeyEvidence;
    /**
     * Generate operational context for learning
     */
    private extractOperationalContext;
    /**
     * Query relevant memories for context-aware tool decisions
     */
    queryRelevantMemories(query: string, filterTags?: string[], limit?: number): Promise<MemoryRecord[]>;
    /**
     * Get specific memory by ID
     */
    getMemory(memoryId: string): Promise<MemoryRecord | null>;
    private isStorageIssue;
    private isBuildPipelineIssue;
    private isKubernetesLifecycleIssue;
    private generateSummary;
    private analyzeRootCauses;
    private calculateConfidence;
    private determineSeverity;
    private getResourceType;
    private getNamespaceStatus;
    private generateVectorEmbedding;
    private identifyKubernetesPatterns;
    private generateOperationalInsights;
    private findHistoricalMatches;
    private determineRealWorldImpact;
    cleanupOldMemories(daysOld?: number): Promise<number>;
}
