import { ReadOpsTools } from '../../../src/tools/read-ops/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';

async function main() {
  const oc = new OpenShiftClient({ ocPath: 'oc', timeout: 10000 } as any);
  const read = new ReadOpsTools(oc as any, { storeConversation: async () => {} } as any);

  // Discover candidate pods across namespaces (Running preferred)
  const podsJson = await oc.executeRawCommand(['get', 'pods', '-A', '-o', 'json']);
  const pods = JSON.parse(podsJson).items || [];
  const candidates = pods
    .map((p: any) => ({ ns: p.metadata?.namespace, name: p.metadata?.name, phase: p.status?.phase }))
    .filter((p: any) => p.ns && p.name)
    .slice(0, 10);
  if (candidates.length === 0) {
    console.log('No pods found; exiting.');
    process.exit(0);
  }

  const lines = 50;

  // Sequential logs
  const tStart = Date.now();
  let ok = 0;
  for (const c of candidates) {
    const r = JSON.parse(await (read as any).executeTool('oc_read_logs', { podName: c.name, namespace: c.ns, lines, sessionId: 'logs-trad' }));
    if (r && r.logs) ok += 1;
  }
  const sequentialTime = Date.now() - tStart;

  // Batched logs
  const targetList = candidates.map(c => ({ podName: c.name, namespace: c.ns, lines }));
  const bStart = Date.now();
  const batched = JSON.parse(await (read as any).executeTool('oc_read_logs', { targetList, sessionId: 'logs-batch' }));
  const batchedTime = Date.now() - bStart;

  const improvement = Math.round(((sequentialTime - batchedTime) / Math.max(1, sequentialTime)) * 100);
  const okBatch = Array.isArray(batched?.items) ? batched.items.filter((x: any) => x.success).length : 0;

  console.log('=== LOGS FAIR COMPARISON ===');
  console.log(`Pods: ${candidates.length}`);
  console.log(`Sequential: ${sequentialTime}ms, OK: ${ok}`);
  console.log(`Batched: ${batchedTime}ms, OK: ${okBatch}`);
  console.log(`Improvement: ${improvement}%`);
  console.log(JSON.stringify({ count: candidates.length, sequentialTime, batchedTime, okSequential: ok, okBatched: okBatch, wallClockImprovement: improvement, timestamp: new Date().toISOString() }, null, 2));
}

main().catch(e => { console.error('Logs fair comparison failed:', e); process.exit(1); });

