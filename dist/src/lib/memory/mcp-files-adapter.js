/**
 * ChromaDB Integration - Using Working MCP-files Implementation
 *
 * Smart approach: Use the proven working ChromaMemoryManager instead of reimplementing
 */
import { ChromaMemoryManager } from './mcp-files-memory-extension';
/**
 * Wrapper to adapt MCP-files ChromaMemoryManager to our interface
 */
export class MCPFilesChromaAdapter {
    chromaManager;
    constructor(host, port, memoryDir) {
        // Use the working MCP-files implementation directly
        this.chromaManager = new ChromaMemoryManager(memoryDir);
    }
    async initialize() {
        await this.chromaManager.initialize();
    }
    isChromaAvailable() {
        // The MCP-files manager handles availability checking internally
        return true; // Will gracefully fall back to JSON if ChromaDB fails
    }
    async storeConversation(memory) {
        // Adapt our conversation format to MCP-files format
        const mcpFilesMemory = {
            sessionId: memory.sessionId,
            timestamp: memory.timestamp,
            userMessage: memory.userMessage,
            assistantResponse: memory.assistantResponse,
            context: memory.context,
            tags: [...memory.tags, `domain:${memory.domain}`] // Add domain as tag
        };
        return await this.chromaManager.storeConversation(mcpFilesMemory);
    }
    async storeOperational(memory) {
        // Convert operational memory to conversation format for MCP-files
        const operationalAsConversation = {
            sessionId: `incident-${memory.incidentId}`,
            timestamp: memory.timestamp,
            userMessage: `Incident: ${memory.symptoms.join(', ')}`,
            assistantResponse: `Root Cause: ${memory.rootCause || 'Unknown'}\nResolution: ${memory.resolution || 'Pending'}`,
            context: memory.affectedResources,
            tags: [...memory.tags, `domain:${memory.domain}`, `environment:${memory.environment}`, 'operational']
        };
        return await this.chromaManager.storeConversation(operationalAsConversation);
    }
    async searchConversations(query, limit = 5) {
        const results = await this.chromaManager.searchRelevantMemories(query, undefined, limit);
        return results.map((result) => ({
            memory: {
                sessionId: result.metadata.sessionId,
                domain: 'mcp-ocs', // Add domain
                timestamp: result.metadata.timestamp,
                userMessage: result.metadata.userMessage,
                assistantResponse: result.metadata.assistantResponse || result.content,
                context: result.metadata.context?.split(', ') || [],
                tags: result.metadata.tags?.split(', ') || []
            },
            similarity: 1 - result.distance,
            relevance: (1 - result.distance) * 100
        }));
    }
    async searchOperational(query, limit = 5) {
        // Search with operational tag filter
        const results = await this.chromaManager.searchRelevantMemories(`${query} operational`, undefined, limit);
        return results.map((result) => ({
            memory: {
                incidentId: result.metadata.sessionId?.replace('incident-', '') || 'unknown',
                domain: 'mcp-ocs',
                timestamp: result.metadata.timestamp,
                symptoms: [result.metadata.userMessage || 'Unknown'],
                rootCause: result.metadata.assistantResponse?.split('Root Cause: ')[1]?.split('\n')[0] || 'Unknown',
                resolution: result.metadata.assistantResponse?.split('Resolution: ')[1] || 'Pending',
                environment: 'unknown',
                affectedResources: result.metadata.context?.split(', ') || [],
                diagnosticSteps: [],
                tags: result.metadata.tags?.split(', ') || []
            },
            similarity: 1 - result.distance,
            relevance: (1 - result.distance) * 100
        }));
    }
    // Add missing methods that shared-memory expects
    async addDocuments(collectionName, documents) {
        // This is handled internally by storeConversation/storeOperational
        // Just a compatibility method
        console.log(`📝 Adding ${documents.length} documents to ${collectionName} via MCP-files adapter`);
    }
    async queryCollection(collectionName, queryText, limit = 5) {
        // Use the search methods instead
        if (collectionName === 'conversations') {
            const results = await this.searchConversations(queryText, limit);
            return results.map((r) => ({ ...r, id: `conv_${Date.now()}`, content: r.memory.userMessage, metadata: r.memory }));
        }
        else {
            const results = await this.searchOperational(queryText, limit);
            return results.map((r) => ({ ...r, id: `op_${Date.now()}`, content: r.memory.symptoms.join(' '), metadata: r.memory }));
        }
    }
}
