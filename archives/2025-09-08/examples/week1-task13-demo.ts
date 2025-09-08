#!/usr/bin/env ts-node

/**
 * Week 1 Task 1.3 Demo - PVC Binding RCA Tool
 * 
 * Live demonstration of the storage intelligence tool
 * against the real student03 29-day pending PVC scenario
 */

import { OcWrapperV2 } from './src/v2/lib/oc-wrapper-v2';
import { SharedMemoryManager } from './src/lib/memory/shared-memory';

// Mock SharedMemoryManager for demo purposes
class MockSharedMemoryManager {
  async storeOperational(data: any): Promise<void> {
    console.log('📝 [MEMORY] Storing operational data:', {
      incidentId: data.incidentId,
      domain: data.domain,
      tags: data.tags
    });
  }

  async searchOperational(query: string, options?: any): Promise<any[]> {
    console.log('🔍 [MEMORY] Searching for:', query);
    return []; // Empty for demo
  }
}

async function demonstrateStorageIntelligence() {
  console.log('🎯 Week 1 Task 1.3 Demo: PVC Binding RCA Tool');
  console.log('==============================================');
  console.log('Analyzing student03 namespace for pending PVCs...\n');

  try {
    // Initialize components
    const ocWrapper = new OcWrapperV2();
    const memoryManager = new MockSharedMemoryManager() as any;

    // Import our storage intelligence tool
    console.log('🔧 Initializing Storage Intelligence Tool...');
    
    // Since we can't import the actual class in this demo file, 
    // let's show what the tool would do step by step:

    console.log('\n📊 Step 1: Discovering pending PVCs in student03...');
    
    try {
      const pvcsData = await ocWrapper.getPVCs('student03');
      const allPVCs = pvcsData.items || [];
      
      console.log(`✅ Found ${allPVCs.length} total PVCs in student03`);
      
      const pendingPVCs = allPVCs.filter((pvc: any) => pvc.status.phase === 'Pending');
      console.log(`🔍 Found ${pendingPVCs.length} pending PVCs`);
      
      if (pendingPVCs.length > 0) {
        console.log('\n📋 Pending PVC Details:');
        pendingPVCs.forEach((pvc: any) => {
          const created = new Date(pvc.metadata.creationTimestamp);
          const daysOld = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
          const storageRequested = pvc.spec.resources?.requests?.storage || 'unknown';
          
          console.log(`  📦 ${pvc.metadata.name}:`);
          console.log(`     - Age: ${daysOld} days`);
          console.log(`     - Storage: ${storageRequested}`);
          console.log(`     - Storage Class: ${pvc.spec.storageClassName || 'default'}`);
          console.log(`     - Status: ${pvc.status.phase}`);
        });
        
        // Demo the RCA analysis for the first pending PVC
        if (pendingPVCs[0]) {
          await demonstrateRCAAnalysis(ocWrapper, pendingPVCs[0]);
        }
      } else {
        console.log('✅ No pending PVCs found - storage is healthy!');
      }
      
    } catch (error) {
      console.error('❌ Failed to analyze PVCs:', error instanceof Error ? error.message : error);
    }

  } catch (error) {
    console.error('💥 Demo failed:', error);
  }
}

async function demonstrateRCAAnalysis(ocWrapper: OcWrapperV2, pvc: any) {
  console.log(`\n🔍 Step 2: Performing RCA on ${pvc.metadata.name}...`);
  
  try {
    // Evidence 1: Storage Class Analysis
    console.log('\n📊 Evidence 1: Storage Class Analysis');
    const storageClassName = pvc.spec.storageClassName || 'default';
    
    try {
      const scData = await ocWrapper.executeOc(['get', 'storageclass', storageClassName, '-o', 'json']);
      const storageClass = JSON.parse(scData.stdout);
      const volumeBindingMode = storageClass.volumeBindingMode || 'Immediate';
      
      console.log(`  ✅ Storage Class: ${storageClassName}`);
      console.log(`  📋 Binding Mode: ${volumeBindingMode}`);
      console.log(`  🏭 Provisioner: ${storageClass.provisioner}`);
      
      if (volumeBindingMode === 'WaitForFirstConsumer') {
        console.log(`  🎯 ROOT CAUSE DETECTED: WaitForFirstConsumer requires a pod!`);
        console.log(`  💡 This PVC won't bind until a pod uses it`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to get storage class: ${error instanceof Error ? error.message : error}`);
    }

    // Evidence 2: Pod Analysis
    console.log('\n📊 Evidence 2: Pod Usage Analysis');
    try {
      const podsData = await ocWrapper.getPods('student03');
      const allPods = podsData.items || [];
      
      const podsUsingPVC = allPods.filter((pod: any) => {
        const volumes = pod.spec.volumes || [];
        return volumes.some((volume: any) => 
          volume.persistentVolumeClaim?.claimName === pvc.metadata.name
        );
      });
      
      console.log(`  📦 Pods using PVC ${pvc.metadata.name}: ${podsUsingPVC.length}`);
      
      if (podsUsingPVC.length === 0) {
        console.log(`  🎯 EVIDENCE: No pods found using this PVC`);
        console.log(`  💡 For WaitForFirstConsumer, this explains the pending state`);
      } else {
        podsUsingPVC.forEach((pod: any) => {
          console.log(`    - ${pod.metadata.name}: ${pod.status.phase}`);
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to analyze pods: ${error instanceof Error ? error.message : error}`);
    }

    // Generate Resolution
    console.log('\n🔧 Step 3: Resolution Recommendations');
    console.log('=====================================');
    
    console.log('💡 RECOMMENDED SOLUTION:');
    console.log('   Create a test pod to trigger PVC binding');
    console.log('');
    console.log('📋 COMMAND TO RUN:');
    console.log(`oc run pvc-test-${pvc.metadata.name} --image=busybox --restart=Never \\`);
    console.log(`  --overrides='{"spec":{"volumes":[{"name":"test-vol","persistentVolumeClaim":{"claimName":"${pvc.metadata.name}"}}],"containers":[{"name":"test","image":"busybox","command":["sleep","3600"],"volumeMounts":[{"name":"test-vol","mountPath":"/test"}]}]}}' \\`);
    console.log(`  -n student03`);
    console.log('');
    console.log('⏱️  EXPECTED RESULT: PVC should bind within 30 seconds');
    console.log('');
    console.log('🧹 CLEANUP COMMAND:');
    console.log(`oc delete pod pvc-test-${pvc.metadata.name} -n student03`);
    
  } catch (error) {
    console.error('❌ RCA analysis failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateStorageIntelligence().catch(error => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  });
}

export { demonstrateStorageIntelligence };
