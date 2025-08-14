/**
 * Unit tests for KnowledgeSeedingTool + suite
 */
jest.mock('../../../src/lib/memory/knowledge-seeding-system', () => ({
    KnowledgeSeedingSystem: class {
    },
    KnowledgeSourceClass: { ENGINEER_ADDED: 'engineer_added' }
}));
import { KnowledgeSeedingTool, KnowledgeToolsSuite } from '../../../src/tools/memory/knowledge-seeding-tool-v2';
describe('KnowledgeSeedingTool', () => {
    let system;
    let tool;
    let suite;
    beforeEach(() => {
        system = {
            quickSeed: jest.fn().mockResolvedValue('mem-q1'),
            seedKnowledge: jest.fn().mockResolvedValue('mem-s1'),
            searchKnowledge: jest.fn().mockResolvedValue([
                { sessionId: 'm1', assistantResponse: 'content...', timestamp: Date.now(), distance: 0.2 }
            ]),
            getKnowledgeStats: jest.fn().mockResolvedValue({ engineer_added: 2, external: 1 })
        };
        tool = new KnowledgeSeedingTool(system);
        suite = new KnowledgeToolsSuite(tool);
    });
    it('quick_seed works', async () => {
        const out = await tool.execute({ operation: 'quick_seed', templateType: 'PATTERN_DISCOVERY', templateArgs: ['A', 'B', 'C'] });
        const obj = JSON.parse(out);
        expect(obj.success).toBe(true);
        expect(system.quickSeed).toHaveBeenCalled();
    });
    it('seed works', async () => {
        const out = await tool.execute({ operation: 'seed', title: 'T', content: 'C' });
        const obj = JSON.parse(out);
        expect(obj.success).toBe(true);
        expect(system.seedKnowledge).toHaveBeenCalled();
    });
    it('search works', async () => {
        const out = await tool.execute({ operation: 'search', searchQuery: 'nginx' });
        const obj = JSON.parse(out);
        expect(obj.resultCount).toBe(1);
    });
    it('stats works', async () => {
        const out = await tool.execute({ operation: 'stats' });
        const obj = JSON.parse(out);
        expect(obj.bySourceClass.engineer_added).toBe(2);
    });
    it('suite exposes tool and executes via wrapper', async () => {
        const t = suite.getTools()[0];
        const out = await t.execute({ title: 'X', content: 'Y', operation: 'seed' });
        const obj = JSON.parse(out);
        expect(obj.success).toBe(true);
    });
});
