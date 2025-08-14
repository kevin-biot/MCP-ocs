#!/usr/bin/env tsx
import { StateMgmtTools } from '../src/tools/state-mgmt/index.js';
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';

async function main() {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });
  const tools = new StateMgmtTools(memory, {} as any);
  const res = await tools.executeTool('memory_store_operational', {
    incidentId: 'demo-rca-1',
    symptoms: ['openshift-monitoring degraded', 'prometheus-k8s Pending'],
    rootCause: 'resource_pressure',
    resolution: 'increased namespace quotas; restarted pods',
    affectedResources: ['namespace/openshift-monitoring'],
    environment: 'prod',
    sessionId: 's1'
  });
  console.log(res);
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });

