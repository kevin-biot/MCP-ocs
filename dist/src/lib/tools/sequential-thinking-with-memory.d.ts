/**
 * Enhanced Sequential Thinking with Memory Integration for MCP-ocs
 *
 * Implements memory-aware analysis, strategy planning, and resilient execution
 * with network reset detection and retries.
 */
import { UnifiedToolRegistry } from './tool-registry.js';
import { SharedMemoryManager } from '../memory/shared-memory.js';
import type { SequentialThinkingResult } from './sequential-thinking-types.js';
export declare class EnhancedSequentialThinkingOrchestrator {
    private toolRegistry;
    private memoryManager;
    constructor(toolRegistry: UnifiedToolRegistry, memoryManager: SharedMemoryManager);
    handleUserRequest(userInput: string, sessionId: string, opts?: {
        bounded?: boolean;
        firstStepOnly?: boolean;
        reflectOnly?: boolean;
        timeoutMs?: number;
        nextThoughtNeeded?: boolean;
        mode?: 'planOnly' | 'firstStepOnly' | 'boundedMultiStep' | 'unbounded';
        continuePlan?: boolean;
        triageTarget?: string;
        stepBudget?: number;
    }): Promise<SequentialThinkingResult>;
    private analyzeProblemWithMemory;
    private searchSimilarProblems;
    private identifyProblemPatterns;
    private quickReflect;
    private executeFirstStep;
    private formulateToolStrategyWithMemory;
    private executeWithReflectionAndNetworkRecovery;
    private executeToolWithNetworkHandling;
    private isNetworkResetError;
    private includesSchedulingRedFlags;
    private extractNodeFromText;
    private storeMiniPlanStrategy;
    private storeToolExecutionInMemory;
    private resumePlannedSteps;
    private advancePlanPointer;
    private storePlanStrategyInMemory;
    private reflectOnExecution;
    private reflectOnResults;
    private shouldReviseStrategy;
    private assessComplexity;
    private isClusterProblem;
    private isMonitoringProblem;
    private isIncidentResponse;
    private isPodIssue;
    private isNetworkProblem;
    private listAvailableTools;
    private isSpecificRequest;
    private isExplicitComprehensiveRequest;
    private isComplexOrUnclear;
    private inferNamespaceFromInput;
    private detectRedFlags;
}
