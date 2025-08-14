import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return {
    name,
    status: 'warning',
    findings,
    recommendations: [],
    duration: 0,
    severity: 'medium'
  };
}

describe('RCA intelligent root cause derivation', () => {
  test('storage no default storageclass', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Storage and PVC Health', [
          'Default storage class: NONE (issue!)',
          'Pending PVCs: 3'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('storage_no_default_storageclass');
  });

  test('services without endpoints', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Network and Service Health', [
          'Services: 10 configured',
          'Routes: 2 configured',
          'Services without endpoints: 4'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('service_no_backends');
  });
});

