import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function json(obj: any) { return { stdout: JSON.stringify(obj) }; }

describe('RCA end-to-end (mocked oc + memory)', () => {
  test('JSON-only output, service_no_backends rootCause, memory tags include root_cause', async () => {
    // Mock oc wrapper with minimal responses for each step
    const mockOc: any = {
      executeOc: jest.fn(async (args: string[]) => {
        const cmd = args.join(' ');
        if (cmd.startsWith('cluster-info')) return { stdout: '' };
        if (cmd.startsWith('version')) return json({ serverVersion: { gitVersion: 'v1.29.0' } });
        if (cmd.startsWith('get nodes')) return json({ items: [{ status: { conditions: [{ type: 'Ready', status: 'True' }] }, metadata: { name: 'n1' } }] });
        if (cmd.startsWith('get storageclass')) return json({ items: [{ metadata: { name: 'sc1' }, metadata2: {} }] });
        if (cmd.startsWith('get pvc -o json')) return json({ items: [] }); // namespace
        if (cmd.startsWith('get pvc -A')) return json({ items: [] });
        if (cmd.startsWith('get services')) return json({ items: [
          { metadata: { namespace: 'ns', name: 'svc-ok' } },
          { metadata: { namespace: 'ns', name: 'svc-missing' } }
        ] });
        if (cmd.startsWith('get endpoints')) return json({ items: [
          { metadata: { namespace: 'ns', name: 'svc-ok' }, subsets: [{ addresses: [{ ip: '10.0.0.1' }] }] }
          // svc-missing has no endpoints
        ] });
        if (cmd.startsWith('get routes')) return json({ items: [] });
        if (cmd.includes('get events')) return json({ items: [
          { type: 'Warning', reason: 'BackOff', involvedObject: { kind: 'Pod', name: 'x' } }
        ] });
        if (cmd.startsWith('get resourcequota') || cmd.startsWith('get limitrange')) return json({ items: [] });
        return { stdout: '' };
      })
    };

    const mockMem = { storeToolExecution: jest.fn().mockResolvedValue(true) } as any;

    const engine = new RCAChecklistEngine(mockOc, mockMem);
    // Namespace health is handled by a separate checker; stub it to prevent deeper oc calls
    (engine as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', checks: { pods: { ready: 1, total: 1, crashloops: [] }, pvcs: { total: 0, bound: 0 }, routes: { total: 0 }, events: [] }, suspicions: [], timestamp: '', duration: 0, human: ''
    }) };

    const res = await engine.executeRCAChecklist({ namespace: 'ns', outputFormat: 'json', includeDeepAnalysis: false });
    expect(res.rootCause).toBeDefined();
    expect(res.rootCause!.type).toBe('service_no_backends');
    expect((res as any).markdown).toBeUndefined();

    // memory storage called with tag root_cause:service_no_backends
    expect(mockMem.storeToolExecution).toHaveBeenCalled();
    const tags = mockMem.storeToolExecution.mock.calls[0][4] as string[];
    expect(tags.some((t: string) => t === 'root_cause:service_no_backends')).toBe(true);
  });
});

