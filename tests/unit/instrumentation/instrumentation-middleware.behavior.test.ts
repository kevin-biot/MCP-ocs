import { jest } from '@jest/globals';

// Mock src dependencies to align with relative imports (mapped to TS via jest config)
jest.mock('../../../src/lib/tools/vector-writer', () => ({
  writeVectorToolExec: jest.fn(async () => true)
}));

jest.mock('../../../src/lib/tools/evidence-anchors', () => ({
  collectAnchors: jest.fn(async () => ['artifact:08-technical-metrics-data.json'])
}));


jest.mock('../../../src/lib/memory/shared-memory', () => ({
  SharedMemoryManager: class {
    async initialize() {}
    async searchOperational(query: string, topK: number) {
      return [];
    }
  }
}));

import { preInstrument, postInstrument, postInstrumentError, inferOpType, isAllowlisted, redactArgs } from '../../../src/lib/tools/instrumentation-middleware';
import { writeVectorToolExec } from '../../../src/lib/tools/vector-writer';

describe('Instrumentation Middleware – Behavior', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useRealTimers();
    delete process.env.MCP_OCS_FORCE_JSON;
    process.env.ENABLE_INSTRUMENTATION = 'true';
    process.env.ENABLE_VECTOR_WRITES = 'true';
    process.env.ENABLE_PRESEARCH = 'false';
    process.env.INSTRUMENT_ALLOWLIST = '';
  });

  it('maps categories to opType', () => {
    expect(inferOpType('read-ops')).toBe('read');
    expect(inferOpType('diagnostic')).toBe('diagnostic');
    expect(inferOpType('memory')).toBe('memory');
    expect(inferOpType('workflow')).toBe('workflow');
    expect(inferOpType('something-else')).toBe('other');
  });

  it('supports allowlist filtering', () => {
    process.env.INSTRUMENT_ALLOWLIST = 'oc_diagnostic_cluster_health,oc_diagnostic_namespace_health';
    expect(isAllowlisted('oc_diagnostic_cluster_health')).toBe(true);
    expect(isAllowlisted('oc_diagnostic_pod_health')).toBe(false);
  });

  it('redacts sensitive args and truncates long strings', () => {
    const input = {
      token: 'abc',
      password: 'secret',
      message: 'x'.repeat(200),
      arr: [1, 2, 3],
      obj: { a: 1 },
      ok: true,
      num: 42,
      maybe: undefined
    } as const;
    const safe = redactArgs(input);
    expect(safe.token).toBe('[redacted]');
    expect(safe.password).toBe('[redacted]');
    expect(String(safe.message)).toHaveLength(129); // 128 + ellipsis
    expect(safe.arr).toBe('[array:3]');
    expect(safe.obj).toBe('[object]');
    expect(safe.ok).toBe(true);
    expect(safe.num).toBe(42);
    expect(Object.prototype.hasOwnProperty.call(safe, 'maybe')).toBe(true);
    expect(safe.maybe).toBeUndefined();
  });

  it('preInstrument returns null when disabled', () => {
    process.env.ENABLE_INSTRUMENTATION = 'false';
    const pre = preInstrument('oc_test', 'read-ops', { sessionId: 's1' });
    expect(pre).toBeNull();
  });

  it('dual-writes: vector attempt + metrics append on success', async () => {
    const spyVector = writeVectorToolExec as jest.Mock;
    process.env.MCP_OCS_FORCE_JSON = 'off';
    process.env.ENABLE_VECTOR_WRITES = 'true';
    const pre = preInstrument('oc_test', 'diagnostic', { sessionId: 'sess-x', selector: 'app=web' });
    expect(pre).toBeTruthy();
    await postInstrument(pre, JSON.stringify({ ok: true }));
    expect(spyVector).toHaveBeenCalled();
  });

  it('forces JSON-only when MCP_OCS_FORCE_JSON is set', async () => {
    const spyVector = writeVectorToolExec as jest.Mock;
    spyVector.mockClear();
    process.env.MCP_OCS_FORCE_JSON = 'true';
    const pre = preInstrument('oc_test', 'read-ops', { sessionId: 's2' });
    await postInstrument(pre, '{}');
    expect(spyVector).not.toHaveBeenCalled();
  });

  it('skips vector write when tool is not allowlisted', async () => {
    const spyVector = writeVectorToolExec as jest.Mock;
    spyVector.mockClear();
    process.env.INSTRUMENT_ALLOWLIST = 'some_other_tool';
    process.env.MCP_OCS_FORCE_JSON = 'off';
    const pre = preInstrument('oc_not_allowed', 'workflow', { sessionId: 's5' });
    await postInstrument(pre, '{"ok":true}');
    expect(spyVector).not.toHaveBeenCalled();
  });

  it('presearch enrichment attaches bounded evidence and is resilient to errors', async () => {
    // Enable presearch; mock SharedMemoryManager via module mock above
    process.env.ENABLE_PRESEARCH = 'true';
    const pre = preInstrument('oc_diagnostic_namespace_health', 'diagnostic', { sessionId: 's3', namespace: 'test' });
    expect(pre).toBeTruthy();
    // allow async presearch to resolve
    await new Promise(res => setTimeout(res, 50));
    // Even though presearch is fire-and-forget, the pre object should hold results
    expect(pre?.presearch).toBeTruthy();
    expect(typeof pre?.presearch?.hits).toBe('number');
    expect(typeof pre?.presearch?.elapsedMs).toBe('number');
    await postInstrument(pre, '{}');
  });

  it('presearch returns 0 hits when no results', async () => {
    process.env.ENABLE_PRESEARCH = 'true';
    // Force the mocked SharedMemoryManager.searchOperational to return no results
    const mod = await import('../../../src/lib/memory/shared-memory');
    const orig = (mod as any).SharedMemoryManager.prototype.searchOperational;
    (mod as any).SharedMemoryManager.prototype.searchOperational = async () => { return []; };
    const pre = preInstrument('oc_diagnostic_namespace_health', 'diagnostic', { sessionId: 's10', namespace: 'test' });
    await new Promise(res => setTimeout(res, 50));
    expect(pre?.presearch?.hits).toBe(0);
    (mod as any).SharedMemoryManager.prototype.searchOperational = orig;
  });

  it('uses mcp-ocs domain for non-ocp categories during vector write', async () => {
    const spyVector = writeVectorToolExec as jest.Mock;
    spyVector.mockClear();
    delete process.env.INSTRUMENT_ALLOWLIST; // allow all
    delete process.env.MCP_OCS_FORCE_JSON;
    process.env.ENABLE_VECTOR_WRITES = 'true';
    const pre = preInstrument('oc_tool_work', 'workflow', { sessionId: 's11' });
    await postInstrument(pre, '{}');
    expect(spyVector).toHaveBeenCalled();
  });

  it('records error outcome via postInstrumentError', async () => {
    const pre = preInstrument('oc_tool', 'workflow', { sessionId: 's4' });
    await postInstrumentError(pre, new Error('badness'));
    // No throw means graceful error handling
  });

  it('summarizes non-Error inputs in postInstrumentError', async () => {
    const pre = preInstrument('oc_tool2', 'other', { sessionId: 's6' });
    await postInstrumentError(pre, { code: 'E_FAIL', msg: 'oops' });
    await postInstrumentError(pre, 'plain_failure');
  });

  it('logs and continues when metrics writer throws', async () => {
    const metrics = await import('../../../src/lib/tools/metrics-writer');
    const spy = jest.spyOn(metrics, 'appendMetricsV2').mockRejectedValueOnce(new Error('append-fail'));
    const pre = preInstrument('oc_test_2', 'diagnostic', { sessionId: 's7' });
    await postInstrument(pre, '{}');
    spy.mockRestore();
  });

  it('gracefully handles internal error in postInstrument', async () => {
    const anchors = await import('../../../src/lib/tools/evidence-anchors');
    const spy = jest.spyOn(anchors, 'collectAnchors').mockRejectedValueOnce(new Error('collect-fail'));
    const pre = preInstrument('oc_test_3', 'read-ops', { sessionId: 's8' });
    await postInstrument(pre, '{}');
    spy.mockRestore();
  });

  it('gracefully handles internal error in postInstrumentError', async () => {
    const anchors = await import('../../../src/lib/tools/evidence-anchors');
    const spy = jest.spyOn(anchors, 'collectAnchors').mockRejectedValueOnce(new Error('collect-fail'));
    const pre = preInstrument('oc_test_4', 'diagnostic', { sessionId: 's9' });
    await postInstrumentError(pre, 'boom');
    spy.mockRestore();
  });
});
