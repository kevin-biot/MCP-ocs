import { getGlobalToolRegistry, type StandardTool } from '../src/lib/tools/tool-registry.js';
import { setupStrictStdio } from '../src/utils/strict-stdio.js';

// Enforce protocol safety for this quick check
setupStrictStdio(true);

const registry = getGlobalToolRegistry();

const testTool: StandardTool = {
  name: 'quick_check_tool',
  fullName: 'quick_check_tool',
  description: 'Quick instrumentation check tool',
  inputSchema: { type: 'object', properties: { sessionId: { type: 'string' }, payload: { type: 'string' } } },
  category: 'read-ops',
  version: 'v2',
  execute: async (args: any) => {
    // Return a small JSON string
    const payload = typeof args?.payload === 'string' ? args.payload : 'ok';
    return JSON.stringify({ ok: true, payload });
  }
};

registry.registerTool(testTool);

// Execute once to trigger middleware; avoid stdout
await registry.executeTool('quick_check_tool', { sessionId: 'qc-1', payload: 'hello' });

