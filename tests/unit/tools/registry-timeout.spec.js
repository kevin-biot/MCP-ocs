const { describe, it, expect, beforeAll } = require('@jest/globals');
// Pull registry from compiled JS via dynamic import to avoid ESM/CJS interop issues
let UnifiedToolRegistry;
beforeAll(async () => {
  const m = await import('../../../dist/src/lib/tools/tool-registry.js');
  UnifiedToolRegistry = m.UnifiedToolRegistry;
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('UnifiedToolRegistry timeouts and error payloads', () => {
  it('returns standardized TimeoutError payload when tool exceeds timeout', async () => {
    const registry = new UnifiedToolRegistry();
    registry.registerTool({
      name: 'unit_slow',
      fullName: 'unit_slow',
      description: 'slow tool',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        await delay(50);
        return JSON.stringify({ ok: true });
      },
      category: 'workflow',
      version: 'v1',
    });

    const res = await registry.executeTool('unit_slow', { timeoutMs: 10 });
    const obj = JSON.parse(res);
    expect(obj.success).toBe(false);
    expect(obj.error && obj.error.type).toBe('TimeoutError');
    expect(obj.tool).toBe('unit_slow');
  });

  it('returns normal string result when within timeout', async () => {
    const registry = new UnifiedToolRegistry();
    registry.registerTool({
      name: 'unit_fast',
      fullName: 'unit_fast',
      description: 'fast tool',
      inputSchema: { type: 'object', properties: {} },
      async execute() {
        await delay(5);
        return JSON.stringify({ ok: true });
      },
      category: 'workflow',
      version: 'v1',
    });

    const res = await registry.executeTool('unit_fast', { timeoutMs: 200 });
    const obj = JSON.parse(res);
    expect(obj.ok).toBe(true);
  });
});
