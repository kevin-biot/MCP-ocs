import fs from 'node:fs';
import path from 'node:path';
import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

interface ScenarioFile { name: string; checks: { name: string; findings: string[] }[]; overallStatus: any; expected: string }

function mkCheck(name: string, findings: string[]) {
  return { name, status: 'warning', findings, recommendations: [], duration: 0, severity: 'medium' } as any;
}

describe('RCA scenario fixtures', () => {
  const dir = path.join(process.cwd(), 'tests', 'fixtures', 'rca');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  test.each(files)('%s', (file) => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const s: ScenarioFile = JSON.parse(raw);
    const engine = new RCAChecklistEngine({} as any);
    const checks = s.checks.map(c => mkCheck(c.name, c.findings));
    const res: any = { checksPerformed: checks, summary: { totalChecks: checks.length, passed: 0, failed: 0, warnings: checks.length }, overallStatus: s.overallStatus };
    (engine as any).deriveRootCause(res);
    expect(res.rootCause.type).toBe(s.expected);
  });
});
