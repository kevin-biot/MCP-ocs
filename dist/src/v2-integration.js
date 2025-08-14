/**
 * MCP-OCS v2.0 Tool Integration
 *
 * Integrates the new check_namespace_health tool with the existing MCP server
 */
import { NamespaceHealthChecker } from './v2/tools/check-namespace-health/index.js';
import { OcWrapperV2 } from './v2/lib/oc-wrapper-v2.js';
// Initialize v2 components
const ocWrapperV2 = new OcWrapperV2();
const namespaceHealthChecker = new NamespaceHealthChecker(ocWrapperV2);
/**
 * V2 Tool: check_namespace_health
 *
 * Comprehensive namespace health analysis with:
 * - Pod status analysis (crashloops, image pull errors, OOM kills)
 * - PVC binding validation
 * - Route/Ingress connectivity testing
 * - Event correlation and pattern detection
 * - Intelligent suspicion generation
 */
export async function checkNamespaceHealthV2(args) {
    try {
        const { namespace, includeIngressTest = false, sessionId } = args;
        // Input validation
        if (!namespace || typeof namespace !== 'string') {
            throw new Error('namespace parameter is required and must be a string');
        }
        // Perform health check
        const healthResult = await namespaceHealthChecker.checkHealth({
            namespace,
            includeIngressTest,
            maxLogLinesPerPod: args.maxLogLinesPerPod || 0
        });
        // Format output for MCP (both machine and human readable)
        const response = {
            tool: 'check_namespace_health_v2',
            sessionId,
            timestamp: healthResult.timestamp,
            duration: `${healthResult.duration}ms`,
            // Core health data
            namespace: healthResult.namespace,
            status: healthResult.status,
            // Detailed findings
            summary: {
                pods: `${healthResult.checks.pods.ready}/${healthResult.checks.pods.total} ready`,
                pvcs: `${healthResult.checks.pvcs.bound}/${healthResult.checks.pvcs.total} bound`,
                routes: `${healthResult.checks.routes.total} configured`,
                criticalEvents: healthResult.checks.events.length
            },
            // Issues identified
            issues: {
                crashLoopPods: healthResult.checks.pods.crashloops,
                imagePullErrors: healthResult.checks.pods.imagePullErrors,
                pendingPods: healthResult.checks.pods.pending,
                oomKilledPods: healthResult.checks.pods.oomKilled,
                pvcErrors: healthResult.checks.pvcs.errors,
                recentEvents: healthResult.checks.events.slice(0, 5)
            },
            // AI-generated suspicions
            suspicions: healthResult.suspicions,
            // Route connectivity (if tested)
            connectivity: healthResult.checks.routes.probe ? {
                tested: true,
                url: healthResult.checks.routes.probe.url,
                status: healthResult.checks.routes.probe.code,
                reachable: healthResult.checks.routes.reachable
            } : { tested: false },
            // Human readable summary
            human: healthResult.human,
            // Next actions (generated based on issues found)
            nextActions: generateNextActions(healthResult),
            // Performance metrics
            performance: {
                responseTime: `${healthResult.duration}ms`,
                cacheStats: ocWrapperV2.getCacheStats()
            }
        };
        return JSON.stringify(response, null, 2);
    }
    catch (error) {
        const errorResponse = {
            tool: 'check_namespace_health_v2',
            sessionId: args.sessionId,
            timestamp: new Date().toISOString(),
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            namespace: args.namespace,
            human: `Failed to check health of namespace ${args.namespace}: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        return JSON.stringify(errorResponse, null, 2);
    }
}
/**
 * Generate actionable next steps based on health check results
 */
function generateNextActions(healthResult) {
    const actions = [];
    // Pod-related actions
    if (healthResult.checks.pods.crashloops.length > 0) {
        actions.push(`Check logs for crashloop pods: oc logs ${healthResult.checks.pods.crashloops[0]} -n ${healthResult.namespace} --previous`);
    }
    if (healthResult.checks.pods.imagePullErrors.length > 0) {
        actions.push(`Verify image and registry access: oc describe pod ${healthResult.checks.pods.imagePullErrors[0]} -n ${healthResult.namespace}`);
    }
    if (healthResult.checks.pods.pending.length > 0) {
        actions.push(`Check pod scheduling: oc describe pod ${healthResult.checks.pods.pending[0]} -n ${healthResult.namespace}`);
    }
    // PVC-related actions
    if (healthResult.checks.pvcs.pending > 0) {
        actions.push(`Check PVC status: oc get pvc -n ${healthResult.namespace}`);
        actions.push(`Verify storage class: oc get sc`);
    }
    // Route-related actions
    if (healthResult.checks.routes.probe && healthResult.checks.routes.probe.code >= 400) {
        actions.push(`Check service endpoints: oc get endpoints -n ${healthResult.namespace}`);
        actions.push(`Test pod readiness: oc get pods -n ${healthResult.namespace} -o wide`);
    }
    // Event investigation
    if (healthResult.checks.events.length > 0) {
        actions.push(`Review recent events: oc get events -n ${healthResult.namespace} --sort-by=.lastTimestamp`);
    }
    // Default action if no specific issues
    if (actions.length === 0 && healthResult.status !== 'healthy') {
        actions.push(`Run detailed diagnostics: oc describe namespace ${healthResult.namespace}`);
    }
    return actions.slice(0, 5); // Limit to top 5 actions
}
// Export for integration with existing tool registry
export const checkNamespaceHealthV2Tool = {
    name: 'check_namespace_health_v2',
    description: 'V2: Comprehensive namespace health analysis with pod status, PVC binding, route testing, and intelligent issue detection',
    inputSchema: {
        type: 'object',
        properties: {
            sessionId: { type: 'string' },
            namespace: { type: 'string' },
            includeIngressTest: { type: 'boolean', default: false },
            maxLogLinesPerPod: { type: 'number', default: 0 }
        },
        required: ['sessionId', 'namespace']
    },
    handler: checkNamespaceHealthV2
};
