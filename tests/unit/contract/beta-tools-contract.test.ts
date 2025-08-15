import { VALIDATED_TOOLS } from '../../../dist/src/registry/validated-tools.js';
import { ToolMaturity } from '../../../dist/src/types/tool-maturity.js';

describe('Beta tool contract', () => {
  it('validated tools set remains stable', () => {
    const names = Object.keys(VALIDATED_TOOLS).sort();
    const expected = [
      'memory_get_stats',
      'memory_search_operational',
      'memory_store_operational',
      'oc_diagnostic_cluster_health',
      'oc_diagnostic_rca_checklist',
      'oc_read_describe',
      'oc_read_get_pods',
      'oc_read_logs'
    ].sort();

    expect(names).toEqual(expected);

    // All validated tools must be production maturity
    for (const n of names) {
      expect(VALIDATED_TOOLS[n].maturity).toBe(ToolMaturity.PRODUCTION);
      expect(VALIDATED_TOOLS[n].mcpCompatible).toBe(true);
    }
  });
});
