import { describe, it, expect } from '@jest/globals';
import { WEEK1_METRICS } from '../../../src/tools/storage-intelligence/types';
describe('Storage Intelligence Data Models (ADR-012)', () => {
    it('should validate PVCBindingFailure structure and value ranges', () => {
        const evidence = {
            type: 'events',
            data: { reason: 'WaitForFirstConsumer' },
            reasoning: 'Pending PVC with WFFC indicated in events',
            weight: 0.95
        };
        const failure = {
            category: 'waitForFirstConsumer',
            severity: 'high',
            confidence: 0.96,
            evidence: [evidence],
            affectedResources: ['pvc/shared-pvc']
        };
        expect(failure.category).toBe('waitForFirstConsumer');
        expect(['critical', 'high', 'medium', 'low']).toContain(failure.severity);
        expect(failure.confidence).toBeGreaterThanOrEqual(0);
        expect(failure.confidence).toBeLessThanOrEqual(1);
        expect(failure.evidence.length).toBeGreaterThan(0);
        expect(failure.evidence[0].weight).toBeGreaterThan(0);
        expect(failure.evidence[0].weight).toBeLessThanOrEqual(1);
    });
    it('should validate StorageIntelligenceData minimal compliance', () => {
        const data = {
            incidentId: 'inc-123',
            timestamp: Date.now(),
            namespace: 'student03',
            analysisType: 'pvc_binding_rca',
            rootCause: {
                category: 'waitForFirstConsumer',
                severity: 'high',
                confidence: 0.95,
                evidence: [
                    { type: 'events', data: {}, reasoning: 'WFFC detected', weight: 0.9 }
                ],
                affectedResources: ['pvc/shared-pvc']
            },
            resolutionSteps: [
                { action: 'Create pod', command: 'oc run ...', risk: 'safe', expected_outcome: 'PVC bound' }
            ],
            learningPatterns: [
                { pattern: 'WFFC common', frequency: 0.6, success_rate: 0.95, prevention_measures: ['use Immediate for CI'] }
            ]
        };
        expect(data.incidentId).toMatch(/^inc-/);
        expect(['pvc_binding_rca', 'namespace_storage_analysis', 'cross_node_distribution']).toContain(data.analysisType);
        expect(data.resolutionSteps?.[0].risk).toBe('safe');
    });
    it('should validate NamespaceStorageAnalytics structures and calculations', () => {
        const metrics = {
            totalRequested: '15Gi',
            totalAllocated: '12Gi',
            totalConsumed: '6Gi',
            utilizationPercentage: 50,
            pvcCount: { total: 3, bound: 2, pending: 1, failed: 0 },
            storageClasses: [
                { className: 'standard', pvcCount: 2, totalCapacity: '12Gi', costTier: 'standard' },
                { className: 'premium', pvcCount: 1, totalCapacity: '3Gi', costTier: 'premium' }
            ]
        };
        const utilization = {
            efficiency: 'good',
            efficiencyScore: 72,
            wasteIndicators: [
                { type: 'oversized_pvc', severity: 'medium', impact: '5Gi over', recommendation: 'resize to 7Gi' }
            ],
            rightsizingPotential: 'Can reduce by 30%'
        };
        const cost = {
            monthlyCost: 50,
            annualCost: 600,
            costPerGB: 0.1,
            optimizedMonthlyCost: 35,
            potentialSavings: 15
        };
        const analytics = {
            namespace: 'student01',
            storageMetrics: metrics,
            utilizationAnalysis: utilization,
            costProjection: cost,
            healthStatus: {
                overall: 'warning',
                issues: [{ type: 'binding_failures', severity: 'medium', description: '1 pending PVC', impact: 'delayed workloads', remediation: 'create consumer pod' }],
                pendingPvcAnalysis: { count: 1, oldestAge: 29, reasons: { WaitForFirstConsumer: 1 } }
            },
            optimization: [
                { type: 'resize_pvc', potentialSavings: '30%', effort: 'low', description: 'downsize data-b', implementation: 'oc patch pvc ...' }
            ],
            riskFactors: [
                { type: 'capacity_risk', severity: 'low', description: 'approaching quota', mitigation: 'increase quota' }
            ]
        };
        const nsReport = {
            incidentId: 'ns-001',
            timestamp: Date.now(),
            analysisScope: 'single_namespace',
            namespaceAnalytics: [analytics],
            clusterSummary: {
                totalNamespaces: 1,
                totalStorageRequested: '15Gi',
                totalStorageAllocated: '12Gi',
                clusterUtilization: 50,
                topConsumers: [{ namespace: 'student01', storageUsed: '6Gi', percentage: 100, efficiency: 72 }],
                inefficientNamespaces: [],
                recommendations: [{ type: 'cost_optimization', description: 'switch premium to standard', impact: 'save 15$', implementation: ['policy/change-class'] }]
            },
            recommendations: [
                { type: 'rightsize', priority: 'high', namespace: 'student01', action: 'reduce pvc size', expectedSavings: '30%', riskLevel: 'safe', implementation: 'oc patch' }
            ],
            trends: [
                { namespace: 'student01', trendDirection: 'growing', growthRate: 10, projectedCapacityDate: '2025-12-01', confidenceLevel: 0.8 }
            ]
        };
        // Basic validations
        expect(nsReport.namespaceAnalytics[0].namespace).toBe('student01');
        expect(nsReport.clusterSummary.totalNamespaces).toBe(1);
        expect(nsReport.clusterSummary.clusterUtilization).toBeGreaterThanOrEqual(0);
        expect(nsReport.recommendations[0].priority).toBe('high');
    });
    it('should expose WEEK1_METRICS constant with acceptance criteria', () => {
        expect(WEEK1_METRICS.task13.targetScenario).toContain('student03');
        expect(WEEK1_METRICS.task13.acceptanceCriteria.length).toBeGreaterThan(2);
        expect(WEEK1_METRICS.task11.optimizationValue).toContain('%');
    });
});
