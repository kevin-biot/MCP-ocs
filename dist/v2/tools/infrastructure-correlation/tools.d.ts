/**
 * Infrastructure Correlation Tool Registration
 * Following ADR-004 tool naming conventions and ADR-006 modular architecture
 */
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
export declare function createInfrastructureCorrelationTools(ocWrapper: OcWrapperV2, memoryManager: SharedMemoryManager): InfrastructureCorrelationTools;
/**
 * Tool metadata for MCP registration
 * Following ADR-004 naming conventions
 */
export declare const INFRASTRUCTURE_CORRELATION_TOOLS_METADATA: {
    oc_diagnostic_infrastructure_correlation: {
        name: string;
        description: string;
        category: string;
        version: string;
        memoryEnabled: boolean;
        inputSchema: {
            type: string;
            properties: {
                namespace: {
                    type: string;
                    description: string;
                };
                sessionId: {
                    type: string;
                    description: string;
                };
                focusArea: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
        };
    };
    oc_diagnostic_zone_analysis: {
        name: string;
        description: string;
        category: string;
        version: string;
        memoryEnabled: boolean;
        inputSchema: {
            type: string;
            properties: {
                sessionId: {
                    type: string;
                    description: string;
                };
                includeStorageAnalysis: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    };
};
