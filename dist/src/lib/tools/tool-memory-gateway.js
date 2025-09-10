import { MCPOcsMemoryAdapter } from '../memory/mcp-ocs-memory-adapter.js';
import { UnifiedMemoryAdapter } from '../memory/unified-memory-adapter.js';
import { FEATURE_FLAGS } from '../config/feature-flags.js';
export class ToolMemoryGateway {
    adapter;
    initialized = false;
    constructor(memoryDir = './memory') {
        if (FEATURE_FLAGS.UNIFIED_MEMORY) {
            this.adapter = new UnifiedMemoryAdapter({ memoryDir });
        }
        else {
            this.adapter = new MCPOcsMemoryAdapter(memoryDir);
        }
    }
    async initialize() {
        if (this.initialized)
            return;
        // @ts-ignore - both adapters expose initialize
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
        if (this.adapter instanceof UnifiedMemoryAdapter) {
            await this.adapter.storeToolExecution(toolName, args, result, sessionId, tags, domain, environment, severity);
            return true;
        }
        return await this.adapter.storeIncidentMemory(memory);
    }
    async searchToolIncidents(query, domainFilter, limit = 5) {
        await this.initialize();
        if (this.adapter instanceof UnifiedMemoryAdapter) {
            const results = await this.adapter.searchOperational(query, limit);
            if (domainFilter) {
                return results.filter(r => (r?.memory?.domain || '').toLowerCase() === domainFilter.toLowerCase());
            }
            return results;
        }
        return await this.adapter.searchIncidents(query, domainFilter, limit);
    }
    async isMemoryAvailable() {
        await this.initialize();
        if (this.adapter instanceof UnifiedMemoryAdapter) {
            return !!(await this.adapter.isAvailable());
        }
        return await this.adapter.isMemoryAvailable();
    }
}
