import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' };
}

type Scenario = { name: string; checks: any[]; overallStatus: 'degraded'|'failing'|'healthy'; expected: string };

const scenarios: Scenario[] = [
  {
    name: 'service_no_backends',
    checks: [ mkCheck('Network and Service Health', ['Services without endpoints: 2']) ],
    overallStatus: 'degraded', expected: 'service_no_backends'
  },
  {
    name: 'image_pull_failures',
    checks: [ mkCheck('Recent Events', ['ImagePullBackOff']) ],
    overallStatus: 'degraded', expected: 'image_pull_failures'
  },
  {
    name: 'probe_failures',
    checks: [ mkCheck('Recent Events', ['Readiness probe failed']) ],
    overallStatus: 'degraded', expected: 'probe_failures'
  },
  {
    name: 'resource_quota_exceeded',
    checks: [ mkCheck('Resource Constraints and Quotas', ['Quota violations: 3']) ],
    overallStatus: 'degraded', expected: 'resource_quota_exceeded'
  },
  {
    name: 'node_instability',
    checks: [ mkCheck('Node Health and Capacity', ['Node n1 not ready: KubeletNotReady']) ],
    overallStatus: 'degraded', expected: 'node_instability'
  },
  {
    name: 'resource_pressure',
    checks: [ mkCheck('Recent Events', ['FailedScheduling: Insufficient cpu']) ],
    overallStatus: 'degraded', expected: 'resource_pressure'
  }
];

describe('RCA scenario matrix', () => {
  test.each(scenarios)('%s', (s) => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = { checksPerformed: s.checks, summary: { totalChecks: s.checks.length, passed: 0, failed: 0, warnings: s.checks.length }, overallStatus: s.overallStatus };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe(s.expected);
  });
});

