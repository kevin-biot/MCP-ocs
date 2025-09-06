/**
 * Read Operations Tools - Safe data retrieval operations
 *
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
 */
import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
export declare class ReadOpsTools implements ToolSuite {
    private openshiftClient;
    private memoryManager;
    category: string;
    version: string;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager);
    private memoryGateway;
    getTools(): StandardTool[];
    private getToolDefinitions;
    private convertToStandardTool;
    executeTool(toolName: string, args: unknown): Promise<string>;
    private getPods;
    private describeResource;
    private getLogs;
    private searchMemory;
    /**
     * Enhanced error handling and sanitization methods
     */
    private safeJsonStringify;
    private sanitizeError;
    private sanitizeArgs;
}
