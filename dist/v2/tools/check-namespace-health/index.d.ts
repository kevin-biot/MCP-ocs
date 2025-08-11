/**
 * Namespace Health Checker v2.0
 *
 * Comprehensive health analysis based on CLI mapping patterns:
 * - Pod status analysis (running, crashloop, pending)
 * - PVC binding validation
 * - Event correlation and pattern detection
 * - Route/Ingress connectivity testing
 * - Intelligent suspicion generation
 */
import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
export interface NamespaceHealthInput {
    namespace: string;
    includeIngressTest?: boolean;
    maxLogLinesPerPod?: number;
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
export interface NamespaceHealthResult {
    namespace: string;
    status: 'healthy' | 'degraded' | 'failing';
    checks: {
        pods: PodHealthSummary;
        pvcs: PVCHealthSummary;
        routes: RouteHealthSummary;
        events: string[];
    };
    suspicions: string[];
    human: string;
    timestamp: string;
    duration: number;
}
export declare class NamespaceHealthChecker {
    private ocWrapper;
    constructor(ocWrapper: OcWrapperV2);
    /**
     * Perform comprehensive namespace health check
     */
    checkHealth(input: NamespaceHealthInput): Promise<NamespaceHealthResult>;
    /**
     * Analyze pod health using CLI mapping patterns
     */
    private analyzePods;
    /**
     * Analyze PVC health and binding status
     */
    private analyzePVCs;
    /**
     * Analyze routes and optionally test connectivity
     */
    private analyzeRoutes;
    /**
     * Extract critical events for correlation
     */
    private analyzeCriticalEvents;
    /**
     * Generate intelligent suspicions based on patterns
     */
    private generateSuspicions;
    /**
     * Determine overall health status
     */
    private determineOverallStatus;
    /**
     * Generate human-readable summary
     */
    private generateHumanSummary;
    private createFailureResult;
    private isPodStuckCreating;
    private getPVCPendingReason;
    private testRouteConnectivity;
    private analyzeEventPatterns;
}
