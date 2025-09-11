import { getGlobalToolRegistry } from '../dist/src/lib/tools/tool-registry.js';

// Enforce stderr-only by overriding console.log
console.log = () => {};

const registry = getGlobalToolRegistry();

const tool = {
  name: 'quick_check_tool',
  fullName: 'quick_check_tool',
  description: 'Quick instrumentation check tool',
  inputSchema: { type: 'object' },
  category: 'read-ops',
  version: 'v2',
  execute: async (args) => {
    return JSON.stringify({ ok: true, args });
  }
};

registry.registerTool(tool);

process.env.ENABLE_INSTRUMENTATION = process.env.ENABLE_INSTRUMENTATION ?? 'true';
process.env.ENABLE_VECTOR_WRITES = 'false';
await registry.executeTool('quick_check_tool', { sessionId: 'qc-iso-1' });

