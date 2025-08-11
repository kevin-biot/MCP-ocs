/**
 * State Management Tools - Memory and workflow state operations
 *
 * Following ADR-004 namespace conventions: oc_state_*
 * Tools for managing workflow state and operational memory
 */
import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
import { WorkflowEngine } from '../../lib/workflow/workflow-engine.js';
export declare class StateMgmtTools {
    private memoryManager;
    private workflowEngine;
    constructor(memoryManager: SharedMemoryManager, workflowEngine: WorkflowEngine);
    getTools(): ToolDefinition[];
    private storeIncident;
    private searchOperational;
    private getWorkflowState;
    private getMemoryStats;
    private searchConversations;
    executeTool(toolName: string, args: any): Promise<string>;
}
