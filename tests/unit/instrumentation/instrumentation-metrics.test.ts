import { promises as fs } from 'fs';
import path from 'path';
// Use built JS to avoid ts-jest ESM resolution issues for new modules
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { preInstrument, postInstrument, postInstrumentError } = require('../../../dist/src/lib/tools/instrumentation-middleware.js');

const METRICS = path.resolve('analytical-artifacts/08-technical-metrics-data.json');

describe('Instrumentation Middleware - Metrics v2', () => {
  beforeAll(async () => {
    await fs.mkdir(path.dirname(METRICS), { recursive: true });
  });

  beforeEach(async () => {
    // reset metrics file to empty array
    await fs.writeFile(METRICS, '[]');
  });

  it('emits schema-valid record on success', async () => {
    const pre = preInstrument('unit_test_tool', 'read-ops', { sessionId: 'sess-unit-1', k: 'v' });
    await postInstrument(pre, JSON.stringify({ ok: true }));

    const raw = await fs.readFile(METRICS, 'utf8');
    const arr = JSON.parse(raw);
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.length).toBe(1);
    const rec = arr[0];
    expect(rec.toolId).toBe('unit_test_tool');
    expect(rec.opType).toBe('read');
    expect(typeof rec.elapsedMs).toBe('number');
    expect(rec.outcome).toBe('ok');
    expect(typeof rec.timestamp).toBe('string');
    expect(rec.sessionId).toBe('sess-unit-1');
  });

  it('emits error record on failures', async () => {
    const pre = preInstrument('unit_test_tool', 'diagnostic', { sessionId: 'sess-unit-2' });
    await postInstrumentError(pre, new Error('boom'));

    const raw = await fs.readFile(METRICS, 'utf8');
    const arr = JSON.parse(raw);
    expect(arr.length).toBe(1);
    const rec = arr[0];
    expect(rec.outcome).toBe('error');
    expect(typeof rec.errorSummary).toBe('string');
    expect(rec.opType).toBe('diagnostic');
  });
});
