import { UnifiedToolRegistry } from '../dist/src/lib/tools/tool-registry.js';
import { DiagnosticToolsV2 } from '../dist/src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../dist/src/tools/read-ops/index.js';
import { StateMgmtTools } from '../dist/src/tools/state-mgmt/index.js';
import { OpenShiftClient } from '../dist/src/lib/openshift-client.js';
import { SharedMemoryManager } from '../dist/src/lib/memory/shared-memory.js';

// Configure unified collection mode and safety
process.env.UNIFIED_MEMORY = 'true';
process.env.CHROMA_HOST = process.env.CHROMA_HOST || '127.0.0.1';
process.env.CHROMA_PORT = process.env.CHROMA_PORT || '8000';
process.env.CHROMA_TENANT = process.env.CHROMA_TENANT || 'mcp-ocs';
process.env.CHROMA_DATABASE = process.env.CHROMA_DATABASE || 'prod';
process.env.CHROMA_COLLECTION = process.env.CHROMA_COLLECTION || 'ocs_memory_v2';
process.env.INSTRUMENT_ALLOWLIST = process.env.INSTRUMENT_ALLOWLIST || 'oc_read_get_pods,oc_diagnostic_cluster_health';
process.env.ENABLE_INSTRUMENTATION = 'true';
process.env.ENABLE_VECTOR_WRITES = 'true';
process.env.STRICT_STDIO_LOGS = 'true';

// Avoid stdout spam from libs
console.log = () => {};

const oc = new OpenShiftClient({ ocPath: 'oc', timeout: process.env.OC_TIMEOUT_MS ? Number(process.env.OC_TIMEOUT_MS) : 30000 });
const memory = new SharedMemoryManager({
  domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
  enableCompression: true, retentionDays: 7,
  chromaHost: process.env.CHROMA_HOST, chromaPort: Number(process.env.CHROMA_PORT)
});
await memory.initialize();

const registry = new UnifiedToolRegistry();
const diag = new DiagnosticToolsV2(oc, memory);
const read = new ReadOpsTools(oc, memory);
const state = new StateMgmtTools(memory, /** @type {any} */({}));
registry.registerSuite(diag);
registry.registerSuite(read);
registry.registerSuite(state);

const session = `unified-${Date.now()}`;

// Writes (instrumented)
try { await registry.executeTool('oc_read_get_pods', { sessionId: session, namespace: 'openshift-ingress' }); } catch {}
try { await registry.executeTool('oc_diagnostic_cluster_health', { sessionId: session, bounded: true }); } catch {}

// Searches
const opSearch = await registry.executeTool('memory_search_operational', { sessionId: session, query: 'ingress or router or pods', limit: 5 });
const convSearch = await registry.executeTool('memory_search_conversations', { sessionId: session, query: 'Tool oc_read_get_pods', limit: 5 });
const incSearch = await registry.executeTool('memory_search_incidents', { sessionId: session, query: 'cluster health', limit: 5 });

const out = {
  mode: 'unified',
  collection: process.env.CHROMA_COLLECTION,
  session,
  operational: JSON.parse(opSearch),
  conversations: JSON.parse(convSearch),
  incidents: JSON.parse(incSearch),
};

// Print a single JSON object to stdout per process discipline
process.stdout.write(JSON.stringify(out, null, 2));

