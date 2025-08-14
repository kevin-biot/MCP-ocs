import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry';
import { ToolMaturity } from '../../src/types/tool-maturity';

describe('Beta Registry Filtering', () => {
  it('returns exactly 8 beta tools (PRODUCTION/BETA)', async () => {
    const reg = new UnifiedToolRegistry();
    // Register mocks for 8 validated tools
    const makeTool = (fullName: string) => ({
      name: fullName,
      fullName,
      description: 'mock',
      inputSchema: { type: 'object' },
      category: 'diagnostic' as const,
      version: 'v2' as const,
      execute: async () => JSON.stringify({ ok: true })
    });

    const validated = [
      'oc_diagnostic_cluster_health',
      'oc_diagnostic_rca_checklist',
      'oc_read_get_pods',
      'oc_read_describe',
      'oc_read_logs',
      'memory_store_operational',
      'memory_get_stats',
      'memory_search_operational'
    ];
    validated.forEach(name => reg.registerTool(makeTool(name)));

    // And a few non-validated tools (should be excluded)
    ['oc_diagnostic_pod_health', 'memory_search_conversations', 'core_workflow_state']
      .forEach(name => reg.registerTool(makeTool(name)));

    const beta = reg.getToolsByMaturity([ToolMaturity.PRODUCTION, ToolMaturity.BETA]);
    expect(beta.length).toBe(8);
  });
});
