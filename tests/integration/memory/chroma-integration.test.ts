// @ts-nocheck
/**
 * Integration tests for Memory System
 * Supports two modes:
 * - External Chroma: set CHROMA_EXTERNAL=1 and ensure CHROMA_HOST/CHROMA_PORT
 * - Testcontainers: set TESTCONTAINERS=1 and ensure Docker/Podman available
 * Defaults to skip when neither is available.
 */

import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

const RUN_MODE = process.env.CHROMA_EXTERNAL === '1' ? 'external' : (process.env.TESTCONTAINERS === '1' ? 'containers' : 'skip');
const chromaHostEnv = process.env.CHROMA_HOST || '127.0.0.1';
const chromaPortEnv = parseInt(process.env.CHROMA_PORT || '8000', 10);
const d = RUN_MODE === 'skip' ? describe.skip : describe;

d('Memory System Integration', () => {
  let chromaContainer: StartedTestContainer | undefined;
  let memoryManager: SharedMemoryManager;

  beforeAll(async () => {
    let host = chromaHostEnv;
    let port = chromaPortEnv;

    if (RUN_MODE === 'containers') {
      // Start ChromaDB container for testing
      chromaContainer = await new GenericContainer('chromadb/chroma:latest')
        .withExposedPorts(8000)
        .withEnvironment({
          'ALLOW_RESET': 'TRUE',
          'IS_PERSISTENT': 'FALSE'
        })
        .start();
      host = 'localhost';
      port = chromaContainer.getMappedPort(8000);
    }

    const uniqueNs = `test-mcp-ocs-${Date.now()}`;
    const config = {
      domain: 'test',
      namespace: uniqueNs,
      chromaHost: host,
      chromaPort: port,
      memoryDir: './tests/tmp/memory-integration',
      enableCompression: false
    };

    memoryManager = new SharedMemoryManager(config);
    await memoryManager.initialize();
  }, 30000);

  afterAll(async () => {
    if (memoryManager) {
      await memoryManager.close();
    }
    if (chromaContainer) {
      await chromaContainer.stop();
    }
  });

  beforeEach(async () => {
    // No clearAll API; use fresh namespace per suite for isolation
  });

  describe('ChromaDB Integration', () => {
    it('should store and retrieve conversations', async () => {
      const testUtils = (globalThis as any).testUtils;
      const conversation = testUtils.createTestMemory('conversation', {
        userMessage: 'How do I check pod status?',
        assistantResponse: 'Use oc get pods to check pod status',
        tags: ['pods', 'status', 'basic']
      });

      const memoryId = await memoryManager.storeConversation(conversation);
      expect(memoryId).toBeDefined();

      const searchResults = await memoryManager.searchConversations('pod status', 5);
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].memory.userMessage).toBe('How do I check pod status?');
    });

    it('should store and retrieve operational memories', async () => {
      const testUtils = (globalThis as any).testUtils;
      const operational = testUtils.createTestMemory('operational', {
        incidentId: 'test-incident-001',
        symptoms: ['Pod not starting', 'ImagePullBackOff error'],
        rootCause: 'Invalid image tag',
        resolution: 'Updated image tag in deployment',
        tags: ['pod', 'image', 'deployment']
      });

      const memoryId = await memoryManager.storeOperational(operational);
      expect(memoryId).toBeDefined();

      const searchResults = await memoryManager.searchOperational('pod not starting', 5);
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].memory.incidentId).toBe('test-incident-001');
    });

    it('should perform similarity search with relevance scoring', async () => {
      // Store multiple related conversations
      const testUtils = (globalThis as any).testUtils;
      const conversations = [
        testUtils.createTestMemory('conversation', {
          userMessage: 'Pod is in CrashLoopBackOff state',
          assistantResponse: 'Check pod logs and resource limits',
          tags: ['pod', 'crash', 'troubleshooting']
        }),
        testUtils.createTestMemory('conversation', {
          userMessage: 'Service is not responding',
          assistantResponse: 'Check service endpoints and pod status',
          tags: ['service', 'network', 'troubleshooting']
        }),
        testUtils.createTestMemory('conversation', {
          userMessage: 'How to scale deployment?',
          assistantResponse: 'Use oc scale deployment --replicas=3',
          tags: ['deployment', 'scaling', 'operations']
        })
      ];

      for (const conv of conversations) {
        await memoryManager.storeConversation(conv);
      }

      // Search for pod-related issues
      const results = await memoryManager.searchConversations('pod problems', 3);
      expect(results.length).toBeGreaterThan(0);
      
      // Most relevant should be the CrashLoopBackOff conversation
      expect(results[0].memory.userMessage).toContain('CrashLoopBackOff');
      expect(results[0].similarity).toBeGreaterThan(0.5);
    });

    it('should handle auto-context extraction', async () => {
      const testUtils = (globalThis as any).testUtils;
      const conversation = testUtils.createTestMemory('conversation', {
        userMessage: 'The nginx deployment in production namespace is failing',
        assistantResponse: 'Let me check the deployment status and logs for nginx',
        context: [] // Will be auto-extracted
      });

      await memoryManager.storeConversation(conversation);
      const results = await memoryManager.searchConversations('nginx', 1);
      
      expect(results[0].memory.context).toContain('nginx');
      expect(results[0].memory.context).toContain('deployment');
      expect(results[0].memory.context).toContain('production');
    });
  });

  describe('JSON Fallback Behavior', () => {
    let fallbackManager: SharedMemoryManager;

    beforeEach(async () => {
      // Create manager with invalid ChromaDB config to trigger fallback
      const fallbackConfig = {
        domain: 'test',
        namespace: `test-fallback-${Date.now()}`,
        chromaHost: 'nonexistent-host',
        chromaPort: 9999,
        memoryDir: './tests/tmp/fallback-memory',
        enableCompression: false
      };
      
      fallbackManager = new SharedMemoryManager(fallbackConfig);
      await fallbackManager.initialize();
    });

    afterEach(async () => {
      if (fallbackManager) {
        await fallbackManager.close();
      }
    });

    it('should fall back to JSON storage when ChromaDB unavailable', async () => {
      const testUtils = (globalThis as any).testUtils;
      const conversation = testUtils.createTestMemory('conversation');
      
      const memoryId = await fallbackManager.storeConversation(conversation);
      expect(memoryId).toBeDefined();

      const results = await fallbackManager.searchConversations('test', 5);
      expect(results).toHaveLength(1);
    });

    it('should perform text-based similarity search in JSON mode', async () => {
      const testUtils = (globalThis as any).testUtils;
      const conversations = [
        testUtils.createTestMemory('conversation', {
          userMessage: 'pod deployment issue with nginx',
          assistantResponse: 'Check deployment configuration'
        }),
        testUtils.createTestMemory('conversation', {
          userMessage: 'service mesh configuration problem',
          assistantResponse: 'Review mesh policies'
        })
      ];

      for (const conv of conversations) {
        await fallbackManager.storeConversation(conv);
      }

      const results = await fallbackManager.searchConversations('nginx deployment', 2);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].memory.userMessage).toContain('nginx');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large number of memories efficiently', async () => {
      const startTime = Date.now();
      
      // Store 100 conversations
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const conversation = testUtils.createTestMemory('conversation', {
          userMessage: `Test message ${i} about pod issues`,
          assistantResponse: `Response ${i} about troubleshooting`,
          tags: [`test-${i}`, 'performance', 'pod']
        });
        promises.push(memoryManager.storeConversation(conversation));
      }
      
      await Promise.all(promises);
      const storageTime = Date.now() - startTime;
      
      expect(storageTime).toBeLessThan(10000); // Should complete in under 10 seconds
      
      // Test search performance
      const searchStart = Date.now();
      const results = await memoryManager.searchConversations('pod issues', 10);
      const searchTime = Date.now() - searchStart;
      
      expect(searchTime).toBeLessThan(1000); // Search should be under 1 second
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle concurrent operations safely', async () => {
      const concurrentOperations = [];
      
      // Perform 20 concurrent store operations
      for (let i = 0; i < 20; i++) {
        const operation = async () => {
          const conversation = testUtils.createTestMemory('conversation', {
            sessionId: `concurrent-${i}`,
            userMessage: `Concurrent message ${i}`,
            assistantResponse: `Concurrent response ${i}`
          });
          return await memoryManager.storeConversation(conversation);
        };
        concurrentOperations.push(operation());
      }
      
      const results = await Promise.all(concurrentOperations);
      expect(results).toHaveLength(20);
      expect(results.every(id => typeof id === 'string')).toBe(true);
    });
  });

  describe('Memory Statistics and Health', () => {
    it('should provide accurate memory statistics', async () => {
      // Store some test data
      await memoryManager.storeConversation(testUtils.createTestMemory('conversation'));
      await memoryManager.storeOperational(testUtils.createTestMemory('operational'));
      
      const stats = await memoryManager.getStats();
      
      expect(stats).toMatchObject({
        chromaAvailable: true,
        totalConversations: expect.any(Number),
        totalOperational: expect.any(Number),
        storageUsed: expect.any(String),
      });
      expect(typeof stats.namespace).toBe('string');
      
      expect(stats.totalConversations).toBeGreaterThan(0);
      expect(stats.totalOperational).toBeGreaterThan(0);
    });

    it('should report ChromaDB connectivity status', async () => {
      const stats = await memoryManager.getStats();
      expect(stats.chromaAvailable).toBe(true);
      
      // Test with fallback manager
      const fallbackConfig = {
        domain: 'test',
        namespace: `test-fallback-${Date.now()}`,
        chromaHost: 'nonexistent',
        chromaPort: 9999,
        memoryDir: './tests/tmp/fallback',
        enableCompression: false
      };
      
      const fallbackManager = new SharedMemoryManager(fallbackConfig as any);
      await fallbackManager.initialize();
      
      const fallbackStats = await fallbackManager.getStats();
      expect(fallbackStats.chromaAvailable).toBe(false);
      
      await fallbackManager.close();
    });
  });
});
