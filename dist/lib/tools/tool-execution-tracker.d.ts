/**
 * Tool Execution Tracker - Records and manages tool call executions with automatic memory storage
 *
 * This system automatically captures tool execution data, stores it in vector memory,
 * and provides context-aware diagnostics for operational decision making.
 */
import { VectorMemoryManager } from '../memory/vector-memory-manager.js';
import { ToolCall, ToolResult } from './tool-types.js';
export declare class ToolExecutionTracker {
    private memoryManager;
    private executionHistory;
    constructor(memoryManager: VectorMemoryManager);
    /**
     * Execute a tool call with automatic memory tracking and storage
     */
    executeWithMemory(toolCall: ToolCall, executionFunction: () => Promise<ToolResult>, context?: any): Promise<ToolResult>;
    /**
     * Get recent tool executions for monitoring
     */
    getRecentExecutions(limit?: number): ToolExecutionRecord[];
    /**
     * Get tool execution by ID
     */
    getExecution(executionId: string): ToolExecutionRecord | null;
    /**
     * Get memory for a specific tool execution
     */
    getExecutionMemory(executionId: string): Promise<any | null>;
    /**
     * Query relevant memories for context-aware tool decisions
     */
    queryRelevantMemories(query: string, tags?: string[], limit?: number): Promise<any[]>;
    /**
     * Clean up old execution records and memory
     */
    cleanupOldExecutions(daysOld?: number): Promise<number>;
}
export interface ToolExecutionRecord {
    id: string;
    toolCall: ToolCall;
    timestamp: number;
    sessionId: string;
    context: any;
    status: 'executing' | 'completed' | 'failed';
    result?: ToolResult;
    duration?: number;
    memoryId?: string;
}
