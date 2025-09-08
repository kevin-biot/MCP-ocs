// Rubric Registry (scaffold)
// Organizes rubric configs and evaluators by domain: core, diagnostic, intelligence.
export class RubricRegistry {
    byId = new Map();
    register(r) {
        this.byId.set(r.id, r);
    }
    getById(id) {
        return this.byId.get(id);
    }
    list() {
        return Array.from(this.byId.values());
    }
}
// Namespaced exports: rubrics will be organized under subfolders
// src/lib/rubrics/core/*
// src/lib/rubrics/diagnostic/*
// src/lib/rubrics/intelligence/*
// Loader for core rubrics (P0 set)
export async function loadCoreRubrics(reg) {
    try {
        const { TRIAGE_PRIORITY_V1 } = await import('./core/triage-priority.v1.js');
        const { EVIDENCE_CONFIDENCE_V1 } = await import('./core/evidence-confidence.v1.js');
        const { REMEDIATION_SAFETY_V1 } = await import('./core/remediation-safety.v1.js');
        reg.register(TRIAGE_PRIORITY_V1);
        reg.register(EVIDENCE_CONFIDENCE_V1);
        reg.register(REMEDIATION_SAFETY_V1);
    }
    catch {
        // ignore if not resolvable in certain build contexts; tests can import directly
    }
}
