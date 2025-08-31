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
        const have = required.length - missing.length;
        const completeness = required.length === 0 ? 1 : have / required.length;
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
    const score = required.length === 0 ? 1 : present.length / required.length;
    return { score, missing, present };
}
export function getRequiredFieldsForTemplate(templateType) {
    const t = String(templateType || '').toLowerCase();
    if (t.includes('ingress'))
        return ['routerPods', 'schedulingEvents', 'controllerStatus'];
    if (t.includes('cluster-health'))
        return ['nodesSummary', 'podSummary', 'controlPlaneAlerts', 'fanoutHint'];
    if (t.includes('pvc'))
        return ['pvcEvents', 'storageClass', 'topologyHints'];
    return [];
}
