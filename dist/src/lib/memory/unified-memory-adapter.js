import { promises as fs } from 'fs';
import path from 'path';
import { ChromaMemoryManager } from './chroma-memory-manager.js';
/**
 * UnifiedMemoryAdapter
 * Facade over ChromaMemoryManager so all code paths share one backend.
 */
export class UnifiedMemoryAdapter {
    chroma;
    memoryDir;
    available = false;
    convCollection;
    opCollection;
    toolExecCollection;
    constructor(config) {
        this.memoryDir = config.memoryDir;
        // Pass through optional host/port via env for Chroma manager
        try {
            if (config.chromaHost)
                process.env.CHROMA_HOST = String(config.chromaHost);
            if (typeof config.chromaPort === 'number')
                process.env.CHROMA_PORT = String(config.chromaPort);
        }
        catch { }
        const prefix = process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
        this.convCollection = `${prefix}conversations`;
        this.opCollection = `${prefix}operational`;
        this.toolExecCollection = `${prefix}tool_exec`;
        this.chroma = new ChromaMemoryManager(config.memoryDir);
    }
    async initialize() {
        await this.chroma.initialize();
        try {
            // Chroma manager exposes availability synchronously after init
            const av = await this.chroma.isAvailable();
            this.available = !!av;
            // Phase 2: eagerly ensure collections exist to avoid first-write races
            if (this.available) {
                try {
                    await this.chroma.createCollection(this.convCollection);
                }
                catch { }
                try {
                    await this.chroma.createCollection(this.opCollection);
                }
                catch { }
                try {
                    await this.chroma.createCollection(this.toolExecCollection);
                }
                catch { }
            }
        }
        catch {
            this.available = false;
        }
    }
    isAvailable() { return this.available; }
    async storeConversation(data) {
        const tags = Array.isArray(data.tags) ? data.tags : [];
        await this.chroma.storeConversation({
            sessionId: data.sessionId,
            timestamp: data.timestamp,
            userMessage: data.userMessage,
            assistantResponse: data.assistantResponse,
            context: data.context,
            tags: [...tags, `domain:${data.domain}`]
        }, this.convCollection);
    }
    async storeOperational(data) {
        const assistant = `Root Cause: ${data.rootCause || 'Unknown'}\nResolution: ${data.resolution || 'Pending'}`;
        await this.chroma.storeConversation({
            sessionId: `incident-${data.incidentId}`,
            timestamp: data.timestamp,
            userMessage: `Incident: ${data.symptoms.join(', ')}`,
            assistantResponse: assistant,
            context: data.affectedResources,
            tags: [...data.tags, `domain:${data.domain}`, `environment:${data.environment}`, 'operational']
        }, this.opCollection);
    }
    async storeToolExecution(toolName, args, result, sessionId, tags = [], domain = 'mcp-ocs', environment = 'prod', severity = 'medium') {
        await this.chroma.storeConversation({
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
                `severity:${severity}`,
                'tool_execution'
            ]
        }, this.convCollection);
    }
    async searchRelevantMemories(query, options = {}) {
        const topK = options.topK ?? 5;
        const sessionId = options.sessionId;
        const results = await this.chroma.searchRelevantMemoriesInCollection(this.convCollection, query, sessionId, topK);
        return results;
    }
    async getStats() {
        const dir = this.memoryDir;
        const files = await fs.readdir(dir).catch(() => []);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const totalOperational = jsonFiles.filter(f => f.startsWith('incident-')).length;
        const totalConversations = jsonFiles.length - totalOperational;
        const chromaAvailable = await this.chroma.isAvailable();
        const storageUsed = await this.getDirectorySize(dir).then(this.formatBytes).catch(() => 'unknown');
        return { totalConversations: Math.max(0, totalConversations), totalOperational: Math.max(0, totalOperational), chromaAvailable, storageUsed };
    }
    async searchConversations(query, topK = 5) {
        const raw = await this.searchRelevantMemories(query, { topK });
        return raw.map((r) => {
            const meta = r?.metadata || {};
            const content = r?.content || '';
            const distance = typeof r?.distance === 'number' ? r.distance : undefined;
            return {
                memory: {
                    sessionId: meta.sessionId || 'unknown',
                    domain: meta.domain || 'mcp-ocs',
                    timestamp: meta.timestamp || Date.now(),
                    userMessage: typeof meta.userMessage === 'string' ? meta.userMessage : (content.split('\n')[0] || ''),
                    assistantResponse: typeof meta.assistantResponse === 'string' ? meta.assistantResponse : content,
                    context: this.normArray(meta.context),
                    tags: this.normArray(meta.tags)
                },
                similarity: typeof distance === 'number' ? (1 - distance) : (typeof r?.similarity === 'number' ? r.similarity : 0.5),
                relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof r?.relevance === 'number' ? r.relevance : 50)
            };
        });
    }
    async searchOperational(query, topK = 5) {
        // First try plain query to be JSON-friendly; then try with an operational hint
        let raw = await this.chroma.searchRelevantMemoriesInCollection(this.opCollection, query, undefined, topK);
        if (!raw || raw.length === 0) {
            raw = await this.searchRelevantMemories(`${query} operational`, { topK });
        }
        try {
            const filtered = raw.filter((r) => {
                const meta = r?.metadata || {};
                const tags = this.normArray(meta.tags);
                const hasIncident = !!meta.incidentId || (typeof meta.sessionId === 'string' && meta.sessionId.startsWith('incident-'));
                const hasOpTag = tags.includes('operational') || tags.includes('tool_execution');
                const hasRoot = typeof meta.assistantResponse === 'string' && meta.assistantResponse.includes('Root Cause:');
                return hasIncident || hasOpTag || hasRoot;
            });
            if (filtered.length > 0)
                raw = filtered;
        }
        catch { }
        return raw.map((r) => {
            const meta = r?.metadata || {};
            const content = r?.content || '';
            const distance = typeof r?.distance === 'number' ? r.distance : undefined;
            const affected = this.normArray(meta.affectedResources);
            const context = affected.length ? affected : this.normArray(meta.context);
            const assistant = typeof meta.assistantResponse === 'string' ? meta.assistantResponse : '';
            const root = (assistant.split('Root Cause: ')[1] || '').split('\n')[0] || (typeof meta.rootCause === 'string' ? meta.rootCause : 'Unknown');
            const resolution = (assistant.split('Resolution: ')[1] || '') || (typeof meta.resolution === 'string' ? meta.resolution : 'Pending');
            const rawId = (typeof meta.incidentId === 'string' ? meta.incidentId : (typeof meta.sessionId === 'string' ? meta.sessionId : 'unknown'));
            const incidentId = String(rawId).replace(/^incident-/, '');
            const tags = this.normArray(meta.tags);
            const envFromMeta = typeof meta.environment === 'string' ? meta.environment : undefined;
            const envFromTag = (tags.find(t => t.startsWith('environment:')) || '').split(':')[1];
            const envCandidate = (envFromMeta || envFromTag || '').toLowerCase();
            const environment = ['dev', 'test', 'staging', 'prod'].includes(envCandidate)
                ? envCandidate
                : 'prod';
            const domainFromTag = (tags.find(t => t.startsWith('domain:')) || '').split(':')[1];
            const domain = meta.domain || domainFromTag || 'mcp-ocs';
            const firstLine = (content.split('\n')[0] || '').replace(/^User:\s*/, '');
            const symptomText = firstLine.replace(/^Incident:\s*/, '');
            return {
                memory: {
                    incidentId,
                    domain,
                    timestamp: meta.timestamp || Date.now(),
                    symptoms: [typeof meta.userMessage === 'string' ? meta.userMessage : (symptomText || 'Unknown')],
                    rootCause: root,
                    resolution,
                    environment,
                    affectedResources: context,
                    diagnosticSteps: [],
                    tags
                },
                similarity: typeof distance === 'number' ? (1 - distance) : (typeof r?.similarity === 'number' ? r.similarity : 0.5),
                relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof r?.relevance === 'number' ? r.relevance : 50)
            };
        });
    }
    normArray(raw) {
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.filter((t) => typeof t === 'string');
        if (typeof raw === 'string')
            return raw.split(/,\s*/).filter(Boolean);
        return [];
    }
    async getDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const items = await fs.readdir(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                totalSize += stats.isDirectory() ? await this.getDirectorySize(itemPath) : stats.size;
            }
        }
        catch { }
        return totalSize;
    }
    formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
}
