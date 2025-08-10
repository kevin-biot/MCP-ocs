/**
 * Write Operations Tools - Workflow-controlled cluster modifications
 *
 * Following ADR-004 namespace conventions: oc_write_*
 * Dangerous operations that require workflow approval (ADR-005)
 */
import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
import { WorkflowEngine } from '../../lib/workflow/workflow-engine.js';
export declare class WriteOpsTools {
    private openshiftClient;
    private memoryManager;
    private workflowEngine;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager, workflowEngine: WorkflowEngine);
    getTools(): ToolDefinition[];
    executeTool(toolName: string, args: any): Promise<any>;
    private applyConfig;
    private scaleDeployment;
    private restartDeployment;
}
