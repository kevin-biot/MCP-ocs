/**
 * Tool Namespace Manager - ADR-004 Implementation
 *
 * Hierarchical tool namespace architecture with context-aware filtering
 * Prevents tool confusion and provides structured tool organization
 */
/**
 * Tool namespace definitions following ADR-004 conventions
 */
const TOOL_NAMESPACES = {
    // Core system operations
    'mcp-core': {
        prefix: 'core_',
        domain: 'system',
        tools: ['health_check', 'status', 'config', 'memory_stats']
    },
    // OpenShift cluster operations
    'mcp-openshift': {
        prefix: 'oc_',
        domain: 'cluster',
        tools: ['get_pods', 'describe_pod', 'get_logs', 'get_events', 'apply_config', 'scale_deployment']
    },
    // File system operations
    'mcp-files': {
        prefix: 'file_',
        domain: 'filesystem',
        tools: ['read_file', 'write_file', 'list_directory', 'search_files']
    },
    // Memory operations
    'mcp-memory': {
        prefix: 'memory_',
        domain: 'knowledge',
        tools: ['store_conversation', 'search_memory', 'get_session_context', 'search_operational']
    },
    // Atlassian integration (disabled in first pass per ADR-004)
    'mcp-atlassian': {
        prefix: 'atlassian_',
        domain: 'collaboration',
        tools: ['get_issue', 'create_page', 'search_confluence'],
        disabled: true // First pass version
    },
    // Monitoring and metrics
    'mcp-prometheus': {
        prefix: 'prom_',
        domain: 'monitoring',
        tools: ['query_metrics', 'get_alerts', 'check_health'],
        disabled: true // First pass version
    }
};
/**
 * Context-aware tool filtering rules
 */
const CONTEXT_FILTERING_RULES = {
    file_memory: {
        enabledDomains: ['filesystem', 'knowledge', 'system'],
        disabledDomains: ['collaboration'], // Prevent Atlassian confusion
        priorityBoost: ['file_', 'memory_', 'core_'],
        reasoning: 'Focus on file operations and memory, exclude collaboration tools to prevent confusion'
    },
    atlassian_ops: {
        enabledDomains: ['collaboration', 'knowledge', 'system'],
        deprioritizedDomains: ['filesystem'], // Minimize file tools
        priorityBoost: ['atlassian_', 'memory_', 'core_'],
        reasoning: 'Focus on collaboration tools, minimize file operations'
    },
    cluster_ops: {
        enabledDomains: ['cluster', 'monitoring', 'knowledge', 'system'],
        deprioritizedDomains: ['collaboration', 'filesystem'],
        priorityBoost: ['oc_', 'prom_', 'memory_', 'core_'],
        reasoning: 'Focus on cluster operations and monitoring'
    },
    general: {
        enabledDomains: ['cluster', 'filesystem', 'knowledge', 'system'],
        disabledDomains: [], // No hard restrictions
        priorityBoost: ['core_'],
        reasoning: 'Balanced access to core domains'
    }
};
/**
 * Three-stream configuration integration
 */
const STREAM_CONFIGURATIONS = {
    single: {
        enabledNamespaces: ['mcp-core', 'mcp-files', 'mcp-memory', 'mcp-openshift'],
        disabledNamespaces: ['mcp-atlassian', 'mcp-prometheus'],
        defaultContext: 'general',
        reasoning: 'Single user mode with core functionality, exclude collaboration'
    },
    team: {
        enabledNamespaces: ['mcp-core', 'mcp-files', 'mcp-memory', 'mcp-openshift', 'mcp-atlassian'],
        disabledNamespaces: ['mcp-prometheus'], // Enable later
        defaultContext: 'general',
        reasoning: 'Team mode with collaboration tools enabled'
    },
    router: {
        enabledNamespaces: Object.keys(TOOL_NAMESPACES),
        disabledNamespaces: [],
        defaultContext: 'general',
        reasoning: 'Router mode with all tools available for orchestration'
    }
};
/**
 * Tool Registry for namespace-aware tool management
 */
export class ToolRegistry {
    tools = new Map();
    namespaceTools = new Map();
    namespaceManager;
    constructor(namespaceManager) {
        this.namespaceManager = namespaceManager;
    }
    async registerToolGroup(groupName, tools) {
        for (const tool of tools) {
            await this.registerTool(tool);
        }
        console.error(`📋 Registered tool group '${groupName}' with ${tools.length} tools`);
    }
    async registerTool(tool) {
        // Validate namespace consistency
        this.validateNamespaceConsistency(tool);
        // Check for conflicts
        this.checkToolConflicts(tool);
        // Register tool
        this.tools.set(tool.fullName, tool);
        // Update namespace index
        if (!this.namespaceTools.has(tool.namespace)) {
            this.namespaceTools.set(tool.namespace, new Set());
        }
        this.namespaceTools.get(tool.namespace).add(tool.fullName);
    }
    async getAvailableTools(context) {
        const availableTools = [];
        // Get enabled namespaces from namespace manager
        const enabledNamespaces = this.namespaceManager.getEnabledNamespaces(context);
        // Filter tools by enabled namespaces
        for (const namespace of enabledNamespaces) {
            const toolNames = this.namespaceTools.get(namespace);
            if (toolNames) {
                for (const toolName of toolNames) {
                    const tool = this.tools.get(toolName);
                    if (tool && this.namespaceManager.isToolAvailable(tool, context)) {
                        availableTools.push(tool);
                    }
                }
            }
        }
        // Sort by context relevance and priority
        return availableTools.sort((a, b) => {
            const relevanceA = this.calculateToolRelevance(a, context);
            const relevanceB = this.calculateToolRelevance(b, context);
            if (relevanceA !== relevanceB) {
                return relevanceB - relevanceA; // Higher relevance first
            }
            return b.priority - a.priority; // Higher priority first
        });
    }
    async executeTool(toolName, args) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }
        // Tool execution will be delegated to specific tool implementations
        // This is a placeholder for the actual execution logic
        console.error(`🔧 Executing tool: ${toolName}`);
        return {
            tool: toolName,
            result: 'Tool execution placeholder - implement in tool groups',
            timestamp: new Date().toISOString()
        };
    }
    getToolCount() {
        return this.tools.size;
    }
    getGroupCount() {
        return this.namespaceTools.size;
    }
    validateNamespaceConsistency(tool) {
        const expectedPrefix = TOOL_NAMESPACES[tool.namespace]?.prefix;
        if (expectedPrefix && !tool.fullName.startsWith(expectedPrefix)) {
            throw new Error(`Tool ${tool.fullName} does not follow namespace prefix ${expectedPrefix}`);
        }
    }
    checkToolConflicts(tool) {
        if (tool.conflictsWith) {
            for (const conflictingTool of tool.conflictsWith) {
                if (this.tools.has(conflictingTool)) {
                    console.warn(`⚠️ Tool conflict detected: ${tool.fullName} conflicts with ${conflictingTool}`);
                }
            }
        }
    }
    calculateToolRelevance(tool, context) {
        let relevance = tool.priority;
        // Boost relevance for tools in primary domain
        if (tool.domain === context.primaryDomain) {
            relevance += 50;
        }
        // Boost relevance for tools in active domains
        if (context.activeDomains.includes(tool.domain)) {
            relevance += 25;
        }
        // Apply context-specific boosts
        const contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (contextRules?.priorityBoost) {
            for (const prefix of contextRules.priorityBoost) {
                if (tool.fullName.startsWith(prefix)) {
                    relevance += 30;
                    break;
                }
            }
        }
        // Reduce relevance for workflow-inappropriate tools
        if (context.workflowPhase === 'diagnostic' && tool.capabilities.some(c => c.type === 'write')) {
            relevance -= 20; // Reduce write operations during diagnostics
        }
        return relevance;
    }
}
/**
 * Main Tool Namespace Manager
 */
export class ToolNamespaceManager {
    config;
    currentContext;
    enabledNamespaces = new Set();
    toolFilters = new Map();
    constructor(config) {
        this.config = config;
        this.currentContext = {
            mode: config.mode,
            primaryDomain: 'system',
            activeDomains: config.enabledDomains,
            workflowPhase: 'diagnostic',
            environment: 'dev',
            contextType: config.currentContext || 'general'
        };
        this.initializeStreamConfiguration();
    }
    /**
     * Set operational context and update tool availability
     */
    async setOperationalContext(context) {
        console.error(`🎯 Setting operational context: ${context.contextType} (${context.mode} mode)`);
        this.currentContext = context;
        // Clear previous context
        this.enabledNamespaces.clear();
        this.toolFilters.clear();
        // Always enable core tools
        this.enabledNamespaces.add('mcp-core');
        // Context-specific namespace activation
        switch (context.mode) {
            case 'single':
                await this.configureSingleUserMode(context);
                break;
            case 'team':
                await this.configureTeamMode(context);
                break;
            case 'router':
                await this.configureRouterMode(context);
                break;
        }
        // Apply context-specific filtering
        this.applyContextFiltering(context);
        console.error(`✅ Context set: ${this.enabledNamespaces.size} namespaces enabled`);
    }
    /**
     * Get currently enabled namespaces
     */
    getEnabledNamespaces(context) {
        const ctx = context || this.currentContext;
        // Apply stream configuration restrictions
        const streamConfig = STREAM_CONFIGURATIONS[ctx.mode];
        const enabledByStream = new Set(streamConfig.enabledNamespaces);
        // Intersect with context-enabled namespaces
        const result = Array.from(this.enabledNamespaces).filter(ns => enabledByStream.has(ns));
        return result;
    }
    /**
     * Check if a specific tool is available in current context
     */
    isToolAvailable(tool, context) {
        // Check if namespace is enabled
        if (!this.enabledNamespaces.has(tool.namespace)) {
            return false;
        }
        // Check tool-specific filters
        const filter = this.toolFilters.get(tool.fullName);
        if (filter && !filter.enabled) {
            return false;
        }
        // Check context requirements
        for (const requirement of tool.contextRequirements) {
            if (!this.checkContextRequirement(requirement, context)) {
                return false;
            }
        }
        // Check domain restrictions
        const contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (contextRules && 'disabledDomains' in contextRules) {
            const disabledDomains = contextRules.disabledDomains;
            if (disabledDomains?.includes(tool.domain)) {
                return false;
            }
        }
        return true;
    }
    getCurrentMode() {
        return this.currentContext.mode;
    }
    getCurrentContext() {
        return { ...this.currentContext };
    }
    /**
     * Private configuration methods
     */
    initializeStreamConfiguration() {
        const streamConfig = STREAM_CONFIGURATIONS[this.config.mode];
        // Enable namespaces based on stream configuration
        streamConfig.enabledNamespaces.forEach(ns => {
            // All tool namespaces are enabled by default
            this.enabledNamespaces.add(ns);
        });
        console.error(`🔧 Initialized ${this.config.mode} stream with ${this.enabledNamespaces.size} namespaces`);
    }
    async configureSingleUserMode(context) {
        // Single user: Enable core functionality only
        this.enabledNamespaces.add('mcp-files');
        this.enabledNamespaces.add('mcp-memory');
        // Conditionally enable domain-specific tools
        if (context.activeDomains.includes('cluster')) {
            this.enabledNamespaces.add('mcp-openshift');
        }
        // Disable collaboration tools by default in single mode
        this.addToolFilter('atlassian_*', {
            enabled: false,
            reason: 'Not available in single user mode'
        });
        console.error('🔧 Configured single user mode');
    }
    async configureTeamMode(context) {
        // Team mode: Enable collaboration tools
        this.enabledNamespaces.add('mcp-files');
        this.enabledNamespaces.add('mcp-memory');
        // Enable collaboration tools in team mode
        if (!TOOL_NAMESPACES['mcp-atlassian']?.disabled) {
            this.enabledNamespaces.add('mcp-atlassian');
        }
        if (context.activeDomains.includes('cluster')) {
            this.enabledNamespaces.add('mcp-openshift');
        }
        if (context.activeDomains.includes('monitoring')) {
            this.enabledNamespaces.add('mcp-prometheus');
        }
        console.error('🔧 Configured team mode');
    }
    async configureRouterMode(context) {
        // Router mode: Enable all available tools for orchestration
        Object.keys(TOOL_NAMESPACES).forEach(namespace => {
            // All tool namespaces are enabled in router mode
            this.enabledNamespaces.add(namespace);
        });
        console.error('🔧 Configured router mode with full tool access');
    }
    applyContextFiltering(context) {
        const contextRules = CONTEXT_FILTERING_RULES[context.contextType];
        if (!contextRules)
            return;
        // Disable domains marked as disabled
        if (contextRules && 'disabledDomains' in contextRules) {
            contextRules.disabledDomains.forEach((domain) => {
                const namespacesToDisable = Object.entries(TOOL_NAMESPACES)
                    .filter(([_, config]) => config.domain === domain)
                    .map(([namespace]) => namespace);
                namespacesToDisable.forEach(ns => {
                    this.enabledNamespaces.delete(ns);
                });
            });
        }
        console.error(`🎯 Applied ${context.contextType} context filtering`);
    }
    addToolFilter(pattern, filter) {
        this.toolFilters.set(pattern, filter);
    }
    checkContextRequirement(requirement, context) {
        switch (requirement.type) {
            case 'environment':
                return context.environment === requirement.value;
            case 'workflow_state':
                return context.workflowPhase === requirement.value;
            case 'domain_focus':
                return context.activeDomains.includes(requirement.value);
            default:
                return !requirement.required; // Unknown requirements are optional
        }
    }
}
