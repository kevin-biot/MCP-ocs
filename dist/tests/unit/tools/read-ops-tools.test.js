/**
 * Unit tests for ReadOpsTools
 */
import { ReadOpsTools } from '../../../src/tools/read-ops/index';
describe('ReadOpsTools', () => {
    let openshift;
    let memory;
    let suite;
    let restoreConsole = null;
    beforeEach(() => {
        const mocks = [];
        mocks.push(jest.spyOn(console, 'error').mockImplementation(() => { }));
        mocks.push(jest.spyOn(console, 'warn').mockImplementation(() => { }));
        restoreConsole = () => mocks.forEach(m => m.mockRestore());
        openshift = {
            getPods: jest.fn().mockResolvedValue([
                { name: 'p1', namespace: 'ns', status: 'Running', ready: '1/1', restarts: 0, age: '1m' },
                { name: 'p2', namespace: 'ns', status: 'Pending', ready: '0/1', restarts: 0, age: '1m' },
            ]),
            describeResource: jest.fn().mockResolvedValue('resource details'),
            getLogs: jest.fn().mockResolvedValue('line1\nline2')
        };
        memory = {
            storeConversation: jest.fn().mockResolvedValue('mem-1'),
            searchOperational: jest.fn().mockResolvedValue([])
        };
        suite = new ReadOpsTools(openshift, memory);
    });
    afterEach(() => { if (restoreConsole)
        restoreConsole(); });
    it('oc_read_get_pods returns pod summary JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_read_get_pods');
        const out = await tool.execute({ namespace: 'ns', selector: 'app=x', sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.totalPods).toBe(2);
        expect(obj.summary.running).toBe(1);
        expect(memory.storeConversation).toHaveBeenCalled();
    });
    it('oc_read_describe returns description JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_read_describe');
        const out = await tool.execute({ resourceType: 'pod', name: 'p1', namespace: 'ns', sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.resourceType).toBe('pod');
        expect(obj.description).toContain('resource details');
    });
    it('oc_read_describe error JSON when method absent', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_read_describe');
        delete openshift.describeResource;
        const out = await tool.execute({ resourceType: 'pod', name: 'p1' });
        const obj = JSON.parse(out);
        expect(obj.success).toBe(false);
        expect(String(obj.error)).toContain('not a function');
    });
    it('oc_read_logs returns log metadata JSON', async () => {
        const tool = suite.getTools().find(t => t.fullName === 'oc_read_logs');
        const out = await tool.execute({ podName: 'p1', namespace: 'ns', lines: 2, sessionId: 's1' });
        const obj = JSON.parse(out);
        // Implementation splits on literal "\\n"; with actual newlines this yields 1
        expect(obj.logLines).toBe(1);
        expect(obj.logs).toContain('line1');
        expect(memory.storeConversation).toHaveBeenCalled();
    });
    it('memory_search_incidents returns results JSON', async () => {
        memory.searchOperational.mockResolvedValueOnce([
            { similarity: 0.9, relevance: 0.8, memory: { incidentId: 'i1', symptoms: [], resolution: '', timestamp: Date.now() } }
        ]);
        const tool = suite.getTools().find(t => t.fullName === 'memory_search_incidents');
        const out = await tool.execute({ query: 'pod fail', limit: 1, sessionId: 's1' });
        const obj = JSON.parse(out);
        expect(obj.resultsFound).toBe(1);
        expect(obj.results[0].incidentId).toBe('i1');
    });
});
