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
    const baseSteps = (template.steps || []).map(s => ({ tool: s.tool, params: this.replaceVars({ sessionId: context.sessionId, ...s.params }, context.vars || {}), rationale: s.rationale }));
    const blockSteps = this.expandBlocks(template, { sessionId: context.sessionId, ...(context.vars || {}) });
    const combined = [...baseSteps, ...blockSteps];
    const max = combined.length || 1;
    const budget = Math.max(1, Math.min(context.stepBudget || template.boundaries.maxSteps || max, max));
    const steps = combined.slice(0, budget);
    return { planId: context.sessionId, steps, boundaries: { maxSteps: budget, timeoutMs: template.boundaries.timeoutMs } };
  }

  private replaceVars(obj: any, vars: Record<string, any>): any {
    if (obj == null) return obj;
    if (typeof obj === 'string') {
      const m = obj.match(/^<([^>]+)>$/);
      if (m) {
        const k = m[1];
        return typeof vars[k] !== 'undefined' ? vars[k] : obj;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(v => this.replaceVars(v, vars));
    if (typeof obj === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(obj)) out[k] = this.replaceVars(v, vars);
      return out;
    }
    return obj;
  }

  private tryParse(result: any): { obj: any; text: string } {
    if (typeof result === 'string') {
      try { const obj = JSON.parse(result); return { obj, text: result }; } catch { return { obj: null, text: result }; }
    }
    return { obj: result, text: JSON.stringify(result) };
  }

  private selectJsonPath(obj: any, path: string): any {
    // Very small subset: paths like { .spec.taints[*].key } or {.spec.taints}
    const m = path.match(/^\{\.(.*)\}$/);
    const dot = m ? m[1] : path.replace(/^\./,'');
    const segs = dot
      .split('.')
      .filter(Boolean)
      .map(s => s
        .replace(/\[\*\]/g, '')
        .replace(/\[\d+\]/g, '')
        .replace(/\[\]\??/g, '') // handle [] and []?
      );
    let cur: any = obj;
    for (const seg of segs) {
      if (cur == null) return undefined;
      if (Array.isArray(cur)) {
        // flatten arrays of objects by key
        cur = cur.map(x=> (x ? x[seg] : undefined)).filter(x=> typeof x !== 'undefined');
        if (cur.length === 1) cur = cur[0];
      } else {
        cur = cur[seg];
      }
    }
    return cur;
  }

  evaluateEvidence(template: DiagnosticTemplate, executed: Array<{ step: PlannedStep; result: any }>): { completeness: number; missing: string[]; present: string[] } {
    const req = template.evidenceContract?.required || [];
    const selectors = template.evidenceContract?.selectors || {} as any;
    const present: string[] = [];
    const results = executed.map(x => this.tryParse(x.result));
    const textAll = results.map(r => r.text).join('\n');
    const anyMatch = (key: string): boolean => {
      const sels = selectors[key] || [];
      for (const sel of sels) {
        if (sel.type === 'eventsRegex') {
          try {
            let pattern = sel.path || '';
            let flags = '';
            // Support inline case-insensitive prefix (?i)
            if (/^\(\?i\)/i.test(pattern)) { pattern = pattern.replace(/^\(\?i\)/i, ''); flags += 'i'; }
            const re = new RegExp(pattern, flags);
            if (re.test(textAll)) return true;
          } catch { continue; }
        } else if (sel.type === 'jsonpath') {
          for (const r of results) { if (r.obj && typeof this.selectJsonPath(r.obj, sel.path) !== 'undefined') return true; }
        } else if (sel.type === 'yq') {
          const p = sel.path.replace(/^\./,'');
          for (const r of results) { if (r.obj && typeof this.selectJsonPath(r.obj, `{.${p}}`) !== 'undefined') return true; }
        } else if (sel.type === 'dsl') {
          // For now, consider presence if any result contains the key string
          if (textAll.includes(sel.path)) return true;
        }
      }
      return false;
    };
    for (const key of req) { if (anyMatch(key)) present.push(key); }
    const missing = req.filter(k => !present.includes(k));
    const completeness = req.length === 0 ? 1 : (req.length - missing.length) / req.length;
    return { completeness, missing, present };
  }
}
