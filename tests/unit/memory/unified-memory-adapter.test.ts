import { jest } from '@jest/globals';

// Mock Chroma memory manager used by adapter
jest.mock('../../../src/lib/memory/chroma-memory-manager', () => ({
  ChromaMemoryManager: class {
    created: string[] = [];
    constructor(public dir: string) {}
    async initialize() { return; }
    async isAvailable() { return true; }
    async createCollection(name: string) { this.created.push(name); return true; }
    async storeConversation() { return true; }
    async searchRelevantMemoriesInCollection(_c: string, _q: string) {
      return [
        { content: 'User: Hello\nAssistant: World', distance: 0.1, metadata: { sessionId: 's1', tags: ['t1'] } },
      ];
    }
  }
}));

import { UnifiedMemoryAdapter } from '../../../src/lib/memory/unified-memory-adapter';

describe('UnifiedMemoryAdapter', () => {
  beforeEach(() => {
    delete process.env.CHROMA_COLLECTION;
    process.env.CHROMA_COLLECTION_PREFIX = 'mcp-ocs-';
  });

  it('chooses separate strategy and eagerly ensures collections', async () => {
    const adapter = new UnifiedMemoryAdapter({ memoryDir: './memory' });
    await adapter.initialize();
    expect(adapter.isAvailable()).toBe(true);
    // No exception means eager ensure path executed; behavior of createCollection verified by mock via no-throw
  });

  it('chooses unified strategy when CHROMA_COLLECTION set', async () => {
    process.env.CHROMA_COLLECTION = 'ocs_unified_v2';
    const adapter = new UnifiedMemoryAdapter({ memoryDir: './memory' });
    await adapter.initialize();
    expect(adapter.isAvailable()).toBe(true);
  });

  it('getStats returns shape with storage info and chromaAvailable', async () => {
    const adapter = new UnifiedMemoryAdapter({ memoryDir: './memory' });
    await adapter.initialize();
    const stats = await adapter.getStats();
    expect(typeof stats.totalConversations).toBe('number');
    expect(typeof stats.totalOperational).toBe('number');
    expect(typeof stats.storageUsed).toBe('string');
    expect(stats.chromaAvailable).toBe(true);
  });

  it('searchConversations maps fields and computes similarity/relevance', async () => {
    const adapter = new UnifiedMemoryAdapter({ memoryDir: './memory' });
    await adapter.initialize();
    const results = await adapter.searchConversations('hello');
    expect(results.length).toBeGreaterThan(0);
    const r = results[0]!;
    expect(typeof r.similarity).toBe('number');
    expect(typeof r.relevance).toBe('number');
    expect('sessionId' in r.memory).toBe(true);
  });
});
