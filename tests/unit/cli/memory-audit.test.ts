import { jest } from '@jest/globals';

// Mock ChromaMemoryManager inside CLI
jest.mock('../../../src/lib/memory/chroma-memory-manager', () => ({
  ChromaMemoryManager: class {
    async initialize() {}
    async isAvailable() { return true; }
    async listCollections() { return [{ name: 'mcp-ocs-conversations' }, { name: 'mcp-ocs-operational' }, { name: 'mcp-ocs-tool_exec' }]; }
  }
}));

describe('CLI memory-audit (unit)', () => {
  beforeEach(() => {
    process.env.CHROMA_HOST = '127.0.0.1';
    process.env.CHROMA_PORT = '8000';
    process.env.CHROMA_TENANT = 'mcp-ocs';
    process.env.CHROMA_DATABASE = 'test';
    delete process.env.CHROMA_COLLECTION; // ensure separate strategy
    process.env.CHROMA_COLLECTION_PREFIX = 'mcp-ocs-';
  });

  it('prints JSON with expected fields', async () => {
    const logs: string[] = [];
    const orig = console.log;
    console.log = (s?: any) => { if (typeof s === 'string') logs.push(s); };
    // isolate module so its top-level main() runs with our mocks
    await import('../../../src/cli/memory-audit');
    // wait for async main to flush
    await new Promise(res => setTimeout(res, 10));
    console.log = orig;
    const joined = logs.join('\n');
    expect(joined.trim().startsWith('{')).toBe(true);
    const out = JSON.parse(joined);
    expect(out.ok).toBe(true);
    expect(out.strategy).toBe('separate');
    expect(Array.isArray(out.present)).toBe(true);
    expect(Array.isArray(out.missing)).toBe(true);
  });
});
