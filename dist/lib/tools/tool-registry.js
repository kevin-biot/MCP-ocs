/**
 * Unified Tool Registry - Standardized MCP Tool Registration
 *
 * Eliminates inconsistent registration patterns and provides unified
 * interface for all tool types (v1, v2, individual, collections)
 */
/**
 * Unified Tool Registry
 *
 * Central registry for all MCP tools with consistent interface
 * and automatic routing capabilities
 */
export class UnifiedToolRegistry {
    tools = new Map();
    suites = [];
    /**
     * Register an entire tool suite
     */
    registerSuite(suite) {
        console.error(`📦 Registering tool suite: ${suite.category}-${suite.version}`);
        const tools = suite.getTools();
        let registeredCount = 0;
        for (const tool of tools) {
            try {
                this.registerTool(tool);
                registeredCount++;
            }
            catch (error) {
                console.error(`❌ Failed to register tool ${tool.name}:`, error);
            }
        }
        this.suites.push(suite);
        console.error(`✅ Registered ${registeredCount}/${tools.length} tools from ${suite.category}-${suite.version}`);
    }
    /**
     * Register a single tool
     */
    registerTool(tool) {
        // Validate tool structure
        this.validateTool(tool);
        // Check for name conflicts
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool name conflict: ${tool.name} already registered`);
        }
        // Register the tool
        this.tools.set(tool.name, tool);
        console.error(`🔧 Registered tool: ${tool.name} (${tool.category}-${tool.version})`);
    }
    /**
     * Get all registered tools
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Get tools by category
     */
    getToolsByCategory(category) {
        return this.getAllTools().filter(tool => tool.category === category);
    }
    /**
     * Get tools by version
     */
    getToolsByVersion(version) {
        return this.getAllTools().filter(tool => tool.version === version);
    }
    /**
     * Execute a tool by name (supports both internal name and fullName)
     */
    async executeTool(name, args) {
        // Try to find tool by fullName first (MCP uses fullName)
        let tool = Array.from(this.tools.values()).find(t => t.fullName === name);
        // Fallback to internal name lookup
        if (!tool) {
            tool = this.tools.get(name);
        }
        if (!tool) {
            const availableTools = Array.from(this.tools.values()).map(t => t.fullName).join(', ');
            throw new Error(`Tool not found: ${name}. Available tools: ${availableTools}`);
        }
        console.error(`⚡ Executing ${tool.category}-${tool.version} tool: ${name}`);
        try {
            const result = await tool.execute(args);
            // Validate result is string (MCP requirement)
            if (typeof result !== 'string') {
                throw new Error(`Tool ${name} returned non-string result. Tools must return JSON strings.`);
            }
            return result;
        }
        catch (error) {
            console.error(`❌ Tool execution failed for ${name}:`, error);
            // Return standardized error response
            const errorResponse = {
                success: false,
                tool: name,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(errorResponse, null, 2);
        }
    }
    /**
     * Check if a tool exists
     */
    hasTool(name) {
        return this.tools.has(name);
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const tools = this.getAllTools();
        const byCategory = {};
        const byVersion = {};
        for (const tool of tools) {
            byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
            byVersion[tool.version] = (byVersion[tool.version] || 0) + 1;
        }
        return {
            totalTools: tools.length,
            byCategory,
            byVersion,
            suites: this.suites.map(s => `${s.category}-${s.version}`)
        };
    }
    /**
     * Get tools formatted for MCP registration
     */
    getMCPTools() {
        return this.getAllTools().map(tool => ({
            name: tool.fullName,
            description: tool.description,
            inputSchema: tool.inputSchema
        }));
    }
    /**
     * Validate tool structure
     */
    validateTool(tool) {
        const required = ['name', 'fullName', 'description', 'inputSchema', 'execute', 'category', 'version'];
        for (const field of required) {
            if (!tool[field]) {
                throw new Error(`Tool validation failed: missing required field '${field}'`);
            }
        }
        // Validate execute method
        if (typeof tool.execute !== 'function') {
            throw new Error(`Tool validation failed: execute must be a function`);
        }
        // Validate category
        const validCategories = ['diagnostic', 'read-ops', 'memory', 'knowledge', 'workflow'];
        if (!validCategories.includes(tool.category)) {
            throw new Error(`Tool validation failed: invalid category '${tool.category}'. Must be one of: ${validCategories.join(', ')}`);
        }
        // Validate version
        const validVersions = ['v1', 'v2'];
        if (!validVersions.includes(tool.version)) {
            throw new Error(`Tool validation failed: invalid version '${tool.version}'. Must be one of: ${validVersions.join(', ')}`);
        }
    }
}
/**
 * Global registry instance
 * Singleton pattern for application-wide tool registration
 */
let globalRegistry = null;
export function getGlobalToolRegistry() {
    if (!globalRegistry) {
        globalRegistry = new UnifiedToolRegistry();
    }
    return globalRegistry;
}
/**
 * Reset global registry (useful for testing)
 */
export function resetGlobalToolRegistry() {
    globalRegistry = null;
}
