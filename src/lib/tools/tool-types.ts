/**
 * Tool Type Definitions
 * 
 * Defines the structure and types for tool calls and results in the MCP-ocs system.
 */

export interface ToolCall {
  toolName: string;
  sessionId: string;
  args: any;
  timestamp?: number;
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  timestamp?: number;
  duration?: number;
  summary?: string;
  issues?: string[];
  recommendations?: string[];
  evidence?: any;
}

export interface ToolDefinition {
  name: string;
  namespace: string;
  fullName: string;
  domain: string;
  priority: number;
  capabilities: ToolCapability[];
  dependencies: string[];
  contextRequirements: ContextRequirement[];
  description: string;
  inputSchema: any;
}

export interface ToolCapability {
  type: 'diagnostic' | 'read' | 'write' | 'state';
  level: 'basic' | 'advanced' | 'expert';
  riskLevel: 'safe' | 'caution' | 'dangerous';
}

export interface ContextRequirement {
  type: 'domain_focus' | 'resource_access' | 'permission';
  value: string;
  required: boolean;
}

export interface DiagnosticContext {
  namespace?: string;
  resourceType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  podNames?: string[];
  pvcStatus?: string;
  podReferences?: boolean;
  sessionId?: string;
}

export interface MemoryRecord {
  id: string;
  toolCall: ToolCall;
  result: ToolResult;
  timestamp: number;
  tags: string[];
  context: DiagnosticContext;
  diagnosis?: any;
  confidence?: number;
  validation?: {
    status: 'verified' | 'pending' | 'failed';
    accuracy: number;
    source: string;
  };
}