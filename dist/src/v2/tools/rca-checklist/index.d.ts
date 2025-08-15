/**
 * RCA Checklist Tool v2.0
 *
 * Guided "First 10 Minutes" diagnostic workflow for consistent incident response.
 * Eliminates junior engineer panic and provides structured troubleshooting approach.
 *
 * Based on real operational patterns:
 * 1. Quick cluster health overview
 * 2. Namespace-specific pod/event analysis
 * 3. Resource constraint and quota checks
 * 4. Network and connectivity validation
 * 5. Storage and PVC analysis
 * 6. Generate structured findings and next steps
 */
import { OcWrapperV2 } from '../../lib/oc-wrapper-v2.js';
import { ToolMemoryGateway } from '../../../lib/tools/tool-memory-gateway.js';
export interface RCAChecklistInput {
    namespace?: string;
    outputFormat?: 'json' | 'markdown';
    includeDeepAnalysis?: boolean;
    maxCheckTime?: number;
}
export interface ChecklistItem {
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'skipped';
    findings: string[];
    recommendations: string[];
    duration: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface RCAChecklistResult {
    reportId: string;
    namespace?: string;
    timestamp: string;
    duration: number;
    overallStatus: 'healthy' | 'degraded' | 'failing';
    checksPerformed: ChecklistItem[];
    summary: {
        totalChecks: number;
        passed: number;
        failed: number;
        warnings: number;
    };
    criticalIssues: string[];
    nextActions: string[];
    evidence: {
        symptoms: string[];
        affectedResources: string[];
        diagnosticSteps: string[];
    };
    human: string;
    markdown?: string;
    rootCause?: {
        type: string;
        summary: string;
        confidence: number;
        evidence: string[];
    };
}
export declare class RCAChecklistEngine {
    private ocWrapper;
    private namespaceHealthChecker;
    private memoryGateway;
    constructor(ocWrapper: OcWrapperV2, memoryGateway?: ToolMemoryGateway);
    /**
     * Execute the complete RCA checklist
     */
    executeRCAChecklist(input: RCAChecklistInput): Promise<RCAChecklistResult>;
    /**
     * Execute the systematic diagnostic checklist
     */
    private runChecklist;
    /**
     * Check 1: Cluster-level health overview
     */
    private checkClusterHealth;
    /**
     * Check 2: Node capacity and health
     */
    private checkNodeHealth;
    /**
     * Check 3: Namespace-specific analysis
     */
    private checkNamespaceSpecific;
    /**
     * Check 4: Storage health analysis
     */
    private checkStorageHealth;
    /**
     * Check 5: Network connectivity and service health
     */
    private checkNetworkHealth;
    /**
     * Check 6: Recent events analysis
     */
    private checkRecentEvents;
    /**
     * Check critical system namespaces
     */
    private checkCriticalNamespaces;
    /**
     * Check 7: Resource constraints and quotas (deep analysis)
     */
    private checkResourceConstraints;
    private analyzeNodeHealth;
    private analyzePVCHealth;
    private analyzeNetworkHealth;
    private analyzeRecentEvents;
    private analyzeResourceConstraints;
    private parseResourceValue;
    private extractEventPatterns;
    private analyzeChecklistResults;
    /**
     * Derive an intelligent root cause classification from checklist findings
     */
    private deriveRootCause;
    private generateNextActions;
    private generateHumanSummary;
    private generateMarkdownReport;
    private timeoutPromise;
}
