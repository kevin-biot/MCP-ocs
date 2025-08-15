import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

// Minimal stubs for constructor deps
const fakeOpenShiftClient: any = { getClusterInfo: jest.fn().mockResolvedValue({ status: 'connected', version: 'v', currentUser: 'u', serverUrl: 's' }) };
const fakeMemory: any = {};

function makeTool(): any {
  const tool = new DiagnosticToolsV2(fakeOpenShiftClient, fakeMemory);
  // Stub memory gateway to avoid FS
  (tool as any).memoryGateway = { storeToolExecution: jest.fn().mockResolvedValue(undefined) };
  // Stub node/operator/system checks to keep deterministic
  (tool as any).analyzeNodeHealth = jest.fn().mockResolvedValue({ total: 3, ready: 3, issues: [] });
  (tool as any).analyzeOperatorHealth = jest.fn().mockResolvedValue({ total: 5, degraded: [] });
  return tool;
}

describe('cluster_health prioritization and focus', () => {
  test('scope filtering: system vs user vs all', async () => {
    const tool = makeTool();
    // Mock namespace listing
    (tool as any).ocWrapperV2 = { executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ items: [
      { metadata: { name: 'kube-system' } },
      { metadata: { name: 'openshift-apiserver' } },
      { metadata: { name: 'default' } },
      { metadata: { name: 'devops' } }
    ] }) }) };

    // Mock health checker with no issues
    (tool as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', timestamp: Date.now(), duration: 1,
      checks: { pods: { total: 1, ready: 1, crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { total: 0, bound: 0, errors: 0 }, routes: { total: 0 }, events: [] },
      suspicions: [], human: ''
    }) };

    const pAll = await (tool as any).prioritizeNamespaces({ scope: 'all', focusStrategy: 'none', maxDetailed: 2, depth: 'summary' });
    expect(pAll.prioritized.map((p: any) => p.namespace).sort()).toEqual(['default','devops','kube-system','openshift-apiserver'].sort());

    const pSys = await (tool as any).prioritizeNamespaces({ scope: 'system', focusStrategy: 'none', maxDetailed: 2, depth: 'summary' });
    expect(pSys.prioritized.map((p: any) => p.namespace).sort()).toEqual(['kube-system','openshift-apiserver'].sort());

    const pUser = await (tool as any).prioritizeNamespaces({ scope: 'user', focusStrategy: 'none', maxDetailed: 2, depth: 'summary' });
    expect(pUser.prioritized.map((p: any) => p.namespace).sort()).toEqual(['default','devops'].sort());
  });

  test('focus strategy boosts selected namespace', async () => {
    const tool = makeTool();
    (tool as any).ocWrapperV2 = { executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ items: [
      { metadata: { name: 'a' } }, { metadata: { name: 'b' } }
    ] }) }) };

    // Make "a" look noisy, but focus should still favor "b"
    const checkHealth = jest.fn()
      .mockResolvedValueOnce({ status: 'degraded', checks: { pods: { crashloops: 3, pending: 1, imagePullErrors: 1 }, pvcs: { errors: 0 }, routes: { total: 0 }, events: [] }, suspicions: ['x'] })
      .mockResolvedValueOnce({ status: 'healthy', checks: { pods: { crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { errors: 0 }, routes: { total: 0 }, events: [] }, suspicions: [] });
    (tool as any).namespaceHealthChecker = { checkHealth };

    const res = await (tool as any).prioritizeNamespaces({ scope: 'all', focusNamespace: 'b', focusStrategy: 'auto', maxDetailed: 1, depth: 'detailed' });
    expect(res.prioritized[0].namespace).toBe('b');
    expect(res.output.analyzedDetailedCount).toBe(1);
  });

  test('strategy weighting: events vs resourcePressure', async () => {
    const tool = makeTool();
    (tool as any).ocWrapperV2 = { executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ items: [
      { metadata: { name: 'events-heavy' } }, { metadata: { name: 'pressure-heavy' } }
    ] }) }) };

    const mockSeries = [
      { status: 'healthy', checks: { pods: { crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { errors: 0 }, events: new Array(5) }, suspicions: [] },
      { status: 'healthy', checks: { pods: { crashloops: 0, pending: 4, imagePullErrors: 0 }, pvcs: { errors: 3 }, events: [] }, suspicions: [] }
    ];
    const checkHealth = jest.fn().mockImplementation(async () => mockSeries.shift());
    (tool as any).namespaceHealthChecker = { checkHealth };

    const ev = await (tool as any).prioritizeNamespaces({ scope: 'all', focusStrategy: 'events', maxDetailed: 2, depth: 'summary' });
    expect(ev.prioritized[0].namespace).toBe('events-heavy');

    // reset sequence
    const mockSeries2 = [
      { status: 'healthy', checks: { pods: { crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { errors: 0 }, events: new Array(5) }, suspicions: [] },
      { status: 'healthy', checks: { pods: { crashloops: 0, pending: 4, imagePullErrors: 0 }, pvcs: { errors: 3 }, events: [] }, suspicions: [] }
    ];
    (tool as any).namespaceHealthChecker = { checkHealth: jest.fn().mockImplementation(async () => mockSeries2.shift()) };
    const rp = await (tool as any).prioritizeNamespaces({ scope: 'all', focusStrategy: 'resourcePressure', maxDetailed: 2, depth: 'summary' });
    expect(rp.prioritized[0].namespace).toBe('pressure-heavy');
  });
});

