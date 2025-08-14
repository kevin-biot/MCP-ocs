import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

// Simulated integration behavior with controlled stubs
describe('cluster_health integration-like behavior', () => {
  test('produces prioritization and summaries fields in response', async () => {
    const fakeOpenShiftClient: any = { getClusterInfo: jest.fn().mockResolvedValue({ status: 'connected', version: '1', currentUser: 'u', serverUrl: 's' }) };
    const tool = new DiagnosticToolsV2(fakeOpenShiftClient, {} as any);
    (tool as any).memoryGateway = { storeToolExecution: jest.fn().mockResolvedValue(undefined) };
    (tool as any).analyzeNodeHealth = jest.fn().mockResolvedValue({ total: 1, ready: 1, issues: [] });
    (tool as any).analyzeOperatorHealth = jest.fn().mockResolvedValue({ total: 1, degraded: [] });
    (tool as any).ocWrapperV2 = { executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ items: [
      { metadata: { name: 'default' } }, { metadata: { name: 'kube-system' } }
    ] }) }) };
    (tool as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', timestamp: Date.now(), duration: 1,
      checks: { pods: { total: 1, ready: 1, crashloops: 0, pending: 0, imagePullErrors: 0 }, pvcs: { total: 0, bound: 0, errors: 0 }, routes: { total: 0 }, events: [] },
      suspicions: [], human: ''
    }) };

    const json = await (tool as any).enhancedClusterHealth({
      sessionId: 't', includeNamespaceAnalysis: true,
      namespaceScope: 'all', depth: 'summary', focusStrategy: 'auto', maxNamespacesToAnalyze: 1
    });

    const res = JSON.parse(json);
    expect(res.namespacePrioritization).toBeDefined();
    expect(res.userNamespaces).toBeDefined();
    expect(res.userNamespaces.totalNamespaces).toBe(2);
  });
});

