import { EvidenceCompletenessCalculator, getRequiredFieldsForTemplateType } from './evidence-scoring.js';
export class EvidenceValidator {
    contract;
    constructor(contract) {
        this.contract = contract;
    }
    // Minimal stub: check presence of required keys
    validate(evidence) {
        const missing = [];
        const required = this.contract.required || [];
        for (const key of required) {
            const v = evidence[key];
            const present = Array.isArray(v) ? v.length > 0 : typeof v !== 'undefined' && v !== null && v !== '';
            if (!present)
                missing.push(key);
        }
        const completeness = EvidenceCompletenessCalculator.calculateCompleteness(evidence, required);
        return { completeness, missing };
    }
}
// Template-type specific completeness helper
export function calculateEvidenceCompleteness(evidence, templateType) {
    const required = getRequiredFieldsForTemplate(templateType);
    const present = [];
    const missing = [];
    for (const key of required) {
        const v = evidence[key];
        const ok = Array.isArray(v) ? v.length > 0 : Boolean(v);
        if (ok)
            present.push(key);
        else
            missing.push(key);
    }
    const score = EvidenceCompletenessCalculator.calculateCompleteness(evidence, required);
    return { score, missing, present };
}
export function getRequiredFieldsForTemplate(templateType) {
    return getRequiredFieldsForTemplateType(templateType);
}
