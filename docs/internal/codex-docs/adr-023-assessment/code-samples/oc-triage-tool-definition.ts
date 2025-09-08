// oc_triage tool definition (sample) for ADR-023
// This sample shows how to implement the tool handler using existing engine/registry.

import { TemplateRegistry } from '../../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../../src/lib/templates/template-engine.js';
import { BoundaryEnforcer } from '../../../src/lib/enforcement/boundary-enforcer.js';
import { evaluateRubrics } from '../../../src/lib/rubrics/rubric-evaluator.js';
import { TRIAGE_PRIORITY_V1 } from '../../../src/lib/rubrics/core/triage-priority.v1.js';
import { EVIDENCE_CONFIDENCE_V1 } from '../../../src/lib/rubrics/core/evidence-confidence.v1.js';
import { REMEDIATION_SAFETY_V1 } from '../../../src/lib/rubrics/core/remediation-safety.v1.js';
import type { UnifiedToolRegistry } from '../../../src/lib/tools/tool-registry.js';
import type { TriageEnvelope } from './triage-envelope-interfaces.js';
import { normalizeIntent, mapIntentToTemplateTarget } from './intent-mapping-stub.js';

export function registerOcTriageTool(toolRegistry: UnifiedToolRegistry) {
  const templateRegistry = new TemplateRegistry();
  const templateEngine = new TemplateEngine();
  // Fire and forget load (server entry already loads; here for sample completeness)
  templateRegistry.load().catch(() => {});

  toolRegistry.registerTool({
    name: 'oc_triage',
    fullName: 'oc_diagnostic_triage',
    category: 'diagnostic',
    version: 'v1',
    description: 'Natural triage entry: normalizes intent and runs a bounded, deterministic template plan.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        intent: { type: 'string' },
        issue: { type: 'string' },
        namespace: { type: 'string' },
        bounded: { anyOf: [{ type: 'boolean' }, { type: 'string' }] },
        stepBudget: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
        urgency: { enum: ['low', 'medium', 'high', 'critical'] },
        sessionId: { type: 'string' },
        vars: { type: 'object' }
      },
      additionalProperties: true
    },
    async execute(args: any): Promise<string> {
      const sessionId = String(args?.sessionId || `triage-${Date.now()}`);
      const bounded = 'bounded' in (args || {}) ? coerceBool(args.bounded) : true;
      const stepBudget = clamp(coerceNum(args?.stepBudget, 3), 1, 5);
      const raw = String(args?.intent || args?.issue || args?.prompt || '').trim();
      const canon = normalizeIntent(raw);
      if (!canon) {
        throw new Error(`Unknown triage intent. Provide intent/issue/prompt like: pvc, scheduling, ingress, crashloop, 5xx, api degraded.`);
      }
      const target = mapIntentToTemplateTarget(canon);
      const sel = templateRegistry.selectByTarget(target);
      if (!sel) {
        throw new Error(`No template available for intent '${canon}' (target='${target}')`);
      }

      const vars = { ...(args?.vars || {}) } as Record<string, unknown>;
      if (typeof args?.namespace === 'string') vars.namespace = args.namespace;
      const plan = templateEngine.buildPlan(sel.template, { sessionId, bounded, stepBudget, vars });
      const enforcer = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs });
      const steps = enforcer.filterSteps(plan.steps).slice(0, stepBudget);

      // Execute deterministically via tool registry
      const exec: { tool: string; params: any; result: any; durationMs: number }[] = [];
      for (const s of steps) {
        const start = Date.now();
        const res = await toolRegistry.executeTool(s.tool, s.params);
        exec.push({ tool: s.tool, params: s.params, result: res, durationMs: Date.now() - start });
      }

      // Evidence completeness
      let evidence = { completeness: 0 } as any;
      let summaryText = 'Triage completed.';
      try {
        const ev = templateEngine.evaluateEvidence(sel.template, exec);
        const threshold = Number(sel.template?.evidenceContract?.completenessThreshold || 0);
        evidence = { completeness: ev.completeness, minThreshold: threshold, missing: ev.missing, present: ev.present };
      } catch {}

      // Rubrics
      const rub = evaluateRubrics({
        triage: TRIAGE_PRIORITY_V1,
        confidence: EVIDENCE_CONFIDENCE_V1,
        safety: REMEDIATION_SAFETY_V1
      }, { evidenceCompleteness: Number(evidence.completeness || 0) } as any);

      const env = {
        routing: {
          intent: canon,
          templateId: sel.template.id,
          bounded,
          stepBudget,
        },
        rubrics: {
          safety: rub?.safety?.allowAuto ? 'ALLOW' : 'REQUIRES_APPROVAL',
          priority: mapPriority(rub?.triage?.label),
          confidence: mapConfidence(rub?.confidence?.label),
        },
        summary: summaryText,
        evidence,
        nextActions: [],
        promptSuggestions: [],
        followUpTools: exec.map((e) => ({ tool: e.tool, params: e.params, durationMs: e.durationMs })),
      } as TriageEnvelope;

      return JSON.stringify(env, null, 2);
    },
  });
}

function coerceBool(v: any): boolean { return typeof v === 'string' ? ['true','1','yes','on'].includes(v.toLowerCase()) : Boolean(v); }
function coerceNum(v: any, d: number): number { return typeof v === 'string' ? (Number(v) || d) : (typeof v === 'number' ? v : d); }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

function mapPriority(label?: string): 'P1' | 'P2' | 'P3' | 'P4' {
  const k = String(label || '').toUpperCase();
  if (k === 'CRITICAL') return 'P1';
  if (k === 'HIGH') return 'P2';
  if (k === 'MEDIUM') return 'P3';
  return 'P4';
}
function mapConfidence(label?: string): 'Low' | 'Medium' | 'High' {
  const k = String(label || '').toUpperCase();
  if (k === 'HIGH') return 'High';
  if (k === 'MEDIUM') return 'Medium';
  return 'Low';
}

