import { OrchestrationQueue, pvcTriageOrchestration, McpLikeClient } from '../../../src/lib/orchestration/queue';

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

class FakeMcp implements McpLikeClient {
  public calls: Array<{ tool: string; args: any; ts: number }>; 
  private active = 0;
  public peakActive = 0;
  constructor(private responders: Record<string, (args: any) => Promise<any>>) {
    this.calls = [];
  }
  async call(tool: string, args: any): Promise<any> {
    this.calls.push({ tool, args, ts: Date.now() });
    this.active += 1; this.peakActive = Math.max(this.peakActive, this.active);
    try {
      const fn = this.responders[tool];
      if (!fn) throw new Error(`No responder for ${tool}`);
      return await fn(args);
    } finally {
      this.active -= 1;
    }
  }
}

describe('OrchestrationQueue', () => {
  test('enqueue/wait runs in parallel', async () => {
    const mcp = new FakeMcp({
      A: async () => { await delay(50); return { ok: 'A' }; },
      B: async () => { await delay(50); return { ok: 'B' }; },
    });
    const q = new OrchestrationQueue(mcp, { timeMs: 500 });
    const t0 = Date.now();
    q.enqueue('A', 'A', {});
    q.enqueue('B', 'B', {});
    const res = await q.wait(['A', 'B']);
    const dt = Date.now() - t0;
    expect(res.A.ok).toBe('A');
    expect(res.B.ok).toBe('B');
    expect(dt).toBeLessThan(100 + 50); // well under sequential 100ms
  });

  test('fanout respects concurrency', async () => {
    const mcp = new FakeMcp({
      T: async () => { await delay(30); return { ok: true }; },
    });
    const q = new OrchestrationQueue(mcp, { timeMs: 1000, concurrency: 2 });
    const reqs = Array.from({ length: 6 }, () => ({ tool: 'T', args: {} }));
    await q.fanout('triage', reqs);
    expect(mcp.peakActive).toBeLessThanOrEqual(2);
  });

  test('cancel on threshold stops further work', async () => {
    const mcp = new FakeMcp({
      SLOW: async () => { await delay(100); return { ok: true }; },
    });
    const q = new OrchestrationQueue(mcp, { timeMs: 150, concurrency: 4, cancelUsageThreshold: 0.5 });
    const reqs = Array.from({ length: 10 }, () => ({ tool: 'SLOW', args: {} }));
    const t0 = Date.now();
    await q.fanout('triage', reqs);
    const dt = Date.now() - t0;
    expect(dt).toBeLessThan(300); // Should cancel around halfway
  });
});

describe('pvcTriageOrchestration', () => {
  test('merges signals and list, caps namespaces, and triages', async () => {
    const mcp = new FakeMcp({
      oc_diagnostic_cluster_health: async () => ({ signals: { pvcIssues: { namespaces: ['ns-a', 'ns-b'] } } }),
      oc_read_list_namespaces: async () => ({ data: { namespaces: [{ name: 'ns-b' }, { name: 'ns-c' }, { name: 'ns-d' }] } }),
      oc_diagnostic_triage: async (args) => ({ triaged: args.target?.selector?.names?.[0] }),
    });

    const result = await pvcTriageOrchestration(mcp, 's', { timeMs: 2000, concurrency: 3, namespaceLimit: 3 });
    const triaged = result.triage.map((r: any) => r.triaged).filter(Boolean).sort();
    expect(triaged).toEqual(expect.arrayContaining(['ns-a', 'ns-b']));
    expect(triaged.length).toBeGreaterThanOrEqual(2);
    expect(triaged.length).toBeLessThanOrEqual(3);
    const triageCalls = mcp.calls.filter(c => c.tool === 'oc_diagnostic_triage').length;
    expect(triageCalls).toBeGreaterThanOrEqual(2);
    expect(triageCalls).toBeLessThanOrEqual(3);
  });
});
