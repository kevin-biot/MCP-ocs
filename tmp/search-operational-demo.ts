#!/usr/bin/env node
import { StateMgmtTools } from '../src/tools/state-mgmt/index.js';
import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';

const query = process.argv[2] || 'openshift-monitoring degraded';

async function main() {
  const memory = new SharedMemoryManager({
    domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
    enableCompression: true, retentionDays: 7, chromaHost: '127.0.0.1', chromaPort: 8000
  });
  const tools = new StateMgmtTools(memory, {} as any);
  const res = await tools.executeTool('memory_search_operational', {
    query, limit: 5
  });
  console.log(res);
}

main().catch(err => { console.error(err?.message || err); process.exit(1); });
