import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../../../src/tools/read-ops/index.js';

async function main() {
  // Minimal stubs; ReadOpsTools requires OpenShiftClient-like instance
  const openshiftClient: any = new (await import('../../../src/lib/openshift-client.js')).OpenShiftClient({ ocPath: 'oc', timeout: 10000 });
  const memoryManager: any = {
    storeConversation: async () => {},
  };
  const read = new ReadOpsTools(openshiftClient as any, memoryManager as any);

  const diag = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any, {} as any);
  const names = await (diag as any).listNamespacesByScope('all');
  const targets = names.slice(0, Math.min(20, names.length));

  const nsArg = targets.join(',');

  const tStart = Date.now();
  let apiCount = 0;
  for (const ns of targets) {
    const res = JSON.parse(await (read as any).executeTool('oc_read_get_pods', { namespace: ns, sessionId: 'get-pods-trad' }));
    if (res && res.success !== false) apiCount += 1;
  }
  const traditionalTime = Date.now() - tStart;

  const bStart = Date.now();
  const batched = JSON.parse(await (read as any).executeTool('oc_read_get_pods', { namespace: nsArg, sessionId: 'get-pods-batch' }));
  const bulkTime = Date.now() - bStart;

  const perNsTrad = Math.round(traditionalTime / Math.max(1, targets.length));
  const perNsBulk = Math.round(bulkTime / Math.max(1, targets.length));
  const imp = Math.round(((traditionalTime - bulkTime) / Math.max(1, traditionalTime)) * 100);

  console.log('=== GET PODS FAIR COMPARISON ===');
  console.log(`Namespaces: ${targets.length}`);
  console.log(`Traditional: ${traditionalTime}ms (${perNsTrad}ms/ns), API calls: ${apiCount}`);
  console.log(`Batched: ${bulkTime}ms (${perNsBulk}ms/ns), API calls: ${batched.apiCalls}`);
  console.log(`Improvement: ${imp}%`);
  console.log(JSON.stringify({ namespaceCount: targets.length, traditionalTime, bulkTime, perNsTrad, perNsBulk, ops: { traditional: apiCount, batched: batched.apiCalls } }, null, 2));
}

main().catch(e => { console.error('get-pods fair comparison failed:', e); process.exit(1); });

