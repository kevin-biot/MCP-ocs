/**
 * Diagnostic Tools - OpenShift Health and Status Checks
 *
 * Following ADR-004 namespace conventions: oc_diagnostic_*
 * Safe read-only operations for cluster health assessment
 */
import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
export declare class DiagnosticTools {
    private openshiftClient;
    private memoryManager;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager);
    getTools(): ToolDefinition[];
    /**
     * Execute diagnostic tool (placeholder implementation)
     * In real implementation, this would call the actual OpenShift client methods
     */
    executeTool(toolName: string, args: any): Promise<any>;
    private checkClusterHealth;
    private checkPodHealth;
    private analyzeResourceUsage;
    private analyzeEvents;
    private identifyEventPatterns;
}
