// Triage Envelope Interfaces for ADR-023 (oc_triage)

export type SafetyDecision = 'ALLOW' | 'BLOCK' | 'REQUIRES_APPROVAL';

export interface TriageRouting {
  intent: string;         // canonical, e.g., 'pvc-binding', 'scheduling-failures'
  templateId: string;     // selected template id (e.g., 'pvc-binding-v1')
  bounded: boolean;       // whether bounded execution was applied
  stepBudget: number;     // requested/used step budget
}

export interface TriageRubricsSummary {
  safety: SafetyDecision;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  confidence: 'Low' | 'Medium' | 'High';
}

export interface StructuredEvidence {
  completeness: number;        // 0..1
  minThreshold?: number;       // evidence contract threshold (if present)
  missing?: string[];
  present?: string[];
}

export interface SafetyClassifiedAction {
  command: string;
  type: 'read-only' | 'mutating';
  safety: 'SAFE' | 'REQUIRES_APPROVAL' | 'DANGEROUS';
  description: string;
}

export interface StructuredToolCall {
  tool: string;
  params: Record<string, unknown>;
  durationMs?: number;
}

export interface TriageEnvelope {
  routing: TriageRouting;
  rubrics: TriageRubricsSummary;
  summary: string;
  evidence: StructuredEvidence;
  nextActions: SafetyClassifiedAction[];
  promptSuggestions: string[];
  followUpTools?: StructuredToolCall[];
}

