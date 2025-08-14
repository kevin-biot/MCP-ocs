/**
 * ChromaDB Integration Tests - Production Configuration
 *
 * ChromaDB is production infrastructure - always use the standard setup
 */
import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';
// Static production configuration - ChromaDB is always available
const CHROMA_CONFIG = {
    host: '127.0.0.1',
    port: 8000
};
describe('ChromaDB Memory Integration', () => {
    let memoryManager;
    beforeAll(async () => {
        const uniqueNs = `test-chromadb-${Date.now()}`;
        const config = {
            domain: 'test',
            namespace: uniqueNs,
            chromaHost: CHROMA_CONFIG.host,
            chromaPort: CHROMA_CONFIG.port,
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
    });
    beforeEach(async () => {
        // Fresh namespace per test for isolation
    });
    describe('ChromaDB Operations', () => {
        it('should store and retrieve conversations', async () => {
            const testUtils = globalThis.testUtils;
            const conversation = testUtils.createTestMemory('conversation', {
                userMessage: 'How do I check pod status?',
                assistantResponse: 'Use oc get pods to check pod status',
                tags: ['pods', 'status', 'basic']
            });
            const memoryId = await memoryManager.storeConversation(conversation);
            expect(memoryId).toBeDefined();
            const searchResults = await memoryManager.searchConversations('pod status', 5);
            expect(searchResults).toHaveLength(1);
            const conversationMemory = searchResults[0].memory; // Type assertion for test
            expect(conversationMemory.userMessage).toBe('How do I check pod status?');
        });
        it('should store operational memory in ChromaDB', async () => {
            const testUtils = globalThis.testUtils;
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
            const operationalMemory = searchResults[0].memory; // Type assertion for test
            expect(operationalMemory.incidentId).toBe('test-incident-001');
        });
        it('should handle ChromaDB availability correctly', async () => {
            expect(memoryManager.isChromaAvailable()).toBe(true);
        });
        it('should return memory statistics', async () => {
            const stats = await memoryManager.getStats();
            expect(stats).toBeDefined();
            expect(stats.chromaAvailable).toBe(true);
            expect(stats.namespace).toContain('test-chromadb-');
        });
    });
});
