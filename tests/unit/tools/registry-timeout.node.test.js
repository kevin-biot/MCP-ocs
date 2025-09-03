import test from 'node:test';
import assert from 'node:assert/strict';

import { UnifiedToolRegistry } from '../../../dist/src/lib/tools/tool-registry.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

test('registry returns standardized TimeoutError payload when tool exceeds timeout', async () => {
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
  assert.equal(obj.success, false);
  assert.equal(obj.tool, 'unit_slow');
  assert.equal(obj.error.type, 'TimeoutError');
});

test('registry returns normal string result when within timeout', async () => {
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
  assert.equal(obj.ok, true);
});

