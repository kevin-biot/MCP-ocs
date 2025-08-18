/**
 * Infrastructure Tools - Zone/Capacity/Distribution Insights (Scaffold)
 *
 * Read-only helpers and a lightweight analyzer to support infrastructure
 * diagnostics and templates (zone conflicts, scheduling failures).
 *
 * Note: These are safe scaffolds returning structured JSON suitable for
 * deterministic testing. They do not perform cluster-wide sweeps by default.
 */
import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
export declare class InfrastructureTools implements ToolSuite {
    private openshiftClient;
    private memoryManager;
    category: string;
    version: string;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager);
    getTools(): StandardTool[];
    private mkStandard;
}
