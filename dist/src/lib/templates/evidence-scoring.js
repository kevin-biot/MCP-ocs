export class EvidenceCompletenessCalculator {
    static calculateCompleteness(evidence, requiredFields) {
        if (!evidence || !requiredFields || requiredFields.length === 0)
            return 1;
        let completed = 0;
        for (const field of requiredFields) {
            const v = this.getFieldValue(evidence, field);
            if (this.isFieldComplete(v))
                completed++;
        }
        const score = completed / requiredFields.length;
        return Math.round(score * 100) / 100;
    }
    static isFieldComplete(value) {
        if (value === null || typeof value === 'undefined')
            return false;
        if (typeof value === 'string' && value.trim() === '')
            return false;
        if (Array.isArray(value) && value.length === 0)
            return false;
        return true;
    }
    static getFieldValue(obj, path) {
        try {
            // Simple dot-path support
            if (!path || typeof path !== 'string')
                return undefined;
            const segs = path.split('.');
            let cur = obj;
            for (const s of segs) {
                if (cur == null)
                    return undefined;
                cur = cur[s];
            }
            return cur;
        }
        catch {
            return undefined;
        }
    }
}
export function getRequiredFieldsForTemplateType(templateType) {
    const t = String(templateType || '').toLowerCase();
    if (t.includes('ingress'))
        return ['routerPods', 'schedulingEvents', 'controllerStatus'];
    if (t.includes('cluster-health'))
        return ['nodesSummary', 'podSummary', 'controlPlaneAlerts', 'fanoutHint'];
    if (t.includes('pvc'))
        return ['pvcEvents', 'storageClass', 'topologyHints'];
    return [];
}
export class EvidenceThresholdManager {
    static DEFAULT_THRESHOLD = 0.9;
    static LEGACY_THRESHOLD = 0.7;
    static LEGACY_IDS = new Set([]);
    static thresholdFor(templateId, fallback) {
        if (this.LEGACY_IDS.has(templateId))
            return this.LEGACY_THRESHOLD;
        if (typeof fallback === 'number')
            return fallback;
        return this.DEFAULT_THRESHOLD;
    }
}
