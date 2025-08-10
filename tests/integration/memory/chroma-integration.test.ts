/**
 * Integration tests for Memory System
 * Tests real ChromaDB integration and JSON fallback
 */

import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory.js';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('Memory System Integration', () => {
  let chromaContainer: StartedTestContainer;
  let memoryManager: SharedMemoryManager;

  beforeAll(async () => {
    // Start ChromaDB container for testing
    chromaContainer = await new GenericContainer('chromadb/chroma:latest')
      .withExposedPorts(8000)
      .withEnvironment({
        'ALLOW_RESET': 'TRUE',
        'IS_PERSISTENT': 'FALSE'
      })
      .start();
    
    const chromaPort = chromaContainer.getMappedPort(8000);
    
    // Initialize memory manager with test container
    const config = {
      namespace: 'test-mcp-ocs',
      chromaHost: 'localhost',
      chromaPort,
      jsonDir: './tests/tmp/memory',
      compression: false
    };
    
    memoryManager = new SharedMemoryManager(config);
    await memoryManager.initialize();
  }, 30000); // 30 second timeout for container startup

  afterAll(async () => {
    if (memoryManager) {
      await memoryManager.close();
    }
    if (chromaContainer) {
      await chromaContainer.stop();
    }
  });

  beforeEach(async () => {
    // Clear any existing data
    await memoryManager.clearAll();
  });

  describe('ChromaDB Integration', () => {
    it('should store and retrieve conversations', async () => {
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
        namespace: 'test-fallback',
        chromaHost: 'nonexistent-host',
        chromaPort: 9999,
        jsonDir: './tests/tmp/fallback-memory',
        compression: false
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
      const conversation = testUtils.createTestMemory('conversation');
      
      const memoryId = await fallbackManager.storeConversation(conversation);
      expect(memoryId).toBeDefined();

      const results = await fallbackManager.searchConversations('test', 5);
      expect(results).toHaveLength(1);
    });

    it('should perform text-based similarity search in JSON mode', async () => {
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
      expect(results).toHaveLength(2);
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
        namespace: 'test-mcp-ocs'
      });
      
      expect(stats.totalConversations).toBeGreaterThan(0);
      expect(stats.totalOperational).toBeGreaterThan(0);
    });

    it('should report ChromaDB connectivity status', async () => {
      const stats = await memoryManager.getStats();
      expect(stats.chromaAvailable).toBe(true);
      
      // Test with fallback manager
      const fallbackConfig = {
        namespace: 'test-fallback',
        chromaHost: 'nonexistent',
        chromaPort: 9999,
        jsonDir: './tests/tmp/fallback',
        compression: false
      };
      
      const fallbackManager = new SharedMemoryManager(fallbackConfig);
      await fallbackManager.initialize();
      
      const fallbackStats = await fallbackManager.getStats();
      expect(fallbackStats.chromaAvailable).toBe(false);
      
      await fallbackManager.close();
    });
  });
});
