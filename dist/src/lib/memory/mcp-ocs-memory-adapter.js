/// <reference path="./mcp-files-shim.d.ts" />
// @ts-ignore: external module provided by MCP-files repo
import { ChromaMemoryManager } from '../../../MCP-files/src/memory-extension.ts';
export class MCPOcsMemoryAdapter {
    memoryManager;
    constructor(memoryDir) {
        this.memoryManager = new ChromaMemoryManager(memoryDir);
    }
    async initialize() {
        await this.memoryManager.initialize();
    }
    async storeIncidentMemory(memory) {
        const mcpMemory = {
            sessionId: memory.sessionId,
            timestamp: memory.timestamp,
            userMessage: memory.userMessage,
            assistantResponse: memory.assistantResponse,
            context: memory.context,
            tags: [
                ...memory.tags,
                `domain:${memory.domain}`,
                `environment:${memory.environment}`,
                `severity:${memory.severity}`,
                `resource:${memory.resourceType || 'unknown'}`
            ]
        };
        return await this.memoryManager.storeConversation(mcpMemory);
    }
    async searchIncidents(query, domainFilter, limit = 5) {
        const results = await this.memoryManager.searchRelevantMemories(query, undefined, limit);
        if (domainFilter) {
            return results.filter((result) => result.metadata.tags?.includes(`domain:${domainFilter}`));
        }
        return results;
    }
    async generateStructuredIncidentResponse(query, sessionId) {
        const relevantMemories = await this.memoryManager.searchRelevantMemories(query, sessionId, 10);
        const relatedIncidents = relevantMemories.map((result) => ({
            sessionId: result.metadata.sessionId,
            timestamp: result.metadata.timestamp,
            summary: `User: ${result.metadata.userMessage}\nAssistant: ${result.metadata.assistantResponse}`,
            tags: result.metadata.tags,
            distance: result.distance
        }));
        return {
            summary: `Based on ${relevantMemories.length} similar incidents`,
            relatedIncidents,
            rootCauseAnalysis: this.generateRootCauseAnalysis(relevantMemories),
            recommendations: this.extractRecommendations(relevantMemories),
            severitySummary: this.classifyAggregateSeverity(relevantMemories)
        };
    }
    generateRootCauseAnalysis(memories) {
        const text = memories
            .map((m) => `${m?.metadata?.userMessage || ''} ${m?.metadata?.assistantResponse || ''}`)
            .join(' ')
            .toLowerCase();
        if (text.includes('oom') || text.includes('out of memory')) {
            return 'Likely OOM conditions causing restarts; check limits/requests and memory leaks.';
        }
        if (text.includes('crashloop') || text.includes('crashloopbackoff')) {
            return 'Pod restart loop suggests startup/config issues or insufficient resources.';
        }
        if (text.includes('image') || text.includes('pull backoff')) {
            return 'Image pull/configuration problems; verify registry access and image references.';
        }
        if (text.includes('timeout') || text.includes('unreachable')) {
            return 'Network/API timeout symptoms; check service endpoints and cluster networking.';
        }
        if (text.includes('quota') || text.includes('limitexceeded')) {
            return 'Quota or limit exceeded; adjust namespace quotas or workload settings.';
        }
        return 'Common patterns suggest resource allocation or configuration issues.';
    }
    extractRecommendations(memories) {
        const tags = new Set();
        for (const m of memories) {
            const mtags = this.normalizeTags(m?.metadata?.tags);
            mtags.forEach((t) => tags.add(t));
        }
        const recs = new Set();
        const hasOpenShift = Array.from(tags).some(t => t.startsWith('domain:openshift'));
        const hasK8s = Array.from(tags).some(t => t.startsWith('domain:kubernetes'));
        const hasPod = Array.from(tags).some(t => t.startsWith('resource:pod'));
        if (hasOpenShift && hasPod) {
            recs.add('Check pod logs: oc logs -n <namespace> <pod>');
            recs.add('Describe the pod: oc describe pod -n <namespace> <pod>');
            recs.add('Inspect events: oc get events -A --sort-by=.lastTimestamp');
        }
        if (hasK8s && hasPod) {
            recs.add('Check pod logs: kubectl logs -n <namespace> <pod>');
            recs.add('Describe the pod: kubectl describe pod -n <namespace> <pod>');
            recs.add('Inspect events: kubectl get events -A --sort-by=.lastTimestamp');
        }
        recs.add('Verify resource limits/requests for affected workloads');
        recs.add('Review recent deployments/rollouts for regressions');
        recs.add('Check node health and capacity in the target cluster');
        return Array.from(recs);
    }
    classifyAggregateSeverity(memories) {
        const order = ['low', 'medium', 'high', 'critical'];
        let maxIndex = 0;
        for (const m of memories) {
            const tags = this.normalizeTags(m?.metadata?.tags);
            for (const t of tags) {
                if (t.startsWith('severity:')) {
                    const sev = t.split(':')[1];
                    const idx = sev ? order.indexOf(sev) : -1;
                    if (idx > maxIndex)
                        maxIndex = idx;
                }
            }
        }
        return order[maxIndex];
    }
    normalizeTags(raw) {
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.filter((t) => typeof t === 'string');
        if (typeof raw === 'string')
            return raw.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    }
    async isMemoryAvailable() {
        return await this.memoryManager.isAvailable();
    }
}
