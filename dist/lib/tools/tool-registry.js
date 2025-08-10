/**
 * Tool Registry - Central registry for all MCP-ocs tools
 * Implements ADR-004: Tool namespace management
 */
export class ToolRegistry {
    tools = new Map();
    diagnosticTools;
    readOpsTools;
    writeOpsTools;
    stateMgmtTools;
    constructor(diagnosticTools, readOpsTools, writeOpsTools, stateMgmtTools) {
        this.diagnosticTools = diagnosticTools;
        this.readOpsTools = readOpsTools;
        this.writeOpsTools = writeOpsTools;
        this.stateMgmtTools = stateMgmtTools;
        this.registerAllTools();
    }
    registerAllTools() {
        // Register diagnostic tools
        this.registerTool('oc_diagnostic_cluster_health', 'mcp-openshift', 'cluster', { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }, this.diagnosticTools.executeTool.bind(this.diagnosticTools, 'oc_diagnostic_cluster_health'), 'Check overall cluster health and identify issues', {
            type: 'object',
            properties: {
                sessionId: { type: 'string' }
            },
            required: ['sessionId']
        });
        this.registerTool('oc_diagnostic_pod_health', 'mcp-openshift', 'cluster', { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }, this.diagnosticTools.executeTool.bind(this.diagnosticTools, 'oc_diagnostic_pod_health'), 'Diagnose pod health issues', {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                namespace: { type: 'string' },
                podName: { type: 'string' }
            },
            required: ['sessionId', 'namespace', 'podName']
        });
        // Register read-ops tools
        this.registerTool('oc_read_get_pods', 'mcp-openshift', 'cluster', { type: 'read', level: 'basic', riskLevel: 'safe' }, this.readOpsTools.executeTool.bind(this.readOpsTools, 'oc_read_get_pods'), 'Get pods from a namespace', {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                namespace: { type: 'string' }
            },
            required: ['sessionId', 'namespace']
        });
        // Register state management tools
        this.registerTool('core_workflow_state', 'mcp-core', 'system', { type: 'read', level: 'basic', riskLevel: 'safe' }, this.stateMgmtTools.executeTool.bind(this.stateMgmtTools, 'core_workflow_state'), 'Get current workflow state', {
            type: 'object',
            properties: {
                sessionId: { type: 'string' }
            },
            required: ['sessionId']
        });
        this.registerTool('memory_store_incident', 'mcp-memory', 'knowledge', { type: 'write', level: 'basic', riskLevel: 'safe' }, this.stateMgmtTools.executeTool.bind(this.stateMgmtTools, 'memory_store_incident'), 'Store incident in operational memory', {
            type: 'object',
            properties: {
                sessionId: { type: 'string' },
                incident: { type: 'object' }
            },
            required: ['sessionId', 'incident']
        });
    }
    registerTool(name, namespace, domain, capability, handler, description, inputSchema) {
        const tool = {
            name,
            namespace,
            domain,
            capability,
            handler,
            description,
            inputSchema
        };
        this.tools.set(name, tool);
    }
    getAvailableTools() {
        return Array.from(this.tools.values());
    }
    getTool(name) {
        return this.tools.get(name);
    }
    getToolsByNamespace(namespace) {
        return Array.from(this.tools.values()).filter(tool => tool.namespace === namespace);
    }
    getToolsByDomain(domain) {
        return Array.from(this.tools.values()).filter(tool => tool.domain === domain);
    }
    async executeTool(name, args) {
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }
        try {
            return await tool.handler(args);
        }
        catch (error) {
            throw new Error(`Tool execution failed: ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
