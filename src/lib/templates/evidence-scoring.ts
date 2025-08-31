export class EvidenceCompletenessCalculator {
  static calculateCompleteness(evidence: Record<string, unknown>, requiredFields: string[]): number {
    if (!evidence || !requiredFields || requiredFields.length === 0) return 1;
    let completed = 0;
    for (const field of requiredFields) {
      const v = this.getFieldValue(evidence, field);
      if (this.isFieldComplete(v)) completed++;
    }
    const score = completed / requiredFields.length;
    return Math.round(score * 100) / 100;
  }

  private static isFieldComplete(value: any): boolean {
    if (value === null || typeof value === 'undefined') return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  private static getFieldValue(obj: any, path: string): unknown {
    try {
      // Simple dot-path support
      if (!path || typeof path !== 'string') return undefined;
      const segs = path.split('.');
      let cur: any = obj;
      for (const s of segs) {
        if (cur == null) return undefined;
        cur = cur[s];
      }
      return cur;
    } catch { return undefined; }
  }
}

export function getRequiredFieldsForTemplateType(templateType: string): string[] {
  const t = String(templateType || '').toLowerCase();
  if (t.includes('ingress')) return ['routerPods', 'schedulingEvents', 'controllerStatus'];
  if (t.includes('cluster-health')) return ['nodesSummary', 'podSummary', 'controlPlaneAlerts', 'fanoutHint'];
  if (t.includes('pvc')) return ['pvcEvents', 'storageClass', 'topologyHints'];
  return [];
}

export class EvidenceThresholdManager {
  private static readonly DEFAULT_THRESHOLD = 0.9;
  private static readonly LEGACY_THRESHOLD = 0.7;
  private static readonly LEGACY_IDS = new Set<string>([]);

  static thresholdFor(templateId: string, fallback?: number): number {
    if (this.LEGACY_IDS.has(templateId)) return this.LEGACY_THRESHOLD;
    if (typeof fallback === 'number') return fallback;
    return this.DEFAULT_THRESHOLD;
  }
}

