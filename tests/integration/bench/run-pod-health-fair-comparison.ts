import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

async function main() {
  const tool = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any, {} as any);
  const report = await tool.runPodHealthFairComparison();
  console.log('=== POD HEALTH FAIR COMPARISON COMPLETE ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Pod health fair comparison failed:', e); process.exit(1); });

