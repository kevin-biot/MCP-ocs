import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';

class SpyOpenShiftClient extends (OpenShiftClient as any) {
  public calls: Array<{ method: string; args: any }> = [];
  constructor() { super({ ocPath: 'oc', timeout: 1000 }); }
  async getPods(namespace?: string, selector?: string) {
    this.calls.push({ method: 'getPods', args: { namespace, selector } });
    return [];
  }
  async describeResource(resourceType: string, name: string, namespace?: string) {
    this.calls.push({ method: 'describeResource', args: { resourceType, name, namespace } });
    return 'ok';
  }
  async executeRawCommand(args: string[]) {
    this.calls.push({ method: 'executeRawCommand', args });
    // Simulate read-only machinesets list
    return JSON.stringify({ items: [] });
  }
}

describe('Boundary safety - oc_triage read-only', () => {
  test('uses only read operations and no mutation verbs', async () => {
    const oc = new SpyOpenShiftClient() as any as OpenShiftClient;
    const mem = { storeOperational: async () => 'ok' } as any as SharedMemoryManager;
    const tools = new DiagnosticToolsV2(oc, mem);

    const out = await tools.executeTool('oc_diagnostic_triage', { intent: 'ingress-pending', namespace: 'openshift-ingress' });
    const obj = JSON.parse(out);
    expect(obj.routing.bounded).toBe(true);

    const forbidden = ['apply','delete','scale','patch','edit','replace','cordon','drain','uncordon','annotate','label','taint','rollout'];
    for (const c of (oc as any).calls) {
      if (c.method === 'executeRawCommand') {
        const args = c.args.map((x: any)=> String(x).toLowerCase());
        expect(forbidden.some(f => args.includes(f))).toBe(false);
      }
    }
  });
});

