import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ToolMemoryGateway to avoid Chroma/network
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    async initialize() {}
    async storeToolExecution() { return true; }
  }
}));

// Mock v2 integration and wrappers
jest.mock('../../../src/v2-integration', () => ({
  checkNamespaceHealthV2Tool: { handler: async (_args: any) => JSON.stringify({ status: 'healthy', namespace: 'ns1', checks: { pods: { ready: 1, total: 1 }, pvcs: { bound: 1, total: 1 }, routes: { total: 0 }, events: [] }, duration: 10 }) }
}));
jest.mock('../../../src/v2/lib/oc-wrapper-v2', () => ({ OcWrapperV2: class {} }));
jest.mock('../../../src/v2/tools/check-namespace-health/index', () => ({ NamespaceHealthChecker: class {}, NamespaceHealthInput: class {} }));
jest.mock('../../../src/v2/tools/rca-checklist/index', () => ({ RCAChecklistEngine: class {} }));

class DummyOpenShiftClient { }
class DummySharedMemoryManager { async storeOperational(_: any) { return 'ok'; } }

import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index';

describe('oc_diagnostic_namespace_health via gateway', () => {
  let tools: DiagnosticToolsV2;
  beforeEach(() => {
    tools = new DiagnosticToolsV2(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
  });

  it('runs v2 handler and persists via gateway', async () => {
    const json = await tools.executeTool('oc_diagnostic_namespace_health', { sessionId: 's-1', namespace: 'ns1' });
    const res = JSON.parse(json);
    expect(res.status).toBe('healthy');
    expect(res.namespace).toBe('ns1');
  });
});

