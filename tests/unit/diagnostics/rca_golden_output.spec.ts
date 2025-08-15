import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function json(obj: any) { return { stdout: JSON.stringify(obj) }; }

describe('RCA golden output JSON (mocked oc)', () => {
  test('deterministic structure with service_no_backends root cause', async () => {
    const mockOc: any = {
      executeOc: jest.fn(async (args: string[]) => {
        const cmd = args.join(' ');
        if (cmd.startsWith('cluster-info')) return { stdout: '' };
        if (cmd.startsWith('version')) return json({ serverVersion: { gitVersion: 'v1.28.0' } });
        if (cmd.startsWith('get nodes')) return json({ items: [{ status: { conditions: [{ type: 'Ready', status: 'True' }] }, metadata: { name: 'n1' } }] });
        if (cmd.startsWith('get storageclass')) return json({ items: [{ metadata: { name: 'sc1' } }] });
        if (cmd.startsWith('get pvc')) return json({ items: [] });
        if (cmd.startsWith('get services')) return json({ items: [ { metadata: { namespace: 'ns', name: 'svc1' } } ] });
        if (cmd.startsWith('get endpoints')) return json({ items: [] });
        if (cmd.startsWith('get routes')) return json({ items: [] });
        if (cmd.includes('get events')) return json({ items: [] });
        if (cmd.startsWith('get resourcequota') || cmd.startsWith('get limitrange')) return json({ items: [] });
        return { stdout: '' };
      })
    };

    const engine = new RCAChecklistEngine(mockOc, { storeToolExecution: jest.fn().mockResolvedValue(true) } as any);
    (engine as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', checks: { pods: { ready: 1, total: 1, crashloops: [] }, pvcs: { total: 0, bound: 0 }, routes: { total: 0 }, events: [] }, suspicions: [], timestamp: '', duration: 0, human: ''
    }) };

    const out = await engine.executeRCAChecklist({ namespace: 'ns', outputFormat: 'json' });
    expect(out.overallStatus).toBeDefined();
    expect(out.summary.totalChecks).toBeGreaterThan(0);
    expect(out.rootCause?.type).toBe('service_no_backends');
    expect(Array.isArray(out.checksPerformed)).toBe(true);
    // Structure keys present
    expect(out).toHaveProperty('reportId');
    expect(out).toHaveProperty('timestamp');
    expect(out).toHaveProperty('evidence');
  });
});
