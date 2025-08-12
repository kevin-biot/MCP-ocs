#!/usr/bin/env node
/**
 * Test Knowledge Seeding System Integration
 * Quick test to verify our implementation works
 */

import { 
  KnowledgeSeedingSystem, 
  KnowledgeSourceClass 
} from './src/lib/memory/knowledge-seeding-system.js';
import { SharedMemoryManager } from './src/lib/memory/shared-memory.js';
import { AutoMemorySystem } from './src/lib/memory/auto-memory-system.js';
import { KnowledgeSeedingTool } from './src/tools/memory/knowledge-seeding-tool.js';

async function quickTest() {
  console.log('🧪 Quick Knowledge Seeding Test\n');

  try {
    // Initialize the systems
    const memoryManager = new SharedMemoryManager({
      domain: 'test',
      namespace: 'default',
      memoryDir: './memory',
      chromaHost: '127.0.0.1',
      chromaPort: 8000
    });
    
    const autoMemory = new AutoMemorySystem(memoryManager);
    const seedingSystem = new KnowledgeSeedingSystem(memoryManager, autoMemory);
    const seedingTool = new KnowledgeSeedingTool(seedingSystem);
    
    console.log('✅ Systems initialized');

    // Test pattern discovery
    console.log('🔍 Testing pattern discovery...');
    const result = await seedingTool.execute({
      operation: 'quick_seed',
      templateType: 'PATTERN_DISCOVERY',
      templateArgs: [
        'Student04 CI/CD Pattern',
        'Pods in Succeeded state with 0/1 ready in student04 namespace',
        'These are CI/CD pipeline artifacts, not broken applications'
      ]
    });

    console.log('Pattern seeded:', result.success ? '✅' : '❌');
    console.log('Memory ID:', result.memoryId);
    
    // Test search
    console.log('\n🔎 Testing search...');
    const searchResult = await seedingTool.execute({
      operation: 'search',
      searchQuery: 'student04 pattern',
      searchLimit: 3
    });
    
    console.log('Search results:', searchResult.resultCount);
    
    // Test stats
    console.log('\n📊 Testing stats...');
    const stats = await seedingTool.execute({
      operation: 'stats'
    });
    
    console.log('Total knowledge entries:', stats.totalKnowledgeEntries);
    console.log('By source class:', JSON.stringify(stats.bySourceClass, null, 2));
    
    console.log('\n🎉 Quick test completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error };
  }
}

// Run the test
quickTest()
  .then(result => {
    console.log('\nTest result:', result.success ? '✅ PASSED' : '❌ FAILED');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
