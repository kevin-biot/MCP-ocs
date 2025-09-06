/**
 * Infrastructure Correlation Engine - Phase 2A Implementation
 * 
 * Solves the real-world problem: tekton-results-postgres stuck 11+ hours in "Pending"
 * Root Cause: PV required zone eu-west-1a, but MachineSets scaled to 0 in that zone
 * 
 * This tool automates infrastructure → storage → operator correlation analysis
 * Following ADR-003 (Memory), ADR-004 (Tool Naming), ADR-006 (Modularity)
 */

import { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import { nowEpoch } from '../../../utils/time.js';
import { SharedMemoryManager, MemorySearchResult } from '../../../lib/memory/shared-memory';

// Core Types for Infrastructure Correlation
export interface InfrastructureCorrelationInput {
  namespace?: string;
  sessionId: string;
  focusArea?: 'storage' | 'networking' | 'compute' | 'all';
}

export interface ZoneAvailability {
  zone: string;
  machineSetReplicas: number;
  actualNodes: number;
  status: 'healthy' | 'degraded' | 'unavailable';
  issues: string[];
}

export interface StorageZoneConflict {
  pvName: string;
  pvNamespace: string;
  requiredZone: string;
  zoneAvailable: boolean;
  conflictSeverity: 'critical' | 'warning' | 'info';
  affectedPods: string[];
  recommendedActions: string[];
}

export interface InfrastructureCorrelationResult {
  summary: {
    hasInfrastructureIssues: boolean;
    primaryConcern: string;
    confidenceScore: number;
    analysisTimeMs: number;
  };
  zoneAnalysis: {
    availableZones: ZoneAvailability[];
    zoneConflicts: StorageZoneConflict[];
    infrastructureRecommendations: string[];
  };
  memoryInsights: {
    similarPatterns: MemorySearchResult[];
    historicalResolutions: string[];
    patternConfidence: number;
  };
  humanSummary: string;
  technicalDetails: {
    machineSetStatus: any[];
    persistentVolumeAnalysis: any[];
    nodeDistribution: any[];
  };
}

export class InfrastructureCorrelationChecker {
  constructor(
    private ocWrapper: OcWrapperV2,
    private memoryManager: SharedMemoryManager
  ) {}

  /**
   * Main entry point for infrastructure correlation analysis
   * Detects zone/storage conflicts like the tekton-results-postgres scenario
   */
  async checkInfrastructureCorrelation(
    input: InfrastructureCorrelationInput
  ): Promise<InfrastructureCorrelationResult> {
    const startTime = Date.now();

    try {
      // 1. Search memory for similar infrastructure patterns
      const memoryContext = await this.searchInfrastructureMemory(input);

      // 2. Gather infrastructure data
      const infrastructureData = await this.gatherInfrastructureData(input);

      // 3. Analyze zone availability and conflicts
      const zoneAnalysis = await this.analyzeZoneAvailability(infrastructureData);

      // 4. Detect storage-zone conflicts
      const storageConflicts = await this.detectStorageZoneConflicts(
        input,
        infrastructureData,
        zoneAnalysis
      );

      // 5. Generate intelligent recommendations
      const recommendations = await this.generateRecommendations(
        zoneAnalysis,
        storageConflicts,
        memoryContext
      );

      // 6. Create human-readable summary
      const humanSummary = this.generateHumanSummary(
        zoneAnalysis,
        storageConflicts,
        recommendations
      );

      const result: InfrastructureCorrelationResult = {
        summary: {
          hasInfrastructureIssues: storageConflicts.length > 0 || zoneAnalysis.some(z => z.status !== 'healthy'),
          primaryConcern: this.identifyPrimaryConcern(zoneAnalysis, storageConflicts),
          confidenceScore: this.calculateConfidenceScore(zoneAnalysis, storageConflicts, memoryContext),
          analysisTimeMs: Date.now() - startTime
        },
        zoneAnalysis: {
          availableZones: zoneAnalysis,
          zoneConflicts: storageConflicts,
          infrastructureRecommendations: recommendations
        },
        memoryInsights: {
          similarPatterns: memoryContext,
          historicalResolutions: this.extractHistoricalResolutions(memoryContext),
          patternConfidence: this.calculatePatternConfidence(memoryContext)
        },
        humanSummary,
        technicalDetails: {
          machineSetStatus: infrastructureData.machineSets,
          persistentVolumeAnalysis: infrastructureData.persistentVolumes,
          nodeDistribution: infrastructureData.nodeDistribution
        }
      };

      // 7. Store analysis for future learning
      await this.storeInfrastructureMemory(input.sessionId, input, result);

      return result;

    } catch (error) {
      console.error('Infrastructure correlation analysis failed:', error);
      throw new Error(`Infrastructure correlation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search memory for similar infrastructure patterns
   * Following ADR-003 memory integration patterns
   */
  private async searchInfrastructureMemory(
    input: InfrastructureCorrelationInput
  ): Promise<MemorySearchResult[]> {
    const searchQueries = [
      `infrastructure correlation ${input.namespace || 'cluster'}`,
      'MachineSet zone conflict storage pending',
      'zone affinity infrastructure scale-down PV',
      'tekton-results-postgres zone eu-west-1a unavailable',
      'storage provisioning zone availability conflict'
    ];

    const results: MemorySearchResult[] = [];
    
    for (const query of searchQueries) {
      try {
        const searchResults = await this.memoryManager.searchConversations(query, 3);
        results.push(...searchResults);
      } catch (error) {
        console.warn(`Memory search failed for query "${query}":`, error);
      }
    }

    // Deduplicate and return top results
    return this.deduplicateMemoryResults(results).slice(0, 5);
  }

  /**
   * Gather comprehensive infrastructure data for analysis
   */
  private async gatherInfrastructureData(input: InfrastructureCorrelationInput) {
    const [machineSets, nodes, persistentVolumes] = await Promise.all([
      this.getMachineSetStatus(),
      this.getNodeDistribution(),
      this.getPersistentVolumeAnalysis(input.namespace)
    ]);

    return {
      machineSets,
      nodes,
      persistentVolumes,
      nodeDistribution: this.analyzeNodeDistribution(nodes)
    };
  }

  /**
   * Analyze zone availability based on MachineSet and Node data
   * Detects the core issue: zones scaled to 0 replicas
   */
  private async analyzeZoneAvailability(infrastructureData: any): Promise<ZoneAvailability[]> {
    const zoneMap = new Map<string, ZoneAvailability>();

    // Analyze MachineSet replica counts by zone
    for (const machineSet of infrastructureData.machineSets) {
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

      const zoneData = zoneMap.get(zone)!;
      zoneData.machineSetReplicas += replicas;

      // Detect critical issue: MachineSet scaled to 0
      if (replicas === 0) {
        zoneData.status = 'unavailable';
        zoneData.issues.push(`MachineSet ${machineSet.metadata.name} scaled to 0 replicas`);
      } else if (readyReplicas < replicas) {
        zoneData.status = 'degraded';
        zoneData.issues.push(`MachineSet ${machineSet.metadata.name}: ${readyReplicas}/${replicas} ready`);
      }
    }

    // Cross-reference with actual node availability
    for (const node of infrastructureData.nodes) {
      const zone = this.extractZoneFromNode(node);
      if (zoneMap.has(zone)) {
        zoneMap.get(zone)!.actualNodes++;
      }
    }

    return Array.from(zoneMap.values());
  }

  /**
   * Detect storage-zone conflicts like the tekton-results-postgres scenario
   * This is the core functionality that solves the 11+ hour diagnostic delay
   */
  private async detectStorageZoneConflicts(
    input: InfrastructureCorrelationInput,
    infrastructureData: any,
    zoneAnalysis: ZoneAvailability[]
  ): Promise<StorageZoneConflict[]> {
    const conflicts: StorageZoneConflict[] = [];
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable').map(z => z.zone);

    for (const pv of infrastructureData.persistentVolumes) {
      const requiredZone = this.extractRequiredZoneFromPV(pv);
      
      if (requiredZone && unavailableZones.includes(requiredZone)) {
        // Found a critical conflict - PV requires unavailable zone
        const affectedPods = await this.findPodsUsingPV(pv, input.namespace);
        
        conflicts.push({
          pvName: pv.metadata.name,
          pvNamespace: pv.metadata.namespace || 'cluster-scoped',
          requiredZone,
          zoneAvailable: false,
          conflictSeverity: 'critical',
          affectedPods,
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
   * Generate intelligent recommendations based on analysis and memory insights
   */
  private async generateRecommendations(
    zoneAnalysis: ZoneAvailability[],
    storageConflicts: StorageZoneConflict[],
    memoryContext: MemorySearchResult[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

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

    // Priority 3: Memory-enhanced recommendations
    if (memoryContext.length > 0) {
      const historicalResolutions = this.extractHistoricalResolutions(memoryContext);
      if (historicalResolutions.length > 0) {
        recommendations.push(
          `💡 Based on similar incidents: ${historicalResolutions[0]}`
        );
      }
    }

    return recommendations;
  }

  /**
   * Generate human-readable summary of infrastructure correlation analysis
   */
  private generateHumanSummary(
    zoneAnalysis: ZoneAvailability[],
    storageConflicts: StorageZoneConflict[],
    recommendations: string[]
  ): string {
    const totalZones = zoneAnalysis.length;
    const healthyZones = zoneAnalysis.filter(z => z.status === 'healthy').length;
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable').length;
    const criticalConflicts = storageConflicts.filter(c => c.conflictSeverity === 'critical').length;

    let summary = `Infrastructure Correlation Analysis:\n\n`;
    
    summary += `Zone Status: ${healthyZones}/${totalZones} zones healthy`;
    if (unavailableZones > 0) {
      summary += `, ${unavailableZones} unavailable`;
    }
    summary += `\n`;

    if (criticalConflicts > 0) {
      summary += `\n🚨 FOUND ${criticalConflicts} CRITICAL STORAGE-ZONE CONFLICTS:\n`;
      for (const conflict of storageConflicts.filter(c => c.conflictSeverity === 'critical')) {
        summary += `  • PV ${conflict.pvName} requires zone ${conflict.requiredZone} (unavailable)\n`;
        summary += `    Affected pods: ${conflict.affectedPods.join(', ')}\n`;
      }
      summary += `\nThis explains why pods are stuck in "Pending" state.\n`;
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

  // Helper methods for infrastructure analysis
  private async getMachineSetStatus(): Promise<any[]> {
    try {
      const result = await this.ocWrapper.executeOc(['get', 'machinesets', '-A', '-o', 'json']);
      return JSON.parse(result.stdout).items || [];
    } catch (error) {
      console.warn('Failed to get MachineSet status:', error);
      return [];
    }
  }

  private async getNodeDistribution(): Promise<any[]> {
    try {
      const result = await this.ocWrapper.executeOc(['get', 'nodes', '-o', 'json']);
      return JSON.parse(result.stdout).items || [];
    } catch (error) {
      console.warn('Failed to get node distribution:', error);
      return [];
    }
  }

  private async getPersistentVolumeAnalysis(namespace?: string): Promise<any[]> {
    try {
      const args = namespace ? ['pv', '-o', 'json'] : ['pv', '-o', 'json'];
      const result = await this.ocWrapper.executeOc(['get'].concat(args));
      return JSON.parse(result.stdout).items || [];
    } catch (error) {
      console.warn('Failed to get PV analysis:', error);
      return [];
    }
  }

  private extractZoneFromMachineSet(machineSet: any): string {
    return machineSet.metadata?.labels?.['machine.openshift.io/zone'] || 
           machineSet.spec?.template?.metadata?.labels?.['machine.openshift.io/zone'] ||
           'unknown-zone';
  }

  private extractZoneFromNode(node: any): string {
    return node.metadata?.labels?.['topology.kubernetes.io/zone'] || 
           node.metadata?.labels?.['failure-domain.beta.kubernetes.io/zone'] ||
           'unknown-zone';
  }

  private extractRequiredZoneFromPV(pv: any): string | null {
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

  private async findPodsUsingPV(pv: any, namespace?: string): Promise<string[]> {
    try {
      const args = namespace ? ['pods', '-n', namespace, '-o', 'json'] : ['pods', '-A', '-o', 'json'];
      const result = await this.ocWrapper.executeOc(['get'].concat(args));
      const pods = JSON.parse(result.stdout).items || [];
      
      const affectedPods: string[] = [];
      for (const pod of pods) {
        for (const volume of pod.spec?.volumes || []) {
          if (volume.persistentVolumeClaim?.claimName) {
            // Would need to trace PVC -> PV relationship
            // Simplified for now - could enhance with PVC lookup
            if (pod.status?.phase === 'Pending') {
              affectedPods.push(`${pod.metadata.namespace}/${pod.metadata.name}`);
            }
          }
        }
      }
      
      return affectedPods;
    } catch (error) {
      console.warn('Failed to find pods using PV:', error);
      return [];
    }
  }

  // Memory and analysis helper methods
  private analyzeNodeDistribution(nodes: any[]) {
    const distribution = new Map<string, number>();
    for (const node of nodes) {
      const zone = this.extractZoneFromNode(node);
      distribution.set(zone, (distribution.get(zone) || 0) + 1);
    }
    return Array.from(distribution.entries()).map(([zone, count]) => ({ zone, nodeCount: count }));
  }

  private identifyPrimaryConcern(zoneAnalysis: ZoneAvailability[], storageConflicts: StorageZoneConflict[]): string {
    if (storageConflicts.length > 0) {
      return `Storage-zone conflicts detected: ${storageConflicts.length} PVs require unavailable zones`;
    }
    
    const unavailableZones = zoneAnalysis.filter(z => z.status === 'unavailable');
    if (unavailableZones.length > 0) {
      return `Infrastructure availability: ${unavailableZones.length} zones unavailable`;
    }
    
    return 'Infrastructure appears healthy';
  }

  private calculateConfidenceScore(
    zoneAnalysis: ZoneAvailability[], 
    storageConflicts: StorageZoneConflict[], 
    memoryContext: MemorySearchResult[]
  ): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence if we have clear zone conflicts
    if (storageConflicts.length > 0) confidence += 0.2;
    
    // Higher confidence with memory context
    if (memoryContext.length > 0) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculatePatternConfidence(memoryContext: MemorySearchResult[]): number {
    if (memoryContext.length === 0) return 0;
    
    const avgRelevance = memoryContext.reduce((sum, result) => sum + (result.relevance || 0), 0) / memoryContext.length;
    return avgRelevance;
  }

  private extractHistoricalResolutions(memoryContext: MemorySearchResult[]): string[] {
    const resolutions: string[] = [];
    
    for (const result of memoryContext) {
      // Check if it's a conversation memory and extract assistant response
      if ('assistantResponse' in result.memory) {
        const assistantResponse = result.memory.assistantResponse;
        if (assistantResponse?.toLowerCase().includes('scale up')) {
          resolutions.push('Scale up MachineSet in affected zone');
        }
        if (assistantResponse?.toLowerCase().includes('zone affinity')) {
          resolutions.push('Review and adjust zone affinity constraints');
        }
      }
    }
    
    return [...new Set(resolutions)]; // Deduplicate
  }

  private deduplicateMemoryResults(results: MemorySearchResult[]): MemorySearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      let key = '';
      if ('userMessage' in result.memory && 'assistantResponse' in result.memory) {
        key = `${result.memory.userMessage}-${result.memory.assistantResponse}`.substring(0, 100);
      } else {
        // For operational memory, use incidentId and symptoms
        key = `${result.memory.timestamp}-${JSON.stringify(result.memory).substring(0, 100)}`;
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Store infrastructure correlation analysis for future learning
   * Following ADR-003 memory patterns
   */
  private async storeInfrastructureMemory(
    sessionId: string,
    input: InfrastructureCorrelationInput,
    result: InfrastructureCorrelationResult
  ): Promise<void> {
    try {
      const userMessage = `Infrastructure correlation analysis for ${input.namespace || 'cluster'}: ${input.focusArea || 'comprehensive'} analysis`;
      
      const assistantResponse = `Infrastructure Analysis Results:
${result.humanSummary}

Technical Summary:
- Analysis time: ${result.summary.analysisTimeMs}ms
- Confidence: ${result.summary.confidenceScore}
- Zones analyzed: ${result.zoneAnalysis.availableZones.length}
- Storage conflicts: ${result.zoneAnalysis.zoneConflicts.length}
- Memory patterns: ${result.memoryInsights.similarPatterns.length}

Primary concern: ${result.summary.primaryConcern}`;

      const conversationMemory = {
        sessionId,
        domain: 'openshift',
        timestamp: nowEpoch(),
        userMessage,
        assistantResponse,
        context: [
          'OpenShift infrastructure analysis',
          'Zone availability assessment',
          'Storage-zone conflict detection',
          'MachineSet scaling analysis',
          'Automated root cause correlation'
        ],
        tags: [
          'infrastructure-correlation',
          'zone-analysis',
          'storage-conflicts',
          'machinesets',
          input.namespace || 'cluster-wide',
          input.focusArea || 'comprehensive'
        ]
      };

      await this.memoryManager.storeConversation(conversationMemory);
    } catch (error) {
      console.warn('Failed to store infrastructure memory:', error);
    }
  }
}
