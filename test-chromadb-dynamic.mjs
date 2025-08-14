async function testChromaDB() {
  console.log('🔥 Dynamic Import ChromaDB Test...');
  
  try {
    // Dynamic import to handle module issues
    const { SharedMemoryManager } = await import('./dist/shared-memory.js');
    
    const config = {
      domain: 'test',
      namespace: `test-${Date.now()}`,
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory'
    };

    console.log('📦 Creating memory manager...');
    const manager = new SharedMemoryManager(config);
    
    console.log('🔌 Initializing...');
    await manager.initialize();
    
    console.log('✅ ChromaDB available:', manager.isChromaAvailable());
    
    if (manager.isChromaAvailable()) {
      console.log('💾 Testing operational memory storage...');
      
      const testMemory = {
        incidentId: 'test-001',
        domain: 'test',
        timestamp: Date.now(),
        symptoms: ['Test symptom'],
        rootCause: 'Test cause',
        resolution: 'Test resolution',
        environment: 'test',
        affectedResources: ['test-resource'],
        diagnosticSteps: ['Test step'],
        tags: ['test']
      };

      const id = await manager.storeOperational(testMemory);
      console.log('✅ Stored with ID:', id);
      
      console.log('🎉 CHROMADB FIX WORKS! 🚀');
    } else {
      console.log('❌ ChromaDB not available');
    }
    
    await manager.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChromaDB();
