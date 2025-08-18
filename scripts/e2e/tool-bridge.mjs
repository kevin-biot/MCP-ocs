// Tool bridge: execute LLM-declared tools via local registry (read-only)
import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry.ts';
import { OpenShiftClient } from '../../src/lib/openshift-client.ts';
import { SharedMemoryManager } from '../../src/lib/memory/shared-memory.ts';
import { DiagnosticToolsV2 } from '../../src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../../src/tools/read-ops/index.js';
import { StateMgmtTools } from '../../src/tools/state-mgmt/index.js';
import { InfrastructureTools } from '../../src/tools/infrastructure/index.js';

let REG = null;
async function getReg(){
  if (REG) return REG;
  const oc = new OpenShiftClient({ ocPath:'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
  const mem = new SharedMemoryManager({ domain:'mcp-ocs', namespace:'default', memoryDir: process.env.SHARED_MEMORY_DIR || './memory', enableCompression:true, retentionDays:30, chromaHost: process.env.CHROMA_HOST || '127.0.0.1', chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000 });
  try { await mem.initialize(); } catch {}
  const reg = new UnifiedToolRegistry();
  reg.registerSuite(new DiagnosticToolsV2(oc, mem));
  reg.registerSuite(new ReadOpsTools(oc, mem));
  reg.registerSuite(new StateMgmtTools(mem));
  reg.registerSuite(new InfrastructureTools(oc, mem));
  REG = reg;
  return REG;
}

export async function executeTool(name, args){
  try {
    const reg = await getReg();
    const res = await reg.executeTool(name, args || {});
    return { ok: true, data: res };
  } catch (e) {
    return { ok: false, data: { error: String(e?.message||e) } };
  }
}

