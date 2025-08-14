/**
 * Common Types for MCP-ocs Tools and Components
 */
export interface ToolCapability {
    type: 'read' | 'write' | 'diagnostic' | 'memory' | 'state';
    level: 'basic' | 'advanced' | 'expert';
    riskLevel: 'safe' | 'caution' | 'dangerous';
}
export type ToolDomain = 'cluster' | 'filesystem' | 'knowledge' | 'system';
export type Environment = 'dev' | 'test' | 'staging' | 'prod';
export interface ContextRequirement {
    type: 'workflow_state' | 'evidence_level' | 'authorization' | 'cluster_connection';
    value: string;
    required: boolean;
}
export interface ToolDependency {
    tool: string;
    version?: string;
    optional?: boolean;
}
export interface ToolInputSchema {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
}
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: string;
    executionTime?: number;
}
export type WorkflowState = 'gathering' | 'analyzing' | 'hypothesizing' | 'testing' | 'resolving';
export type EvidenceType = 'symptoms' | 'affected_resources' | 'logs' | 'events' | 'similar_incidents' | 'pattern_analysis';
export interface ServerConfig {
    port?: number;
    host?: string;
    environment: Environment;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface OpenShiftConfig {
    ocPath: string;
    kubeconfig?: string;
    context?: string;
    namespace?: string;
    timeout: number;
}
export interface MemoryConfig {
    namespace: string;
    chromaHost: string;
    chromaPort: number;
    jsonDir: string;
    compression: boolean;
    retentionDays?: number;
}
export interface ToolsConfig {
    mode: 'single' | 'team' | 'router';
    enabledDomains: ToolDomain[];
    contextFiltering: boolean;
}
export interface WorkflowConfig {
    panicDetection: boolean;
    enforcement: 'guidance' | 'blocking';
    minEvidence: number;
}
export interface OperationalContext {
    sessionId: string;
    workflowState?: WorkflowState;
    evidenceLevel?: number;
    userRole?: string;
    clusterConnection?: boolean;
    contextType: 'incident_response' | 'routine_maintenance' | 'investigation' | 'development';
}
export interface McpError extends Error {
    code: string;
    context?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
