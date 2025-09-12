import { jest } from '@jest/globals';

// Mock side-effect writers used by instrumentation
jest.mock('../../../src/lib/tools/metrics-writer', () => ({
  appendMetricsV2: jest.fn(async () => undefined),
  metricsVectorIdentifiers: () => ({ tenant: 't', database: 'd', collection: 'c' })
}));
jest.mock('../../../src/lib/tools/vector-writer', () => ({
  writeVectorToolExec: jest.fn(async () => true)
}));
jest.mock('../../../src/lib/tools/evidence-anchors', () => ({
  collectAnchors: jest.fn(async () => ['artifact:08-technical-metrics-data.json'])
}));

import { UnifiedToolRegistry, type StandardTool } from '../../../src/lib/tools/tool-registry';
import * as instrumentation from '../../../src/lib/tools/instrumentation-middleware';
import { collectAnchors } from '../../../src/lib/tools/evidence-anchors';

describe('Registry Integration – instrumentation hooks at boundary (Phase 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENABLE_INSTRUMENTATION = 'true';
    process.env.ENABLE_VECTOR_WRITES = 'false'; // keep vector off here; we validate post path only
    delete process.env.MCP_OCS_FORCE_JSON;
  });

  function makeTool(fullName: string, category: StandardTool['category'], ok = true): StandardTool {
    return {
      name: fullName, // internal name can equal fullName for this test
      fullName,
      description: 'test tool',
      inputSchema: { type: 'object', properties: { sessionId: { type: 'string' } } },
      execute: async () => {
        if (!ok) throw new Error('boom');
        return JSON.stringify({ ok: true, tool: fullName });
      },
      category,
      version: 'v2'
    };
  }

  it('calls pre/post hooks for diagnostic and read-ops tools; error path triggers postInstrumentError', async () => {
    const spyPre = jest.spyOn(instrumentation, 'preInstrument');
    const spyPost = jest.spyOn(instrumentation, 'postInstrument');
    const spyPostErr = jest.spyOn(instrumentation, 'postInstrumentError');
    const anchorsSpy = jest.spyOn({ collectAnchors }, 'collectAnchors');

    const registry = new UnifiedToolRegistry();

    // Approved diagnostic tools
    const diagTools = [
      'oc_diagnostic_cluster_health',
      'oc_diagnostic_namespace_health',
      'oc_diagnostic_pod_health'
    ].map(n => makeTool(n, 'diagnostic'));
    const diagError = makeTool('oc_diagnostic_rca_checklist', 'diagnostic', false);

    // Approved read-ops tools
    const readTools = [
      'oc_read_get_pods',
      'oc_read_logs',
      'oc_read_describe'
    ].map(n => makeTool(n, 'read-ops'));

    [...diagTools, diagError, ...readTools].forEach(t => registry.registerTool(t));

    // Execute all tools via registry by fullName
    for (const t of diagTools) {
      const out = await registry.executeTool(t.fullName, { sessionId: 'sess-diag' });
      expect(typeof out).toBe('string');
    }
    for (const t of readTools) {
      const out = await registry.executeTool(t.fullName, { sessionId: 'sess-read' });
      expect(typeof out).toBe('string');
    }
    const errOut = await registry.executeTool(diagError.fullName, { sessionId: 'sess-err' });
    const errJson = JSON.parse(errOut);
    expect(errJson.success).toBe(false);

    // Verify hooks
    const totalExec = diagTools.length + readTools.length + 1; // +1 for error tool
    expect(spyPre).toHaveBeenCalledTimes(totalExec);
    expect(spyPost).toHaveBeenCalledTimes(diagTools.length + readTools.length);
    expect(spyPostErr).toHaveBeenCalledTimes(1);

    // Evidence anchors collected in post paths
    expect(anchorsSpy).toHaveBeenCalled();
  });
});

