/**
 * Common Types for MCP-ocs Tools and Components
 */

// Tool capability definitions (from ADR-004)
export interface ToolCapability {
  type: 'read' | 'write' | 'diagnostic' | 'memory' | 'state';
  level: 'basic' | 'advanced' | 'expert';
  riskLevel: 'safe' | 'caution' | 'dangerous';
}

// Tool domains
export type ToolDomain = 'cluster' | 'filesystem' | 'knowledge' | 'system';

// Environment types
export type Environment = 'dev' | 'test' | 'staging' | 'prod';

// Context requirements
export interface ContextRequirement {
  type: 'workflow_state' | 'evidence_level' | 'authorization' | 'cluster_connection';
  value: string;
  required: boolean;
}

// Tool dependency
export interface ToolDependency {
  tool: string;
  version?: string;
  optional?: boolean;
}

// Tool input schema (JSON Schema compatible)
export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

// Tool execution result
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  executionTime?: number;
}

// Workflow states
export type WorkflowState = 'gathering' | 'analyzing' | 'hypothesizing' | 'testing' | 'resolving';

// Evidence types for workflow engine
export type EvidenceType = 'symptoms' | 'affected_resources' | 'logs' | 'events' | 'similar_incidents' | 'pattern_analysis';

// Configuration interfaces
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

// Operational context for tools
export interface OperationalContext {
  sessionId: string;
  workflowState?: WorkflowState;
  evidenceLevel?: number;
  userRole?: string;
  clusterConnection?: boolean;
  contextType: 'incident_response' | 'routine_maintenance' | 'investigation' | 'development';
}

// Error types
export interface McpError extends Error {
  code: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
