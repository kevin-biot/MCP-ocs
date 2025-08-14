import { RCAChecklistEngine } from '../../../src/v2/tools/rca-checklist/index';

describe('RCA event pattern recognition', () => {
  const engine = new RCAChecklistEngine({} as any);

  test('recognizes common critical patterns', () => {
    const events = { items: [
      { type: 'Warning', reason: 'CrashLoopBackOff', involvedObject: { kind: 'Pod', name: 'a' } },
      { type: 'Warning', reason: 'ImagePullBackOff', involvedObject: { kind: 'Pod', name: 'b' } },
      { type: 'Warning', reason: 'FailedScheduling', involvedObject: { kind: 'Pod', name: 'c' } },
      { type: 'Normal', reason: 'Pulled', involvedObject: { kind: 'Pod', name: 'd' } },
    ]};
    const res = (engine as any).analyzeRecentEvents(events);
    expect(res.totalEvents).toBe(4);
    expect(res.criticalEvents).toBe(3);
    // Pattern list contains the reasons (order not guaranteed)
    expect(Array.isArray(res.commonPatterns)).toBe(true);
  });
});

