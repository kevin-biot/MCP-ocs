// Controlled adapter-only integration using compiled JS from dist.
// Usage:
//   1) Build: npm run build
//   2) Run:   node tests/integration/adapter-chroma-integration.mjs
import { MCPOcsMemoryAdapter } from '../../dist/src/lib/memory/mcp-ocs-memory-adapter.js';
import { ChromaMemoryManager as InternalCMM } from '../../dist/src/lib/memory/mcp-files-memory-extension.js';
async function main() {
    const adapter = new MCPOcsMemoryAdapter('./memory');
    // Use internal memory manager implementation compiled in dist
    adapter.memoryManager = new InternalCMM('./memory');
    console.log('Initializing adapter...');
    await adapter.initialize();
    const mem = {
        sessionId: `itest-${Date.now()}`,
        timestamp: Date.now(),
        userMessage: 'Pod entering CrashLoopBackOff after rollout',
        assistantResponse: 'Check logs, events, and resource limits',
        context: ['ns/default', 'deploy/example'],
        tags: ['itest'],
        domain: 'openshift',
        environment: 'dev',
        severity: 'high',
        resourceType: 'pod'
    };
    console.log('Storing incident memory...');
    const stored = await adapter.storeIncidentMemory(mem);
    console.log('Stored:', stored);
    console.log('Searching incidents (domain=openshift)...');
    const results = await adapter.searchIncidents('CrashLoopBackOff', 'openshift', 5);
    console.log('Search results count:', results.length);
    console.log('Generating structured response...');
    const structured = await adapter.generateStructuredIncidentResponse('CrashLoopBackOff', mem.sessionId);
    console.log('Summary:', structured.summary);
    console.log('Severity:', structured.severitySummary);
    console.log('OK');
}
main().catch(err => {
    console.error('Integration test failed:', err);
    process.exit(1);
});
