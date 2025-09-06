/*
 Date-Time Safety Test Suite (TypeScript)
 Focus: ISO-8601 serialization and date validation behavior in key modules
 Note: These tests use lightweight stubs to isolate timestamp behavior.
*/

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const isISO = (s: unknown) => typeof s === 'string' && ISO_REGEX.test(s as string);

function makeMemorySink() {
  const ops: any[] = [];
  const conv: any[] = [];
  return {
    storeOperational: async (rec: any) => { ops.push(rec); },
    storeConversation: async (rec: any) => { conv.push(rec); },
    searchOperational: async () => [],
    getOps: () => ops,
    getConv: () => conv
  } as any;
}

describe('Date-Time Safety', () => {
  test('StateMgmtTools: emits ISO timestamps to memory stores', async () => {
    const { StateMgmtTools } = await import('../../src/tools/state-mgmt/index');
    const sink = makeMemorySink();
    const fakeWorkflow: any = { getState: async () => ({ state: 'resolving' }) };
    const tools = new StateMgmtTools(sink as any, fakeWorkflow);

    // Trigger memory_store_operational via executeTool
    const result = await (tools as any).storeIncident({
      incidentId: 't-1',
      symptoms: ['x'],
      environment: 'dev',
      sessionId: 's-1'
    });
    expect(typeof result).toBe('string');

    // Verify stored records have ISO timestamp
    const ops = sink.getOps();
    const conv = sink.getConv();
    expect(ops.length).toBeGreaterThan(0);
    expect(conv.length).toBeGreaterThan(0);
    expect(isISO(ops[0].timestamp)).toBe(true);
    expect(isISO(conv[0].timestamp)).toBe(true);
  });

  test('ReadOpsTools: conversations stored with ISO timestamps', async () => {
    const { ReadOpsTools } = await import('../../src/tools/read-ops/index');
    const sink = makeMemorySink();
    const fakeOc: any = {
      getPods: async () => ({ items: [] }),
      getLogs: async () => 'l1\nl2',
      describeResource: async () => ({})
    };
    const tools = new ReadOpsTools(fakeOc as any, sink as any);

    const res = await (tools as any).getPods('default', undefined, 'sess-1');
    expect(isISO(res.timestamp)).toBe(true);

    // ensure conversation store is ISO
    const conv = sink.getConv();
    expect(conv.length).toBeGreaterThan(0);
    expect(isISO(conv[conv.length - 1].timestamp)).toBe(true);
  });

  test('EnhancedNamespaceHealthChecker: returns ISO timestamp and validates dates', async () => {
    const { EnhancedNamespaceHealthChecker } = await import('../../src/v2/tools/check-namespace-health/enhanced-index');
    const sink = makeMemorySink();
    const fakeOc: any = {
      validateNamespaceExists: async () => true,
      getPods: async () => ({ items: [] }),
      getEvents: async () => ({ items: [
        { type: 'Warning', lastTimestamp: 'not-a-date', reason: 'X', message: 'bad date', involvedObject: { kind: 'Pod', name: 'p' } },
        { type: 'Warning', lastTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), reason: 'Y', message: 'ok', involvedObject: { kind: 'Pod', name: 'q' } }
      ] }),
      getPVCs: async () => ({ items: [] }),
      getRoutes: async () => ({ items: [] }),
      getDeployments: async () => ({ items: [] })
    };
    const fakeInfraChecker: any = { checkInfrastructureCorrelation: async () => ({ ok: true }) };
    const checker = new EnhancedNamespaceHealthChecker(fakeOc as any, sink as any, fakeInfraChecker as any);

    const res = await checker.checkHealth({ namespace: 'default', sessionId: 's-1', includeIngressTest: false, includeInfrastructureCorrelation: false });
    expect(isISO(res.timestamp)).toBe(true);
    expect(typeof res.duration).toBe('number');
  });
});

