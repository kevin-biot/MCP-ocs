"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATED_TOOLS = void 0;
exports.isValidatedTool = isValidatedTool;
var tool_maturity_js_1 = require("../types/tool-maturity.js");
// Based on comprehensive-diagnostic-67890 session with 75% success rate
exports.VALIDATED_TOOLS = {
    // Diagnostics
    'oc_diagnostic_cluster_health': {
        name: 'oc_diagnostic_cluster_health',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
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
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    // Read Ops
    'oc_read_get_pods': {
        name: 'oc_read_get_pods',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 95,
        mcpCompatible: true
    },
    'oc_read_describe': {
        name: 'oc_read_describe',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 95,
        mcpCompatible: true
    },
    'oc_read_logs': {
        name: 'oc_read_logs',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 90,
        mcpCompatible: true
    },
    // Memory
    'memory_store_operational': {
        name: 'memory_store_operational',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    'memory_get_stats': {
        name: 'memory_get_stats',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 100,
        mcpCompatible: true
    },
    'memory_search_operational': {
        name: 'memory_search_operational',
        maturity: tool_maturity_js_1.ToolMaturity.PRODUCTION,
        lastValidated: '2024-08-14',
        testCoverage: 85,
        mcpCompatible: true,
        notes: 'Domain filtering validated'
    }
};
function isValidatedTool(fullName) {
    return Boolean(exports.VALIDATED_TOOLS[fullName]);
}
