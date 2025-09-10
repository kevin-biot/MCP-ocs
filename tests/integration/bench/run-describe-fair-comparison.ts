import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { ReadOpsTools } from '../../../src/tools/read-ops/index.js';

async function main() {
  const diag = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any, {} as any);
  const OpenShiftClient = (await import('../../../src/lib/openshift-client.js')).OpenShiftClient;
  const oc = new OpenShiftClient({ ocPath: 'oc', timeout: 10000 } as any);
  const read = new ReadOpsTools(oc as any, { storeConversation: async () => {} } as any);

  // Choose a cluster-scoped type with consistent presence
  const type = 'clusteroperator';
  const ops = await oc.executeRawCommand(['get', 'clusteroperators', '-o', 'json']);
  const items = JSON.parse(ops).items || [];
  const targetNames = items.map((i: any) => i.metadata?.name).filter(Boolean).slice(0, 10);
  if (targetNames.length === 0) {
    console.log('No clusteroperators found; exiting.');
    process.exit(0);
  }

  // Sequential describes
  const tStart = Date.now();
  let ok = 0;
  const perItem: Array<{ name: string; timeMs: number }> = [];
  for (const n of targetNames) {
    const s = Date.now();
    const r = JSON.parse(await (read as any).executeTool('oc_read_describe', { resourceType: type, name: n, sessionId: 'describe-trad' }));
    const e = Date.now();
    if (r && r.description) ok += 1;
    perItem.push({ name: n, timeMs: e - s });
  }
  const sequentialTime = Date.now() - tStart;

  // Batched describes
  const bStart = Date.now();
  const batched = JSON.parse(await (read as any).executeTool('oc_read_describe', { resourceType: type, nameList: targetNames, sessionId: 'describe-batch' }));
  const batchedTime = Date.now() - bStart;
  const improvement = Math.round(((sequentialTime - batchedTime) / Math.max(1, sequentialTime)) * 100);

  console.log('=== DESCRIBE FAIR COMPARISON ===');
  console.log(`Resources: ${targetNames.length} ${type}`);
  console.log(`Sequential: ${sequentialTime}ms (${Math.round(sequentialTime/targetNames.length)}ms/item), OK: ${ok}`);
  console.log(`Batched: ${batchedTime}ms (${Math.round(batchedTime/targetNames.length)}ms/item), OK: ${Array.isArray(batched?.items) ? batched.items.filter((x:any)=>x.success).length : 0}`);
  console.log(`Improvement: ${improvement}%`);
  console.log(JSON.stringify({
    type,
    count: targetNames.length,
    sequentialTime,
    batchedTime,
    perItem,
    batchedOps: batched?.apiCalls ?? 0,
    wallClockImprovement: improvement,
    timestamp: new Date().toISOString()
  }, null, 2));
}

main().catch(e => { console.error('Describe fair comparison failed:', e); process.exit(1); });

