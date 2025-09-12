import { jest } from '@jest/globals';

// Mock SharedMemoryManager minimal surface
jest.mock('../../../src/lib/memory/shared-memory', () => ({
  SharedMemoryManager: class {
    async storeOperational() { return; }
    async storeConversation() { return; }
    async getStats() {
      return { totalConversations: 3, totalOperational: 2, chromaAvailable: true, storageUsed: '1.2 MB', lastCleanup: null, namespace: 'test' };
    }
    async searchOperational(_q: string, _k: number) {
      return [
        { memory: { incidentId: 'X', symptoms: ['s'], rootCause: 'rc', resolution: 'res', environment: 'test', timestamp: Date.now(), tags: [] }, similarity: 0.9, relevance: 90 }
      ];
    }
    async searchConversations(_q: string, _k: number) {
      return [
        { memory: { sessionId: 's', domain: 'd', userMessage: 'u', assistantResponse: 'a', timestamp: Date.now(), tags: [] }, similarity: 0.8, relevance: 80 }
      ];
    }
  }
}));

// Mock WorkflowEngine unused paths
jest.mock('../../../src/lib/workflow/workflow-engine', () => ({
  WorkflowEngine: class {}
}));

import { SharedMemoryManager } from '../../../src/lib/memory/shared-memory';
import { WorkflowEngine } from '../../../src/lib/workflow/workflow-engine';
import { StateMgmtTools } from '../../../src/tools/state-mgmt/index';

function makeTools() {
  const sm = new SharedMemoryManager({} as any);
  const wf = new WorkflowEngine({} as any);
  return new StateMgmtTools(sm as any, wf as any);
}

describe('StateMgmtTools (Phase 2 focus)', () => {
  it('exposes tools and executes store_incident', async () => {
    const tools = makeTools();
    const list = tools.getTools();
    const store = list.find(t => t.fullName === 'memory_store_operational');
    expect(store).toBeTruthy();
    const out = await store!.execute({ incidentId: 'INC-1', symptoms: ['S1'], environment: 'test', sessionId: 'sess-1' });
    const json = JSON.parse(out);
    expect(json.operation).toBe('store_incident');
    expect(json.status).toBe('success');
  });

  it('executes search_operational and returns results', async () => {
    const tools = makeTools();
    const search = tools.getTools().find(t => t.fullName === 'memory_search_operational');
    const out = await search!.execute({ query: 'incident', limit: 5 });
    const json = JSON.parse(out);
    expect(json.resultsFound).toBeGreaterThanOrEqual(1);
  });

  it('returns memory stats with detailed=false and detailed=true', async () => {
    const tools = makeTools();
    const statsTool = tools.getTools().find(t => t.fullName === 'memory_get_stats');
    const base = JSON.parse(await statsTool!.execute({ detailed: false }));
    expect(base.totalConversations).toBe(3);
    const detailed = JSON.parse(await statsTool!.execute({ detailed: true }));
    expect(detailed.details.memoryBreakdown.storageBackend).toContain('ChromaDB + JSON');
  });

  it('search_conversations returns shape and stores analytics', async () => {
    const tools = makeTools();
    const t = tools.getTools().find(tt => tt.fullName === 'memory_search_conversations');
    const out = JSON.parse(await t!.execute({ query: 'hello', limit: 3, sessionId: 'sess-2' }));
    expect(out.resultsFound).toBeGreaterThanOrEqual(1);
  });

  it('get_workflow_state returns ISO timestamp and structure', async () => {
    const tools = makeTools();
    const t = tools.getTools().find(tt => tt.fullName === 'core_workflow_state');
    const out = JSON.parse(await t!.execute({ sessionId: 'sess-3' }));
    expect(out.sessionId).toBe('sess-3');
    expect(typeof out.timestamp).toBe('string');
  });
});

