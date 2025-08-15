#!/usr/bin/env tsx
import { ReadOpsTools } from '../src/tools/read-ops/index.js';
import { OpenShiftClient } from '../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';

async function main() {
  const query = process.argv[2] || 'storage provisioner unreachable';
  const oc = new OpenShiftClient({ ocPath: process.env.OC_PATH || 'oc', timeout: 30000 });
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });
  const tools = new ReadOpsTools(oc, memory);
  const res = await tools.executeTool('memory_search_incidents', {
    query,
    domainFilter: 'openshift',
    limit: 5,
    sessionId: `read-${Date.now()}`
  });
  console.log(res);
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });

