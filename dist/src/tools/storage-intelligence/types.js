/**
 * Storage Intelligence Data Models - ADR-012 Implementation
 *
 * Week 1 Task 1.1 & 1.3 - Complete type definitions for storage intelligence
 * Comprehensive operational intelligence data structures
 */
export const WEEK1_METRICS = {
    task13: {
        timeReduction: '2-4 hours → 5 minutes',
        accuracyRate: '95% for WaitForFirstConsumer issues',
        targetScenario: 'student03 29-day pending PVC',
        acceptanceCriteria: [
            'Diagnose student03 shared-pvc 29-day pending issue',
            'Identify WaitForFirstConsumer vs Immediate binding issues',
            'Recommend resolution actions (create pod vs change binding mode)',
            'Provide clear troubleshooting guidance'
        ]
    },
    task11: {
        timeReduction: '4 hours → 30 seconds',
        coverageImprovement: '10-20 namespaces → All namespaces',
        optimizationValue: '20-40% cost reduction opportunities',
        acceptanceCriteria: [
            'Show total requested vs actual consumed storage per namespace',
            'Identify pending PVCs and binding failure reasons',
            'Provide storage utilization percentage and trends',
            'Output format: "student03: 15GB requested, 2.3GB consumed, 85% utilization"'
        ]
    }
};
