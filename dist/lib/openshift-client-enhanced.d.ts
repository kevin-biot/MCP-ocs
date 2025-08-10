/**
 * Enhanced OpenShift Client - Addressing Technical Review
 *
 * Production-hardened implementation with security, resilience, and performance improvements
 */
export interface OpenShiftConfig {
    ocPath?: string;
    kubeconfig?: string;
    context?: string;
    defaultNamespace?: string;
    timeout?: number;
}
export interface ClusterInfo {
    status: string;
    version: string;
    currentUser: string;
    currentProject: string;
    serverUrl: string;
    timestamp: string;
}
export interface PodInfo {
    name: string;
    namespace: string;
    status: string;
    ready: string;
    restarts: number;
    age: string;
    node?: string;
}
export interface EventInfo {
    type: string;
    reason: string;
    object: string;
    message: string;
    firstSeen: string;
    lastSeen: string;
    count: number;
}
/**
 * Enhanced OpenShift Client with production hardening
 */
export declare class OpenShiftClient {
    private ocPath;
    private kubeconfig?;
    private context?;
    private defaultNamespace?;
    private timeout;
    private circuitBreaker;
    private requestQueue;
    private clusterInfoCache;
    private readonly CACHE_TTL;
    constructor(config: OpenShiftConfig);
    /**
     * Validate configuration parameters synchronously
     */
    private validateConfigurationSync;
    /**
     * Validate configuration asynchronously (for file system checks)
     */
    validateConfiguration(): Promise<void>;
    /**
     * Enhanced argument sanitization with comprehensive security checks
     */
    private sanitizeArgument;
    /**
     * Build environment for oc command execution
     */
    private buildEnvironment;
    /**
     * Execute oc command with enhanced security and resilience
     */
    private executeOcCommand;
    /**
     * Execute oc command with circuit breaker and request deduplication
     */
    private executeOcCommandWithResilience;
    /**
     * Get cluster information with caching and optimized concurrent operations
     */
    getClusterInfo(): Promise<ClusterInfo>;
    /**
     * Safely parse Promise.allSettled results
     */
    private parseResultSafely;
    /**
     * Parse version output safely
     */
    private parseVersionSafely;
    /**
     * Get server URL with error handling
     */
    private getServerUrl;
    /**
     * Get pods with enhanced error handling and logging
     */
    getPods(namespace?: string, selector?: string): Promise<PodInfo[]>;
    private calculateReadyStatus;
    private calculateRestarts;
    private calculateAge;
    /**
     * Clear cache (useful for testing or forced refresh)
     */
    clearCache(): void;
    /**
     * Get client health status
     */
    getHealth(): {
        healthy: boolean;
        issues: string[];
    };
}
