import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

async function main() {
  const tool = new DiagnosticToolsV2({ getClusterInfo: async () => ({}) } as any, {} as any);
  const report = await tool.runClusterHealthFairComparison();
  console.log('=== CLUSTER HEALTH FAIR COMPARISON COMPLETE ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Cluster health fair comparison failed:', e); process.exit(1); });

