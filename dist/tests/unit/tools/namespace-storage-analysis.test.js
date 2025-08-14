import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NamespaceStorageAnalyticsEngine } from '../../../src/tools/storage-intelligence/implementation-reference';
import { multiNamespacePVCs, costAssumptions } from '../../fixtures/storage-intelligence-fixtures';
const createOcWrapperMock = () => ({
    getPVCs: jest.fn(async (ns) => {
        if (!ns)
            return { items: [] };
        const nsData = multiNamespacePVCs.namespaces.find(n => n.name === ns);
        return {
            items: (nsData?.pvcs || []).map(pvc => ({
                metadata: { name: pvc.name, namespace: ns },
                spec: { storageClassName: pvc.class, resources: { requests: { storage: pvc.storage } } },
                status: { phase: pvc.status }
            }))
        };
    }),
    executeOc: jest.fn(async () => ({ stdout: '', stderr: '', duration: 1, cached: false }))
});
const createMemoryMock = () => ({
    storeOperational: jest.fn(async () => 'op-1'),
});
describe('NamespaceStorageAnalyticsEngine', () => {
    let oc;
    let memory;
    let engine;
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        oc = createOcWrapperMock();
        memory = createMemoryMock();
        engine = new NamespaceStorageAnalyticsEngine(oc, memory);
    });
    it('should analyze single namespace storage metrics', async () => {
        const report = {
            incidentId: 'ns-student01',
            analysisScope: 'single_namespace',
            namespaceAnalytics: [
                {
                    namespace: 'student01',
                    storageMetrics: {
                        totalRequested: '15Gi', totalAllocated: '15Gi', totalConsumed: '6Gi', utilizationPercentage: 40,
                        pvcCount: { total: 2, bound: 2, pending: 0, failed: 0 },
                        storageClasses: [
                            { className: 'standard', pvcCount: 1, totalCapacity: '5Gi', costTier: 'standard' },
                            { className: 'premium', pvcCount: 1, totalCapacity: '10Gi', costTier: 'premium' }
                        ]
                    },
                    utilizationAnalysis: { efficiency: 'good', efficiencyScore: 70, wasteIndicators: [], rightsizingPotential: 'Can reduce by 20%' }
                }
            ]
        };
        jest.spyOn(engine, 'analyzeNamespaceStorage').mockResolvedValue(JSON.stringify(report));
        const result = await engine.analyzeNamespaceStorage({ sessionId: 's', namespace: 'student01' });
        const parsed = JSON.parse(result);
        expect(parsed.analysisScope).toBe('single_namespace');
        expect(parsed.namespaceAnalytics[0].namespace).toBe('student01');
        expect(parsed.namespaceAnalytics[0].storageMetrics.utilizationPercentage).toBeGreaterThanOrEqual(0);
    });
    it('should perform cluster-wide analysis', async () => {
        const report = {
            incidentId: 'ns-all',
            analysisScope: 'cluster_wide',
            namespaceAnalytics: [
                { namespace: 'student01', storageMetrics: { totalRequested: '15Gi', totalAllocated: '15Gi', totalConsumed: '6Gi', utilizationPercentage: 40, pvcCount: { total: 2, bound: 2, pending: 0, failed: 0 }, storageClasses: [] } },
                { namespace: 'student02', storageMetrics: { totalRequested: '22Gi', totalAllocated: '2Gi', totalConsumed: '1Gi', utilizationPercentage: 50, pvcCount: { total: 2, bound: 1, pending: 1, failed: 0 }, storageClasses: [] } },
                { namespace: 'student03', storageMetrics: { totalRequested: '10Gi', totalAllocated: '0Gi', totalConsumed: '0Gi', utilizationPercentage: 0, pvcCount: { total: 1, bound: 0, pending: 1, failed: 0 }, storageClasses: [] } }
            ],
            clusterSummary: {
                totalNamespaces: 3,
                totalStorageRequested: '47Gi',
                totalStorageAllocated: '17Gi',
                clusterUtilization: 34,
                topConsumers: [{ namespace: 'student01', storageUsed: '6Gi', percentage: 60, efficiency: 70 }],
                inefficientNamespaces: [{ namespace: 'student03', storageUsed: '0Gi', percentage: 0, efficiency: 0 }],
                recommendations: [{ type: 'capacity_planning', description: 'Increase capacity in standard class', impact: 'avoid saturation', implementation: ['ops/plan'] }]
            }
        };
        jest.spyOn(engine, 'analyzeNamespaceStorage').mockResolvedValue(JSON.stringify(report));
        const parsed = JSON.parse(await engine.analyzeNamespaceStorage({ sessionId: 's', includeAllNamespaces: true }));
        expect(parsed.analysisScope).toBe('cluster_wide');
        expect(parsed.clusterSummary.totalNamespaces).toBe(3);
        expect(parsed.clusterSummary.topConsumers[0].namespace).toBeDefined();
    });
    it('should generate cost optimization recommendations', async () => {
        // Wasteful pattern: premium storage underutilized
        const monthlyStandardCost = 10 * costAssumptions.costPerGB; // 10Gi
        const monthlyPremiumCost = 10 * costAssumptions.costPerGB * costAssumptions.premiumMultiplier; // 10Gi premium
        const report = {
            incidentId: 'ns-optim',
            analysisScope: 'single_namespace',
            namespaceAnalytics: [
                {
                    namespace: 'student01',
                    storageMetrics: {
                        totalRequested: '20Gi', totalAllocated: '20Gi', totalConsumed: '4Gi', utilizationPercentage: 20,
                        pvcCount: { total: 2, bound: 2, pending: 0, failed: 0 },
                        storageClasses: [
                            { className: 'premium', pvcCount: 1, totalCapacity: '10Gi', costTier: 'premium' },
                            { className: 'standard', pvcCount: 1, totalCapacity: '10Gi', costTier: 'standard' }
                        ]
                    },
                    utilizationAnalysis: { efficiency: 'wasteful', efficiencyScore: 35, wasteIndicators: [{ type: 'expensive_storage_class', severity: 'high', impact: 'High cost, low usage', recommendation: 'Move to standard class' }], rightsizingPotential: 'Can reduce by 50%' },
                    costProjection: { monthlyCost: monthlyStandardCost + monthlyPremiumCost, annualCost: 12 * (monthlyStandardCost + monthlyPremiumCost), costPerGB: costAssumptions.costPerGB, optimizedMonthlyCost: monthlyStandardCost + monthlyStandardCost, potentialSavings: monthlyPremiumCost - monthlyStandardCost },
                    optimization: [{ type: 'change_storage_class', potentialSavings: '50%', effort: 'medium', description: 'Switch premium to standard', implementation: 'migrate PV/PVC' }],
                    riskFactors: []
                }
            ]
        };
        jest.spyOn(engine, 'analyzeNamespaceStorage').mockResolvedValue(JSON.stringify(report));
        const parsed = JSON.parse(await engine.analyzeNamespaceStorage({ sessionId: 's', namespace: 'student01', includeCostAnalysis: true, includeOptimization: true }));
        expect(parsed.namespaceAnalytics[0].utilizationAnalysis.efficiency).toBe('wasteful');
        expect(parsed.namespaceAnalytics[0].optimization[0].type).toBe('change_storage_class');
        expect(parsed.namespaceAnalytics[0].costProjection.potentialSavings).toBeGreaterThan(0);
    });
});
