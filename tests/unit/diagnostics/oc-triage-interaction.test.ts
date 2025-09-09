import { UnifiedToolRegistry } from '../../../src/lib/tools/tool-registry.js';
import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index.js';
import { OpenShiftClient } from '../../../src/lib/openshift-client.js';
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';

class StubOC extends (OpenShiftClient as any) {
  constructor() { super({ ocPath: 'oc', timeout: 1000 }); }
  async getPods() { return []; }
  async describeResource() { return 'ok'; }
  async executeRawCommand() { return JSON.stringify({ items: [] }); }
}

describe('Natural interaction via registry - oc_triage', () => {
  test('registry executes oc_diagnostic_triage and returns envelope', async () => {
    const registry = new UnifiedToolRegistry();
    const tools = new DiagnosticToolsV2(new StubOC() as any, { storeOperational: async () => 'ok' } as any as SharedMemoryManager);
    registry.registerSuite(tools);

    const raw = await registry.executeTool('oc_diagnostic_triage', { intent: 'scheduling-failures', namespace: 'student03' });
    const obj = JSON.parse(raw);
    expect(obj?.routing?.intent).toBe('scheduling-failures');
    expect(obj?.routing?.stepBudget).toBeLessThanOrEqual(3);
    expect(typeof obj?.evidence?.completeness).toBe('number');
  });
});

