/**
 * Infrastructure Correlation Engine - Phase 2A Implementation
 *
 * Solves the real-world problem: tekton-results-postgres stuck 11+ hours in "Pending"
 * Root Cause: PV required zone eu-west-1a, but MachineSets scaled to 0 in that zone
 *
 * This tool automates infrastructure → storage → operator correlation analysis
 * Following ADR-003 (Memory), ADR-004 (Tool Naming), ADR-006 (Modularity)
 */
import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import { SharedMemoryManager, MemorySearchResult } from '../../../lib/memory/shared-memory';
export interface InfrastructureCorrelationInput {
    namespace?: string;
    sessionId: string;
    focusArea?: 'storage' | 'networking' | 'compute' | 'all';
}
export interface ZoneAvailability {
    zone: string;
    machineSetReplicas: number;
    actualNodes: number;
    status: 'healthy' | 'degraded' | 'unavailable';
    issues: string[];
}
export interface StorageZoneConflict {
    pvName: string;
    pvNamespace: string;
    requiredZone: string;
    zoneAvailable: boolean;
    conflictSeverity: 'critical' | 'warning' | 'info';
    affectedPods: string[];
    recommendedActions: string[];
}
export interface InfrastructureCorrelationResult {
    summary: {
        hasInfrastructureIssues: boolean;
        primaryConcern: string;
        confidenceScore: number;
        analysisTimeMs: number;
    };
    zoneAnalysis: {
        availableZones: ZoneAvailability[];
        zoneConflicts: StorageZoneConflict[];
        infrastructureRecommendations: string[];
    };
    memoryInsights: {
        similarPatterns: MemorySearchResult[];
        historicalResolutions: string[];
        patternConfidence: number;
    };
    humanSummary: string;
    technicalDetails: {
        machineSetStatus: any[];
        persistentVolumeAnalysis: any[];
        nodeDistribution: any[];
    };
}
export declare class InfrastructureCorrelationChecker {
    private ocWrapper;
    private memoryManager;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager);
    /**
     * Main entry point for infrastructure correlation analysis
     * Detects zone/storage conflicts like the tekton-results-postgres scenario
     */
    checkInfrastructureCorrelation(input: InfrastructureCorrelationInput): Promise<InfrastructureCorrelationResult>;
    /**
     * Search memory for similar infrastructure patterns
     * Following ADR-003 memory integration patterns
     */
    private searchInfrastructureMemory;
    /**
     * Gather comprehensive infrastructure data for analysis
     */
    private gatherInfrastructureData;
    /**
     * Analyze zone availability based on MachineSet and Node data
     * Detects the core issue: zones scaled to 0 replicas
     */
    private analyzeZoneAvailability;
    /**
     * Detect storage-zone conflicts like the tekton-results-postgres scenario
     * This is the core functionality that solves the 11+ hour diagnostic delay
     */
    private detectStorageZoneConflicts;
    /**
     * Generate intelligent recommendations based on analysis and memory insights
     */
    private generateRecommendations;
    /**
     * Generate human-readable summary of infrastructure correlation analysis
     */
    private generateHumanSummary;
    private getMachineSetStatus;
    private getNodeDistribution;
    private getPersistentVolumeAnalysis;
    private extractZoneFromMachineSet;
    private extractZoneFromNode;
    private extractRequiredZoneFromPV;
    private findPodsUsingPV;
    private analyzeNodeDistribution;
    private identifyPrimaryConcern;
    private calculateConfidenceScore;
    private calculatePatternConfidence;
    private extractHistoricalResolutions;
    private deduplicateMemoryResults;
    /**
     * Store infrastructure correlation analysis for future learning
     * Following ADR-003 memory patterns
     */
    private storeInfrastructureMemory;
}
