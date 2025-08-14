/**
 * Storage Intelligence Data Models - ADR-012 Implementation
 *
 * Week 1 Task 1.1 & 1.3 - Complete type definitions for storage intelligence
 * Comprehensive operational intelligence data structures
 */
export interface StorageIntelligenceData {
    incidentId: string;
    timestamp: number;
    namespace: string;
    analysisType: 'pvc_binding_rca' | 'namespace_storage_analysis' | 'cross_node_distribution';
    rootCause?: PVCBindingFailure;
    resolutionSteps?: ResolutionStep[];
    learningPatterns?: LearningPattern[];
}
export interface PVCBindingFailure {
    category: 'waitForFirstConsumer' | 'storageClass' | 'capacity' | 'nodeAffinity' | 'permissions';
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
    evidence: Evidence[];
    affectedResources: string[];
}
export interface Evidence {
    type: 'pvcStatus' | 'events' | 'storageClass' | 'nodes' | 'pods' | 'provisioner' | 'persistent_volumes' | 'resource_quotas';
    data: any;
    reasoning: string;
    weight: number;
}
export interface ResolutionStep {
    action: string;
    command: string;
    risk: 'safe' | 'medium' | 'high';
    expected_outcome: string;
    rollback?: string;
}
export interface LearningPattern {
    pattern: string;
    frequency: number;
    success_rate: number;
    prevention_measures: string[];
}
export interface NamespaceStorageIntelligence {
    incidentId: string;
    timestamp: number;
    analysisScope: 'single_namespace' | 'cluster_wide' | 'filtered_set';
    namespaceAnalytics: NamespaceStorageAnalytics[];
    clusterSummary: ClusterStorageSummary;
    recommendations: StorageRecommendation[];
    trends: StorageTrend[];
}
export interface NamespaceStorageAnalytics {
    namespace: string;
    storageMetrics: StorageMetrics;
    utilizationAnalysis: UtilizationAnalysis;
    costProjection: CostProjection;
    healthStatus: StorageHealthStatus;
    optimization: OptimizationOpportunity[];
    riskFactors: RiskFactor[];
}
export interface StorageMetrics {
    totalRequested: string;
    totalAllocated: string;
    totalConsumed: string;
    utilizationPercentage: number;
    pvcCount: {
        total: number;
        bound: number;
        pending: number;
        failed: number;
    };
    storageClasses: StorageClassUsage[];
}
export interface StorageClassUsage {
    className: string;
    pvcCount: number;
    totalCapacity: string;
    costTier: 'premium' | 'standard' | 'economy' | 'unknown';
}
export interface UtilizationAnalysis {
    efficiency: 'excellent' | 'good' | 'poor' | 'wasteful';
    efficiencyScore: number;
    wasteIndicators: WasteIndicator[];
    rightsizingPotential: string;
}
export interface WasteIndicator {
    type: 'oversized_pvc' | 'unused_pvc' | 'expensive_storage_class' | 'zombie_namespace';
    severity: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
    recommendation: string;
}
export interface CostProjection {
    monthlyCost: number;
    annualCost: number;
    costPerGB: number;
    optimizedMonthlyCost: number;
    potentialSavings: number;
}
export interface StorageHealthStatus {
    overall: 'healthy' | 'warning' | 'critical';
    issues: StorageIssue[];
    pendingPvcAnalysis: PendingPvcSummary;
}
export interface StorageIssue {
    type: 'capacity_pressure' | 'binding_failures' | 'inefficient_allocation' | 'cost_anomaly';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    remediation: string;
}
export interface PendingPvcSummary {
    count: number;
    oldestAge: number;
    reasons: {
        [reason: string]: number;
    };
}
export interface ClusterStorageSummary {
    totalNamespaces: number;
    totalStorageRequested: string;
    totalStorageAllocated: string;
    clusterUtilization: number;
    topConsumers: NamespaceConsumer[];
    inefficientNamespaces: NamespaceConsumer[];
    recommendations: ClusterRecommendation[];
}
export interface NamespaceConsumer {
    namespace: string;
    storageUsed: string;
    percentage: number;
    efficiency: number;
}
export interface StorageRecommendation {
    type: 'rightsize' | 'cleanup' | 'optimize_storage_class' | 'consolidate';
    priority: 'immediate' | 'high' | 'medium' | 'low';
    namespace: string;
    action: string;
    expectedSavings: string;
    riskLevel: 'safe' | 'medium' | 'high';
    implementation: string;
}
export interface ClusterRecommendation {
    type: 'policy_enforcement' | 'capacity_planning' | 'cost_optimization';
    description: string;
    impact: string;
    implementation: string[];
}
export interface StorageTrend {
    namespace: string;
    trendDirection: 'growing' | 'stable' | 'shrinking';
    growthRate: number;
    projectedCapacityDate: string;
    confidenceLevel: number;
}
export interface RiskFactor {
    type: 'capacity_risk' | 'cost_risk' | 'performance_risk' | 'compliance_risk';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    mitigation: string;
}
export interface OptimizationOpportunity {
    type: 'resize_pvc' | 'change_storage_class' | 'consolidate_pvcs' | 'cleanup_unused';
    potentialSavings: string;
    effort: 'low' | 'medium' | 'high';
    description: string;
    implementation: string;
}
export interface OperationalImpact {
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedServices: string;
    dataAvailability: 'at_risk' | 'stable';
    userImpact: 'high' | 'medium' | 'low';
    businessContinuity: 'at_risk' | 'stable';
}
export interface Week1SuccessMetrics {
    task13: {
        timeReduction: string;
        accuracyRate: string;
        targetScenario: string;
        acceptanceCriteria: string[];
    };
    task11: {
        timeReduction: string;
        coverageImprovement: string;
        optimizationValue: string;
        acceptanceCriteria: string[];
    };
}
export declare const WEEK1_METRICS: Week1SuccessMetrics;
