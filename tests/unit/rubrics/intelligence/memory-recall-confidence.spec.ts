import { evaluateRubrics } from '../../../../src/lib/rubrics/rubric-evaluator.js';
import { MEMORY_RECALL_CONFIDENCE_V1 } from '../../../../src/lib/rubrics/intelligence/memory-recall-confidence.v1.js';

describe('MEMORY_RECALL_CONFIDENCE_V1', () => {
  it('labels High for strong and fresh recall', () => {
    const res = evaluateRubrics({ recall: MEMORY_RECALL_CONFIDENCE_V1 } as any, { recallSimilarity: 0.9, recallFreshnessMin: 60 });
    expect(res.recall.kind).toBe('mapping');
    expect(res.recall.label).toBe('High');
  });

  it('labels Medium for decent similarity', () => {
    const res = evaluateRubrics({ recall: MEMORY_RECALL_CONFIDENCE_V1 } as any, { recallSimilarity: 0.65, recallFreshnessMin: 50000 });
    expect(res.recall.label).toBe('Medium');
  });

  it('labels Medium for recent but low similarity', () => {
    const res = evaluateRubrics({ recall: MEMORY_RECALL_CONFIDENCE_V1 } as any, { recallSimilarity: 0.2, recallFreshnessMin: 1000 });
    expect(res.recall.label).toBe('Medium');
  });

  it('labels Low otherwise', () => {
    const res = evaluateRubrics({ recall: MEMORY_RECALL_CONFIDENCE_V1 } as any, { recallSimilarity: 0.2, recallFreshnessMin: 999999 });
    expect(res.recall.label).toBe('Low');
  });
});

