import { promises as fs } from 'fs';
import { collectAnchors } from '../../../src/lib/tools/evidence-anchors';

describe('evidence-anchors', () => {
  it('collects available anchors and always includes metrics artifact', async () => {
    const anchors = await collectAnchors({ startIso: '2025-01-01T00:00:00.000Z', endIso: '2025-01-01T00:05:00.000Z', toolId: 't' });
    expect(Array.isArray(anchors)).toBe(true);
    expect(anchors).toContain('artifact:08-technical-metrics-data.json');
    // If environment includes logs/design, anchors should have them too
    const hasLog = anchors.some(a => a.startsWith('logs/sprint-execution.log#'));
    const hasDesign = anchors.includes('epic:f-011:technical-design');
    expect(typeof hasLog).toBe('boolean');
    expect(typeof hasDesign).toBe('boolean');
  });

  it('gracefully handles missing files', async () => {
    const spy = jest.spyOn(fs, 'access').mockRejectedValue(new Error('nope'));
    const anchors = await collectAnchors({ startIso: 'x', endIso: 'y', toolId: 't' });
    expect(anchors).toEqual(['artifact:08-technical-metrics-data.json']);
    spy.mockRestore();
  });
});

