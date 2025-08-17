import { evaluateWeighted, evaluateGuards, evaluateMapping, evaluateRubrics } from '../../../src/lib/rubrics/rubric-evaluator.ts';

describe('RubricEvaluator (unit)', () => {
  it('evaluates weighted rubric with bands', () => {
    const r = {
      id: 'triage-priority.v1',
      kind: 'weighted' as const,
      inputs: ['a','b'],
      weights: { a: 0.5, b: 0.5 },
      bands: { High: '>=0.8', Low: 'otherwise' }
    };
    const res1 = evaluateWeighted(r, { a: 1, b: 0 });
    expect(res1.score).toBeCloseTo(0.5, 5);
    expect(res1.label).toBe('Low');
    const res2 = evaluateWeighted(r, { a: 1, b: 1 });
    expect(res2.label).toBe('High');
  });
  it('supports explicit score in bands', () => {
    const r = {
      id: 't2', kind: 'weighted' as const,
      inputs: ['x'], weights: { x: 1 },
      bands: { P1: 'score>=0.9', P2: '>=0.5', P3: 'otherwise' }
    };
    expect(evaluateWeighted(r, { x: 0.95 }).label).toBe('P1');
    expect(evaluateWeighted(r, { x: 0.75 }).label).toBe('P2');
    expect(evaluateWeighted(r, { x: 0.2 }).label).toBe('P3');
  });

  it('evaluates guards rubric and lists failing guards', () => {
    const r = {
      id: 'remediation-safety.v1',
      kind: 'guards' as const,
      guards: ['x == true', 'y <= 3'],
      decision: { allowAuto: 'all guards true' }
    };
    const ok = evaluateGuards(r, { x: true, y: 2 });
    expect(ok.allowAuto).toBe(true);
    const bad = evaluateGuards(r, { x: true, y: 5 });
    expect(bad.allowAuto).toBe(false);
    expect(bad.failing).toContain('y <= 3');
  });

  it('evaluates mapping rubric with precedence', () => {
    const r = {
      id: 'evidence-confidence.v1',
      kind: 'mapping' as const,
      inputs: ['evidenceCompleteness','toolAgreement','freshnessMin'],
      mapping: {
        High: 'evidenceCompleteness>=0.9 && toolAgreement>=0.8 && freshnessMin<=10',
        Medium: 'evidenceCompleteness>=0.75',
        Low: 'otherwise'
      }
    };
    const hi = evaluateMapping(r, { evidenceCompleteness: 0.92, toolAgreement: 0.85, freshnessMin: 5 });
    expect(hi.label).toBe('High');
    const med = evaluateMapping(r, { evidenceCompleteness: 0.8, toolAgreement: 0.1, freshnessMin: 100 });
    expect(med.label).toBe('Medium');
    const low = evaluateMapping(r, { evidenceCompleteness: 0.6 });
    expect(low.label).toBe('Low');
  });

  it('evaluateRubrics aggregates results across kinds', () => {
    const rubrics = {
      triage: { id: 't', kind: 'weighted' as const, inputs: ['a'], weights: { a: 1 }, bands: { P1: '>=0.8', P2: 'otherwise' } },
      safety: { id: 's', kind: 'guards' as const, guards: ['a >= 1'], decision: { allowAuto: 'all guards true' } },
      confidence: { id: 'c', kind: 'mapping' as const, inputs: ['a'], mapping: { High: 'a>=0.9', Low: 'otherwise' } }
    };
    const out = evaluateRubrics(rubrics as any, { a: 0.9 });
    expect(out.triage.label).toBe('P1');
    expect(out.safety.allowAuto).toBe(false); // 0.9 >= 1 fails
    expect(out.confidence.label).toBe('High');
  });
});
