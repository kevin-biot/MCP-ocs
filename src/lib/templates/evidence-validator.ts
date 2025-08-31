import { VersionedEvidenceContract } from './template-types.js';

export interface EvidenceMap { [key: string]: any }

export class EvidenceValidator {
  constructor(private contract: VersionedEvidenceContract) {}

  // Minimal stub: check presence of required keys
  validate(evidence: EvidenceMap): { completeness: number; missing: string[] } {
    const missing: string[] = [];
    const required = this.contract.required || [];
    for (const key of required) {
      const v = evidence[key];
      const present = Array.isArray(v) ? v.length > 0 : typeof v !== 'undefined' && v !== null && v !== '';
      if (!present) missing.push(key);
    }
    const have = required.length - missing.length;
    const completeness = required.length === 0 ? 1 : have / required.length;
    return { completeness, missing };
  }
}

// Template-type specific completeness helper
export function calculateEvidenceCompleteness(evidence: EvidenceMap, templateType: string): { score: number; missing: string[]; present: string[] } {
  const required = getRequiredFieldsForTemplate(templateType);
  const present: string[] = [];
  const missing: string[] = [];
  for (const key of required) {
    const v = evidence[key];
    const ok = Array.isArray(v) ? v.length > 0 : Boolean(v);
    if (ok) present.push(key); else missing.push(key);
  }
  const score = required.length === 0 ? 1 : present.length / required.length;
  return { score, missing, present };
}

export function getRequiredFieldsForTemplate(templateType: string): string[] {
  const t = String(templateType || '').toLowerCase();
  if (t.includes('ingress')) return ['routerPods', 'schedulingEvents', 'controllerStatus'];
  if (t.includes('cluster-health')) return ['nodesSummary', 'podSummary', 'controlPlaneAlerts', 'fanoutHint'];
  if (t.includes('pvc')) return ['pvcEvents', 'storageClass', 'topologyHints'];
  return [];
}
