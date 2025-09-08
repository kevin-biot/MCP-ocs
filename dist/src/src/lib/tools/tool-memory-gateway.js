import { MCPOcsMemoryAdapter } from '../memory/mcp-ocs-memory-adapter';
export class ToolMemoryGateway {
    adapter;
    initialized = false;
    constructor(memoryDir = './memory') {
        this.adapter = new MCPOcsMemoryAdapter(memoryDir);
    }
    async initialize() {
        if (this.initialized)
            return;
        await this.adapter.initialize();
        this.initialized = true;
    }
    async storeToolExecution(toolName, args, result, sessionId, tags = [], domain = 'openshift', environment = 'prod', severity = 'medium') {
        await this.initialize();
        const memory = {
            sessionId,
            timestamp: Date.now(),
            userMessage: `Tool ${toolName} executed with args: ${JSON.stringify(args)}`,
            assistantResponse: typeof result === 'string' ? result : JSON.stringify(result),
            context: [],
            tags: [
                ...tags,
                `tool:${toolName}`,
                `domain:${domain}`,
                `environment:${environment}`,
                `severity:${severity}`
            ],
            domain,
            environment,
            severity
        };
        return await this.adapter.storeIncidentMemory(memory);
    }
    async searchToolIncidents(query, domainFilter, limit = 5) {
        await this.initialize();
        return await this.adapter.searchIncidents(query, domainFilter, limit);
    }
    async isMemoryAvailable() {
        await this.initialize();
        return await this.adapter.isMemoryAvailable();
    }
}
