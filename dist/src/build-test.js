// Simple test to verify the TypeScript compilation fixes
import { VectorMemoryManager } from './lib/memory/vector-memory-manager.js';
import { ToolExecutionTracker } from './lib/tools/tool-execution-tracker.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
// Test that the imports work and basic instantiation works
console.log('Testing TypeScript compilation fixes...');
try {
    // These should now compile successfully without errors
    const vectorMemoryManager = new VectorMemoryManager();
    const toolExecutionTracker = new ToolExecutionTracker(vectorMemoryManager);
    const openshiftClient = new OpenShiftClient({
        ocPath: 'oc',
        timeout: 30000
    });
    const sharedMemory = new SharedMemoryManager({
        domain: 'mcp-ocs',
        namespace: 'default',
        memoryDir: './memory',
        enableCompression: true,
        retentionDays: 30
    });
    console.log('✅ All compilation fixes are working correctly!');
}
catch (error) {
    console.error('❌ Compilation test failed:', error);
    process.exit(1);
}
