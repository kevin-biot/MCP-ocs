// Controlled integration test for MCPOcsMemoryAdapter against a running Chroma v2 server.
// Run with: node --loader ts-node/esm tests/integration/adapter-chroma-integration.ts

import { MCPOcsMemoryAdapter } from '../../src/lib/memory/mcp-ocs-memory-adapter.ts';
import { ChromaMemoryManager as InternalCMM } from '../../src/lib/memory/mcp-files-memory-extension.ts';
import { nowEpoch } from '../../src/utils/time.js';

async function main() {
  const adapter = new MCPOcsMemoryAdapter('./memory');
  // Inject internal ChromaMemoryManager to avoid external MCP-files ESM TS resolution issues
  (adapter as any).memoryManager = new InternalCMM('./memory');
  console.log('Initializing adapter...');
  await adapter.initialize();

  const mem = {
    sessionId: `itest-${nowEpoch()}`,
    timestamp: nowEpoch(),
    userMessage: 'Pod entering CrashLoopBackOff after rollout',
    assistantResponse: 'Check logs, events, and resource limits',
    context: ['ns/default', 'deploy/example'],
    tags: ['itest'],
    domain: 'openshift',
    environment: 'dev',
    severity: 'high',
    resourceType: 'pod'
  } as any;

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
