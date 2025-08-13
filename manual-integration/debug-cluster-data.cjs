#!/usr/bin/env node

/**
 * Debug Infrastructure Analysis - Let's see what we're actually getting from the cluster
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function debugClusterData() {
  console.log('🔍 DEBUGGING CLUSTER DATA');
  console.log('========================');
  console.log();

  try {
    // Debug MachineSets
    console.log('📊 RAW MACHINESET DATA:');
    console.log('----------------------');
    const { stdout: machineSetRaw } = await execAsync('oc get machinesets -A -o json');
    const machineSetData = JSON.parse(machineSetRaw);
    
    console.log(`Found ${machineSetData.items?.length || 0} MachineSets:`);
    for (const ms of machineSetData.items || []) {
      console.log(`  • ${ms.metadata.name}:`);
      console.log(`    - Replicas: ${ms.spec?.replicas || 0}`);
      console.log(`    - Ready: ${ms.status?.readyReplicas || 0}`);
      console.log(`    - Labels:`, ms.metadata?.labels);
      console.log(`    - Template Labels:`, ms.spec?.template?.metadata?.labels);
      console.log();
    }

    // Debug Nodes
    console.log('📊 RAW NODE DATA:');
    console.log('----------------');
    const { stdout: nodeRaw } = await execAsync('oc get nodes -o json');
    const nodeData = JSON.parse(nodeRaw);
    
    console.log(`Found ${nodeData.items?.length || 0} Nodes:`);
    for (const node of nodeData.items || []) {
      console.log(`  • ${node.metadata.name}:`);
      console.log(`    - Labels:`, node.metadata?.labels);
      console.log(`    - Zone keys:`, Object.keys(node.metadata?.labels || {}).filter(k => k.includes('zone')));
      console.log();
    }

    // Debug PVs
    console.log('📊 RAW PV DATA (first 5):');
    console.log('-------------------------');
    const { stdout: pvRaw } = await execAsync('oc get pv -o json');
    const pvData = JSON.parse(pvRaw);
    
    console.log(`Found ${pvData.items?.length || 0} PVs total, showing first 5:`);
    for (const pv of (pvData.items || []).slice(0, 5)) {
      console.log(`  • ${pv.metadata.name}:`);
      console.log(`    - NodeAffinity:`, pv.spec?.nodeAffinity);
      if (pv.spec?.nodeAffinity?.required?.nodeSelectorTerms) {
        for (const term of pv.spec.nodeAffinity.required.nodeSelectorTerms) {
          console.log(`    - MatchExpressions:`, term.matchExpressions);
        }
      }
      console.log();
    }

    // Look for zone-specific patterns
    console.log('🔍 ZONE PATTERN ANALYSIS:');
    console.log('-------------------------');
    
    // Check what zone-related labels exist
    const allLabels = new Set();
    for (const node of nodeData.items || []) {
      Object.keys(node.metadata?.labels || {}).forEach(label => {
        if (label.includes('zone') || label.includes('region')) {
          allLabels.add(label);
        }
      });
    }
    
    console.log('Zone-related label keys found:', Array.from(allLabels));
    
    // Check PV zone requirements
    let pvZoneCount = 0;
    const pvZones = new Set();
    for (const pv of pvData.items || []) {
      if (pv.spec?.nodeAffinity?.required?.nodeSelectorTerms) {
        for (const term of pv.spec.nodeAffinity.required.nodeSelectorTerms) {
          for (const expr of term.matchExpressions || []) {
            if (expr.key && (expr.key.includes('zone') || expr.key.includes('region'))) {
              pvZoneCount++;
              expr.values?.forEach(zone => pvZones.add(zone));
              console.log(`PV ${pv.metadata.name} requires zone: ${expr.values?.[0]} (key: ${expr.key})`);
            }
          }
        }
      }
    }
    
    console.log();
    console.log(`📊 SUMMARY:`);
    console.log(`   • PVs with zone requirements: ${pvZoneCount}`);
    console.log(`   • Unique zones required: ${Array.from(pvZones).sort()}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugClusterData().catch(console.error);
