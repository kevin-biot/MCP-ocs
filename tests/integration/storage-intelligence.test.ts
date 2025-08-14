import { describe, it, expect } from '@jest/globals';
import { WEEK1_STORAGE_TOOLS, WEEK1_SUCCESS_METRICS } from '../../src/tools/storage-intelligence/index';
import { StorageIntelligenceTools } from '../../src/tools/storage-intelligence/implementation-reference';

// Limited-scope integration checks; opt-in via env to avoid CI risk
const RUN_STORAGE_IT = process.env.STORAGE_INTELLIGENCE_IT === '1';
const d = RUN_STORAGE_IT ? describe : describe.skip;

d('Storage Intelligence Integration', () => {
  it('should expose registered Week 1 tools', () => {
    expect(WEEK1_STORAGE_TOOLS).toContain('oc_rca_storage_pvc_pending');
    expect(WEEK1_STORAGE_TOOLS).toContain('oc_analyze_namespace_storage_comprehensive');
  });

  it('should provide success metrics with expected targets', () => {
    expect(WEEK1_SUCCESS_METRICS.task13.targetScenario).toContain('student03');
    expect(WEEK1_SUCCESS_METRICS.task11.optimization).toContain('cost');
  });

  it('should execute PVC RCA through tools with mocked engine', async () => {
    const oc: any = { executeOc: async () => ({ stdout: '', stderr: '', duration: 1, cached: false }) };
    const memory: any = { storeOperational: async () => 'id-1' };
    const tools = new StorageIntelligenceTools(oc, memory);
    // @ts-ignore private field access for test
    jest.spyOn(tools['pvcRCAEngine'], 'analyzePVCBinding').mockResolvedValue(JSON.stringify({ analysisType: 'pvc_binding_rca' }));
    const result = await tools.execute({ sessionId: 's', namespace: 'n' });
    expect(JSON.parse(result).analysisType).toBe('pvc_binding_rca');
  });
});
