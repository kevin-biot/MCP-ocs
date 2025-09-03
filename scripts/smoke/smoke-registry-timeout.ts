#!/usr/bin/env tsx
// Simple smoke to exercise a tool with and without timeoutMs
import { UnifiedToolRegistry } from '../../src/lib/tools/tool-registry.js';

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function main() {
  const registry = new UnifiedToolRegistry();
  registry.registerTool({
    name: 'smoke_tool',
    fullName: 'smoke_tool',
    description: 'smoke test tool',
    inputSchema: { type: 'object', properties: {} },
    async execute(args: any) {
      const wait = Number(args?.waitMs ?? 50);
      await delay(wait);
      return JSON.stringify({ ok: true, waited: wait });
    },
    category: 'workflow',
    version: 'v1',
  });

  // With short timeout (expect standardized error JSON)
  const short = await registry.executeTool('smoke_tool', { waitMs: 100, timeoutMs: 10 });
  console.log('Short-timeout result:', short);

  // With generous timeout (expect normal result)
  const long = await registry.executeTool('smoke_tool', { waitMs: 20, timeoutMs: 200 });
  console.log('Long-timeout result:', long);
}

main().catch(err => {
  console.error('Smoke failed:', err);
  process.exit(1);
});

