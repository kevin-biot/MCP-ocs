import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ToolMemoryGateway to avoid Chroma and to keep test deterministic
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    async initialize() {}
    async storeToolExecution() { return true; }
  }
}));

class DummyOpenShiftClient {
  async getLogs(podName: string, namespace?: string, opts?: any) {
    return `Log start for ${podName} in ${namespace}\nline1\nline2\nend`;
  }
}

class DummySharedMemoryManager { async storeConversation(_: any) { return 'ok'; } }

import { ReadOpsTools } from '../../../src/tools/read-ops/index';

describe('oc_read_logs via gateway', () => {
  let tools: ReadOpsTools;
  beforeEach(() => {
    tools = new ReadOpsTools(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
  });

  it('returns logs payload and persists via gateway', async () => {
    const json = await tools.executeTool('oc_read_logs', { podName: 'p1', namespace: 'ns1', container: 'c1', lines: 3, since: '1h', sessionId: 's-4' });
    const res = JSON.parse(json);
    expect(res.podName).toBe('p1');
    expect(res.namespace).toBe('ns1');
    expect(res.container).toBe('c1');
    expect(res.lines).toBe(3);
    expect(typeof res.logs).toBe('string');
    expect(res.logLines).toBeGreaterThan(0);
  });
});

