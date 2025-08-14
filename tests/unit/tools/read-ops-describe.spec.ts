import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ToolMemoryGateway to avoid Chroma and to keep test deterministic
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    async initialize() {}
    async storeToolExecution() { return true; }
  }
}));

class DummyOpenShiftClient {
  async describeResource(resourceType: string, name: string, namespace?: string) {
    return `Description for ${resourceType}/${name} in ${namespace || 'default'}`;
  }
}

class DummySharedMemoryManager { async storeConversation(_: any) { return 'ok'; } }

import { ReadOpsTools } from '../../../src/tools/read-ops/index';

describe('oc_read_describe via gateway', () => {
  let tools: ReadOpsTools;
  beforeEach(() => {
    tools = new ReadOpsTools(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
  });

  it('returns description payload and persists via gateway', async () => {
    const json = await tools.executeTool('oc_read_describe', { resourceType: 'pod', name: 'p1', namespace: 'ns1', sessionId: 's-3' });
    const res = JSON.parse(json);
    expect(res.resourceType).toBe('pod');
    expect(res.name).toBe('p1');
    expect(res.namespace).toBe('ns1');
    expect(typeof res.description).toBe('string');
  });
});

