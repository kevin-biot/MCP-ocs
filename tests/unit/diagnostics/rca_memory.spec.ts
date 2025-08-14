import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

describe('RCA memory integration', () => {
  test('stores RCA results via ToolMemoryGateway', async () => {
    const mockOc: any = {
      executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ items: [] }) })
    };
    const mockMem = { storeToolExecution: jest.fn().mockResolvedValue(true) } as any;

    const engine = new RCAChecklistEngine(mockOc, mockMem);
    // Stub namespace health checker to avoid deep oc calls
    (engine as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', checks: { pods: { ready: 0, total: 0, crashloops: [] }, pvcs: { total: 0, bound: 0 }, routes: { total: 0 }, events: [] }, suspicions: [], timestamp: '', duration: 0, human: ''
    }) };

    const res = await engine.executeRCAChecklist({ namespace: 'ns', includeDeepAnalysis: false });
    expect(res.overallStatus).toBeDefined();
    expect(mockMem.storeToolExecution).toHaveBeenCalled();
  });
});

