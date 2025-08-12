/**
 * Auto-Memory Integration System
 * Automatically captures and tags tool executions for future pattern recognition
 */
import { SharedMemoryManager } from '../memory/shared-memory.js';
export interface ToolExecutionContext {
    toolName: string;
    arguments: any;
    result: any;
    sessionId: string;
    timestamp: number;
    duration: number;
    success: boolean;
    error?: string;
}
export interface AutoMemoryTags {
    toolCategory: string;
    operationType: string;
    resourceType?: string;
    namespace?: string;
    severity?: string;
    issuePattern?: string;
    environmentContext?: string;
    redZoneRelevant: boolean;
    engineerGuidance?: string;
}
export declare class AutoMemorySystem {
    private memoryManager;
    constructor(memoryManager: SharedMemoryManager);
    /**
     * Automatically capture and tag tool execution for future retrieval
     */
    captureToolExecution(context: ToolExecutionContext): Promise<void>;
    /**
     * Check for relevant past experiences before tool execution
     */
    retrieveRelevantContext(toolName: string, args: any): Promise<any[]>;
    /**
     * Generate smart tags based on tool execution patterns
     */
    private generateSmartTags;
    /**
     * Store execution as operational memory for incident correlation
     */
    private storeAsOperationalMemory;
    /**
     * Store execution as conversation memory for workflow tracking
     */
    private storeAsConversationMemory;
    /**
     * Build contextual search queries based on tool and arguments
     */
    private buildContextualQueries;
    /**
     * Extract symptoms from tool execution
     */
    private extractSymptoms;
    /**
     * Extract affected resources from tool execution
     */
    private extractAffectedResources;
    /**
     * Extract domain from tool name
     */
    private extractDomain;
    /**
     * Rank memories by relevance to current context
     */
    private rankRelevantMemories;
}
