import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';

// Minimal fakes/mocks
class FakeOpenShiftClient extends (OpenShiftClient as any) {
  constructor() { super({ ocPath: 'oc', timeout: 1000 }); }
  async getPods(namespace?: string, selector?: string) {
    return [{ name: 'router-abc', namespace: namespace || 'openshift-ingress', status: 'Pending', ready: '0/1', restarts: 0, age: '1m' }];
  }
  async describeResource(resourceType: string, name: string, namespace?: string) {
    // Include tokens that evidence selectors look for
    return `Name: ${name}\nNamespace: ${namespace || 'default'}\nType: ${resourceType}\nReason: IngressController\nDeploymentRollingOut`;
  }
  async executeRawCommand(args: string[]) {
    // machinesets output structure
    return JSON.stringify({ items: [{ metadata: { name: 'ms-a' }, spec: { replicas: 2, template: { spec: { nodeSelector: { 'topology.kubernetes.io/zone': 'a' } } } } }] });
  }
}

describe('oc_triage Phase B', () => {
  const openshift = new FakeOpenShiftClient() as any as OpenShiftClient;
  const memory = { storeOperational: async () => 'ok' } as any as SharedMemoryManager;
  const tools = new DiagnosticToolsV2(openshift, memory);

  test('rejects invalid intent', async () => {
    await expect(tools.executeTool('oc_diagnostic_triage', { intent: 'bad-intent', namespace: 'ns1' }))
      .rejects.toThrow(/Unsupported or missing intent/);
  });

  test('maps intent to correct template id', async () => {
    const out = await tools.executeTool('oc_diagnostic_triage', { intent: 'ingress-pending', namespace: 'openshift-ingress' });
    const obj = JSON.parse(out);
    expect(obj.routing.intent).toBe('ingress-pending');
    expect(obj.routing.templateId).toBe('ingress-pending-v1');
  });

  test('builds TriageEnvelope with evidence completeness fields', async () => {
    const out = await tools.executeTool('oc_diagnostic_triage', { intent: 'ingress-pending', namespace: 'openshift-ingress' });
    const obj = JSON.parse(out);
    expect(obj.evidence).toBeDefined();
    expect(typeof obj.evidence.completeness).toBe('number');
    expect(obj.routing.stepBudget).toBeLessThanOrEqual(3);
    expect(obj.rubrics.safety).toBeDefined();
  });
});
