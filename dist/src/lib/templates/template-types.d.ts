export interface TriggerCondition {
    type: 'event_pattern' | 'namespace_scope' | 'static_target';
    predicate?: string;
    target?: string;
    confidence?: number;
}
export interface EvidenceSelector {
    type: 'jsonpath' | 'yq' | 'dsl' | 'eventsRegex';
    path: string;
}
export interface VersionedEvidenceContract {
    version: string;
    required: string[];
    selectors: Record<string, EvidenceSelector[]>;
    completenessThreshold: number;
}
export interface EnhancedExecutionBudgets {
    infraSteps: number;
    workloadSteps: number;
    correlationSteps: number;
}
export interface EnhancedExecutionBoundaries {
    maxSteps: number;
    timeoutMs: number;
    allowedNamespaces?: string[];
    toolWhitelist?: string[];
    maxToolRetries?: number;
    budgets?: EnhancedExecutionBudgets;
    circuitBreaker?: {
        windowMs: number;
        maxRepeatCallsPerTool: number;
    };
}
export interface DiagnosticTemplate {
    id: string;
    name: string;
    version: string;
    triageTarget: string;
    triggers: TriggerCondition[];
    blocks: string[];
    composition: {
        infrastructure?: string[];
        workload?: string[];
        correlation?: string[];
    };
    steps: Array<{
        tool: string;
        params: Record<string, any>;
        rationale?: string;
        phase?: 'infrastructure' | 'workload' | 'correlation';
    }>;
    evidenceContract: VersionedEvidenceContract;
    boundaries: EnhancedExecutionBoundaries;
}
export interface TemplateSelection {
    template: DiagnosticTemplate;
    reason: string;
}
