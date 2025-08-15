import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

describe('RCA analyzeResourceConstraints with quota thresholds', () => {
  test('flags >80% CPU usage when used/hard exceed threshold', () => {
    const engine = new RCAChecklistEngine({} as any);
    const quotas = {
      items: [
        { metadata: { name: 'q1', namespace: 'ns' }, status: { hard: { 'cpu': '1' }, used: { 'cpu': '900m' } } },
        { metadata: { name: 'q2', namespace: 'ns' }, status: { hard: { 'memory': '1Gi' }, used: { 'memory': '512Mi' } } }
      ]
    };
    const limits = { items: [] };
    const res = (engine as any).analyzeResourceConstraints(quotas, limits);
    expect(res.totalQuotas).toBe(2);
    expect(res.constraintsViolated).toBeGreaterThanOrEqual(1);
    expect(res.issues.some((i: string) => i.includes('q1'))).toBe(true);
  });
});

