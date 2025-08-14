/**
 * Enhanced Infrastructure Memory Integration
 *
 * Leverages the fixed ChromaDB implementation for intelligent infrastructure analysis
 * Replaces the broken stub methods with real pattern recognition capabilities
 *
 * Key Improvements:
 * - Infrastructure-specific embeddings for better similarity matching
 * - Enhanced memory search with infrastructure context
 * - Cross-incident pattern recognition
 * - Historical infrastructure trend analysis
 */
import { SharedMemoryManager, MemorySearchResult } from '../../../lib/memory/shared-memory';
import type { ZoneAvailability, StorageZoneConflict } from './index';
export interface InfrastructureContext {
    zones: string[];
    namespaces: string[];
    resourceTypes: string[];
    problemDomain: 'storage' | 'networking' | 'compute' | 'scheduling';
    severity: 'critical' | 'warning' | 'info';
}
export interface InfrastructureMemoryPattern {
    pattern: string;
    frequency: number;
    successRate: number;
    avgResolutionTime: number;
    associatedZones: string[];
    resourceTypes: string[];
}
export interface InfrastructureMemoryResult extends MemorySearchResult {
    infrastructureRelevance: number;
    patternType: 'zone-conflict' | 'resource-constraint' | 'network-issue' | 'scaling-problem';
    appliedResolution?: string;
    resolutionEffectiveness?: number;
}
export declare class EnhancedInfrastructureMemory {
    private memoryManager;
    constructor(memoryManager: SharedMemoryManager);
    /**
     * Search for infrastructure patterns with enhanced context matching
     * Replaces the broken memory search with actual ChromaDB vector similarity
     */
    searchInfrastructurePatterns(query: string, context: InfrastructureContext, limit?: number): Promise<InfrastructureMemoryResult[]>;
    /**
     * Store infrastructure incident with enhanced metadata for future pattern recognition
     */
    storeInfrastructureIncident(sessionId: string, incident: {
        description: string;
        symptoms: string[];
        rootCause?: string;
        resolution?: string;
        context: InfrastructureContext;
        zoneAnalysis?: ZoneAvailability[];
        storageConflicts?: StorageZoneConflict[];
    }): Promise<string>;
    /**
     * Analyze historical infrastructure patterns to predict potential issues
     */
    predictInfrastructureRisks(context: InfrastructureContext, historicalDays?: number): Promise<{
        riskScore: number;
        predictedIssues: string[];
        basedOnPatterns: InfrastructureMemoryPattern[];
        recommendation: string;
    }>;
    /**
     * Get infrastructure trends and insights from historical data
     */
    getInfrastructureTrends(context: InfrastructureContext, timeframeHours?: number): Promise<{
        commonIssues: InfrastructureMemoryPattern[];
        resolutionEffectiveness: {
            [key: string]: number;
        };
        zoneReliability: {
            [zone: string]: number;
        };
        recommendations: string[];
    }>;
    /**
     * Private helper methods
     */
    private buildInfrastructureQuery;
    private enhanceWithInfrastructureContext;
    private calculateInfrastructureRelevance;
    private identifyPatternType;
    private extractContent;
    private extractResolution;
    private calculateResolutionEffectiveness;
    private analyzeRiskPatterns;
    private analyzeTrends;
}
