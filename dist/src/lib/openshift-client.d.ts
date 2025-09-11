/**
 * OpenShift Client - ADR-001 Implementation
 *
 * Phase 1: CLI wrapper approach for rapid development
 * Uses `oc` command execution with proper error handling and output parsing
 */
export interface OpenShiftConfig {
    ocPath: string;
    kubeconfig?: string;
    context?: string;
    namespace?: string;
    timeout: number;
}
export interface ClusterInfo {
    version: string;
    serverUrl: string;
    currentUser: string;
    currentProject: string;
    status: 'connected' | 'disconnected' | 'error';
}
export interface PodInfo {
    name: string;
    namespace: string;
    status: string;
    ready: string;
    restarts: number;
    age: string;
    ip?: string;
    node?: string;
}
export interface EventInfo {
    type: string;
    reason: string;
    object: string;
    message: string;
    timestamp: string;
    source: string;
}
export declare class OpenShiftClient {
    private config;
    private envVars;
    constructor(config: OpenShiftConfig);
    /**
     * Validate connection to OpenShift cluster
     */
    validateConnection(): Promise<void>;
    /**
     * Get cluster information and status
     */
    getClusterInfo(): Promise<ClusterInfo>;
    /**
     * Get pods in a namespace
     */
    getPods(namespace?: string, selector?: string): Promise<PodInfo[]>;
    /**
     * Describe a specific resource
     */
    describeResource(resourceType: string, name: string, namespace?: string): Promise<string>;
    /**
     * List resources of a given type and return names (+namespaces when present)
     * Supports namespace === 'all' (-A) for multi-namespace expansion.
     */
    listResources(resourceType: string, namespace?: string): Promise<Array<{
        name: string;
        namespace?: string;
    }>>;
    /**
     * Get logs from a pod
     */
    getLogs(podName: string, namespace?: string, options?: {
        container?: string;
        lines?: number;
        follow?: boolean;
        since?: string;
    }): Promise<string>;
    /**
     * Get events in a namespace
     */
    getEvents(namespace?: string, fieldSelector?: string): Promise<EventInfo[]>;
    /**
     * Apply configuration from YAML/JSON
     */
    applyConfig(config: string, namespace?: string): Promise<string>;
    /**
     * Scale a deployment
     */
    scaleDeployment(name: string, replicas: number, namespace?: string): Promise<string>;
    /**
     * Execute raw oc command
     */
    executeRawCommand(args: string[]): Promise<string>;
    /**
     * Clean up resources
     */
    close(): Promise<void>;
    /**
     * Private helper methods
     */
    private executeOcCommand;
    private executeOcCommandWithInput;
    private sanitizeArgument;
    private parsePodInfo;
    private parseEventInfo;
    private calculateAge;
}
