import { GuardsRubric, MappingRubric, ScoringRubric, TemplateRubrics, WeightedRubric } from './rubric-registry.js';
import { ExprEvaluator, normalize } from './expr.js';

export interface WeightedRubricResult {
  id: string;
  kind: 'weighted';
  score: number; // 0..1
  label?: string | undefined; // band
  bands?: Record<string, string>;
  inputs: Record<string, number>;
  breakdown: Record<string, number>; // input -> normalized value
}

export interface GuardsRubricResult {
  id: string;
  kind: 'guards';
  allowAuto: boolean;
  guards: string[];
  failing: string[];
}

export interface MappingRubricResult {
  id: string;
  kind: 'mapping';
  label: string; // chosen mapping label
  matched: string; // expression matched
}

export interface RubricResultsMap {
  triage?: WeightedRubricResult | MappingRubricResult;
  confidence?: MappingRubricResult;
  safety?: GuardsRubricResult;
  slo?: MappingRubricResult;
  similarity?: MappingRubricResult;
  runbookFitness?: WeightedRubricResult | MappingRubricResult;
  [key: string]: any;
}

const expr = new ExprEvaluator();

export function evaluateWeighted(r: WeightedRubric, inputs: Record<string, any>): WeightedRubricResult {
  const breakdown: Record<string, number> = {};
  let score = 0;
  for (const key of r.inputs) {
    const raw = Number(inputs[key] ?? 0);
    const normSpec = r.normalize?.[key];
    const val = normalize(raw, normSpec);
    breakdown[key] = val;
    score += (r.weights[key] ?? 0) * val;
  }
  // Determine band label (first satisfied by descending threshold order)
  let label: string | undefined;
  if (r.bands) {
    // Preserve insertion order as encoded
    for (const [band, raw] of Object.entries(r.bands)) {
      const condition = normalizeBandExpr(raw);
      if (condition.toLowerCase() === 'otherwise') { label = label ?? band; continue; }
      const ok = expr.evaluate(condition, { score });
      if (ok && !label) label = band;
    }
  }
  return { id: r.id, kind: 'weighted', score, label, bands: r.bands, inputs: pick(inputs, r.inputs), breakdown };
}

export function evaluateGuards(r: GuardsRubric, inputs: Record<string, any>): GuardsRubricResult {
  const failing: string[] = [];
  for (const g of r.guards) {
    try {
      const ok = expr.evaluate(g, inputs);
      if (!ok) failing.push(g);
    } catch {
      failing.push(g);
    }
  }
  const allowAuto = failing.length === 0;
  return { id: r.id, kind: 'guards', allowAuto, guards: r.guards.slice(), failing };
}

export function evaluateMapping(r: MappingRubric, inputs: Record<string, any>): MappingRubricResult {
  for (const [label, condition] of Object.entries(r.mapping)) {
    try {
      const ok = expr.evaluate(condition, inputs);
      if (ok) return { id: r.id, kind: 'mapping', label, matched: condition };
    } catch {/* ignore and continue */}
  }
  // Fallback
  return { id: r.id, kind: 'mapping', label: 'Unknown', matched: 'n/a' };
}

export function evaluateRubrics(rubrics: TemplateRubrics | undefined, inputs: Record<string, any>): RubricResultsMap {
  const out: RubricResultsMap = {};
  if (!rubrics) return out;
  for (const [key, r] of Object.entries(rubrics)) {
    const rb = r as ScoringRubric;
    if (rb.kind === 'weighted') out[key] = evaluateWeighted(rb as WeightedRubric, inputs);
    else if (rb.kind === 'guards') out[key] = evaluateGuards(rb as GuardsRubric, inputs);
    else if (rb.kind === 'mapping') out[key] = evaluateMapping(rb as MappingRubric, inputs);
  }
  return out;
}

function pick(obj: Record<string, any>, keys: string[]): Record<string, any> {
  const o: Record<string, any> = {};
  keys.forEach(k => o[k] = obj[k]);
  return o;
}

function normalizeBandExpr(exprStr: string): string {
  const s = (exprStr || '').trim();
  if (!s) return s;
  // If the expression starts with an operator, prefix with 'score '
  if (/^(>=|<=|==|!=|>|<)/.test(s)) return `score ${s}`;
  // If it references 'score' explicitly or any identifier, keep as-is
  return s;
}
