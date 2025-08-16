import { DiagnosticTemplate } from './template-types.js';
import { BlockRegistry } from './blocks/block-registry.js';

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

  private expandBlocks(template: DiagnosticTemplate, ctxVars: Record<string, any>): PlannedStep[] {
    const out: PlannedStep[] = [];
    for (const b of template.blocks || []) {
      switch (b) {
        case 'events_scheduling':
          if (ctxVars.ns && ctxVars.pod) out.push(...BlockRegistry.infra.events_scheduling(ctxVars.sessionId, ctxVars.ns, ctxVars.pod));
          break;
        case 'pod_constraints':
          if (ctxVars.ns && ctxVars.controller) out.push(...BlockRegistry.infra.pod_constraints(ctxVars.sessionId, ctxVars.ns, ctxVars.controller));
          break;
        default:
          break;
      }
    }
    return out;
  }

  buildPlan(template: DiagnosticTemplate, context: { sessionId: string; bounded?: boolean; stepBudget?: number; vars?: Record<string, any> }): PlanResult {
    const baseSteps = (template.steps || []).map(s => ({ tool: s.tool, params: { sessionId: context.sessionId, ...s.params }, rationale: s.rationale }));
    const blockSteps = this.expandBlocks(template, { sessionId: context.sessionId, ...(context.vars || {}) });
    const combined = [...baseSteps, ...blockSteps];
    const max = combined.length || 1;
    const budget = Math.max(1, Math.min(context.stepBudget || template.boundaries.maxSteps || max, max));
    const steps = combined.slice(0, budget);
    return { planId: context.sessionId, steps, boundaries: { maxSteps: budget, timeoutMs: template.boundaries.timeoutMs } };
  }

  evaluateEvidence(template: DiagnosticTemplate, executed: PlannedStep[]): { completeness: number; missing: string[]; present: string[] } {
    const req = template.evidenceContract?.required || [];
    const present: string[] = [];
    const ran = (tool: string, resource?: string) => executed.some(s => s.tool === tool && (!resource || String(s.params?.resourceType||'').toLowerCase() === resource));
    for (const key of req) {
      switch (key) {
        case 'routerPods':
          if (ran('oc_read_get_pods')) present.push(key);
          break;
        case 'schedulingEvents':
          if (ran('oc_read_describe', 'pod')) present.push(key);
          break;
        case 'controllerStatus':
          if (ran('oc_read_describe', 'ingresscontroller')) present.push(key);
          break;
        case 'nodeTaints':
          if (ran('oc_read_describe', 'node')) present.push(key);
          break;
        case 'lastLogs':
          if (ran('oc_read_logs')) present.push(key);
          break;
        case 'probeConfig':
          if (ran('oc_read_describe', 'pod')) present.push(key);
          break;
        case 'pvcSpec':
          if (ran('oc_read_describe', 'pvc')) present.push(key);
          break;
        case 'scInfo':
          if (ran('oc_read_describe', 'storageclass')) present.push(key);
          break;
        case 'quota':
          if (ran('oc_read_describe', 'resourcequota')) present.push(key);
          break;
        case 'endpoints':
          if (ran('oc_read_describe', 'endpoints')) present.push(key);
          break;
        case 'routeSpec':
          if (ran('oc_read_describe', 'route')) present.push(key);
          break;
        default:
          break;
      }
    }
    const missing = req.filter(k => !present.includes(k));
    const completeness = req.length === 0 ? 1 : (req.length - missing.length) / req.length;
    return { completeness, missing, present };
  }
}
