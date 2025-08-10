/**
 * Workflow Engine - ADR-005 Implementation
 *
 * Hierarchical State Machine with Panic Detection
 * Prevents "4 AM panic operations" through structured diagnostic workflows
 */
import { SharedMemoryManager } from '../memory/shared-memory.js';
import { OperationalContext } from '../tools/namespace-manager.js';
export declare enum DiagnosticState {
    GATHERING = "gathering",
    ANALYZING = "analyzing",
    HYPOTHESIZING = "hypothesizing",
    TESTING = "testing",
    RESOLVING = "resolving"
}
export declare enum PanicType {
    RAPID_FIRE_COMMANDS = "rapid_fire_commands",
    JUMPING_BETWEEN_DOMAINS = "jumping_between_domains",
    BYPASSING_DIAGNOSTICS = "bypassing_diagnostics",
    ESCALATING_PERMISSIONS = "escalating_permissions",
    DESTRUCTIVE_WITHOUT_EVIDENCE = "destructive_without_evidence"
}
export interface WorkflowSession {
    sessionId: string;
    currentState: DiagnosticState;
    evidence: Evidence[];
    hypotheses: Hypothesis[];
    testedHypotheses: TestedHypothesis[];
    proposedSolutions: Solution[];
    panicSignals: PanicSignal[];
    startTime: Date;
    lastStateChange: Date;
    toolCalls: ToolCall[];
}
export interface Evidence {
    type: EvidenceType;
    description: string;
    source: string;
    timestamp: Date;
    quality: 'basic' | 'detailed' | 'comprehensive';
    data: any;
}
export interface ToolCall {
    name: string;
    arguments: any;
    timestamp: Date;
    result?: any;
    domain: string;
}
export interface WorkflowResponse {
    blocked?: boolean;
    warning?: boolean;
    panicDetected?: boolean;
    interventionMessage?: string;
    cautionMessage?: string;
    workflowGuidance?: string;
    currentState?: DiagnosticState;
    nextRecommendedActions?: string[];
    forcedStateTransition?: DiagnosticState;
    panicSignals?: PanicSignal[];
}
export interface WorkflowConfig {
    enablePanicDetection: boolean;
    enforcementLevel: 'guidance' | 'blocking';
    memoryManager: SharedMemoryManager;
    minEvidenceThreshold: number;
}
type EvidenceType = 'symptoms' | 'affected_resources' | 'logs' | 'events' | 'similar_incidents' | 'pattern_analysis' | 'root_cause_theory' | 'supporting_evidence' | 'hypothesis_test_results' | 'confirmed_root_cause' | 'solution_plan' | 'rollback_plan';
interface Hypothesis {
    id: string;
    description: string;
    confidence: number;
    supportingEvidence: string[];
    testPlan: string[];
    timestamp: Date;
}
interface TestedHypothesis extends Hypothesis {
    testResults: any[];
    outcome: 'confirmed' | 'rejected' | 'inconclusive';
    testedAt: Date;
}
interface Solution {
    id: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    rollbackPlan: string;
    approvalRequired: boolean;
    estimatedImpact: string;
}
interface PanicSignal {
    type: PanicType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    description: string;
    evidence: any;
}
/**
 * Main Workflow Engine
 */
export declare class WorkflowEngine {
    private config;
    private sessions;
    private panicDetector;
    private memoryGuided;
    constructor(config: WorkflowConfig);
    processToolRequest(sessionId: string, toolCall: ToolCall): Promise<WorkflowResponse>;
    getCurrentContext(): Promise<OperationalContext>;
    getEnforcementLevel(): string;
    getActiveStates(): Promise<any>;
    private createNewSession;
    private handlePanicIntervention;
    private generateCalmingMessage;
    private isToolAllowed;
    private matchesPattern;
    private handleBlockedTool;
    private updateSessionEvidence;
    private checkStateTransitions;
    private generateWorkflowGuidance;
    private getNextRecommendedActions;
}
export {};
