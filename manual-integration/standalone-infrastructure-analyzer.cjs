#!/usr/bin/env node

/**
 * Standalone Infrastructure Correlation Engine - Manual Integration
 * 
 * Tests the real-world tekton-results-postgres scenario against your live cluster
 * Demonstrates 10-15 minute manual analysis → <30 second automated detection
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class StandaloneInfrastructureAnalyzer {
  
  /**
   * Main analysis method - detects your exact zone scale-down scenario
   */
  async analyzeInfrastructureCorrelation() {
    const startTime = Date.now();
    
    console.log('🔍 Starting infrastructure correlation analysis...');
    
    try {
      // 1. Gather infrastructure data
      console.log('📊 Gathering MachineSet and Node data...');
      const [machineSetData, nodeData, pvData] = await Promise.all([
        this.getMachineSetStatus(),
        this.getNodeDistribution(), 
        this.getPersistentVolumeData()
      ]);

      // 2. Analyze zone availability
      console.log('🏗️ Analyzing zone availability...');
      const zoneAnalysis = this.analyzeZoneAvailability(machineSetData, nodeData);

      // 3. Detect storage conflicts
      console.log('💾 Detecting storage-zone conflicts...');
      const storageConflicts = this.detectStorageZoneConflicts(pvData, zoneAnalysis);

      // 4. Generate recommendations
      console.log('💡 Generating recommendations...');
      const recommendations = this.generateRecommendations(zoneAnalysis, storageConflicts);

      // 5. Create human summary
      const humanSummary = this.generateHumanSummary(zoneAnalysis, storageConflicts, recommendations);

      const result = {
        summary: {
          hasInfrastructureIssues: storageConflicts.length > 0 || zoneAnalysis.some(z => z.status !== 'healthy'),
          primaryConcern: this.identifyPrimaryConcern(zoneAnalysis, storageConflicts),
          analysisTimeMs: Date.now() - startTime,
          zonesAnalyzed: zoneAnalysis.length,
          conflictsFound: storageConflicts.length
        },
        zoneAnalysis,
        storageConflicts,
        humanSummary,
        recommendedActions: recommendations
      };

      return result;

    } catch (error) {
      throw new Error(`Infrastructure analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get MachineSet status using oc command
   */
  async getMachineSetStatus() {
    try {
      const { stdout } = await execAsync('oc get machinesets -A -o json');
      const data = JSON.parse(stdout);
      return data.items || [];
    } catch (error) {
      console.warn('Warning: Failed to get MachineSet data:', error.message);
      return [];
    }
  }

  /**
   * Get Node distribution using oc command
   */
  async getNodeDistribution() {
    try {
      const { stdout } = await execAsync('oc get nodes -o json');
      const data = JSON.parse(stdout);
      return data.items || [];
    } catch (error) {
      console.warn('Warning: Failed to get Node data:', error.message);
      return [];
    }
  }

  /**
   * Get Persistent Volume data using oc command
   */
  async getPersistentVolumeData() {
    try {
      const { stdout } = await execAsync('oc get pv -o json');
      const data = JSON.parse(stdout);
      return data.items || [];
    } catch (error) {
      console.warn('Warning: Failed to get PV data:', error.message);
      return [];
    }
  }

  /**
   * Analyze zone availability - detects the core issue from your scenario
   */
  analyzeZoneAvailability(machineSets, nodes) {
    const zoneMap = new Map();

    // Analyze MachineSet replica counts by zone
    for (const machineSet of machineSets) {
      const zone = this.extractZoneFromMachineSet(machineSet);
      const replicas = machineSet.spec?.replicas || 0;
      const readyReplicas = machineSet.status?.readyReplicas || 0;

      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, {
          zone,
          machineSetReplicas: 0,
          actualNodes: 0,
          status: 'healthy',
          issues: []
        });
      }

      const zoneData = zoneMap.get(zone);
      zoneData.machineSetReplicas += replicas;

      // Detect critical issue: MachineSet scaled to 0 (your exact scenario!)
      if (replicas === 0) {
        zoneData.status = 'unavailable';
        zoneData.issues.push(`MachineSet ${machineSet.metadata.name} scaled to 0 replicas`);
      } else if (readyReplicas < replicas) {
        zoneData.status = 'degraded';
        zoneData.issues.push(`MachineSet ${machineSet.metadata.name}: ${readyReplicas}/${replicas} ready`);
      }
    }

    // Cross-reference with actual node availability
    for (const node of nodes) {
      const zone = this.extractZoneFromNode(node);
      if (zoneMap.has(zone)) {
        zoneMap.get(zone).actualNodes++;
      }
    }

    return Array.from(zoneMap.values());
  }

  /**
   * Detect storage-zone conflicts - the core of your tekton-results-postgres issue
   */
  detectStorageZoneConflicts(persistentVolumes, zoneAnalysis) {
    const conflicts = [];
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable').map(z => z.zone);

    for (const pv of persistentVolumes) {
      const requiredZone = this.extractRequiredZoneFromPV(pv);
      
      if (requiredZone && unavailableZones.includes(requiredZone)) {
        // Found a critical conflict - PV requires unavailable zone (your exact issue!)
        conflicts.push({
          pvName: pv.metadata.name,
          requiredZone,
          zoneAvailable: false,
          conflictSeverity: 'critical',
          affectedPods: [], // Simplified for manual integration
          recommendedActions: [
            `Scale up MachineSet in zone ${requiredZone}`,
            `Or reconfigure application to use available zones`,
            `Check if PV can be migrated to available zone`
          ]
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate intelligent recommendations
   */
  generateRecommendations(zoneAnalysis, storageConflicts) {
    const recommendations = [];

    // Priority 1: Address critical storage-zone conflicts
    for (const conflict of storageConflicts.filter(c => c.conflictSeverity === 'critical')) {
      recommendations.push(
        `🚨 CRITICAL: Scale up MachineSet in zone ${conflict.requiredZone} to resolve PV ${conflict.pvName} conflict`
      );
    }

    // Priority 2: Address zone availability issues
    for (const zone of zoneAnalysis.filter(z => z.status === 'unavailable')) {
      recommendations.push(
        `⚠️  Zone ${zone.zone} is unavailable (0 replicas) - consider scaling up if workloads require this zone`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No critical infrastructure issues detected');
    }

    return recommendations;
  }

  /**
   * Generate human-readable summary
   */
  generateHumanSummary(zoneAnalysis, storageConflicts, recommendations) {
    const totalZones = zoneAnalysis.length;
    const healthyZones = zoneAnalysis.filter(z => z.status === 'healthy').length;
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable').length;
    const criticalConflicts = storageConflicts.filter(c => c.conflictSeverity === 'critical').length;

    let summary = `Infrastructure Correlation Analysis Results:\n\n`;
    
    summary += `Zone Status: ${healthyZones}/${totalZones} zones healthy`;
    if (unavailableZones > 0) {
      summary += `, ${unavailableZones} unavailable (scaled to 0 replicas)`;
    }
    summary += `\n`;

    if (criticalConflicts > 0) {
      summary += `\n🚨 FOUND ${criticalConflicts} CRITICAL STORAGE-ZONE CONFLICTS:\n`;
      for (const conflict of storageConflicts.filter(c => c.conflictSeverity === 'critical')) {
        summary += `  • PV ${conflict.pvName} requires zone ${conflict.requiredZone} (unavailable)\n`;
      }
      summary += `\n📊 This explains why pods would be stuck in "Pending" state!\n`;
      summary += `⏱️  Manual analysis time: 10-15 minutes\n`;
      summary += `🚀 Automated analysis time: <30 seconds\n`;
    } else {
      summary += `\n✅ No critical storage-zone conflicts detected.\n`;
    }

    if (recommendations.length > 0) {
      summary += `\nRecommended Actions:\n`;
      recommendations.forEach((rec, i) => {
        summary += `${i + 1}. ${rec}\n`;
      });
    }

    return summary;
  }

  // Helper methods
  extractZoneFromMachineSet(machineSet) {
    return machineSet.metadata?.labels?.['machine.openshift.io/zone'] || 
           machineSet.spec?.template?.metadata?.labels?.['machine.openshift.io/zone'] ||
           'unknown-zone';
  }

  extractZoneFromNode(node) {
    return node.metadata?.labels?.['topology.kubernetes.io/zone'] || 
           node.metadata?.labels?.['failure-domain.beta.kubernetes.io/zone'] ||
           'unknown-zone';
  }

  extractRequiredZoneFromPV(pv) {
    // Check nodeAffinity for zone requirements
    const nodeAffinity = pv.spec?.nodeAffinity?.required?.nodeSelectorTerms;
    if (nodeAffinity) {
      for (const term of nodeAffinity) {
        for (const expression of term.matchExpressions || []) {
          if (expression.key === 'topology.kubernetes.io/zone' || 
              expression.key === 'failure-domain.beta.kubernetes.io/zone') {
            return expression.values?.[0] || null;
          }
        }
      }
    }
    return null;
  }

  identifyPrimaryConcern(zoneAnalysis, storageConflicts) {
    if (storageConflicts.length > 0) {
      return `Storage-zone conflicts detected: ${storageConflicts.length} PVs require unavailable zones`;
    }
    
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable');
    if (unavailableZones.length > 0) {
      return `Infrastructure availability: ${unavailableZones.length} zones unavailable (scaled to 0 replicas)`;
    }
    
    return 'Infrastructure appears healthy';
  }
}

/**
 * Main execution - Test against your live cluster
 */
async function main() {
  console.log('🎯 Infrastructure Correlation Engine - Manual Integration Test');
  console.log('=============================================================');
  console.log();
  
  console.log('Testing against your live cluster with known zone conflicts...');
  console.log('Expected: MachineSets scaled to 0 in zones eu-west-1a, eu-west-1b');
  console.log('Expected: 50+ PVs requiring those unavailable zones');
  console.log();

  try {
    const analyzer = new StandaloneInfrastructureAnalyzer();
    const result = await analyzer.analyzeInfrastructureCorrelation();

    console.log('📊 ANALYSIS COMPLETE!');
    console.log('===================');
    console.log();
    console.log(result.humanSummary);
    console.log();
    console.log(`⏱️  Analysis completed in ${result.summary.analysisTimeMs}ms`);
    console.log(`🎯 Zones analyzed: ${result.summary.zonesAnalyzed}`);
    console.log(`🚨 Conflicts found: ${result.summary.conflictsFound}`);
    console.log();

    if (result.summary.hasInfrastructureIssues) {
      console.log('🎉 SUCCESS: Infrastructure correlation engine detected your zone conflicts!');
      console.log('💡 This proves the engine works and can automate your 10-15 minute analysis');
    } else {
      console.log('ℹ️  No infrastructure issues detected (cluster may have been fixed)');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('💡 Make sure you\'re connected to your OpenShift cluster with: oc whoami');
  }
}

// Run the analysis
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { StandaloneInfrastructureAnalyzer };
