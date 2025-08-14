import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the gateway used by ReadOpsTools
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => {
  return {
    ToolMemoryGateway: class {
      async initialize() {}
      async searchToolIncidents(query: string, domain?: any, limit: number = 5) {
        // Create mixed-domain results
        const base = [
          { metadata: { tags: ['domain:openshift'], timestamp: Date.now() }, distance: 0.45, content: `A ${query}` },
          { metadata: { tags: ['domain:kubernetes'], timestamp: Date.now() - 1000 }, distance: 0.5, content: `B ${query}` },
          { metadata: { tags: ['domain:openshift'], timestamp: Date.now() - 2000 }, distance: 0.55, content: `C ${query}` },
        ];
        const filtered = domain ? base.filter(r => r.metadata.tags.includes(`domain:${domain}`)) : base;
        return filtered.slice(0, limit);
      }
    }
  };
});

// Lightweight stubs for deps
class DummyOpenShiftClient { }
class DummySharedMemoryManager {
  async storeConversation(_: any) { return 'ok'; }
}

import { ReadOpsTools } from '../../../src/tools/read-ops/index';

describe('memory_search_incidents tool via gateway', () => {
  let tools: ReadOpsTools;
  beforeEach(() => {
    tools = new ReadOpsTools(new DummyOpenShiftClient() as any, new DummySharedMemoryManager() as any);
  });

  it('returns results with limit and computed relevance', async () => {
    const json = await tools.executeTool('memory_search_incidents', { query: 'crashloop', limit: 3, sessionId: 's1' });
    const res = JSON.parse(json);
    expect(res.query).toBe('crashloop');
    expect(res.limit).toBe(3);
    expect(res.resultsFound).toBeGreaterThan(0);
    expect(res.results.length).toBeGreaterThan(0);
    expect(typeof res.results[0].relevance).toBe('number');
  });

  it('applies domainFilter by passing it to gateway', async () => {
    const json = await tools.executeTool('memory_search_incidents', { query: 'crashloop', limit: 5, sessionId: 's2', domainFilter: 'openshift' });
    const res = JSON.parse(json);
    // With our mock, openshift-filter should return 2 results
    expect(res.resultsFound).toBe(2);
    expect(res.results.length).toBe(2);
  });
});
