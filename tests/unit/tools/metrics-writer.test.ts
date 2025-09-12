import { promises as fs } from 'fs';
import path from 'path';
import { appendMetricsV2, metricsVectorIdentifiers, MetricsRecordV2 } from '../../../src/lib/tools/metrics-writer';

const METRICS = path.resolve('analytical-artifacts/08-technical-metrics-data.json');

describe('metrics-writer', () => {
  beforeAll(async () => {
    await fs.mkdir(path.dirname(METRICS), { recursive: true });
  });
  beforeEach(async () => {
    await fs.writeFile(METRICS, '[]');
  });

  it('appends records without throwing', async () => {
    const rec: MetricsRecordV2 = {
      toolId: 't1', opType: 'read', mode: 'json', elapsedMs: 12, outcome: 'ok', errorSummary: null,
      cleanupCheck: true, anchors: [], timestamp: new Date().toISOString(), sessionId: 's1'
    };
    await appendMetricsV2(rec);
    await appendMetricsV2({ ...rec, toolId: 't2' });
    const raw = JSON.parse(await fs.readFile(METRICS, 'utf8'));
    expect(raw).toHaveLength(2);
    expect(raw[0].toolId).toBe('t1');
    expect(raw[1].toolId).toBe('t2');
  });

  it('returns vector identifiers from env with fallbacks', () => {
    process.env.CHROMA_TENANT = 'tenantX';
    process.env.CHROMA_DATABASE = 'dbY';
    delete (process.env as any).CHROMA_COLLECTION;
    process.env.CHROMA_COLLECTION_PREFIX = 'pref-';
    expect(metricsVectorIdentifiers()).toEqual({ tenant: 'tenantX', database: 'dbY', collection: 'pref-' });
    process.env.CHROMA_COLLECTION = 'unified-coll';
    delete (process.env as any).CHROMA_COLLECTION_PREFIX;
    expect(metricsVectorIdentifiers()).toEqual({ tenant: 'tenantX', database: 'dbY', collection: 'unified-coll' });
  });

  it('swallows fs errors (does not throw)', async () => {
    const spy = jest.spyOn(fs, 'rename').mockRejectedValueOnce(new Error('fs blocked'));
    const rec: MetricsRecordV2 = {
      toolId: 't3', opType: 'read', mode: 'json', elapsedMs: 1, outcome: 'ok', errorSummary: null,
      cleanupCheck: true, anchors: [], timestamp: new Date().toISOString(), sessionId: 's1'
    };
    await expect(appendMetricsV2(rec)).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

