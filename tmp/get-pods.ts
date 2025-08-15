#!/usr/bin/env tsx
import { ReadOpsTools } from '../src/tools/read-ops/index.js';
import { OpenShiftClient } from '../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';
import { MockOpenShiftClient } from '../tests/mocks/mock-openshift-client';

async function main() {
  const ns = process.argv[2];
  const selector = process.argv[3];
  const oc = process.env.USE_MOCK_OC
    ? (new MockOpenShiftClient() as any)
    : new OpenShiftClient({ ocPath: process.env.OC_PATH || 'oc', timeout: 30000 });
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });
  const tools = new ReadOpsTools(oc, memory);
  const res = await tools.executeTool('oc_read_get_pods', {
    namespace: ns,
    selector,
    sessionId: `read-${Date.now()}`
  });
  console.log(res);
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });
