import { VersionedEvidenceContract } from './template-types.js';
import { EvidenceCompletenessCalculator, getRequiredFieldsForTemplateType } from './evidence-scoring.js';

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
    const completeness = EvidenceCompletenessCalculator.calculateCompleteness(
      evidence,
      required
    );
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
  const score = EvidenceCompletenessCalculator.calculateCompleteness(evidence, required);
  return { score, missing, present };
}

export function getRequiredFieldsForTemplate(templateType: string): string[] {
  return getRequiredFieldsForTemplateType(templateType);
}
