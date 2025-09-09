import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

async function main() {
  const ns = process.env.NAMESPACE || 'openshift-pipelines';
  const tool = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any, {} as any);
  console.log(`[Density Investigation] Namespace: ${ns}`);
  const result = await tool.profilePodDensity(ns);
  console.log(`Pod count: ${result.podCount}`);
  console.log(`Timings -> API: ${result.timings.api}ms, Parse: ${result.timings.parse}ms, Analysis: ${result.timings.analysis}ms, Total: ${result.timings.total}ms`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => { console.error('Density investigation failed:', e); process.exit(1); });

