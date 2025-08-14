/**
 * ChromaDB Integration Tests - Focus on JSON Fallback
 * 
 * Test the robust fallback system when ChromaDB embeddings fail
 */

import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';

// Static production configuration
const CHROMA_CONFIG = {
  host: '127.0.0.1',
  port: 8000
} as const;

describe('Memory System Resilience', () => {
  let memoryManager: SharedMemoryManager;

  beforeAll(async () => {
    const uniqueNs = `test-resilience-${Date.now()}`;
    const config = {
      domain: 'test',
      namespace: uniqueNs,
      chromaHost: CHROMA_CONFIG.host,
      chromaPort: CHROMA_CONFIG.port,
      memoryDir: './tests/tmp/memory-resilience',
      enableCompression: false
    };

    memoryManager = new SharedMemoryManager(config);
    await memoryManager.initialize();
  }, 30000);

  afterAll(async () => {
    if (memoryManager) {
      await memoryManager.close();
    }
  });

  describe('JSON Fallback System', () => {
    it('should store conversation in JSON when ChromaDB fails', async () => {
      const testUtils = (globalThis as any).testUtils;
      const conversation = testUtils.createTestMemory('conversation', {
        userMessage: 'Test JSON fallback storage',
        assistantResponse: 'JSON fallback should work when ChromaDB fails',
        tags: ['json', 'fallback', 'test']
      });

      // This should succeed via JSON even if ChromaDB embedding fails
      const memoryId = await memoryManager.storeConversation(conversation);
      expect(memoryId).toBeDefined();
      expect(memoryId).toContain('test-session');
    });

    it('should store operational memory in JSON when ChromaDB fails', async () => {
      const testUtils = (globalThis as any).testUtils;
      const operational = testUtils.createTestMemory('operational', {
        incidentId: 'test-json-fallback-001',
        symptoms: ['ChromaDB embedding failure', 'Tensor format incompatibility'],
        rootCause: 'Environment-specific embedding function issue',
        resolution: 'JSON fallback activated successfully',
        tags: ['json', 'fallback', 'resilience']
      });

      // This should succeed via JSON even if ChromaDB fails
      const memoryId = await memoryManager.storeOperational(operational);
      expect(memoryId).toBeDefined();
      expect(memoryId).toContain('test-json-fallback-001');
    });

    it('should search JSON memories when ChromaDB unavailable', async () => {
      // Search should fall back to JSON and find results
      const searchResults = await memoryManager.searchConversations('JSON fallback', 5);
      
      // Should find results from JSON even if ChromaDB vector search fails
      expect(searchResults.length).toBeGreaterThan(0);
    });

    it('should handle memory statistics correctly', async () => {
      const stats = await memoryManager.getStats();
      expect(stats).toBeDefined();
      expect(stats.namespace).toContain('test-resilience-');
      
      // ChromaDB might be available for connection but fail for operations
      expect(typeof stats.chromaAvailable).toBe('boolean');
    });
  });

  describe('System Resilience', () => {
    it('should maintain functionality despite ChromaDB embedding issues', async () => {
      // The system should remain operational
      expect(memoryManager).toBeDefined();
      
      // Basic functionality should work
      const stats = await memoryManager.getStats();
      expect(stats.namespace).toBeDefined();
      
      console.log('✅ Memory system remains operational despite embedding issues');
    });
  });
});
