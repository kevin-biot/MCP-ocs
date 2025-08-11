/**
 * Enhanced Diagnostic Tools v2 - OpenShift Health and Status Checks
 *
 * Replaces v1 diagnostic tools with enhanced implementations:
 * - Better error handling and caching
 * - Intelligent pattern detection
 * - Comprehensive health analysis
 * - Real-world operational patterns
 */
import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
export declare class DiagnosticToolsV2 {
    private openshiftClient;
    private memoryManager;
    private ocWrapperV2;
    private namespaceHealthChecker;
    private rcaChecklistEngine;
    constructor(openshiftClient: OpenShiftClient, memoryManager: SharedMemoryManager);
    getTools(): ToolDefinition[];
    executeTool(toolName: string, args: any): Promise<string>;
    /**
     * Enhanced cluster health check with v2 capabilities
     */
    private enhancedClusterHealth;
    /**
     * Enhanced namespace health using v2 implementation
     */
    private enhancedNamespaceHealth;
    /**
     * Enhanced pod health with dependency analysis
     */
    private enhancedPodHealth;
    private analyzeNodeHealth;
    private analyzeOperatorHealth;
    private analyzeSystemNamespaces;
    private analyzeUserNamespaces;
    private calculateOverallHealth;
    private generateClusterRecommendations;
    private generateNamespaceNextActions;
    private performDeepNamespaceAnalysis;
    private checkResourceQuotas;
    private checkNetworkPolicies;
    private checkSecrets;
    private analyzePodDetails;
    private analyzePodDependencies;
    private findServicesForPod;
    private findConfigMapsForPod;
    private findSecretsForPod;
    private analyzePodResources;
    private generatePodRecommendations;
    private generatePodHealthSummary;
    private formatClusterHealthResponse;
    /**
     * Execute RCA checklist workflow
     */
    private executeRCAChecklist;
    private formatErrorResponse;
}
