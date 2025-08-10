/**
 * Tool Namespace Manager - ADR-004 Implementation
 *
 * Hierarchical tool namespace architecture with context-aware filtering
 * Prevents tool confusion and provides structured tool organization
 */
export type ToolDomain = 'cluster' | 'filesystem' | 'knowledge' | 'collaboration' | 'monitoring' | 'system';
export type OperationalMode = 'single' | 'team' | 'router';
export type ContextType = 'file_memory' | 'atlassian_ops' | 'cluster_ops' | 'general';
export interface ToolDefinition {
    name: string;
    namespace: string;
    fullName: string;
    domain: ToolDomain;
    capabilities: ToolCapability[];
    dependencies: string[];
    conflictsWith?: string[];
    contextRequirements: ContextRequirement[];
    description: string;
    inputSchema: any;
    priority: number;
}
export interface ToolCapability {
    type: 'read' | 'write' | 'diagnostic' | 'state' | 'memory';
    level: 'basic' | 'advanced' | 'expert';
    riskLevel: 'safe' | 'caution' | 'dangerous';
}
export interface ContextRequirement {
    type: 'environment' | 'workflow_state' | 'domain_focus' | 'user_role';
    value: string;
    required: boolean;
}
export interface OperationalContext {
    mode: OperationalMode;
    primaryDomain: ToolDomain;
    activeDomains: ToolDomain[];
    workflowPhase: 'diagnostic' | 'analysis' | 'resolution';
    environment: 'dev' | 'test' | 'staging' | 'prod';
    contextType: ContextType;
    sessionId?: string;
}
export interface NamespaceConfig {
    mode: OperationalMode;
    enabledDomains: ToolDomain[];
    contextFiltering: boolean;
    currentContext?: ContextType;
}
/**
 * Tool Registry for namespace-aware tool management
 */
export declare class ToolRegistry {
    private tools;
    private namespaceTools;
    private namespaceManager;
    constructor(namespaceManager: ToolNamespaceManager);
    registerToolGroup(groupName: string, tools: ToolDefinition[]): Promise<void>;
    registerTool(tool: ToolDefinition): Promise<void>;
    getAvailableTools(context: OperationalContext): Promise<ToolDefinition[]>;
    executeTool(toolName: string, args: any): Promise<any>;
    getToolCount(): number;
    getGroupCount(): number;
    private validateNamespaceConsistency;
    private checkToolConflicts;
    private calculateToolRelevance;
}
/**
 * Main Tool Namespace Manager
 */
export declare class ToolNamespaceManager {
    private config;
    private currentContext;
    private enabledNamespaces;
    private toolFilters;
    constructor(config: NamespaceConfig);
    /**
     * Set operational context and update tool availability
     */
    setOperationalContext(context: OperationalContext): Promise<void>;
    /**
     * Get currently enabled namespaces
     */
    getEnabledNamespaces(context?: OperationalContext): string[];
    /**
     * Check if a specific tool is available in current context
     */
    isToolAvailable(tool: ToolDefinition, context: OperationalContext): boolean;
    getCurrentMode(): OperationalMode;
    getCurrentContext(): OperationalContext;
    /**
     * Private configuration methods
     */
    private initializeStreamConfiguration;
    private configureSingleUserMode;
    private configureTeamMode;
    private configureRouterMode;
    private applyContextFiltering;
    private addToolFilter;
    private checkContextRequirement;
}
