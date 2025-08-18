import { DiagnosticTemplate } from './template-types.js';
export interface PlannedStep {
    tool: string;
    params: Record<string, any>;
    rationale?: string;
}
export interface PlanResult {
    planId: string;
    steps: PlannedStep[];
    boundaries: {
        maxSteps: number;
        timeoutMs: number;
    };
}
export declare class TemplateEngine {
    constructor();
    private expandBlocks;
    buildPlan(template: DiagnosticTemplate, context: {
        sessionId: string;
        bounded?: boolean;
        stepBudget?: number;
        vars?: Record<string, any>;
    }): PlanResult;
    private replaceVars;
    private tryParse;
    private selectJsonPath;
    evaluateEvidence(template: DiagnosticTemplate, executed: Array<{
        step: PlannedStep;
        result: any;
    }>): {
        completeness: number;
        missing: string[];
        present: string[];
    };
}
