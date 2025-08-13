/**
 * Enhanced Namespace Health Checker v2.1 with Infrastructure Correlation
 *
 * Now includes infrastructure correlation to detect zone/storage conflicts
 * that cause pods to remain pending for hours (like tekton-results-postgres)
 */
import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import { SharedMemoryManager } from '../../../lib/memory/shared-memory';
import { InfrastructureCorrelationChecker, InfrastructureCorrelationResult } from '../infrastructure-correlation';
export interface EnhancedNamespaceHealthInput {
    namespace: string;
    includeIngressTest?: boolean;
    includeInfrastructureCorrelation?: boolean;
    maxLogLinesPerPod?: number;
    sessionId: string;
}
export interface PodHealthSummary {
    ready: number;
    total: number;
    crashloops: string[];
    pending: string[];
    imagePullErrors: string[];
    oomKilled: string[];
}
export interface PVCHealthSummary {
    bound: number;
    pending: number;
    failed: number;
    total: number;
    errors: string[];
}
export interface RouteHealthSummary {
    total: number;
    reachable?: boolean;
    probe?: {
        url: string;
        code: number;
        message: string;
    };
}
export interface ScaleDownAnalysis {
    isScaleDown: boolean;
    evidence: string[];
    deploymentStatus: {
        total: number;
        scaledToZero: number;
        recentlyScaled: string[];
    };
    scaleDownEvents: string[];
    verdict: 'intentional_scale_down' | 'node_failure' | 'resource_pressure' | 'application_failure' | 'unknown';
}
export interface EnhancedNamespaceHealthResult {
    namespace: string;
    status: 'healthy' | 'degraded' | 'failing';
    checks: {
        pods: PodHealthSummary;
        pvcs: PVCHealthSummary;
        routes: RouteHealthSummary;
        events: string[];
    };
    suspicions: string[];
    infrastructureCorrelation?: {
        enabled: boolean;
        analysis?: InfrastructureCorrelationResult;
        enhancedSuspicions: string[];
        rootCauseCandidate?: string;
    };
    human: string;
    timestamp: string;
    duration: number;
}
export declare class EnhancedNamespaceHealthChecker {
    private ocWrapper;
    private memoryManager;
    private infrastructureChecker?;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager, infrastructureChecker?: InfrastructureCorrelationChecker | undefined);
    /**
     * Enhanced health check with optional infrastructure correlation
     */
    checkHealth(input: EnhancedNamespaceHealthInput): Promise<EnhancedNamespaceHealthResult>;
    /**
     * Determine if infrastructure correlation should be run
     * Run when we have pending pods or PVC issues that might be infrastructure-related
     */
    private shouldRunInfrastructureCorrelation;
    /**
     * Enhance suspicions with infrastructure correlation insights
     * This is where we add the intelligence from zone/storage analysis
     */
    private enhanceSuspicionsWithInfrastructure;
    /**
     * Identify the most likely root cause from infrastructure analysis
     */
    private identifyRootCauseCandidate;
    /**
     * Generate enhanced human summary with infrastructure insights
     */
    private generateEnhancedHumanSummary;
    private analyzePods;
    private analyzePVCs;
    private analyzeRoutes;
    private analyzeCriticalEvents;
    private analyzeScaleDownPatterns;
    private generateSuspicions;
    private determineOverallStatus;
    private createFailureResult;
    private isPodStuckCreating;
    private getPVCPendingReason;
    private testRouteConnectivity;
}
