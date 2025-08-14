import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' };
}

describe('RCA probe prioritization', () => {
  test('image pull beats probe failures when both present', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [ 'ImagePullBackOff', 'Readiness probe failed' ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('image_pull_failures');
  });

  test('probe chosen when no stronger signals present', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [ mkCheck('Recent Events', [ 'Liveness probe failed' ]) ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('probe_failures');
  });
});

