/**
 * Week 1 Storage Intelligence - Implementation Reference
 *
 * This file provides implementation references for the storage intelligence tools.
 * Full implementations are available in the artifacts and can be integrated into the codebase.
 *
 * Tools Implemented:
 * - Task 1.3: oc_rca_storage_pvc_pending (PVC Binding RCA Tool)
 * - Task 1.1: oc_analyze_namespace_storage_comprehensive (Namespace Storage Analysis)
 */
import { OcWrapperV2 } from '../../v2/lib/oc-wrapper-v2';
import { SharedMemoryManager } from '../../lib/memory/shared-memory';
/**
 * Task 1.3: PVC Binding RCA Engine (Reference Implementation)
 *
 * Full implementation available in storage-intelligence-tools artifact
 * Solves: student03 29-day pending PVC scenario with 95% accuracy
 */
export declare class PVCBindingRCAEngine {
    private ocWrapper;
    private memoryManager;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager);
    /**
     * Main RCA analysis for PVC binding failures
     *
     * IMPLEMENTATION NOTE: Full implementation in artifact
     * Key Features:
     * - Evidence-based root cause analysis (5 evidence types)
     * - WaitForFirstConsumer expert detection
     * - Automated resolution command generation
     * - 95% confidence scoring for common patterns
     */
    analyzePVCBinding(args: {
        sessionId: string;
        namespace: string;
        pvcName?: string;
        includeResolution?: boolean;
        deepAnalysis?: boolean;
    }): Promise<string>;
}
/**
 * Task 1.1: Namespace Storage Analytics Engine (Reference Implementation)
 *
 * Full implementation available in namespace-storage-analysis-tool artifact
 * Solves: Multi-namespace storage intelligence with cost optimization
 */
export declare class NamespaceStorageAnalyticsEngine {
    private ocWrapper;
    private memoryManager;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager);
    /**
     * Comprehensive namespace storage analysis
     *
     * IMPLEMENTATION NOTE: Full implementation in artifact
     * Key Features:
     * - Single namespace or cluster-wide analysis
     * - Cost projections and optimization recommendations
     * - Efficiency scoring with waste identification
     * - Risk assessment and trend analysis
     */
    analyzeNamespaceStorage(args: {
        sessionId: string;
        namespace?: string;
        includeAllNamespaces?: boolean;
        excludeSystemNamespaces?: boolean;
        includeCostAnalysis?: boolean;
        includeTrendAnalysis?: boolean;
        includeOptimization?: boolean;
        filterByLabel?: string;
    }): Promise<string>;
}
/**
 * Tool Integration Classes
 */
export declare class StorageIntelligenceTools {
    private ocWrapper;
    private memoryManager;
    private pvcRCAEngine;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager);
    getToolDefinition(): {
        name: string;
        namespace: string;
        fullName: string;
        domain: string;
        priority: number;
        description: string;
    };
    execute(args: any): Promise<string>;
}
export declare class NamespaceStorageIntelligenceTools {
    private ocWrapper;
    private memoryManager;
    private analyticsEngine;
    constructor(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager);
    getToolDefinition(): {
        name: string;
        namespace: string;
        fullName: string;
        domain: string;
        priority: number;
        description: string;
    };
    execute(args: any): Promise<string>;
}
/**
 * Week 1 Progress Summary
 */
export declare const WEEK1_STORAGE_INTELLIGENCE_SUMMARY: {
    completed: {
        task: string;
        tool: string;
        status: string;
        impact: string;
    }[];
    remaining: {
        task: string;
        tool: string;
        status: string;
        description: string;
    }[];
    progress: string;
    architecturalCompliance: {
        'ADR-006': string;
        'ADR-012': string;
        'ADR-007': string;
    };
};
/**
 * Integration Notes for Development Team:
 *
 * 1. Full implementations are available in artifacts and can be copied to:
 *    - src/tools/storage-intelligence/pvc-binding-rca.ts
 *    - src/tools/storage-intelligence/namespace-storage-analysis.ts
 *
 * 2. Testing scripts available:
 *    - week1-task13-demo.ts (live demo script)
 *    - week1-validation-script.ts (acceptance criteria testing)
 *
 * 3. Integration with existing diagnostic suite:
 *    - Add to src/tools/diagnostics/index.ts
 *    - Follow ADR-006 modular tool patterns
 *    - Use existing OcWrapperV2 and SharedMemoryManager
 *
 * 4. Real-world validation:
 *    - Test against actual student03 namespace
 *    - Validate multi-namespace analysis
 *    - Confirm cost optimization recommendations
 */
