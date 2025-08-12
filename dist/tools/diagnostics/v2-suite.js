/**
 * Diagnostic Tools V2 Suite - Unified Registration
 *
 * Integrates V2 diagnostic tools with the UnifiedToolRegistry
 * Finally fixes the broken V2 integration!
 */
import { checkNamespaceHealthV2Tool } from '../../v2-integration.js';
/**
 * Diagnostic Tools V2 Suite
 *
 * Wraps V2 diagnostic tools for unified registration
 * This FINALLY integrates the commented-out V2 tools!
 */
export class DiagnosticToolsV2Suite {
    category = 'diagnostic';
    version = 'v2';
    metadata = {
        description: 'Enhanced diagnostic tools with improved analysis and intelligence',
        maintainer: 'MCP-ocs Diagnostics Team'
    };
    getTools() {
        return [
            {
                name: 'oc_diagnostic_namespace_health_v2',
                fullName: 'oc_diagnostic_namespace_health_v2',
                description: checkNamespaceHealthV2Tool.description,
                inputSchema: checkNamespaceHealthV2Tool.inputSchema,
                category: 'diagnostic',
                version: 'v2',
                execute: async (args) => {
                    // V2 tools expect specific format - ensure sessionId and namespace
                    const v2Args = {
                        sessionId: args.sessionId || `v2-session-${Date.now()}`,
                        namespace: args.namespace,
                        includeIngressTest: args.includeIngressTest || false,
                        maxLogLinesPerPod: args.maxLogLinesPerPod || 0,
                        ...args
                    };
                    return await checkNamespaceHealthV2Tool.handler(v2Args);
                },
                metadata: {
                    author: 'MCP-ocs V2 Team',
                    experimental: false,
                    requiredPermissions: ['openshift:read', 'pods:read', 'events:read']
                }
            }
            // Add more V2 diagnostic tools here as they're developed
        ];
    }
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
