import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';

async function countNamespaces(): Promise<number> {
  try {
    const { execSync } = await import('node:child_process');
    const out = execSync('oc get namespaces --no-headers | wc -l', { stdio: ['ignore','pipe','pipe'] }).toString().trim();
    return Number(out) || 0;
  } catch {
    return 0;
  }
}

async function runScenario(label: string, args: any) {
  const tool = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any as OpenShiftClient, {} as any as SharedMemoryManager);
  // Silence memory gateway writes during benchmark
  (tool as any).memoryGateway = { storeToolExecution: async () => undefined };

  const start = Date.now();
  try {
    const json = await (tool as any).enhancedClusterHealth(args);
    const dur = Date.now() - start;
    const obj = JSON.parse(json);
    const analyzed = Number(obj?.userNamespaces?.analyzedDetailedCount ?? 0);
    const total = Number(obj?.userNamespaces?.totalNamespaces ?? 0);
    const perf = obj?.performance || {};
    console.log(`=== ${label} ===`);
    console.log(`${label} duration: ${dur}ms`);
    console.log(`Namespaces analyzed: ${analyzed}`);
    console.log(`Total namespaces found: ${total}`);
    if (Object.keys(perf).length) console.log(`Performance: ${JSON.stringify(perf)}`);
    return { label, duration: dur, analyzed, total, perf, success: true };
  } catch (e: any) {
    const dur = Date.now() - start;
    console.log(`=== ${label} ERROR ===`);
    console.log(`Error: ${e?.message || String(e)}`);
    console.log(`Duration to failure: ${dur}ms`);
    return { label, duration: dur, analyzed: 0, total: 0, perf: {}, success: false, error: e?.message || String(e) };
  }
}

async function main() {
  const totalNamespaces = await countNamespaces();
  console.log(`Cluster namespaces (approx): ${totalNamespaces}`);

  const baseline = await runScenario('BASELINE (traditional)', {
    sessionId: 'perf-test-traditional',
    includeNamespaceAnalysis: true,
    maxNamespacesToAnalyze: 10,
    focusNamespace: 'default',
    namespaceScope: 'all'
  });

  const bulk = await runScenario('BULK (optimized)', {
    sessionId: 'perf-test-bulk',
    includeNamespaceAnalysis: true,
    maxNamespacesToAnalyze: 20,
    namespaceScope: 'all'
  });

  const stress = await runScenario('STRESS (50 namespaces)', {
    sessionId: 'perf-test-stress',
    includeNamespaceAnalysis: true,
    maxNamespacesToAnalyze: 50,
    namespaceScope: 'all'
  });

  const improvement = (baseline.success && bulk.success && baseline.duration > 0)
    ? Math.round(((baseline.duration - bulk.duration) / baseline.duration) * 100)
    : 0;

  const report = `# Namespace Optimization Performance Benchmark\n\n`+
    `## Environment\n- Total namespaces: ${totalNamespaces}\n- Tool: enhancedClusterHealth (includeNamespaceAnalysis)\n\n`+
    `## Results Summary\n\n`+
    `### Traditional Path (Baseline)\n- Duration: ${baseline.duration}ms\n- Namespaces analyzed: ${baseline.analyzed}\n- Status: ${baseline.success ? 'success' : 'failure'}\n\n`+
    `### Bulk Optimization Path\n- Duration: ${bulk.duration}ms\n- Namespaces analyzed: ${bulk.analyzed}\n- Improvement vs baseline: ${improvement}%\n- Performance: ${JSON.stringify(bulk.perf)}\n\n`+
    `### Stress Test (50 namespaces)\n- Duration: ${stress.duration}ms\n- Namespaces analyzed: ${stress.analyzed}\n- Status: ${stress.success ? 'success' : 'failure'}\n- Performance: ${JSON.stringify(stress.perf)}\n\n`+
    `## Conclusions\n- Improvement: ${baseline.duration}ms -> ${bulk.duration}ms (${improvement}% faster)\n- Scalability: ${stress.success ? 'OK' : 'Issues observed'}\n- Production readiness: ${bulk.success ? 'ready' : 'needs work'}\n`;

  console.log('\n===== BENCHMARK REPORT (markdown) =====\n');
  console.log(report);
}

main().catch(e => { console.error('Benchmark fatal error:', e); process.exit(1); });

