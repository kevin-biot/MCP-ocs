/**
 * MCP-OCS v2.0 Tool Integration
 *
 * Integrates the new check_namespace_health tool with the existing MCP server
 */
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
export declare function checkNamespaceHealthV2(args: {
    namespace: string;
    includeIngressTest?: boolean;
    maxLogLinesPerPod?: number;
    sessionId: string;
}): Promise<string>;
export declare const checkNamespaceHealthV2Tool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            sessionId: {
                type: string;
            };
            namespace: {
                type: string;
            };
            includeIngressTest: {
                type: string;
                default: boolean;
            };
            maxLogLinesPerPod: {
                type: string;
                default: number;
            };
        };
        required: string[];
    };
    handler: typeof checkNamespaceHealthV2;
};
