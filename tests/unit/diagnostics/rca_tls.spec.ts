import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

function mkCheck(name: string, findings: string[]): any {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' };
}

describe('RCA route/TLS failures', () => {
  test('detects TLS/certificate patterns', () => {
    const engine = new RCAChecklistEngine({} as any);
    const res: any = {
      checksPerformed: [
        mkCheck('Recent Events', [
          'x509: certificate signed by unknown authority',
          'tls handshake timeout'
        ])
      ],
      summary: { totalChecks: 1, passed: 0, failed: 0, warnings: 1 },
      overallStatus: 'degraded'
    };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe('route_tls_failure');
  });
});

