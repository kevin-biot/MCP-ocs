/**
 * Simple ChromaDB Test to verify the fix
 */

import { SharedMemoryManager } from '../src/lib/memory/shared-memory.js';

async function quickChromaDBTest() {
  console.log('🧪 Quick ChromaDB Client Test...');
  
  try {
    const config = {
      domain: 'test',
      namespace: 'chromadb-test',
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory'
    };
    
    const memoryManager = new SharedMemoryManager(config);
    await memoryManager.initialize();
    
    console.log('✅ Memory manager initialized');
    console.log('ChromaDB available:', memoryManager.isChromaAvailable());
    
    if (memoryManager.isChromaAvailable()) {
      // Test storing a conversation
      const testMemory = {
        sessionId: 'test-session',
        domain: 'test',
        timestamp: Date.now(),
        userMessage: 'Test storage of operational memory',
        assistantResponse: 'This is a test response for ChromaDB verification',
        context: ['chromadb', 'test'],
        tags: ['test', 'verification']
      };
      
      const result = await memoryManager.storeConversation(testMemory);
      console.log('✅ Conversation stored:', result);
      
      // Test search
      const searchResults = await memoryManager.searchConversations('test storage', 1);
      console.log('✅ Search results:', searchResults.length);
      
      console.log('🎉 ChromaDB test successful!');
    } else {
      console.log('⚠️ ChromaDB not available - using JSON fallback');
    }
    
    await memoryManager.close();
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error);
  }
}

quickChromaDBTest().catch(console.error);
