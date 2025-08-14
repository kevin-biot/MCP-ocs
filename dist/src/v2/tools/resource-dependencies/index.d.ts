/**
 * Resource Dependency Analyzer v2.0
 *
 * Maps OpenShift/Kubernetes resource relationships for complex troubleshooting
 */
import { OcWrapperV2 } from '../../lib/oc-wrapper-v2.js';
export interface DependencyInput {
    resourceType: 'pod' | 'deployment' | 'service' | 'route';
    resourceName: string;
    namespace: string;
    depth?: number;
}
export interface DependencyEdge {
    from: string;
    to: string;
    relationship: string;
    status?: 'healthy' | 'broken' | 'warning';
    details?: string;
}
export interface DependencyGraph {
    resourceType: string;
    resourceName: string;
    namespace: string;
    edges: DependencyEdge[];
    hotspots: string[];
    summary: {
        totalResources: number;
        brokenDependencies: number;
        healthyDependencies: number;
    };
    recommendations: string[];
    human: string;
}
export declare class ResourceDependencyAnalyzer {
    private ocWrapper;
    constructor(ocWrapper: OcWrapperV2);
    analyzeDependencies(input: DependencyInput): Promise<DependencyGraph>;
    private analyzePodDependencies;
    private traceOwnerReferences;
    private traceVolumeDependencies;
    private traceServiceSelection;
    private analyzeDeploymentDependencies;
    private analyzeGraphHealth;
    private generateRecommendations;
    private generateHumanSummary;
}
