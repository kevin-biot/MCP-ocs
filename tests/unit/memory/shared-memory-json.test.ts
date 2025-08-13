/**
 * Unit tests for SharedMemoryManager in JSON fallback mode
 */

import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn().mockResolvedValue({ isDirectory: () => false, size: 1024 }),
  unlink: jest.fn().mockResolvedValue(undefined)
}));

describe('SharedMemoryManager (JSON mode)', () => {
  let memory: SharedMemoryManager;
  let restoreGlobals: (() => void) | null = null;
  const fs = require('fs/promises');

  beforeEach(async () => {
    const originalFetch = global.fetch;
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('no chroma'));
    restoreGlobals = () => { (global as any).fetch = originalFetch; };

    memory = new SharedMemoryManager({
      domain: 'mcp-ocs',
      namespace: 'test',
      memoryDir: './tmp/memory',
      enableCompression: false,
      retentionDays: 7
    });
    await memory.initialize();
  });

  afterEach(() => { if (restoreGlobals) restoreGlobals(); });

  it('stores conversation and operational memory via JSON', async () => {
    const now = Date.now();
    const convId = await memory.storeConversation({
      sessionId: 's1', domain: 'ops', timestamp: now,
      userMessage: 'Check pods', assistantResponse: 'Found 2 pods',
      context: [], tags: []
    });
    expect(convId).toContain('s1_');
    expect(fs.writeFile).toHaveBeenCalled();

    const opId = await memory.storeOperational({
      incidentId: 'inc1', domain: 'cluster', timestamp: now,
      symptoms: ['x'], environment: 'test', affectedResources: [], diagnosticSteps: [], tags: []
    });
    expect(opId).toContain('inc1_');
  });

  it('searches conversations and operational via JSON', async () => {
    fs.readdir.mockImplementation(async (dir: string) => {
      if (dir.includes('conversations')) return ['s1_1.json'];
      if (dir.includes('operational')) return ['inc1_1.json'];
      return [];
    });
    fs.readFile.mockImplementation(async (file: string) => {
      if (file.includes('conversations')) return JSON.stringify({
        sessionId: 's1', domain: 'ops', timestamp: 1,
        userMessage: 'pod failed', assistantResponse: 'check logs', context: [], tags: []
      });
      return JSON.stringify({
        incidentId: 'inc1', domain: 'cluster', timestamp: 1,
        symptoms: ['pod failed'], rootCause: 'x', resolution: 'y', environment: 'test', affectedResources: [], diagnosticSteps: [], tags: []
      });
    });

    const conv = await memory.searchConversations('pod', 5);
    expect(conv.length).toBeGreaterThan(0);
    const op = await memory.searchOperational('pod', 5);
    expect(op.length).toBeGreaterThan(0);
  });

  it('returns stats with chromaAvailable false and storageUsed string', async () => {
    const spy = jest.spyOn(memory as any, 'calculateStorageUsage').mockResolvedValue('1 KB');
    const stats = await memory.getStats();
    expect(stats.chromaAvailable).toBe(false);
    expect(stats.storageUsed).toBe('1 KB');
    spy.mockRestore();
  });
});

