import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' };
}

describe('RCA additional root cause scenarios', () => {
  test('resource pressure from FailedScheduling/Insufficient', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [
          'Recent events: 3 warning/error events',
          'Critical events: 2',
          'Most common: FailedScheduling (2)',
          'Pod unschedulable: Insufficient memory'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('resource_pressure');
  });

  test('application instability from CrashLoopBackOff/OOMKilled', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [
          'Recent events: 4 warning/error events',
          'Critical events: 3',
          'Most common: CrashLoopBackOff (2), OOMKilled (1)'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('application_instability');
  });

  test('storage provisioner blocked by NetworkPolicy with pending PVCs', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Storage and PVC Health', [
          'PVCs: 10/20 bound',
          'Pending PVCs: 10'
        ]),
        mkCheck('Recent Events', [
          'NetworkPolicy denied egress traffic'
        ])
      ],
      summary: { totalChecks: 2, passed: 0, failed: 0, warnings: 2 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('storage_provisioner_blocked_by_network_policy');
  });

  test('unknown when degraded without recognizable patterns', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [ mkCheck('Namespace Health: ns', ['Namespace status: degraded']) ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('namespace_health_degraded');
  });
});

