/**
 * Diagnostic Tools V2 Suite - Unified Registration
 *
 * Integrates V2 diagnostic tools with the UnifiedToolRegistry
 * Finally fixes the broken V2 integration!
 */
import { StandardTool, ToolSuite } from '../../lib/tools/tool-registry.js';
/**
 * Diagnostic Tools V2 Suite
 *
 * Wraps V2 diagnostic tools for unified registration
 * This FINALLY integrates the commented-out V2 tools!
 */
export declare class DiagnosticToolsV2Suite implements ToolSuite {
    category: string;
    version: string;
    metadata: {
        description: string;
        maintainer: string;
    };
    getTools(): StandardTool[];
}
/**
 * Future V2 tools can be added here:
 *
 * - check_cluster_health_v2: Enhanced cluster-wide analysis
 * - check_pod_health_v2: Advanced pod diagnostics with ML insights
 * - check_network_health_v2: Network connectivity and performance analysis
 * - check_storage_health_v2: PVC, PV, and storage class diagnostics
 * - check_security_health_v2: Security posture and compliance checks
 */
