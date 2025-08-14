import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';

// Lightweight stubs for dependencies
const fakeOpenShiftClient: any = { getClusterInfo: jest.fn().mockResolvedValue({ status: 'connected', version: 'v', currentUser: 'u', serverUrl: 's' }) };
const fakeMemory: any = { storeOperational: jest.fn().mockResolvedValue(undefined) };

function makeTool(): any {
  const t = new DiagnosticToolsV2(fakeOpenShiftClient, fakeMemory);
  // Avoid FS/Chroma writes
  (t as any).memoryGateway = { storeToolExecution: jest.fn().mockResolvedValue(undefined) };
  // Keep node/operator checks simple
  (t as any).analyzeNodeHealth = jest.fn().mockResolvedValue({ total: 1, ready: 1, issues: [] });
  (t as any).analyzeOperatorHealth = jest.fn().mockResolvedValue({ total: 1, degraded: [] });
  return t;
}

describe('pod_health discovery prioritization', () => {
  test('ranks problematic pods higher and respects maxPodsToAnalyze', async () => {
    const tool = makeTool();
    // Mock listNamespacesByScope -> 2 namespaces
    (tool as any).listNamespacesByScope = jest.fn().mockResolvedValue(['ns-a', 'ns-b']);
    // Mock ocWrapperV2.getPods returning two pods per ns
    (tool as any).ocWrapperV2 = {
      getPods: jest.fn(async (ns: string) => ({ items: ns === 'ns-a' ? [
        { metadata: { name: 'ok-a' }, status: { phase: 'Running', containerStatuses: [{ ready: true, restartCount: 0 }] } },
        { metadata: { name: 'crash-a' }, status: { phase: 'Running', containerStatuses: [{ ready: false, restartCount: 7, state: { waiting: { reason: 'CrashLoopBackOff' } } }] } }
      ] : [
        { metadata: { name: 'pending-b' }, status: { phase: 'Pending', containerStatuses: [{ ready: false, restartCount: 0 }] } },
        { metadata: { name: 'image-b' }, status: { phase: 'Running', containerStatuses: [{ ready: false, restartCount: 0, state: { waiting: { reason: 'ImagePullBackOff' } } }] } }
      ] }))
    };

    const res = await (tool as any).prioritizePods({ scope: 'all', focusStrategy: 'auto', depth: 'summary', maxDetailed: 2 });
    const names = res.prioritized.map((p: any) => `${p.namespace}/${p.name}`);
    expect(names[0]).toMatch(/crash-a|image-b|pending-b/); // one of problematic leads
    expect(res.detailed.length).toBeLessThanOrEqual(2);
  });
});

describe('pod_health specific pod mode', () => {
  test('returns health, events, and recommendations for a given pod', async () => {
    const tool = makeTool();
    // Stub analyze methods to avoid relying on cluster data
    (tool as any).analyzePodDetails = jest.fn().mockReturnValue({ issues: ['crashloop'], summary: 'Pod has crashloops' });
    (tool as any).analyzePodDependencies = jest.fn().mockResolvedValue({ services: [], configMaps: [], secrets: [] });
    (tool as any).analyzePodResources = jest.fn().mockResolvedValue({ limitsOk: false, suggestions: ['Increase memory limit'] });
    // Oc wrapper stubs
    (tool as any).ocWrapperV2 = {
      executeOc: jest.fn().mockResolvedValue({ stdout: JSON.stringify({ metadata: { name: 'my-pod' }, status: { containerStatuses: [] } }) }),
      getEvents: jest.fn().mockResolvedValue({ items: [ { type: 'Warning', reason: 'Killing', message: 'Container killed', involvedObject: { kind: 'Pod', name: 'my-pod' } } ] })
    };

    const json = await (tool as any).enhancedPodHealth({ sessionId: 's', namespace: 'ns', podName: 'my-pod', includeLogs: false });
    const res = JSON.parse(json);
    expect(res.tool).toBe('oc_diagnostic_pod_health');
    expect(res.namespace).toBe('ns');
    expect(res.podName).toBe('my-pod');
    expect(Array.isArray(res.events)).toBe(true);
    expect(res.health.issues).toContain('crashloop');
  });
});

