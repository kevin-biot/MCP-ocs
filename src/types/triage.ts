/**
 * Triage types for oc_triage Phase 0
 */

export type TriageIntent = 'pvc-binding' | 'scheduling-failures' | 'ingress-pending';

export interface TriageInput {
  sessionId?: string;
  intent: TriageIntent;
  namespace: string; // Explicit namespace required in Phase 0
}

export interface TriageRouting {
  intent: TriageIntent;
  templateId: string;
  bounded: boolean;
  stepBudget: number;
  triggerMode: 'replace' | 'suggest' | 'observe';
}

export interface TriageRubrics {
  safety: 'ALLOW' | 'REQUIRES_APPROVAL' | 'BLOCK';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  confidence: 'Low' | 'Medium' | 'High';
}

export interface TriageEvidence {
  completeness: number; // 0..1
  missing?: string[];
  present?: string[];
}

export interface TriageEnvelope {
  routing: TriageRouting;
  rubrics: TriageRubrics;
  summary: string;
  evidence: TriageEvidence;
  nextActions?: Array<{ action: string; safety: 'safe' | 'risky'; rationale?: string }>; // minimal placeholder
  promptSuggestions?: string[];
  followUpTools?: Array<{ tool: string; parameters: Record<string, unknown> }>;
}

