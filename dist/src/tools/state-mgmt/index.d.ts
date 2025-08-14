/**
 * State Management Tools - Memory and workflow state operations
 *
 * Following ADR-004 namespace conventions: oc_state_*
 * Tools for managing workflow state and operational memory
 */
import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
import { WorkflowEngine } from '../../lib/workflow/workflow-engine.js';
export declare class StateMgmtTools implements ToolSuite {
    private memoryManager;
    private workflowEngine;
    category: string;
    version: string;
    constructor(memoryManager: SharedMemoryManager, workflowEngine: WorkflowEngine);
    getTools(): StandardTool[];
    private getToolDefinitions;
    private convertToStandardTool;
    private storeIncident;
    private searchOperational;
    private getWorkflowState;
    private getMemoryStats;
    private searchConversations;
    executeTool(toolName: string, args: any): Promise<string>;
}
