import { jest } from '@jest/globals';

let capturedArgs: any[] = [];

// Mock src dependencies to satisfy relative .js imports via moduleNameMapper
jest.mock('../../../src/lib/tools/tool-memory-gateway', () => ({
  ToolMemoryGateway: class {
    constructor(public base: string) {}
    async storeToolExecution(toolId: string, argsSummary: any, resultSummary: string) {
      capturedArgs = [toolId, argsSummary, resultSummary];
      return true;
    }
  }
}));

jest.mock('../../../src/lib/memory/utils/tag-enforcer', () => ({
  tagEnforcer: (tags: string[], extra: Record<string, string>) => [...tags, ...Object.entries(extra).map(([k,v]) => `${k}:${v}`)]
}));

import { writeVectorToolExec } from '../../../src/lib/tools/vector-writer';

describe('vector-writer', () => {
  beforeEach(() => {
    capturedArgs = [];
    delete process.env.MCP_OCS_FORCE_JSON;
    process.env.ENABLE_VECTOR_WRITES = 'true';
  });

  it('short-circuits when vector writes disabled', async () => {
    process.env.ENABLE_VECTOR_WRITES = 'false';
    const ok = await writeVectorToolExec({ toolId: 't', argsSummary: {}, resultSummary: '{}', sessionId: 's' });
    expect(ok).toBe(false);
  });

  it('respects MCP_OCS_FORCE_JSON flag', async () => {
    process.env.MCP_OCS_FORCE_JSON = 'true';
    const ok = await writeVectorToolExec({ toolId: 't', argsSummary: {}, resultSummary: '{}', sessionId: 's' });
    expect(ok).toBe(false);
  });

  it('invokes gateway with trimmed result payload', async () => {
    const long = 'x'.repeat(3000);
    const ok = await writeVectorToolExec({ toolId: 't', argsSummary: { a: 1 }, resultSummary: long, sessionId: 's', extraTags: ['foo'] });
    expect(ok).toBe(true);
    expect(capturedArgs.length).toBeGreaterThanOrEqual(3);
    const trimmed = capturedArgs[2] as string;
    expect(trimmed.length).toBeLessThanOrEqual(1501); // 1500 + ellipsis
  });

  it('handles gateway errors gracefully', async () => {
    // Override mock to throw once
    const mod = await import('../../../src/lib/tools/tool-memory-gateway');
    const orig = mod.ToolMemoryGateway.prototype.storeToolExecution.bind(mod.ToolMemoryGateway.prototype);
    mod.ToolMemoryGateway.prototype.storeToolExecution = async () => { throw new Error('fail'); };
    const ok = await writeVectorToolExec({ toolId: 't', argsSummary: {}, resultSummary: '{}', sessionId: 's' });
    expect(ok).toBe(false);
    // restore
    mod.ToolMemoryGateway.prototype.storeToolExecution = orig;
  });
});
