import { ToolMaturity } from '../types/tool-maturity.js';
// Based on comprehensive-diagnostic-67890 session with 75% success rate
export const VALIDATED_TOOLS = {
    // Diagnostics
    'oc_diagnostic_cluster_health': {
        name: 'oc_diagnostic_cluster_health',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true,
        validationSession: 'comprehensive-diagnostic-67890',
        successRate: '100%',
        realClusterTested: true,
        llmTested: 'Qwen'
    },
    'oc_diagnostic_rca_checklist': {
        name: 'oc_diagnostic_rca_checklist',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    // Read Ops
    'oc_read_get_pods': {
        name: 'oc_read_get_pods',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 95,
        mcpCompatible: true
    },
    'oc_read_describe': {
        name: 'oc_read_describe',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 95,
        mcpCompatible: true
    },
    'oc_read_logs': {
        name: 'oc_read_logs',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 90,
        mcpCompatible: true
    },
    // Memory
    'memory_store_operational': {
        name: 'memory_store_operational',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    'memory_get_stats': {
        name: 'memory_get_stats',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    'memory_search_operational': {
        name: 'memory_search_operational',
        maturity: ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 85,
        mcpCompatible: true,
        notes: 'Domain filtering validated'
    }
};
export function isValidatedTool(fullName) {
    return Boolean(VALIDATED_TOOLS[fullName]);
}
