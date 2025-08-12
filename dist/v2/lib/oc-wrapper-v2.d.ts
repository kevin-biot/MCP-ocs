/**
 * Enhanced OpenShift CLI Wrapper v2.0
 *
 * Based on CLI mapping cheatsheet with:
 * - Input sanitization and validation
 * - Timeout handling with configurable limits
 * - Caching for expensive operations
 * - Structured error handling
 * - Performance optimization
 */
export interface OcCommandOptions {
    timeout?: number;
    namespace?: string;
    retries?: number;
    cacheKey?: string;
    cacheTTL?: number;
}
export interface OcResult {
    stdout: string;
    stderr: string;
    duration: number;
    cached: boolean;
}
export declare class OcWrapperV2 {
    private ocPath;
    private defaultTimeout;
    private cache;
    constructor(ocPath?: string, defaultTimeout?: number);
    /**
     * Execute oc command with safety and performance optimizations
     */
    executeOc(args: string[], options?: OcCommandOptions): Promise<OcResult>;
    /**
     * Get pods in namespace with structured output
     */
    getPods(namespace: string): Promise<any>;
    /**
     * Get events in namespace
     */
    getEvents(namespace: string): Promise<any>;
    /**
     * Get PVCs in namespace
     */
    getPVCs(namespace: string): Promise<any>;
    /**
     * Get routes in namespace (OpenShift)
     */
    getRoutes(namespace: string): Promise<any>;
    /**
     * Get deployments in namespace
     */
    getDeployments(namespace: string): Promise<any>;
    /**
     * Get ingress in namespace (Kubernetes fallback)
     */
    getIngress(namespace: string): Promise<any>;
    /**
     * Validate namespace exists
     */
    validateNamespaceExists(namespace: string): Promise<boolean>;
    /**
     * Clear cache for namespace
     */
    clearNamespaceCache(namespace: string): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
    private executeWithTimeout;
    private validateArgs;
    private validateNamespace;
    private isValidCache;
    private delay;
}
