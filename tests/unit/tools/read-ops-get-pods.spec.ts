import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ToolMemoryGateway to avoid Chroma and to keep test deterministic
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    async initialize() {}
    async storeToolExecution() { return true; }
  }
}));

class DummyOpenShiftClient {
  async getPods(namespace?: string, selector?: string) {
    return [
      { name: 'p1', status: 'Running' },
      { name: 'p2', status: 'Pending' },
      { name: 'p3', status: 'Failed' }
    ];
  }
}

class DummySharedMemoryManager { async storeConversation(_: any) { return 'ok'; } }

import { ReadOpsTools } from '../../../src/tools/read-ops/index';

describe('oc_read_get_pods via gateway', () => {
  let tools: ReadOpsTools;
  beforeEach(() => {
    tools = new ReadOpsTools(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
  });

  it('returns pod summary and persists via gateway', async () => {
    const json = await tools.executeTool('oc_read_get_pods', { namespace: 'ns1', selector: 'app=x', sessionId: 's-2' });
    const res = JSON.parse(json);
    expect(res.namespace).toBe('ns1');
    expect(res.totalPods).toBe(3);
    expect(res.summary.running).toBe(1);
    expect(res.summary.pending).toBe(1);
    expect(res.summary.failed).toBe(1);
  });
});

