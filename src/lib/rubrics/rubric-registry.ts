// Rubric Registry (scaffold)
// Organizes rubric configs and evaluators by domain: core, diagnostic, intelligence.

export type RubricKind = 'weighted' | 'guards' | 'mapping';

export interface WeightedRubric {
  id: string;
  kind: 'weighted';
  inputs: string[];
  weights: Record<string, number>;
  normalize?: Record<string, string>; // e.g., "time:clamp:0..180->0..1"
  bands: Record<string, string>; // e.g., { P1: ">=0.8", P2: ">=0.55", P3: "otherwise" }
}

export interface GuardsRubric {
  id: string;
  kind: 'guards';
  guards: string[]; // e.g., ["etcdHealthy == true", "affectedNamespaces <= 3"]
  decision: { allowAuto: string }; // e.g., "all guards true"
}

export interface MappingRubric {
  id: string;
  kind: 'mapping';
  inputs: string[];
  mapping: Record<string, string>; // label -> expression
}

export type ScoringRubric = WeightedRubric | GuardsRubric | MappingRubric;

export interface TemplateRubrics {
  triage?: ScoringRubric;
  confidence?: ScoringRubric;
  safety?: ScoringRubric;
  slo?: ScoringRubric;
  similarity?: ScoringRubric;
  runbookFitness?: ScoringRubric;
}

export class RubricRegistry {
  private byId = new Map<string, ScoringRubric>();

  register(r: ScoringRubric): void {
    this.byId.set(r.id, r);
  }

  getById(id: string): ScoringRubric | undefined {
    return this.byId.get(id);
  }

  list(): ScoringRubric[] {
    return Array.from(this.byId.values());
  }
}

// Namespaced exports: rubrics will be organized under subfolders
// src/lib/rubrics/core/*
// src/lib/rubrics/diagnostic/*
// src/lib/rubrics/intelligence/*

// Loader for core rubrics (P0 set)
export async function loadCoreRubrics(reg: RubricRegistry): Promise<void> {
  try {
    const { TRIAGE_PRIORITY_V1 } = await import('./core/triage-priority.v1.js');
    const { EVIDENCE_CONFIDENCE_V1 } = await import('./core/evidence-confidence.v1.js');
    const { REMEDIATION_SAFETY_V1 } = await import('./core/remediation-safety.v1.js');
    reg.register(TRIAGE_PRIORITY_V1);
    reg.register(EVIDENCE_CONFIDENCE_V1);
    reg.register(REMEDIATION_SAFETY_V1);
  } catch {
    // ignore if not resolvable in certain build contexts; tests can import directly
  }
}

