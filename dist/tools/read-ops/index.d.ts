/**
 * Read Operations Tools - Safe data retrieval operations
 *
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
 */
import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
export declare class ReadOpsTools {
    private openshiftClient;
    private memoryManager;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager);
    getTools(): ToolDefinition[];
    executeTool(toolName: string, args: any): Promise<any>;
    private getPods;
    private describeResource;
    private getLogs;
    private searchMemory;
}
