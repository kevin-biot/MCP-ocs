/**
 * Unit tests for StateMgmtTools
 */
import { StateMgmtTools } from '../../../src/tools/state-mgmt/index';
describe('StateMgmtTools', () => {
    let memory;
    let workflow;
    let suite;
    let restoreConsole = null;
    beforeEach(() => {
        const mocks = [];
        mocks.push(jest.spyOn(console, 'error').mockImplementation(() => { }));
        mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => { }));
        restoreConsole = () => mocks.forEach(m => m.mockRestore());
        memory = {
            storeOperational: jest.fn().mockResolvedValue('op-1'),
            storeConversation: jest.fn().mockResolvedValue('mem-1'),
            getStats: jest.fn().mockResolvedValue({
                chromaAvailable: true,
                totalConversations: 2,
                totalOperational: 3,
                storageUsed: '2 MB',
                lastCleanup: 'now',
                namespace: 'test'
            }),
            searchOperational: jest.fn().mockResolvedValue([]),
            searchConversations: jest.fn().mockResolvedValue([]),
        };
        workflow = { getActiveStates: jest.fn(), getEnforcementLevel: jest.fn() };
        suite = new StateMgmtTools(memory, workflow);
    });
    afterEach(() => { if (restoreConsole)
        restoreConsole(); });
    it('memory_store_operational stores incident and returns success JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'memory_store_operational');
        const out = await tool.execute({ incidentId: 'i-1', symptoms: ['x'], environment: 'test', sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.status).toBe('success');
        expect(memory.storeOperational).toHaveBeenCalled();
    });
    it('memory_search_operational returns results JSON', async () => {
        memory.searchOperational.mockResolvedValueOnce([
            { similarity: 0.9, memory: { incidentId: 'i1', symptoms: [], rootCause: '', resolution: '', environment: 'dev', timestamp: Date.now() } }
        ]);
        const tool = suite.getTools().find(t => t.fullName === 'memory_search_operational');
        const out = await tool.execute({ query: 'incident', limit: 1, sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.resultsFound).toBe(1);
    });
    it('core_workflow_state returns a stub state JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'core_workflow_state');
        const out = await tool.execute({ sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.sessionId).toBe('s1');
        expect(obj.currentState).toBeDefined();
    });
    it('memory_get_stats returns stats JSON with optional details', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'memory_get_stats');
        const out = await tool.execute({ detailed: true });
        const obj = JSON.parse(out);
        expect(obj.totalOperational).toBe(3);
        expect(obj.details).toBeDefined();
    });
    it('memory_search_conversations returns results JSON', async () => {
        memory.searchConversations.mockResolvedValueOnce([
            { similarity: 0.8, relevance: 0.7, memory: { sessionId: 's2', domain: 'ops', userMessage: 'hi', assistantResponse: 'yo', timestamp: Date.now(), tags: [] } }
        ]);
        const tool = suite.getTools().find(t => t.fullName === 'memory_search_conversations');
        const out = await tool.execute({ query: 'kinds', limit: 1, sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.resultsFound).toBe(1);
    });
});
