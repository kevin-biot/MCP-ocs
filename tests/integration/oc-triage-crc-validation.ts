import { DiagnosticToolsV2 } from '../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../src/lib/memory/shared-memory.js';
import { nowEpoch } from '../../src/utils/time.js';

async function main() {
  const namespace = process.env.NAMESPACE || 'student03';
  const intents: Array<'pvc-binding'|'scheduling-failures'|'ingress-pending'> = [
    'pvc-binding',
    'scheduling-failures',
    'ingress-pending'
  ];

  const openshiftClient = new OpenShiftClient({ ocPath: 'oc', timeout: 30000 });
  const sharedMemory = new SharedMemoryManager({
    domain: 'mcp-ocs',
    namespace: 'default',
    memoryDir: process.env.SHARED_MEMORY_DIR || './memory',
    enableCompression: true,
    retentionDays: 7,
    chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
    chromaPort: process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000
  });
  try { await sharedMemory.initialize(); } catch {}

  const tools = new DiagnosticToolsV2(openshiftClient, sharedMemory);

  const results: any[] = [];
  for (const intent of intents) {
    const start = Date.now();
    let raw = '';
    try {
      raw = await tools.executeTool('oc_diagnostic_triage', { intent, namespace, sessionId: `triage-${intent}-${nowEpoch()}` });
    } catch (e) {
      const duration = Date.now() - start;
      console.error(`[TRIAGE][${intent}] ERROR after ${duration}ms:`, e instanceof Error ? e.message : String(e));
      results.push({ intent, duration, error: e instanceof Error ? e.message : String(e) });
      continue;
    }
    const duration = Date.now() - start;
    let obj: any;
    try { obj = JSON.parse(raw); } catch { obj = { raw }; }
    const completeness = Number(obj?.evidence?.completeness ?? 0);
    console.log(`[TRIAGE][${intent}] duration=${duration}ms completeness=${completeness.toFixed(2)} stepBudget=${obj?.routing?.stepBudget}`);
    results.push({ intent, duration, completeness, stepBudget: obj?.routing?.stepBudget, summary: obj?.summary });
  }

  // Pretty print summary and basic validations
  console.log('\nCluster Validation Summary:');
  for (const r of results) {
    if (r.error) {
      console.log(`- ${r.intent}: ERROR ${r.error}`);
      continue;
    }
    const perfOK = r.duration < 15000;
    const evOk = typeof r.completeness === 'number' && r.completeness >= 0 && r.completeness <= 1;
    console.log(`- ${r.intent}: ${perfOK ? 'OK' : 'SLOW'} (${r.duration}ms), completeness=${r.completeness?.toFixed?.(2)}`);
  }
}

main().catch(err => {
  console.error('CRC validation fatal error:', err);
  process.exit(1);
});
