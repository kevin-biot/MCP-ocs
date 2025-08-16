import { DiagnosticTemplate } from './template-types.js';

export interface PlannedStep {
  tool: string;
  params: Record<string, any>;
  rationale?: string;
}

export interface PlanResult {
  planId: string;
  steps: PlannedStep[];
  boundaries: { maxSteps: number; timeoutMs: number };
}

export class TemplateEngine {
  constructor() {}

  buildPlan(template: DiagnosticTemplate, context: { sessionId: string; bounded?: boolean; stepBudget?: number }): PlanResult {
    const budget = Math.max(1, Math.min(context.stepBudget || template.boundaries.maxSteps || template.steps.length, template.steps.length));
    const steps = template.steps.slice(0, budget).map(s => ({ tool: s.tool, params: { sessionId: context.sessionId, ...s.params }, rationale: s.rationale }));
    return {
      planId: context.sessionId,
      steps,
      boundaries: { maxSteps: budget, timeoutMs: template.boundaries.timeoutMs },
    };
  }
}

