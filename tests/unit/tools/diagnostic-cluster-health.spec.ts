import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ToolMemoryGateway to avoid Chroma/network
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    async initialize() {}
    async storeToolExecution() { return true; }
  }
}));

// Mock v2 integration and wrappers to avoid deep deps
jest.mock('../../../src/v2-integration', () => ({
  checkNamespaceHealthV2Tool: { handler: async () => JSON.stringify({ ok: true }) }
}));
jest.mock('../../../src/v2/lib/oc-wrapper-v2', () => ({ OcWrapperV2: class {} }));
jest.mock('../../../src/v2/tools/check-namespace-health/index', () => ({ NamespaceHealthChecker: class {}, NamespaceHealthInput: class {} }));
jest.mock('../../../src/v2/tools/rca-checklist/index', () => ({ RCAChecklistEngine: class {} }));

// Minimal stubs for dependencies
class DummyOpenShiftClient {
  async getClusterInfo() {
    return { status: 'ok', version: '4.x', currentUser: 'test', serverUrl: 'https://api' };
  }
}
class DummySharedMemoryManager { async storeOperational(_: any) { return 'ok'; } }

import { DiagnosticToolsV2 } from '../../../src/tools/diagnostics/index';

describe('oc_diagnostic_cluster_health via gateway', () => {
  let tools: DiagnosticToolsV2;
  beforeEach(() => {
    tools = new DiagnosticToolsV2(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
    // Patch internal analysis to deterministic values
    (tools as any).analyzeNodeHealth = jest.fn(async () => ({ healthy: 3, unhealthy: 0 }));
    (tools as any).analyzeOperatorHealth = jest.fn(async () => ({ degraded: 0 }));
    (tools as any).analyzeSystemNamespaces = jest.fn(async () => ({ issues: 0 }));
    (tools as any).analyzeUserNamespaces = jest.fn(async () => ({ analyzed: 0 }));
    (tools as any).calculateOverallHealth = jest.fn(() => 'healthy');
    (tools as any).generateClusterRecommendations = jest.fn(() => ['noop']);
    (tools as any).formatClusterHealthResponse = jest.fn((h: any, sessionId: string) => JSON.stringify({ ok: true, sessionId, overall: h.overallHealth }));
  });

  it('runs and stores via gateway', async () => {
    const json = await tools.executeTool('oc_diagnostic_cluster_health', { sessionId: 's-1' });
    const res = JSON.parse(json);
    expect(res.ok).toBe(true);
    expect(res.sessionId).toBe('s-1');
  });
});
