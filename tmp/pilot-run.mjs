import { getGlobalToolRegistry, UnifiedToolRegistry } from '../dist/src/lib/tools/tool-registry.js';
import { OpenShiftClient } from '../dist/src/lib/openshift-client.js';
import { SharedMemoryManager } from '../dist/src/lib/memory/shared-memory.js';
import { DiagnosticToolsV2 } from '../dist/src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../dist/src/tools/read-ops/index.js';
import { setupStrictStdio } from '../dist/src/utils/strict-stdio.js';

// Safety: zero-stdout discipline
setupStrictStdio(true);

// Configure pilot allowlist and safety flags
process.env.ENABLE_INSTRUMENTATION = process.env.ENABLE_INSTRUMENTATION ?? 'true';
process.env.ENABLE_VECTOR_WRITES = process.env.ENABLE_VECTOR_WRITES ?? 'true';
process.env.INSTRUMENT_ALLOWLIST = process.env.INSTRUMENT_ALLOWLIST || 'oc_read_get_pods,oc_diagnostic_cluster_health';
process.env.STRICT_STDIO_LOGS = 'true';

// Initialize clients and registry
const oc = new OpenShiftClient({ ocPath: 'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
const sharedMemory = new SharedMemoryManager({
  domain: 'mcp-ocs',
  namespace: 'default',
  memoryDir: process.env.SHARED_MEMORY_DIR || './memory',
  enableCompression: true,
  retentionDays: 30,
  chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
  chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000,
});
try { await sharedMemory.initialize(); } catch {}

const registry = new UnifiedToolRegistry();
const diag = new DiagnosticToolsV2(oc, sharedMemory);
const read = new ReadOpsTools(oc, sharedMemory);
registry.registerSuite(diag);
registry.registerSuite(read);

// Pilot executions (expanded namespaces)
const session = `pilot-${Date.now()}`;
const namespaces = ['default','kube-system','openshift-ingress','openshift-monitoring','student01'];
for (const ns of namespaces) {
  try { await registry.executeTool('oc_read_get_pods', { sessionId: session, namespace: ns }); } catch {}
}
try { await registry.executeTool('oc_diagnostic_cluster_health', { sessionId: session, bounded: true }); } catch {}

// No stdout output; metrics file can be inspected separately
