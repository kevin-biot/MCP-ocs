// @ts-nocheck
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';

describe('ChromaDB Memory Integration (Unique)', () => {
  let memoryManager: SharedMemoryManager;
  const uniqueRun = `unique-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  beforeAll(async () => {
    const config = {
      domain: 'test',
      namespace: uniqueRun,
      chromaHost: process.env.CHROMA_HOST || '127.0.0.1',
      chromaPort: process.env.CHROMA_PORT ? parseInt(process.env.CHROMA_PORT, 10) : 8000,
      memoryDir: process.env.SHARED_MEMORY_DIR || './memory',
      enableCompression: false
    };
    memoryManager = new SharedMemoryManager(config);
    await memoryManager.initialize();
  });

  afterAll(async () => {
    await memoryManager.close();
  });

  it('stores and retrieves a unique conversation reliably', async () => {
    const uniquePhrase = `[${uniqueRun}] How do I check pod status?`;
    const conversation = {
      sessionId: `${uniqueRun}-conv`,
      domain: 'mcp-ocs',
      timestamp: Date.now(),
      userMessage: uniquePhrase,
      assistantResponse: 'Use oc get pods to check pod status',
      tags: ['pods','status','basic'],
      context: ['test','context']
    };
    await memoryManager.storeConversation(conversation);

    const results = await memoryManager.searchConversations(uniquePhrase, 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0].memory as any;
    expect(top.userMessage).toContain(uniquePhrase);
  });

  it('stores and retrieves a unique operational memory reliably', async () => {
    const uniqueIncident = `${uniqueRun}-incident-001`;
    const operational = {
      incidentId: uniqueIncident,
      domain: 'mcp-ocs',
      timestamp: Date.now(),
      symptoms: ['Unique incident '+uniqueIncident],
      rootCause: 'Test cause',
      resolution: 'Test resolution',
      tags: ['operational','test'],
      affectedResources: [],
      diagnosticSteps: ['Step1'],
      environment: 'unknown'
    };
    await memoryManager.storeOperational(operational as any);

    const results = await memoryManager.searchOperational(uniqueIncident, 3);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0].memory as any;
    expect(top.incidentId).toBe(uniqueIncident);
  });
});

