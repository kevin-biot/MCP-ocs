import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' };
}

describe('RCA TLS/cert corner cases', () => {
  test('expired certificate triggers route_tls_failure', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [
          'x509: certificate has expired or is not yet valid'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('route_tls_failure');
  });

  test('handshake verify failure triggers route_tls_failure', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [ mkCheck('Recent Events', ['tls: handshake failure', 'verify failed: unknown authority']) ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('route_tls_failure');
  });
});

