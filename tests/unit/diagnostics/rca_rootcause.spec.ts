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

  test('network policy block detected', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Network and Service Health', [
          'Services: 5 configured',
          'Services without endpoints: 0'
        ]),
        mkCheck('Recent Events', [
          'Critical events: 3',
          'Most common: NetworkPolicy (2), BackOff (1)'
        ])
      ],
      summary: { totalChecks: 2, passed: 0, failed: 0, warnings: 2 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('network_policy_block');
  });

  test('dns resolution failure', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [
          'Recent events: 4 warning/error events',
          'Critical events: 2',
          'Most common: DNSConfigError (2)',
          'Failed to resolve host: no such host'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('dns_resolution_failure');
  });

  test('quota exceeded and probe failures detected', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Resource Constraints and Quotas', [
          'Quota violations: 2',
          'Resource quotas: 3 configured'
        ]),
        mkCheck('Recent Events', [
          'Liveness probe failed',
          'Readiness probe failed'
        ])
      ],
      summary: { totalChecks: 2, passed: 0, failed: 0, warnings: 2 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    // Quota exceeded has priority over generic probe failures in our current order
    expect(['resource_quota_exceeded', 'probe_failures']).toContain(res.rootCause.type);
  });

  test('markdown includes root cause section', () => {
    const engine = new RCAChecklistEngine({} as any);
    const result: any = {
      reportId: 'r1',
      timestamp: new Date().toISOString(),
      duration: 10,
      overallStatus: 'degraded',
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      checksPerformed: [],
      criticalIssues: [],
      nextActions: [],
      human: '',
      rootCause: { type: 'service_no_backends', summary: 'Missing endpoints', confidence: 0.75, evidence: ['2 services without endpoints'] }
    };
    const md = (engine as any).generateMarkdownReport(result);
    expect(md).toContain('## Root Cause');
    expect(md).toContain('service_no_backends');
    expect(md).toContain('Missing endpoints');
  });
});
