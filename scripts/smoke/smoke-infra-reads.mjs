#!/usr/bin/env node
import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry.js';
import { OpenShiftClient } from '../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../src/lib/memory/shared-memory.js';
import { InfrastructureTools } from '../../src/tools/infrastructure/index.js';

async function main(){
  const sessionId = `infra-smoke-${Date.now()}`;
  const oc = new OpenShiftClient({ ocPath: 'oc', timeout: Number(process.env.OC_TIMEOUT_MS || 5000) });
  const mem = new SharedMemoryManager({ domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory' });
  try { await mem.initialize(); } catch {}
  const reg = new UnifiedToolRegistry();
  reg.registerSuite(new InfrastructureTools(oc, mem));

  const flags = { sessionId, bounded: true };
  const nodes = await reg.executeTool('oc_read_nodes', flags);
  const sets  = await reg.executeTool('oc_read_machinesets', { ...flags, namespace: 'openshift-machine-api' });
  console.log(JSON.stringify({ nodes: JSON.parse(nodes), machinesets: JSON.parse(sets) }, null, 2));
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });

