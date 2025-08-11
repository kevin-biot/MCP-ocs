/**
 * Tool Execution Tracker - Records and manages tool call executions with automatic memory storage
 * 
 * This system automatically captures tool execution data, stores it in vector memory,
 * and provides context-aware diagnostics for operational decision making.
 */

import { VectorMemoryManager } from '../memory/vector-memory-manager.js';
import { ToolCall, ToolResult } from './tool-types.js';

export class ToolExecutionTracker {
  private memoryManager: VectorMemoryManager;
  private executionHistory: Map<string, ToolExecutionRecord>;
  
  constructor(memoryManager: VectorMemoryManager) {
    this.memoryManager = memoryManager;
    this.executionHistory = new Map();
  }

  /**
   * Execute a tool call with automatic memory tracking and storage
   */
  async executeWithMemory(
    toolCall: ToolCall,
    executionFunction: () => Promise<ToolResult>,
    context?: any
  ): Promise<ToolResult> {
    const startTime = Date.now();
    
    // Create execution record
    const executionId = `exec_${toolCall.toolName}_${Date.now()}`;
    const executionRecord: ToolExecutionRecord = {
      id: executionId,
      toolCall,
      timestamp: startTime,
      sessionId: toolCall.sessionId,
      context: context || {},
      status: 'executing'
    };

    try {
      // Execute the tool function
      const result = await executionFunction();
      
      // Update execution record with success
      executionRecord.result = result;
      executionRecord.status = 'completed';
      executionRecord.duration = Date.now() - startTime;
      
      // Store in vector memory automatically
      const memoryId = await this.memoryManager.storeToolMemory(
        toolCall,
        result,
        context || {}
      );
      
      // Update execution record with memory reference
      executionRecord.memoryId = memoryId;
      
      // Store in history for quick access
      this.executionHistory.set(executionId, executionRecord);
      
      return result;
      
    } catch (error) {
      // Handle errors and store error memory
      const errorResult: ToolResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
      
      // Store error memory
      const memoryId = await this.memoryManager.storeToolMemory(
        toolCall,
        errorResult,
        context || {}
      );
      
      // Update execution record with error
      executionRecord.result = errorResult;
      executionRecord.status = 'failed';
      executionRecord.duration = Date.now() - startTime;
      executionRecord.memoryId = memoryId;
      
      // Store in history
      this.executionHistory.set(executionId, executionRecord);
      
      throw error;
    }
  }

  /**
   * Get recent tool executions for monitoring
   */
  getRecentExecutions(limit: number = 10): ToolExecutionRecord[] {
    const executions = Array.from(this.executionHistory.values());
    return executions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get tool execution by ID
   */
  getExecution(executionId: string): ToolExecutionRecord | null {
    return this.executionHistory.get(executionId) || null;
  }

  /**
   * Get memory for a specific tool execution
   */
  async getExecutionMemory(executionId: string): Promise<any | null> {
    const execution = this.getExecution(executionId);
    if (!execution || !execution.memoryId) {
      return null;
    }

    return await this.memoryManager.getMemory(execution.memoryId);
  }

  /**
   * Query relevant memories for context-aware tool decisions
   */
  async queryRelevantMemories(
    query: string,
    tags?: string[],
    limit: number = 5
  ): Promise<any[]> {
    return await this.memoryManager.queryRelevantMemories(query, tags, limit);
  }

  /**
   * Clean up old execution records and memory
   */
  async cleanupOldExecutions(daysOld: number = 7): Promise<number> {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    // Clean up execution history
    for (const [id, record] of this.executionHistory.entries()) {
      if (record.timestamp < cutoffDate) {
        this.executionHistory.delete(id);
        deletedCount++;
      }
    }
    
    // Clean up vector memory
    const memoryDeleted = await this.memoryManager.cleanupOldMemories(daysOld);
    deletedCount += memoryDeleted;
    
    return deletedCount;
  }
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