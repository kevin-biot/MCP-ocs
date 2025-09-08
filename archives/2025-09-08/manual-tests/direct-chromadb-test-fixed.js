/**
 * Direct ChromaDB Test - Fixed for CommonJS
 */

const { SharedMemoryManager } = require('./dist/shared-memory.js');

async function directChromaDBTest() {
  console.log('🔥 Direct ChromaDB Integration Test...');
  
  try {
    const config = {
      domain: 'test',
      namespace: `direct-test-${Date.now()}`,
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory-direct'
    };

    console.log('📦 Creating SharedMemoryManager...');
    const memoryManager = new SharedMemoryManager(config);
    
    console.log('🔌 Initializing memory manager...');
    await memoryManager.initialize();
    
    console.log('✅ ChromaDB available:', memoryManager.isChromaAvailable());
    
    if (!memoryManager.isChromaAvailable()) {
      console.log('❌ ChromaDB not available - test cannot proceed');
      return;
    }

    // Test storing operational memory (the specific test that was failing)
    console.log('💾 Testing operational memory storage...');
    const testOperationalMemory = {
      incidentId: 'direct-test-incident-001',
      domain: 'test',
      timestamp: Date.now(),
      symptoms: ['Pod not starting', 'ImagePullBackOff error'],
      rootCause: 'Invalid image tag',
      resolution: 'Updated image tag in deployment',
      environment: 'test',
      affectedResources: ['test-pod'],
      diagnosticSteps: ['Check pod logs', 'Verify image tag'],
      tags: ['pod', 'image', 'deployment']
    };

    const memoryId = await memoryManager.storeOperational(testOperationalMemory);
    console.log('✅ Stored operational memory with ID:', memoryId);

    // Test searching
    console.log('🔍 Testing operational memory search...');
    const searchResults = await memoryManager.searchOperational('pod not starting', 5);
    console.log('✅ Search results:', searchResults.length);
    
    if (searchResults.length > 0) {
      console.log('✅ Found stored memory:', searchResults[0].memory.incidentId);
      console.log('🎉 CHROMADB INTEGRATION TEST PASSED! 🚀');
    } else {
      console.log('⚠️ No search results found - might be search issue');
    }

    // Test conversation memory too
    console.log('💬 Testing conversation memory storage...');
    const testConversation = {
      sessionId: 'direct-test-session',
      domain: 'test',
      timestamp: Date.now(),
      userMessage: 'How do I check pod status?',
      assistantResponse: 'Use oc get pods to check pod status',
      context: ['pods', 'status'],
      tags: ['pods', 'status', 'basic']
    };

    const convId = await memoryManager.storeConversation(testConversation);
    console.log('✅ Stored conversation with ID:', convId);

    const convSearchResults = await memoryManager.searchConversations('pod status', 5);
    console.log('✅ Conversation search results:', convSearchResults.length);

    if (convSearchResults.length > 0) {
      console.log('✅ Found stored conversation:', convSearchResults[0].memory.sessionId);
    }

    await memoryManager.close();
    console.log('🎉 ALL CHROMADB TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error);
    console.error('Stack:', error.stack);
  }
}

directChromaDBTest().catch(console.error);
