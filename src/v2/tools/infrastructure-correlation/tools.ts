/**
 * Infrastructure Correlation Tool Registration
 * Following ADR-004 tool naming conventions and ADR-006 modular architecture
 */

import { InfrastructureCorrelationChecker } from './index';
import type { OcWrapperV2 } from '../../lib/oc-wrapper-v2';
import type { SharedMemoryManager } from '../../../lib/memory/shared-memory';

export interface InfrastructureCorrelationTools {
  oc_diagnostic_infrastructure_correlation: (input: {
    namespace?: string;
    sessionId: string;
    focusArea?: 'storage' | 'networking' | 'compute' | 'all';
  }) => Promise<any>;
  
  oc_diagnostic_zone_analysis: (input: {
    sessionId: string;
    includeStorageAnalysis?: boolean;
  }) => Promise<any>;
}

/**
 * Create infrastructure correlation tools following established patterns
 */
export function createInfrastructureCorrelationTools(
  ocWrapper: OcWrapperV2,
  memoryManager: SharedMemoryManager
): InfrastructureCorrelationTools {
  
  const checker = new InfrastructureCorrelationChecker(ocWrapper, memoryManager);

  return {
    /**
     * Main infrastructure correlation tool
     * Automates the zone/storage conflict detection from real-world scenarios
     */
    oc_diagnostic_infrastructure_correlation: async (input) => {
      try {
        const result = await checker.checkInfrastructureCorrelation({
          namespace: input.namespace,
          sessionId: input.sessionId,
          focusArea: input.focusArea || 'all'
        });

        return {
          success: true,
          data: result,
          executionTimeMs: result.summary.analysisTimeMs,
          memoryEnhanced: result.memoryInsights.similarPatterns.length > 0
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallbackMessage: 'Infrastructure correlation analysis failed. Try basic cluster diagnostics instead.'
        };
      }
    },

    /**
     * Specialized zone analysis tool
     * Focuses specifically on zone availability and MachineSet status
     */
    oc_diagnostic_zone_analysis: async (input) => {
      try {
        const result = await checker.checkInfrastructureCorrelation({
          sessionId: input.sessionId,
          focusArea: 'compute'
        });

        // Filter result to focus on zone analysis
        return {
          success: true,
          data: {
            zoneAnalysis: result.zoneAnalysis,
            summary: {
              totalZones: result.zoneAnalysis.availableZones.length,
              healthyZones: result.zoneAnalysis.availableZones.filter(z => z.status === 'healthy').length,
              unavailableZones: result.zoneAnalysis.availableZones.filter(z => z.status === 'unavailable').length,
              hasStorageConflicts: result.zoneAnalysis.zoneConflicts.length > 0
            },
            humanSummary: result.humanSummary,
            memoryInsights: result.memoryInsights
          },
          executionTimeMs: result.summary.analysisTimeMs
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallbackMessage: 'Zone analysis failed. Try oc get machinesets -A for basic status.'
        };
      }
    }
  };
}

/**
 * Tool metadata for MCP registration
 * Following ADR-004 naming conventions
 */
export const INFRASTRUCTURE_CORRELATION_TOOLS_METADATA = {
  oc_diagnostic_infrastructure_correlation: {
    name: 'oc_diagnostic_infrastructure_correlation',
    description: 'Automated infrastructure correlation analysis - detects zone/storage conflicts that cause pods to remain in Pending state for hours. Solves real-world scenarios like tekton-results-postgres stuck due to zone scale-down.',
    category: 'diagnostic',
    version: 'v2',
    memoryEnabled: true,
    inputSchema: {
      type: 'object',
      properties: {
        namespace: {
          type: 'string',
          description: 'Target namespace for analysis (optional, defaults to cluster-wide)'
        },
        sessionId: {
          type: 'string',
          description: 'Session ID for memory correlation and storage'
        },
        focusArea: {
          type: 'string',
          enum: ['storage', 'networking', 'compute', 'all'],
          description: 'Focus area for analysis (defaults to all)'
        }
      },
      required: ['sessionId']
    }
  },
  
  oc_diagnostic_zone_analysis: {
    name: 'oc_diagnostic_zone_analysis',
    description: 'Specialized zone availability analysis - checks MachineSet replica counts, node distribution, and zone health. Quickly identifies infrastructure scale-down issues.',
    category: 'diagnostic',
    version: 'v2',
    memoryEnabled: true,
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID for memory correlation and storage'
        },
        includeStorageAnalysis: {
          type: 'boolean',
          description: 'Include storage-zone conflict analysis (defaults to true)'
        }
      },
      required: ['sessionId']
    }
  }
};
