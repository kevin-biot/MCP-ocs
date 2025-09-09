/**
 * Triage types for oc_triage Phase 0
 */
export type TriageIntent = 'pvc-binding' | 'scheduling-failures' | 'ingress-pending';
export interface TriageInput {
    sessionId?: string;
    intent: TriageIntent;
    namespace: string;
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
    completeness: number;
    missing?: string[];
    present?: string[];
}
export interface TriageEnvelope {
    routing: TriageRouting;
    rubrics: TriageRubrics;
    summary: string;
    evidence: TriageEvidence;
    nextActions?: Array<{
        action: string;
        safety: 'safe' | 'risky';
        rationale?: string;
    }>;
    promptSuggestions?: string[];
    followUpTools?: Array<{
        tool: string;
        parameters: Record<string, unknown>;
    }>;
}
