import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function json(obj: any) { return { stdout: JSON.stringify(obj) }; }

describe('RCA memory tags include root_cause for image pull failures', () => {
  test('stores tag root_cause:image_pull_failures', async () => {
    const mockOc: any = {
      executeOc: jest.fn(async (args: string[]) => {
        const cmd = args.join(' ');
        if (cmd.startsWith('cluster-info')) return { stdout: '' };
        if (cmd.startsWith('version')) return json({ serverVersion: { gitVersion: 'v' } });
        if (cmd.startsWith('get nodes')) return json({ items: [{ status: { conditions: [{ type: 'Ready', status: 'True' }] }, metadata: { name: 'n1' } }] });
        if (cmd.includes('get events')) return json({ items: [
          { type: 'Warning', reason: 'ImagePullBackOff', involvedObject: { kind: 'Pod', name: 'x' } }
        ] });
        if (cmd.startsWith('get services')) return json({ items: [] });
        if (cmd.startsWith('get endpoints')) return json({ items: [] });
        if (cmd.startsWith('get routes')) return json({ items: [] });
        if (cmd.startsWith('get resourcequota') || cmd.startsWith('get limitrange')) return json({ items: [] });
        if (cmd.startsWith('get storageclass') || cmd.startsWith('get pvc')) return json({ items: [] });
        return { stdout: '' };
      })
    };
    const mockMem = { storeToolExecution: jest.fn().mockResolvedValue(true) } as any;
    const engine = new RCAChecklistEngine(mockOc, mockMem);
    (engine as any).namespaceHealthChecker = { checkHealth: jest.fn().mockResolvedValue({
      status: 'healthy', checks: { pods: { ready: 1, total: 1, crashloops: [] }, pvcs: { total: 0, bound: 0 }, routes: { total: 0 }, events: [] }, suspicions: [], timestamp: '', duration: 0, human: ''
    }) };
    const res = await engine.executeRCAChecklist({ namespace: 'ns', outputFormat: 'json' });
    expect(res.rootCause?.type).toBe('image_pull_failures');
    const tags = mockMem.storeToolExecution.mock.calls[0][4] as string[];
    expect(tags).toContain('root_cause:image_pull_failures');
  });
});
