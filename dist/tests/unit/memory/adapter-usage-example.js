// Basic usage example for Phase 4 integration (not executed by default)
import { MCPOcsMemoryAdapter } from '@/lib/memory/mcp-ocs-memory-adapter';
export async function runAdapterDemo() {
    const adapter = new MCPOcsMemoryAdapter('./memory');
    await adapter.initialize();
    await adapter.storeIncidentMemory({
        sessionId: 'example-session',
        timestamp: Date.now(),
        userMessage: 'Pod crashloop on deployment X',
        assistantResponse: 'Investigate resource limits and recent rollouts',
        context: ['deployment/x', 'namespace/default'],
        tags: ['demo'],
        domain: 'openshift',
        environment: 'dev',
        severity: 'medium',
        resourceType: 'pod'
    });
    const result = await adapter.generateStructuredIncidentResponse('crashloop backoff', 'example-session');
    console.log('Demo structured response:', result.summary);
}
// Only run if executed directly (prevent jest from running it automatically)
if (process.env.RUN_ADAPTER_DEMO === '1') {
    runAdapterDemo().catch(err => {
        console.error('Demo failed:', err);
        process.exit(1);
    });
}
